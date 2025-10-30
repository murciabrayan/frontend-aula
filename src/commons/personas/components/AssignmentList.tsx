import React, { useEffect, useState } from "react";
import axios from "axios";
import AssignmentForm from "./AssignmentForm";
import SubmissionList from "./SubmissionList";
import "./../styles/assignments.css";

const API_BASE = "http://127.0.0.1:8000/api";

const AssignmentList: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const token = localStorage.getItem("access_token");

  // 🔹 Obtener curso del docente
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${API_BASE}/courses/teacher/course/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourseId(res.data.id);
      } catch (err) {
        console.error("Error al obtener el curso del docente", err);
      }
    };
    fetchCourse();
  }, []);

  // 🔹 Cargar tareas del curso
  const fetchAssignments = async () => {
    if (!courseId) return;
    try {
      const res = await axios.get(`${API_BASE}/assignments/?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data);
    } catch (err) {
      console.error("Error al cargar tareas", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  return (
    <div className="assignments-container">
      <h2>Tareas del curso</h2>

      <button
        className="btn-primary"
        onClick={() => setShowForm(true)}
        disabled={!courseId}
      >
        + Nueva tarea
      </button>

      {!courseId ? (
        <p>Cargando curso del docente...</p>
      ) : assignments.length === 0 ? (
        <p>No hay tareas asignadas aún.</p>
      ) : (
        <div className="assignment-grid">
          {assignments.map((a) => (
            <div key={a.id} className="assignment-card">
              <h3>{a.titulo}</h3>
              {a.descripcion && <p>{a.descripcion}</p>}
              <p>
                <strong>Entrega:</strong> {a.fecha_entrega}
              </p>
              {a.archivo && (
                <a
                  href={a.archivo}
                  target="_blank"
                  rel="noreferrer"
                  className="file-link"
                >
                  Ver archivo adjunto
                </a>
              )}
              <button
                className="btn-secondary small-btn"
                onClick={() => {
                  setSelectedAssignmentId(a.id);
                  setShowSubmissions(true);
                }}
              >
                Ver entregas
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de creación de tareas */}
      {showForm && courseId && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="modal large-modal">
            <h3>Nueva tarea</h3>
            <AssignmentForm
              courseId={courseId}
              onClose={() => setShowForm(false)}
              onSuccess={fetchAssignments}
            />
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary close-btn"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de entregas */}
      {showSubmissions && selectedAssignmentId && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSubmissions(false);
          }}
        >
          <div className="modal large-modal">
            <SubmissionList assignmentId={selectedAssignmentId} />
            <button
              onClick={() => setShowSubmissions(false)}
              className="btn-secondary close-btn"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
