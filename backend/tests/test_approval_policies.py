"""Tests for Admin CRUD on approval policies."""

import uuid


class TestListPolicies:
    def test_list_policies_empty(self, client, admin_headers):
        """GET returns empty list when no policies exist."""
        resp = client.get("/api/v1/admin/approval-policies", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_policies_with_data(self, client, admin_headers):
        """GET returns list of active policies."""
        # Create via API
        client.post("/api/v1/admin/approval-policies", json={
            "name": "Low Value",
            "min_amount": 0,
            "max_amount": 1000.0,
        }, headers=admin_headers)
        client.post("/api/v1/admin/approval-policies", json={
            "name": "High Value",
            "min_amount": 1000.0,
            "max_amount": 50000.0,
        }, headers=admin_headers)

        resp = client.get("/api/v1/admin/approval-policies", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_list_policies_excludes_deleted(self, client, admin_headers):
        """GET does not return soft-deleted policies."""
        # Create and then delete via API
        create_resp = client.post("/api/v1/admin/approval-policies", json={
            "name": "Deleted Policy",
        }, headers=admin_headers)
        assert create_resp.status_code == 201
        policy_id = create_resp.json()["id"]

        del_resp = client.delete(f"/api/v1/admin/approval-policies/{policy_id}", headers=admin_headers)
        assert del_resp.status_code == 200

        resp = client.get("/api/v1/admin/approval-policies", headers=admin_headers)
        assert resp.status_code == 200
        # Deleted policies should not appear in listing
        ids = [p["id"] for p in resp.json()]
        assert policy_id not in ids


class TestCreatePolicy:
    def test_create_policy(self, client, admin_headers):
        """POST creates a new approval policy."""
        resp = client.post("/api/v1/admin/approval-policies", json={
            "name": "Standard Approval",
            "min_amount": 0,
            "max_amount": 5000.0,
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert "id" in data
        assert data["name"] == "Standard Approval"

    def test_create_policy_with_flow(self, client, admin_headers):
        """POST creates a policy with approval_flow JSON."""
        resp = client.post("/api/v1/admin/approval-policies", json={
            "name": "Complex Approval",
            "min_amount": 5000.0,
            "max_amount": 50000.0,
            "approval_flow": {"steps": ["MANAGER", "FINANCE"]},
        }, headers=admin_headers)
        assert resp.status_code == 201

    def test_create_policy_requires_admin(self, client, employee_headers):
        """Non-admin user gets 403."""
        resp = client.post("/api/v1/admin/approval-policies", json={
            "name": "Test Policy",
            "min_amount": 0,
            "max_amount": 1000.0,
        }, headers=employee_headers)
        assert resp.status_code == 403

    def test_create_policy_requires_name(self, client, admin_headers):
        """POST without name fails validation."""
        resp = client.post("/api/v1/admin/approval-policies", json={
            "min_amount": 0,
            "max_amount": 1000.0,
        }, headers=admin_headers)
        assert resp.status_code == 422


class TestUpdatePolicy:
    def test_update_policy(self, client, admin_headers):
        """PATCH updates policy fields."""
        # Create via API to avoid session issues
        create_resp = client.post("/api/v1/admin/approval-policies", json={
            "name": "Old Name",
            "min_amount": 0,
            "max_amount": 1000.0,
        }, headers=admin_headers)
        assert create_resp.status_code == 201
        policy_id = create_resp.json()["id"]

        resp = client.patch(
            f"/api/v1/admin/approval-policies/{policy_id}",
            json={"name": "New Name", "max_amount": 2000.0},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "New Name"
        assert resp.json()["status"] == "updated"

    def test_update_nonexistent_policy(self, client, admin_headers):
        """PATCH on missing policy returns 404."""
        fake_id = str(uuid.uuid4())
        resp = client.patch(
            f"/api/v1/admin/approval-policies/{fake_id}",
            json={"name": "Updated"},
            headers=admin_headers,
        )
        assert resp.status_code == 404


class TestDeletePolicy:
    def test_delete_policy(self, client, admin_headers):
        """DELETE soft-deletes policy."""
        # Create via API
        create_resp = client.post("/api/v1/admin/approval-policies", json={
            "name": "To Delete",
            "min_amount": 0,
            "max_amount": 500.0,
        }, headers=admin_headers)
        assert create_resp.status_code == 201
        policy_id = create_resp.json()["id"]

        resp = client.delete(
            f"/api/v1/admin/approval-policies/{policy_id}",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"

        # Verify it's gone from listing
        list_resp = client.get("/api/v1/admin/approval-policies", headers=admin_headers)
        ids = [p["id"] for p in list_resp.json()]
        assert policy_id not in ids

    def test_delete_nonexistent_policy(self, client, admin_headers):
        """DELETE on missing policy returns 404."""
        fake_id = str(uuid.uuid4())
        resp = client.delete(
            f"/api/v1/admin/approval-policies/{fake_id}",
            headers=admin_headers,
        )
        assert resp.status_code == 404
