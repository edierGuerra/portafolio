import { FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import {
  getContactInfo,
  sendContactMessage,
  type ContactInfo,
  type ContactMessagePayload,
} from "../api/contact";
import { getServices, type Service } from "../api/services";
import { getFaqs, type Faq } from "../api/faq";

export function ContactSection() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [form, setForm] = useState<ContactMessagePayload>({
    name: "",
    email: "",
    company: "",
    budget: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [contactData, servicesData, faqsData] = await Promise.all([
          getContactInfo(),
          getServices(),
          getFaqs(),
        ]);
        if (cancelled) return;
        setContactInfo(contactData);
        setServices(servicesData);
        setFaqs(faqsData);
      } catch {
        // fallback silente — secciones muestran estado vacío
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const primaryContact = contactInfo[0] ?? null;

  const contactRows = primaryContact
    ? [
        {
          icon: Mail,
          label: "Email",
          value: primaryContact.email,
          href: `mailto:${primaryContact.email}`,
        },
        {
          icon: Phone,
          label: "Teléfono",
          value: primaryContact.phone,
          href: `tel:${primaryContact.phone.replace(/\s/g, "")}`,
        },
        {
          icon: MapPin,
          label: "Ubicación",
          value: primaryContact.location,
          href: null as string | null,
        },
        {
          icon: Clock,
          label: "Disponibilidad",
          value: primaryContact.availability,
          href: null as string | null,
        },
      ]
    : [];

  const handleFormChange = (
    field: keyof ContactMessagePayload,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitFeedback(null);

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setSubmitFeedback({
        type: "error",
        message: "Completa los campos obligatorios: nombre, email, asunto y mensaje.",
      });
      return;
    }

    if (form.message.trim().length < 10) {
      setSubmitFeedback({
        type: "error",
        message: "El mensaje debe tener al menos 10 caracteres.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        budget: form.budget.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSubmitFeedback({
        type: "success",
        message: "Mensaje enviado. Te responderé lo antes posible.",
      });
      setForm({
        name: "",
        email: "",
        company: "",
        budget: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "No se pudo enviar el mensaje.";
      setSubmitFeedback({
        type: "error",
        message: detail,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {loading ? (
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : contactRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos de contacto aún.</p>
                ) : (
                  contactRows.map((info) => {
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
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Servicios Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin servicios registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {services.map((s) => (
                      <Badge key={s.id} variant="secondary" className="mr-2 mb-2 text-xs">
                        {s.service}
                      </Badge>
                    ))}
                  </div>
                )}
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
                <form className="space-y-6" onSubmit={handleSubmitMessage}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">Nombre completo</Label>
                    <Input
                      id="name"
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={(event) => handleFormChange("name", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={(event) => handleFormChange("email", event.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm sm:text-base">Empresa (opcional)</Label>
                    <Input
                      id="company"
                      placeholder="Tu empresa"
                      value={form.company}
                      onChange={(event) => handleFormChange("company", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm sm:text-base">Presupuesto estimado</Label>
                    <Input
                      id="budget"
                      placeholder="ej. €5,000 - €10,000"
                      value={form.budget}
                      onChange={(event) => handleFormChange("budget", event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm sm:text-base">Asunto</Label>
                  <Input
                    id="subject"
                    placeholder="¿En qué puedo ayudarte?"
                    value={form.subject}
                    onChange={(event) => handleFormChange("subject", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm sm:text-base">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe tu proyecto, objetivos, timeline y cualquier detalle relevante..."
                    className="min-h-32"
                    value={form.message}
                    onChange={(event) => handleFormChange("message", event.target.value)}
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

                  <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  </Button>

                  {submitFeedback && (
                    <p
                      className={`text-xs sm:text-sm text-center ${
                        submitFeedback.type === "success"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {submitFeedback.message}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Normalmente respondo en menos de 24 horas
                  </p>
                </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 lg:mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando preguntas...</p>
              ) : faqs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin preguntas frecuentes registradas.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                  {faqs.map((faq) => (
                    <div key={faq.id}>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">{faq.question}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}