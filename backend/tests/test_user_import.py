"""Tests for bulk user import from XLSX."""

import io
import uuid

from app.models.cost_center import CostCenter
from app.models.user import User
from app.services.user_import_service import UserImportService


def _create_xlsx(rows):
    """Create an in-memory XLSX file with given rows.

    rows: list of lists, where first row is the header.
    Returns bytes.
    """
    import openpyxl

    wb = openpyxl.Workbook()
    ws = wb.active
    for row in rows:
        ws.append(row)
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


class TestUserImportService:
    def test_import_valid_xlsx(self, db, department):
        """Valid XLSX creates users successfully."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["John Doe", "john@example.com", "EMPLOYEE", "ENG", ""],
            ["Jane Smith", "jane@example.com", "MANAGER", "ENG", ""],
        ])

        result = UserImportService.parse_xlsx(xlsx_bytes, db)

        assert len(result["created"]) == 2
        assert len(result["skipped"]) == 0
        assert len(result["errors"]) == 0

        # Verify users exist in DB
        john = db.query(User).filter(User.email == "john@example.com").first()
        assert john is not None
        assert john.full_name == "John Doe"
        assert john.role == "EMPLOYEE"
        assert john.force_password_reset is True

    def test_import_duplicate_emails(self, db, department, employee_user):
        """Duplicate emails are skipped."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["Employee Dupe", "employee@test.com", "EMPLOYEE", "ENG", ""],
            ["New User", "new@example.com", "EMPLOYEE", "ENG", ""],
        ])

        result = UserImportService.parse_xlsx(xlsx_bytes, db)

        assert len(result["created"]) == 1
        assert len(result["skipped"]) == 1
        assert result["skipped"][0]["reason"] == "already_exists"
        assert result["skipped"][0]["email"] == "employee@test.com"

    def test_import_missing_columns(self, db):
        """XLSX with missing required columns returns error."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email"],
            ["John Doe", "john@example.com"],
        ])

        result = UserImportService.parse_xlsx(xlsx_bytes, db)

        assert len(result["errors"]) == 1
        assert "Missing columns" in result["errors"][0]

    def test_import_invalid_role(self, db, department):
        """Invalid role is reported as error."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["Bad Role", "badrole@example.com", "SUPERADMIN", "ENG", ""],
        ])

        result = UserImportService.parse_xlsx(xlsx_bytes, db)

        assert len(result["errors"]) == 1
        assert "invalid role" in result["errors"][0].lower()

    def test_import_invalid_email(self, db, department):
        """Invalid email is reported as error."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["Bad Email", "not-an-email", "EMPLOYEE", "ENG", ""],
        ])

        result = UserImportService.parse_xlsx(xlsx_bytes, db)

        assert len(result["errors"]) == 1
        assert "invalid email" in result["errors"][0].lower()

    def test_import_nonexistent_department(self, db):
        """Nonexistent department code is skipped."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["Good User", "good@example.com", "EMPLOYEE", "NONEXIST", ""],
        ])

        result = UserImportService.parse_xlsx(xlsx_bytes, db)

        assert len(result["skipped"]) == 1
        assert "department_not_found" in result["skipped"][0]["reason"]

    def test_import_with_cost_center(self, db, department):
        """Valid import with cost center lookup."""
        cc = CostCenter(
            id=uuid.uuid4(),
            name="CC Alpha",
            code="CC-A",
            department_id=department.id,
        )
        db.add(cc)
        db.commit()

        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["CC User", "ccuser@example.com", "EMPLOYEE", "ENG", "CC-A"],
        ])

        result = UserImportService.parse_xlsx(xlsx_bytes, db)

        assert len(result["created"]) == 1
        user = db.query(User).filter(User.email == "ccuser@example.com").first()
        assert user is not None
        assert str(user.cost_center_id) == str(cc.id)

    def test_import_invalid_file(self, db):
        """Non-XLSX file returns error."""
        result = UserImportService.parse_xlsx(b"not a valid xlsx", db)

        assert len(result["errors"]) == 1
        assert "Invalid XLSX" in result["errors"][0]


class TestUserImportEndpoint:
    def test_import_endpoint(self, client, db, admin_headers, department):
        """POST /admin/users/import with XLSX file works."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["API User", "apiuser@example.com", "EMPLOYEE", "ENG", ""],
        ])

        resp = client.post(
            "/api/v1/admin/users/import",
            files={"file": ("users.xlsx", xlsx_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["created"]) == 1
        assert data["created"][0]["email"] == "apiuser@example.com"

    def test_import_endpoint_requires_admin(self, client, employee_headers):
        """Non-admin gets 403."""
        xlsx_bytes = _create_xlsx([
            ["full_name", "email", "role", "department_code", "cost_center_code"],
            ["User", "u@example.com", "EMPLOYEE", "ENG", ""],
        ])

        resp = client.post(
            "/api/v1/admin/users/import",
            files={"file": ("users.xlsx", xlsx_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            headers=employee_headers,
        )
        assert resp.status_code == 403
