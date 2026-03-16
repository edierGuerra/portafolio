import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.admin_repository import AdminRepository
from repositories.contact_message_repository import ContactMessageRepository
from schemas.contact_message import (
    ContactMessageCreate,
    ContactMessageRead,
    ContactMessageReply,
)
from services.email_service import EmailDeliveryError, EmailService

router = APIRouter(
    prefix="/contact-messages",
    tags=["contact-messages"],
)

email_service = EmailService()
logger = logging.getLogger(__name__)


@router.get(
    "",
    response_model=list[ContactMessageRead],
    summary="Listar mensajes de contacto",
    description="Devuelve mensajes recientes del formulario de contacto. Requiere autenticacion.",
    response_description="Listado de mensajes de contacto ordenados por fecha descendente.",
)
async def list_contact_messages(
    limit: int = Query(default=20, ge=1, le=100, description="Cantidad maxima de registros a devolver"),
    pending_only: bool = Query(default=False, description="Si es true, solo devuelve mensajes pendientes por responder"),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await ContactMessageRepository(db).list_recent(limit=limit, pending_only=pending_only)


@router.post(
    "",
    response_model=ContactMessageRead,
    status_code=status.HTTP_201_CREATED,
    summary="Enviar mensaje de contacto",
    description="Recibe y guarda un mensaje enviado desde el formulario público.",
    response_description="Mensaje de contacto creado.",
)
async def create_contact_message(
    payload: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    created_message = await ContactMessageRepository(db).create(payload)

    # El envio de correo no debe romper la API si hay un fallo temporal de SMTP.
    try:
        admin_user = await AdminRepository(db).get_first()
        email_service.send_contact_message_alert(
            sender_name=created_message.name,
            sender_email=created_message.email,
            subject=created_message.subject,
            message=created_message.message,
            company=created_message.company,
            budget=created_message.budget,
            recipient_email=admin_user.email if admin_user else None,
        )
    except Exception:
        logger.exception("No se pudo enviar la alerta de nuevo mensaje de contacto")

    return created_message


@router.post(
    "/{message_id}/reply",
    response_model=ContactMessageRead,
    summary="Responder mensaje de contacto",
    description="Envia una respuesta por correo al remitente y marca el mensaje como respondido.",
    response_description="Mensaje marcado como respondido.",
)
async def reply_contact_message(
    message_id: int,
    payload: ContactMessageReply,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = ContactMessageRepository(db)
    message = await repository.get_by_id(message_id)

    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado")

    if message.responded:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este mensaje ya fue respondido")

    try:
        email_service.send_contact_message_reply(
            recipient_email=message.email,
            subject=payload.subject,
            message=payload.message,
        )
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    try:
        email_service.send_admin_notification(
            subject="[CMS] Mensaje de contacto respondido",
            message=(
                "Se respondio un mensaje desde el CMS.\n\n"
                f"Mensaje ID: {message.id}\n"
                f"Destinatario: {message.email}\n"
                f"Asunto enviado: {payload.subject}"
            ),
        )
    except Exception:
        logger.exception("No se pudo enviar la notificacion administrativa de respuesta")

    return await repository.mark_as_responded(
        message,
        response_subject=payload.subject,
        response_message=payload.message,
    )


@router.delete(
    "/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar mensaje de contacto respondido",
    description="Elimina un mensaje de contacto solo si ya fue respondido desde el CMS.",
    response_description="Mensaje eliminado.",
)
async def delete_contact_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
) -> Response:
    repository = ContactMessageRepository(db)
    message = await repository.get_by_id(message_id)

    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado")

    try:
        await repository.delete_if_responded(message)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
