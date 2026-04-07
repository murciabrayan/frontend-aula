import { useEffect, useState } from "react";
import { CheckCircle2, FileText, PenLine, XCircle } from "lucide-react";

import { useFeedback } from "@/context/FeedbackContext";
import {
  getStudentPermissionLetters,
  respondPermissionLetter,
  type StudentPermissionLetter,
} from "@/api/permissionLetters";
import "@/commons/personas/styles/permissionLetters.css";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Pendiente";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const StudentPermissionLetters = () => {
  const { confirm, showToast } = useFeedback();
  const [items, setItems] = useState<StudentPermissionLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setItems(await getStudentPermissionLetters());
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Permisos",
        message: error.response?.data?.error || "No se pudieron cargar tus permisos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRespond = async (item: StudentPermissionLetter, action: "ACCEPT" | "REJECT") => {
    const accepted = await confirm({
      title: action === "ACCEPT" ? "Aceptar permiso como acudiente" : "Rechazar permiso como acudiente",
      message:
        action === "ACCEPT"
          ? "Al aceptar se registrara la firma guardada del acudiente y se archivara la respuesta en el perfil del estudiante."
          : "Se registrara el rechazo del acudiente y quedara constancia en el perfil del estudiante.",
      confirmText: action === "ACCEPT" ? "Aceptar como acudiente" : "Rechazar como acudiente",
      cancelText: "Cancelar",
    });

    if (!accepted) return;

    try {
      setSubmittingId(item.id);
      const response = await respondPermissionLetter(item.id, action);
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.item : entry)),
      );
      showToast({
        type: "success",
        title: "Permisos",
        message:
          action === "ACCEPT"
            ? "El permiso fue firmado correctamente con la firma guardada del acudiente."
            : "El rechazo del permiso fue registrado correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Permisos",
        message: error.response?.data?.error || "No se pudo registrar la respuesta del permiso.",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="permission-letters permission-letters--student">
      <div className="permission-letters__hero">
        <div>
          <p className="permission-letters__eyebrow">Permisos institucionales</p>
          <h2>Cartas y autorizaciones</h2>
          <p>
            Revisa los permisos enviados por el colegio para el menor y permite que el
            acudiente responda usando la firma guardada del perfil cuando corresponda.
          </p>
        </div>
      </div>

      <article className="permission-card permission-card--list">
        <div className="permission-card__header">
          <h3>Mis permisos</h3>
          <span>Consulta el historial del estudiante y el documento firmado por el acudiente.</span>
        </div>

        {loading ? (
          <div className="permission-empty">Cargando permisos...</div>
        ) : items.length ? (
          <div className="student-permission-list">
            {items.map((item) => (
              <article key={item.id} className="student-permission-card">
                <div className="student-permission-card__top">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.course_name}</span>
                  </div>
                  <span className={`permission-status permission-status--${item.status.toLowerCase()}`}>
                    {item.status === "PENDING"
                      ? "Pendiente"
                      : item.status === "ACCEPTED"
                        ? "Aceptado"
                        : "Rechazado"}
                  </span>
                </div>

                <p>{item.description || "Sin descripcion adicional."}</p>

                <div className="student-permission-card__meta">
                  <span>Respuesta: {formatDate(item.responded_at)}</span>
                </div>

                <div className="student-permission-card__actions">
                  {item.document_url ? (
                    <a href={item.document_url} target="_blank" rel="noreferrer" className="permission-link">
                      <FileText size={16} />
                      <span>Ver carta</span>
                    </a>
                  ) : null}

                  {item.signed_document_url ? (
                    <a href={item.signed_document_url} target="_blank" rel="noreferrer" className="permission-link permission-link--dark">
                      <PenLine size={16} />
                      <span>Ver respuesta</span>
                    </a>
                  ) : null}

                  {item.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        className="permission-action-btn permission-action-btn--accept"
                        disabled={submittingId === item.id}
                        onClick={() => void handleRespond(item, "ACCEPT")}
                      >
                        <CheckCircle2 size={16} />
                        <span>{submittingId === item.id ? "Guardando..." : "Acepto como acudiente"}</span>
                      </button>

                      <button
                        type="button"
                        className="permission-action-btn permission-action-btn--reject"
                        disabled={submittingId === item.id}
                        onClick={() => void handleRespond(item, "REJECT")}
                      >
                        <XCircle size={16} />
                        <span>Rechazar como acudiente</span>
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="permission-empty">Aun no tienes permisos enviados.</div>
        )}
      </article>
    </section>
  );
};

export default StudentPermissionLetters;
