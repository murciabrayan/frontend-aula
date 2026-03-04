import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadSubmissionForm from "./UploadSubmissionForm";
import { FiBookOpen } from "react-icons/fi";
import "./../styles/assignments.css";

const API_BASE = "http://127.0.0.1:8000/api";

interface Subject {
  id: number;
  nombre: string;
}

interface Assignment {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  archivo?: string;
}

interface Submission {
  id: number;
  tarea: number;
  fecha_entrega: string;
  calificacion?: number;
  retroalimentacion?: string;
}

const StudentAssignmentsList: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [showGrade, setShowGrade] = useState<Submission | null>(null);
  const [showDetails, setShowDetails] = useState<Assignment | null>(null);

  // ✅ toast éxito
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/subjects/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubjects(res.data));

    reloadSubmissions();
  }, [token]);

  const reloadSubmissions = () => {
    axios
      .get(`${API_BASE}/submissions/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubmissions(res.data));
  };

  const loadAssignments = (subjectId: number) => {
    axios
      .get(`${API_BASE}/assignments/?subject=${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAssignments(res.data));
  };

  const getSubmission = (assignmentId: number) =>
    submissions.find((s) => s.tarea === assignmentId);

  const showSuccessToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1600);
  };

  return (
    <div className="dashboard">
      <h1>Selecciona una materia</h1>

      <div className="subjects-wrapper">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="subject-card"
            onClick={() => {
              setActiveSubject(s);
              loadAssignments(s.id);
            }}
          >
            <div className="subject-icon">
              <FiBookOpen size={26} />
            </div>
            <span>{s.nombre}</span>
          </div>
        ))}
      </div>

      {/* ✅ TOAST ÉXITO */}
      {showToast && (
        <div className="toast-backdrop" onClick={() => setShowToast(false)}>
          <div className="toast-success" onClick={(e) => e.stopPropagation()}>
            <div>
              <strong>✅ Listo</strong> — {toastMsg}
            </div>
            <button className="btn-secondary" onClick={() => setShowToast(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 📘 MODAL MATERIA */}
      {activeSubject && (
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <h2>{activeSubject.nombre}</h2>
              <button className="close-btn" onClick={() => setActiveSubject(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {assignments.length === 0 ? (
                <p>No hay tareas asignadas aún.</p>
              ) : (
                <div className="assignment-picker">
                  {assignments.map((a) => {
                    const entrega = getSubmission(a.id);

                    return (
                      <div key={a.id} className="assignment-pill">
                        <div>
                          <strong>{a.titulo}</strong>
                          <p>{a.fecha_entrega}</p>
                        </div>

                        <div className="assignment-actions">
                          <button className="btn-secondary" onClick={() => setShowDetails(a)}>
                            Ver detalles
                          </button>

                          {!entrega && (
                            <button
                              className="btn-primary"
                              onClick={() => {
                                setSelectedAssignment(a);
                                setShowUpload(true);
                              }}
                            >
                              Subir entrega
                            </button>
                          )}

                          {entrega && entrega.calificacion === undefined && (
                            <span className="badge pending">✅ Entregado</span>
                          )}

                          {entrega?.calificacion !== undefined && (
                            <button className="btn-secondary" onClick={() => setShowGrade(entrega)}>
                              Ver calificación
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📄 DETALLES DE TAREA */}
      {showDetails && (() => {
        const entrega = getSubmission(showDetails.id);

        return (
          <div className="modal-backdrop">
            <div className="modal-premium">
              <div className="modal-header-fixed">
                <h3>{showDetails.titulo}</h3>
                <button className="close-btn" onClick={() => setShowDetails(null)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p>
                  <strong>Fecha de entrega:</strong> {showDetails.fecha_entrega}
                </p>

                {showDetails.descripcion && (
                  <>
                    <strong>Descripción:</strong>
                    <p className="assignment-description">{showDetails.descripcion}</p>
                  </>
                )}

                {showDetails.archivo && (
                  <div className="assignment-file">
                    <strong>Archivo del docente:</strong>
                    <a
                      href={showDetails.archivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      Descargar archivo
                    </a>
                  </div>
                )}

                {entrega && (
                  <div style={{ marginTop: 12 }}>
                    {entrega.calificacion === undefined ? (
                      <span className="badge pending">✅ Tarea entregada correctamente</span>
                    ) : (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setShowDetails(null);
                          setShowGrade(entrega);
                        }}
                      >
                        Ver calificación
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                {!entrega ? (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedAssignment(showDetails);
                      setShowDetails(null);
                      setShowUpload(true);
                    }}
                  >
                    Subir entrega
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={() => setShowDetails(null)}>
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 📤 SUBIR ENTREGA */}
      {showUpload && selectedAssignment && (
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <h3>Subir entrega</h3>
              <button className="close-btn" onClick={() => setShowUpload(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <UploadSubmissionForm
                assignmentId={selectedAssignment.id}
                onClose={() => setShowUpload(false)}
                onSuccess={() => {
                  setShowUpload(false);
                  reloadSubmissions();
                  showSuccessToast("Tarea entregada correctamente.");
                }}
              />
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUpload(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 CALIFICACIÓN */}
      {showGrade && (
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <h3>Calificación</h3>
              <button className="close-btn" onClick={() => setShowGrade(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="grade-box">
                <p>
                  <strong>Nota:</strong> {showGrade.calificacion}
                </p>
                <p>
                  <strong>Retroalimentación:</strong>
                </p>
                <p>{showGrade.retroalimentacion}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowGrade(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsList;