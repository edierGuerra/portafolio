import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { trackPageView, trackSectionView } from "./analytics/tracker";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { I18nProvider } from "./i18n/I18nContext";

const AboutSection = lazy(() =>
  import("./components/AboutSection").then((module) => ({
    default: module.AboutSection,
  })),
);

const ProjectsSection = lazy(() =>
  import("./components/ProjectsSection").then((module) => ({
    default: module.ProjectsSection,
  })),
);

const BlogSection = lazy(() =>
  import("./components/BlogSection").then((module) => ({
    default: module.BlogSection,
  })),
);

const ContactSection = lazy(() =>
  import("./components/ContactSection").then((module) => ({
    default: module.ContactSection,
  })),
);

const VALID_SECTIONS = ["home", "about", "projects", "blog", "contact"];

function isValidSection(section: string): boolean {
  return VALID_SECTIONS.includes(section);
}

function readSectionFromHash(): string | null {
  const hashValue = window.location.hash.replace(/^#/, "").trim();
  return isValidSection(hashValue) ? hashValue : null;
}

function getInitialSection(): string {
  const sectionFromHash = readSectionFromHash();
  if (sectionFromHash) return sectionFromHash;

  const sectionFromStorage = localStorage.getItem("activeSection") ?? "";
  if (isValidSection(sectionFromStorage)) return sectionFromStorage;

  return "home";
}

function SectionLoadingFallback() {
  return (
    <div className="section-shell min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-xl border border-border bg-card/70 p-8 text-center text-muted-foreground">
          Cargando seccion...
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageViewFired = useRef(false);
  const isHomeSection = activeSection === "home";

  // Registrar visita inicial (una sola vez por session)
  useEffect(() => {
    if (!pageViewFired.current) {
      pageViewFired.current = true;
      trackPageView();
    }
  }, []);

  // Registrar qué sección está viendo el visitante
  useEffect(() => {
    trackSectionView(activeSection);
  }, [activeSection]);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);

    const nextHash = `#${activeSection}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }, [activeSection]);

  useEffect(() => {
    const handleHashChange = () => {
      const sectionFromHash = readSectionFromHash();
      if (sectionFromHash) {
        setActiveSection((currentSection) =>
          currentSection === sectionFromHash ? currentSection : sectionFromHash,
        );
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "home":
        return <HeroSection onNavigate={setActiveSection} />;
      case "about":
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <AboutSection />
          </Suspense>
        );
      case "projects":
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <ProjectsSection />
          </Suspense>
        );
      case "blog":
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <BlogSection />
          </Suspense>
        );
      case "contact":
        return (
          <Suspense fallback={<SectionLoadingFallback />}>
            <ContactSection />
          </Suspense>
        );
      default:
        return <HeroSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <I18nProvider>
      <div
        className={
          isHomeSection
            ? "app-root app-root--home bg-background text-foreground"
            : "app-root bg-background text-foreground"
        }
      >
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>

        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <div className="flex">
          {/* Desktop Navigation */}
          <div
            className="hidden lg:block self-start"
            style={{
              position: "sticky",
              top: "4rem",
              height: "calc(100vh - 4rem)",
            }}
          >
            <Navigation
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          {/* Mobile Navigation */}
          <Navigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isMobile={true}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          <main
            id="contenido-principal"
            className={
              isHomeSection
                ? "app-main app-main--home portfolio-main"
                : "app-main portfolio-main"
            }
          >
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}
