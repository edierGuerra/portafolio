import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getPublicProfile } from "../api/profile";
import { Moon, Sun, Download, Globe, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({ darkMode, toggleDarkMode, mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const [cvUrl, setCvUrl] = useState("");
  const { language, setLanguage, t } = useI18n();

  useEffect(() => {
    let cancelled = false;

    getPublicProfile()
      .then((profile) => {
        if (!cancelled) {
          setCvUrl(profile.cv_file?.trim() ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCvUrl("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="portfolio-header sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container portfolio-header-inner flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="portfolio-icon-btn lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("nav.navigation")}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-sheet"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="portfolio-brand flex items-center space-x-2">
            <h1 className="portfolio-brand-title text-lg lg:text-xl font-semibold">{t("header.portfolio")}</h1>
          </div>
        </div>
        
        <div className="portfolio-header-actions flex items-center space-x-2 lg:space-x-4">
          {/* Language selector - hidden on small screens */}
          <div className="hidden sm:block">
            <Select value={language} onValueChange={(value) => setLanguage(value as "es" | "en") }>
              <SelectTrigger className="portfolio-select-trigger w-24 lg:w-32">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{t("header.languageSpanish")}</SelectItem>
                <SelectItem value="en">{t("header.languageEnglish")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="portfolio-icon-btn h-9 w-9"
            aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {cvUrl ? (
            <Button variant="outline" size="sm" className="portfolio-cv-btn hidden sm:flex" asChild>
              <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">{t("header.cv")}</span>
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="portfolio-cv-btn hidden sm:flex" disabled>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">{t("header.cv")}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}