import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Award, Heart, Lightbulb, Cpu, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  createAchievementCms,
  createExperienceCms,
  createInterestCms,
  createPhilosophyCms,
  deleteAchievementCms,
  deleteExperienceCms,
  deleteInterestCms,
  deletePhilosophyCms,
  getAchievementsCms,
  getExperienceCms,
  getInterestsCms,
  getPhilosophiesCms,
  getTechnologiesCms,
  translateBatchCms,
  updateAchievementCms,
  updateExperienceCms,
  updateInterestCms,
  updatePhilosophyCms,
} from "./api";
import type {
  Achievement,
  AchievementCreate,
  Experience,
  ExperienceCreate,
  Interest,
  InterestCreate,
  Philosophy,
  PhilosophyCreate,
  Technology,
} from "./types";

const EMPTY_EXPERIENCE_FORM: ExperienceCreate = {
  position: "",
  position_en: "",
  position_en_reviewed: false,
  company: "",
  company_en: "",
  company_en_reviewed: false,
  start_date: "",
  end_date: "",
};

const EMPTY_ACHIEVEMENT_FORM: AchievementCreate = {
  title: "",
  title_en: "",
  title_en_reviewed: false,
  subtitle: "",
  subtitle_en: "",
  subtitle_en_reviewed: false,
};

const EMPTY_INTEREST_FORM: InterestCreate = {
  interest: "",
  interest_en: "",
  interest_en_reviewed: false,
};

const EMPTY_PHILOSOPHY_FORM: PhilosophyCreate = {
  philosophy: "",
  philosophy_en: "",
  philosophy_en_reviewed: false,
  image: "",
};

const TECHNOLOGY_LOGO_FALLBACKS: Record<string, string> = {
  react:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  python:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
};

function formatDateLabel(rawDate: string): string {
  if (!rawDate) return "";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });
}

function normalizeLogoUrl(rawLogo: string): string {
  const trimmed = rawLogo.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  try {
    const parsed = new URL(trimmed);

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

function CmsTechnologyLogo({ name, logo }: { name: string; logo: string }) {
  const fallbackLogo = useMemo(
    () => getLogoFallbackByTechnologyName(name),
    [name],
  );
  const normalizedLogo = useMemo(() => normalizeLogoUrl(logo), [logo]);
  const [logoSrc, setLogoSrc] = useState(normalizedLogo || fallbackLogo);

  useEffect(() => {
    setLogoSrc(normalizedLogo || fallbackLogo);
  }, [normalizedLogo, fallbackLogo]);

  if (!logoSrc) {
    return <span className="text-[10px] text-zinc-500">N/A</span>;
  }

  return (
    <img
      src={logoSrc}
      alt={name}
      className="h-6 w-6 rounded-sm object-contain bg-white p-0.5"
      loading="lazy"
      onError={() => {
        if (fallbackLogo && logoSrc !== fallbackLogo) {
          setLogoSrc(fallbackLogo);
        }
      }}
    />
  );
}

export function AboutContentView({
  onTotalRecordsChange,
}: {
  onTotalRecordsChange?: (count: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [philosophies, setPhilosophies] = useState<Philosophy[]>([]);

  const [experienceForm, setExperienceForm] = useState<ExperienceCreate>(
    EMPTY_EXPERIENCE_FORM,
  );
  const [achievementForm, setAchievementForm] = useState<AchievementCreate>(
    EMPTY_ACHIEVEMENT_FORM,
  );
  const [interestForm, setInterestForm] =
    useState<InterestCreate>(EMPTY_INTEREST_FORM);
  const [philosophyForm, setPhilosophyForm] = useState<PhilosophyCreate>(
    EMPTY_PHILOSOPHY_FORM,
  );

  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(
    null,
  );
  const [editingAchievementId, setEditingAchievementId] = useState<
    number | null
  >(null);
  const [editingInterestId, setEditingInterestId] = useState<number | null>(
    null,
  );
  const [editingPhilosophyId, setEditingPhilosophyId] = useState<number | null>(
    null,
  );

  const [savingExperience, setSavingExperience] = useState(false);
  const [savingAchievement, setSavingAchievement] = useState(false);
  const [savingInterest, setSavingInterest] = useState(false);
  const [savingPhilosophy, setSavingPhilosophy] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [techs, exp, ach, int, philo] = await Promise.all([
        getTechnologiesCms(),
        getExperienceCms(),
        getAchievementsCms(),
        getInterestsCms(),
        getPhilosophiesCms(),
      ]);
      setTechnologies(techs);
      setExperiences(exp);
      setAchievements(ach);
      setInterests(int);
      setPhilosophies(philo);
    } catch {
      toast.error("No se pudo cargar la seccion Sobre mi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const totalAboutRecords = useMemo(
    () =>
      experiences.length +
      achievements.length +
      interests.length +
      philosophies.length,
    [
      experiences.length,
      achievements.length,
      interests.length,
      philosophies.length,
    ],
  );

  useEffect(() => {
    onTotalRecordsChange?.(totalAboutRecords);
  }, [onTotalRecordsChange, totalAboutRecords]);

  const handleExperienceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !experienceForm.position.trim() ||
      !experienceForm.company.trim() ||
      !experienceForm.start_date ||
      !experienceForm.end_date
    ) {
      toast.error("Completa todos los campos de experiencia");
      return;
    }

    setSavingExperience(true);
    try {
      if (editingExperienceId) {
        await updateExperienceCms(editingExperienceId, experienceForm);
        toast.success("Experiencia actualizada");
      } else {
        await createExperienceCms(experienceForm);
        toast.success("Experiencia creada");
      }
      setExperienceForm(EMPTY_EXPERIENCE_FORM);
      setEditingExperienceId(null);
      await loadAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar experiencia",
      );
    } finally {
      setSavingExperience(false);
    }
  };

  const translateSingleField = async (
    sourceText: string,
    onApply: (translated: string) => void,
  ) => {
    const text = sourceText.trim();
    if (!text) {
      toast.error("Completa primero el campo en español");
      return;
    }

    try {
      const [result] = await translateBatchCms([{ text }]);
      if (!result || result.status !== "success") {
        toast.error("No se pudo traducir automáticamente");
        return;
      }
      onApply(result.translated_text);
      toast.success("Traducción EN generada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo traducir");
    }
  };

  const handleAchievementSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!achievementForm.title.trim() || !achievementForm.subtitle.trim()) {
      toast.error("Completa todos los campos de logro");
      return;
    }

    setSavingAchievement(true);
    try {
      if (editingAchievementId) {
        await updateAchievementCms(editingAchievementId, achievementForm);
        toast.success("Logro actualizado");
      } else {
        await createAchievementCms(achievementForm);
        toast.success("Logro creado");
      }
      setAchievementForm(EMPTY_ACHIEVEMENT_FORM);
      setEditingAchievementId(null);
      await loadAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar logro",
      );
    } finally {
      setSavingAchievement(false);
    }
  };

  const handleInterestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!interestForm.interest.trim()) {
      toast.error("Escribe un interes");
      return;
    }

    setSavingInterest(true);
    try {
      if (editingInterestId) {
        await updateInterestCms(editingInterestId, interestForm);
        toast.success("Interes actualizado");
      } else {
        await createInterestCms(interestForm);
        toast.success("Interes creado");
      }
      setInterestForm(EMPTY_INTEREST_FORM);
      setEditingInterestId(null);
      await loadAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar interes",
      );
    } finally {
      setSavingInterest(false);
    }
  };

  const handlePhilosophySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!philosophyForm.philosophy.trim()) {
      toast.error("Escribe un texto de filosofia");
      return;
    }

    setSavingPhilosophy(true);
    try {
      if (editingPhilosophyId) {
        await updatePhilosophyCms(editingPhilosophyId, philosophyForm);
        toast.success("Filosofia actualizada");
      } else {
        await createPhilosophyCms(philosophyForm);
        toast.success("Filosofia creada");
      }
      setPhilosophyForm(EMPTY_PHILOSOPHY_FORM);
      setEditingPhilosophyId(null);
      await loadAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar filosofia",
      );
    } finally {
      setSavingPhilosophy(false);
    }
  };

  const handleDelete = async (
    kind: "experience" | "achievement" | "interest" | "philosophy",
    id: number,
  ) => {
    if (
      !window.confirm("Esta accion eliminara el registro. Deseas continuar?")
    ) {
      return;
    }

    try {
      if (kind === "experience") await deleteExperienceCms(id);
      if (kind === "achievement") await deleteAchievementCms(id);
      if (kind === "interest") await deleteInterestCms(id);
      if (kind === "philosophy") await deletePhilosophyCms(id);
      toast.success("Registro eliminado");
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="cms-panel-card">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Sobre mi ({totalAboutRecords} registros)
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-zinc-500">
            Administra el contenido real de la seccion Sobre mi del portafolio.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="cms-panel-card">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
            <Cpu className="h-4 w-4" /> Habilidades tecnicas
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-zinc-500">
            Se sincronizan automaticamente con el modulo Tecnologias. No usan
            porcentajes.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-5">
          {loading ? (
            <p className="text-sm text-zinc-500">Cargando tecnologias...</p>
          ) : technologies.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No hay tecnologias. Crea al menos una en el modulo Tecnologias.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {technologies.map((technology) => (
                <div
                  key={technology.id}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                >
                  <CmsTechnologyLogo
                    name={technology.name}
                    logo={technology.logo}
                  />
                  <span className="truncate text-sm text-zinc-200">
                    {technology.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="cms-panel-card">
          <CardHeader className="border-b border-zinc-800 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Briefcase className="h-4 w-4" /> Experiencia profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <form className="space-y-2" onSubmit={handleExperienceSubmit}>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Cargo"
                value={experienceForm.position}
                onChange={(event) =>
                  setExperienceForm((prev) => ({
                    ...prev,
                    position: event.target.value,
                    position_en_reviewed: false,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-7 text-xs"
                onClick={() =>
                  void translateSingleField(
                    experienceForm.position,
                    (translated) =>
                      setExperienceForm((prev) => ({
                        ...prev,
                        position_en: translated,
                        position_en_reviewed: false,
                      })),
                  )
                }
              >
                Generar EN
              </Button>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Position (English)"
                value={experienceForm.position_en ?? ""}
                onChange={(event) =>
                  setExperienceForm((prev) => ({
                    ...prev,
                    position_en: event.target.value,
                    position_en_reviewed: false,
                  }))
                }
              />
              <div className="cms-translation-label-row">
                <span
                  className={`cms-translation-status ${experienceForm.position_en_reviewed ? "is-reviewed" : "is-draft"}`}
                >
                  {experienceForm.position_en_reviewed ? "Revisado" : "Draft"}
                </span>
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={experienceForm.position_en_reviewed ?? false}
                    onChange={(event) =>
                      setExperienceForm((prev) => ({
                        ...prev,
                        position_en_reviewed: event.target.checked,
                      }))
                    }
                  />
                  <span>Revisado</span>
                </label>
              </div>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Empresa"
                value={experienceForm.company}
                onChange={(event) =>
                  setExperienceForm((prev) => ({
                    ...prev,
                    company: event.target.value,
                    company_en_reviewed: false,
                  }))
                }
              />
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Company (English)"
                value={experienceForm.company_en ?? ""}
                onChange={(event) =>
                  setExperienceForm((prev) => ({
                    ...prev,
                    company_en: event.target.value,
                    company_en_reviewed: false,
                  }))
                }
              />
              <div className="cms-translation-label-row">
                <span
                  className={`cms-translation-status ${experienceForm.company_en_reviewed ? "is-reviewed" : "is-draft"}`}
                >
                  {experienceForm.company_en_reviewed ? "Revisado" : "Draft"}
                </span>
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={experienceForm.company_en_reviewed ?? false}
                    onChange={(event) =>
                      setExperienceForm((prev) => ({
                        ...prev,
                        company_en_reviewed: event.target.checked,
                      }))
                    }
                  />
                  <span>Revisado</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-500">Inicio</Label>
                  <Input
                    type="date"
                    className="cms-input h-9 text-sm"
                    value={experienceForm.start_date}
                    onChange={(event) =>
                      setExperienceForm((prev) => ({
                        ...prev,
                        start_date: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-500">Fin</Label>
                  <Input
                    type="date"
                    className="cms-input h-9 text-sm"
                    value={experienceForm.end_date}
                    onChange={(event) =>
                      setExperienceForm((prev) => ({
                        ...prev,
                        end_date: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="cms-primary-btn h-8 text-sm"
                  disabled={savingExperience}
                >
                  {savingExperience
                    ? "Guardando..."
                    : editingExperienceId
                      ? "Actualizar"
                      : "Agregar"}
                </Button>
                {editingExperienceId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="cms-outline-btn h-8 text-sm"
                    onClick={() => {
                      setEditingExperienceId(null);
                      setExperienceForm(EMPTY_EXPERIENCE_FORM);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
            <div className="space-y-2">
              {experiences.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Sin experiencias registradas.
                </p>
              ) : (
                experiences.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {item.position}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {item.company}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDateLabel(item.start_date)} -{" "}
                          {formatDateLabel(item.end_date)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="cms-outline-btn h-7 w-7 p-0"
                          onClick={() => {
                            setEditingExperienceId(item.id);
                            setExperienceForm({
                              position: item.position,
                              position_en: item.position_en ?? "",
                              position_en_reviewed:
                                item.position_en_reviewed ?? false,
                              company: item.company,
                              company_en: item.company_en ?? "",
                              company_en_reviewed:
                                item.company_en_reviewed ?? false,
                              start_date: item.start_date,
                              end_date: item.end_date,
                            });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                          onClick={() =>
                            void handleDelete("experience", item.id)
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="border-b border-zinc-800 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Award className="h-4 w-4" /> Logros destacados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <form className="space-y-2" onSubmit={handleAchievementSubmit}>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Titulo"
                value={achievementForm.title}
                onChange={(event) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                    title_en_reviewed: false,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-7 text-xs"
                onClick={() =>
                  void translateSingleField(
                    achievementForm.title,
                    (translated) =>
                      setAchievementForm((prev) => ({
                        ...prev,
                        title_en: translated,
                        title_en_reviewed: false,
                      })),
                  )
                }
              >
                Generar EN
              </Button>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Title (English)"
                value={achievementForm.title_en ?? ""}
                onChange={(event) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    title_en: event.target.value,
                    title_en_reviewed: false,
                  }))
                }
              />
              <div className="cms-translation-label-row">
                <span
                  className={`cms-translation-status ${achievementForm.title_en_reviewed ? "is-reviewed" : "is-draft"}`}
                >
                  {achievementForm.title_en_reviewed ? "Revisado" : "Draft"}
                </span>
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={achievementForm.title_en_reviewed ?? false}
                    onChange={(event) =>
                      setAchievementForm((prev) => ({
                        ...prev,
                        title_en_reviewed: event.target.checked,
                      }))
                    }
                  />
                  <span>Revisado</span>
                </label>
              </div>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Subtitulo"
                value={achievementForm.subtitle}
                onChange={(event) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    subtitle: event.target.value,
                    subtitle_en_reviewed: false,
                  }))
                }
              />
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Subtitle (English)"
                value={achievementForm.subtitle_en ?? ""}
                onChange={(event) =>
                  setAchievementForm((prev) => ({
                    ...prev,
                    subtitle_en: event.target.value,
                    subtitle_en_reviewed: false,
                  }))
                }
              />
              <div className="cms-translation-label-row">
                <span
                  className={`cms-translation-status ${achievementForm.subtitle_en_reviewed ? "is-reviewed" : "is-draft"}`}
                >
                  {achievementForm.subtitle_en_reviewed ? "Revisado" : "Draft"}
                </span>
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={achievementForm.subtitle_en_reviewed ?? false}
                    onChange={(event) =>
                      setAchievementForm((prev) => ({
                        ...prev,
                        subtitle_en_reviewed: event.target.checked,
                      }))
                    }
                  />
                  <span>Revisado</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  className="cms-primary-btn h-8 text-sm"
                  disabled={savingAchievement}
                >
                  {savingAchievement
                    ? "Guardando..."
                    : editingAchievementId
                      ? "Actualizar"
                      : "Agregar"}
                </Button>
                {editingAchievementId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="cms-outline-btn h-8 text-sm"
                    onClick={() => {
                      setEditingAchievementId(null);
                      setAchievementForm(EMPTY_ACHIEVEMENT_FORM);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
            <div className="space-y-2">
              {achievements.length === 0 ? (
                <p className="text-xs text-zinc-500">Sin logros registrados.</p>
              ) : (
                achievements.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {item.subtitle}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="cms-outline-btn h-7 w-7 p-0"
                          onClick={() => {
                            setEditingAchievementId(item.id);
                            setAchievementForm({
                              title: item.title,
                              title_en: item.title_en ?? "",
                              title_en_reviewed:
                                item.title_en_reviewed ?? false,
                              subtitle: item.subtitle,
                              subtitle_en: item.subtitle_en ?? "",
                              subtitle_en_reviewed:
                                item.subtitle_en_reviewed ?? false,
                            });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                          onClick={() =>
                            void handleDelete("achievement", item.id)
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="border-b border-zinc-800 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Heart className="h-4 w-4" /> Intereses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <form className="space-y-2" onSubmit={handleInterestSubmit}>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Interes"
                value={interestForm.interest}
                onChange={(event) =>
                  setInterestForm((prev) => ({
                    ...prev,
                    interest: event.target.value,
                    interest_en_reviewed: false,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-7 text-xs"
                onClick={() =>
                  void translateSingleField(
                    interestForm.interest,
                    (translated) =>
                      setInterestForm((prev) => ({
                        ...prev,
                        interest_en: translated,
                        interest_en_reviewed: false,
                      })),
                  )
                }
              >
                Generar EN
              </Button>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="Interest (English)"
                value={interestForm.interest_en ?? ""}
                onChange={(event) =>
                  setInterestForm((prev) => ({
                    ...prev,
                    interest_en: event.target.value,
                    interest_en_reviewed: false,
                  }))
                }
              />
              <div className="cms-translation-label-row">
                <span
                  className={`cms-translation-status ${interestForm.interest_en_reviewed ? "is-reviewed" : "is-draft"}`}
                >
                  {interestForm.interest_en_reviewed ? "Revisado" : "Draft"}
                </span>
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={interestForm.interest_en_reviewed ?? false}
                    onChange={(event) =>
                      setInterestForm((prev) => ({
                        ...prev,
                        interest_en_reviewed: event.target.checked,
                      }))
                    }
                  />
                  <span>Revisado</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  className="cms-primary-btn h-8 text-sm"
                  disabled={savingInterest}
                >
                  {savingInterest
                    ? "Guardando..."
                    : editingInterestId
                      ? "Actualizar"
                      : "Agregar"}
                </Button>
                {editingInterestId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="cms-outline-btn h-8 text-sm"
                    onClick={() => {
                      setEditingInterestId(null);
                      setInterestForm(EMPTY_INTEREST_FORM);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
              {interests.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Sin intereses registrados.
                </p>
              ) : (
                interests.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-200"
                  >
                    <span>{item.interest}</span>
                    <button
                      type="button"
                      className="text-zinc-400 hover:text-zinc-200"
                      aria-label={`Editar ${item.interest}`}
                      onClick={() => {
                        setEditingInterestId(item.id);
                        setInterestForm({
                          interest: item.interest,
                          interest_en: item.interest_en ?? "",
                          interest_en_reviewed:
                            item.interest_en_reviewed ?? false,
                        });
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="text-red-300 hover:text-red-200"
                      aria-label={`Eliminar ${item.interest}`}
                      onClick={() => void handleDelete("interest", item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="border-b border-zinc-800 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Lightbulb className="h-4 w-4" /> Mi filosofia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <form className="space-y-2" onSubmit={handlePhilosophySubmit}>
              <Input
                className="cms-input h-9 text-sm"
                placeholder="URL de imagen (opcional)"
                value={philosophyForm.image}
                onChange={(event) =>
                  setPhilosophyForm((prev) => ({
                    ...prev,
                    image: event.target.value,
                  }))
                }
              />
              <textarea
                className="cms-input min-h-[100px] w-full resize-y px-3 py-2 text-sm"
                placeholder="Texto de filosofia"
                value={philosophyForm.philosophy}
                onChange={(event) =>
                  setPhilosophyForm((prev) => ({
                    ...prev,
                    philosophy: event.target.value,
                    philosophy_en_reviewed: false,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                className="cms-outline-btn h-7 text-xs"
                onClick={() =>
                  void translateSingleField(
                    philosophyForm.philosophy,
                    (translated) =>
                      setPhilosophyForm((prev) => ({
                        ...prev,
                        philosophy_en: translated,
                        philosophy_en_reviewed: false,
                      })),
                  )
                }
              >
                Generar EN
              </Button>
              <textarea
                className="cms-input min-h-[100px] w-full resize-y px-3 py-2 text-sm"
                placeholder="Philosophy text (English)"
                value={philosophyForm.philosophy_en ?? ""}
                onChange={(event) =>
                  setPhilosophyForm((prev) => ({
                    ...prev,
                    philosophy_en: event.target.value,
                    philosophy_en_reviewed: false,
                  }))
                }
              />
              <div className="cms-translation-label-row">
                <span
                  className={`cms-translation-status ${philosophyForm.philosophy_en_reviewed ? "is-reviewed" : "is-draft"}`}
                >
                  {philosophyForm.philosophy_en_reviewed ? "Revisado" : "Draft"}
                </span>
                <label className="cms-translation-check">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                    checked={philosophyForm.philosophy_en_reviewed ?? false}
                    onChange={(event) =>
                      setPhilosophyForm((prev) => ({
                        ...prev,
                        philosophy_en_reviewed: event.target.checked,
                      }))
                    }
                  />
                  <span>Revisado</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  className="cms-primary-btn h-8 text-sm"
                  disabled={savingPhilosophy}
                >
                  {savingPhilosophy
                    ? "Guardando..."
                    : editingPhilosophyId
                      ? "Actualizar"
                      : "Agregar"}
                </Button>
                {editingPhilosophyId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="cms-outline-btn h-8 text-sm"
                    onClick={() => {
                      setEditingPhilosophyId(null);
                      setPhilosophyForm(EMPTY_PHILOSOPHY_FORM);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
            <div className="space-y-2">
              {philosophies.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Sin filosofias registradas.
                </p>
              ) : (
                philosophies.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3"
                  >
                    {item.image.trim() && (
                      <div className="mb-2 overflow-hidden rounded-md border border-zinc-800">
                        <img
                          src={item.image}
                          alt="Imagen filosofia"
                          className="h-24 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {item.philosophy}
                    </p>
                    <div className="mt-2 flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="cms-outline-btn h-7 w-7 p-0"
                        onClick={() => {
                          setEditingPhilosophyId(item.id);
                          setPhilosophyForm({
                            philosophy: item.philosophy,
                            philosophy_en: item.philosophy_en ?? "",
                            philosophy_en_reviewed:
                              item.philosophy_en_reviewed ?? false,
                            image: item.image,
                          });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                        onClick={() => void handleDelete("philosophy", item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cms-panel-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
          <p className="text-xs text-zinc-500">
            Esta vista alimenta directamente la seccion Sobre mi del portafolio
            publico.
          </p>
          <Badge className="cms-chip">Sincronizacion activa</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
