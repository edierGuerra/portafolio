import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  lazy,
  Suspense,
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
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  CheckCheck,
  TrendingUp,
  Trash2,
  UserCircle2,
  Wrench,
} from "lucide-react";
import { Toaster, toast } from "sonner";
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
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import type {
  AvailabilityStatus,
  ContactMessageCms,
  ContactMessageReplyPayload,
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
  deleteContactMessageCms,
  getAchievementsCms,
  getContactMessagesCms,
  getContactInfoCms,
  getExperienceCms,
  getFaqCms,
  getInterestsCms,
  getPhilosophiesCms,
  createTechnologyCms,
  createProjectCms,
  getSocialNetworksCms,
  getServicesCms,
  getBlogsCms,
  deleteTechnologyCms,
  getTechnologiesCms,
  deleteProjectCms,
  getPresignedDownloadUrlCms,
  getProjects,
  loginCms,
  logoutCms,
  setProjectPublishedCms,
  replyContactMessageCms,
  updateAdminProfileCms,
  uploadAdminProfileImageCms,
  uploadProjectImageCms,
  uploadTechnologyLogoCms,
  translateBatchCms,
  updateTechnologyCms,
  updateProjectCms,
} from "./api";
import "./cms-theme.css";

const AboutContentView = lazy(() =>
  import("./AboutContentView").then((module) => ({
    default: module.AboutContentView,
  })),
);

const BlogView = lazy(() =>
  import("./BlogView").then((module) => ({
    default: module.BlogView,
  })),
);

const ConfigurationView = lazy(() =>
  import("./ConfigurationView").then((module) => ({
    default: module.ConfigurationView,
  })),
);

const ContactView = lazy(() =>
  import("./ContactView").then((module) => ({
    default: module.ContactView,
  })),
);

const FaqView = lazy(() =>
  import("./FaqView").then((module) => ({
    default: module.FaqView,
  })),
);

const ServicesView = lazy(() =>
  import("./ServicesView").then((module) => ({
    default: module.ServicesView,
  })),
);

const SummaryAnalyticsView = lazy(() =>
  import("./SummaryAnalyticsView").then((module) => ({
    default: module.SummaryAnalyticsView,
  })),
);

type ModuleItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  records: number;
  description: string;
};

type CmsNotification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  tone: "info" | "success" | "warning";
  source: "contact" | "system";
  messageId?: number;
  replyName?: string;
  replyEmail?: string;
  originalSubject?: string;
  originalMessage?: string;
  company?: string;
  budget?: string;
  replySubject?: string;
  replyBody?: string;
};

type ReplyTemplate = {
  id: string;
  label: string;
  subject: string;
  body: string;
};

const CUSTOM_REPLY_TEMPLATES_STORAGE_KEY = "cms.custom-reply-templates.v1";
const READ_NOTIFICATIONS_STORAGE_KEY = "cms.read-notifications.v1";
const DISMISSED_NOTIFICATIONS_STORAGE_KEY = "cms.dismissed-notifications.v1";

const REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: "thanks",
    label: "Agradecimiento",
    subject: "Gracias por tu mensaje",
    body: "Hola {name},\n\nGracias por escribir y compartir el contexto de tu solicitud.\n\nQuedo atento a tus comentarios para ayudarte con el siguiente paso.\n\nSaludos,",
  },
  {
    id: "quote",
    label: "Cotizacion inicial",
    subject: "Propuesta inicial para tu solicitud",
    body: "Hola {name},\n\nGracias por tu interes. Puedo prepararte una propuesta inicial con alcance, tiempos y estimacion.\n\nSi te parece, te comparto un primer borrador con base en la informacion enviada.\n\nSaludos,",
  },
  {
    id: "followup",
    label: "Solicitud de detalles",
    subject: "Necesito algunos detalles para avanzar",
    body: "Hola {name},\n\nPara darte una respuesta mas precisa, me ayudaria contar con un poco mas de detalle sobre objetivos, tiempos y presupuesto estimado.\n\nCon eso te envio una respuesta mas puntual.\n\nSaludos,",
  },
  {
    id: "meeting",
    label: "Agendar reunion",
    subject: "Coordinemos una llamada breve",
    body: "Hola {name},\n\nSi te parece, podemos coordinar una llamada breve para revisar tu requerimiento y definir los proximos pasos.\n\nComparte por favor tu disponibilidad y lo organizamos.\n\nSaludos,",
  },
];

function buildNotificationsFromContactMessages(
  messages: ContactMessageCms[],
): CmsNotification[] {
  const messageNotifications: CmsNotification[] = messages.map((message) => ({
    id: `contact-${message.id}`,
    title: `Nuevo mensaje de ${message.name}`,
    description: `${message.subject} · ${message.email}`,
    createdAt: message.created_at,
    read: false,
    tone: "info",
    source: "contact",
    messageId: message.id,
    replyName: message.name,
    replyEmail: message.email,
    originalSubject: message.subject,
    originalMessage: message.message,
    company: message.company,
    budget: message.budget,
    replySubject: `Re: ${message.subject}`,
    replyBody: `Hola ${message.name},\n\nGracias por tu mensaje.\n\nSaludos,`,
  }));

  const now = Date.now();
  const thirtyMinutesAgo = now - 30 * 60 * 1000;
  const fifteenMinutesAgo = now - 15 * 60 * 1000;

  const recent30Min = messages.filter((message) => {
    const createdAt = new Date(message.created_at).getTime();
    return Number.isFinite(createdAt) && createdAt >= thirtyMinutesAgo;
  });

  const recent15Min = messages.filter((message) => {
    const createdAt = new Date(message.created_at).getTime();
    return Number.isFinite(createdAt) && createdAt >= fifteenMinutesAgo;
  });

  const alerts: CmsNotification[] = [];

  if (recent15Min.length >= 5) {
    alerts.push({
      id: "alert-burst-15m",
      title: "Actividad inusual detectada",
      description: `Se recibieron ${recent15Min.length} mensajes en los ultimos 15 minutos.`,
      createdAt: new Date().toISOString(),
      read: false,
      tone: "warning",
      source: "system",
    });
  }

  const messagesByEmail = recent30Min.reduce<
    Record<string, ContactMessageCms[]>
  >((acc, message) => {
    const email = message.email.trim().toLowerCase();
    if (!acc[email]) {
      acc[email] = [];
    }
    acc[email].push(message);
    return acc;
  }, {});

  Object.entries(messagesByEmail).forEach(([email, groupedMessages]) => {
    if (groupedMessages.length < 3) {
      return;
    }

    const latestCreatedAt = groupedMessages
      .map((item) => item.created_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    alerts.push({
      id: `alert-repeated-${email}`,
      title: "Posible comportamiento extrano",
      description: `${groupedMessages.length} mensajes desde ${email} en menos de 30 minutos.`,
      createdAt: latestCreatedAt ?? new Date().toISOString(),
      read: false,
      tone: "warning",
      source: "system",
    });
  });

  return [...alerts, ...messageNotifications];
}

function formatNotificationTime(rawDate: string): string {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return "ahora";
  }

  const deltaMs = Date.now() - date.getTime();
  const deltaMinutes = Math.floor(deltaMs / 60000);

  if (deltaMinutes < 1) return "ahora";
  if (deltaMinutes < 60) return `hace ${deltaMinutes} min`;

  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `hace ${deltaHours} h`;

  const deltaDays = Math.floor(deltaHours / 24);
  return `hace ${deltaDays} d`;
}

function formatNotificationDate(rawDate: string): string {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

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
    label: "Sobre mi",
    icon: FileText,
    records: 0,
    description:
      "Contenido de Sobre mi: experiencia, logros, intereses y filosofia.",
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

const SYSTEM_CONFIGURATION_MODULE: ModuleItem = {
  id: "configuration",
  label: "Configuracion",
  icon: Settings,
  records: 0,
  description: "Ajustes del sistema, seguridad y preferencias del CMS.",
};

const TECHNOLOGY_LOGO_FALLBACKS: Record<string, string> = {
  react:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  python:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
};

function getLogoFallbackByTechnologyName(technologyName: string): string {
  const normalizedName = technologyName.trim().toLowerCase();

  if (normalizedName.includes("react")) {
    return TECHNOLOGY_LOGO_FALLBACKS.react;
  }

  if (normalizedName.includes("python")) {
    return TECHNOLOGY_LOGO_FALLBACKS.python;
  }

  return "";
}

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

function CmsTechnologyLogoImage({
  name,
  logo,
  className,
}: {
  name: string;
  logo: string;
  className: string;
}) {
  const fallbackLogo = useMemo(
    () => getLogoFallbackByTechnologyName(name),
    [name],
  );
  const normalizedLogo = useMemo(
    () => normalizeTechnologyLogoUrl(logo),
    [logo],
  );
  const [logoSrc, setLogoSrc] = useState(normalizedLogo || fallbackLogo);

  useEffect(() => {
    setLogoSrc(normalizedLogo || fallbackLogo);
  }, [normalizedLogo, fallbackLogo]);

  if (!logoSrc) {
    return <span className="text-[11px] text-zinc-500">N/A</span>;
  }

  return (
    <img
      src={logoSrc}
      alt={name}
      className={className}
      loading="lazy"
      onError={() => {
        if (fallbackLogo && logoSrc !== fallbackLogo) {
          setLogoSrc(fallbackLogo);
        }
      }}
    />
  );
}

// â”€â”€â”€ Navbar (fijo en la parte superior) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CmsNavbar({
  user,
  onLogout,
  onToggleSidebar,
  notifications,
  notificationsOpen,
  unreadNotifications,
  onToggleNotifications,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onDismissNotification,
  onViewContactNotification,
  onReplyContactNotification,
  onClearNotifications,
  replyingNotificationId,
}: {
  user: CmsUser;
  onLogout: () => void;
  onToggleSidebar: () => void;
  notifications: CmsNotification[];
  notificationsOpen: boolean;
  unreadNotifications: number;
  onToggleNotifications: () => void;
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationRead: (notificationId: string) => void;
  onDismissNotification: (notification: CmsNotification) => void;
  onViewContactNotification: (notification: CmsNotification) => void;
  onReplyContactNotification: (notification: CmsNotification) => void;
  onClearNotifications: () => void;
  replyingNotificationId: string | null;
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
          <div className="relative">
            <button
              type="button"
              className="cms-icon-btn relative"
              aria-label="Notificaciones"
              onClick={onToggleNotifications}
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <>
                  <span className="cms-notif-badge" aria-hidden="true" />
                  <span className="sr-only">
                    {`Tienes ${unreadNotifications} notificaciones sin leer`}
                  </span>
                </>
              )}
            </button>

            {notificationsOpen && (
              <div className="cms-notif-panel absolute right-0 z-30 mt-2 w-[340px] rounded-xl border p-3 shadow-2xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-100">
                    Centro de alertas
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cms-outline-btn h-7 px-2 text-[11px]"
                      onClick={onMarkAllNotificationsRead}
                    >
                      <CheckCheck className="mr-1 h-3.5 w-3.5" />
                      Leidas
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cms-outline-btn cms-outline-btn-danger h-7 px-2 text-[11px]"
                      onClick={onClearNotifications}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Limpiar
                    </Button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <p className="cms-notif-empty rounded-lg border p-3 text-xs text-zinc-500">
                    No hay notificaciones pendientes.
                  </p>
                ) : (
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg border p-2.5 ${
                          notification.read
                            ? "cms-notif-item"
                            : notification.tone === "warning"
                              ? "cms-notif-item--warning"
                              : notification.tone === "success"
                                ? "cms-notif-item--success"
                                : "cms-notif-item--info"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[10px] font-medium leading-snug text-zinc-100">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <p className="notifi-text-body mt-1 text-[9px] leading-relaxed text-zinc-400">
                          {notification.description}
                        </p>
                        <div className="mt-1 flex items-end justify-between gap-2">
                          <div>
                            <p className="notifi-text-time text-[9px] uppercase tracking-wide text-zinc-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                            <p className="notifi-text-date mt-0.5 text-[9px] leading-snug text-zinc-600">
                              {formatNotificationDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="cms-notif-actions mt-2">
                          {notification.read ? (
                            <span className="cms-notif-state">Leida</span>
                          ) : (
                            <button
                              type="button"
                              className="cms-notif-action-btn"
                              onClick={() =>
                                onMarkNotificationRead(notification.id)
                              }
                              title="Marcar como leida"
                            >
                              Leer
                            </button>
                          )}

                          {notification.replyEmail &&
                            notification.source === "contact" && (
                              <>
                                <button
                                  type="button"
                                  className="cms-notif-action-btn"
                                  onClick={() =>
                                    onViewContactNotification(notification)
                                  }
                                  title="Ver mensaje completo"
                                >
                                  Ver
                                </button>
                                <button
                                  type="button"
                                  className="cms-notif-action-btn cms-notif-action-btn-primary"
                                  onClick={() =>
                                    onReplyContactNotification(notification)
                                  }
                                  disabled={
                                    replyingNotificationId === notification.id
                                  }
                                  title={`Responder a ${notification.replyEmail}`}
                                >
                                  {replyingNotificationId === notification.id
                                    ? "Enviando..."
                                    : "Responder"}
                                </button>
                              </>
                            )}

                          {notification.source === "system" && (
                            <button
                              type="button"
                              className="cms-notif-action-btn cms-notif-action-btn-danger"
                              onClick={() =>
                                onDismissNotification(notification)
                              }
                              title="Eliminar notificacion"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
          className={`cms-nav-item ${activeModule === "configuration" ? "cms-nav-item-active" : ""}`}
          onClick={() => onSelect("configuration")}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Configuracion</span>
          {activeModule === "configuration" && (
            <ChevronRight className="h-3 w-3 shrink-0 text-emerald-400" />
          )}
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

function CmsModuleLoadingFallback() {
  return (
    <Card className="cms-panel-card">
      <CardContent className="p-6 text-sm text-zinc-400">
        Cargando modulo...
      </CardContent>
    </Card>
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
  title_en: "",
  description_en: "",
  state_en: "",
  title_en_reviewed: false,
  description_en_reviewed: false,
  state_en_reviewed: false,
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

            <div className="cms-translation-panel mt-1">
              <div className="cms-translation-header">
                <div>
                  <p className="cms-translation-title">Traducciones EN</p>
                  <p className="cms-translation-helper">
                    Genera traducciones automáticas y marca cuando revises.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="cms-outline-btn h-7 text-xs"
                  onClick={async () => {
                    const fieldsToTranslate = [
                      form.title,
                      form.description,
                    ].filter((f) => f && f.trim());

                    if (fieldsToTranslate.length === 0) {
                      toast.error("Completa los campos en español primero");
                      return;
                    }

                    setSaving(true);
                    try {
                      const translations = await translateBatchCms(
                        fieldsToTranslate.map((text) => ({ text })),
                      );
                      let titleEN = form.title_en;
                      let descEN = form.description_en;

                      for (let i = 0; i < translations.length; i++) {
                        if (translations[i].status === "success") {
                          if (i === 0)
                            titleEN = translations[i].translated_text;
                          if (i === 1) descEN = translations[i].translated_text;
                        }
                      }

                      setForm((f) => ({
                        ...f,
                        title_en: titleEN,
                        description_en: descEN,
                        title_en_reviewed: false,
                        description_en_reviewed: false,
                      }));

                      toast.success(
                        "Traducciones generadas. Revísalas antes de guardar.",
                      );
                    } catch {
                      toast.error("Error al traducir. Intenta manualmente.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving || uploadingImage}
                >
                  Generar EN
                </Button>
              </div>

              <div className="cms-translation-field">
                <div className="cms-translation-label-row">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Titulo EN
                  </Label>
                  {form.title_en && (
                    <span
                      className={`cms-translation-status ${form.title_en_reviewed ? "is-reviewed" : "is-draft"}`}
                    >
                      {form.title_en_reviewed ? "Revisado" : "Draft"}
                    </span>
                  )}
                </div>
                <Input
                  className="cms-input h-8 text-sm"
                  value={form.title_en ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      title_en: e.target.value,
                      title_en_reviewed: false,
                    }))
                  }
                  placeholder="English title"
                />
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={form.title_en_reviewed ?? false}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        title_en_reviewed: e.target.checked,
                      }))
                    }
                  />
                  <span>He revisado esta traducción</span>
                </label>
              </div>

              <div className="cms-translation-field">
                <div className="cms-translation-label-row">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Descripcion EN
                  </Label>
                  {form.description_en && (
                    <span
                      className={`cms-translation-status ${form.description_en_reviewed ? "is-reviewed" : "is-draft"}`}
                    >
                      {form.description_en_reviewed ? "Revisado" : "Draft"}
                    </span>
                  )}
                </div>
                <textarea
                  className="cms-input w-full rounded-md px-3 py-2 text-sm resize-none"
                  rows={3}
                  value={form.description_en ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      description_en: e.target.value,
                      description_en_reviewed: false,
                    }))
                  }
                  placeholder="English description..."
                />
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={form.description_en_reviewed ?? false}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        description_en_reviewed: e.target.checked,
                      }))
                    }
                  />
                  <span>He revisado esta traducción</span>
                </label>
              </div>
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
                          <CmsTechnologyLogoImage
                            name={technology.name}
                            logo={technology.logo}
                            className="cms-tech-preview-image"
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
                    {localLogoPreviewUrl ? (
                      <img
                        src={localLogoPreviewUrl}
                        alt={form.name || "Preview logo"}
                        className="cms-tech-preview-image"
                        loading="lazy"
                      />
                    ) : (
                      <CmsTechnologyLogoImage
                        name={form.name || "Preview logo"}
                        logo={form.logo}
                        className="cms-tech-preview-image"
                      />
                    )}
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

type AdminProfileForm = Pick<
  CmsUser,
  | "name"
  | "email"
  | "professional_profile"
  | "professional_profile_en"
  | "professional_profile_en_reviewed"
  | "location"
  | "about_me"
  | "about_me_en"
  | "about_me_en_reviewed"
  | "profile_image"
  | "availability_status"
>;

function mapUserToAdminProfileForm(user: CmsUser): AdminProfileForm {
  return {
    name: user.name,
    email: user.email,
    professional_profile: user.professional_profile,
    professional_profile_en: user.professional_profile_en ?? "",
    professional_profile_en_reviewed:
      user.professional_profile_en_reviewed ?? false,
    location: user.location,
    about_me: user.about_me,
    about_me_en: user.about_me_en ?? "",
    about_me_en_reviewed: user.about_me_en_reviewed ?? false,
    profile_image: user.profile_image,
    availability_status: user.availability_status,
  };
}

function AdminProfileView({
  user,
  onUserUpdate,
}: {
  user: CmsUser;
  onUserUpdate: (updatedUser: CmsUser) => void;
}) {
  const [form, setForm] = useState<AdminProfileForm>(() =>
    mapUserToAdminProfileForm(user),
  );
  const [saving, setSaving] = useState(false);
  const [profileImageLoadFailed, setProfileImageLoadFailed] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [isProfileImageDragActive, setIsProfileImageDragActive] =
    useState(false);
  const [pendingProfileImageFile, setPendingProfileImageFile] =
    useState<File | null>(null);
  const [localProfileImagePreviewUrl, setLocalProfileImagePreviewUrl] =
    useState<string | null>(null);

  useEffect(() => {
    setForm(mapUserToAdminProfileForm(user));
  }, [user]);

  useEffect(() => {
    setProfileImageLoadFailed(false);
  }, [form.profile_image]);

  const clearLocalProfileImagePreview = useCallback(() => {
    setLocalProfileImagePreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (localProfileImagePreviewUrl) {
        URL.revokeObjectURL(localProfileImagePreviewUrl);
      }
    };
  }, [localProfileImagePreviewUrl]);

  const hasChanges = useMemo(
    () =>
      form.name !== user.name ||
      form.email !== user.email ||
      form.professional_profile !== user.professional_profile ||
      (form.professional_profile_en ?? "") !==
        (user.professional_profile_en ?? "") ||
      (form.professional_profile_en_reviewed ?? false) !==
        (user.professional_profile_en_reviewed ?? false) ||
      form.location !== user.location ||
      form.about_me !== user.about_me ||
      (form.about_me_en ?? "") !== (user.about_me_en ?? "") ||
      (form.about_me_en_reviewed ?? false) !==
        (user.about_me_en_reviewed ?? false) ||
      form.profile_image !== user.profile_image ||
      form.availability_status !== user.availability_status ||
      pendingProfileImageFile !== null,
    [form, pendingProfileImageFile, user],
  );

  const handleChange =
    (field: keyof AdminProfileForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasChanges) {
      toast.info("Sin cambios", {
        description: "No hay modificaciones pendientes en el perfil.",
      });
      return;
    }

    setSaving(true);
    try {
      const nextForm = { ...form };

      if (pendingProfileImageFile) {
        setUploadingProfileImage(true);
        const uploaded = await uploadAdminProfileImageCms(
          pendingProfileImageFile,
        );
        nextForm.profile_image = uploaded.file_url;
        setForm((currentForm) => ({
          ...currentForm,
          profile_image: uploaded.file_url,
        }));
        setPendingProfileImageFile(null);
        clearLocalProfileImagePreview();
      }

      const response = await updateAdminProfileCms(nextForm);
      onUserUpdate(response.user);
      toast.success("Perfil actualizado", {
        description:
          "Los datos del administrador se actualizaron en el panel actual.",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo guardar el perfil",
      );
    } finally {
      setUploadingProfileImage(false);
      setSaving(false);
    }
  };

  const handleReset = () => {
    clearLocalProfileImagePreview();
    setPendingProfileImageFile(null);
    setForm(mapUserToAdminProfileForm(user));
  };

  const normalizedProfileImageUrl = form.profile_image.trim()
    ? normalizeTechnologyLogoUrl(form.profile_image)
    : "";
  const profileImagePreviewSrc =
    localProfileImagePreviewUrl || normalizedProfileImageUrl;

  const prepareProfileImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("La imagen supera el limite de 10 MB");
      return;
    }

    clearLocalProfileImagePreview();
    setLocalProfileImagePreviewUrl(URL.createObjectURL(file));
    setPendingProfileImageFile(file);
    setProfileImageLoadFailed(false);

    toast.info("Imagen lista", {
      description:
        "La imagen se subira al bucket cuando pulses Guardar perfil.",
    });
  };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    prepareProfileImageFile(selectedFile);
    event.target.value = "";
  };

  const handleProfileImageDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsProfileImageDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;

    prepareProfileImageFile(droppedFile);
  };

  return (
    <div className="cms-content-grid">
      <Card style={{ padding: "3%" }} className="cms-panel-card">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Perfil del administrador
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-zinc-500">
            Configura los datos que identifican tu perfil en el CMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-name"
                  className="text-xs uppercase tracking-wider text-zinc-500"
                >
                  Nombre
                </Label>
                <Input
                  id="admin-name"
                  className="cms-input h-9 text-sm"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Nombre de administrador"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-email"
                  className="text-xs uppercase tracking-wider text-zinc-500"
                >
                  Correo
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  className="cms-input h-9 text-sm"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="admin@dominio.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-professional-profile"
                  className="text-xs uppercase tracking-wider text-zinc-500"
                >
                  Perfil profesional
                </Label>
                <Input
                  id="admin-professional-profile"
                  className="cms-input h-9 text-sm"
                  value={form.professional_profile}
                  onChange={handleChange("professional_profile")}
                  placeholder="Ej: Full Stack Developer"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-location"
                  className="text-xs uppercase tracking-wider text-zinc-500"
                >
                  Ubicacion
                </Label>
                <Input
                  id="admin-location"
                  className="cms-input h-9 text-sm"
                  value={form.location}
                  onChange={handleChange("location")}
                  placeholder="Ciudad, Pais"
                  required
                />
              </div>
            </div>

            <div className="cms-translation-panel mt-1">
              <div className="cms-translation-header">
                <div>
                  <p className="cms-translation-title">Traducciones EN</p>
                  <p className="cms-translation-helper">
                    Puedes editarlas manualmente o generarlas automaticamente.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="cms-outline-btn h-7 text-xs"
                  onClick={async () => {
                    const fieldsToTranslate = [
                      form.professional_profile,
                      form.about_me,
                    ].filter((field) => field && field.trim());

                    if (fieldsToTranslate.length === 0) {
                      toast.error("Completa los campos en español primero");
                      return;
                    }

                    setSaving(true);
                    try {
                      const translations = await translateBatchCms(
                        fieldsToTranslate.map((text) => ({ text })),
                      );

                      const successfulTranslations = translations.filter(
                        (item) => item.status === "success",
                      );
                      if (successfulTranslations.length === 0) {
                        toast.error(
                          "No fue posible traducir automaticamente en este momento.",
                        );
                        return;
                      }

                      const nextProfessionalProfileEn =
                        translations[0]?.status === "success"
                          ? translations[0].translated_text
                          : form.professional_profile_en;
                      const nextAboutMeEn =
                        translations[1]?.status === "success"
                          ? translations[1].translated_text
                          : form.about_me_en;

                      setForm((currentForm) => ({
                        ...currentForm,
                        professional_profile_en: nextProfessionalProfileEn,
                        professional_profile_en_reviewed: false,
                        about_me_en: nextAboutMeEn,
                        about_me_en_reviewed: false,
                      }));

                      if (successfulTranslations.length < translations.length) {
                        toast.warning(
                          "Algunas traducciones fallaron. Revisa y completa manualmente.",
                        );
                      } else {
                        toast.success(
                          "Traducciones EN generadas. Revisa antes de guardar.",
                        );
                      }
                    } catch {
                      toast.error("No se pudieron generar las traducciones.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving || uploadingProfileImage}
                >
                  Generar EN
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="cms-translation-field">
                  <div className="cms-translation-label-row">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Perfil profesional EN
                    </Label>
                    {form.professional_profile_en && (
                      <span
                        className={`cms-translation-status ${form.professional_profile_en_reviewed ? "is-reviewed" : "is-draft"}`}
                      >
                        {form.professional_profile_en_reviewed
                          ? "Revisado"
                          : "Draft"}
                      </span>
                    )}
                  </div>
                  <Input
                    className="cms-input h-8 text-sm"
                    value={form.professional_profile_en ?? ""}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        professional_profile_en: event.target.value,
                        professional_profile_en_reviewed: false,
                      }))
                    }
                    placeholder="Professional profile in English"
                  />
                  <label className="cms-translation-check">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                      checked={form.professional_profile_en_reviewed ?? false}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          professional_profile_en_reviewed: event.target.checked,
                        }))
                      }
                    />
                    <span>He revisado esta traduccion</span>
                  </label>
                </div>

                <div className="cms-translation-field sm:col-span-2">
                  <div className="cms-translation-label-row">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Sobre mi EN
                    </Label>
                    {form.about_me_en && (
                      <span
                        className={`cms-translation-status ${form.about_me_en_reviewed ? "is-reviewed" : "is-draft"}`}
                      >
                        {form.about_me_en_reviewed ? "Revisado" : "Draft"}
                      </span>
                    )}
                  </div>
                  <textarea
                    className="cms-input min-h-[110px] w-full resize-y px-3 py-2 text-sm"
                    value={form.about_me_en ?? ""}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        about_me_en: event.target.value,
                        about_me_en_reviewed: false,
                      }))
                    }
                    placeholder="Short professional bio in English"
                  />
                  <label className="cms-translation-check">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                      checked={form.about_me_en_reviewed ?? false}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          about_me_en_reviewed: event.target.checked,
                        }))
                      }
                    />
                    <span>He revisado esta traduccion</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="cms-profile-image-field">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-zinc-500">
                  Vista previa
                </Label>
                <div className="cms-profile-image-preview-shell">
                  {profileImagePreviewSrc && !profileImageLoadFailed ? (
                    <img
                      src={profileImagePreviewSrc}
                      alt={form.name || "Imagen de perfil"}
                      className="cms-profile-image-preview"
                      onError={() => setProfileImageLoadFailed(true)}
                    />
                  ) : (
                    <div className="cms-profile-image-fallback">
                      <div className="cms-avatar h-14 w-14 text-lg">
                        {form.name.charAt(0) || "A"}
                      </div>
                      <p className="px-3 text-[11px] leading-relaxed text-zinc-500">
                        {form.profile_image.trim()
                          ? "No se pudo cargar la imagen"
                          : "Agrega una URL para ver la imagen"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="admin-profile-image"
                  className="text-xs uppercase tracking-wider text-zinc-500"
                >
                  Imagen de perfil
                </Label>
                <div className="cms-profile-image-control-card">
                  <div className="cms-profile-image-control-header">
                    <div>
                      <p className="cms-profile-image-title">
                        Foto principal del administrador
                      </p>
                      <p className="cms-profile-image-subtitle">
                        Selecciona una imagen desde tu PC o arrastrala aqui.
                      </p>
                    </div>
                    <Badge className="cms-chip-draft">Avatar</Badge>
                  </div>
                  <label
                    htmlFor="admin-profile-image-file"
                    className={`cms-profile-image-dropzone ${
                      isProfileImageDragActive
                        ? "cms-profile-image-dropzone-active"
                        : ""
                    } ${uploadingProfileImage ? "pointer-events-none opacity-70" : ""}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsProfileImageDragActive(true);
                    }}
                    onDragLeave={() => setIsProfileImageDragActive(false)}
                    onDrop={handleProfileImageDrop}
                  >
                    <span className="cms-profile-image-dropzone-title">
                      {uploadingProfileImage
                        ? "Subiendo imagen..."
                        : pendingProfileImageFile
                          ? `Lista para guardar: ${pendingProfileImageFile.name}`
                          : "Haz clic para seleccionar una imagen"}
                    </span>
                    <span className="cms-profile-image-dropzone-copy">
                      O arrastrala desde tu PC y sueltala aqui.
                    </span>
                    <span className="cms-profile-image-dropzone-meta">
                      JPG, PNG o WEBP. Tamano maximo: 10 MB.
                    </span>
                  </label>
                  <input
                    id="admin-profile-image-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void handleProfileImageChange(event);
                    }}
                    disabled={uploadingProfileImage || saving}
                  />
                  <div className="cms-profile-image-url-block">
                    <Label
                      htmlFor="admin-profile-image"
                      className="text-[11px] font-medium uppercase tracking-wider text-zinc-600"
                    >
                      URL de referencia
                    </Label>
                    <Input
                      id="admin-profile-image"
                      className="cms-input h-9 text-sm"
                      value={form.profile_image}
                      onChange={(event) => {
                        clearLocalProfileImagePreview();
                        setPendingProfileImageFile(null);
                        handleChange("profile_image")(event);
                      }}
                      placeholder="La URL se completa al guardar o puedes pegarla manualmente"
                      required
                    />
                  </div>

                  <div className="cms-profile-image-helper-row">
                    <p className="cms-profile-image-helper-text">
                      Usa formato cuadrado para un recorte mas limpio en el
                      avatar.
                    </p>
                    {pendingProfileImageFile && (
                      <span className="cms-profile-image-pending-badge">
                        Pendiente de guardar
                      </span>
                    )}
                  </div>

                  {profileImageLoadFailed && (
                    <p className="text-xs text-amber-400">
                      La URL actual no devolvio una imagen valida o accesible.
                    </p>
                  )}

                  <div className="cms-profile-image-actions">
                    {localProfileImagePreviewUrl && (
                      <button
                        type="button"
                        className="cms-profile-image-link"
                        onClick={() => {
                          clearLocalProfileImagePreview();
                          setPendingProfileImageFile(null);
                          setForm((currentForm) => ({
                            ...currentForm,
                            profile_image: user.profile_image,
                          }));
                        }}
                        disabled={uploadingProfileImage || saving}
                      >
                        Restaurar imagen actual
                      </button>
                    )}
                    {normalizedProfileImageUrl && !profileImageLoadFailed && (
                      <a
                        href={normalizedProfileImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cms-profile-image-link"
                      >
                        Abrir imagen en una pestana nueva
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="admin-about-me"
                className="text-xs uppercase tracking-wider text-zinc-500"
              >
                Sobre mi
              </Label>
              <textarea
                id="admin-about-me"
                className="cms-input min-h-[110px] w-full resize-y px-3 py-2 text-sm"
                value={form.about_me}
                onChange={handleChange("about_me")}
                placeholder="Descripcion profesional breve"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="admin-availability"
                className="text-xs uppercase tracking-wider text-zinc-500"
              >
                Estado de disponibilidad
              </Label>
              <Select
                value={form.availability_status}
                onValueChange={(value: string) =>
                  setForm((prev) => ({
                    ...prev,
                    availability_status: value as AvailabilityStatus,
                  }))
                }
              >
                <SelectTrigger
                  id="admin-availability"
                  className="cms-input h-9 text-sm"
                >
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">🚀 Disponible</SelectItem>
                  <SelectItem value="not_available">
                    ⛔ No disponible
                  </SelectItem>
                  <SelectItem value="busy">🔧 Trabajando</SelectItem>
                  <SelectItem value="open_to_talk">
                    💬 En conversaciones
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="submit"
                className="cms-primary-btn h-8 text-sm"
                disabled={!hasChanges || saving}
              >
                {saving ? "Guardando..." : "Guardar perfil"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-8 text-sm"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                Restablecer
              </Button>
              {hasChanges && (
                <Badge className="cms-chip-draft">Cambios pendientes</Badge>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="cms-panel-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-100">
              Vista previa
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Asi se mostraran tus datos en el panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              {profileImagePreviewSrc && !profileImageLoadFailed ? (
                <div className="cms-profile-image-mini-preview">
                  <img
                    src={profileImagePreviewSrc}
                    alt={form.name || "Imagen de perfil"}
                    className="h-full w-full object-cover"
                    onError={() => setProfileImageLoadFailed(true)}
                  />
                </div>
              ) : (
                <div className="cms-avatar">{form.name.charAt(0) || "A"}</div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {form.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{form.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>
                <span className="text-zinc-500">Rol:</span>{" "}
                {form.professional_profile}
              </p>
              <p>
                <span className="text-zinc-500">Ubicacion:</span>{" "}
                {form.location}
              </p>
              <p>
                <span className="text-zinc-500">Disponibilidad:</span>{" "}
                {{
                  available: "🚀 Disponible",
                  not_available: "⛔ No disponible",
                  busy: "🔧 Trabajando",
                  open_to_talk: "💬 En conversaciones",
                }[form.availability_status] ?? form.availability_status}
              </p>
              <p className="text-zinc-500">Bio</p>
              <p className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs leading-relaxed text-zinc-300">
                {form.about_me}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-100">
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-zinc-400">
            <p>
              Los datos de esta seccion se sincronizan con la sesion actual del
              CMS.
            </p>
            <Badge className="cms-chip">Perfil activo</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// â”€â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DashboardView({
  user,
  onLogout,
  onUserUpdate,
}: {
  user: CmsUser;
  onLogout: () => void;
  onUserUpdate: (updatedUser: CmsUser) => void;
}) {
  const [currentUser, setCurrentUser] = useState(user);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsCount, setProjectsCount] = useState(
    MODULES.find((module) => module.id === "projects")?.records ?? 0,
  );
  const [blogsCount, setBlogsCount] = useState(
    MODULES.find((module) => module.id === "blog")?.records ?? 0,
  );
  const [aboutCount, setAboutCount] = useState(
    MODULES.find((module) => module.id === "experience")?.records ?? 0,
  );
  const [technologiesCount, setTechnologiesCount] = useState(
    MODULES.find((module) => module.id === "technologies")?.records ?? 0,
  );
  const [servicesCount, setServicesCount] = useState(
    MODULES.find((module) => module.id === "services")?.records ?? 0,
  );
  const [faqCount, setFaqCount] = useState(
    MODULES.find((module) => module.id === "faq")?.records ?? 0,
  );
  const [contactCount, setContactCount] = useState(
    MODULES.find((module) => module.id === "contact")?.records ?? 0,
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CmsNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([]);
  const [replyingNotificationId, setReplyingNotificationId] = useState<
    string | null
  >(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<CmsNotification | null>(null);
  const [viewMessageModalOpen, setViewMessageModalOpen] = useState(false);
  const [viewMessageTarget, setViewMessageTarget] =
    useState<CmsNotification | null>(null);
  const [replyTemplateId, setReplyTemplateId] = useState("custom");
  const [customReplyTemplates, setCustomReplyTemplates] = useState<
    ReplyTemplate[]
  >([]);
  const [newTemplateLabel, setNewTemplateLabel] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const PAGE_SIZE = 5;

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const allReplyTemplates = useMemo(
    () => [...REPLY_TEMPLATES, ...customReplyTemplates],
    [customReplyTemplates],
  );

  const modules = useMemo(
    () =>
      MODULES.map((module) => {
        if (module.id === "projects") {
          return { ...module, records: projectsCount };
        }
        if (module.id === "blog") {
          return { ...module, records: blogsCount };
        }
        if (module.id === "experience") {
          return { ...module, records: aboutCount };
        }
        if (module.id === "technologies") {
          return { ...module, records: technologiesCount };
        }
        if (module.id === "services") {
          return { ...module, records: servicesCount };
        }
        if (module.id === "faq") {
          return { ...module, records: faqCount };
        }
        if (module.id === "contact") {
          return { ...module, records: contactCount };
        }
        return module;
      }),
    [
      projectsCount,
      blogsCount,
      aboutCount,
      technologiesCount,
      servicesCount,
      faqCount,
      contactCount,
    ],
  );

  const selectedModule = useMemo(
    () =>
      activeModule === SYSTEM_CONFIGURATION_MODULE.id
        ? SYSTEM_CONFIGURATION_MODULE
        : (modules.find((m) => m.id === activeModule) ?? modules[0]),
    [activeModule, modules],
  );

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadAboutCount = async () => {
      try {
        const [experiences, achievements, interests, philosophies] =
          await Promise.all([
            getExperienceCms(),
            getAchievementsCms(),
            getInterestsCms(),
            getPhilosophiesCms(),
          ]);

        if (!cancelled) {
          setAboutCount(
            experiences.length +
              achievements.length +
              interests.length +
              philosophies.length,
          );
        }
      } catch {
        if (!cancelled) {
          setAboutCount(0);
        }
      }
    };

    void loadAboutCount();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        CUSTOM_REPLY_TEMPLATES_STORAGE_KEY,
      );
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }

      const safeTemplates = parsed
        .filter(
          (item): item is ReplyTemplate =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as { id?: unknown }).id === "string" &&
            typeof (item as { label?: unknown }).label === "string" &&
            typeof (item as { subject?: unknown }).subject === "string" &&
            typeof (item as { body?: unknown }).body === "string",
        )
        .map((item) => ({
          id: item.id,
          label: item.label,
          subject: item.subject,
          body: item.body,
        }));

      setCustomReplyTemplates(safeTemplates);
    } catch {
      setCustomReplyTemplates([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CUSTOM_REPLY_TEMPLATES_STORAGE_KEY,
        JSON.stringify(customReplyTemplates),
      );
    } catch {
      // Si localStorage falla, seguimos permitiendo el flujo sin persistencia.
    }
  }, [customReplyTemplates]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }

      const safeIds = parsed.filter(
        (item): item is string => typeof item === "string",
      );
      setReadNotificationIds(safeIds);
    } catch {
      setReadNotificationIds([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        READ_NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(readNotificationIds),
      );
    } catch {
      // Si localStorage falla, la app sigue funcionando sin persistencia de lectura.
    }
  }, [readNotificationIds]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        DISMISSED_NOTIFICATIONS_STORAGE_KEY,
      );
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }

      const safeIds = parsed.filter(
        (item): item is string => typeof item === "string",
      );
      setDismissedNotificationIds(safeIds);
    } catch {
      setDismissedNotificationIds([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DISMISSED_NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(dismissedNotificationIds),
      );
    } catch {
      // Si localStorage falla, la app sigue funcionando sin persistencia de descartadas.
    }
  }, [dismissedNotificationIds]);

  useEffect(() => {
    let cancelled = false;

    const loadModulesCount = async () => {
      try {
        const [
          projects,
          blogs,
          technologies,
          services,
          faq,
          contacts,
          networks,
        ] = await Promise.all([
          getProjects(),
          getBlogsCms(),
          getTechnologiesCms(),
          getServicesCms(),
          getFaqCms(),
          getContactInfoCms(),
          getSocialNetworksCms(),
        ]);
        if (!cancelled) {
          setProjectsCount(projects.length);
          setBlogsCount(blogs.length);
          setTechnologiesCount(technologies.length);
          setServicesCount(services.length);
          setFaqCount(faq.length);
          setContactCount(contacts.length + networks.length);
        }
      } catch {
        // Evitar toasts intrusivos en el dashboard inicial.
      }
    };

    void loadModulesCount();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadContactNotifications = async () => {
      try {
        const messages = await getContactMessagesCms(30, true);
        if (cancelled) {
          return;
        }

        const nextNotifications =
          buildNotificationsFromContactMessages(messages);

        setNotifications((current) => {
          let persistedReadIds = new Set<string>();
          let persistedDismissedIds = new Set<string>();
          try {
            const raw = window.localStorage.getItem(
              READ_NOTIFICATIONS_STORAGE_KEY,
            );
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) {
              persistedReadIds = new Set(
                parsed.filter(
                  (item): item is string => typeof item === "string",
                ),
              );
            }
          } catch {
            persistedReadIds = new Set<string>();
          }

          try {
            const raw = window.localStorage.getItem(
              DISMISSED_NOTIFICATIONS_STORAGE_KEY,
            );
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) {
              persistedDismissedIds = new Set(
                parsed.filter(
                  (item): item is string => typeof item === "string",
                ),
              );
            }
          } catch {
            persistedDismissedIds = new Set<string>();
          }

          const previousReadMap = new Map(
            current.map((notification) => [notification.id, notification.read]),
          );

          return nextNotifications
            .filter(
              (notification) => !persistedDismissedIds.has(notification.id),
            )
            .map((notification) => ({
              ...notification,
              read:
                previousReadMap.get(notification.id) ??
                persistedReadIds.has(notification.id) ??
                false,
            }));
        });
      } catch {
        if (!cancelled) {
          setNotifications((current) => {
            const hasExistingAlert = current.some(
              (notification) =>
                notification.id === "alert-contact-fetch-failed",
            );

            if (hasExistingAlert) {
              return current;
            }

            return [
              {
                id: "alert-contact-fetch-failed",
                title: "Alerta del sistema",
                description:
                  "No fue posible obtener los mensajes de contacto en este momento.",
                createdAt: new Date().toISOString(),
                read: false,
                tone: "warning",
                source: "system",
              },
              ...current,
            ];
          });
        }
      }
    };

    void loadContactNotifications();
    const intervalId = window.setInterval(loadContactNotifications, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
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
    : activeModule === "technologies"
      ? [
          {
            label: "Tecnologias registradas",
            value: String(technologiesCount),
            icon: Cpu,
          },
          {
            label: "Proyectos en portafolio",
            value: String(projectsCount),
            icon: FolderKanban,
          },
          {
            label: "Registros sobre mi",
            value: String(aboutCount),
            icon: Briefcase,
          },
          {
            label: "Estado del modulo",
            value: "Sincronizado",
            icon: ShieldCheck,
          },
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

  const handleUserUpdate = (updatedUser: CmsUser) => {
    setCurrentUser(updatedUser);
    onUserUpdate(updatedUser);
  };

  const handleToggleNotifications = () => {
    setNotificationsOpen((open) => !open);
  };

  const handleMarkAllNotificationsRead = () => {
    const idsToMark = notifications.map((item) => item.id);
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
    setReadNotificationIds((current) => {
      const next = new Set(current);
      idsToMark.forEach((id) => next.add(id));
      return Array.from(next);
    });
    toast.success("Notificaciones marcadas como leidas");
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
    setReadNotificationIds((current) => {
      if (current.includes(notificationId)) {
        return current;
      }
      return [...current, notificationId];
    });
  };

  const handleDismissNotification = (notification: CmsNotification) => {
    if (notification.source !== "system") {
      toast.info(
        "Los mensajes de contacto solo se eliminan despues de responder",
      );
      return;
    }

    setNotifications((current) =>
      current.filter((item) => item.id !== notification.id),
    );
    setDismissedNotificationIds((current) => {
      if (current.includes(notification.id)) {
        return current;
      }
      return [...current, notification.id];
    });
    toast.success("Notificacion eliminada");
  };

  const handleClearNotifications = () => {
    const hasSystemNotifications = notifications.some(
      (item) => item.source === "system",
    );

    if (!hasSystemNotifications) {
      toast.info("No hay alertas del sistema para limpiar");
      return;
    }

    setNotifications((current) =>
      current.filter((item) => item.source === "contact"),
    );
    toast.success("Se limpiaron solo alertas del sistema");
  };

  const handleReplyContactNotification = (notification: CmsNotification) => {
    if (!notification.messageId || !notification.replyEmail) {
      toast.error("No se pudo identificar el mensaje de contacto");
      return;
    }

    markNotificationAsRead(notification.id);

    setReplyTarget(notification);
    setReplyTemplateId("custom");
    setNewTemplateLabel("");
    setReplySubject(notification.replySubject ?? "Respuesta a tu mensaje");
    setReplyBody(notification.replyBody ?? "");
    setReplyModalOpen(true);
  };

  const handleViewContactNotification = (notification: CmsNotification) => {
    if (notification.source !== "contact") {
      return;
    }

    markNotificationAsRead(notification.id);

    setViewMessageTarget(notification);
    setViewMessageModalOpen(true);
  };

  const handleViewMessageModalOpenChange = (nextOpen: boolean) => {
    setViewMessageModalOpen(nextOpen);
    if (!nextOpen) {
      setViewMessageTarget(null);
    }
  };

  const applyReplyTemplate = (
    templateId: string,
    target: CmsNotification | null,
  ) => {
    const template = allReplyTemplates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    const recipientName = target?.replyName?.trim() || "";
    const subjectBase = target?.replySubject?.trim() || "Re: Consulta";

    setReplySubject(`${subjectBase} - ${template.subject}`);
    setReplyBody(template.body.replace("{name}", recipientName || ""));
  };

  const handleReplyModalOpenChange = (nextOpen: boolean) => {
    if (replyingNotificationId) {
      return;
    }

    setReplyModalOpen(nextOpen);

    if (!nextOpen) {
      setReplyTarget(null);
      setReplyTemplateId("custom");
      setNewTemplateLabel("");
      setReplySubject("");
      setReplyBody("");
    }
  };

  const handleSaveCurrentAsTemplate = () => {
    const label = newTemplateLabel.trim();
    const subject = replySubject.trim();
    const body = replyBody.trim();

    if (label.length < 3) {
      toast.error("El nombre de la plantilla debe tener al menos 3 caracteres");
      return;
    }

    if (subject.length < 3 || body.length < 5) {
      toast.error("Completa asunto y mensaje antes de guardar la plantilla");
      return;
    }

    const existing = customReplyTemplates.find(
      (template) => template.label.toLowerCase() === label.toLowerCase(),
    );

    if (existing) {
      setCustomReplyTemplates((current) =>
        current.map((template) =>
          template.id === existing.id
            ? {
                ...template,
                label,
                subject,
                body,
              }
            : template,
        ),
      );
      setReplyTemplateId(existing.id);
      toast.success("Plantilla actualizada correctamente");
      return;
    }

    const newTemplate: ReplyTemplate = {
      id: `custom-${Date.now()}`,
      label,
      subject,
      body,
    };

    setCustomReplyTemplates((current) => [newTemplate, ...current]);
    setReplyTemplateId(newTemplate.id);
    toast.success("Plantilla guardada correctamente");
  };

  const handleDeleteSelectedTemplate = () => {
    if (!replyTemplateId.startsWith("custom-")) {
      toast.info("Selecciona una plantilla personalizada para eliminarla");
      return;
    }

    const templateToDelete = customReplyTemplates.find(
      (template) => template.id === replyTemplateId,
    );

    if (!templateToDelete) {
      return;
    }

    setCustomReplyTemplates((current) =>
      current.filter((template) => template.id !== replyTemplateId),
    );
    setReplyTemplateId("custom");
    setNewTemplateLabel("");
    toast.success(`Plantilla \"${templateToDelete.label}\" eliminada`);
  };

  const handleSubmitReplyFromModal = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!replyTarget?.messageId || !replyTarget.replyEmail) {
      toast.error("No se pudo identificar el mensaje de contacto");
      return;
    }

    const trimmedSubject = replySubject.trim();
    const trimmedBody = replyBody.trim();

    if (trimmedSubject.length < 3 || trimmedBody.length < 5) {
      toast.error("Asunto o mensaje demasiado corto");
      return;
    }

    const payload: ContactMessageReplyPayload = {
      subject: trimmedSubject,
      message: trimmedBody,
    };

    setReplyingNotificationId(replyTarget.id);
    try {
      await replyContactMessageCms(replyTarget.messageId, payload);
      await deleteContactMessageCms(replyTarget.messageId);

      setNotifications((current) =>
        current.filter((item) => item.id !== replyTarget.id),
      );

      toast.success(`Respuesta enviada a ${replyTarget.replyEmail}`);
      setReplyModalOpen(false);
      setReplyTarget(null);
      setReplyTemplateId("custom");
      setNewTemplateLabel("");
      setReplySubject("");
      setReplyBody("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la respuesta desde el CMS",
      );
    } finally {
      setReplyingNotificationId(null);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="cms-root">
        {/* Navbar fija */}
        <CmsNavbar
          user={currentUser}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          notifications={notifications}
          notificationsOpen={notificationsOpen}
          unreadNotifications={unreadNotifications}
          onToggleNotifications={handleToggleNotifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onMarkNotificationRead={markNotificationAsRead}
          onDismissNotification={handleDismissNotification}
          onViewContactNotification={handleViewContactNotification}
          onReplyContactNotification={handleReplyContactNotification}
          onClearNotifications={handleClearNotifications}
          replyingNotificationId={replyingNotificationId}
        />

        {/* Sidebar fija */}
        <CmsSidebar
          activeModule={activeModule}
          onSelect={(id) => {
            setActiveModule(id);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          user={currentUser}
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
          </div>

          {/* Metricas */}
          {!isDashboard &&
            activeModule !== "projects" &&
            activeModule !== "experience" &&
            activeModule !== "blog" &&
            activeModule !== "services" &&
            activeModule !== "faq" &&
            activeModule !== "contact" &&
            activeModule !== "configuration" &&
            activeModule !== "profile" && (
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
            <Suspense fallback={<CmsModuleLoadingFallback />}>
              <SummaryAnalyticsView />
            </Suspense>
          ) : activeModule === "projects" ? (
            <ProjectsView
              onProjectsCountChange={setProjectsCount}
              onTechnologiesCountChange={setTechnologiesCount}
            />
          ) : activeModule === "experience" ? (
            <Suspense fallback={<CmsModuleLoadingFallback />}>
              <AboutContentView onTotalRecordsChange={setAboutCount} />
            </Suspense>
          ) : activeModule === "blog" ? (
            <Suspense fallback={<CmsModuleLoadingFallback />}>
              <BlogView onBlogsCountChange={setBlogsCount} />
            </Suspense>
          ) : activeModule === "services" ? (
            <Suspense fallback={<CmsModuleLoadingFallback />}>
              <ServicesView onServicesCountChange={setServicesCount} />
            </Suspense>
          ) : activeModule === "faq" ? (
            <Suspense fallback={<CmsModuleLoadingFallback />}>
              <FaqView onFaqCountChange={setFaqCount} />
            </Suspense>
          ) : activeModule === "contact" ? (
            <Suspense fallback={<CmsModuleLoadingFallback />}>
              <ContactView onContactCountChange={setContactCount} />
            </Suspense>
          ) : activeModule === "technologies" ? (
            <TechnologiesView
              onTechnologiesCountChange={setTechnologiesCount}
            />
          ) : activeModule === "profile" ? (
            <AdminProfileView
              user={currentUser}
              onUserUpdate={handleUserUpdate}
            />
          ) : activeModule === "configuration" ? (
            <Suspense fallback={<CmsModuleLoadingFallback />}>
              <ConfigurationView
                user={currentUser}
                onUserUpdate={handleUserUpdate}
              />
            </Suspense>
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
                          value={currentUser.name}
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
                        onClick={() => handleToggleNotifications()}
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

        {replyModalOpen && (
          <div
            className="cms-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Responder mensaje"
            onClick={() => handleReplyModalOpenChange(false)}
          >
            <div
              className="cms-modal-panel"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="cms-modal-header">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    Responder mensaje
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {replyTarget?.replyEmail
                      ? `Enviando respuesta a ${replyTarget.replyEmail}`
                      : "Completa la respuesta para el contacto."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="cms-outline-btn"
                  onClick={() => handleReplyModalOpenChange(false)}
                  disabled={Boolean(replyingNotificationId)}
                >
                  Cerrar
                </Button>
              </div>

              <form className="space-y-3" onSubmit={handleSubmitReplyFromModal}>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Plantilla rapida
                  </Label>
                  <select
                    className="cms-input h-9 w-full text-sm"
                    value={replyTemplateId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setReplyTemplateId(value);
                      if (value === "custom") {
                        return;
                      }
                      applyReplyTemplate(value, replyTarget);
                    }}
                    disabled={Boolean(replyingNotificationId)}
                  >
                    <option value="custom">Personalizada</option>
                    {allReplyTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Guardar como plantilla
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      className="cms-input h-9 text-sm"
                      value={newTemplateLabel}
                      onChange={(event) =>
                        setNewTemplateLabel(event.target.value)
                      }
                      placeholder="Nombre de plantilla"
                      disabled={Boolean(replyingNotificationId)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn shrink-0"
                      onClick={handleSaveCurrentAsTemplate}
                      disabled={Boolean(replyingNotificationId)}
                    >
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn cms-outline-btn-danger shrink-0"
                      onClick={handleDeleteSelectedTemplate}
                      disabled={
                        Boolean(replyingNotificationId) ||
                        !replyTemplateId.startsWith("custom-")
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Asunto
                  </Label>
                  <Input
                    className="cms-input h-9 text-sm"
                    value={replySubject}
                    onChange={(event) => setReplySubject(event.target.value)}
                    placeholder="Asunto de la respuesta"
                    disabled={Boolean(replyingNotificationId)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Mensaje
                  </Label>
                  <Textarea
                    className="cms-input min-h-32 text-sm"
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder="Escribe tu respuesta"
                    disabled={Boolean(replyingNotificationId)}
                  />
                </div>

                <div className="cms-modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    className="cms-outline-btn"
                    onClick={() => handleReplyModalOpenChange(false)}
                    disabled={Boolean(replyingNotificationId)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="cms-primary-btn"
                    disabled={Boolean(replyingNotificationId)}
                  >
                    {replyingNotificationId
                      ? "Enviando..."
                      : "Enviar respuesta"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewMessageModalOpen && (
          <div
            className="cms-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Ver mensaje completo"
            onClick={() => handleViewMessageModalOpenChange(false)}
          >
            <div
              className="cms-modal-panel"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="cms-modal-header">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    Mensaje recibido
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {viewMessageTarget?.replyEmail
                      ? `Enviado por ${viewMessageTarget.replyEmail}`
                      : "Detalle del mensaje de contacto"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="cms-outline-btn"
                  onClick={() => handleViewMessageModalOpenChange(false)}
                >
                  Cerrar
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Nombre
                  </Label>
                  <Input
                    className="cms-input h-9 text-sm"
                    value={viewMessageTarget?.replyName ?? ""}
                    readOnly
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Correo
                  </Label>
                  <Input
                    className="cms-input h-9 text-sm"
                    value={viewMessageTarget?.replyEmail ?? ""}
                    readOnly
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Empresa
                    </Label>
                    <Input
                      className="cms-input h-9 text-sm"
                      value={viewMessageTarget?.company || "-"}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Presupuesto
                    </Label>
                    <Input
                      className="cms-input h-9 text-sm"
                      value={viewMessageTarget?.budget || "-"}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Asunto
                  </Label>
                  <Input
                    className="cms-input h-9 text-sm"
                    value={viewMessageTarget?.originalSubject ?? ""}
                    readOnly
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500">
                    Mensaje
                  </Label>
                  <Textarea
                    className="cms-input min-h-36 text-sm"
                    value={viewMessageTarget?.originalMessage ?? ""}
                    readOnly
                  />
                </div>

                <div className="cms-modal-footer">
                  <Button
                    type="button"
                    className="cms-primary-btn"
                    onClick={() => {
                      if (viewMessageTarget) {
                        handleViewMessageModalOpenChange(false);
                        handleReplyContactNotification(viewMessageTarget);
                      }
                    }}
                  >
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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

  return (
    <DashboardView
      user={user}
      onLogout={() => setUser(null)}
      onUserUpdate={setUser}
    />
  );
}
