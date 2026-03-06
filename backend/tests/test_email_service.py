"""Tests for email service — SMTP sending, template rendering, graceful failure."""

from unittest.mock import MagicMock, patch

from app.services.email_service import send_email


class TestSendEmail:
    @patch("app.services.email_service.settings")
    def test_skips_when_smtp_not_configured(self, mock_settings):
        mock_settings.SMTP_HOST = ""
        result = send_email("user@test.com", "Test", "<p>Hello</p>")
        assert result is False

    @patch("app.services.email_service.smtplib.SMTP")
    @patch("app.services.email_service.settings")
    def test_sends_email_successfully(self, mock_settings, mock_smtp_class):
        mock_settings.SMTP_HOST = "smtp.test.com"
        mock_settings.SMTP_PORT = 587
        mock_settings.SMTP_FROM_EMAIL = "noreply@test.com"
        mock_settings.SMTP_USER = "user"
        mock_settings.SMTP_PASSWORD = "pass"

        mock_server = MagicMock()
        mock_smtp_class.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_class.return_value.__exit__ = MagicMock(return_value=False)

        result = send_email("user@test.com", "Test Subject", "<p>Body</p>")
        assert result is True
        mock_server.send_message.assert_called_once()

    @patch("app.services.email_service.smtplib.SMTP")
    @patch("app.services.email_service.settings")
    def test_handles_smtp_failure_gracefully(self, mock_settings, mock_smtp_class):
        mock_settings.SMTP_HOST = "smtp.test.com"
        mock_settings.SMTP_PORT = 587
        mock_settings.SMTP_FROM_EMAIL = "noreply@test.com"
        mock_settings.SMTP_USER = ""
        mock_settings.SMTP_PASSWORD = ""

        mock_smtp_class.side_effect = ConnectionRefusedError("Connection refused")

        result = send_email("user@test.com", "Test", "<p>Body</p>")
        assert result is False


class TestEmailTemplateRendering:
    def test_jinja_templates_exist(self):
        import os
        templates_dir = os.path.join(
            os.path.dirname(__file__), "..", "app", "templates", "email"
        )
        for locale in ["en-US", "pt-BR"]:
            for template in ["submitted", "approved", "rejected", "correction", "payment", "new_pending_approval"]:
                path = os.path.join(templates_dir, locale, f"{template}.html")
                assert os.path.exists(path), f"Template missing: {path}"

    def test_render_template(self):
        import os

        from jinja2 import Environment, FileSystemLoader
        templates_dir = os.path.join(
            os.path.dirname(__file__), "..", "app", "templates"
        )
        env = Environment(loader=FileSystemLoader(templates_dir), autoescape=True)
        template = env.get_template("email/en-US/submitted.html")
        html = template.render(
            user_name="John",
            request_title="Travel Expense",
            amount="500.00",
            currency="BRL",
            status="PENDING_AI",
            action_url="http://localhost:5173/requests/123",
            label_title="Title",
            label_amount="Amount",
            label_view="View Request",
            footer_text="Automated email",
        )
        assert "John" in html
        assert "Travel Expense" in html
        assert "500.00" in html
