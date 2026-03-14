import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Clock, ArrowRight, Bookmark } from "lucide-react";

export function BlogSection() {
  const blogPosts = [
    {
      id: 1,
      title: "El Futuro del Desarrollo Web: Tendencias 2024",
      excerpt: "Exploramos las principales tendencias tecnológicas que están definiendo el panorama del desarrollo web, desde Web3 hasta IA generativa.",
      image: "https://images.unsplash.com/photo-1742072594003-abf6ca86e154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGUlMjBzY3JlZW58ZW58MXx8fHwxNzU4NTIyMDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Tecnología",
      date: "15 Ene 2024",
      readTime: "5 min",
      featured: true
    },
    {
      id: 2,
      title: "Optimización de Performance en React: Guía Completa",
      excerpt: "Técnicas avanzadas para mejorar el rendimiento de aplicaciones React, incluyendo lazy loading, memoización y code splitting.",
      image: "https://images.unsplash.com/photo-1549399905-5d1bad747576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODQ4MTA5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "React",
      date: "8 Ene 2024",
      readTime: "8 min",
      featured: false
    },
    {
      id: 3,
      title: "Diseño de APIs RESTful: Mejores Prácticas",
      excerpt: "Todo lo que necesitas saber para diseñar APIs robustas, escalables y fáciles de mantener en 2024.",
      image: "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwYnVzaW5lc3N8ZW58MXx8fHwxNzU4NTUxMDg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Backend",
      date: "22 Dic 2023",
      readTime: "6 min",
      featured: true
    },
    {
      id: 4,
      title: "Mi Experiencia con TypeScript en Proyectos Grandes",
      excerpt: "Reflexiones sobre los beneficios y desafíos de implementar TypeScript en aplicaciones empresariales complejas.",
      image: "https://images.unsplash.com/photo-1742072594003-abf6ca86e154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGUlMjBzY3JlZW58ZW58MXx8fHwxNzU4NTIyMDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "TypeScript",
      date: "15 Dic 2023",
      readTime: "4 min",
      featured: false
    },
    {
      id: 5,
      title: "UX/UI: Creando Interfaces que Realmente Importan",
      excerpt: "Principios fundamentales del diseño centrado en el usuario y cómo aplicarlos en el desarrollo de productos digitales.",
      image: "https://images.unsplash.com/photo-1549399905-5d1bad747576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODQ4MTA5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Diseño",
      date: "1 Dic 2023",
      readTime: "7 min",
      featured: false
    }
  ];

  const categories = ["Todos", "Tecnología", "React", "Backend", "TypeScript", "Diseño"];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Tecnología": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "React": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      "Backend": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "TypeScript": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Diseño": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Blog</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Reflexiones, tutoriales y experiencias del mundo del desarrollo y diseño
          </p>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 lg:mb-8 px-4">
          {categories.map((category) => (
            <Button 
              key={category} 
              variant={category === "Todos" ? "default" : "outline"} 
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Artículos destacados */}
        <div className="space-y-6 lg:space-y-8 mb-8 lg:mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold px-4 lg:px-0">Artículos Destacados</h3>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {blogPosts
              .filter(post => post.featured)
              .map((post) => (
                <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={getCategoryColor(post.category)}>
                        {post.category}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime} lectura
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" className="p-0">
                        Leer más
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Todos los artículos */}
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-semibold px-4 lg:px-0">Todos los Artículos</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {blogPosts
              .filter(post => !post.featured)
              .map((post) => (
                <Card key={post.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="aspect-video">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(post.category)} variant="outline">
                        {post.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        Leer más
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* CTA para ver más */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Ver todos los artículos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}