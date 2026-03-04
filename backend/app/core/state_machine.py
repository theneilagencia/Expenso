from enum import Enum
from fastapi import HTTPException


class RequestStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_AI = "PENDING_AI"
    PENDING_MANAGER = "PENDING_MANAGER"
    IN_CORRECTION = "IN_CORRECTION"
    PENDING_FINANCE = "PENDING_FINANCE"
    IN_PAYMENT = "IN_PAYMENT"
    PAID = "PAID"
    REJECTED_AI = "REJECTED_AI"
    REJECTED_MANAGER = "REJECTED_MANAGER"
    REJECTED_FINANCE = "REJECTED_FINANCE"
    CANCELLED = "CANCELLED"


class RequestAction(str, Enum):
    SUBMIT = "submit"
    AI_APPROVED = "ai_approved"
    AI_REVIEW = "ai_review"
    AI_BLOCKED = "ai_blocked"
    APPROVE = "approve"
    REJECT = "reject"
    REQUEST_EDIT = "request_edit"
    RESUBMIT = "resubmit"
    CONFIRM_PAYMENT = "confirm_payment"
    CANCEL = "cancel"


TRANSITIONS = {
    (RequestStatus.DRAFT, RequestAction.SUBMIT): RequestStatus.PENDING_AI,
    (RequestStatus.DRAFT, RequestAction.CANCEL): RequestStatus.CANCELLED,
    (RequestStatus.PENDING_AI, RequestAction.AI_APPROVED): RequestStatus.PENDING_MANAGER,
    (RequestStatus.PENDING_AI, RequestAction.AI_REVIEW): RequestStatus.PENDING_MANAGER,
    (RequestStatus.PENDING_AI, RequestAction.AI_BLOCKED): RequestStatus.REJECTED_AI,
    (RequestStatus.PENDING_MANAGER, RequestAction.APPROVE): RequestStatus.PENDING_FINANCE,
    (RequestStatus.PENDING_MANAGER, RequestAction.REJECT): RequestStatus.REJECTED_MANAGER,
    (RequestStatus.PENDING_MANAGER, RequestAction.REQUEST_EDIT): RequestStatus.IN_CORRECTION,
    (RequestStatus.PENDING_FINANCE, RequestAction.APPROVE): RequestStatus.IN_PAYMENT,
    (RequestStatus.PENDING_FINANCE, RequestAction.REJECT): RequestStatus.REJECTED_FINANCE,
    (RequestStatus.PENDING_FINANCE, RequestAction.REQUEST_EDIT): RequestStatus.IN_CORRECTION,
    (RequestStatus.IN_CORRECTION, RequestAction.RESUBMIT): RequestStatus.PENDING_AI,
    (RequestStatus.IN_PAYMENT, RequestAction.CONFIRM_PAYMENT): RequestStatus.PAID,
}


def transition(current_status: str, action: str) -> str:
    key = (RequestStatus(current_status), RequestAction(action))
    new_status = TRANSITIONS.get(key)
    if new_status is None:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_TRANSITION",
                "message": f"Cannot perform '{action}' on status '{current_status}'",
            },
        )
    return new_status.value
