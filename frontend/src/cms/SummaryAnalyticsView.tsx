import { useEffect, useState } from "react";
import { Activity, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import { getAnalyticsSummaryCms } from "./api";
import type { AnalyticsSummary } from "./types";

export function SummaryAnalyticsView() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metrics = {
    totalVisitsWeek: data?.total_visits_week ?? 0,
    totalUniqueWeek: data?.total_unique_week ?? 0,
    totalSectionClicks: data?.total_section_clicks ?? 0,
    avgCtr: data?.avg_ctr ?? 0,
  };

  useEffect(() => {
    setLoading(true);
    getAnalyticsSummaryCms()
      .then(setData)
      .catch(() => setError("No se pudo cargar el resumen de analiticas."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="cms-analytics-shell">
        <div className="cms-analytics-empty">
          <Activity className="cms-analytics-empty-icon" />
          <p>Cargando datos...</p>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="cms-analytics-shell">
        <div className="cms-analytics-empty">
          <Activity className="cms-analytics-empty-icon" />
          <p>{error ?? "Sin datos disponibles."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cms-analytics-shell">
      <div className="cms-analytics-kpi-row">
        <Card className="cms-panel-card cms-analytics-kpi-card">
          <CardContent className="cms-analytics-kpi-content">
            <div className="cms-analytics-kpi-header">
              <span className="cms-analytics-kpi-label">Visitas (7 dias)</span>
              <span className="cms-analytics-kpi-icon-wrap">
                <Eye className="cms-analytics-kpi-icon" />
              </span>
            </div>
            <span className="cms-analytics-kpi-value">
              {metrics.totalVisitsWeek.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card className="cms-panel-card cms-analytics-kpi-card">
          <CardContent className="cms-analytics-kpi-content">
            <div className="cms-analytics-kpi-header">
              <span className="cms-analytics-kpi-label">Visitantes unicos</span>
              <span className="cms-analytics-kpi-icon-wrap">
                <TrendingUp className="cms-analytics-kpi-icon" />
              </span>
            </div>
            <span className="cms-analytics-kpi-value">
              {metrics.totalUniqueWeek.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card className="cms-panel-card cms-analytics-kpi-card">
          <CardContent className="cms-analytics-kpi-content">
            <div className="cms-analytics-kpi-header">
              <span className="cms-analytics-kpi-label">Clicks en secciones</span>
              <span className="cms-analytics-kpi-icon-wrap">
                <MousePointerClick className="cms-analytics-kpi-icon" />
              </span>
            </div>
            <span className="cms-analytics-kpi-value">
              {metrics.totalSectionClicks.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card className="cms-panel-card cms-analytics-kpi-card">
          <CardContent className="cms-analytics-kpi-content">
            <div className="cms-analytics-kpi-header">
              <span className="cms-analytics-kpi-label">CTR promedio</span>
              <span className="cms-analytics-kpi-icon-wrap">
                <Activity className="cms-analytics-kpi-icon" />
              </span>
            </div>
            <span className="cms-analytics-kpi-value">{metrics.avgCtr}%</span>
          </CardContent>
        </Card>
      </div>

      <div className="cms-analytics-grid cms-analytics-grid-top">
        <Card className="cms-panel-card cms-analytics-card-wide">
          <CardHeader className="cms-analytics-card-header">
            <CardTitle className="cms-analytics-title">
              Tendencia semanal de visitas
            </CardTitle>
            <CardDescription className="cms-analytics-subtitle">
              Comparativo de vistas totales vs visitantes unicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="cms-analytics-card-content">
            {data.visit_trend.every((d) => d.visits === 0) ? (
              <p className="cms-analytics-no-data">Sin datos de visitas aun.</p>
            ) : (
              <ChartContainer
                className="cms-chart-large"
                config={{
                  visits: { label: "Visitas", color: "#2dcc85" },
                  unique: { label: "Unicos", color: "#94f6cf" },
                }}
              >
                <AreaChart
                  data={data.visit_trend}
                  margin={{ left: 8, right: 8, top: 12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="visitsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2dcc85"
                        stopOpacity={0.38}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2dcc85"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(86,109,98,0.22)"
                  />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#2dcc85"
                    strokeWidth={2}
                    fill="url(#visitsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="unique"
                    stroke="#94f6cf"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="cms-analytics-card-header">
            <CardTitle className="cms-analytics-title">Fuentes de trafico</CardTitle>
            <CardDescription className="cms-analytics-subtitle">
              Distribucion de origen de visitas.
            </CardDescription>
          </CardHeader>
          <CardContent className="cms-analytics-card-content">
            <ChartContainer
              className="cms-chart-medium"
              config={Object.fromEntries(
                data.traffic_sources.map((s) => [
                  s.source,
                  { label: s.source, color: s.fill },
                ]),
              )}
            >
              <PieChart>
                <Pie
                  data={data.traffic_sources}
                  dataKey="value"
                  nameKey="source"
                  innerRadius={54}
                  outerRadius={84}
                  stroke="transparent"
                >
                  {data.traffic_sources.map((entry) => (
                    <Cell key={entry.source} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="source" />}
                />
              </PieChart>
            </ChartContainer>
            <div className="cms-traffic-legend">
              {data.traffic_sources.map((item) => (
                <div key={item.source} className="cms-traffic-legend-row">
                  <span className="cms-traffic-legend-key">
                    <span
                      className="cms-traffic-dot"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.source}
                  </span>
                  <span className="cms-traffic-legend-value">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="cms-analytics-grid cms-analytics-grid-bottom">
        <Card className="cms-panel-card cms-analytics-card-wide">
          <CardHeader className="cms-analytics-card-header">
            <CardTitle className="cms-analytics-title">
              Secciones mas visitadas
            </CardTitle>
            <CardDescription className="cms-analytics-subtitle">
              Interacciones acumuladas por apartado del portafolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="cms-analytics-card-content">
            {data.section_clicks.length === 0 ? (
              <p className="cms-analytics-no-data">
                Sin datos de secciones aun.
              </p>
            ) : (
              <ChartContainer
                className="cms-chart-large"
                config={{ clicks: { label: "Visitas", color: "#2dcc85" } }}
              >
                <BarChart
                  data={data.section_clicks}
                  layout="vertical"
                  margin={{ top: 8, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="rgba(86,109,98,0.16)"
                  />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="section"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={88}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="clicks" fill="#2dcc85" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="cms-analytics-card-header">
            <CardTitle className="cms-analytics-title">Actividad por hora</CardTitle>
            <CardDescription className="cms-analytics-subtitle">
              Pico de trafico en horarios de mayor consulta.
            </CardDescription>
          </CardHeader>
          <CardContent className="cms-analytics-card-content">
            <div className="cms-hours-list">
              {data.hourly_activity.map((item) => (
                <div key={item.hour} className="cms-hours-row">
                  <span className="cms-hours-time">{item.hour}</span>
                  <div className="cms-hours-track">
                    <div
                      className="cms-hours-bar"
                      style={{ width: `${item.activity}%` }}
                    />
                  </div>
                  <span className="cms-hours-value">{item.activity}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
