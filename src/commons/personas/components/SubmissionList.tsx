import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiEye, FiUpload } from "react-icons/fi";
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
    } catch (err) {
      console.error("Error cargando entregas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const orderedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) =>
      a.estudiante_nombre.localeCompare(b.estudiante_nombre, "es", {
        sensitivity: "base",
      })
    );
  }, [submissions]);

  const openGradeModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(
      submission.calificacion !== null && submission.calificacion !== undefined
        ? String(submission.calificacion)
        : ""
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
        }
      );

      await loadSubmissions();

      showToast({
        type: "success",
        title: "Calificacion guardada",
        message: "La calificacion se guardo correctamente.",
      });
      setSelectedSubmission(null);
    } catch (err) {
      console.error("Error guardando calificación", err);
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
    <div className="section-block">
      <div className="section-block-header">
        <h3>Entregas de estudiantes</h3>
        <p>Consulta archivos, fechas y registra calificaciones.</p>
      </div>

      {loading ? (
        <div className="empty-state-box">Cargando entregas...</div>
      ) : orderedSubmissions.length === 0 ? (
        <div className="empty-state-box">
          Aún no hay entregas para esta tarea.
        </div>
      ) : (
        <div className="teacher-table-wrapper">
          <table className="teacher-data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Archivo</th>
                <th>Fecha de entrega</th>
                <th>Nota</th>
                <th>Retroalimentación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {orderedSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="table-title-cell">
                    {submission.estudiante_nombre}
                  </td>

                  <td>
                    {submission.archivo ? (
                      <a
                        href={submission.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="table-file-link"
                      >
                        <FiUpload size={14} />
                        Ver archivo
                      </a>
                    ) : (
                      <span className="muted-cell">Sin archivo</span>
                    )}
                  </td>

                  <td>{new Date(submission.fecha_entrega).toLocaleString()}</td>

                  <td>
                    {submission.calificacion !== null &&
                    submission.calificacion !== undefined ? (
                      <span className="grade-chip">
                        {Number(submission.calificacion).toFixed(1)}
                      </span>
                    ) : (
                      <span className="muted-cell">Sin calificar</span>
                    )}
                  </td>

                  <td className="table-description-cell">
                    {submission.retroalimentacion || "—"}
                  </td>

                  <td>
                    <button
                      className="table-primary-btn"
                      onClick={() => openGradeModal(submission)}
                    >
                      <FiEye size={14} />
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
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <h2>Calificar entrega</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="submission-student-box">
                <strong>{selectedSubmission.estudiante_nombre}</strong>
                <span>
                  {new Date(selectedSubmission.fecha_entrega).toLocaleString()}
                </span>
              </div>

              {selectedSubmission.archivo && (
                <a
                  href={selectedSubmission.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="table-file-link file-link-large"
                >
                  <FiUpload size={15} />
                  Abrir archivo entregado
                </a>
              )}

              <div className="teacher-grade-form">
                <label>Calificación</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Ej: 4.5"
                />

                <label>Retroalimentación</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escribe observaciones para el estudiante..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setSelectedSubmission(null)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={saveGrade} disabled={saving}>
                {saving ? "Guardando..." : "Guardar calificación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;
