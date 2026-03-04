

class TestReportsDashboard:
    def test_dashboard_returns_summary(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/dashboard", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_requests"] == 6
        assert data["total_amount"] > 0
        assert "status_breakdown" in data

    def test_dashboard_contains_financial_totals(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/dashboard", headers=admin_headers)
        data = resp.json()
        # total_amount should be 100+200+300+400+500+600 = 2100
        assert data["total_amount"] == 2100.0
        assert "total_paid" in data
        assert "total_pending" in data
        assert "average_amount" in data
        assert "average_risk_score" in data

    def test_dashboard_status_breakdown(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/dashboard", headers=admin_headers)
        data = resp.json()
        breakdown = data["status_breakdown"]
        assert breakdown.get("DRAFT") == 1
        assert breakdown.get("PAID") == 1
        assert breakdown.get("REJECTED") == 1

    def test_dashboard_unauthenticated(self, client):
        resp = client.get("/api/v1/reports/dashboard")
        assert resp.status_code == 403

    def test_dashboard_employee_can_access(self, client, employee_headers, sample_requests):
        resp = client.get("/api/v1/reports/dashboard", headers=employee_headers)
        assert resp.status_code == 200

    def test_dashboard_manager_can_access(self, client, manager_headers, sample_requests):
        resp = client.get("/api/v1/reports/dashboard", headers=manager_headers)
        assert resp.status_code == 200

    def test_dashboard_no_data(self, client, admin_headers):
        resp = client.get("/api/v1/reports/dashboard", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_requests"] == 0
        assert data["total_amount"] == 0


class TestReportsByCategory:
    def test_by_category(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/by-category", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["category"] == "Travel"
        assert data[0]["count"] == 6

    def test_by_category_total(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/by-category", headers=admin_headers)
        data = resp.json()
        assert data[0]["total"] == 2100.0
        assert "average" in data[0]

    def test_by_category_unauthenticated(self, client):
        resp = client.get("/api/v1/reports/by-category")
        assert resp.status_code == 403


class TestReportsByDepartment:
    def test_by_department(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/by-department", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["department"] == "Engineering"

    def test_by_department_totals(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/by-department", headers=admin_headers)
        data = resp.json()
        eng = [d for d in data if d["department"] == "Engineering"][0]
        assert eng["count"] == 6
        assert eng["total"] == 2100.0

    def test_by_department_unauthenticated(self, client):
        resp = client.get("/api/v1/reports/by-department")
        assert resp.status_code == 403


class TestReportsByMonth:
    def test_by_month(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/by-month", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert "year" in data[0]
        assert "month" in data[0]
        assert "total" in data[0]
        assert "count" in data[0]

    def test_by_month_aggregation(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/by-month", headers=admin_headers)
        data = resp.json()
        # All requests created in the same month, so should be 1 entry
        assert len(data) == 1
        assert data[0]["count"] == 6
        assert data[0]["total"] == 2100.0

    def test_by_month_unauthenticated(self, client):
        resp = client.get("/api/v1/reports/by-month")
        assert resp.status_code == 403


class TestReportsExportCSV:
    def test_export_csv(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/export/csv", headers=admin_headers)
        assert resp.status_code == 200
        assert "text/csv" in resp.headers.get("content-type", "")
        content = resp.text
        assert "ID" in content
        assert "Expense 1" in content

    def test_export_csv_has_all_rows(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/export/csv", headers=admin_headers)
        content = resp.text
        lines = content.strip().split("\n")
        # 1 header line + 6 data lines
        assert len(lines) == 7

    def test_export_csv_contains_header_columns(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/export/csv", headers=admin_headers)
        header = resp.text.split("\n")[0]
        assert "Title" in header
        assert "Amount" in header
        assert "Status" in header
        assert "Employee" in header

    def test_export_csv_unauthenticated(self, client):
        resp = client.get("/api/v1/reports/export/csv")
        assert resp.status_code == 403

    def test_export_csv_empty(self, client, admin_headers):
        resp = client.get("/api/v1/reports/export/csv", headers=admin_headers)
        assert resp.status_code == 200
        lines = resp.text.strip().split("\n")
        # Only header line when no data
        assert len(lines) == 1


class TestReportsExportPDF:
    def test_export_pdf_html(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/export/pdf", headers=admin_headers)
        assert resp.status_code == 200
        assert "text/html" in resp.headers.get("content-type", "")
        assert "Expense Report" in resp.text

    def test_export_pdf_contains_data(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/export/pdf", headers=admin_headers)
        html = resp.text
        assert "Total Requests" in html
        assert "Total Amount" in html

    def test_export_pdf_has_table_rows(self, client, admin_headers, sample_requests):
        resp = client.get("/api/v1/reports/export/pdf", headers=admin_headers)
        html = resp.text
        assert "<table>" in html
        assert "Expense 1" in html

    def test_export_pdf_unauthenticated(self, client):
        resp = client.get("/api/v1/reports/export/pdf")
        assert resp.status_code == 403
