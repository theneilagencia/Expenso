"""Tests for payments list N+1 fix — enriched data, filters, pagination."""

import uuid

from app.models.expense_request import ExpenseRequest
from app.models.payment import Payment


def _create_payment(db, employee_user, category, status="completed", method="PIX", amount=250.0):
    """Helper to create an expense request + payment pair."""
    req = ExpenseRequest(
        id=uuid.uuid4(),
        employee_id=employee_user.id,
        category_id=category.id,
        title="N+1 Test Expense",
        amount=amount,
        currency="BRL",
        status="PAID",
    )
    db.add(req)
    db.commit()

    payment = Payment(
        id=uuid.uuid4(),
        request_id=req.id,
        method=method,
        amount_paid=amount,
        currency_paid="BRL",
        revolut_status=status,
    )
    db.add(payment)
    db.commit()
    return payment, req


class TestPaymentsListEnriched:
    """Verify that payments list includes enriched joined data (N+1 fix)."""

    def test_includes_request_title(self, client, db, employee_user, category, finance_headers):
        """Payment list items include request_title from the joined expense request."""
        _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) >= 1
        item = data["data"][0]
        assert "request_title" in item
        assert item["request_title"] == "N+1 Test Expense"

    def test_includes_requester_name(self, client, db, employee_user, category, finance_headers):
        """Payment list items include requester_name from the joined user."""
        _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        data = resp.json()
        item = data["data"][0]
        assert "requester_name" in item
        assert item["requester_name"] == "Employee User"

    def test_includes_department(self, client, db, employee_user, category, finance_headers):
        """Payment list items include department from the joined department."""
        _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        data = resp.json()
        item = data["data"][0]
        assert "department" in item
        assert item["department"] == "Engineering"

    def test_includes_category(self, client, db, employee_user, category, finance_headers):
        """Payment list items include category from the joined expense category."""
        _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        data = resp.json()
        item = data["data"][0]
        assert "category" in item
        assert item["category"] == "Travel"

    def test_all_enriched_fields_present(self, client, db, employee_user, category, finance_headers):
        """All four enriched fields are present in a single response item."""
        _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        data = resp.json()
        item = data["data"][0]
        enriched_fields = {"request_title", "requester_name", "department", "category"}
        assert enriched_fields.issubset(item.keys())


class TestPaymentsListStatusFilter:
    """Verify that payments list filters by status correctly."""

    def test_filter_by_completed_status(self, client, db, employee_user, category, finance_headers):
        """Filtering by status=completed returns only completed payments."""
        _create_payment(db, employee_user, category, status="completed")
        _create_payment(db, employee_user, category, status="FAILED")

        resp = client.get("/api/v1/payments?status=completed", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert all(p["status"] == "completed" for p in data["data"])

    def test_filter_by_failed_status(self, client, db, employee_user, category, finance_headers):
        """Filtering by status=FAILED returns only failed payments."""
        _create_payment(db, employee_user, category, status="completed")
        _create_payment(db, employee_user, category, status="FAILED")

        resp = client.get("/api/v1/payments?status=FAILED", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) >= 1
        assert all(p["status"] == "FAILED" for p in data["data"])

    def test_filter_returns_empty_for_nonexistent_status(
        self, client, db, employee_user, category, finance_headers
    ):
        """Filtering by a status with no matches returns empty data."""
        _create_payment(db, employee_user, category, status="completed")

        resp = client.get("/api/v1/payments?status=NONEXISTENT", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["data"] == []
        assert data["total"] == 0


class TestPaymentsListPagination:
    """Verify that payments list returns correct pagination metadata."""

    def test_pagination_metadata_present(self, client, db, employee_user, category, finance_headers):
        """Response includes total, page, and per_page metadata."""
        _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "page" in data
        assert "per_page" in data

    def test_default_pagination_values(self, client, db, employee_user, category, finance_headers):
        """Default page=1 and per_page=20."""
        _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        data = resp.json()
        assert data["page"] == 1
        assert data["per_page"] == 20

    def test_custom_pagination(self, client, db, employee_user, category, finance_headers):
        """Custom page and per_page are respected."""
        for _ in range(5):
            _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments?page=1&per_page=2", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["page"] == 1
        assert data["per_page"] == 2
        assert len(data["data"]) == 2
        assert data["total"] == 5

    def test_second_page(self, client, db, employee_user, category, finance_headers):
        """Page 2 returns the next set of results."""
        for _ in range(5):
            _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments?page=2&per_page=2", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["page"] == 2
        assert len(data["data"]) == 2

    def test_total_count_matches_actual(self, client, db, employee_user, category, finance_headers):
        """Total count reflects the actual number of payments in the database."""
        for _ in range(3):
            _create_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        data = resp.json()
        assert data["total"] == 3

    def test_requires_finance_or_admin_role(self, client, employee_headers):
        """Payments list requires FINANCE or ADMIN role."""
        resp = client.get("/api/v1/payments", headers=employee_headers)
        assert resp.status_code == 403
