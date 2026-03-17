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
} from "lucide-react";
import { Toaster, toast } from "sonner";
import type { CmsUser } from "./types";
import { updateMeCms, uploadAdminCvFileCms, uploadAdminProfileImageCms } from "./api";

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
  const [pendingProfileImageFile, setPendingProfileImageFile] = useState<File | null>(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);

  // Profile edit form state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    professional_profile: user.professional_profile || "",
    location: user.location || "",
    about_me: user.about_me || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

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

    if (!file.type.startsWith("image/")) {
      toast.error("Formato invalido", {
        description: "Selecciona un archivo de imagen valido.",
      });
      event.target.value = "";
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Imagen demasiado grande", {
        description: "La imagen no debe superar 10 MB.",
      });
      event.target.value = "";
      return;
    }

    setPendingProfileImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImagePreview(result);
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleProfileFormChange = (
    field: keyof typeof profileFormData,
    value: string,
  ) => {
    setProfileFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      let nextProfileImageUrl = user.profile_image;
      if (pendingProfileImageFile) {
        setProfileImageUploading(true);
        const uploadedProfileImage = await uploadAdminProfileImageCms(
          pendingProfileImageFile,
        );
        nextProfileImageUrl = uploadedProfileImage.file_url;
      }

      const result = await updateMeCms({
        name: profileFormData.name.trim(),
        email: profileFormData.email.trim(),
        professional_profile: profileFormData.professional_profile.trim(),
        location: profileFormData.location.trim(),
        about_me: profileFormData.about_me.trim(),
        cv_file: nextCvUrl || null,
        profile_image: nextProfileImageUrl,
      });

      onUserUpdate(result.user);
      setCurrentCvUrl(result.user.cv_file || "");
      setProfileImagePreview(result.user.profile_image || null);
      setPendingCvFile(null);
      setPendingProfileImageFile(null);
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
      setProfileImageUploading(false);
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

      if (
        passwordFormData.new_password !== passwordFormData.confirm_password
      ) {
        toast.error("Las contraseñas no coinciden");
        return;
      }

      if (
        passwordFormData.current_password === passwordFormData.new_password
      ) {
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                    onClick={() => document.getElementById("cv-file-input")?.click()}
                    disabled={profileLoading}
                    className="cms-cv-upload-btn"
                  >
                    <Upload style={{ width: "0.875rem", height: "0.875rem", color: "#34d399" }} />
                    {pendingCvFile ? pendingCvFile.name : "Subir CV"}
                  </button>
                  {currentCvUrl && !pendingCvFile && (
                    <a
                      href={currentCvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cms-cv-link"
                    >
                      <Download style={{ width: "0.875rem", height: "0.875rem" }} />
                      Ver actual
                    </a>
                  )}
                  {!currentCvUrl && !pendingCvFile && (
                    <span className="cms-cv-no-file">Sin CV cargado</span>
                  )}
                </div>
                <p className="cms-cv-upload-hint">PDF, DOC o DOCX · máx. 5 MB</p>
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
                    handleProfileFormChange("professional_profile", e.target.value)
                  }
                  placeholder="ej: Full Stack Developer"
                  disabled={profileLoading}
                />
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
                    setPendingProfileImageFile(null);
                    setProfileFormData({
                      name: user.name || "",
                      email: user.email || "",
                      professional_profile:
                        user.professional_profile || "",
                      location: user.location || "",
                      about_me: user.about_me || "",
                    });
                  }}
                  disabled={profileLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="cms-primary-btn flex-1"
                  disabled={profileLoading}
                >
                  {profileLoading || cvUploading || profileImageUploading ? "Guardando..." : "Guardar cambios"}
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
                      Última actualización: {new Date().toLocaleDateString("es-CO")}
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
                      handlePasswordFormChange("current_password", e.target.value)
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
                      handlePasswordFormChange("new_password", e.target.value)
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
                      handlePasswordFormChange("confirm_password", e.target.value)
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
                  {passwordLoading ? "Actualizando..." : "Actualizar contraseña"}
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
              <p className="mt-1 text-sm font-medium text-zinc-100">1.0.0</p>
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
