from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.analytics_repository import AnalyticsRepository
from schemas.analytics import AnalyticsEventCreate, AnalyticsSummaryResponse

router = APIRouter(tags=["analytics"])


@router.post(
    "/analytics/track",
    status_code=status.HTTP_201_CREATED,
    summary="Registrar evento de visita (solo visitantes sin sesion de admin)",
)
async def track_event(
    payload: AnalyticsEventCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    repo = AnalyticsRepository(db)
    await repo.save_event(payload)
    return {"ok": True}


@router.get(
    "/analytics/summary",
    response_model=AnalyticsSummaryResponse,
    summary="Resumen de analiticas (solo admin)",
)
async def get_analytics_summary(
    _: None = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsSummaryResponse:
    repo = AnalyticsRepository(db)
    return await repo.get_summary()
