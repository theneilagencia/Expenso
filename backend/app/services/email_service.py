import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an email via SMTP. Returns True on success, False on failure.

    Non-blocking: never raises — email delivery is best-effort.
    If SMTP_HOST is empty, skips sending (dev mode).
    """
    if not settings.SMTP_HOST:
        logger.info(f"SMTP not configured, skipping email to {to}: {subject}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            if settings.SMTP_PORT == 587:
                server.starttls()
                server.ehlo()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False
