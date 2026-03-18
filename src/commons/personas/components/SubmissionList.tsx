import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, Eye, PencilLine } from "lucide-react";
import { useFeedback } from "@/context/FeedbackContext";

const API_BASE = "http://127.0.0.1:8000/api";

interface Props {
  assignmentId: number;
}

interface Submission {
  id: number;
  tarea: number;
  estudiante: number;
  estudiante_nombre: string;
  archivo?: string | null;
  fecha_entrega: string;
  calificacion?: number | null;
  retroalimentacion?: string | null;
}

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString("es-CO");
  } catch {
    return value;
  }
};

const SubmissionList: React.FC<Props> = ({ assignmentId }) => {
  const { showToast } = useFeedback();
  const token = localStorage.getItem("access_token");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSubmissions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/submissions/?assignment=${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubmissions(res.data || []);
    } catch (error) {
      console.error("Error cargando entregas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const orderedSubmissions = useMemo(
    () =>
      [...submissions].sort((a, b) =>
        a.estudiante_nombre.localeCompare(b.estudiante_nombre, "es", {
          sensitivity: "base",
        }),
      ),
    [submissions],
  );

  const openGradeModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(
      submission.calificacion !== null && submission.calificacion !== undefined
        ? String(submission.calificacion)
        : "",
    );
    setFeedback(submission.retroalimentacion || "");
  };

  const saveGrade = async () => {
    if (!selectedSubmission) return;

    try {
      setSaving(true);

      await axios.post(
        `${API_BASE}/submissions/${selectedSubmission.id}/calificar/`,
        {
          calificacion: grade,
          retroalimentacion: feedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await loadSubmissions();

      showToast({
        type: "success",
        title: "Calificacion guardada",
        message: "La calificacion se guardo correctamente.",
      });
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error guardando calificacion", error);
      showToast({
        type: "error",
        title: "Calificacion",
        message: "No se pudo guardar la calificacion.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="teacher-submission-panel">
      <div className="teacher-submission-panel__head">
        <h3>Entregas de estudiantes</h3>
        <p>Consulta archivos, fechas y registra calificaciones con un flujo mas claro.</p>
      </div>

      {loading ? (
        <div className="teacher-task-empty">Cargando entregas...</div>
      ) : orderedSubmissions.length === 0 ? (
        <div className="teacher-task-empty">Aun no hay entregas para esta tarea.</div>
      ) : (
        <div className="teacher-submission-table-wrap">
          <table className="teacher-submission-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Archivo</th>
                <th>Fecha de entrega</th>
                <th>Nota</th>
                <th>Retroalimentacion</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {orderedSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="teacher-task-table__title">{submission.estudiante_nombre}</td>

                  <td>
                    {submission.archivo ? (
                      <a
                        href={submission.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="teacher-file-link"
                      >
                        <Download size={14} />
                        Ver archivo
                      </a>
                    ) : (
                      <span className="teacher-muted">Sin archivo</span>
                    )}
                  </td>

                  <td>{formatDateTime(submission.fecha_entrega)}</td>

                  <td>
                    {submission.calificacion !== null &&
                    submission.calificacion !== undefined ? (
                      <span className="teacher-grade-chip">
                        {Number(submission.calificacion).toFixed(1)}
                      </span>
                    ) : (
                      <span className="teacher-muted">Sin calificar</span>
                    )}
                  </td>

                  <td className="teacher-task-table__description">
                    {submission.retroalimentacion || "Sin observaciones"}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="teacher-task-action-btn primary"
                      onClick={() => openGradeModal(submission)}
                    >
                      <PencilLine size={15} />
                      {submission.calificacion !== null &&
                      submission.calificacion !== undefined
                        ? "Editar"
                        : "Calificar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <div className="teacher-task-modal-backdrop layer-2">
          <div className="teacher-task-modal form">
            <div className="teacher-task-modal__header">
              <div className="teacher-task-modal__headline">
                <span>Calificacion</span>
                <h2>{selectedSubmission.estudiante_nombre}</h2>
              </div>
              <button
                type="button"
                className="teacher-task-close-btn"
                onClick={() => setSelectedSubmission(null)}
                aria-label="Cerrar calificacion"
              >
                ×
              </button>
            </div>

            <div className="teacher-task-modal__body teacher-grade-modal__body">
              <div className="teacher-grade-modal__student">
                <strong>Entrega recibida</strong>
                <span>{formatDateTime(selectedSubmission.fecha_entrega)}</span>
              </div>

              {selectedSubmission.archivo && (
                <a
                  href={selectedSubmission.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="teacher-file-link large"
                >
                  <Eye size={15} />
                  Abrir archivo entregado
                </a>
              )}

              <div className="teacher-grade-form">
                <label>Calificacion</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Ej: 4.5"
                />

                <label>Retroalimentacion</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escribe observaciones para el estudiante..."
                />
              </div>
            </div>

            <div className="teacher-task-modal__footer">
              <button
                type="button"
                className="teacher-btn-secondary"
                onClick={() => setSelectedSubmission(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="teacher-btn-primary"
                onClick={saveGrade}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar calificacion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;
