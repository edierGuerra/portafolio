import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowRight, MapPin, Coffee } from "lucide-react";

export function HeroSection() {
  const skills = [
    "React", "TypeScript", "Node.js", "Python", "UI/UX Design", "PostgreSQL"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-6">
      <Card className="max-w-6xl w-full">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
              <div>
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Madrid, España</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
                  Edier Andres Guerra Vargas
                </h1>
                <h2 className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6">
                  Desarrollador Full-Stack
                </h2>
                <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Apasionado por crear experiencias digitales excepcionales. Especializado 
                  en desarrollo web moderno y diseño centrado en el usuario, con más de 5 años 
                  de experiencia transformando ideas en productos digitales exitosos.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs sm:text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Ver mi trabajo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Coffee className="mr-2 h-4 w-4" />
                  Charlemos
                </Button>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-border shadow-2xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwYnVzaW5lc3N8ZW58MXx8fHwxNzU4NTUxMDg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Edier Andres Guerra Vargas - Desarrollador Full-Stack"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                  <span className="hidden sm:inline">🚀 Disponible para proyectos</span>
                  <span className="sm:hidden">🚀 Disponible</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}