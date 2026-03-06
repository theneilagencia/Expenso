"""Tests for enriched health endpoint — dependency checks, version, timestamp."""

from datetime import datetime


class TestHealthEnriched:
    """Verify the enriched /health endpoint returns structured dependency checks."""

    def test_health_has_checks_object(self, client):
        """Health response includes a checks object."""
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "checks" in data
        assert isinstance(data["checks"], dict)

    def test_health_checks_has_database_key(self, client):
        """Health checks include a database entry with status."""
        resp = client.get("/health")
        data = resp.json()
        assert "database" in data["checks"]
        assert "status" in data["checks"]["database"]

    def test_health_checks_has_redis_key(self, client):
        """Health checks include a redis entry with status."""
        resp = client.get("/health")
        data = resp.json()
        assert "redis" in data["checks"]
        assert "status" in data["checks"]["redis"]

    def test_health_checks_has_minio_key(self, client):
        """Health checks include a minio entry with status."""
        resp = client.get("/health")
        data = resp.json()
        assert "minio" in data["checks"]
        assert "status" in data["checks"]["minio"]

    def test_health_checks_has_celery_key(self, client):
        """Health checks include a celery entry with status."""
        resp = client.get("/health")
        data = resp.json()
        assert "celery" in data["checks"]
        assert "status" in data["checks"]["celery"]

    def test_health_returns_version(self, client):
        """Health response includes a version string."""
        resp = client.get("/health")
        data = resp.json()
        assert "version" in data
        assert data["version"] == "1.0.0"

    def test_health_returns_timestamp(self, client):
        """Health response includes a valid ISO timestamp."""
        resp = client.get("/health")
        data = resp.json()
        assert "timestamp" in data
        # Verify it is a parseable ISO timestamp
        ts = data["timestamp"]
        parsed = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        assert parsed.year >= 2026

    def test_health_returns_service_name(self, client):
        """Health response includes the service name."""
        resp = client.get("/health")
        data = resp.json()
        assert data["service"] == "expenso-backend"

    def test_health_overall_status_is_valid(self, client):
        """Health overall status is one of healthy, degraded, unhealthy."""
        resp = client.get("/health")
        data = resp.json()
        assert data["status"] in ("healthy", "degraded", "unhealthy")

    def test_health_check_statuses_are_valid(self, client):
        """Each dependency check status is ok, error, or warning."""
        resp = client.get("/health")
        data = resp.json()
        valid_statuses = {"ok", "error", "warning"}
        for check_name, check_data in data["checks"].items():
            assert check_data["status"] in valid_statuses, (
                f"Check '{check_name}' has unexpected status: {check_data['status']}"
            )
