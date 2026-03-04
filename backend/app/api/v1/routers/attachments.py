import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import get_current_user
from app.dependencies import get_db
from app.models.attachment import Attachment
from app.models.expense_request import ExpenseRequest

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def get_minio_client():
    from minio import Minio
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=getattr(settings, "MINIO_SECURE", False),
    )


def ensure_bucket(client, bucket_name: str):
    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)


@router.post("/requests/{request_id}/attachments")
def upload_attachment(
    request_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    expense = db.query(ExpenseRequest).filter(
        ExpenseRequest.id == request_id,
        ExpenseRequest.deleted_at.is_(None),
    ).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if expense.employee_id != current_user.id and current_user.role not in ("ADMIN", "MANAGER"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed",
        )

    file_content = file.file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds maximum size of 10MB",
        )
    file.file.seek(0)

    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    file_key = f"attachments/{request_id}/{uuid.uuid4()}{file_ext}"

    bucket = getattr(settings, "MINIO_BUCKET", "expenso")

    try:
        client = get_minio_client()
        ensure_bucket(client, bucket)
        client.put_object(
            bucket,
            file_key,
            file.file,
            length=len(file_content),
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to upload file: {str(e)}",
        )

    attachment = Attachment(
        request_id=request_id,
        uploaded_by=current_user.id,
        file_name=file.filename or "unnamed",
        file_path=file_key,
        mime_type=file.content_type,
        size_bytes=len(file_content),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {
        "id": str(attachment.id),
        "request_id": str(attachment.request_id),
        "file_name": attachment.file_name,
        "mime_type": attachment.mime_type,
        "size_bytes": attachment.size_bytes,
        "created_at": attachment.created_at.isoformat(),
    }


@router.get("/requests/{request_id}/attachments")
def list_attachments(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    attachments = (
        db.query(Attachment)
        .filter(Attachment.request_id == request_id, Attachment.deleted_at.is_(None))
        .order_by(Attachment.created_at)
        .all()
    )

    return [
        {
            "id": str(a.id),
            "request_id": str(a.request_id),
            "file_name": a.file_name,
            "mime_type": a.mime_type,
            "size_bytes": a.size_bytes,
            "created_at": a.created_at.isoformat(),
        }
        for a in attachments
    ]


@router.delete("/requests/{request_id}/attachments/{attachment_id}")
def delete_attachment(
    request_id: uuid.UUID,
    attachment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    attachment = (
        db.query(Attachment)
        .filter(
            Attachment.id == attachment_id,
            Attachment.request_id == request_id,
            Attachment.deleted_at.is_(None),
        )
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    if attachment.uploaded_by != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    attachment.deleted_at = datetime.now(timezone.utc)
    db.commit()

    return {"detail": "Attachment deleted"}
