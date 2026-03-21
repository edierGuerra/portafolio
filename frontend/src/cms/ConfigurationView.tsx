import { useState, FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Upload,
  Download,
  Wand2,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import type { CmsUser } from "./types";
import { updateMeCms, uploadAdminCvFileCms, translateBatchCms } from "./api";

interface ConfigurationViewProps {
  user: CmsUser;
  onUserUpdate: (updatedUser: CmsUser) => void;
}

export function ConfigurationView({
  user,
  onUserUpdate,
}: ConfigurationViewProps) {
  const [currentCvUrl, setCurrentCvUrl] = useState(user.cv_file || "");
  const [pendingCvFile, setPendingCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Profile edit form state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: user.name || "",
    name_en: user.name_en || "",
    email: user.email || "",
    professional_profile: user.professional_profile || "",
    professional_profile_en: user.professional_profile_en || "",
    location: user.location || "",
    location_en: user.location_en || "",
    about_me: user.about_me || "",
    about_me_en: user.about_me_en || "",
  });
  const [profileReviewedFlags, setProfileReviewedFlags] = useState({
    name_en_reviewed: user.name_en_reviewed || false,
    professional_profile_en_reviewed:
      user.professional_profile_en_reviewed || false,
    about_me_en_reviewed: user.about_me_en_reviewed || false,
    location_en_reviewed: user.location_en_reviewed || false,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  // Password change form state
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile image preview state
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    user.profile_image || null,
  );

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImagePreview(result);
      setProfileFormData((prev) => ({
        ...prev,
        profile_image: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileFormChange = (
    field: keyof typeof profileFormData,
    value: string,
  ) => {
    setProfileFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset reviewed flag when ES source field changes
    if (field === "name") {
      setProfileReviewedFlags((prev) => ({
        ...prev,
        name_en_reviewed: false,
      }));
    } else if (field === "professional_profile") {
      setProfileReviewedFlags((prev) => ({
        ...prev,
        professional_profile_en_reviewed: false,
      }));
    } else if (field === "about_me") {
      setProfileReviewedFlags((prev) => ({
        ...prev,
        about_me_en_reviewed: false,
      }));
    } else if (field === "location") {
      setProfileReviewedFlags((prev) => ({
        ...prev,
        location_en_reviewed: false,
      }));
    }
  };

  const handleGenerateEnglish = async () => {
    try {
      setTranslatingField("all");
      const sourceFields = [
        profileFormData.name,
        profileFormData.professional_profile,
        profileFormData.location,
        profileFormData.about_me,
      ].filter((f) => f.trim());

      if (!sourceFields.length) {
        toast.error("No hay contenido para traducir");
        return;
      }

      const payload = sourceFields.map((text) => ({ text }));
      const results = await translateBatchCms(payload);
      const translations = results
        .filter((result) => result.status === "success")
        .map((result) => result.translated_text);

      let index = 0;
      const updates: Record<string, string> = {};

      if (profileFormData.name.trim()) {
        updates.name_en = translations[index];
        index++;
      }
      if (profileFormData.professional_profile.trim()) {
        updates.professional_profile_en = translations[index];
        index++;
      }
      if (profileFormData.location.trim()) {
        updates.location_en = translations[index];
        index++;
      }
      if (profileFormData.about_me.trim()) {
        updates.about_me_en = translations[index];
      }

      setProfileFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      setProfileReviewedFlags((prev) => ({
        ...prev,
        name_en_reviewed: false,
        professional_profile_en_reviewed: false,
        location_en_reviewed: false,
        about_me_en_reviewed: false,
      }));

      toast.success("Traducción generada", {
        description: "Revisa los textos en inglés antes de guardar.",
      });
    } catch (err) {
      toast.error("Error en la traducción", {
        description:
          err instanceof Error ? err.message : "Intenta nuevamente más tarde",
      });
    } finally {
      setTranslatingField(null);
    }
  };

  const handlePasswordFormChange = (
    field: keyof typeof passwordFormData,
    value: string,
  ) => {
    setPasswordFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    const hasAllowedExtension = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!allowedTypes.has(file.type) && !hasAllowedExtension) {
      toast.error("Formato invalido", {
        description: "Sube un archivo PDF, DOC o DOCX para tu CV.",
      });
      event.target.value = "";
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Archivo demasiado grande", {
        description: "El CV no debe superar 5 MB.",
      });
      event.target.value = "";
      return;
    }

    setPendingCvFile(file);
  };

  const handleUpdateProfile = async (event: FormEvent) => {
    event.preventDefault();
    setProfileLoading(true);

    try {
      if (!profileFormData.name.trim()) {
        toast.error("El nombre es requerido");
        return;
      }

      if (!profileFormData.email.trim()) {
        toast.error("El email es requerido");
        return;
      }

      if (!profileFormData.professional_profile.trim()) {
        toast.error("El título profesional es requerido");
        return;
      }

      let nextCvUrl = currentCvUrl;
      if (pendingCvFile) {
        setCvUploading(true);
        const uploadedCv = await uploadAdminCvFileCms(pendingCvFile);
        nextCvUrl = uploadedCv.file_url;
      }

      const result = await updateMeCms({
        name: profileFormData.name.trim(),
        name_en: profileFormData.name_en.trim() || null,
        name_en_reviewed: profileReviewedFlags.name_en_reviewed,
        email: profileFormData.email.trim(),
        professional_profile: profileFormData.professional_profile.trim(),
        professional_profile_en:
          profileFormData.professional_profile_en.trim() || null,
        professional_profile_en_reviewed:
          profileReviewedFlags.professional_profile_en_reviewed,
        location: profileFormData.location.trim(),
        location_en: profileFormData.location_en.trim() || null,
        location_en_reviewed: profileReviewedFlags.location_en_reviewed,
        about_me: profileFormData.about_me.trim(),
        about_me_en: profileFormData.about_me_en.trim() || null,
        about_me_en_reviewed: profileReviewedFlags.about_me_en_reviewed,
        cv_file: nextCvUrl || null,
        ...(profileImagePreview &&
          profileImagePreview !== user.profile_image && {
            profile_image: profileImagePreview,
          }),
      });

      onUserUpdate(result.user);
      setCurrentCvUrl(result.user.cv_file || "");
      setPendingCvFile(null);
      setEditProfileOpen(false);
      toast.success("Perfil actualizado correctamente", {
        description: "Los cambios se aplicaron exitosamente.",
      });
    } catch (err) {
      toast.error("Error al actualizar perfil", {
        description:
          err instanceof Error ? err.message : "Intenta nuevamente más tarde",
      });
    } finally {
      setCvUploading(false);
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordLoading(true);

    try {
      if (!passwordFormData.current_password.trim()) {
        toast.error("Ingresa tu contraseña actual");
        return;
      }

      if (!passwordFormData.new_password.trim()) {
        toast.error("Ingresa una nueva contraseña");
        return;
      }

      if (passwordFormData.new_password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      if (passwordFormData.new_password !== passwordFormData.confirm_password) {
        toast.error("Las contraseñas no coinciden");
        return;
      }

      if (passwordFormData.current_password === passwordFormData.new_password) {
        toast.error("La nueva contraseña debe ser diferente a la actual");
        return;
      }

      // Call update with new password
      const result = await updateMeCms({
        password: passwordFormData.new_password,
      });

      onUserUpdate(result.user);
      setEditPasswordOpen(false);
      setPasswordFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success("Contraseña actualizada", {
        description: "Tu contraseña se cambió correctamente.",
      });
    } catch (err) {
      toast.error("Error al cambiar contraseña", {
        description:
          err instanceof Error
            ? err.message
            : "Verifica tus datos e intenta nuevamente",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{ className: "cms-toast" }}
      />

      <section className="cms-settings-layout">
        <div className="cms-settings-main">
          {/* Profile Section */}
          <Card className="cms-panel-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-zinc-100">
                Información Personal
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                Datos que identifican tu perfil en el portafolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editProfileOpen ? (
                <div className="space-y-3">
                  {/* Profile Preview */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Foto de perfil"
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-400/50"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-700">
                          <User className="h-8 w-8 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-100">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {user.professional_profile}
                      </p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid gap-3 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Ubicación
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {user.location || "No especificada"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Sobre ti
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-300">
                        {user.about_me || "No especificado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        CV
                      </p>
                      {currentCvUrl ? (
                        <a
                          href={currentCvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                        >
                          <Download className="h-4 w-4" />
                          Ver CV actual
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-zinc-300">
                          No has subido un CV todavía.
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setEditProfileOpen(true)}
                    className="cms-primary-btn w-full"
                  >
                    Editar información
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  {/* Profile Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Foto de perfil
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Vista previa"
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-400/50"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                            <ImageIcon className="h-6 w-6 text-zinc-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="block w-full text-xs text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-emerald-500/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-emerald-400 hover:file:bg-emerald-500/20"
                          disabled={profileLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Archivo CV
                    </Label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input
                        id="cv-file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleCvFileChange}
                        style={{ display: "none" }}
                        disabled={profileLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("cv-file-input")?.click()
                        }
                        disabled={profileLoading}
                        className="cms-cv-upload-btn"
                      >
                        <Upload
                          style={{
                            width: "0.875rem",
                            height: "0.875rem",
                            color: "#34d399",
                          }}
                        />
                        {pendingCvFile ? pendingCvFile.name : "Subir CV"}
                      </button>
                      {currentCvUrl && !pendingCvFile && (
                        <a
                          href={currentCvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cms-cv-link"
                        >
                          <Download
                            style={{ width: "0.875rem", height: "0.875rem" }}
                          />
                          Ver actual
                        </a>
                      )}
                      {!currentCvUrl && !pendingCvFile && (
                        <span className="cms-cv-no-file">Sin CV cargado</span>
                      )}
                    </div>
                    <p className="cms-cv-upload-hint">
                      PDF, DOC o DOCX · máx. 5 MB
                    </p>
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                      <User className="h-3.5 w-3.5" />
                      Nombre completo
                    </Label>
                    <Input
                      className="cms-input h-9 text-sm"
                      value={profileFormData.name}
                      onChange={(e) =>
                        handleProfileFormChange("name", e.target.value)
                      }
                      placeholder="Tu nombre"
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Name (English)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        className="cms-input h-9 text-sm flex-1"
                        value={profileFormData.name_en}
                        onChange={(e) =>
                          handleProfileFormChange("name_en", e.target.value)
                        }
                        placeholder="Your name in English"
                        disabled={profileLoading || translatingField === "all"}
                      />
                      <button
                        type="button"
                        onClick={handleGenerateEnglish}
                        disabled={
                          !profileFormData.name.trim() ||
                          profileLoading ||
                          translatingField === "all"
                        }
                        className="inline-flex items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 px-3 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generar texto en inglés automáticamente"
                      >
                        <Wand2 className="h-4 w-4 text-emerald-400" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="name_en_reviewed"
                        checked={profileReviewedFlags.name_en_reviewed}
                        onChange={(e) =>
                          setProfileReviewedFlags((prev) => ({
                            ...prev,
                            name_en_reviewed: e.target.checked,
                          }))
                        }
                        disabled={profileLoading}
                        className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                      />
                      <label
                        htmlFor="name_en_reviewed"
                        className="text-xs text-zinc-500 cursor-pointer"
                      >
                        Revisado y aprobado
                      </label>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      className="cms-input h-9 text-sm"
                      value={profileFormData.email}
                      onChange={(e) =>
                        handleProfileFormChange("email", e.target.value)
                      }
                      placeholder="tu@email.com"
                      disabled={profileLoading}
                    />
                  </div>

                  {/* Professional Profile */}
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                      <Briefcase className="h-3.5 w-3.5" />
                      Título profesional
                    </Label>
                    <Input
                      className="cms-input h-9 text-sm"
                      value={profileFormData.professional_profile}
                      onChange={(e) =>
                        handleProfileFormChange(
                          "professional_profile",
                          e.target.value,
                        )
                      }
                      placeholder="ej: Full Stack Developer"
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Professional title (English)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        className="cms-input h-9 text-sm flex-1"
                        value={profileFormData.professional_profile_en}
                        onChange={(e) =>
                          handleProfileFormChange(
                            "professional_profile_en",
                            e.target.value,
                          )
                        }
                        placeholder="ex: Full Stack Developer"
                        disabled={profileLoading || translatingField === "all"}
                      />
                      <button
                        type="button"
                        onClick={handleGenerateEnglish}
                        disabled={
                          !profileFormData.professional_profile.trim() ||
                          profileLoading ||
                          translatingField === "all"
                        }
                        className="inline-flex items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 px-3 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generar texto en inglés automáticamente"
                      >
                        <Wand2 className="h-4 w-4 text-emerald-400" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="professional_profile_en_reviewed"
                        checked={
                          profileReviewedFlags.professional_profile_en_reviewed
                        }
                        onChange={(e) =>
                          setProfileReviewedFlags((prev) => ({
                            ...prev,
                            professional_profile_en_reviewed: e.target.checked,
                          }))
                        }
                        disabled={profileLoading}
                        className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                      />
                      <label
                        htmlFor="professional_profile_en_reviewed"
                        className="text-xs text-zinc-500 cursor-pointer"
                      >
                        Revisado y aprobado
                      </label>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Ubicación
                    </Label>
                    <Input
                      className="cms-input h-9 text-sm"
                      value={profileFormData.location}
                      onChange={(e) =>
                        handleProfileFormChange("location", e.target.value)
                      }
                      placeholder="Ciudad, País"
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Location (English)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        className="cms-input h-9 text-sm flex-1"
                        value={profileFormData.location_en}
                        onChange={(e) =>
                          handleProfileFormChange("location_en", e.target.value)
                        }
                        placeholder="City, Country"
                        disabled={profileLoading || translatingField === "all"}
                      />
                      <button
                        type="button"
                        onClick={handleGenerateEnglish}
                        disabled={
                          !profileFormData.location.trim() ||
                          profileLoading ||
                          translatingField === "all"
                        }
                        className="inline-flex items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 px-3 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generar texto en inglés automáticamente"
                      >
                        <Wand2 className="h-4 w-4 text-emerald-400" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="location_en_reviewed"
                        checked={profileReviewedFlags.location_en_reviewed}
                        onChange={(e) =>
                          setProfileReviewedFlags((prev) => ({
                            ...prev,
                            location_en_reviewed: e.target.checked,
                          }))
                        }
                        disabled={profileLoading}
                        className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                      />
                      <label
                        htmlFor="location_en_reviewed"
                        className="text-xs text-zinc-500 cursor-pointer"
                      >
                        Revisado y aprobado
                      </label>
                    </div>
                  </div>

                  {/* About Me */}
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                      <FileText className="h-3.5 w-3.5" />
                      Sobre ti
                    </Label>
                    <Textarea
                      className="cms-input min-h-24 text-sm"
                      value={profileFormData.about_me}
                      onChange={(e) =>
                        handleProfileFormChange("about_me", e.target.value)
                      }
                      placeholder="Cuéntanos sobre ti, tu experiencia y tus intereses..."
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      About you (English)
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        className="cms-input min-h-24 text-sm flex-1"
                        value={profileFormData.about_me_en}
                        onChange={(e) =>
                          handleProfileFormChange("about_me_en", e.target.value)
                        }
                        placeholder="Tell us about you in English..."
                        disabled={profileLoading || translatingField === "all"}
                      />
                      <button
                        type="button"
                        onClick={handleGenerateEnglish}
                        disabled={
                          !profileFormData.about_me.trim() ||
                          profileLoading ||
                          translatingField === "all"
                        }
                        className="inline-flex items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 px-3 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed self-start mt-2"
                        title="Generar texto en inglés automáticamente"
                      >
                        <Wand2 className="h-4 w-4 text-emerald-400" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="about_me_en_reviewed"
                        checked={profileReviewedFlags.about_me_en_reviewed}
                        onChange={(e) =>
                          setProfileReviewedFlags((prev) => ({
                            ...prev,
                            about_me_en_reviewed: e.target.checked,
                          }))
                        }
                        disabled={profileLoading}
                        className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                      />
                      <label
                        htmlFor="about_me_en_reviewed"
                        className="text-xs text-zinc-500 cursor-pointer"
                      >
                        Revisado y aprobado
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn flex-1"
                      onClick={() => {
                        setEditProfileOpen(false);
                        setProfileImagePreview(user.profile_image || null);
                        setCurrentCvUrl(user.cv_file || "");
                        setPendingCvFile(null);
                        setProfileFormData({
                          name: user.name || "",
                          name_en: user.name_en || "",
                          email: user.email || "",
                          professional_profile: user.professional_profile || "",
                          professional_profile_en:
                            user.professional_profile_en || "",
                          location: user.location || "",
                          location_en: user.location_en || "",
                          about_me: user.about_me || "",
                          about_me_en: user.about_me_en || "",
                        });
                        setProfileReviewedFlags({
                          name_en_reviewed: user.name_en_reviewed || false,
                          professional_profile_en_reviewed:
                            user.professional_profile_en_reviewed || false,
                          about_me_en_reviewed:
                            user.about_me_en_reviewed || false,
                          location_en_reviewed:
                            user.location_en_reviewed || false,
                        });
                      }}
                      disabled={profileLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="cms-primary-btn flex-1"
                      disabled={profileLoading || translatingField === "all"}
                    >
                      {profileLoading || cvUploading
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="cms-panel-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-zinc-100">
                Seguridad
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                Gestiona tu contraseña y configuración de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editPasswordOpen ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="mt-0.5 h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          Contraseña
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Última actualización:{" "}
                          {new Date().toLocaleDateString("es-CO")}
                        </p>
                        <p className="mt-2 text-xs text-zinc-400">
                          Recomendamos cambiar tu contraseña cada 90 días para
                          mantener tu cuenta segura.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setEditPasswordOpen(true)}
                    className="cms-primary-btn w-full"
                  >
                    Cambiar contraseña
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Contraseña actual
                    </Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        className="cms-input h-9 pr-10 text-sm"
                        value={passwordFormData.current_password}
                        onChange={(e) =>
                          handlePasswordFormChange(
                            "current_password",
                            e.target.value,
                          )
                        }
                        placeholder="••••••••"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        disabled={passwordLoading}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        className="cms-input h-9 pr-10 text-sm"
                        value={passwordFormData.new_password}
                        onChange={(e) =>
                          handlePasswordFormChange(
                            "new_password",
                            e.target.value,
                          )
                        }
                        placeholder="••••••••"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        disabled={passwordLoading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Mínimo 8 caracteres con mayúsculas, minúsculas y números
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-zinc-500">
                      Confirmar nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="cms-input h-9 pr-10 text-sm"
                        value={passwordFormData.confirm_password}
                        onChange={(e) =>
                          handlePasswordFormChange(
                            "confirm_password",
                            e.target.value,
                          )
                        }
                        placeholder="••••••••"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        disabled={passwordLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn flex-1"
                      onClick={() => {
                        setEditPasswordOpen(false);
                        setPasswordFormData({
                          current_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                        setShowCurrentPassword(false);
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                      }}
                      disabled={passwordLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="cms-primary-btn flex-1"
                      disabled={passwordLoading}
                    >
                      {passwordLoading
                        ? "Actualizando..."
                        : "Actualizar contraseña"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="cms-settings-side">
          {/* System Information */}
          <Card className="cms-panel-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-zinc-100">
                Información del Sistema
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                Detalles técnicos y estado de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    CMS Version
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-100">
                    1.0.0
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Estado
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm text-zinc-100">Operativo</p>
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Backend
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">FastAPI</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Base de datos
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">MySQL</p>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-emerald-200">
                      Todas las conexiones activas
                    </p>
                    <p className="text-xs text-emerald-600">
                      La base de datos y el API están funcionando correctamente.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </>
  );
}
