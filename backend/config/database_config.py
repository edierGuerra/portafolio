from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase


DATABASE_URL = "mysql+aiomysql://Edier:admin@localhost/portafolio_db"

engine = create_async_engine(
    DATABASE_URL,
    echo=True  # opcional, útil en desarrollo
)

# Creamos el sessionmaker
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db