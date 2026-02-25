import React, { useEffect, useState } from "react";
import axios from "axios";
import "./../styles/assignments.css";

const API_BASE = "http://127.0.0.1:8000/api";

interface Props {
  assignmentId: number;
}

const SubmissionList: React.FC<Props> = ({ assignmentId }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const token = localStorage.getItem("access_token");

  // 🔹 Cargar entregas
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/submissions/?assignment=${assignmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubmissions(res.data);
      } catch (err) {
        console.error("Error al cargar entregas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [assignmentId]);

  // 🔹 Manejar escritura de nota (máx 1 decimal)
  const handleGradeChange = (value: string) => {
    // permite: 0, 4, 4.5, 5.0
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      setGrade(value);
    }
  };

  // 🔹 Validar nota
  const isGradeValid = () => {
    const numericGrade = parseFloat(grade);
    return !isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 5;
  };

  // 🔹 Enviar calificación
  const handleGrade = async (submissionId: number) => {
    const numericGrade = parseFloat(grade);

    if (!isGradeValid()) {
      alert("❌ La nota debe estar entre 0.0 y 5.0");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/submissions/${submissionId}/calificar/`,
        {
          calificacion: numericGrade,
          retroalimentacion: feedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Calificación guardada");

      // limpiar
      setSelectedSubmission(null);
      setGrade("");
      setFeedback("");

      // recargar lista
      const res = await axios.get(
        `${API_BASE}/submissions/?assignment=${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error al calificar", err);
      alert("❌ Error al guardar calificación");
    }
  };

  if (loading) return <p>Cargando entregas...</p>;
  if (submissions.length === 0) return <p>No hay entregas registradas.</p>;

  return (
    <div>
      <h3>Entregas de estudiantes</h3>

      <ul className="submission-list">
        {submissions.map((s) => (
          <li key={s.id} className="submission-item">
            <strong>{s.estudiante_nombre || "Estudiante desconocido"}</strong>
            <br />
            Fecha de entrega:{" "}
            {new Date(s.fecha_entrega).toLocaleString()}
            <br />

            {s.archivo ? (
              <a href={s.archivo} target="_blank" rel="noreferrer">
                📎 Ver archivo
              </a>
            ) : (
              <span>Sin archivo</span>
            )}

            {s.calificacion ? (
              <div className="grade-box">
                <p>
                  <strong>Calificación:</strong> {s.calificacion}
                </p>
                <p>
                  <strong>Retroalimentación:</strong>{" "}
                  {s.retroalimentacion || "—"}
                </p>
              </div>
            ) : (
              <button
                className="btn-primary small-btn"
                onClick={() => setSelectedSubmission(s)}
              >
                Calificar
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* 🔹 MODAL DE CALIFICACIÓN */}
      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal grade-modal">
            <h4>Calificar entrega</h4>
            <hr />
            <p>
              <strong>{selectedSubmission.estudiante_nombre}</strong>
            </p>

            <div className="form-group">
              <label>Nota (0.0 – 5.0):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={grade}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="input-field"
                placeholder="Ej: 4.5"
              />
            </div>

            <div className="form-group">
              <label>Retroalimentación:</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="textarea-field"
                placeholder="Escribe una retroalimentación para el estudiante..."
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => handleGrade(selectedSubmission.id)}
                className="btn-primary"
                disabled={!isGradeValid()}
              >
                Guardar
              </button>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;