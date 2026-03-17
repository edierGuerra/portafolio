import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getPublicProfile } from "../api/profile";
import { Moon, Sun, Download, Globe, Menu } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({ darkMode, toggleDarkMode, mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const [language, setLanguage] = useState("es");
  const [cvUrl, setCvUrl] = useState("");

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-lg lg:text-xl font-semibold">Portfolio</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Language selector - hidden on small screens */}
          <div className="hidden sm:block">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-24 lg:w-32">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="h-9 w-9"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {cvUrl ? (
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">CV</span>
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:flex" disabled>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">CV</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}