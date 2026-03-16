from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from repositories.contact_message_repository import ContactMessageRepository
from schemas.contact_message import ContactMessageCreate, ContactMessageRead

router = APIRouter(
    prefix="/contact-messages",
    tags=["contact-messages"],
)


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
    return await ContactMessageRepository(db).create(payload)
