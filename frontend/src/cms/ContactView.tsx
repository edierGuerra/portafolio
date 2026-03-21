import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AtSign,
  Dribbble,
  Facebook,
  Figma,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Pencil,
  Phone,
  Send,
  Twitch,
  Trash2,
  Twitter,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import {
  createContactInfoCms,
  createSocialNetworkCms,
  deleteContactInfoCms,
  deleteSocialNetworkCms,
  getContactInfoCms,
  getSocialNetworksCms,
  updateContactInfoCms,
  updateSocialNetworkCms,
} from "./api";
import type { ContactInfo, SocialNetwork } from "./types";

const EMPTY_CONTACT_FORM = {
  email: "",
  phone: "",
  location: "",
  location_en: "",
  availability: "",
  availability_en: "",
};

const EMPTY_NETWORK_FORM = {
  name: "",
  name_en: "",
  url: "",
  icon: "globe",
};

type SocialIconOption = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

const BASE_SOCIAL_ICON_OPTIONS: SocialIconOption[] = [
  { key: "github", label: "GitHub", Icon: Github },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "twitter", label: "X / Twitter", Icon: Twitter },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "twitch", label: "Twitch", Icon: Twitch },
  { key: "discord", label: "Discord", Icon: MessageCircle },
  { key: "telegram", label: "Telegram", Icon: Send },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "figma", label: "Figma", Icon: Figma },
  { key: "dribbble", label: "Dribbble", Icon: Dribbble },
  { key: "email", label: "Email", Icon: Mail },
  { key: "website", label: "Website", Icon: Globe },
  { key: "portfolio", label: "Portafolio", Icon: AtSign },
  { key: "other", label: "Otro", Icon: Globe },
];

function getSocialIconByKey(iconKey: string): LucideIcon {
  const normalized = iconKey.trim().toLowerCase();
  const option = BASE_SOCIAL_ICON_OPTIONS.find(
    (item) => item.key === normalized,
  );
  return option?.Icon ?? Globe;
}

export function ContactView({
  onContactCountChange,
}: {
  onContactCountChange: (count: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingNetwork, setSavingNetwork] = useState(false);

  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [networks, setNetworks] = useState<SocialNetwork[]>([]);

  const [editingContact, setEditingContact] = useState<ContactInfo | null>(
    null,
  );
  const [editingNetwork, setEditingNetwork] = useState<SocialNetwork | null>(
    null,
  );

  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM);
  const [networkForm, setNetworkForm] = useState(EMPTY_NETWORK_FORM);

  const totalRecords = useMemo(
    () => contacts.length + networks.length,
    [contacts.length, networks.length],
  );

  const socialIconOptions = useMemo(() => {
    const knownKeys = new Set(BASE_SOCIAL_ICON_OPTIONS.map((item) => item.key));
    const dynamicOptions = networks
      .map((network) => network.icon.trim().toLowerCase())
      .filter((iconKey) => iconKey && !knownKeys.has(iconKey))
      .map((iconKey) => ({
        key: iconKey,
        label: `Icono guardado (${iconKey})`,
        Icon: Globe,
      }));

    return [...BASE_SOCIAL_ICON_OPTIONS, ...dynamicOptions];
  }, [networks]);

  const selectedNetworkIcon = useMemo(
    () => getSocialIconByKey(networkForm.icon),
    [networkForm.icon],
  );
  const SelectedNetworkIcon = selectedNetworkIcon;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contactData, networkData] = await Promise.all([
        getContactInfoCms(),
        getSocialNetworksCms(),
      ]);
      setContacts(contactData);
      setNetworks(networkData);
      onContactCountChange(contactData.length + networkData.length);
    } catch {
      toast.error("No se pudo cargar el modulo de contacto");
    } finally {
      setLoading(false);
    }
  }, [onContactCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !contactForm.email.trim() ||
      !contactForm.phone.trim() ||
      !contactForm.location.trim() ||
      !contactForm.availability.trim()
    ) {
      toast.error("Completa todos los campos de contacto");
      return;
    }

    setSavingContact(true);
    try {
      if (editingContact) {
        await updateContactInfoCms(editingContact.id, contactForm);
        toast.success("Contacto actualizado");
      } else {
        await createContactInfoCms(contactForm);
        toast.success("Contacto creado");
      }

      setEditingContact(null);
      setContactForm(EMPTY_CONTACT_FORM);
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo guardar contacto",
      );
    } finally {
      setSavingContact(false);
    }
  };

  const handleNetworkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !networkForm.name.trim() ||
      !networkForm.url.trim() ||
      !networkForm.icon.trim()
    ) {
      toast.error("Completa todos los campos de red social");
      return;
    }

    setSavingNetwork(true);
    try {
      if (editingNetwork) {
        await updateSocialNetworkCms(editingNetwork.id, networkForm);
        toast.success("Red social actualizada");
      } else {
        await createSocialNetworkCms(networkForm);
        toast.success("Red social creada");
      }

      setEditingNetwork(null);
      setNetworkForm(EMPTY_NETWORK_FORM);
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo guardar red social",
      );
    } finally {
      setSavingNetwork(false);
    }
  };

  const handleDeleteContact = async (item: ContactInfo) => {
    if (
      !window.confirm(
        `Se eliminara el contacto ${item.email}. Deseas continuar?`,
      )
    ) {
      return;
    }

    try {
      await deleteContactInfoCms(item.id);
      toast.success("Contacto eliminado");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar contacto",
      );
    }
  };

  const handleDeleteNetwork = async (item: SocialNetwork) => {
    if (
      !window.confirm(
        `Se eliminara la red social ${item.name}. Deseas continuar?`,
      )
    ) {
      return;
    }

    try {
      await deleteSocialNetworkCms(item.id);
      toast.success("Red social eliminada");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar red social",
      );
    }
  };

  return (
    <div className="space-y-4">
      <Card className="cms-panel-card">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Contacto ({totalRecords} registros)
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-zinc-500">
            Gestiona informacion de contacto y redes sociales.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="cms-panel-card">
          <CardHeader className="border-b border-zinc-800 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Mail className="h-4 w-4" /> Datos de contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <form className="space-y-2" onSubmit={handleContactSubmit}>
              <Input
                className="cms-input h-9 text-sm"
                value={contactForm.email}
                onChange={(event) =>
                  setContactForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="Correo"
              />
              <Input
                className="cms-input h-9 text-sm"
                value={contactForm.phone}
                onChange={(event) =>
                  setContactForm((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                placeholder="Telefono"
              />
              <Input
                className="cms-input h-9 text-sm"
                value={contactForm.location}
                onChange={(event) =>
                  setContactForm((prev) => ({
                    ...prev,
                    location: event.target.value,
                  }))
                }
                placeholder="Ubicacion"
              />
              <Input
                className="cms-input h-9 text-sm"
                value={contactForm.location_en}
                onChange={(event) =>
                  setContactForm((prev) => ({
                    ...prev,
                    location_en: event.target.value,
                  }))
                }
                placeholder="Location (English)"
              />
              <Input
                className="cms-input h-9 text-sm"
                value={contactForm.availability}
                onChange={(event) =>
                  setContactForm((prev) => ({
                    ...prev,
                    availability: event.target.value,
                  }))
                }
                placeholder="Disponibilidad"
              />
              <Input
                className="cms-input h-9 text-sm"
                value={contactForm.availability_en}
                onChange={(event) =>
                  setContactForm((prev) => ({
                    ...prev,
                    availability_en: event.target.value,
                  }))
                }
                placeholder="Availability (English)"
              />

              <div className="flex gap-2">
                <Button
                  className="cms-primary-btn h-8 text-sm"
                  disabled={savingContact}
                >
                  {savingContact
                    ? "Guardando..."
                    : editingContact
                      ? "Actualizar"
                      : "Agregar"}
                </Button>
                {editingContact && (
                  <Button
                    type="button"
                    variant="outline"
                    className="cms-outline-btn h-8 text-sm"
                    onClick={() => {
                      setEditingContact(null);
                      setContactForm(EMPTY_CONTACT_FORM);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>

            {loading ? (
              <p className="text-sm text-zinc-500">Cargando contactos...</p>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Sin datos de contacto registrados.
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3"
                  >
                    <p className="text-sm text-zinc-100 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> {item.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> {item.phone}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> {item.location}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Disponibilidad: {item.availability}
                    </p>
                    <div className="mt-2 flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cms-outline-btn h-7 w-7 p-0"
                        onClick={() => {
                          setEditingContact(item);
                          setContactForm({
                            email: item.email,
                            phone: item.phone,
                            location: item.location,
                            location_en: item.location_en ?? "",
                            availability: item.availability,
                            availability_en: item.availability_en ?? "",
                          });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                        onClick={() => void handleDeleteContact(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="cms-panel-card">
          <CardHeader className="border-b border-zinc-800 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Users className="h-4 w-4" /> Redes sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            <form className="space-y-2" onSubmit={handleNetworkSubmit}>
              <Input
                className="cms-input h-9 text-sm"
                value={networkForm.name}
                onChange={(event) =>
                  setNetworkForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Nombre"
              />
              <Input
                className="cms-input h-9 text-sm"
                value={networkForm.name_en}
                onChange={(event) =>
                  setNetworkForm((prev) => ({
                    ...prev,
                    name_en: event.target.value,
                  }))
                }
                placeholder="Name (English)"
              />
              <Input
                className="cms-input h-9 text-sm"
                value={networkForm.url}
                onChange={(event) =>
                  setNetworkForm((prev) => ({
                    ...prev,
                    url: event.target.value,
                  }))
                }
                placeholder="URL"
              />
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Icono</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/60">
                    <SelectedNetworkIcon className="h-4 w-4 text-zinc-200" />
                  </div>
                  <Select
                    value={networkForm.icon}
                    onValueChange={(value: string) =>
                      setNetworkForm((prev) => ({ ...prev, icon: value }))
                    }
                  >
                    <SelectTrigger className="cms-input h-9 flex-1 text-sm">
                      <SelectValue placeholder="Selecciona un icono" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialIconOptions.map(({ key, label, Icon }) => (
                        <SelectItem key={key} value={key}>
                          <span className="inline-flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="cms-primary-btn h-8 text-sm"
                  disabled={savingNetwork}
                >
                  {savingNetwork
                    ? "Guardando..."
                    : editingNetwork
                      ? "Actualizar"
                      : "Agregar"}
                </Button>
                {editingNetwork && (
                  <Button
                    type="button"
                    variant="outline"
                    className="cms-outline-btn h-8 text-sm"
                    onClick={() => {
                      setEditingNetwork(null);
                      setNetworkForm(EMPTY_NETWORK_FORM);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>

            {loading ? (
              <p className="text-sm text-zinc-500">
                Cargando redes sociales...
              </p>
            ) : networks.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Sin redes sociales registradas.
              </p>
            ) : (
              <div className="space-y-2">
                {networks.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3"
                  >
                    <p className="text-sm text-zinc-100 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> {item.name}
                    </p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      {item.url}
                    </a>
                    <p className="mt-1 text-xs text-zinc-500 inline-flex items-center gap-2">
                      Icono:
                      {(() => {
                        const Icon = getSocialIconByKey(item.icon);
                        return <Icon className="h-3.5 w-3.5" />;
                      })()}
                      <span className="uppercase tracking-wide">
                        {item.icon}
                      </span>
                    </p>
                    <div className="mt-2 flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cms-outline-btn h-7 w-7 p-0"
                        onClick={() => {
                          setEditingNetwork(item);
                          setNetworkForm({
                            name: item.name,
                            name_en: item.name_en ?? "",
                            url: item.url,
                            icon: item.icon,
                          });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                        onClick={() => void handleDeleteNetwork(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
