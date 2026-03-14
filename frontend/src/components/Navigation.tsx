import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Home, User, Briefcase, MessageCircle, FileText, Mail, Github, Linkedin, Twitter } from "lucide-react";

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
  const navItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "about", label: "Sobre mí", icon: User },
    { id: "projects", label: "Proyectos", icon: Briefcase },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "contact", label: "Contacto", icon: MessageCircle },
  ];

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "mailto:contacto@ejemplo.com", label: "Email" },
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const NavigationContent = () => (
    <ScrollArea className="h-full py-6">
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
      
      <div className="px-4">
        <h4 className="mb-4 text-sm font-medium text-muted-foreground">Social</h4>
        <div className="space-y-2">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </a>
              </Button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-4 py-6 border-b">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <NavigationContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-64 h-screen bg-muted/30 border-r">
      <NavigationContent />
    </div>
  );
}