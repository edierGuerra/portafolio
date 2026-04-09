import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ExternalLink, Calendar, Users, Github, Lock } from "lucide-react";
import { http } from "../api/http";
import "./ProjectsSection.css";
import { useI18n } from "../i18n/I18nContext";
import { localizeArrayFields } from "../i18n/dynamicI18n";

type ApiTechnology = {
  id: number;
  name: string;
  logo: string;
};

type ApiProject = {
  id: number;
  title: string;
  description: string;
  image: string;
  demo_url?: string | null;
  repository_url?: string | null;
  year: number;
  team: number;
  state: "En desarrollo" | "Completado";
  main: boolean;
  published: boolean;
  technologies?: ApiTechnology[];
};

type UiProject = {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl: string | null;
  repositoryUrl: string | null;
  status: "En desarrollo" | "Completado";
  date: string;
  team: number;
  featured: boolean;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1742072594003-abf6ca86e154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function normalizeProjectImageUrl(rawImage: string): string {
  const trimmed = rawImage.trim();
  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  // Algunos registros guardan la key con %2F; intentamos el formato de ruta esperado.
  const unescaped = trimmed.replace(/%2F/gi, "/");

  try {
    const parsed = new URL(unescaped);

    // No tocar rutas firmadas (X-Amz-*) para no invalidar la firma.
    if (/x-amz-/i.test(parsed.search)) {
      return unescaped;
    }

    const decodedPath = decodeURIComponent(parsed.pathname);
    return `${parsed.origin}${decodedPath}${parsed.search}${parsed.hash}`;
  } catch {
    return unescaped;
  }
}

function normalizeExternalUrl(rawUrl?: string | null): string | null {
  const trimmed = (rawUrl ?? "").trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Evita que el navegador lo trate como ruta relativa del sitio actual.
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function mapProjectToUi(project: ApiProject): UiProject {
  const technologies = (project.technologies ?? [])
    .map((technology) => technology.name)
    .filter(Boolean);

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    image: normalizeProjectImageUrl(project.image),
    technologies,
    demoUrl: normalizeExternalUrl(project.demo_url),
    repositoryUrl: normalizeExternalUrl(project.repository_url),
    status: project.state,
    date: String(project.year),
    team: project.team,
    featured: project.main,
  };
}

export function ProjectsSection() {
  const { language, t } = useI18n();
  const [projects, setProjects] = useState<UiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingDemoProject, setMissingDemoProject] =
    useState<UiProject | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await http<ApiProject[]>("/api/projects?published=true");
        if (!ignore) {
          const localized = localizeArrayFields(data, language, [
            "title",
            "description",
            "state",
          ]).map((project) => ({
            ...project,
            technologies: localizeArrayFields(
              (project.technologies ?? []) as Array<Record<string, unknown>>,
              language,
              ["name"],
            ) as ApiTechnology[],
          })) as ApiProject[];

          setProjects(localized.map(mapProjectToUi));
        }
      } catch {
        if (!ignore) {
          setProjects([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchProjects();
    return () => {
      ignore = true;
    };
  }, [language]);

  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured),
    [projects],
  );

  const otherProjects = useMemo(
    () => projects.filter((project) => !project.featured),
    [projects],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "En desarrollo":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: UiProject["status"]) => {
    if (language === "en") {
      return status === "Completado"
        ? t("projects.statusCompleted")
        : t("projects.statusInProgress");
    }
    return status;
  };

  const getTeamLabel = (team: number) =>
    team === 1 ? `1 ${t("projects.person")}` : `${team} ${t("projects.people")}`;

  const missingDemoDescription = missingDemoProject
    ? t("projects.noDemoDesc").replace("{title}", missingDemoProject.title)
    : "";

  return (
    <div className="section-shell min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            {t("projects.title")}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t("projects.subtitle")}
          </p>
        </div>

        {loading && (
          <div className="section-state-card section-state-card--loading text-center text-muted-foreground py-8 px-6 rounded-xl border border-border bg-card/70">
            <p>{t("projects.loading")}</p>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="section-state-card section-state-card--empty text-center text-muted-foreground py-8 px-6 rounded-xl border border-dashed border-border bg-card/60">
            <p>{t("projects.empty")}</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid gap-8">
            {/* Proyectos destacados */}
            <div className="projects-featured-grid">
              {featuredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="projects-featured-card overflow-hidden"
                >
                  <div className="projects-featured-layout">
                    <div className="projects-featured-media">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="projects-featured-image"
                      />
                    </div>
                    <div className="projects-featured-content">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-3 sm:gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {project.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              {getTeamLabel(project.team)}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold mb-3">
                          {project.title}
                        </h3>
                        <p className="projects-featured-description text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {(project.technologies.length > 0
                            ? project.technologies
                            : [t("projects.noTech")]
                          ).map((tech) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="text-xs sm:text-sm"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {project.demoUrl ? (
                          <Button className="flex-1" asChild>
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {t("projects.viewSite")}
                            </a>
                          </Button>
                        ) : (
                          <Button
                            className="flex-1 opacity-60"
                            aria-disabled="true"
                            title={t("projects.noDemoTitle")}
                            onClick={() => setMissingDemoProject(project)}
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            {t("projects.noDemo")}
                          </Button>
                        )}
                        {project.repositoryUrl && (
                          <Button className="flex-1" variant="outline" asChild>
                            <a
                              href={project.repositoryUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Github className="mr-2 h-4 w-4" />
                              {t("projects.repo")}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Otros proyectos */}
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold">
                {t("projects.other")}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {otherProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="projects-compact-card overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {project.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {getTeamLabel(project.team)}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold mb-2">{project.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {(project.technologies.length > 0
                          ? project.technologies.slice(0, 3)
                          : [t("projects.noTech")]
                        ).map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="projects-compact-actions flex gap-2">
                        {project.demoUrl ? (
                          <Button size="sm" className="projects-action-btn flex-1" asChild>
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              {t("projects.viewSite")}
                            </a>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="projects-action-btn flex-1 opacity-60"
                            aria-disabled="true"
                            title={t("projects.noDemoTitle")}
                            onClick={() => setMissingDemoProject(project)}
                          >
                            <Lock className="mr-1 h-3 w-3" />
                            {t("projects.noDemo")}
                          </Button>
                        )}
                        {project.repositoryUrl && (
                          <Button
                            size="sm"
                            className="projects-action-btn flex-1"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={project.repositoryUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Github className="mr-1 h-3 w-3" />
                              {t("projects.repoShort")}
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {missingDemoProject && (
          <div
            className="projects-demo-modal-backdrop"
            role="button"
            tabIndex={0}
            onClick={() => setMissingDemoProject(null)}
            onKeyDown={(event) => {
              if (
                event.key === "Escape" ||
                event.key === "Enter" ||
                event.key === " "
              ) {
                setMissingDemoProject(null);
              }
            }}
          >
            <div
              className="projects-demo-modal"
              role="dialog"
              aria-modal="true"
              aria-label={t("projects.noDemoTitle")}
              onClick={(event) => event.stopPropagation()}
            >
              <h4 className="projects-demo-modal-title">
                {t("projects.noDemoTitle")}
              </h4>
              <p className="projects-demo-modal-description">
                {missingDemoDescription}
              </p>
              <div className="projects-demo-modal-actions">
                <Button onClick={() => setMissingDemoProject(null)}>
                  {t("projects.understood")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
