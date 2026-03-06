import hashlib
import hmac
import json
import logging

import httpx

logger = logging.getLogger(__name__)


class WebhookService:
    @staticmethod
    def dispatch_event(event_type: str, payload: dict, db) -> int:
        """Dispatch event to all active webhooks that listen for this event type."""
        from app.models.webhook_config import WebhookConfig

        configs = db.query(WebhookConfig).filter(
            WebhookConfig.is_active.is_(True),
            WebhookConfig.deleted_at.is_(None),
        ).all()

        dispatched = 0
        for config in configs:
            if event_type in (config.events or []):
                try:
                    WebhookService._send_webhook(config, event_type, payload)
                    dispatched += 1
                except Exception as e:
                    logger.error("Webhook dispatch failed for %s: %s", config.url, e)
        return dispatched

    @staticmethod
    def _send_webhook(config, event_type: str, payload: dict):
        body = json.dumps({"event": event_type, "data": payload}, default=str)
        headers = {"Content-Type": "application/json", "X-Webhook-Event": event_type}
        if config.secret:
            signature = hmac.new(
                config.secret.encode(), body.encode(), hashlib.sha256
            ).hexdigest()
            headers["X-Webhook-Signature"] = f"sha256={signature}"
        with httpx.Client(timeout=10) as client:
            client.post(config.url, content=body, headers=headers)
