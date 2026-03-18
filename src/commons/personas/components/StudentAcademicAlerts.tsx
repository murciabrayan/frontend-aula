import React, { useEffect, useMemo, useState } from "react";
import {
  getAcademicAlerts,
  getStudentAcademicSummary,
} from "@/commons/personas/services/academicAlertService";
import type {
  AcademicAlert,
  StudentAcademicSummaryResponse,
} from "@/commons/personas/services/academicAlertService";
import "../styles/studentAcademicAlerts.css";

interface StudentSummary {
  average: number | null;
  absences: number;
  missing_assignments: number;
  total_assignments: number;
  graded_assignments: number;
}

const alertToneLabel = (type: string) => {
  if (type === "LOW_GRADE") return "Rendimiento";
  if (type === "ABSENCE_RISK") return "Asistencia";
  if (type === "MISSING_ASSIGNMENTS") return "Entregas";
  return "Seguimiento";
};

const StudentAcademicAlerts: React.FC = () => {
  const [period, setPeriod] = useState<number>(1);
  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const alertsRes = await getAcademicAlerts({ period });
      setAlerts(alertsRes.data || []);

      const summaryRes = await getStudentAcademicSummary(period);
      const summaryData: StudentAcademicSummaryResponse = summaryRes.data;
      setSummary(summaryData.summary);
    } catch (error) {
      console.error("Error cargando alertas del estudiante", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const completionRate = useMemo(() => {
    if (!summary || !summary.total_assignments) return 0;
    return Math.round((summary.graded_assignments / summary.total_assignments) * 100);
  }, [summary]);

  return (
    <section className="student-alerts">
      <div className="student-alerts__hero">
        <div className="student-alerts__hero-copy">
          <span className="student-alerts__badge">Alertas academicas</span>
          <h2>Senales de seguimiento del periodo</h2>
          <p>
            Revisa tu estado academico, detecta riesgos a tiempo y mantente al dia
            con asistencia, promedio y entregas.
          </p>
        </div>

        <label className="student-alerts__control-card">
          <span>Periodo</span>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            <option value={1}>Periodo 1</option>
            <option value={2}>Periodo 2</option>
            <option value={3}>Periodo 3</option>
            <option value={4}>Periodo 4</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="student-alerts__empty">Cargando informacion...</div>
      ) : (
        <>
          {summary ? (
            <div className="student-alerts__summary-grid">
              <article className="student-alerts__summary-card">
                <span>Promedio</span>
                <strong>
                  {summary.average !== null && summary.average !== undefined
                    ? summary.average.toFixed(1)
                    : "--"}
                </strong>
              </article>
              <article className="student-alerts__summary-card accent">
                <span>Fallas</span>
                <strong>{summary.absences}</strong>
              </article>
              <article className="student-alerts__summary-card warning">
                <span>Sin entregar</span>
                <strong>{summary.missing_assignments}</strong>
              </article>
              <article className="student-alerts__summary-card">
                <span>Avance academico</span>
                <strong>{completionRate}%</strong>
              </article>
            </div>
          ) : null}

          <div className="student-alerts__list">
            {alerts.length === 0 ? (
              <article className="student-alert-card student-alert-card--empty">
                <h4>Sin alertas activas</h4>
                <p>No tienes alertas academicas en este periodo. Sigue asi.</p>
              </article>
            ) : (
              alerts.map((alert) => (
                <article key={alert.id} className="student-alert-card">
                  <div className="student-alert-card__top">
                    <span className={`student-alert-card__type ${alert.level.toLowerCase()}`}>
                      {alertToneLabel(alert.alert_type)}
                    </span>
                    <span className="student-alert-card__period">Periodo {alert.period}</span>
                  </div>
                  <h4>{alert.title}</h4>
                  <p>{alert.message_student}</p>
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default StudentAcademicAlerts;
