import logging
import smtplib
from email.message import EmailMessage

from config.email_config import get_email_settings


logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    pass


class EmailService:
    @property
    def is_enabled(self) -> bool:
        settings = self.settings
        return (
            settings.enabled
            and bool(settings.host)
            and bool(settings.from_email)
            and bool(settings.admin_notification_email)
        )

    @property
    def settings(self):
        return get_email_settings()

    def _send_email(self, email: EmailMessage) -> None:
        settings = self.settings

        try:
            if settings.use_ssl:
                with smtplib.SMTP_SSL(settings.host, settings.port, timeout=20) as server:
                    if settings.username:
                        server.login(settings.username, settings.password)
                    server.send_message(email)
                return

            with smtplib.SMTP(settings.host, settings.port, timeout=20) as server:
                server.ehlo()
                if settings.use_tls:
                    server.starttls()
                    server.ehlo()
                if settings.username:
                    server.login(settings.username, settings.password)
                server.send_message(email)
        except (OSError, smtplib.SMTPException) as exc:
            logger.exception("No se pudo enviar un correo via SMTP")
            raise EmailDeliveryError("No se pudo enviar el correo. Verifica la configuracion SMTP e intenta nuevamente.") from exc

    def _ensure_base_configuration(self) -> None:
        settings = self.settings
        missing_fields: list[str] = []

        if not settings.enabled:
            missing_fields.append("EMAIL_NOTIFICATIONS_ENABLED=true")
        if not settings.host:
            missing_fields.append("SMTP_HOST")
        if not settings.from_email:
            missing_fields.append("SMTP_FROM_EMAIL")
        if settings.username and not settings.password:
            missing_fields.append("SMTP_PASSWORD")

        if missing_fields:
            raise EmailDeliveryError(
                "La configuracion de correo esta incompleta: " + ", ".join(missing_fields)
            )

    def _ensure_admin_notification_configuration(self) -> None:
        self._ensure_base_configuration()
        if not self.settings.admin_notification_email:
            raise EmailDeliveryError("La configuracion de correo esta incompleta: ADMIN_NOTIFICATION_EMAIL")

    def send_contact_message_alert(
        self,
        *,
        sender_name: str,
        sender_email: str,
        subject: str,
        message: str,
        company: str,
        budget: str,
        recipient_email: str | None = None,
    ) -> None:
        settings = self.settings
        target_email = (recipient_email or settings.admin_notification_email).strip()

        if not target_email:
            return

        self._ensure_base_configuration()

        email = EmailMessage()
        email["Subject"] = f"[Portafolio] Nuevo mensaje de contacto: {subject}"
        email["From"] = settings.from_email
        email["To"] = target_email
        email["Reply-To"] = sender_email
        email.set_content(
            "\n".join(
                [
                    "Nuevo mensaje desde el formulario de contacto.",
                    "",
                    f"Nombre: {sender_name}",
                    f"Email: {sender_email}",
                    f"Empresa: {company or '-'}",
                    f"Presupuesto: {budget or '-'}",
                    f"Asunto: {subject}",
                    "",
                    "Mensaje:",
                    message,
                ]
            )
        )

        self._send_email(email)

    def send_contact_message_reply(
        self,
        *,
        recipient_email: str,
        subject: str,
        message: str,
    ) -> None:
        settings = self.settings
        target_email = recipient_email.strip()

        if not target_email:
            raise EmailDeliveryError("El mensaje no tiene un correo destinatario valido para responder")

        self._ensure_base_configuration()

        email = EmailMessage()
        email["Subject"] = subject
        email["From"] = settings.from_email
        email["To"] = target_email
        email.set_content(message)

        self._send_email(email)

    def send_admin_notification(self, *, subject: str, message: str) -> None:
        settings = self.settings
        target_email = settings.admin_notification_email.strip()

        if not target_email:
            return

        self._ensure_admin_notification_configuration()

        email = EmailMessage()
        email["Subject"] = subject
        email["From"] = settings.from_email
        email["To"] = target_email
        email.set_content(message)

        self._send_email(email)
