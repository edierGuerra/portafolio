import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BookText,
  Briefcase,
  ChevronRight,
  Cpu,
  Eye,
  FileText,
  FolderKanban,
  Globe,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  MousePointerClick,
  Pencil,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
  UserCircle2,
  Wrench,
} from "lucide-react";
import { Toaster, toast } from "sonner";
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import type { CmsUser } from "./types";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  httpWithAuth,
  saveSession,
} from "./session";
import { loginCms, logoutCms } from "./api";
import "./cms-theme.css";

type ModuleItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  records: number;
  description: string;
};

const MODULES: ModuleItem[] = [
  {
    id: "dashboard",
    label: "Resumen",
    icon: LayoutGrid,
    records: 0,
    description: "Metricas, estado de contenido y accesos rapidos.",
  },
  {
    id: "projects",
    label: "Proyectos",
    icon: FolderKanban,
    records: 8,
    description: "CRUD para proyectos y relaciones con tecnologias.",
  },
  {
    id: "experience",
    label: "Experiencia",
    icon: Briefcase,
    records: 5,
    description: "Historial profesional, cargos y logros.",
  },
  {
    id: "blog",
    label: "Blog",
    icon: BookText,
    records: 12,
    description: "Posts, categorias y calendario editorial.",
  },
  {
    id: "services",
    label: "Servicios",
    icon: Wrench,
    records: 6,
    description: "Catalogo de servicios disponibles en portada.",
  },
  {
    id: "technologies",
    label: "Tecnologias",
    icon: Cpu,
    records: 24,
    description: "Stack tecnico y etiquetas por nivel.",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: LifeBuoy,
    records: 9,
    description: "Preguntas frecuentes para clientes y reclutadores.",
  },
  {
    id: "contact",
    label: "Contacto",
    icon: Mail,
    records: 3,
    description: "Datos de contacto y redes sociales.",
  },
  {
    id: "profile",
    label: "Perfil Admin",
    icon: UserCircle2,
    records: 1,
    description: "Configuracion personal e identidad visual.",
  },
];

const VISIT_TREND_DATA = [
  { day: "Lun", visits: 420, unique: 280 },
  { day: "Mar", visits: 510, unique: 330 },
  { day: "Mie", visits: 590, unique: 360 },
  { day: "Jue", visits: 670, unique: 405 },
  { day: "Vie", visits: 740, unique: 452 },
  { day: "Sab", visits: 620, unique: 398 },
  { day: "Dom", visits: 580, unique: 374 },
];

const SECTION_CLICKS_DATA = [
  { section: "Proyectos", clicks: 1890 },
  { section: "Blog", clicks: 1310 },
  { section: "Experiencia", clicks: 990 },
  { section: "Servicios", clicks: 760 },
  { section: "Contacto", clicks: 540 },
];

const TRAFFIC_SOURCE_DATA = [
  { source: "Organico", value: 48, fill: "#2dcc85" },
  { source: "LinkedIn", value: 23, fill: "#4ee9ad" },
  { source: "GitHub", value: 17, fill: "#7ff3c8" },
  { source: "Directo", value: 12, fill: "#a6f7db" },
];

const HEATMAP_HOURS = [
  { hour: "08h", activity: 35 },
  { hour: "10h", activity: 58 },
  { hour: "12h", activity: 71 },
  { hour: "14h", activity: 64 },
  { hour: "16h", activity: 82 },
  { hour: "18h", activity: 76 },
  { hour: "20h", activity: 49 },
  { hour: "22h", activity: 32 },
];

// â”€â”€â”€ Navbar (fijo en la parte superior) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CmsNavbar({
  user,
  onLogout,
  onToggleSidebar,
}: {
  user: CmsUser;
  onLogout: () => void;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="cms-navbar">
      <div className="cms-navbar-inner">
        {/* Left: hamburger (mobile) + brand */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <button
              type="button"
              className="cms-icon-btn"
              onClick={onToggleSidebar}
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
          <div className="cms-brand">
            <span className="cms-brand-dot" />
            <span className="cms-brand-text">Panel administrativo de portafolio</span>
          </div>
          <span className="hidden text-sm text-zinc-600 md:block">/</span>
          <span className="hidden text-sm text-zinc-400 md:block">
            CMS Preview
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cms-icon-btn"
            disabled
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="hidden sm:block text-right mr-1">
            <p className="text-xs font-medium leading-none text-zinc-200">
              {user.name}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {user.professional_profile}
            </p>
          </div>
          <button
            type="button"
            className="cms-icon-btn cms-icon-btn-danger"
            onClick={onLogout}
            title="Cerrar sesion demo"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// â”€â”€â”€ Sidebar (fijo a la izquierda) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CmsSidebar({
  activeModule,
  onSelect,
  isOpen,
  user,
}: {
  activeModule: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  user: CmsUser;
}) {
  return (
    <aside className={`cms-sidebar-fixed ${isOpen ? "cms-sidebar-open" : ""}`}>
      {/* Perfil mini */}
      <div className="cms-sidebar-profile">
        <div className="cms-avatar">{user.name.charAt(0)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium text-zinc-100">
              {user.name}
            </p>
            <Badge className="cms-chip shrink-0 text-[10px]">Admin</Badge>
          </div>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
      </div>

      {/* Navegacion principal */}
      <p className="cms-sidebar-section-label">Contenido</p>
      <nav className="space-y-0.5">
        {MODULES.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelect(module.id)}
              className={`cms-nav-item ${isActive ? "cms-nav-item-active" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{module.label}</span>
              {module.records > 0 && (
                <span
                  className={`cms-nav-badge ${isActive ? "cms-nav-badge-active" : ""}`}
                >
                  {module.records}
                </span>
              )}
              {isActive && (
                <ChevronRight className="h-3 w-3 shrink-0 text-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Navegacion secundaria */}
      <p className="cms-sidebar-section-label mt-5">Sistema</p>
      <nav className="space-y-0.5">
        <button
          type="button"
          className="cms-nav-item"
          onClick={() =>
            toast.info("Configuracion del sistema", {
              description:
                "Ajustes globales del CMS: roles, permisos y preferencias. Disponible en proxima iteracion.",
            })
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Configuracion</span>
        </button>
        <button
          type="button"
          className="cms-nav-item"
          onClick={() => window.open("/", "_blank", "noopener")}
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Ver portafolio</span>
        </button>
      </nav>
    </aside>
  );
}

// â”€â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LoginView({ onLogin }: { onLogin: (user: CmsUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginCms({ email, password });
      saveSession(res.access_token, res.refresh_token);
      onLogin(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-root cms-auth-shell">
      <div className="cms-auth-container">
        {/* Panel izquierdo: descripcion del sistema */}
        <div className="cms-auth-hero hidden lg:flex lg:flex-col lg:justify-between">
          <div>
            <Badge className="cms-chip">FastAPI CMS</Badge>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-zinc-100">
              Panel de administracion del portafolio
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              Panel conectado al backend real. Autenticacion JWT con renovacion
              automatica de token.
            </p>
          </div>
          <div className="space-y-2.5">
            {[
              {
                icon: ShieldCheck,
                label: "Autenticacion JWT con control de sesion",
              },
              {
                icon: Bell,
                label: "Notificaciones editoriales en tiempo real",
              },
              {
                icon: Globe,
                label: "Sincronizacion con frontend del portafolio",
              },
              {
                icon: Activity,
                label: "Historial de cambios y auditoria de acciones",
              },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="cms-feature-item">
                <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-sm text-zinc-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho: formulario */}
        <div className="cms-auth-form-panel">
          <div className="w-full max-w-sm">
            <Badge className="cms-chip mb-5">FastAPI CMS</Badge>
            <h2 className="text-2xl font-semibold text-zinc-100">Acceso CMS</h2>
            <p className="mt-1 mb-7 text-sm text-zinc-500">
              Ingresa con tus credenciales de administrador.
            </p>
            <p className="mt-1 mb-7 text-sm text-zinc-500">
              Demo visual â€” ingresa para explorar el panel.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-zinc-400">
                  Correo electronico
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="cms-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-zinc-400">
                  Contrasena
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="cms-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="cms-primary-btn mt-2 w-full"
                disabled={loading}
              >
                {loading ? "Verificando credenciales..." : "Ingresar al CMS"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryAnalyticsView() {
  return (
    <section className="cms-analytics-shell">
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
            <ChartContainer
              className="cms-chart-large"
              config={{
                visits: { label: "Visitas", color: "#2dcc85" },
                unique: { label: "Unicos", color: "#94f6cf" },
              }}
            >
              <AreaChart data={VISIT_TREND_DATA} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dcc85" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#2dcc85" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(86,109,98,0.22)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="visits" stroke="#2dcc85" strokeWidth={2} fill="url(#visitsGradient)" />
                <Area type="monotone" dataKey="unique" stroke="#94f6cf" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="cms-analytics-card-header">
            <CardTitle className="cms-analytics-title">
              Fuentes de trafico
            </CardTitle>
            <CardDescription className="cms-analytics-subtitle">
              Distribucion de origen de visitas.
            </CardDescription>
          </CardHeader>
          <CardContent className="cms-analytics-card-content">
            <ChartContainer
              className="cms-chart-medium"
              config={{
                Organico: { label: "Organico", color: "#2dcc85" },
                LinkedIn: { label: "LinkedIn", color: "#4ee9ad" },
                GitHub: { label: "GitHub", color: "#7ff3c8" },
                Directo: { label: "Directo", color: "#a6f7db" },
              }}
            >
              <PieChart>
                <Pie
                  data={TRAFFIC_SOURCE_DATA}
                  dataKey="value"
                  nameKey="source"
                  innerRadius={54}
                  outerRadius={84}
                  stroke="transparent"
                >
                  {TRAFFIC_SOURCE_DATA.map((entry) => (
                    <Cell key={entry.source} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
              </PieChart>
            </ChartContainer>
            <div className="cms-traffic-legend">
              {TRAFFIC_SOURCE_DATA.map((item) => (
                <div key={item.source} className="cms-traffic-legend-row">
                  <span className="cms-traffic-legend-key">
                    <span className="cms-traffic-dot" style={{ backgroundColor: item.fill }} />
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
              Clicks por seccion
            </CardTitle>
            <CardDescription className="cms-analytics-subtitle">
              Interacciones acumuladas por apartado del portafolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="cms-analytics-card-content">
            <ChartContainer
              className="cms-chart-large"
              config={{ clicks: { label: "Clicks", color: "#2dcc85" } }}
            >
              <BarChart data={SECTION_CLICKS_DATA} layout="vertical" margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="rgba(86,109,98,0.16)" />
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
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="cms-analytics-card-header">
            <CardTitle className="cms-analytics-title">
              Actividad por hora
            </CardTitle>
            <CardDescription className="cms-analytics-subtitle">
              Pico de trafico en horarios de mayor consulta.
            </CardDescription>
          </CardHeader>
          <CardContent className="cms-analytics-card-content">
            <div className="cms-hours-list">
              {HEATMAP_HOURS.map((item) => (
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

// â”€â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DashboardView({
  user,
  onLogout,
}: {
  user: CmsUser;
  onLogout: () => void;
}) {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const selectedModule = useMemo(
    () => MODULES.find((m) => m.id === activeModule) ?? MODULES[0],
    [activeModule],
  );

  const totalRecords = Math.max(selectedModule.records, 5);

  const allRows = useMemo(
    () =>
      Array.from({ length: totalRecords }, (_, i) => {
        const n = i + 1;
        return {
          id: n,
          title: `${selectedModule.label} #${n}`,
          status: n % 3 === 0 ? "Publicado" : "Borrador",
          updated: `Hace ${n} dia${n > 1 ? "s" : ""}`,
        };
      }),
    [selectedModule, totalRecords],
  );

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return allRows;
    const q = searchTerm.trim().toLowerCase();
    return allRows.filter((row) => row.title.toLowerCase().includes(q));
  }, [allRows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  // Reset page on module or search change
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [activeModule]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const isDashboard = selectedModule.id === "dashboard";

  const topMetrics = isDashboard
    ? [
        { label: "Visitas (7 dias)", value: "4,130", icon: Eye },
        { label: "Visitantes unicos", value: "2,599", icon: TrendingUp },
        { label: "Clicks en secciones", value: "5,490", icon: MousePointerClick },
        { label: "CTR promedio", value: "6.8%", icon: Activity },
      ]
    : [
        { label: "Secciones", value: "9", icon: LayoutGrid },
        { label: "Campos estimados", value: "64", icon: FileText },
        { label: "Flujos pendientes", value: "18", icon: Activity },
        { label: "Estado sistema", value: "Prototipo", icon: ShieldCheck },
      ];

  const handleLogout = () => {
    logoutCms(getAccessToken() ?? "", getRefreshToken() ?? undefined)
      .catch(() => {})
      .finally(() => {
        clearSession();
        onLogout();
      });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="cms-root">
        {/* Navbar fija */}
        <CmsNavbar
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        {/* Sidebar fija */}
        <CmsSidebar
          activeModule={activeModule}
          onSelect={(id) => {
            setActiveModule(id);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          user={user}
        />

        {/* Overlay de sidebar en mobile */}
        {sidebarOpen && (
          <div
            className="cms-sidebar-overlay lg:hidden"
            role="button"
            tabIndex={-1}
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="cms-main">
          {/* Cabecera de pagina */}
          <div className="cms-page-header">
            <div>
              <p className="cms-breadcrumb">CMS / {selectedModule.label}</p>
              <h1 className="text-lg font-semibold text-zinc-100">
                {selectedModule.label}
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                {selectedModule.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="cms-outline-btn h-8 text-sm"
                    onClick={() =>
                      toast.success("Borrador guardado", {
                        description:
                          "Los cambios se almacenan como borrador. No seran visibles en el portafolio publico hasta que se publiquen.",
                      })
                    }
                  >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Guardar
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="cms-tooltip">
                  Guarda los cambios como borrador sin publicarlos
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="cms-primary-btn h-8 text-sm"
                    onClick={() =>
                      toast.success("Publicado en portafolio", {
                        description:
                          "Los cambios quedarian visibles en el portafolio publico de inmediato.",
                      })
                    }
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Publicar
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="cms-tooltip">
                  Hace visibles los cambios en el portafolio publico
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Metricas */}
          <div className="cms-stats-grid">
            {topMetrics.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="cms-stat-card">
                <CardContent className="flex items-start justify-between p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-100">
                      {value}
                    </p>
                  </div>
                  <div className="cms-stat-icon">
                    <Icon className="h-4 w-4 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isDashboard ? (
            <SummaryAnalyticsView />
          ) : (
            <>
          {/* Grid principal: tabla + config */}
          <div className="cms-content-grid">
            {/* Tabla */}
            <Card className="cms-panel-card overflow-hidden">
              <CardHeader className="border-b border-zinc-800 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div style={{ marginLeft: "5px", marginTop: "5px" }}>
                    <CardTitle className="text-sm font-medium text-zinc-100">
                      Registros - {selectedModule.label}
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs text-zinc-500">
                      CRUD real en proxima iteracion.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    style={{ marginRight: "5px", marginTop: "5px" }}
                    className="cms-primary-btn h-8 text-xs"
                    onClick={() =>
                      toast.info("Nuevo registro", {
                        description: `Se abriria el formulario para crear un registro en ${selectedModule.label}.`,
                      })
                    }
                  >
                    + Nuevo
                  </Button>
                </div>
                {/* Barra de busqueda */}
                <div className="mt-3 flex gap-2">
                  <div
                    style={{ marginLeft: "5px" }}
                    className="cms-search-wrap flex-1"
                  >
                    <Search className="cms-search-icon" aria-hidden="true" />
                    <Input
                      className="cms-input cms-search-input h-8 text-sm"
                      placeholder="Buscar registros..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                  <Button
                    style={{ marginRight: "5px" }}
                    size="sm"
                    variant="outline"
                    className="cms-outline-btn h-8 text-xs"
                    onClick={() =>
                      toast.info("Filtros avanzados", {
                        description: `Filtra los registros de ${selectedModule.label} por estado, fecha o categoria. Disponible en la proxima iteracion con CRUD real.`,
                      })
                    }
                  >
                    Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="cms-table-head">
                      <tr>
                        <th className="font-medium">Titulo</th>
                        <th className="font-medium">Estado</th>
                        <th className="hidden font-medium sm:table-cell">
                          Actualizado
                        </th>
                        <th className="text-right font-medium">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row) => (
                        <tr key={row.id} className="cms-table-row">
                          <td className="text-zinc-200">{row.title}</td>
                          <td>
                            <Badge
                              className={
                                row.status === "Publicado"
                                  ? "cms-chip"
                                  : "cms-chip-draft"
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="hidden text-zinc-500 sm:table-cell">
                            {row.updated}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                style={{
                                  paddingTop: "3px",
                                  paddingBottom: "3px",
                                }}
                                size="sm"
                                variant="outline"
                                className="cms-outline-btn h-7 w-7 p-0"
                                title="Editar"
                                onClick={() =>
                                  toast.info(`Editar: ${row.title}`, {
                                    description:
                                      "El formulario de edicion estara disponible con el CRUD real.",
                                  })
                                }
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button style={{ paddingTop: "3px", paddingBottom: "3px" }}
                                size="sm"
                                variant="outline"
                                className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                                title="Eliminar"
                                onClick={() =>
                                  toast.warning(`Eliminar: ${row.title}`, {
                                    description:
                                      "La confirmacion de eliminacion estara disponible con el CRUD real.",
                                  })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="cms-table-footer">
                  <span>
                    Mostrando{" "}
                    {visibleRows.length > 0
                      ? (currentPage - 1) * PAGE_SIZE + 1
                      : 0}
                    –{Math.min(currentPage * PAGE_SIZE, filteredRows.length)} de{" "}
                    {filteredRows.length} registros
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="mr-1 text-zinc-600">
                      Pag. {currentPage}/{totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cms-outline-btn h-7 px-2 text-xs"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cms-outline-btn h-7 px-2 text-xs"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Columna derecha: config + utilidades */}
            <div className="space-y-4">
              <Card className="cms-panel-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-100">
                    Configuracion del modulo
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Campos representativos del modulo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Titulo
                    </Label>
                    <Input
                      className="cms-input h-8 text-sm"
                      value={`${selectedModule.label} principal`}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Slug
                    </Label>
                    <Input
                      className="cms-input h-8 text-sm"
                      value={selectedModule.id}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Responsable
                    </Label>
                    <Input
                      className="cms-input h-8 text-sm"
                      value={user.name}
                      readOnly
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge className="cms-chip">Pendiente de API</Badge>
                    <Badge className="cms-chip-draft">CRUD futuro</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cms-panel-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-100">
                    Utilidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <Button
                    variant="outline"
                    className="cms-outline-btn h-9 w-full justify-start text-sm"
                    onClick={() =>
                      toast.info(`Exportar ${selectedModule.label}`, {
                        description: `Se generaria un JSON/CSV con todos los registros del modulo ${selectedModule.label}.`,
                      })
                    }
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    Exportar contenido
                  </Button>
                  <Button
                    variant="outline"
                    className="cms-outline-btn h-9 w-full justify-start text-sm"
                    onClick={() =>
                      toast.info(`Ajustes de ${selectedModule.label}`, {
                        description:
                          "Configuracion avanzada de campos, validaciones y permisos. Disponible en proxima iteracion.",
                      })
                    }
                  >
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Ajustes del modulo
                  </Button>
                  <Button
                    variant="outline"
                    className="cms-outline-btn h-9 w-full justify-start text-sm"
                    onClick={() =>
                      toast.info("Centro de alertas", {
                        description:
                          "No hay alertas pendientes. Las notificaciones de cambios y errores apareceran aqui.",
                      })
                    }
                  >
                    <Bell className="mr-2 h-3.5 w-3.5" />
                    Centro de alertas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Roadmap */}
          <Card className="cms-panel-card mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-100">
                Roadmap de implementacion
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Prioridades para proximas iteraciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  task: "Conectar autenticacion JWT y renovacion de token.",
                },
                {
                  step: "02",
                  task: "CRUD real para Proyectos, Blog y Experiencia.",
                },
                { step: "03", task: "Media manager para imagenes y assets." },
                {
                  step: "04",
                  task: "Historial de cambios y auditoria de acciones.",
                },
              ].map(({ step, task }) => (
                <div key={step} className="cms-roadmap-item">
                  <span className="cms-roadmap-step">{step}</span>
                  <p className="text-sm text-zinc-300">{task}</p>
                </div>
              ))}
            </CardContent>
          </Card>
            </>
          )}
        </main>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{ className: "cms-toast" }}
        />
      </div>
    </TooltipProvider>
  );
}

// u{2500}u{2500}u{2500} Root u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}u{2500}
export default function CmsApp() {
  const [user, setUser] = useState<CmsUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken() && !getRefreshToken()) {
      setLoading(false);
      return;
    }
    httpWithAuth<{ user: CmsUser }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="cms-root flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
          Cargando CMS
        </p>
        <p className="text-sm text-zinc-400">Verificando sesion...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={(u) => setUser(u)} />;
  }

  return <DashboardView user={user} onLogout={() => setUser(null)} />;
}
