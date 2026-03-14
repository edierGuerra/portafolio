import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Award, Target, Heart } from "lucide-react";

export function AboutSection() {
  const experience = [
    { company: "TechCorp", role: "Senior Full-Stack Developer", period: "2022 - Presente", duration: "2 años" },
    { company: "StartupXYZ", role: "Frontend Developer", period: "2020 - 2022", duration: "2 años" },
    { company: "DesignStudio", role: "UI/UX Designer", period: "2019 - 2020", duration: "1 año" },
  ];

  const skills = [
    { name: "JavaScript/TypeScript", level: 95 },
    { name: "React/Next.js", level: 90 },
    { name: "Node.js/Express", level: 85 },
    { name: "UI/UX Design", level: 80 },
    { name: "Python/Django", level: 75 },
    { name: "AWS/DevOps", level: 70 },
  ];

  const interests = [
    "Inteligencia Artificial", "Diseño Sostenible", "Tecnologías Emergentes", 
    "Fotografía", "Viajes", "Café de Especialidad"
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Sobre mí</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Descubre mi trayectoria profesional, habilidades técnicas y lo que me motiva como desarrollador
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Historia Profesional */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-5 w-5" />
                  Experiencia Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {experience.map((job, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-primary/20 last:border-l-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full"></div>
                    <div className="mb-2">
                      <h4 className="font-semibold text-base sm:text-lg">{job.role}</h4>
                      <p className="text-primary text-sm sm:text-base">{job.company}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{job.period} • {job.duration}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Target className="h-5 w-5" />
                  Habilidades Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm sm:text-base">{skill.name}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Información Personal */}
          <div className="space-y-6 order-1 lg:order-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="aspect-square rounded-lg overflow-hidden mb-6">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1549399905-5d1bad747576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODQ4MTA5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Workspace"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Mi Filosofía</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Creo en el poder de la tecnología para resolver problemas reales y mejorar la vida de las personas. 
                  Mi enfoque combina excelencia técnica con diseño centrado en el usuario.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-5 w-5" />
                  Logros Destacados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">🏆 Mejor Proyecto del Año 2023</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">TechCorp Innovation Awards</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">🎯 +50 Proyectos Completados</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">Alta satisfacción del cliente</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">📈 200% Mejora de Performance</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">En aplicaciones optimizadas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Heart className="h-5 w-5" />
                  Intereses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}