import React, { useEffect, useState } from "react";
import axios from "axios";
import AssignmentForm from "./AssignmentForm";
import SubmissionList from "./SubmissionList";
import { FiBookOpen, FiTrash2, FiEdit2 } from "react-icons/fi";
import "./teacherAssignments.css";

const API_BASE = "http://127.0.0.1:8000/api";

/* ================= TIPOS ================= */

interface Subject {
  id: number;
  nombre: string;
}

interface Assignment {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
}

interface Course {
  id: number;
  name: string;
}

/* ================= COMPONENT ================= */

const AssignmentDashboard: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);

  const [mode, setMode] = useState<"create" | "grade">("create");

  // ✏️ edición
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // ❗ confirmación eliminar
  const [showConfirm, setShowConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // ✅ éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("access_token");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    axios
      .get(`${API_BASE}/courses/teacher/course/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourse(res.data));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE}/subjects/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubjects(res.data));
  }, []);

  const loadAssignments = (subjectId: number) => {
    axios
      .get(`${API_BASE}/assignments/?subject=${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setAssignments(
          res.data.map((a: any) => ({
            id: a.id,
            titulo: a.titulo,
            descripcion: a.descripcion ?? "",
            fecha_entrega: a.fecha_entrega ?? "",
          }))
        )
      );
  };

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    await axios.delete(`${API_BASE}/assignments/${assignmentToDelete.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (activeSubject) loadAssignments(activeSubject.id);

    setShowConfirm(false);
    setAssignmentToDelete(null);
    setSelectedAssignment(null);

    setSuccessMessage("Tarea eliminada exitosamente");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1400);
  };

  /* ================= RENDER ================= */

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{course?.name || "Curso"}</h1>
        <p>Panel de gestión académica</p>
      </header>

      {/* ===== MATERIAS ===== */}
      <div className="subjects-wrapper">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="subject-card"
            onClick={() => {
              setActiveSubject(s);
              loadAssignments(s.id);
              setMode("create");
              setSelectedAssignment(null);
            }}
          >
            <div className="subject-icon">
              <FiBookOpen size={26} />
            </div>
            <span>{s.nombre}</span>
          </div>
        ))}
      </div>

      {/* ===== MODAL PRINCIPAL ===== */}
      {activeSubject && (
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <h2>{activeSubject.nombre}</h2>

              <div className="modal-actions">
                <button
                  className={mode === "create" ? "active" : ""}
                  onClick={() => setMode("create")}
                >
                  Subir tarea
                </button>
                <button
                  className={mode === "grade" ? "active" : ""}
                  onClick={() => setMode("grade")}
                >
                  Calificar
                </button>
                <button className="close-btn" onClick={() => setActiveSubject(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              {/* ===== CREAR ===== */}
              {mode === "create" && (
                <AssignmentForm
                  subjectId={activeSubject.id}
                  onClose={() => setActiveSubject(null)}
                  onSuccess={() => {
                    loadAssignments(activeSubject.id);
                    setSuccessMessage("Tarea creada exitosamente");
                    setShowSuccess(true);
                    setTimeout(() => {
                      setShowSuccess(false);
                      setMode("grade");
                    }, 1400);
                  }}
                />
              )}

              {/* ===== LISTA / EDITAR ===== */}
              {mode === "grade" && (
                <>
                  <div className="assignment-picker">
                    {assignments.map((a) => (
                      <div
                        key={a.id}
                        className={`assignment-pill ${
                          selectedAssignment === a.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedAssignment(a.id)}
                      >
                        {a.titulo}

                        <FiEdit2
                          className="edit-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAssignment(a);
                          }}
                        />

                        <FiTrash2
                          className="delete-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignmentToDelete(a);
                            setShowConfirm(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {selectedAssignment && (
                    <SubmissionList assignmentId={selectedAssignment} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL EDITAR ===== */}
      {editingAssignment && activeSubject && (
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <h2>Editar tarea</h2>
              <button className="close-btn" onClick={() => setEditingAssignment(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <AssignmentForm
                subjectId={activeSubject.id}
                assignmentToEdit={editingAssignment}
                onClose={() => setEditingAssignment(null)}
                onSuccess={() => {
                  loadAssignments(activeSubject.id);
                  setEditingAssignment(null);
                  setSuccessMessage("Tarea actualizada exitosamente");
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 1400);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRMAR ELIMINAR ===== */}
      {showConfirm && assignmentToDelete && (
        <div className="confirm-backdrop">
          <div className="confirm-modal">
            <h3>¿Eliminar tarea?</h3>
            <p>
              Estás a punto de eliminar <strong>{assignmentToDelete.titulo}</strong>.
            </p>

            <div className="confirm-actions">
              <button className="btn-danger" onClick={confirmDelete}>
                Sí, eliminar
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowConfirm(false);
                  setAssignmentToDelete(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ÉXITO ===== */}
      {showSuccess && (
        <div className="success-backdrop">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h3>{successMessage}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDashboard;