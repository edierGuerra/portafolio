import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Award, Target, Heart } from "lucide-react";
import {
  getAchievements,
  getExperience,
  getInterests,
  getPhilosophies,
  type Achievement,
  type Experience,
  type Interest,
  type Philosophy,
} from "../api/about";
import {
  getPublicProfile,
  getTechnologies,
  type Technology,
} from "../api/profile";
import { useI18n } from "../i18n/I18nContext";
import { localizeArrayFields, localizeObjectFields } from "../i18n/dynamicI18n";

const TECHNOLOGY_LOGO_FALLBACKS: Record<string, string> = {
  react:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  python:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
};

function formatDateLabel(rawDate: string, locale: string): string {
  if (!rawDate) return "";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString(locale, {
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

function TechnologyLogo({ name, logo }: { name: string; logo: string }) {
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
    return <span className="text-[11px] text-muted-foreground">N/A</span>;
  }

  return (
    <img
      src={logoSrc}
      alt={name}
      className="h-full w-full object-contain"
      loading="lazy"
      onError={() => {
        if (fallbackLogo && logoSrc !== fallbackLogo) {
          setLogoSrc(fallbackLogo);
        }
      }}
    />
  );
}

export function AboutSection() {
  const [loading, setLoading] = useState(true);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [philosophies, setPhilosophies] = useState<Philosophy[]>([]);
  const [aboutMe, setAboutMe] = useState("");
  const { t, locale, language } = useI18n();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [profile, techs, exp, ach, ints, philo] = await Promise.all([
          getPublicProfile(),
          getTechnologies(),
          getExperience(),
          getAchievements(),
          getInterests(),
          getPhilosophies(),
        ]);

        if (cancelled) return;
        const localizedProfile = localizeObjectFields(profile, language, [
          "name",
          "professional_profile",
          "about_me",
          "location",
        ]);

        setAboutMe(localizedProfile.about_me ?? "");
        setTechnologies(localizeArrayFields(techs, language, ["name"]));
        setExperience(
          localizeArrayFields(exp, language, ["position", "company"]),
        );
        setAchievements(
          localizeArrayFields(ach, language, ["title", "subtitle"]),
        );
        setInterests(localizeArrayFields(ints, language, ["interest"]));
        setPhilosophies(localizeArrayFields(philo, language, ["philosophy"]));
      } catch {
        if (!cancelled) {
          setTechnologies([]);
          setExperience([]);
          setAchievements([]);
          setInterests([]);
          setPhilosophies([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const primaryPhilosophy = useMemo(() => philosophies[0], [philosophies]);
  const philosophyImage = primaryPhilosophy?.image?.trim() ?? "";
  const philosophyText = primaryPhilosophy?.philosophy?.trim() ?? "";

  return (
    <div className="section-shell min-h-screen p-4 lg:p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            {t("about.title")}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t("about.subtitle")}
          </p>
          {aboutMe && (
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
              {aboutMe}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-5 w-5" />
                  {t("about.experience")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {loading ? (
                  <p className="text-sm text-muted-foreground">
                    {t("about.loadingExperience")}
                  </p>
                ) : experience.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("about.emptyExperience")}
                  </p>
                ) : (
                  experience.map((job) => (
                    <div
                      key={job.id}
                      className="relative pl-6 border-l-2 border-primary/20 last:border-l-0"
                    >
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                      <div className="mb-1">
                        <h4 className="font-semibold text-base sm:text-lg">
                          {job.position}
                        </h4>
                        <p className="text-primary text-sm sm:text-base">
                          {job.company}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDateLabel(job.start_date, locale)} -{" "}
                          {formatDateLabel(job.end_date, locale)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Target className="h-5 w-5" />
                  {t("about.skills")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">
                    {t("about.loadingTech")}
                  </p>
                ) : technologies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("about.emptyTech")}
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {technologies.map((technology) => (
                      <div
                        key={technology.id}
                        className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/70 px-3 py-2"
                      >
                        <div className="h-8 w-8 rounded-md bg-muted/40 p-1 flex items-center justify-center">
                          <TechnologyLogo
                            name={technology.name}
                            logo={technology.logo}
                          />
                        </div>
                        <span className="text-sm sm:text-base font-medium truncate">
                          {technology.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                {philosophyImage ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-6">
                    <ImageWithFallback
                      src={philosophyImage}
                      alt="Imagen de filosofia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <h3 className="font-semibold mb-3 text-base sm:text-lg">
                  {t("about.philosophy")}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {philosophyText ||
                    t("about.philosophyFallback")}
                </p>
              </CardContent>
            </Card>

            {(loading || achievements.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Award className="h-5 w-5" />
                    {t("about.achievements")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">
                      {t("about.loadingAchievements")}
                    </p>
                  ) : (
                    achievements.map((achievement) => (
                      <div key={achievement.id} className="text-sm">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          {achievement.subtitle}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Heart className="h-5 w-5" />
                  {t("about.interests")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">
                    {t("about.loadingInterests")}
                  </p>
                ) : interests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("about.emptyInterests")}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {interest.interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
