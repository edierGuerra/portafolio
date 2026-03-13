from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database_config import Base, engine
from contextlib import asynccontextmanager
import models
from endpoints import auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Código que se ejecuta al iniciar la app
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

    # Código que se ejecuta al cerrar la app
    await engine.dispose()
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Hello World"}