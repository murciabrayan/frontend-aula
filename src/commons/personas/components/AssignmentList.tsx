import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AssignmentForm from "./AssignmentForm";
import SubmissionList from "./SubmissionList";
import { FiBookOpen, FiTrash2, FiEdit2, FiEye } from "react-icons/fi";
import "./teacherAssignments.css";

const API_BASE = "http://127.0.0.1:8000/api";

/* ================= TIPOS ================= */

interface Area {
  id: number;
  nombre: string;
}

interface Subject {
  id: number;
  nombre: string;
  area?: number | null;
  area_nombre?: string;
}

interface Assignment {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  periodo: number;
}

interface Course {
  id: number;
  name: string;
}

/* ================= COMPONENT ================= */

const AssignmentDashboard: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [mode, setMode] = useState<"create" | "grade">("create");

  const [editingAssignment, setEditingAssignment] =
    useState<Assignment | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] =
    useState<Assignment | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    axios
      .get(`${API_BASE}/courses/teacher/course/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourse(res.data));
  }, [token]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/subjects/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubjects(res.data));
  }, [token]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/areas/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAreas(res.data));
  }, [token]);

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
            periodo: a.periodo ?? 1,
          }))
        )
      );
  };

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

  const groupedSubjects = useMemo(() => {
    return areas.map((area) => ({
      area,
      subjects: subjects.filter((s) => s.area === area.id),
    }));
  }, [areas, subjects]);

  const subjectsWithoutArea = useMemo(
    () => subjects.filter((s) => !s.area),
    [subjects]
  );

  const periodoLabel = (periodo: number) => `Periodo ${periodo}`;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{course?.name || "Curso"}</h1>
        <p>Panel de gestión académica</p>
      </header>

      <div className="areas-wrapper">
        {groupedSubjects.map(({ area, subjects }) => (
          <div key={area.id} className="area-card">
            <div className="area-title">{area.nombre}</div>

            <div className="area-subjects">
              {subjects.length === 0 && (
                <div className="empty-area">Sin materias</div>
              )}

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
                    <FiBookOpen size={22} />
                  </div>
                  <span>{s.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {subjectsWithoutArea.length > 0 && (
          <div className="area-card">
            <div className="area-title">Sin área</div>

            <div className="area-subjects">
              {subjectsWithoutArea.map((s) => (
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
                    <FiBookOpen size={22} />
                  </div>
                  <span>{s.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeSubject && (
        <div className="modal-backdrop">
          <div
            className={`modal-premium ${
              mode === "grade" ? "modal-premium-ultrawide" : "modal-premium-form"
            }`}
          >
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

                <button
                  className="close-btn"
                  onClick={() => {
                    setActiveSubject(null);
                    setSelectedAssignment(null);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              {mode === "create" && (
                <div className="assignment-form-shell">
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
                </div>
              )}

              {mode === "grade" && (
                <div className="section-block">
                  <div className="section-block-header">
                    <h3>Tareas creadas</h3>
                    <p>Haz clic en una fila para ver las entregas de esa tarea.</p>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="empty-state-box">
                      No hay tareas creadas en esta materia.
                    </div>
                  ) : (
                    <div className="teacher-table-wrapper">
                      <table className="teacher-data-table">
                        <thead>
                          <tr>
                            <th>Título</th>
                            <th>Periodo</th>
                            <th>Fecha de entrega</th>
                            <th>Descripción</th>
                            <th>Ver entregas</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignments.map((a) => (
                            <tr
                              key={a.id}
                              className="clickable-row"
                              onClick={() => setSelectedAssignment(a)}
                            >
                              <td className="table-title-cell">{a.titulo}</td>
                              <td>
                                <span className="assignment-period-badge table-badge">
                                  {periodoLabel(a.periodo)}
                                </span>
                              </td>
                              <td>{a.fecha_entrega}</td>
                              <td className="table-description-cell">
                                {a.descripcion || "Sin descripción"}
                              </td>
                              <td>
                                <button
                                  className="table-primary-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAssignment(a);
                                  }}
                                >
                                  <FiEye size={14} />
                                  Ver
                                </button>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    className="icon-action-btn edit"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingAssignment(a);
                                    }}
                                    title="Editar tarea"
                                  >
                                    <FiEdit2 size={16} />
                                  </button>

                                  <button
                                    className="icon-action-btn delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssignmentToDelete(a);
                                      setShowConfirm(true);
                                    }}
                                    title="Eliminar tarea"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAssignment && (
        <div className="modal-backdrop modal-layer-2">
          <div className="modal-premium modal-premium-ultrawide">
            <div className="modal-header-fixed">
              <h2>Entregas · {selectedAssignment.titulo}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedAssignment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <SubmissionList assignmentId={selectedAssignment.id} />
            </div>
          </div>
        </div>
      )}

      {editingAssignment && activeSubject && (
        <div className="modal-backdrop modal-layer-2">
          <div className="modal-premium modal-premium-form">
            <div className="modal-header-fixed">
              <h2>Editar tarea</h2>
              <button
                className="close-btn"
                onClick={() => setEditingAssignment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="assignment-form-shell">
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
        </div>
      )}

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