"""Tests for org hierarchy tree and department parent update."""

import uuid

from app.models.department import Department


class TestGetHierarchyTree:
    def test_get_hierarchy_tree(self, client, db, admin_headers, department):
        """GET returns tree structure with departments and users."""
        resp = client.get("/api/v1/admin/hierarchy", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # The existing department should be a root node (no parent)
        root = data[0]
        assert root["name"] == "Engineering"
        assert root["code"] == "ENG"
        assert "users" in root
        assert "children" in root

    def test_get_hierarchy_with_children(self, client, db, admin_headers, department):
        """Tree nests child departments under parents."""
        child_dept = Department(
            id=uuid.uuid4(),
            name="Backend",
            code="ENG-BE",
            parent_department_id=department.id,
        )
        db.add(child_dept)
        db.commit()

        resp = client.get("/api/v1/admin/hierarchy", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()

        # Find the root Engineering department
        eng = [d for d in data if d["code"] == "ENG"]
        assert len(eng) == 1
        assert len(eng[0]["children"]) == 1
        assert eng[0]["children"][0]["code"] == "ENG-BE"

    def test_get_hierarchy_includes_users(self, client, db, admin_headers, department, admin_user):
        """Each department node includes its users."""
        resp = client.get("/api/v1/admin/hierarchy", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()

        # Admin user belongs to Engineering
        eng = [d for d in data if d["code"] == "ENG"]
        assert len(eng) == 1
        user_emails = [u["email"] for u in eng[0]["users"]]
        assert "admin@test.com" in user_emails

    def test_get_hierarchy_requires_admin(self, client, employee_headers):
        """Non-admin gets 403."""
        resp = client.get("/api/v1/admin/hierarchy", headers=employee_headers)
        assert resp.status_code == 403


class TestUpdateDepartmentParent:
    def test_update_department_parent(self, client, db, admin_headers, department):
        """PATCH updates parent_department_id."""
        parent_dept = Department(
            id=uuid.uuid4(),
            name="Technology",
            code="TECH",
        )
        db.add(parent_dept)
        db.commit()

        resp = client.patch(
            f"/api/v1/admin/hierarchy/{department.id}",
            json={"parent_department_id": str(parent_dept.id)},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["parent_department_id"] == str(parent_dept.id)
        assert data["status"] == "updated"

    def test_update_department_remove_parent(self, client, db, admin_headers, department):
        """PATCH with null parent makes department a root."""
        parent_dept = Department(
            id=uuid.uuid4(),
            name="Technology",
            code="TECH2",
        )
        db.add(parent_dept)
        db.commit()

        department.parent_department_id = parent_dept.id
        db.commit()

        resp = client.patch(
            f"/api/v1/admin/hierarchy/{department.id}",
            json={"parent_department_id": None},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["parent_department_id"] is None

    def test_update_nonexistent_department(self, client, admin_headers):
        """PATCH on missing department returns 404."""
        fake_id = str(uuid.uuid4())
        resp = client.patch(
            f"/api/v1/admin/hierarchy/{fake_id}",
            json={"parent_department_id": None},
            headers=admin_headers,
        )
        assert resp.status_code == 404
