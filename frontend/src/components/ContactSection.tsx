import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Mail, Phone, MapPin, Clock, Send, Coffee, MessageCircle } from "lucide-react";

export function ContactSection() {
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "hola@alejandrogarcia.dev",
      href: "mailto:hola@alejandrogarcia.dev"
    },
    {
      icon: Phone,
      label: "Teléfono",
      value: "+34 600 123 456",
      href: "tel:+34600123456"
    },
    {
      icon: MapPin,
      label: "Ubicación",
      value: "Madrid, España",
      href: "https://maps.google.com"
    },
    {
      icon: Clock,
      label: "Disponibilidad",
      value: "Lun - Vie, 9:00 - 18:00",
      href: null
    }
  ];

  const services = [
    "Desarrollo Web Frontend",
    "Desarrollo Backend/APIs",
    "Aplicaciones Móviles",
    "UI/UX Design",
    "Consultoría Técnica",
    "Optimización de Performance"
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Hablemos</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            ¿Tienes un proyecto en mente? Me encantaría conocer más detalles y ver cómo puedo ayudarte
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Información de contacto */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageCircle className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  const content = (
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Icon className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{info.label}</p>
                        <p className="text-muted-foreground text-sm sm:text-base">{info.value}</p>
                      </div>
                    </div>
                  );

                  return info.href ? (
                    <a key={info.label} href={info.href} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={info.label}>{content}</div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Servicios Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services.map((service) => (
                    <Badge key={service} variant="secondary" className="mr-2 mb-2 text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hidden lg:block">
              <CardContent className="p-6 text-center">
                <Coffee className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">¿Prefieres una llamada?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Podemos programar una videollamada de 30 minutos para conocernos mejor
                </p>
                <Button variant="outline" className="w-full">
                  Programar llamada
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de contacto */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Envíame un mensaje</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Cuéntame sobre tu proyecto y te responderé lo antes posible
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">Nombre completo</Label>
                    <Input id="name" placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm sm:text-base">Empresa (opcional)</Label>
                    <Input id="company" placeholder="Tu empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm sm:text-base">Presupuesto estimado</Label>
                    <Input id="budget" placeholder="ej. €5,000 - €10,000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm sm:text-base">Asunto</Label>
                  <Input id="subject" placeholder="¿En qué puedo ayudarte?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm sm:text-base">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe tu proyecto, objetivos, timeline y cualquier detalle relevante..."
                    className="min-h-32"
                  />
                </div>

                <div className="space-y-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <p>📋 Para obtener una respuesta más precisa, incluye:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Tipo de proyecto (web, móvil, consultoría)</li>
                      <li>Timeline esperado</li>
                      <li>Funcionalidades principales</li>
                      <li>Si tienes diseños existentes</li>
                    </ul>
                  </div>

                  <Button className="w-full" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </Button>

                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Normalmente respondo en menos de 24 horas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Call-to-action móvil */}
            <Card className="lg:hidden mt-6">
              <CardContent className="p-6 text-center">
                <Coffee className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">¿Prefieres una llamada?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Podemos programar una videollamada de 30 minutos para conocernos mejor
                </p>
                <Button variant="outline" className="w-full">
                  Programar llamada
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="mt-8 lg:mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">¿Cuánto tiempo toma un proyecto?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Depende del alcance, pero proyectos típicos toman 4-12 semanas desde el inicio hasta el lanzamiento.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">¿Trabajas con equipos remotos?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Sí, tengo experiencia trabajando con equipos distribuidos globalmente usando metodologías ágiles.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">¿Ofreces soporte post-lanzamiento?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Absolutamente. Incluyo soporte y mantenimiento como parte de mis servicios a largo plazo.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">¿Qué tecnologías prefieres?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Especializado en React, Node.js, TypeScript, pero adapto las tecnologías a las necesidades del proyecto.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}