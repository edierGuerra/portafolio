import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ExternalLink, Github, Calendar, Users } from "lucide-react";

export function ProjectsSection() {
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "Plataforma completa de comercio electrónico con dashboard administrativo, sistema de pagos y análisis en tiempo real.",
      image: "https://images.unsplash.com/photo-1742072594003-abf6ca86e154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGUlMjBzY3JlZW58ZW58MXx8fHwxNzU4NTIyMDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
      status: "Completado",
      date: "2023",
      team: "4 personas",
      featured: true
    },
    {
      id: 2,
      title: "Task Management App",
      description: "Aplicación de gestión de tareas con colaboración en tiempo real, notificaciones push y sincronización offline.",
      image: "https://images.unsplash.com/photo-1549399905-5d1bad747576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODQ4MTA5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      technologies: ["React Native", "Firebase", "Redux", "TypeScript"],
      status: "En desarrollo",
      date: "2024",
      team: "2 personas",
      featured: false
    },
    {
      id: 3,
      title: "AI Content Generator",
      description: "Herramienta de generación de contenido con IA que ayuda a crear textos, imágenes y estrategias de marketing.",
      image: "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwYnVzaW5lc3N8ZW58MXx8fHwxNzU4NTUxMDg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      technologies: ["Python", "OpenAI API", "FastAPI", "React", "Docker"],
      status: "Completado",
      date: "2023",
      team: "Solo",
      featured: true
    },
    {
      id: 4,
      title: "Healthcare Dashboard",
      description: "Dashboard para profesionales de la salud con visualización de datos médicos, historial de pacientes y reportes.",
      image: "https://images.unsplash.com/photo-1742072594003-abf6ca86e154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGUlMjBzY3JlZW58ZW58MXx8fHwxNzU4NTIyMDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      technologies: ["Vue.js", "D3.js", "Express", "MySQL", "Chart.js"],
      status: "Completado",
      date: "2022",
      team: "3 personas",
      featured: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "En desarrollo":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Mis Proyectos</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Una selección de proyectos que demuestran mis habilidades técnicas y creatividad
          </p>
        </div>

        <div className="grid gap-8">
          {/* Proyectos destacados */}
          <div className="space-y-8">
            {projects
              .filter(project => project.featured)
              .map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="aspect-video lg:aspect-square">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-3 sm:gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {project.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              {project.team}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl font-bold mb-3">{project.title}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                          {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs sm:text-sm">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button className="flex-1">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver Demo
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none">
                          <Github className="mr-2 h-4 w-4" />
                          Código
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>

          {/* Otros proyectos */}
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-semibold">Otros Proyectos</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {projects
                .filter(project => !project.featured)
                .map((project) => (
                  <Card key={project.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-video">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {project.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.team}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mb-2">{project.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Demo
                        </Button>
                        <Button variant="outline" size="sm">
                          <Github className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}