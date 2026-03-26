import { useEffect, useMemo, useState } from "react";
import { Camera, Eye, EyeOff, LockKeyhole, Mail, PencilLine, Save, Shield, User, X } from "lucide-react";
import api from "@/api/axios";
import PasswordRequirements from "@/components/PasswordRequirements";
import { getCurrentUser, setCurrentUser } from "@/commons/Auth/services/auth.service";
import { IMAGE_ACCEPT, IMAGE_MAX_SIZE_MB, validateImageFile } from "@/utils/imageUpload";
import { isStrongPassword } from "@/utils/passwordValidation";
import "./profile.css";

type FieldType = "text" | "email";

export interface ProfileField {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
}

export interface ProfileSection {
  title: string;
  description?: string;
  fields: ProfileField[];
}

interface ProfileModuleProps {
  roleTitle: string;
  roleDescription: string;
  sections: ProfileSection[];
}

type ProfileData = Record<string, string>;

const AVATAR_STYLES = [
  { value: "adventurer-neutral", label: "Clasico" },
  { value: "lorelei-neutral", label: "Artistico" },
  { value: "personas", label: "Moderno" },
  { value: "thumbs", label: "3D suave" },
];

const buildDiceBearUrl = (style: string, seed: string) =>
  `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

const baseSummary = [
  { key: "first_name", label: "Nombre", icon: User },
  { key: "last_name", label: "Apellido", icon: User },
  { key: "email", label: "Correo", icon: Mail },
];

const ProfileModule = ({
  roleTitle,
  roleDescription,
  sections,
}: ProfileModuleProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPasswordData, setShowPasswordData] = useState({
    old_password: false,
    new_password: false,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [avatarStyle, setAvatarStyle] = useState("adventurer-neutral");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [clearProfilePhoto, setClearProfilePhoto] = useState(false);

  const allFields = useMemo(
    () => sections.flatMap((section) => section.fields),
    [sections]
  );

  const summaryItems = useMemo(() => {
    const roleSpecific = allFields
      .filter(
        (field) => !["first_name", "last_name", "email"].includes(field.name)
      )
      .slice(0, 3)
      .map((field) => ({
        key: field.name,
        label: field.label,
        icon: field.name.includes("email") ? Mail : Shield,
      }));

    return [...baseSummary, ...roleSpecific];
  }, [allFields]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/");
        setProfile(response.data);
        setDraft(response.data);
        setAvatarStyle(response.data.avatar_style || "adventurer-neutral");
        setAvatarSeed(response.data.avatar_seed || "");
        setPhotoPreview(response.data.avatar_url || response.data.photo_url || "");
      } catch {
        setError("No fue posible cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFieldChange = (name: string, value: string) => {
    setDraft((current) => ({ ...(current ?? {}), [name]: value }));
  };

  const avatarSeedBase = useMemo(() => {
    const firstName = (draft?.first_name || "").trim();
    const lastName = (draft?.last_name || "").trim();
    const email = (draft?.email || "").trim();
    return `${firstName} ${lastName}`.trim() || email || "usuario";
  }, [draft]);

  const avatarOptions = useMemo(
    () =>
      AVATAR_STYLES.map((style, index) => ({
        ...style,
        seed: `${avatarSeedBase}-${index + 1}`,
        url: buildDiceBearUrl(style.value, `${avatarSeedBase}-${index + 1}`),
      })),
    [avatarSeedBase],
  );

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();

      Object.entries(draft ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });

      payload.append("avatar_style", avatarStyle);
      payload.append("avatar_seed", avatarSeed || avatarSeedBase);
      payload.append("clear_profile_photo", clearProfilePhoto ? "true" : "false");

      if (photoFile) {
        payload.append("profile_photo", photoFile);
      }

      await api.put("/api/profile/", payload);
      const refreshedProfile = await api.get("/api/profile/");
      setProfile(refreshedProfile.data);
      setDraft(refreshedProfile.data);
      setEditing(false);
      setPhotoFile(null);
      setClearProfilePhoto(false);
      setAvatarStyle(refreshedProfile.data.avatar_style || "adventurer-neutral");
      setAvatarSeed(refreshedProfile.data.avatar_seed || "");
      setPhotoPreview(refreshedProfile.data.avatar_url || refreshedProfile.data.photo_url || "");

      const currentUser = getCurrentUser();
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          first_name: refreshedProfile.data.first_name,
          last_name: refreshedProfile.data.last_name,
          email: refreshedProfile.data.email,
          role: refreshedProfile.data.role,
          photo_url: refreshedProfile.data.photo_url || null,
          avatar_url: refreshedProfile.data.avatar_url || refreshedProfile.data.photo_url || null,
          avatar_style: refreshedProfile.data.avatar_style,
          avatar_seed: refreshedProfile.data.avatar_seed,
        });
      }

      setSuccess("Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo actualizar el perfil.");
    }
  };

  const handleCancelEdit = () => {
    setDraft(profile);
    setEditing(false);
    setError("");
    setPhotoFile(null);
    setClearProfilePhoto(false);
    setAvatarStyle(profile?.avatar_style || "adventurer-neutral");
    setAvatarSeed(profile?.avatar_seed || "");
    setPhotoPreview(profile?.avatar_url || profile?.photo_url || "");
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isStrongPassword(passwordData.new_password)) {
      setPasswordTouched(true);
      return;
    }

    try {
      const response = await api.post("/api/change-password/", passwordData);
      setSuccess(response.data.message || "Contrase\u00f1a actualizada correctamente.");
      setPasswordData({ old_password: "", new_password: "" });
      setPasswordTouched(false);
      setShowPasswordModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo cambiar la contrase\u00f1a.");
    }
  };

  if (loading) {
    return <div className="profile-state">Cargando perfil...</div>;
  }

  if (!profile || !draft) {
    return <div className="profile-state profile-state--error">No se pudo cargar el perfil.</div>;
  }

  return (
    <section className="profile-module">
      <div className="profile-module__hero">
        <div>
          <p className="profile-module__eyebrow">{roleTitle}</p>
          <h2>Mi perfil</h2>
          <p>{roleDescription}</p>
        </div>

        <div className="profile-module__actions">
          <button
            type="button"
            className="profile-btn profile-btn--ghost"
            onClick={() => setShowPasswordModal(true)}
          >
            <LockKeyhole size={18} />
            <span>{"Cambiar contrase\u00f1a"}</span>
          </button>

          {!editing ? (
            <button
              type="button"
              className="profile-btn profile-btn--primary"
              onClick={() => {
                setDraft(profile);
                setEditing(true);
                setError("");
                setSuccess("");
              }}
            >
              <PencilLine size={18} />
              <span>Editar perfil</span>
            </button>
          ) : null}
        </div>
      </div>

      {success ? <div className="profile-alert profile-alert--success">{success}</div> : null}
      {error ? <div className="profile-alert profile-alert--error">{error}</div> : null}

      <div className="profile-grid">
        <article className="profile-card profile-card--summary">
          <div className="profile-card__header">
            <h3>Resumen</h3>
            <span>{"Vista general de tu informaci\u00f3n"}</span>
          </div>

          <div className="profile-avatar-card">
            <div className="profile-avatar-card__image">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto de perfil" />
              ) : (
                <User size={42} />
              )}
            </div>

            <div className="profile-avatar-card__copy">
              <strong>Foto de perfil</strong>
              <span>
                {editing
                  ? "Sube una foto o elige un avatar DiceBear para personalizar tu cuenta."
                  : "Visible en tu perfil, la landing y los accesos institucionales."}
              </span>
            </div>

            {editing ? (
              <div className="profile-avatar-card__controls">
                <label className="profile-avatar-card__upload">
                  <Camera size={16} />
                  <span>{photoFile ? photoFile.name : "Subir foto"}</span>
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      if (file) {
                        const validationError = validateImageFile(file);
                        if (validationError) {
                          setError(validationError);
                          event.target.value = "";
                          return;
                        }
                      }
                      setPhotoFile(file);
                      setClearProfilePhoto(false);
                      setError("");
                      setPhotoPreview(
                        file
                          ? URL.createObjectURL(file)
                          : profile?.avatar_url || profile?.photo_url || "",
                      );
                    }}
                  />
                </label>
                <span className="profile-avatar-card__hint">
                  {"Solo JPG, JPEG o PNG. Tama\u00f1o m\u00e1ximo:"} {IMAGE_MAX_SIZE_MB} MB.
                </span>

                <button
                  type="button"
                  className="profile-avatar-card__upload profile-avatar-card__upload--ghost"
                  onClick={() => {
                    const option = avatarOptions[0];
                    setPhotoFile(null);
                    setClearProfilePhoto(true);
                    setAvatarStyle(option.value);
                    setAvatarSeed(option.seed);
                    setPhotoPreview(option.url);
                  }}
                >
                  Usar avatar
                </button>
              </div>
            ) : null}

            {editing ? (
              <div className="profile-avatar-picker">
                <div className="profile-avatar-picker__header">
                  <strong>Elige un avatar</strong>
                  <span>{"Se guardar\u00e1 como alternativa a la foto de perfil."}</span>
                </div>

                <div className="profile-avatar-picker__grid">
                  {avatarOptions.map((option) => (
                    <button
                      key={`${option.value}-${option.seed}`}
                      type="button"
                      className={`profile-avatar-option ${
                        avatarStyle === option.value && (avatarSeed || avatarSeedBase) === option.seed
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() => {
                        setPhotoFile(null);
                        setClearProfilePhoto(true);
                        setAvatarStyle(option.value);
                        setAvatarSeed(option.seed);
                        setPhotoPreview(option.url);
                      }}
                    >
                      <img src={option.url} alt={option.label} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="profile-summary">
            {summaryItems.map(({ key, label, icon: Icon }) => (
              <div key={key} className="profile-summary__item">
                <div className="profile-summary__icon">
                  <Icon size={18} />
                </div>
                <div>
                  <p>{label}</p>
                  <strong>{profile[key] || "No registrado"}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-card profile-card--form">
          <div className="profile-card__header">
            <h3>Datos del perfil</h3>
            <span>{editing ? "Edita y guarda los cambios" : "Consulta tu informaci\u00f3n actual"}</span>
          </div>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            {sections.map((section) => (
              <div key={section.title} className="profile-form__section">
                <div className="profile-form__section-header">
                  <h4>{section.title}</h4>
                  {section.description ? <p>{section.description}</p> : null}
                </div>

                <div className="profile-form__grid">
                  {section.fields.map((field) => (
                    <label
                      key={field.name}
                      className={`profile-form__field ${
                        field.name.includes("acudiente_") ? "profile-form__field--wide" : ""
                      }`}
                    >
                      <span>{field.label}</span>
                      <input
                        type={field.type ?? "text"}
                        value={draft[field.name] || ""}
                        placeholder={field.placeholder || field.label}
                        onChange={(event) =>
                          handleFieldChange(field.name, event.target.value)
                        }
                        disabled={!editing}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="profile-form__footer">
              {editing ? (
                <>
                  <button type="submit" className="profile-btn profile-btn--primary">
                    <Save size={18} />
                    <span>Guardar cambios</span>
                  </button>

                  <button
                    type="button"
                    className="profile-btn profile-btn--secondary"
                    onClick={handleCancelEdit}
                  >
                    <X size={18} />
                    <span>Cancelar</span>
                  </button>
                </>
              ) : (
                <div className="profile-form__hint">
                  <Eye size={16} />
                  <span>{"Activa el modo edici\u00f3n para actualizar tu perfil."}</span>
                </div>
              )}
            </div>
          </form>
        </article>
      </div>

      {showPasswordModal ? (
        <div
          className="profile-modal__overlay"
          role="presentation"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="profile-modal__close"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordTouched(false);
              }}
              aria-label="Cerrar modal"
            >
              <X size={18} />
            </button>

            <div className="profile-modal__header">
              <div className="profile-modal__icon">
                <LockKeyhole size={18} />
              </div>
              <div>
                <h3 id="password-modal-title">{"Cambiar contrase\u00f1a"}</h3>
                <p>Actualiza tu acceso de forma segura.</p>
              </div>
            </div>

            <form className="profile-modal__form" onSubmit={handlePasswordChange}>
              <label className="profile-form__field profile-form__field--wide">
                <span>{"Contrase\u00f1a actual"}</span>
                <div className="profile-password-input">
                  <input
                    type={showPasswordData.old_password ? "text" : "password"}
                    value={passwordData.old_password}
                    onChange={(event) =>
                      setPasswordData((current) => ({
                        ...current,
                        old_password: event.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="profile-password-toggle"
                    onClick={() =>
                      setShowPasswordData((current) => ({
                        ...current,
                        old_password: !current.old_password,
                      }))
                    }
                    aria-label={
                      showPasswordData.old_password
                        ? "Ocultar contrase\u00f1a actual"
                        : "Mostrar contrase\u00f1a actual"
                    }
                  >
                    {showPasswordData.old_password ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label className="profile-form__field profile-form__field--wide">
                <span>{"Nueva contrase\u00f1a"}</span>
                <div className="profile-password-input">
                  <input
                    type={showPasswordData.new_password ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(event) =>
                      setPasswordData((current) => ({
                        ...current,
                        new_password: event.target.value,
                      }))
                    }
                    onBlur={() => setPasswordTouched(true)}
                    required
                  />
                  <button
                    type="button"
                    className="profile-password-toggle"
                    onClick={() =>
                      setShowPasswordData((current) => ({
                        ...current,
                        new_password: !current.new_password,
                      }))
                    }
                    aria-label={
                      showPasswordData.new_password
                        ? "Ocultar nueva contrase\u00f1a"
                        : "Mostrar nueva contrase\u00f1a"
                    }
                  >
                    {showPasswordData.new_password ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {(passwordTouched || passwordData.new_password) ? (
                  <PasswordRequirements
                    password={passwordData.new_password}
                    className="profile-password-requirements"
                  />
                ) : null}
              </label>

              <div className="profile-modal__actions">
                <button type="submit" className="profile-btn profile-btn--primary">
                  <Save size={18} />
                  <span>Actualizar</span>
                </button>

                <button
                  type="button"
                  className="profile-btn profile-btn--secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordTouched(false);
                  }}
                >
                  <X size={18} />
                  <span>Cancelar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ProfileModule;
