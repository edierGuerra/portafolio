"""
Script de utilidad para actualizar la contraseña del usuario administrador
a un hash seguro (pbkdf2_sha256) en la base de datos.

Uso:
    cd backend
    .venv\\Scripts\\python.exe hash_password.py

El script pedirá la nueva contraseña de forma segura (sin eco en consola)
y actualizará el registro del usuario con el hash generado.
"""
import asyncio
import getpass

from sqlalchemy import update

from config.database_config import AsyncSessionLocal, engine
from models.admin import User
from services.security import hash_password


async def update_admin_password(new_password: str) -> None:
    hashed = hash_password(new_password)
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(
                update(User).values(password=hashed)
            )
            await db.commit()
            print("✓ Contraseña actualizada correctamente.")
            print(f"  Hash generado: {hashed}")
    finally:
        await engine.dispose()


def main() -> None:
    print("=== Actualizar contraseña del administrador ===")
    password = getpass.getpass("Nueva contraseña: ")
    confirm = getpass.getpass("Confirmar contraseña: ")

    if password != confirm:
        print("✗ Las contraseñas no coinciden.")
        return

    if len(password) < 8:
        print("✗ La contraseña debe tener al menos 8 caracteres.")
        return

    asyncio.run(update_admin_password(password))


if __name__ == "__main__":
    main()
