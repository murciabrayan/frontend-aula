import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadSubmissionForm from "./UploadSubmissionForm";
import "./../styles/assignments.css";

const API_BASE = "http://127.0.0.1:8000/api";

const StudentAssignmentsList: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const token = localStorage.getItem("access_token");

  // 🔹 Obtener las tareas del curso del estudiante
  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/assignments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data);
    } catch (err) {
      console.error("Error al obtener tareas", err);
    }
  };

  // 🔹 Obtener las entregas del estudiante
  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/submissions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error al obtener entregas", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  // 🔹 Verificar si ya se entregó una tarea
  const getSubmission = (assignmentId: number) =>
    submissions.find((s) => s.tarea === assignmentId);

  return (
    <div className="assignments-container">
      <h2>Mis tareas</h2>

      {assignments.length === 0 ? (
        <p>No tienes tareas asignadas aún.</p>
      ) : (
        <ul className="assignment-list">
          {assignments.map((a) => {
            const entrega = getSubmission(a.id);
            return (
              <li key={a.id}>
                <div className="assignment-card">
                  <h4>{a.titulo}</h4>
                  <p>{a.descripcion}</p>
                  <p>
                    <strong>Fecha de entrega:</strong> {a.fecha_entrega}
                  </p>

                  {a.archivo && (
                    <a href={a.archivo} target="_blank" rel="noreferrer">
                      📎 Ver archivo de la tarea
                    </a>
                  )}

                  {entrega ? (
                    <div className="submission-status success">
                      ✅ <strong>Entregado</strong>
                      <p>Fecha: {new Date(entrega.fecha_entrega).toLocaleString()}</p>
                      {entrega.calificacion ? (
                        <p>
                          <strong>Calificación:</strong> {entrega.calificacion}
                          <br />
                          <em>{entrega.retroalimentacion}</em>
                        </p>
                      ) : (
                        <p><em>Aún sin calificar</em></p>
                      )}
                    </div>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setSelectedAssignment(a.id);
                        setShowUploadForm(true);
                      }}
                    >
                      Subir entrega
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showUploadForm && selectedAssignment && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadForm(false);
          }}
        >
          <div className="modal">
            <h3>Subir entrega</h3>
            <UploadSubmissionForm
              assignmentId={selectedAssignment}
              onClose={() => setShowUploadForm(false)}
              onSuccess={() => {
                setShowUploadForm(false);
                fetchSubmissions();
              }}
            />
            <button
              onClick={() => setShowUploadForm(false)}
              className="btn-secondary"
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsList;
