import uuid


class TestAuditLogsList:
    def test_list_audit_logs_admin(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["meta"]["total"] == 3
        assert len(data["data"]) == 3

    def test_list_audit_logs_non_admin_forbidden(self, client, employee_headers, audit_logs):
        resp = client.get("/api/v1/audit", headers=employee_headers)
        assert resp.status_code == 403

    def test_list_audit_logs_manager_forbidden(self, client, manager_headers, audit_logs):
        resp = client.get("/api/v1/audit", headers=manager_headers)
        assert resp.status_code == 403

    def test_list_audit_logs_finance_forbidden(self, client, finance_headers, audit_logs):
        resp = client.get("/api/v1/audit", headers=finance_headers)
        assert resp.status_code == 403

    def test_list_audit_logs_unauthenticated(self, client):
        resp = client.get("/api/v1/audit")
        assert resp.status_code == 403

    def test_list_audit_logs_filter_action(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit?action=STATUS_CHANGE", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["meta"]["total"] == 3
        for log in data["data"]:
            assert log["action"] == "STATUS_CHANGE"

    def test_list_audit_logs_filter_action_no_match(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit?action=NONEXISTENT", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["meta"]["total"] == 0
        assert len(data["data"]) == 0

    def test_list_audit_logs_empty(self, client, admin_headers):
        resp = client.get("/api/v1/audit", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["meta"]["total"] == 0
        assert len(data["data"]) == 0

    def test_list_audit_logs_response_structure(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit", headers=admin_headers)
        data = resp.json()
        log_item = data["data"][0]
        assert "id" in log_item
        assert "request_id" in log_item
        assert "actor_id" in log_item
        assert "actor_name" in log_item
        assert "actor_role" in log_item
        assert "action" in log_item
        assert "previous_status" in log_item
        assert "new_status" in log_item
        assert "created_at" in log_item


class TestAuditLogDetail:
    def test_get_audit_log_detail(self, client, admin_headers, audit_logs):
        log_id = str(audit_logs[0].id)
        resp = client.get(f"/api/v1/audit/{log_id}", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["action"] == "STATUS_CHANGE"
        assert data["actor_name"] == "Admin User"
        assert data["actor_role"] == "ADMIN"
        assert data["previous_status"] == "DRAFT"

    def test_get_audit_log_not_found(self, client, admin_headers):
        resp = client.get(f"/api/v1/audit/{uuid.uuid4()}", headers=admin_headers)
        assert resp.status_code == 404

    def test_get_audit_log_detail_non_admin_forbidden(self, client, employee_headers, audit_logs):
        log_id = str(audit_logs[0].id)
        resp = client.get(f"/api/v1/audit/{log_id}", headers=employee_headers)
        assert resp.status_code == 403

    def test_get_audit_log_detail_structure(self, client, admin_headers, audit_logs):
        log_id = str(audit_logs[0].id)
        resp = client.get(f"/api/v1/audit/{log_id}", headers=admin_headers)
        data = resp.json()
        assert "id" in data
        assert "request_id" in data
        assert "actor_id" in data
        assert "actor_name" in data
        assert "actor_role" in data
        assert "action" in data
        assert "previous_status" in data
        assert "new_status" in data
        assert "justification" in data
        assert "diff" in data
        assert "ai_snapshot" in data
        assert "ip_address" in data
        assert "user_agent" in data
        assert "created_at" in data


class TestAuditLogPagination:
    def test_pagination(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit?per_page=2&page=1", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["meta"]["total"] == 3
        assert data["meta"]["total_pages"] == 2
        assert data["meta"]["page"] == 1
        assert data["meta"]["per_page"] == 2

    def test_pagination_second_page(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit?per_page=2&page=2", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 1
        assert data["meta"]["page"] == 2

    def test_pagination_defaults(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit", headers=admin_headers)
        data = resp.json()
        assert data["meta"]["page"] == 1
        assert data["meta"]["per_page"] == 20
        assert data["meta"]["total"] == 3
        assert data["meta"]["total_pages"] == 1

    def test_pagination_beyond_last_page(self, client, admin_headers, audit_logs):
        resp = client.get("/api/v1/audit?per_page=20&page=100", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 0
        assert data["meta"]["total"] == 3
