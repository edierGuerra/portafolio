import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  Bell,
  BookText,
  Briefcase,
  ChevronRight,
  Cpu,
  Eye,
  EyeOff,
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
import type {
  CmsUser,
  Project,
  ProjectCreate,
  ProjectState,
  Technology,
  TechnologyCreate,
} from "./types";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  httpWithAuth,
  saveSession,
} from "./session";
import {
  createTechnologyCms,
  createProjectCms,
  deleteTechnologyCms,
  getTechnologiesCms,
  deleteProjectCms,
  getPresignedDownloadUrlCms,
  getProjects,
  loginCms,
  logoutCms,
  setProjectPublishedCms,
  uploadProjectImageCms,
  uploadTechnologyLogoCms,
  updateTechnologyCms,
  updateProjectCms,
} from "./api";
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

function normalizeTechnologyLogoUrl(rawLogo: string): string {
  const trimmed = rawLogo.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);

    // Soporta enlaces de pagina de Wikimedia y los transforma a URL directa del archivo.
    if (
      parsed.hostname === "commons.wikimedia.org" &&
      parsed.pathname.startsWith("/wiki/File:")
    ) {
      const rawFileName = decodeURIComponent(
        parsed.pathname.replace("/wiki/File:", ""),
      );
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(rawFileName)}`;
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
}

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
            <span className="cms-brand-text">
              Panel administrativo de portafolio
            </span>
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
  modules,
}: {
  activeModule: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  user: CmsUser;
  modules: ModuleItem[];
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
        {modules.map((module) => {
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
              <AreaChart
                data={VISIT_TREND_DATA}
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
                    <stop offset="5%" stopColor="#2dcc85" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#2dcc85" stopOpacity={0.05} />
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
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="source" />}
                />
              </PieChart>
            </ChartContainer>
            <div className="cms-traffic-legend">
              {TRAFFIC_SOURCE_DATA.map((item) => (
                <div key={item.source} className="cms-traffic-legend-row">
                  <span className="cms-traffic-legend-key">
                    <span
                      className="cms-traffic-dot"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.source}
                  </span>
                  <span className="cms-traffic-legend-value">
                    {item.value}%
                  </span>
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
              <BarChart
                data={SECTION_CLICKS_DATA}
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

// --- Projects CRUD View ---

const EMPTY_PROJECT_FORM: ProjectCreate = {
  title: "",
  description: "",
  image: "",
  demo_url: "",
  repository_url: "",
  year: new Date().getFullYear(),
  team: 1,
  state: "En desarrollo",
  main: false,
  published: true,
  technology_ids: [],
};

function CmsModalShell({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="cms-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="cms-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cms-modal-header">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="cms-outline-btn h-8 px-3 text-xs"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
        <div>{children}</div>
        {footer ? <div className="cms-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function ProjectsView({
  onProjectsCountChange,
  onTechnologiesCountChange,
}: {
  onProjectsCountChange: (count: number) => void;
  onTechnologiesCountChange: (count: number) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectCreate>(EMPTY_PROJECT_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<
    string | null
  >(null);
  const [previewCandidates, setPreviewCandidates] = useState<string[]>([]);
  const [previewCandidateIndex, setPreviewCandidateIndex] = useState(0);
  const [previewLoadFailed, setPreviewLoadFailed] = useState(false);
  const [signedPreviewAttempted, setSignedPreviewAttempted] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const clearLocalImagePreview = useCallback(() => {
    setLocalImagePreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
  }, []);

  const clearPendingImageSelection = useCallback(() => {
    setPendingImageFile(null);
    clearLocalImagePreview();
  }, [clearLocalImagePreview]);

  useEffect(() => {
    return () => {
      if (localImagePreviewUrl) {
        URL.revokeObjectURL(localImagePreviewUrl);
      }
    };
  }, [localImagePreviewUrl]);

  useEffect(() => {
    if (localImagePreviewUrl) {
      setPreviewCandidates([localImagePreviewUrl]);
      setPreviewCandidateIndex(0);
      setPreviewLoadFailed(false);
      setSignedPreviewAttempted(false);
      return;
    }

    const rawUrl = form.image.trim();
    if (!rawUrl) {
      setPreviewCandidates([]);
      setPreviewCandidateIndex(0);
      setPreviewLoadFailed(false);
      setSignedPreviewAttempted(false);
      return;
    }

    const candidates = new Set<string>();
    candidates.add(rawUrl);
    candidates.add(rawUrl.replace(/%2F/gi, "/"));

    try {
      const parsed = new URL(rawUrl);

      const decodedPath = decodeURIComponent(parsed.pathname);
      candidates.add(
        `${parsed.origin}${decodedPath}${parsed.search}${parsed.hash}`,
      );

      // Fallback entre formato virtual-host y path-style de DigitalOcean Spaces.
      const hostParts = parsed.hostname.split(".");
      if (
        hostParts.length >= 3 &&
        hostParts[hostParts.length - 2] === "digitaloceanspaces"
      ) {
        const pathParts = parsed.pathname.split("/").filter(Boolean);

        // region.digitaloceanspaces.com/bucket/key -> bucket.region.digitaloceanspaces.com/key
        if (hostParts.length === 3 && pathParts.length >= 2) {
          const region = hostParts[0];
          const bucket = pathParts[0];
          const objectKey = pathParts.slice(1).join("/");
          candidates.add(
            `https://${bucket}.${region}.digitaloceanspaces.com/${objectKey}`,
          );
        }

        // bucket.region.digitaloceanspaces.com/key -> region.digitaloceanspaces.com/bucket/key
        if (hostParts.length >= 4 && pathParts.length >= 1) {
          const bucket = hostParts[0];
          const region = hostParts[1];
          const objectKey = pathParts.join("/");
          candidates.add(
            `https://${region}.digitaloceanspaces.com/${bucket}/${objectKey}`,
          );
        }
      }
    } catch {
      // Si no es URL valida, mantenemos solo el valor original.
    }

    const normalizedCandidates = Array.from(candidates).filter(Boolean);
    setPreviewCandidates(normalizedCandidates);
    setPreviewCandidateIndex(0);
    setPreviewLoadFailed(false);
    setSignedPreviewAttempted(false);
  }, [form.image, localImagePreviewUrl]);

  const load = useCallback(async () => {
    setLoadingData(true);
    try {
      const [projectsData, technologiesData] = await Promise.all([
        getProjects(),
        getTechnologiesCms(),
      ]);
      setProjects(projectsData);
      setTechnologies(technologiesData);
      onProjectsCountChange(projectsData.length);
      onTechnologiesCountChange(technologiesData.length);
    } catch {
      toast.error("Error al cargar proyectos y tecnologias");
    } finally {
      setLoadingData(false);
    }
  }, [onProjectsCountChange, onTechnologiesCountChange]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const q = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [projects, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const openCreate = () => {
    clearPendingImageSelection();
    setEditing(null);
    setForm({ ...EMPTY_PROJECT_FORM });
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    clearPendingImageSelection();
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      image: p.image,
      demo_url: p.demo_url ?? "",
      repository_url: p.repository_url ?? "",
      year: p.year,
      team: p.team,
      state: p.state,
      main: p.main,
      published: p.published,
      technology_ids: (p.technologies ?? []).map((technology) => technology.id),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Titulo y descripcion son requeridos");
      return;
    }
    setSaving(true);
    try {
      const payloadToSave: ProjectCreate = { ...form };

      if (pendingImageFile) {
        setUploadingImage(true);
        const uploaded = await uploadProjectImageCms(pendingImageFile);
        payloadToSave.image = uploaded.file_url;
        setForm((currentForm) => ({
          ...currentForm,
          image: uploaded.file_url,
        }));
        setPendingImageFile(null);
        clearLocalImagePreview();
      }

      if (editing) {
        await updateProjectCms(editing.id, payloadToSave);
        toast.success("Proyecto actualizado correctamente");
      } else {
        await createProjectCms(payloadToSave);
        toast.success("Proyecto creado correctamente");
      }
      clearPendingImageSelection();
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  const handleProjectImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      event.target.value = "";
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      toast.error("La imagen supera el limite de 10 MB");
      event.target.value = "";
      return;
    }

    clearLocalImagePreview();
    const nextLocalPreviewUrl = URL.createObjectURL(selectedFile);
    setLocalImagePreviewUrl(nextLocalPreviewUrl);

    setPendingImageFile(selectedFile);
    event.target.value = "";
    toast.info("Imagen lista. Se subira cuando guardes el proyecto.");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProjectCms(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" eliminado`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublished = async (project: Project) => {
    setPublishingId(project.id);
    try {
      const updated = await setProjectPublishedCms(
        project.id,
        !project.published,
      );
      setProjects((prevProjects) =>
        prevProjects.map((currentProject) =>
          currentProject.id === project.id ? updated : currentProject,
        ),
      );
      toast.success(
        updated.published ? "Proyecto publicado" : "Proyecto despublicado",
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado de publicacion",
      );
    } finally {
      setPublishingId(null);
    }
  };

  const mainCount = projects.filter((p) => p.main).length;
  const devCount = projects.filter((p) => p.state === "En desarrollo").length;
  const doneCount = projects.filter((p) => p.state === "Completado").length;
  const previewImageSrc = previewCandidates[previewCandidateIndex] || "";

  const extractObjectKeyFromImageUrl = (imageUrl: string): string | null => {
    try {
      const parsed = new URL(imageUrl);
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const hostParts = parsed.hostname.split(".");

      if (
        hostParts.length >= 4 &&
        hostParts[hostParts.length - 2] === "digitaloceanspaces"
      ) {
        if (pathParts.length > 0) {
          return decodeURIComponent(pathParts.join("/"));
        }
      }

      if (
        hostParts.length >= 3 &&
        hostParts[hostParts.length - 2] === "digitaloceanspaces"
      ) {
        if (pathParts.length >= 2) {
          return decodeURIComponent(pathParts.slice(1).join("/"));
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  const trySignedPreviewFallback = async () => {
    if (signedPreviewAttempted || localImagePreviewUrl || !form.image.trim()) {
      setPreviewLoadFailed(true);
      return;
    }

    const objectKey = extractObjectKeyFromImageUrl(form.image.trim());
    if (!objectKey) {
      setPreviewLoadFailed(true);
      return;
    }

    setSignedPreviewAttempted(true);
    try {
      const signed = await getPresignedDownloadUrlCms(objectKey, 900);
      setPreviewCandidates([signed.download_url]);
      setPreviewCandidateIndex(0);
      setPreviewLoadFailed(false);
    } catch {
      setPreviewLoadFailed(true);
    }
  };

  const handlePreviewImageError = () => {
    if (previewCandidateIndex < previewCandidates.length - 1) {
      setPreviewCandidateIndex((index) => index + 1);
      return;
    }
    void trySignedPreviewFallback();
  };

  return (
    <div className="space-y-4">
      <div className="cms-stats-grid">
        {[
          {
            label: "Total proyectos",
            value: String(projects.length),
            icon: FolderKanban,
          },
          { label: "Destacados", value: String(mainCount), icon: Sparkles },
          { label: "En desarrollo", value: String(devCount), icon: Activity },
          { label: "Completados", value: String(doneCount), icon: ShieldCheck },
        ].map(({ label, value, icon: Icon }) => (
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

      <Card className="cms-panel-card overflow-hidden">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <div style={{ marginLeft: "5px", marginTop: "5px" }}>
              <CardTitle className="text-sm font-medium text-zinc-100">
                Proyectos ({filtered.length})
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-zinc-500">
                Gestiona los proyectos visibles en el portafolio.
              </CardDescription>
            </div>
            <Button
              size="sm"
              style={{ marginRight: "5px", marginTop: "5px" }}
              className="cms-primary-btn h-8 text-xs"
              onClick={openCreate}
            >
              + Nuevo
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <div
              style={{ marginLeft: "5px" }}
              className="cms-search-wrap flex-1"
            >
              <Search className="cms-search-icon" aria-hidden="true" />
              <Input
                className="cms-input cms-search-input h-8 text-sm"
                placeholder="Buscar por titulo o descripcion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              Cargando proyectos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              {searchTerm
                ? "Sin resultados para la busqueda."
                : "No hay proyectos aun. Crea el primero."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="cms-table-head">
                  <tr>
                    <th className="font-medium">Titulo</th>
                    <th className="hidden font-medium sm:table-cell">
                      Publicado
                    </th>
                    <th className="font-medium">Estado</th>
                    <th className="hidden font-medium sm:table-cell">Año</th>
                    <th className="hidden font-medium md:table-cell">Equipo</th>
                    <th className="hidden font-medium lg:table-cell">
                      Destacado
                    </th>
                    <th className="text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((project) => (
                    <tr key={project.id} className="cms-table-row">
                      <td
                        className="text-zinc-200 max-w-[200px] truncate"
                        title={project.title}
                      >
                        {project.title}
                      </td>
                      <td className="hidden sm:table-cell">
                        <Badge
                          className={
                            project.published ? "cms-chip" : "cms-chip-draft"
                          }
                        >
                          {project.published ? "Si" : "No"}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          className={
                            project.state === "Completado"
                              ? "cms-chip"
                              : "cms-chip-draft"
                          }
                        >
                          {project.state}
                        </Badge>
                      </td>
                      <td className="hidden text-zinc-400 sm:table-cell">
                        {project.year}
                      </td>
                      <td className="hidden text-zinc-400 md:table-cell">
                        {project.team}{" "}
                        {project.team === 1 ? "persona" : "personas"}
                      </td>
                      <td className="hidden lg:table-cell">
                        {project.main ? (
                          <Badge className="cms-chip text-[10px]">Si</Badge>
                        ) : (
                          <span className="text-zinc-600 text-xs">No</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            style={{ paddingTop: "3px", paddingBottom: "3px" }}
                            size="sm"
                            variant="outline"
                            className="cms-outline-btn h-7 w-7 p-0"
                            title={
                              project.published ? "Despublicar" : "Publicar"
                            }
                            aria-label={
                              project.published ? "Despublicar" : "Publicar"
                            }
                            disabled={publishingId === project.id}
                            onClick={() => handleTogglePublished(project)}
                          >
                            {publishingId === project.id ? (
                              <Eye className="h-3.5 w-3.5 opacity-50" />
                            ) : project.published ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            style={{ paddingTop: "3px", paddingBottom: "3px" }}
                            size="sm"
                            variant="outline"
                            className="cms-outline-btn h-7 w-7 p-0"
                            title="Editar"
                            onClick={() => openEdit(project)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            style={{ paddingTop: "3px", paddingBottom: "3px" }}
                            size="sm"
                            variant="outline"
                            className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                            title="Eliminar"
                            onClick={() => setDeleteTarget(project)}
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
          )}
          {!loadingData && filtered.length > 0 && (
            <div className="cms-table-footer">
              <span>
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} de{" "}
                {filtered.length} registros
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
          )}
        </CardContent>
      </Card>

      {dialogOpen && (
        <CmsModalShell
          title={editing ? "Editar proyecto" : "Nuevo proyecto"}
          description={
            editing
              ? `Modificando: ${editing.title}`
              : "Completa los campos para agregar un proyecto al portafolio."
          }
          onClose={() => {
            if (!saving && !uploadingImage) {
              clearPendingImageSelection();
              setDialogOpen(false);
            }
          }}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-8 text-sm"
                onClick={() => {
                  clearPendingImageSelection();
                  setDialogOpen(false);
                }}
                disabled={saving || uploadingImage}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="cms-primary-btn h-8 text-sm"
                onClick={handleSave}
                disabled={saving || uploadingImage}
              >
                {saving
                  ? "Guardando..."
                  : editing
                    ? "Guardar cambios"
                    : "Crear proyecto"}
              </Button>
            </>
          }
        >
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Titulo <span className="text-red-400">*</span>
              </Label>
              <Input
                className="cms-input h-8 text-sm"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Ej. Portfolio personal"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Descripcion <span className="text-red-400">*</span>
              </Label>
              <textarea
                className="cms-input w-full rounded-md px-3 py-2 text-sm resize-none"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Breve descripcion del proyecto..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Imagen del proyecto
              </Label>
              <Input
                className="cms-input h-8 text-sm"
                value={form.image}
                onChange={(e) => {
                  clearPendingImageSelection();
                  setForm((f) => ({ ...f, image: e.target.value }));
                }}
                placeholder="Se completa al subir o pega una URL manual"
              />
              <div className="pt-1">
                <input
                  type="file"
                  accept="image/*"
                  className="cms-input h-9 w-full rounded-md px-3 py-1.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-xs file:font-medium file:text-zinc-950"
                  onChange={handleProjectImageChange}
                  disabled={uploadingImage || saving}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  {uploadingImage
                    ? "Subiendo imagen..."
                    : pendingImageFile
                      ? `Lista para subir al guardar: ${pendingImageFile.name}`
                      : "Formatos recomendados: JPG, PNG, WEBP (max 10 MB)."}
                </p>
              </div>
              {previewImageSrc && (
                <div className="mt-2 mx-auto max-w-xs overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/40">
                  <img
                    src={previewImageSrc}
                    alt="Preview de imagen del proyecto"
                    className="h-28 w-full object-cover"
                    loading="lazy"
                    onError={handlePreviewImageError}
                  />
                </div>
              )}
              {previewLoadFailed && (
                <p className="mt-2 text-xs text-amber-300">
                  No se pudo cargar la preview con la URL actual. Revisa que el
                  objeto exista y sea publico.
                </p>
              )}
              {form.image && (
                <a
                  href={form.image}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex pt-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Ver imagen cargada
                </a>
              )}
              {pendingImageFile && (
                <button
                  type="button"
                  className="inline-flex pt-1 text-xs text-zinc-400 hover:text-zinc-200"
                  onClick={() => {
                    clearPendingImageSelection();
                  }}
                  disabled={saving || uploadingImage}
                >
                  Quitar imagen seleccionada
                </button>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Enlace demo
              </Label>
              <Input
                className="cms-input h-8 text-sm"
                value={form.demo_url ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, demo_url: e.target.value }))
                }
                placeholder="https://tu-demo.com"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Enlace repositorio
              </Label>
              <Input
                className="cms-input h-8 text-sm"
                value={form.repository_url ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, repository_url: e.target.value }))
                }
                placeholder="https://github.com/usuario/repositorio"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider text-zinc-500">
                  Año
                </Label>
                <Input
                  type="number"
                  className="cms-input h-8 text-sm"
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: Number(e.target.value) }))
                  }
                  min={2000}
                  max={2100}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider text-zinc-500">
                  Equipo (personas)
                </Label>
                <Input
                  type="number"
                  className="cms-input h-8 text-sm"
                  value={form.team}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, team: Number(e.target.value) }))
                  }
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Estado
              </Label>
              <select
                className="cms-input h-9 w-full rounded-md px-3 text-sm"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    state: e.target.value as ProjectState,
                  }))
                }
              >
                <option value="En desarrollo">En desarrollo</option>
                <option value="Completado">Completado</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Tecnologias
              </Label>
              {technologies.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No hay tecnologias registradas. Crea una en el modulo de
                  Tecnologias.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 rounded-md border border-zinc-800 bg-zinc-950/30 p-2">
                  {technologies.map((technology) => {
                    const checked = form.technology_ids.includes(technology.id);
                    return (
                      <label
                        key={technology.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-900/60"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                          checked={checked}
                          onChange={(e) => {
                            setForm((currentForm) => {
                              const nextTechnologyIds = e.target.checked
                                ? [...currentForm.technology_ids, technology.id]
                                : currentForm.technology_ids.filter(
                                    (technologyId) =>
                                      technologyId !== technology.id,
                                  );

                              return {
                                ...currentForm,
                                technology_ids: nextTechnologyIds,
                              };
                            });
                          }}
                        />
                        <span className="truncate">{technology.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="project-main"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                checked={form.main}
                onChange={(e) =>
                  setForm((f) => ({ ...f, main: e.target.checked }))
                }
              />
              <Label
                htmlFor="project-main"
                className="text-sm text-zinc-300 cursor-pointer"
              >
                Proyecto destacado (aparece en portada)
              </Label>
            </div>
          </div>
        </CmsModalShell>
      )}

      {deleteTarget && (
        <CmsModalShell
          title="Eliminar proyecto"
          description={`Se eliminara permanentemente "${deleteTarget.title}". Esta accion no se puede deshacer.`}
          onClose={() => {
            if (!deleting) setDeleteTarget(null);
          }}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-8 text-sm"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn cms-outline-btn-danger h-8 text-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </>
          }
        >
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-400">
            Confirma esta accion solo si el proyecto ya no debe mostrarse en el
            portafolio ni en el CMS.
          </div>
        </CmsModalShell>
      )}
    </div>
  );
}

const EMPTY_TECHNOLOGY_FORM: TechnologyCreate = {
  name: "",
  logo: "",
};

function TechnologiesView({
  onTechnologiesCountChange,
}: {
  onTechnologiesCountChange: (count: number) => void;
}) {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Technology | null>(null);
  const [form, setForm] = useState<TechnologyCreate>(EMPTY_TECHNOLOGY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [localLogoPreviewUrl, setLocalLogoPreviewUrl] = useState<string | null>(
    null,
  );
  const [isLogoDragOver, setIsLogoDragOver] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Technology | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedLogoIds, setExpandedLogoIds] = useState<
    Record<number, boolean>
  >({});
  const [copiedLogoId, setCopiedLogoId] = useState<number | null>(null);

  const clearLocalLogoPreview = useCallback(() => {
    setLocalLogoPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
  }, []);

  const clearPendingLogoSelection = useCallback(() => {
    setPendingLogoFile(null);
    clearLocalLogoPreview();
  }, [clearLocalLogoPreview]);

  useEffect(() => {
    return () => {
      if (localLogoPreviewUrl) {
        URL.revokeObjectURL(localLogoPreviewUrl);
      }
    };
  }, [localLogoPreviewUrl]);

  const load = useCallback(async () => {
    setLoadingData(true);
    try {
      const data = await getTechnologiesCms();
      setTechnologies(data);
      onTechnologiesCountChange(data.length);
    } catch {
      toast.error("Error al cargar tecnologias");
    } finally {
      setLoadingData(false);
    }
  }, [onTechnologiesCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return technologies;
    const q = searchTerm.toLowerCase();
    return technologies.filter(
      (technology) =>
        technology.name.toLowerCase().includes(q) ||
        technology.logo.toLowerCase().includes(q),
    );
  }, [technologies, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const openCreate = () => {
    clearPendingLogoSelection();
    setEditing(null);
    setForm({ ...EMPTY_TECHNOLOGY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (technology: Technology) => {
    clearPendingLogoSelection();
    setEditing(technology);
    setForm({ name: technology.name, logo: technology.logo });
    setDialogOpen(true);
  };

  const processTechnologyLogoFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      toast.error("La imagen supera el limite de 10 MB");
      return;
    }

    clearLocalLogoPreview();
    setLocalLogoPreviewUrl(URL.createObjectURL(selectedFile));
    setPendingLogoFile(selectedFile);
    toast.info("Logo listo. Se subira cuando guardes la tecnologia.");
  };

  const handleTechnologyLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    processTechnologyLogoFile(selectedFile);
    event.target.value = "";
  };

  const handleTechnologyLogoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLogoDragOver(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;

    processTechnologyLogoFile(droppedFile);
  };

  const handleSave = async () => {
    if (!form.name.trim() || (!form.logo.trim() && !pendingLogoFile)) {
      toast.error("Nombre y logo son requeridos");
      return;
    }

    setSaving(true);
    try {
      const payloadToSave: TechnologyCreate = { ...form };

      if (pendingLogoFile) {
        setUploadingLogo(true);
        const uploaded = await uploadTechnologyLogoCms(pendingLogoFile);
        payloadToSave.logo = uploaded.file_url;
        setForm((currentForm) => ({
          ...currentForm,
          logo: uploaded.file_url,
        }));
        clearPendingLogoSelection();
      }

      if (editing) {
        await updateTechnologyCms(editing.id, payloadToSave);
        toast.success("Tecnologia actualizada correctamente");
      } else {
        await createTechnologyCms(payloadToSave);
        toast.success("Tecnologia creada correctamente");
      }

      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setUploadingLogo(false);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteTechnologyCms(deleteTarget.id);
      toast.success(`\"${deleteTarget.name}\" eliminada`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLogo = async (technology: Technology) => {
    const logoUrl = technology.logo.trim();
    if (!logoUrl) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(logoUrl);
      } else {
        const fallbackInput = document.createElement("textarea");
        fallbackInput.value = logoUrl;
        fallbackInput.style.position = "fixed";
        fallbackInput.style.opacity = "0";
        document.body.appendChild(fallbackInput);
        fallbackInput.select();
        document.execCommand("copy");
        document.body.removeChild(fallbackInput);
      }

      setCopiedLogoId(technology.id);
      toast.success("Enlace copiado al portapapeles");
      window.setTimeout(() => {
        setCopiedLogoId((currentValue) =>
          currentValue === technology.id ? null : currentValue,
        );
      }, 1500);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="cms-panel-card overflow-hidden">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <div style={{ marginLeft: "5px", marginTop: "5px" }}>
              <CardTitle className="text-sm font-medium text-zinc-100">
                Tecnologias ({filtered.length})
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-zinc-500">
                Gestiona el stack disponible para asociar a proyectos.
              </CardDescription>
            </div>
            <Button
              size="sm"
              style={{ marginRight: "5px", marginTop: "5px" }}
              className="cms-primary-btn h-8 text-xs"
              onClick={openCreate}
            >
              + Nueva
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <div
              style={{ marginLeft: "5px" }}
              className="cms-search-wrap flex-1"
            >
              <Search className="cms-search-icon" aria-hidden="true" />
              <Input
                className="cms-input cms-search-input h-8 text-sm"
                placeholder="Buscar por nombre o URL del logo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              Cargando tecnologias...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              {searchTerm
                ? "Sin resultados para la busqueda."
                : "No hay tecnologias aun. Crea la primera."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="cms-table-head">
                  <tr>
                    <th className="font-medium">Nombre</th>
                    <th className="font-medium text-center">Logo</th>
                    <th className="font-medium cms-tech-preview-col-header">
                      Preview
                    </th>
                    <th className="text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((technology) => (
                    <tr key={technology.id} className="cms-table-row">
                      <td
                        className="text-zinc-200 max-w-[220px] truncate"
                        title={technology.name}
                      >
                        {technology.name}
                      </td>
                      <td
                        className="cms-tech-logo-cell"
                        title={technology.logo}
                      >
                        <a
                          href={normalizeTechnologyLogoUrl(technology.logo)}
                          target="_blank"
                          rel="noreferrer"
                          className={`cms-tech-logo-url ${expandedLogoIds[technology.id] ? "cms-tech-logo-url-expanded" : ""} ${copiedLogoId === technology.id ? "cms-tech-logo-url-copied" : ""}`}
                          onClick={() => handleCopyLogo(technology)}
                          title="Click para abrir el enlace y copiar URL"
                        >
                          {technology.logo}
                        </a>
                        {technology.logo.length > 68 && (
                          <button
                            type="button"
                            className="cms-tech-logo-toggle"
                            onClick={() =>
                              setExpandedLogoIds((currentState) => ({
                                ...currentState,
                                [technology.id]: !currentState[technology.id],
                              }))
                            }
                          >
                            {expandedLogoIds[technology.id]
                              ? "Ver menos"
                              : "Ver mas"}
                          </button>
                        )}
                      </td>
                      <td className="cms-tech-preview-col-cell">
                        <div className="cms-tech-preview-wrap">
                          <img
                            src={normalizeTechnologyLogoUrl(technology.logo)}
                            alt={technology.name}
                            className="cms-tech-preview-image"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            style={{ paddingTop: "3px", paddingBottom: "3px" }}
                            size="sm"
                            variant="outline"
                            className="cms-outline-btn h-7 w-7 p-0"
                            title="Editar"
                            onClick={() => openEdit(technology)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            style={{ paddingTop: "3px", paddingBottom: "3px" }}
                            size="sm"
                            variant="outline"
                            className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                            title="Eliminar"
                            onClick={() => setDeleteTarget(technology)}
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
          )}
          {!loadingData && filtered.length > 0 && (
            <div className="cms-table-footer">
              <span>
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} de{" "}
                {filtered.length} registros
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
          )}
        </CardContent>
      </Card>

      {dialogOpen && (
        <CmsModalShell
          title={editing ? "Editar tecnologia" : "Nueva tecnologia"}
          description={
            editing
              ? `Modificando: ${editing.name}`
              : "Completa los campos para agregar una tecnologia al inventario."
          }
          onClose={() => {
            if (!saving && !uploadingLogo) {
              clearPendingLogoSelection();
              setDialogOpen(false);
            }
          }}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-8 text-sm"
                onClick={() => {
                  clearPendingLogoSelection();
                  setDialogOpen(false);
                }}
                disabled={saving || uploadingLogo}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="cms-primary-btn h-8 text-sm"
                onClick={handleSave}
                disabled={saving || uploadingLogo}
              >
                {saving || uploadingLogo
                  ? "Guardando..."
                  : editing
                    ? "Guardar cambios"
                    : "Crear tecnologia"}
              </Button>
            </>
          }
        >
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Nombre <span className="text-red-400">*</span>
              </Label>
              <Input
                className="cms-input h-8 text-sm"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ej. React"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                URL del logo <span className="text-red-400">*</span>
              </Label>
              <Input
                className="cms-input h-8 text-sm"
                value={form.logo}
                onChange={(e) => {
                  clearPendingLogoSelection();
                  setForm((f) => ({ ...f, logo: e.target.value }));
                }}
                placeholder="https://..."
              />
              <div
                className={`cms-upload-dropzone ${isLogoDragOver ? "cms-upload-dropzone-active" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsLogoDragOver(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsLogoDragOver(false);
                }}
                onDrop={handleTechnologyLogoDrop}
              >
                <p className="text-xs text-zinc-400">
                  Arrastra una imagen aqui o selecciona un archivo.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="cms-upload-file-input"
                  onChange={handleTechnologyLogoChange}
                  disabled={saving || uploadingLogo}
                />
                <p className="text-[11px] text-zinc-500">
                  {uploadingLogo
                    ? "Subiendo logo..."
                    : pendingLogoFile
                      ? `Archivo listo para subir: ${pendingLogoFile.name}`
                      : "PNG, JPG, WEBP o SVG (max 10 MB)."}
                </p>
              </div>
              {(localLogoPreviewUrl || form.logo.trim()) && (
                <div className="pt-2">
                  <div className="cms-tech-preview-form-wrap">
                    <img
                      src={
                        localLogoPreviewUrl ||
                        normalizeTechnologyLogoUrl(form.logo)
                      }
                      alt={form.name || "Preview logo"}
                      className="cms-tech-preview-image"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
              {pendingLogoFile && (
                <button
                  type="button"
                  className="inline-flex pt-1 text-xs text-zinc-400 hover:text-zinc-200"
                  onClick={() => clearPendingLogoSelection()}
                  disabled={saving || uploadingLogo}
                >
                  Quitar logo seleccionado
                </button>
              )}
            </div>
          </div>
        </CmsModalShell>
      )}

      {deleteTarget && (
        <CmsModalShell
          title="Eliminar tecnologia"
          description={`Se eliminara permanentemente \"${deleteTarget.name}\". Esta accion no se puede deshacer.`}
          onClose={() => {
            if (!deleting) setDeleteTarget(null);
          }}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-8 text-sm"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn cms-outline-btn-danger h-8 text-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </>
          }
        >
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-400">
            Si esta tecnologia estaba asociada a proyectos, revisa esos
            proyectos para reasignar su stack cuando sea necesario.
          </div>
        </CmsModalShell>
      )}
    </div>
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
  const [projectsCount, setProjectsCount] = useState(
    MODULES.find((module) => module.id === "projects")?.records ?? 0,
  );
  const [technologiesCount, setTechnologiesCount] = useState(
    MODULES.find((module) => module.id === "technologies")?.records ?? 0,
  );
  const PAGE_SIZE = 5;

  const modules = useMemo(
    () =>
      MODULES.map((module) => {
        if (module.id === "projects") {
          return { ...module, records: projectsCount };
        }
        if (module.id === "technologies") {
          return { ...module, records: technologiesCount };
        }
        return module;
      }),
    [projectsCount, technologiesCount],
  );

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === activeModule) ?? modules[0],
    [activeModule, modules],
  );

  useEffect(() => {
    let cancelled = false;

    const loadProjectsCount = async () => {
      try {
        const [projects, technologies] = await Promise.all([
          getProjects(),
          getTechnologiesCms(),
        ]);
        if (!cancelled) {
          setProjectsCount(projects.length);
          setTechnologiesCount(technologies.length);
        }
      } catch {
        // Mantenemos el valor actual si falla la carga del contador.
      }
    };

    void loadProjectsCount();

    return () => {
      cancelled = true;
    };
  }, []);

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
        {
          label: "Clicks en secciones",
          value: "5,490",
          icon: MousePointerClick,
        },
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
          modules={modules}
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
          {activeModule !== "projects" && (
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
          )}

          {isDashboard ? (
            <SummaryAnalyticsView />
          ) : activeModule === "projects" ? (
            <ProjectsView
              onProjectsCountChange={setProjectsCount}
              onTechnologiesCountChange={setTechnologiesCount}
            />
          ) : activeModule === "technologies" ? (
            <TechnologiesView
              onTechnologiesCountChange={setTechnologiesCount}
            />
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
                        <Search
                          className="cms-search-icon"
                          aria-hidden="true"
                        />
                        <Input
                          className="cms-input cms-search-input h-8 text-sm"
                          placeholder="Buscar registros..."
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
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
                                  <Button
                                    style={{
                                      paddingTop: "3px",
                                      paddingBottom: "3px",
                                    }}
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
                        –
                        {Math.min(currentPage * PAGE_SIZE, filteredRows.length)}{" "}
                        de {filteredRows.length} registros
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
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
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
                    {
                      step: "03",
                      task: "Media manager para imagenes y assets.",
                    },
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
