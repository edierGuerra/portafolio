from typing import Optional

from pydantic import BaseModel, Field


class AnalyticsEventCreate(BaseModel):
    event_type: str = Field(..., pattern=r"^(page_view|section_view)$")
    section: Optional[str] = Field(None, max_length=60)
    referrer: str = Field(default="", max_length=500)
    session_id: str = Field(default="", max_length=36)


class DayTrend(BaseModel):
    day: str
    visits: int
    unique: int


class SectionClicks(BaseModel):
    section: str
    clicks: int


class TrafficSource(BaseModel):
    source: str
    value: float
    fill: str


class HourActivity(BaseModel):
    hour: str
    activity: float


class AnalyticsSummaryResponse(BaseModel):
    visit_trend: list[DayTrend]
    section_clicks: list[SectionClicks]
    traffic_sources: list[TrafficSource]
    hourly_activity: list[HourActivity]
    total_visits_today: int
    total_visits_week: int
    total_unique_week: int
    total_section_clicks: int
    avg_ctr: float
