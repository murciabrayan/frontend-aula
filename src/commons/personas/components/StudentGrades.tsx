import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/studentGrades.css";

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
  materia: number;
  periodo: number;
  materia_nombre?: string;
  curso_nombre?: string;
}

interface Submission {
  id: number;
  tarea: number; // assignment id
  fecha_entrega: string; // submitted at
  calificacion?: number | null;
  retroalimentacion?: string | null;
  tarea_titulo?: string;
}

type Row = {
  assignmentId: number;
  periodo: number;
  titulo: string;
  fechaEntrega: string;
  nota?: number; // undefined si no está calificada
  retro?: string | null;
};

type SubjectReport = {
  subjectId: number;
  subjectName: string;
  total: number;
  graded: number;
  pending: number;
  average: number | null;
  rows: Row[];
};

const StudentGrades: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [openSubjects, setOpenSubjects] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [subjectsRes, assignmentsRes, submissionsRes] = await Promise.all([
        axios.get(`${API_BASE}/subjects/`, { headers }),
        axios.get(`${API_BASE}/assignments/`, { headers }),
        axios.get(`${API_BASE}/submissions/`, { headers }),
      ]);

      setSubjects(subjectsRes.data || []);
      setAssignments(assignmentsRes.data || []);
      setSubmissions(submissionsRes.data || []);

      // abrir por defecto la primera materia (si existe)
      const subsList: Subject[] = subjectsRes.data || [];
      if (subsList.length > 0) {
        setOpenSubjects((prev) => ({ ...prev, [subsList[0].id]: true }));
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el boletín. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const submissionsByAssignmentId = useMemo(() => {
    const map = new Map<number, Submission>();
    // Si por alguna razón hay varias entregas por tarea, nos quedamos con la última
    for (const s of submissions) {
      map.set(s.tarea, s);
    }
    return map;
  }, [submissions]);

  const report: SubjectReport[] = useMemo(() => {
    const bySubjectId = new Map<number, SubjectReport>();

    // inicializar materias aunque no tengan tareas
    for (const s of subjects) {
      bySubjectId.set(s.id, {
        subjectId: s.id,
        subjectName: s.nombre,
        total: 0,
        graded: 0,
        pending: 0,
        average: null,
        rows: [],
      });
    }

    // meter tareas por materia y cruzar con entregas/calificación
    for (const a of assignments) {
      const subjectId = a.materia;
      const r = bySubjectId.get(subjectId);
      if (!r) continue;

      const sub = submissionsByAssignmentId.get(a.id);
      const nota =
        sub?.calificacion === null || sub?.calificacion === undefined
          ? undefined
          : Number(sub.calificacion);

      r.total += 1;
      if (nota !== undefined) r.graded += 1;
      else r.pending += 1;

      r.rows.push({
        assignmentId: a.id,
        periodo: a.periodo ?? 1,
        titulo: a.titulo,
        fechaEntrega: a.fecha_entrega,
        nota,
        retro: sub?.retroalimentacion ?? null,
      });
    }

    // promedios y orden
    const out = Array.from(bySubjectId.values()).map((s) => {
      if (s.graded > 0) {
        const periodAverages = [1, 2, 3, 4]
          .map((period) => {
            const gradedRows = s.rows.filter(
              (row) => row.periodo === period && row.nota !== undefined,
            );

            if (gradedRows.length === 0) return null;

            const sum = gradedRows.reduce((acc, row) => acc + (row.nota ?? 0), 0);
            return Number((sum / gradedRows.length).toFixed(2));
          })
          .filter((value): value is number => value !== null);

        if (periodAverages.length > 0) {
          const finalAverage =
            periodAverages.reduce((acc, value) => acc + value, 0) /
            periodAverages.length;
          s.average = Number(finalAverage.toFixed(2));
        }
      }
      // Orden por fecha entrega desc (más reciente arriba)
      s.rows.sort((x, y) => (x.fechaEntrega < y.fechaEntrega ? 1 : -1));
      return s;
    });

    // Ordenar materias: las que tienen más tareas primero
    out.sort((a, b) => b.total - a.total);
    return out;
  }, [assignments, subjects, submissionsByAssignmentId]);

  const globalStats = useMemo(() => {
    let totalTasks = 0;
    let graded = 0;
    const subjectAverages: number[] = [];

    for (const s of report) {
      totalTasks += s.total;
      graded += s.graded;
      if (s.average !== null) {
        subjectAverages.push(s.average);
      }
    }

    const avg =
      subjectAverages.length > 0
        ? Number(
            (
              subjectAverages.reduce((acc, value) => acc + value, 0) /
              subjectAverages.length
            ).toFixed(2),
          )
        : null;
    return { totalTasks, graded, avg };
  }, [report]);

  const toggleSubject = (id: number) => {
    setOpenSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="boletin-shell">
        <div className="boletin-header">
          <h1>Boletín</h1>
          <p>Cargando…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="boletin-shell">
        <div className="boletin-header">
          <h1>Boletín</h1>
          <p className="boletin-error">{error}</p>
          <button className="boletin-btn gold" onClick={loadAll}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="boletin-shell">
      {/* ===== HEADER / RESUMEN ===== */}
      <div className="boletin-header">
        <div>
          <h1>Boletín</h1>
          <p>Resumen de calificaciones por materia (promedio y detalle).</p>
        </div>

        <div className="boletin-actions">
          <button className="boletin-btn gold" onClick={loadAll}>
            Actualizar
          </button>
        </div>
      </div>

      {/* ===== RESUMEN GENERAL ===== */}
      <div className="boletin-summary">
        <div className="summary-card">
          <span className="summary-label">Tareas</span>
          <span className="summary-value">{globalStats.totalTasks}</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Calificadas</span>
          <span className="summary-value">{globalStats.graded}</span>
        </div>

        <div className="summary-card highlight">
          <span className="summary-label">Promedio general</span>
          <span className="summary-value">
            {globalStats.avg !== null ? globalStats.avg.toFixed(2) : "—"}
          </span>
        </div>
      </div>

      {/* ===== LISTA POR MATERIA ===== */}
      <div className="boletin-list">
        {report.length === 0 ? (
          <div className="boletin-empty">
            No hay datos aún. Cuando el docente califique, aparecerán aquí.
          </div>
        ) : (
          report.map((s) => {
            const open = !!openSubjects[s.subjectId];
            return (
              <div key={s.subjectId} className="boletin-subject">
                <button
                  className="boletin-subject-head"
                  onClick={() => toggleSubject(s.subjectId)}
                >
                  <div className="head-left">
                    <div className="subject-name">{s.subjectName}</div>
                    <div className="subject-meta">
                      {s.total} tarea(s) · {s.graded} calificadas · {s.pending} pendientes
                    </div>
                  </div>

                  <div className="head-right">
                    <div className="avg-badge">
                      {s.average !== null ? s.average.toFixed(2) : "—"}
                    </div>
                    <div className={`chev ${open ? "open" : ""}`}>⌄</div>
                  </div>
                </button>

                {open && (
                  <div className="boletin-table-wrap">
                    {s.rows.length === 0 ? (
                      <div className="boletin-empty small">
                        No hay tareas registradas en esta materia.
                      </div>
                    ) : (
                      <table className="boletin-table">
                        <thead>
                          <tr>
                            <th style={{ width: "58%" }}>Tarea</th>
                            <th style={{ width: "14%" }}>Nota</th>
                            <th style={{ width: "28%" }}>Entrega</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.rows.map((r) => (
                            <tr key={r.assignmentId}>
                              <td className="tarea-cell">
                                <div className="tarea-title">{r.titulo}</div>
                                <div className={`tarea-retro ${r.retro ? "" : "muted"}`}>
                                  {r.retro ? r.retro : "Sin retroalimentación"}
                                </div>
                              </td>

                              <td>
                                {r.nota !== undefined ? (
                                  <span className="nota-chip">{r.nota.toFixed(1)}</span>
                                ) : (
                                  <span className="nota-chip pending">Pendiente</span>
                                )}
                              </td>

                              <td className="fecha-cell">{r.fechaEntrega}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
