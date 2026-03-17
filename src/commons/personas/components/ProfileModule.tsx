import { useEffect, useMemo, useState } from "react";
import { Camera, Eye, LockKeyhole, Mail, PencilLine, Save, Shield, User, X } from "lucide-react";
import api from "@/api/axios";
import { getCurrentUser, setCurrentUser } from "@/commons/Auth/services/auth.service";
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
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

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
        setPhotoPreview(response.data.photo_url || "");
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

      if (photoFile) {
        payload.append("profile_photo", photoFile);
      }

      await api.put("/api/profile/", payload);
      const refreshedProfile = await api.get("/api/profile/");
      setProfile(refreshedProfile.data);
      setDraft(refreshedProfile.data);
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(refreshedProfile.data.photo_url || "");

      const currentUser = getCurrentUser();
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          first_name: refreshedProfile.data.first_name,
          last_name: refreshedProfile.data.last_name,
          email: refreshedProfile.data.email,
          role: refreshedProfile.data.role,
          photo_url: refreshedProfile.data.photo_url || null,
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
    setPhotoPreview(profile?.photo_url || "");
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/api/change-password/", passwordData);
      setSuccess(response.data.message || "Contrasena actualizada correctamente.");
      setPasswordData({ old_password: "", new_password: "" });
      setShowPasswordModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo cambiar la contrasena.");
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
            <span>Cambiar contrasena</span>
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
            <span>Vista general de tu informacion</span>
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
                  ? "Carga una imagen para personalizar tu cuenta."
                  : "Visible en tu perfil y en accesos institucionales."}
              </span>
            </div>

            {editing ? (
              <label className="profile-avatar-card__upload">
                <Camera size={16} />
                <span>{photoFile ? photoFile.name : "Cambiar foto"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setPhotoFile(file);
                    setPhotoPreview(file ? URL.createObjectURL(file) : profile?.photo_url || "");
                  }}
                />
              </label>
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
            <span>{editing ? "Edita y guarda los cambios" : "Consulta tu informacion actual"}</span>
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
                  <span>Activa el modo edicion para actualizar tu perfil.</span>
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
              onClick={() => setShowPasswordModal(false)}
              aria-label="Cerrar modal"
            >
              <X size={18} />
            </button>

            <div className="profile-modal__header">
              <div className="profile-modal__icon">
                <LockKeyhole size={18} />
              </div>
              <div>
                <h3 id="password-modal-title">Cambiar contrasena</h3>
                <p>Actualiza tu acceso de forma segura.</p>
              </div>
            </div>

            <form className="profile-modal__form" onSubmit={handlePasswordChange}>
              <label className="profile-form__field profile-form__field--wide">
                <span>Contrasena actual</span>
                <input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      old_password: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="profile-form__field profile-form__field--wide">
                <span>Nueva contrasena</span>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      new_password: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <div className="profile-modal__actions">
                <button type="submit" className="profile-btn profile-btn--primary">
                  <Save size={18} />
                  <span>Actualizar</span>
                </button>

                <button
                  type="button"
                  className="profile-btn profile-btn--secondary"
                  onClick={() => setShowPasswordModal(false)}
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
