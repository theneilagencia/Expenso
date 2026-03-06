"""Revolut Business API HTTP client with JWT RS256 authentication."""

import logging
import time
import uuid

import httpx
from jose import jwt

logger = logging.getLogger(__name__)


class RevolutAPIError(Exception):
    """Error returned by the Revolut Business API."""

    def __init__(self, status_code: int, detail: str, raw: dict | None = None):
        self.status_code = status_code
        self.detail = detail
        self.raw = raw or {}
        super().__init__(f"Revolut API {status_code}: {detail}")


class RevolutClient:
    """HTTP client for Revolut Business API v1.0.

    Authenticates via JWT Bearer token signed with RS256.
    """

    def __init__(self, base_url: str, client_id: str, private_key: str):
        self._base_url = base_url.rstrip("/")
        self._client_id = client_id
        self._private_key = private_key
        self._timeout = 30.0

    def _build_jwt(self) -> str:
        """Build a short-lived JWT for Revolut API auth (RS256, 30s expiry)."""
        now = int(time.time())
        payload = {
            "iss": self._client_id,
            "sub": self._client_id,
            "aud": "https://revolut.com",
            "iat": now,
            "exp": now + 30,
            "jti": uuid.uuid4().hex,
        }
        return jwt.encode(payload, self._private_key, algorithm="RS256")

    def _headers(self) -> dict:
        token = self._build_jwt()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def _handle_response(self, resp: httpx.Response) -> dict:
        if resp.status_code >= 400:
            detail = resp.text[:500]
            try:
                body = resp.json()
                detail = body.get("message", detail)
            except Exception:
                pass
            raise RevolutAPIError(resp.status_code, detail, raw={"body": resp.text})
        return resp.json()

    def create_payment(
        self,
        counterparty_id: str,
        amount: float,
        currency: str,
        reference: str,
    ) -> dict:
        """POST /pay — create a payment to a counterparty."""
        url = f"{self._base_url}/pay"
        body = {
            "request_id": uuid.uuid4().hex,
            "account_id": counterparty_id,
            "receiver": {"counterparty_id": counterparty_id},
            "amount": amount,
            "currency": currency,
            "reference": reference,
        }
        logger.info("Revolut create_payment: %s %s %s", currency, amount, reference)
        with httpx.Client(timeout=self._timeout) as client:
            resp = client.post(url, json=body, headers=self._headers())
        return self._handle_response(resp)

    def get_transaction(self, transaction_id: str) -> dict:
        """GET /transaction/{id} — retrieve transaction status."""
        url = f"{self._base_url}/transaction/{transaction_id}"
        logger.info("Revolut get_transaction: %s", transaction_id)
        with httpx.Client(timeout=self._timeout) as client:
            resp = client.get(url, headers=self._headers())
        return self._handle_response(resp)

    def cancel_transaction(self, transaction_id: str) -> dict:
        """DELETE /transaction/{id} — cancel a pending transaction."""
        url = f"{self._base_url}/transaction/{transaction_id}"
        logger.info("Revolut cancel_transaction: %s", transaction_id)
        with httpx.Client(timeout=self._timeout) as client:
            resp = client.delete(url, headers=self._headers())
        return self._handle_response(resp)

    def get_accounts(self) -> list:
        """GET /accounts — list business accounts."""
        url = f"{self._base_url}/accounts"
        logger.info("Revolut get_accounts")
        with httpx.Client(timeout=self._timeout) as client:
            resp = client.get(url, headers=self._headers())
        return self._handle_response(resp)
