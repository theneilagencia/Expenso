"""Tests for vendor CRUD (whitelist/blacklist) admin endpoints."""

import uuid


class TestListVendors:
    def test_list_vendors_empty(self, client, admin_headers):
        """GET returns empty list when no vendors exist."""
        resp = client.get("/api/v1/admin/vendors", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_vendors_with_data(self, client, admin_headers):
        """GET returns list of vendors."""
        client.post("/api/v1/admin/vendors", json={
            "name": "Acme Corp",
            "list_type": "WHITELIST",
            "document": "12345678901234",
        }, headers=admin_headers)
        client.post("/api/v1/admin/vendors", json={
            "name": "Bad Vendor",
            "list_type": "BLACKLIST",
            "reason": "Fraud history",
        }, headers=admin_headers)

        resp = client.get("/api/v1/admin/vendors", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_list_vendors_requires_admin(self, client, employee_headers):
        """Non-admin gets 403."""
        resp = client.get("/api/v1/admin/vendors", headers=employee_headers)
        assert resp.status_code == 403


class TestCreateVendor:
    def test_create_vendor_whitelist(self, client, admin_headers):
        """POST creates whitelist entry."""
        resp = client.post("/api/v1/admin/vendors", json={
            "name": "Trusted Supplier",
            "list_type": "WHITELIST",
            "document": "12345678901234",
            "reason": "Approved by compliance",
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert "id" in data
        assert data["name"] == "Trusted Supplier"

    def test_create_vendor_blacklist(self, client, admin_headers):
        """POST creates blacklist entry."""
        resp = client.post("/api/v1/admin/vendors", json={
            "name": "Blocked Vendor",
            "list_type": "BLACKLIST",
            "reason": "Failed compliance audit",
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Blocked Vendor"


class TestFilterVendors:
    def test_filter_by_list_type(self, client, admin_headers):
        """Filter by list_type works correctly."""
        client.post("/api/v1/admin/vendors", json={
            "name": "White Vendor",
            "list_type": "WHITELIST",
        }, headers=admin_headers)
        client.post("/api/v1/admin/vendors", json={
            "name": "Black Vendor",
            "list_type": "BLACKLIST",
        }, headers=admin_headers)

        # Filter whitelist only
        resp = client.get("/api/v1/admin/vendors?list_type=WHITELIST", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "White Vendor"

        # Filter blacklist only
        resp = client.get("/api/v1/admin/vendors?list_type=BLACKLIST", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Black Vendor"


class TestDeleteVendor:
    def test_delete_vendor(self, client, admin_headers):
        """Soft delete works."""
        # Create via API
        create_resp = client.post("/api/v1/admin/vendors", json={
            "name": "To Delete",
            "list_type": "WHITELIST",
        }, headers=admin_headers)
        assert create_resp.status_code == 201
        vendor_id = create_resp.json()["id"]

        resp = client.delete(
            f"/api/v1/admin/vendors/{vendor_id}",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"

        # Verify excluded from listing
        list_resp = client.get("/api/v1/admin/vendors", headers=admin_headers)
        ids = [v["id"] for v in list_resp.json()]
        assert vendor_id not in ids

    def test_delete_nonexistent_vendor(self, client, admin_headers):
        """DELETE on missing vendor returns 404."""
        fake_id = str(uuid.uuid4())
        resp = client.delete(
            f"/api/v1/admin/vendors/{fake_id}",
            headers=admin_headers,
        )
        assert resp.status_code == 404

    def test_delete_already_deleted_vendor(self, client, admin_headers):
        """Cannot delete an already soft-deleted vendor."""
        # Create and delete via API
        create_resp = client.post("/api/v1/admin/vendors", json={
            "name": "Already Deleted",
            "list_type": "BLACKLIST",
        }, headers=admin_headers)
        vendor_id = create_resp.json()["id"]
        client.delete(f"/api/v1/admin/vendors/{vendor_id}", headers=admin_headers)

        # Try to delete again
        resp = client.delete(
            f"/api/v1/admin/vendors/{vendor_id}",
            headers=admin_headers,
        )
        assert resp.status_code == 404
