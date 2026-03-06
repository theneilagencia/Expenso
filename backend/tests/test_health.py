from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded", "unhealthy")
    assert data["service"] == "expenso-backend"
    assert data["version"] == "1.0.0"
    assert "checks" in data
    assert "timestamp" in data
    assert "database" in data["checks"]
    assert "redis" in data["checks"]
    assert "minio" in data["checks"]
    assert "celery" in data["checks"]
