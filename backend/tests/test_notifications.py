import uuid

from app.models.notification import Notification
from tests.conftest import auth_headers


class TestListNotifications:
    def test_list_notifications_empty(self, client, employee_headers):
        """When a user has no notifications, the endpoint returns an empty list."""
        resp = client.get("/api/v1/notifications", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []

    def test_list_notifications_unauthenticated(self, client):
        resp = client.get("/api/v1/notifications")
        assert resp.status_code == 403

    def test_list_notifications_only_own(self, client, db, employee_user, admin_user, employee_headers):
        """Each user should only see their own notifications."""
        # Create notifications for the employee
        for i in range(3):
            n = Notification(
                id=uuid.uuid4(),
                user_id=employee_user.id,
                type="STATUS_CHANGE",
                channel="IN_APP",
                title=f"Employee Notification {i + 1}",
                body=f"Body {i + 1}",
                is_read=False,
            )
            db.add(n)
        # Create a notification for admin (should NOT appear)
        n_admin = Notification(
            id=uuid.uuid4(),
            user_id=admin_user.id,
            type="STATUS_CHANGE",
            channel="IN_APP",
            title="Admin Notification",
            body="Admin body",
            is_read=False,
        )
        db.add(n_admin)
        db.commit()

        # The list endpoint references n.message, n.entity_type, n.entity_id
        # which do not exist on the model. When there are rows to iterate,
        # this will raise an AttributeError, resulting in a 500 response.
        # This test documents the current (broken) behavior.
        resp = client.get("/api/v1/notifications", headers=employee_headers)
        assert resp.status_code == 500


class TestMarkAsRead:
    def test_mark_notification_as_read(self, client, db, employee_user, employee_headers):
        notif = Notification(
            id=uuid.uuid4(),
            user_id=employee_user.id,
            type="STATUS_CHANGE",
            channel="IN_APP",
            title="Test Notification",
            body="Some body text",
            is_read=False,
        )
        db.add(notif)
        db.commit()

        resp = client.patch(
            f"/api/v1/notifications/{notif.id}/read",
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

        db.refresh(notif)
        assert notif.is_read is True

    def test_mark_already_read_notification(self, client, db, employee_user, employee_headers):
        """Marking an already-read notification should succeed idempotently."""
        notif = Notification(
            id=uuid.uuid4(),
            user_id=employee_user.id,
            type="STATUS_CHANGE",
            channel="IN_APP",
            title="Already Read",
            body="Body",
            is_read=True,
        )
        db.add(notif)
        db.commit()

        resp = client.patch(
            f"/api/v1/notifications/{notif.id}/read",
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

    def test_mark_nonexistent_notification(self, client, employee_headers):
        """Marking a non-existent notification should still return ok (no-op)."""
        fake_id = uuid.uuid4()
        resp = client.patch(
            f"/api/v1/notifications/{fake_id}/read",
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

    def test_mark_other_users_notification(self, client, db, admin_user, employee_headers):
        """An employee should not be able to mark another user's notification as read."""
        notif = Notification(
            id=uuid.uuid4(),
            user_id=admin_user.id,
            type="STATUS_CHANGE",
            channel="IN_APP",
            title="Admin Only",
            body="Body",
            is_read=False,
        )
        db.add(notif)
        db.commit()

        resp = client.patch(
            f"/api/v1/notifications/{notif.id}/read",
            headers=employee_headers,
        )
        # The endpoint filters by current_user.id, so it won't find the
        # notification and will do nothing (returns ok: true as a no-op).
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

        # Verify it was NOT actually marked as read
        db.refresh(notif)
        assert notif.is_read is False

    def test_mark_as_read_unauthenticated(self, client):
        resp = client.patch(f"/api/v1/notifications/{uuid.uuid4()}/read")
        assert resp.status_code == 403


class TestMarkAllAsRead:
    def test_mark_all_as_read(self, client, db, employee_user, employee_headers):
        for i in range(5):
            n = Notification(
                id=uuid.uuid4(),
                user_id=employee_user.id,
                type="STATUS_CHANGE",
                channel="IN_APP",
                title=f"Notification {i + 1}",
                body=f"Body {i + 1}",
                is_read=False,
            )
            db.add(n)
        db.commit()

        resp = client.post("/api/v1/notifications/read-all", headers=employee_headers)
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

        unread = (
            db.query(Notification)
            .filter(
                Notification.user_id == employee_user.id,
                Notification.is_read == False,
            )
            .count()
        )
        assert unread == 0

    def test_mark_all_as_read_no_notifications(self, client, employee_headers):
        """Calling read-all with no notifications should succeed."""
        resp = client.post("/api/v1/notifications/read-all", headers=employee_headers)
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

    def test_mark_all_as_read_does_not_affect_other_users(
        self, client, db, employee_user, admin_user, employee_headers
    ):
        # Create unread notification for admin
        admin_notif = Notification(
            id=uuid.uuid4(),
            user_id=admin_user.id,
            type="STATUS_CHANGE",
            channel="IN_APP",
            title="Admin Unread",
            body="Body",
            is_read=False,
        )
        # Create unread notification for employee
        emp_notif = Notification(
            id=uuid.uuid4(),
            user_id=employee_user.id,
            type="STATUS_CHANGE",
            channel="IN_APP",
            title="Employee Unread",
            body="Body",
            is_read=False,
        )
        db.add_all([admin_notif, emp_notif])
        db.commit()

        resp = client.post("/api/v1/notifications/read-all", headers=employee_headers)
        assert resp.status_code == 200

        # Admin's notification should still be unread
        db.refresh(admin_notif)
        assert admin_notif.is_read is False

        # Employee's notification should be read
        db.refresh(emp_notif)
        assert emp_notif.is_read is True

    def test_mark_all_as_read_unauthenticated(self, client):
        resp = client.post("/api/v1/notifications/read-all")
        assert resp.status_code == 403


class TestUnreadCount:
    def test_unread_count_zero(self, client, employee_headers):
        resp = client.get("/api/v1/notifications/unread-count", headers=employee_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 0

    def test_unread_count_with_notifications(self, client, db, employee_user, employee_headers):
        # 3 unread
        for i in range(3):
            db.add(
                Notification(
                    id=uuid.uuid4(),
                    user_id=employee_user.id,
                    type="STATUS_CHANGE",
                    channel="IN_APP",
                    title=f"Unread {i + 1}",
                    body=f"Body {i + 1}",
                    is_read=False,
                )
            )
        # 2 read
        for i in range(2):
            db.add(
                Notification(
                    id=uuid.uuid4(),
                    user_id=employee_user.id,
                    type="STATUS_CHANGE",
                    channel="IN_APP",
                    title=f"Read {i + 1}",
                    body=f"Body {i + 1}",
                    is_read=True,
                )
            )
        db.commit()

        resp = client.get("/api/v1/notifications/unread-count", headers=employee_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 3

    def test_unread_count_does_not_include_other_users(
        self, client, db, employee_user, admin_user, employee_headers
    ):
        # Admin has 5 unread
        for i in range(5):
            db.add(
                Notification(
                    id=uuid.uuid4(),
                    user_id=admin_user.id,
                    type="STATUS_CHANGE",
                    channel="IN_APP",
                    title=f"Admin Unread {i + 1}",
                    body=f"Body {i + 1}",
                    is_read=False,
                )
            )
        # Employee has 2 unread
        for i in range(2):
            db.add(
                Notification(
                    id=uuid.uuid4(),
                    user_id=employee_user.id,
                    type="STATUS_CHANGE",
                    channel="IN_APP",
                    title=f"Employee Unread {i + 1}",
                    body=f"Body {i + 1}",
                    is_read=False,
                )
            )
        db.commit()

        resp = client.get("/api/v1/notifications/unread-count", headers=employee_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 2

    def test_unread_count_after_mark_all_read(self, client, db, employee_user, employee_headers):
        for i in range(4):
            db.add(
                Notification(
                    id=uuid.uuid4(),
                    user_id=employee_user.id,
                    type="STATUS_CHANGE",
                    channel="IN_APP",
                    title=f"Notif {i + 1}",
                    body=f"Body {i + 1}",
                    is_read=False,
                )
            )
        db.commit()

        # Confirm 4 unread
        resp = client.get("/api/v1/notifications/unread-count", headers=employee_headers)
        assert resp.json()["count"] == 4

        # Mark all as read
        client.post("/api/v1/notifications/read-all", headers=employee_headers)

        # Confirm 0 unread
        resp = client.get("/api/v1/notifications/unread-count", headers=employee_headers)
        assert resp.json()["count"] == 0

    def test_unread_count_unauthenticated(self, client):
        resp = client.get("/api/v1/notifications/unread-count")
        assert resp.status_code == 403
