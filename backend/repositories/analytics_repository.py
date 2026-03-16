from collections import Counter
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.analytics_event import AnalyticsEvent
from schemas.analytics import (
    AnalyticsEventCreate,
    AnalyticsSummaryResponse,
    DayTrend,
    HourActivity,
    SectionClicks,
    TrafficSource,
)

_SOURCE_COLORS = {
    "LinkedIn": "#2dcc85",
    "GitHub": "#4ee9ad",
    "Organico": "#7ff3c8",
    "Directo": "#a6f7db",
}

_SECTION_LABELS: dict[str, str] = {
    "home": "Inicio",
    "about": "Sobre mi",
    "projects": "Proyectos",
    "blog": "Blog",
    "contact": "Contacto",
    "services": "Servicios",
}


def _classify_referrer(referrer: str) -> str:
    r = referrer.lower()
    if "linkedin.com" in r:
        return "LinkedIn"
    if "github.com" in r:
        return "GitHub"
    if not r or r == "direct":
        return "Directo"
    return "Organico"


class AnalyticsRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def save_event(self, payload: AnalyticsEventCreate) -> AnalyticsEvent:
        event = AnalyticsEvent(
            event_type=payload.event_type,
            section=payload.section,
            referrer=payload.referrer,
            session_id=payload.session_id,
        )
        self.db.add(event)
        await self.db.commit()
        return event

    async def get_summary(self) -> AnalyticsSummaryResponse:
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        # ── Visit trend: last 7 days ──────────────────────────────────────────
        stmt = (
            select(
                func.date(AnalyticsEvent.created_at).label("day"),
                func.count().label("total"),
                func.count(func.distinct(AnalyticsEvent.session_id)).label("unique"),
            )
            .where(
                AnalyticsEvent.event_type == "page_view",
                AnalyticsEvent.created_at >= seven_days_ago,
            )
            .group_by(func.date(AnalyticsEvent.created_at))
        )
        result = await self.db.execute(stmt)
        rows = result.fetchall()

        daily: dict[str, tuple[int, int]] = {}
        for row in rows:
            key = row.day.strftime("%Y-%m-%d") if hasattr(row.day, "strftime") else str(row.day)
            daily[key] = (row.total, row.unique)

        _day_labels = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
        visit_trend: list[DayTrend] = []
        for i in range(6, -1, -1):
            day = (now - timedelta(days=i)).date()
            key = str(day)
            label = _day_labels[day.weekday()]
            visits, unique = daily.get(key, (0, 0))
            visit_trend.append(DayTrend(day=label, visits=visits, unique=unique))

        # ── Section clicks: all time ──────────────────────────────────────────
        stmt = (
            select(
                AnalyticsEvent.section,
                func.count().label("clicks"),
            )
            .where(
                AnalyticsEvent.event_type == "section_view",
                AnalyticsEvent.section.isnot(None),
            )
            .group_by(AnalyticsEvent.section)
            .order_by(func.count().desc())
        )
        result = await self.db.execute(stmt)
        section_clicks = [
            SectionClicks(
                section=_SECTION_LABELS.get(row.section, row.section.capitalize()),
                clicks=row.clicks,
            )
            for row in result.fetchall()
        ]

        # ── Traffic sources: all time ─────────────────────────────────────────
        stmt = select(AnalyticsEvent.referrer).where(
            AnalyticsEvent.event_type == "page_view"
        )
        result = await self.db.execute(stmt)
        referrers = [row[0] for row in result.fetchall()]
        source_counter: Counter[str] = Counter(
            _classify_referrer(r) for r in referrers
        )
        total = sum(source_counter.values()) or 1
        traffic_sources: list[TrafficSource] = [
            TrafficSource(
                source=src,
                value=round(count / total * 100, 1),
                fill=_SOURCE_COLORS.get(src, "#2dcc85"),
            )
            for src, count in source_counter.most_common()
            if count > 0
        ]
        if not traffic_sources:
            traffic_sources = [
                TrafficSource(source="Sin datos", value=100.0, fill="#555")
            ]

        # ── Hourly activity: last 30 days ─────────────────────────────────────
        stmt = (
            select(
                func.hour(AnalyticsEvent.created_at).label("hr"),
                func.count().label("cnt"),
            )
            .where(AnalyticsEvent.created_at >= thirty_days_ago)
            .group_by(func.hour(AnalyticsEvent.created_at))
        )
        result = await self.db.execute(stmt)
        hour_map = {row.hr: row.cnt for row in result.fetchall()}

        selected_hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
        max_cnt = max((hour_map.get(h, 0) for h in selected_hours), default=1) or 1
        hourly_activity: list[HourActivity] = [
            HourActivity(
                hour=f"{h:02d}h",
                activity=round(hour_map.get(h, 0) / max_cnt * 100),
            )
            for h in selected_hours
        ]

        # ── Totals ────────────────────────────────────────────────────────────
        today_key = str(now.date())
        total_visits_today = daily.get(today_key, (0, 0))[0]
        total_visits_week = sum(v for v, _ in daily.values())
        total_unique_week = sum(u for _, u in daily.values())
        total_section_clicks = sum(sc.clicks for sc in section_clicks)

        visit_sessions_stmt = select(
            func.count(func.distinct(AnalyticsEvent.session_id))
        ).where(
            AnalyticsEvent.event_type == "page_view",
            AnalyticsEvent.created_at >= seven_days_ago,
        )
        visit_sessions_result = await self.db.execute(visit_sessions_stmt)
        visit_sessions_week = visit_sessions_result.scalar_one() or 0

        interaction_sessions_stmt = select(
            func.count(func.distinct(AnalyticsEvent.session_id))
        ).where(
            AnalyticsEvent.event_type == "section_view",
            AnalyticsEvent.created_at >= seven_days_ago,
        )
        interaction_sessions_result = await self.db.execute(interaction_sessions_stmt)
        interaction_sessions_week = interaction_sessions_result.scalar_one() or 0

        avg_ctr = (
            round(interaction_sessions_week / visit_sessions_week * 100, 1)
            if visit_sessions_week > 0
            else 0.0
        )

        return AnalyticsSummaryResponse(
            visit_trend=visit_trend,
            section_clicks=section_clicks,
            traffic_sources=traffic_sources,
            hourly_activity=hourly_activity,
            total_visits_today=total_visits_today,
            total_visits_week=total_visits_week,
            total_unique_week=total_unique_week,
            total_section_clicks=total_section_clicks,
            avg_ctr=avg_ctr,
        )
