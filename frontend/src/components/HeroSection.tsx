import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowRight, MapPin, Coffee } from "lucide-react";
import {
  getPublicProfile,
  getTechnologies,
  type PublicProfile,
  type Technology,
  type AvailabilityStatus,
} from "../api/profile";
import { useI18n } from "../i18n/I18nContext";

const AVAILABILITY_STYLE_CONFIG: Record<
  AvailabilityStatus,
  {
    gradient: string;
    textColor: string;
    borderColor: string;
  }
> = {
  available: {
    gradient:
      "linear-gradient(135deg, rgba(16,185,129,0.72), rgba(5,150,105,0.58))",
    textColor: "#ffffff",
    borderColor: "rgba(110,231,183,0.55)",
  },
  not_available: {
    gradient:
      "linear-gradient(135deg, rgba(244,63,94,0.72), rgba(225,29,72,0.58))",
    textColor: "#ffffff",
    borderColor: "rgba(251,113,133,0.55)",
  },
  busy: {
    gradient:
      "linear-gradient(135deg, rgba(245,158,11,0.72), rgba(217,119,6,0.58))",
    textColor: "#111827",
    borderColor: "rgba(252,211,77,0.6)",
  },
  open_to_talk: {
    gradient:
      "linear-gradient(135deg, rgba(14,165,233,0.72), rgba(2,132,199,0.58))",
    textColor: "#ffffff",
    borderColor: "rgba(125,211,252,0.55)",
  },
};

interface HeroSectionProps {
  onNavigate?: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    getPublicProfile()
      .then(setProfile)
      .catch(() => {
        /* sin fallback estático */
      });
    getTechnologies()
      .then(setTechnologies)
      .catch(() => {
        /* sin fallback estático */
      });
  }, []);

  const name = profile?.name ?? "";
  const location = profile?.location ?? "";
  const professionalProfile = profile?.professional_profile ?? "";
  const aboutMe = profile?.about_me ?? "";
  const profileImage = profile?.profile_image?.trim() ?? "";

  const availabilityKey = profile?.availability_status ?? "available";
  const availabilityStyle =
    AVAILABILITY_STYLE_CONFIG[availabilityKey] ?? AVAILABILITY_STYLE_CONFIG.available;

  const availabilityLabelMap: Record<AvailabilityStatus, string> = {
    available: t("hero.available"),
    not_available: t("hero.notAvailable"),
    busy: t("hero.busy"),
    open_to_talk: t("hero.openToTalk"),
  };

  const availabilityLabel =
    availabilityLabelMap[availabilityKey] ?? availabilityLabelMap.available;

  return (
    <div
      style={{ paddingTop: "0", paddingBottom: "0" }}
      className="min-h-screen flex items-center justify-center p-4 lg:p-6"
    >
      <Card className="max-w-6xl w-full">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
              <div>
                {location && (
                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm sm:text-base">{location}</span>
                  </div>
                )}
                {name && (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
                    {name}
                  </h1>
                )}
                {professionalProfile && (
                  <h2 className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6">
                    {professionalProfile}
                  </h2>
                )}
                {aboutMe && (
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                    {aboutMe}
                  </p>
                )}
              </div>

              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {technologies.map((technology) => (
                    <Badge
                      key={technology.id}
                      variant="secondary"
                      className="text-xs sm:text-sm"
                    >
                      {technology.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  onClick={() => onNavigate?.("projects")}
                >
                  {t("hero.viewWork")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => onNavigate?.("contact")}
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  {t("hero.letsTalk")}
                </Button>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-border shadow-2xl">
                  {profileImage ? (
                    <ImageWithFallback
                      src={profileImage}
                      alt={`${name} - ${professionalProfile}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-900/70" />
                  )}
                </div>
                <div
                  className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg"
                  style={{
                    background: availabilityStyle.gradient,
                    color: availabilityStyle.textColor,
                    border: `1px solid ${availabilityStyle.borderColor}`,
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <span>{availabilityLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
