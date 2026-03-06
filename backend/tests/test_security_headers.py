"""Tests for SecurityHeadersMiddleware — verifies security headers on responses."""


class TestSecurityHeaders:
    """Verify that SecurityHeadersMiddleware injects required headers."""

    def test_x_content_type_options_nosniff(self, client):
        """Every response must include X-Content-Type-Options: nosniff."""
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"

    def test_x_frame_options_deny(self, client):
        """Every response must include X-Frame-Options: DENY."""
        resp = client.get("/health")
        assert resp.headers.get("X-Frame-Options") == "DENY"

    def test_x_xss_protection(self, client):
        """Every response must include X-XSS-Protection: 1; mode=block."""
        resp = client.get("/health")
        assert resp.headers.get("X-XSS-Protection") == "1; mode=block"

    def test_referrer_policy(self, client):
        """Every response must include Referrer-Policy header."""
        resp = client.get("/health")
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"

    def test_permissions_policy(self, client):
        """Every response must include Permissions-Policy header."""
        resp = client.get("/health")
        policy = resp.headers.get("Permissions-Policy")
        assert policy is not None
        assert "camera=()" in policy
        assert "microphone=()" in policy
        assert "geolocation=()" in policy

    def test_security_headers_present_on_404(self, client):
        """Security headers are present even on 404 responses."""
        resp = client.get("/nonexistent-endpoint")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"
        assert resp.headers.get("X-XSS-Protection") == "1; mode=block"
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert resp.headers.get("Permissions-Policy") is not None

    def test_security_headers_present_on_authenticated_endpoint(self, client, admin_headers):
        """Security headers are present on authenticated API responses."""
        resp = client.get("/api/v1/users/me", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
