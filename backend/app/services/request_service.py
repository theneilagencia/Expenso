import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError, ValidationError
from app.core.state_machine import transition
from app.models.audit_log import AuditLog
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.models.notification import Notification
from app.models.request_comment import RequestComment
from app.models.request_version import RequestVersion
from app.models.user import User
from app.services.currency_service import convert_to_brl
from app.services.sla_service import SLAService

logger = logging.getLogger(__name__)


class RequestService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, employee_id: uuid.UUID, data: dict) -> ExpenseRequest:
        request = ExpenseRequest(
            id=uuid.uuid4(),
            employee_id=employee_id,
            status="DRAFT",
            **data,
        )
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request

    def get_by_id(self, request_id: uuid.UUID) -> ExpenseRequest:
        req = self.db.query(ExpenseRequest).filter(
            ExpenseRequest.id == request_id,
            ExpenseRequest.deleted_at.is_(None),
        ).first()
        if not req:
            raise NotFoundError("Expense request")
        return req

    def list_requests(
        self,
        user_id: uuid.UUID = None,
        role: str = None,
        status: str = None,
        page: int = 1,
        per_page: int = 20,
    ):
        query = self.db.query(ExpenseRequest).filter(ExpenseRequest.deleted_at.is_(None))

        if role == "EMPLOYEE" and user_id:
            query = query.filter(ExpenseRequest.employee_id == user_id)
        elif role == "MANAGER" and user_id:
            query = query.filter(ExpenseRequest.manager_id == user_id)

        if status:
            query = query.filter(ExpenseRequest.status == status)

        total = query.count()
        requests = query.order_by(ExpenseRequest.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        return requests, total

    def update(self, request_id: uuid.UUID, user_id: uuid.UUID, data: dict) -> ExpenseRequest:
        req = self.get_by_id(request_id)
        if req.employee_id != user_id:
            raise ForbiddenError("You can only edit your own requests")
        if req.status not in ("DRAFT", "IN_CORRECTION"):
            raise ValidationError("Request can only be edited in DRAFT or IN_CORRECTION status")

        for key, value in data.items():
            if value is not None:
                setattr(req, key, value)

        self.db.commit()
        self.db.refresh(req)
        return req

    def perform_action(
        self,
        request_id: uuid.UUID,
        action: str,
        actor_id: uuid.UUID,
        actor_role: str,
        justification: str = None,
        comment: str = None,
        ip_address: str = None,
        user_agent: str = None,
    ) -> ExpenseRequest:
        req = self.get_by_id(request_id)
        previous_status = req.status

        # Validate permissions
        self._validate_action_permission(req, action, actor_id, actor_role)

        # Validate justification requirements
        if action in ("reject",) and (not justification or len(justification) < 50):
            raise ValidationError("Rejection justification must be at least 50 characters")
        if action in ("request_edit",) and (not comment or len(comment) < 30):
            raise ValidationError("Correction comment must be at least 30 characters")

        # Submit-specific validations and enrichments
        if action == "submit":
            self._validate_and_enrich_submit(req)

        # Perform state transition
        new_status = transition(req.status, action)
        req.status = new_status

        if action == "submit":
            req.submitted_at = datetime.now(timezone.utc)

        # Save version snapshot
        self._save_version(req, actor_id, action)

        # Save audit log
        self._save_audit_log(req, previous_status, new_status, action, actor_id, actor_role, justification, ip_address, user_agent)

        # Save comment if provided
        if comment:
            comment_type = "CORRECTION_REQUEST" if action == "request_edit" else "REJECTION_REASON" if action == "reject" else "COMMENT"
            self._save_comment(req.id, actor_id, comment, comment_type)

        self.db.commit()
        self.db.refresh(req)

        # Post-commit: notifications and async tasks
        self._dispatch_notifications(req, action, actor_id)
        if action == "submit":
            self._dispatch_ai_task(req)

        return req

    def _validate_and_enrich_submit(self, req: ExpenseRequest):
        """Validate justification and enrich with currency/SLA on submit."""
        # 1. Validate justification per category
        min_chars = 20
        if req.category_id:
            category = self.db.query(ExpenseCategory).filter(
                ExpenseCategory.id == req.category_id
            ).first()
            if category and category.min_justification_chars:
                min_chars = category.min_justification_chars

        if not req.justification or len(req.justification.strip()) < min_chars:
            raise ValidationError(
                f"Justification must be at least {min_chars} characters"
            )

        # 2. Calculate amount_brl and exchange_rate
        currency = req.currency or "BRL"
        amount_brl, rate = convert_to_brl(req.amount, currency)
        req.amount_brl = amount_brl
        req.exchange_rate = rate

        # 3. Calculate SLA deadlines
        SLAService.set_deadlines_on_submit(req, self.db)

    def _dispatch_ai_task(self, req: ExpenseRequest):
        """Dispatch Celery AI analysis task. Non-blocking on failure."""
        try:
            from app.workers.tasks.ai_tasks import analyze_request
            analyze_request.delay(str(req.id))
        except Exception as e:
            logger.warning(f"Failed to dispatch AI task for request {req.id}: {e}")
            req.ai_skipped = True
            self.db.commit()

    def _dispatch_notifications(self, req: ExpenseRequest, action: str, actor_id: uuid.UUID):
        """Create in-app notifications and dispatch email tasks."""
        notify_user_id = None
        notif_type = None
        title = ""
        body = ""

        if action == "submit":
            # Notify the employee's manager
            employee = self.db.query(User).filter(User.id == req.employee_id).first()
            if employee and employee.manager_id:
                notify_user_id = employee.manager_id
                notif_type = "NEW_PENDING_APPROVAL"
                title = f"New request pending approval: {req.title}"
                body = "A new expense request requires your review."
        elif action in ("approve", "confirm_payment"):
            notify_user_id = req.employee_id
            notif_type = "REQUEST_APPROVED" if action == "approve" else "PAYMENT_CONFIRMED"
            title = f"Request {action.replace('_', ' ')}: {req.title}"
            body = f"Your expense request has been {action.replace('_', ' ')}."
        elif action == "reject":
            notify_user_id = req.employee_id
            notif_type = "REQUEST_REJECTED"
            title = f"Request rejected: {req.title}"
            body = "Your expense request has been rejected."
        elif action == "request_edit":
            notify_user_id = req.employee_id
            notif_type = "CORRECTION_REQUESTED"
            title = f"Correction requested: {req.title}"
            body = "Your expense request needs corrections."

        if notify_user_id and notif_type:
            self._create_notification(notify_user_id, req.id, notif_type, title, body)
            self._dispatch_email_task(notify_user_id, req.id, notif_type)

    def _create_notification(self, user_id, request_id, notif_type, title, body):
        notification = Notification(
            user_id=user_id,
            request_id=request_id,
            type=notif_type,
            title=title,
            body=body,
        )
        self.db.add(notification)
        self.db.commit()

    def _dispatch_email_task(self, user_id, request_id, event_type):
        """Dispatch async email notification. Non-blocking on failure."""
        try:
            from app.workers.tasks.email_tasks import send_notification_email
            send_notification_email.delay(str(user_id), str(request_id), event_type)
        except Exception as e:
            logger.warning(f"Failed to dispatch email task: {e}")

    def _validate_action_permission(self, req, action, actor_id, actor_role):
        if action in ("submit", "resubmit", "cancel"):
            if req.employee_id != actor_id:
                raise ForbiddenError("Only the request owner can perform this action")
        elif action in ("approve", "reject", "request_edit"):
            if req.status == "PENDING_MANAGER" and actor_role not in ("MANAGER", "ADMIN"):
                raise ForbiddenError("Only managers can act on pending manager requests")
            if req.status == "PENDING_FINANCE" and actor_role not in ("FINANCE", "ADMIN"):
                raise ForbiddenError("Only finance users can act on pending finance requests")

    def _save_version(self, req, actor_id, action):
        version = RequestVersion(
            id=uuid.uuid4(),
            request_id=req.id,
            version_number=req.current_version,
            snapshot={
                "title": req.title,
                "description": req.description,
                "justification": req.justification,
                "amount": req.amount,
                "vendor_name": req.vendor_name,
                "status": req.status,
            },
            changed_by=actor_id,
            change_reason=action,
        )
        req.current_version += 1
        self.db.add(version)

    def _save_audit_log(self, req, previous_status, new_status, action, actor_id, actor_role, justification, ip_address, user_agent):
        log = AuditLog(
            id=uuid.uuid4(),
            request_id=req.id,
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            previous_status=previous_status,
            new_status=new_status,
            justification=justification,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(log)

    def _save_comment(self, request_id, author_id, content, comment_type):
        comment = RequestComment(
            id=uuid.uuid4(),
            request_id=request_id,
            author_id=author_id,
            content=content,
            type=comment_type,
        )
        self.db.add(comment)
