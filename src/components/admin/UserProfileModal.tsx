import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, Eye, FileText, Save, Upload, UserRound, X } from "lucide-react";
import { useFeedback } from "@/context/FeedbackContext";
import type { User, UserDocument } from "../../types/User";
import "./UserManagement.css";

interface Props {
  user: User;
  onClose: () => void;
  onSave: () => Promise<void> | void;
}

interface EditableState {
  first_name: string;
  last_name: string;
  email: string;
  cedula: string;
  grado: string;
  acudiente_nombre: string;
  acudiente_telefono: string;
  acudiente_email: string;
  especialidad: string;
  titulo: string;
}

const onlyNumbers = (value: string) => value.replace(/\D/g, "");
const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const buildStateFromUser = (user: User): EditableState => ({
  first_name: user.first_name || "",
  last_name: user.last_name || "",
  email: user.email || "",
  cedula: user.cedula || "",
  grado: user.student_profile?.grado || "",
  acudiente_nombre: user.student_profile?.acudiente_nombre || "",
  acudiente_telefono: user.student_profile?.acudiente_telefono || "",
  acudiente_email: user.student_profile?.acudiente_email || "",
  especialidad: user.teacher_profile?.especialidad || "",
  titulo: user.teacher_profile?.titulo || "",
});

const getDownloadName = (title: string, fileUrl: string) => {
  const extension = fileUrl.split(".").pop();
  return `${title}${extension ? `.${extension}` : ".pdf"}`;
};

const UserProfileModal = ({ user, onClose, onSave }: Props) => {
  const { showToast, confirm } = useFeedback();
  const [formData, setFormData] = useState<EditableState>(buildStateFromUser(user));
  const [documents, setDocuments] = useState<UserDocument[]>(user.documents || []);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentCategory, setDocumentCategory] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(buildStateFromUser(user));
    setDocuments(user.documents || []);
  }, [user]);

  const token = localStorage.getItem("access") || localStorage.getItem("access_token");

  const roleLabel = useMemo(
    () => (user.role === "STUDENT" ? "Estudiante" : "Docente"),
    [user.role],
  );

  const roleSummary = useMemo(() => {
    if (user.role === "STUDENT") {
      return user.student_profile?.grado || "Sin grado";
    }
    return user.teacher_profile?.especialidad || "Sin especialidad";
  }, [user]);

  const handleFieldChange = (name: keyof EditableState, value: string) => {
    const normalizedValue =
      name === "cedula"
        ? onlyNumbers(value)
        : name === "acudiente_telefono"
          ? onlyNumbers(value).slice(0, 10)
          : value;

    setFormData((current) => ({ ...current, [name]: normalizedValue }));
  };

  const refreshDocuments = async () => {
    if (!token || !user.id) return;
    const response = await axios.get(
      `http://127.0.0.1:8000/api/users/${user.id}/documents/`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setDocuments(response.data);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !user.id) return;

    if (!formData.email.includes("@")) {
      showToast({
        type: "warning",
        title: "Correo invalido",
        message: "Ingresa un correo valido que incluya arroba.",
      });
      return;
    }

    if (!formData.cedula.trim()) {
      showToast({
        type: "warning",
        title: "Cedula",
        message: "La cedula es obligatoria y solo puede contener numeros.",
      });
      return;
    }

    if (
      user.role === "STUDENT" &&
      formData.acudiente_telefono &&
      formData.acudiente_telefono.length !== 10
    ) {
      showToast({
        type: "warning",
        title: "Telefono",
        message: "El telefono del acudiente debe tener exactamente 10 numeros.",
      });
      return;
    }

    const payload: Record<string, string> = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      cedula: formData.cedula.trim(),
      role: user.role,
    };

    if (user.role === "STUDENT") {
      payload.grado = formData.grado.trim();
      payload.acudiente_nombre = formData.acudiente_nombre.trim();
      payload.acudiente_telefono = formData.acudiente_telefono.trim();
      payload.acudiente_email = formData.acudiente_email.trim();
    }

    if (user.role === "TEACHER") {
      payload.especialidad = formData.especialidad.trim();
      payload.titulo = formData.titulo.trim();
    }

    try {
      setSaving(true);
      await axios.patch(`http://127.0.0.1:8000/api/users/${user.id}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await onSave();
      showToast({
        type: "success",
        title: "Perfil actualizado",
        message: "Los cambios del perfil se guardaron correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Perfil",
        message: error.response?.data?.detail || "No se pudo actualizar el perfil.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !user.id || !documentFile || !documentTitle.trim()) {
      showToast({
        type: "warning",
        title: "Documentos",
        message: "Agrega un titulo y selecciona un archivo antes de subirlo.",
      });
      return;
    }

    if (!isPdfFile(documentFile)) {
      showToast({
        type: "warning",
        title: "Documentos",
        message: "Solo se permiten archivos PDF.",
      });
      return;
    }

    const payload = new FormData();
    payload.append("title", documentTitle.trim());
    payload.append("category", documentCategory.trim());
    payload.append("file", documentFile);

    try {
      await axios.post(`http://127.0.0.1:8000/api/users/${user.id}/documents/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocumentTitle("");
      setDocumentCategory("");
      setDocumentFile(null);
      await refreshDocuments();
      await onSave();
      showToast({
        type: "success",
        title: "Documento cargado",
        message: "El documento se guardo correctamente en el perfil.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Documentos",
        message: error.response?.data?.detail || "No se pudo cargar el documento.",
      });
    }
  };

  const handleDeleteDocument = async (documentId?: number) => {
    if (!token || !user.id || !documentId) return;

    const accepted = await confirm({
      title: "Eliminar documento",
      message: "Esta accion quitara el archivo del perfil del usuario.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!accepted) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/users/${user.id}/documents/${documentId}/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await refreshDocuments();
      await onSave();
      showToast({
        type: "success",
        title: "Documento eliminado",
        message: "El documento se elimino correctamente.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Documentos",
        message: "No se pudo eliminar el documento.",
      });
    }
  };

  const handleDownloadDocument = async (fileUrl?: string | null, title?: string) => {
    if (!fileUrl || !title) return;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = getDownloadName(title, fileUrl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("No se pudo descargar el documento:", error);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="user-profile-modal__header">
          <div className="user-profile-modal__identity">
            <div className="user-profile-modal__avatar">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.first_name} /> : <UserRound size={48} />}
            </div>
            <div>
              <span className="user-profile-modal__eyebrow">{roleLabel}</span>
              <h2>
                {user.first_name} {user.last_name}
              </h2>
              <p>{roleSummary}</p>
            </div>
          </div>
        </div>

        <div className="user-profile-modal__body">
          <form className="user-profile-panel" onSubmit={handleSaveProfile}>
            <div className="user-profile-panel__grid">
              <label>
                <span>Nombre</span>
                <input value={formData.first_name} onChange={(e) => handleFieldChange("first_name", e.target.value)} />
              </label>
              <label>
                <span>Apellido</span>
                <input value={formData.last_name} onChange={(e) => handleFieldChange("last_name", e.target.value)} />
              </label>
              <label>
                <span>Documento</span>
                <input
                  value={formData.cedula}
                  onChange={(e) => handleFieldChange("cedula", e.target.value)}
                  inputMode="numeric"
                  maxLength={20}
                />
              </label>
              <label>
                <span>Correo</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onInvalid={(e) =>
                    e.currentTarget.setCustomValidity("Ingresa un correo valido que incluya arroba.")
                  }
                  onInput={(e) => e.currentTarget.setCustomValidity("")}
                />
              </label>

              {user.role === "STUDENT" ? (
                <>
                  <label>
                    <span>Grado</span>
                    <input value={formData.grado} onChange={(e) => handleFieldChange("grado", e.target.value)} />
                  </label>
                  <label>
                    <span>Nombre del acudiente</span>
                    <input value={formData.acudiente_nombre} onChange={(e) => handleFieldChange("acudiente_nombre", e.target.value)} />
                  </label>
                  <label>
                    <span>Telefono del acudiente</span>
                    <input
                      value={formData.acudiente_telefono}
                      onChange={(e) => handleFieldChange("acudiente_telefono", e.target.value)}
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </label>
                  <label>
                    <span>Correo del acudiente</span>
                    <input
                      type="email"
                      value={formData.acudiente_email}
                      onChange={(e) => handleFieldChange("acudiente_email", e.target.value)}
                      onInvalid={(e) =>
                        e.currentTarget.setCustomValidity("Ingresa un correo valido que incluya arroba.")
                      }
                      onInput={(e) => e.currentTarget.setCustomValidity("")}
                    />
                  </label>
                </>
              ) : null}

              {user.role === "TEACHER" ? (
                <>
                  <label>
                    <span>Especialidad</span>
                    <input value={formData.especialidad} onChange={(e) => handleFieldChange("especialidad", e.target.value)} />
                  </label>
                  <label>
                    <span>Titulo academico</span>
                    <input value={formData.titulo} onChange={(e) => handleFieldChange("titulo", e.target.value)} />
                  </label>
                </>
              ) : null}
            </div>

            <div className="user-profile-panel__footer">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
              </button>
            </div>
          </form>

          <section className="user-documents-panel">
            <div className="user-documents-panel__header">
              <h3>Documentos</h3>
              <p>Sube y administra soportes del perfil como matriculas o documentos escaneados.</p>
            </div>

            <form className="user-documents-upload" onSubmit={handleUploadDocument}>
              <input
                type="text"
                placeholder="Nombre del documento"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Categoria"
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
              />
              <label className="user-documents-upload__file">
                <Upload size={16} />
                <span>{documentFile ? documentFile.name : "Seleccionar archivo"}</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    if (selectedFile && !isPdfFile(selectedFile)) {
                      showToast({
                        type: "warning",
                        title: "Documentos",
                        message: "Solo se permiten archivos PDF.",
                      });
                      e.currentTarget.value = "";
                      setDocumentFile(null);
                      return;
                    }
                    setDocumentFile(selectedFile);
                  }}
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Subir documento
              </button>
            </form>

            <div className="user-documents-grid">
              {documents.length ? (
                documents.map((document) => (
                  <article key={document.id} className="user-document-card">
                    <div className="user-document-card__preview">
                      <div className="user-document-card__sheet">
                        <div className="user-document-card__paper">
                          <div className="user-document-card__paper-fold" />
                          <div className="user-document-card__paper-header">
                            <div className="user-document-card__icon">
                              <FileText size={24} />
                            </div>
                            <div className="user-document-card__sheet-meta">
                              <strong>{document.title}</strong>
                              <span>{document.category || "Documento institucional"}</span>
                            </div>
                          </div>
                          <div className="user-document-card__sheet-stamp-row">
                            <div className="user-document-card__sheet-photo" />
                            <div className="user-document-card__sheet-stamp" />
                          </div>
                          <div className="user-document-card__sheet-lines">
                            <span />
                            <span />
                            <span />
                            <span />
                          </div>
                          <div className="user-document-card__sheet-footer">
                            <span />
                            <span />
                          </div>
                        </div>
                      </div>
                      <div className="user-document-card__preview-badge">
                        <FileText size={14} />
                        <span>PDF</span>
                      </div>
                    </div>
                    <div className="user-document-card__body">
                      <strong>{document.title}</strong>
                      <span>{document.category || "Documento institucional"}</span>
                    </div>
                    <div className="user-document-card__actions">
                      {document.file_url ? (
                        <>
                          <a href={document.file_url} target="_blank" rel="noreferrer" className="btn">
                            <Eye size={16} />
                            <span>Ver</span>
                          </a>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => void handleDownloadDocument(document.file_url, document.title)}
                          >
                            <Download size={16} />
                            <span>Descargar</span>
                          </button>
                        </>
                      ) : null}
                      <button type="button" className="btn btn-delete-text" onClick={() => handleDeleteDocument(document.id)}>
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="user-documents-empty">Aun no hay documentos cargados para este perfil.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
