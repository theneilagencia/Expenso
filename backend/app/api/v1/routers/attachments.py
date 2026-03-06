import os
import re
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
MAX_FILES_PER_REQUEST = 10

# Executable extensions that are never allowed
BLOCKED_EXTENSIONS = {
    ".exe", ".sh", ".py", ".js", ".bat", ".cmd", ".ps1",
    ".msi", ".dll", ".so", ".com", ".scr", ".pif", ".vbs",
    ".wsf", ".jar", ".app", ".deb", ".rpm",
}


def secure_filename(filename: str) -> str:
    """Sanitize a filename — strip path separators, null bytes, special chars."""
    if not filename:
        return "unnamed"
    # Remove path separators and null bytes
    filename = filename.replace("/", "").replace("\\", "").replace("\x00", "")
    # Allow only alphanumeric, hyphens, underscores, dots, spaces
    filename = re.sub(r"[^\w\-. ]", "", filename)
    # Collapse multiple dots/spaces
    filename = re.sub(r"\.{2,}", ".", filename)
    filename = filename.strip(". ")
    return filename or "unnamed"


def validate_magic_bytes(content: bytes, declared_mime: str) -> str | None:
    """Validate file content via magic bytes. Returns detected MIME or None."""
    try:
        import magic

        detected = magic.from_buffer(content[:2048], mime=True)
        return detected
    except ImportError:
        # python-magic not installed — fall back to declared MIME
        return declared_mime
    except Exception:
        return None


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

    # Check max files per request
    existing_count = (
        db.query(Attachment)
        .filter(Attachment.request_id == request_id, Attachment.deleted_at.is_(None))
        .count()
    )
    if existing_count >= MAX_FILES_PER_REQUEST:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILES_PER_REQUEST} files per request",
        )

    # Sanitize filename
    safe_name = secure_filename(file.filename or "unnamed")

    # Check extension blocklist
    _, ext = os.path.splitext(safe_name)
    if ext.lower() in BLOCKED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension {ext} is not allowed",
        )

    # Read content and check size
    file_content = file.file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds maximum size of 10MB",
        )

    # Validate MIME type via magic bytes (content inspection)
    detected_mime = validate_magic_bytes(file_content, file.content_type)
    if not detected_mime or detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {detected_mime or 'unknown'} not allowed",
        )

    file.file.seek(0)

    file_ext = os.path.splitext(safe_name)[1] if safe_name != "unnamed" else ""
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
            content_type=detected_mime,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to upload file: {str(e)}",
        )

    attachment = Attachment(
        request_id=request_id,
        uploaded_by=current_user.id,
        file_name=safe_name,
        file_path=file_key,
        mime_type=detected_mime,
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
