import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  AtSign,
  Dribbble,
  Facebook,
  Figma,
  Home,
  User,
  Briefcase,
  MessageCircle,
  Music2,
  FileText,
  Mail,
  Send,
  Github,
  Linkedin,
  Twitch,
  Twitter,
  Instagram,
  Youtube,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { getSocialNetworks, type SocialNetwork } from "../api/contact";

function getSocialIcon(name: string): LucideIcon {
  const n = name.trim().toLowerCase();
  if (n.includes("github")) return Github;
  if (n.includes("linkedin")) return Linkedin;
  if (n.includes("twitter") || n.includes("x.com") || n === "x") return Twitter;
  if (n.includes("instagram")) return Instagram;
  if (n.includes("youtube")) return Youtube;
  if (n.includes("mail") || n.includes("email") || n.includes("correo")) return Mail;
  return Link2;
}

function getSocialIconFromKey(iconKey: string): LucideIcon {
  const normalized = iconKey.trim().toLowerCase();

  if (normalized === "github") return Github;
  if (normalized === "linkedin") return Linkedin;
  if (normalized === "twitter" || normalized === "x") return Twitter;
  if (normalized === "instagram") return Instagram;
  if (normalized === "facebook") return Facebook;
  if (normalized === "youtube") return Youtube;
  if (normalized === "twitch") return Twitch;
  if (normalized === "discord" || normalized === "whatsapp")
    return MessageCircle;
  if (normalized === "telegram") return Send;
  if (normalized === "tiktok") return Music2;
  if (normalized === "figma") return Figma;
  if (normalized === "dribbble") return Dribbble;
  if (normalized === "email") return Mail;
  if (normalized === "portfolio") return AtSign;
  if (normalized === "website" || normalized === "other") {
    return Link2;
  }

  return Link2;
}

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Navigation({ 
  activeSection, 
  setActiveSection, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}: NavigationProps) {
  const currentYear = new Date().getFullYear();
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSocialNetworks()
      .then((data) => { if (!cancelled) setSocialNetworks(data); })
      .catch(() => { /* fallback silente */ });
    return () => { cancelled = true; };
  }, []);

  const navItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "about", label: "Sobre mí", icon: User },
    { id: "projects", label: "Proyectos", icon: Briefcase },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "contact", label: "Contacto", icon: MessageCircle },
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const NavigationContent = () => (
    <ScrollArea className="flex-1 min-h-0 py-6">
      <div className="space-y-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavClick(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <Separator className="my-6 mx-4" />

      {socialNetworks.length > 0 && (
        <div className="px-4">
          <h4 className="mb-4 text-sm font-medium text-muted-foreground">
            Social
          </h4>
          <div className="space-y-2">
            {socialNetworks.map((network) => {
              const Icon = network.icon?.trim()
                ? getSocialIconFromKey(network.icon)
                : getSocialIcon(network.name);
              return (
                <Button
                  key={network.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={network.url} target="_blank" rel="noopener noreferrer">
                    <Icon className="mr-2 h-4 w-4" />
                    {network.name}
                  </a>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </ScrollArea>
  );

  const SidebarFooter = () => (
    <div className="border-t px-4 py-4 text-center">
      <p className="text-xs text-muted-foreground">
        © {currentYear} Portafolio. Todos los derechos reservados.
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetHeader className="px-4 py-6 border-b">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <NavigationContent />
          <SidebarFooter />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-64 h-full bg-muted/30 border-r flex flex-col">
      <NavigationContent />
      <SidebarFooter />
    </div>
  );
}