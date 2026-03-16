import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { BlogSection } from "./components/BlogSection";
import { ContactSection } from "./components/ContactSection";

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

export default function App() {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
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
        return <AboutSection />;
      case "projects":
        return <ProjectsSection />;
      case "blog":
        return <BlogSection />;
      case "contact":
        return <ContactSection />;
      default:
        return <HeroSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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

        <main className="flex-1 min-h-screen">{renderActiveSection()}</main>
      </div>
    </div>
  );
}