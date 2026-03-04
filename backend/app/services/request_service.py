import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError
from app.core.state_machine import transition, RequestAction
from app.models.expense_request import ExpenseRequest
from app.models.audit_log import AuditLog
from app.models.request_version import RequestVersion
from app.models.request_comment import RequestComment


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
        return req

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
