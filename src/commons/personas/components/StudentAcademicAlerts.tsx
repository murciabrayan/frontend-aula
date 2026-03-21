import React, { useEffect, useMemo, useState } from "react";
import StyledSelect from "@/components/StyledSelect";
import {
  getAcademicAlerts,
  getStudentAcademicSummary,
} from "@/commons/personas/services/academicAlertService";
import type {
  AcademicAlert,
  AcademicAlertEvent,
  StudentAcademicSummaryResponse,
} from "@/commons/personas/services/academicAlertService";
import "../styles/studentAcademicAlerts.css";

const AUTO_REFRESH_MS = 15000;

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

const eventTitleLabel = (event: AcademicAlertEvent) => {
  if (event.event_type === "ALERT_CREATED" || event.event_type === "ALERT_REOPENED") {
    return "Alerta inicial";
  }
  if (event.event_type === "TEACHER_INITIAL_SUBMITTED") {
    return "Primer seguimiento docente";
  }
  if (event.event_type === "TEACHER_FINAL_SUBMITTED") {
    return "Segundo seguimiento docente";
  }
  if (event.event_type === "ADMIN_CLOSED_POSITIVE" || event.event_type === "ADMIN_CLOSED_NEGATIVE") {
    return "Observación final";
  }
  return event.title;
};

const formatDateTime = (value: string) => new Date(value).toLocaleString("es-CO");

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
    void loadData();
  }, [period]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadData();
    }, AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [period]);

  const completionRate = useMemo(() => {
    if (!summary || !summary.total_assignments) return 0;
    return Math.round((summary.graded_assignments / summary.total_assignments) * 100);
  }, [summary]);

  return (
    <section className="student-alerts">
      <div className="student-alerts__hero">
        <div className="student-alerts__hero-copy">
          <span className="student-alerts__badge">Alertas académicas</span>
          <h2>Ruta de seguimiento del período</h2>
          <p>
            Aquí ves la alerta inicial, los seguimientos del docente y la observación final
            de coordinación cuando el proceso ya haya sido cerrado.
          </p>
        </div>

        <label className="student-alerts__control-card">
          <span>Período</span>
          <StyledSelect value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            <option value={1}>Periodo 1</option>
            <option value={2}>Periodo 2</option>
            <option value={3}>Periodo 3</option>
            <option value={4}>Periodo 4</option>
          </StyledSelect>
        </label>
      </div>

      {loading ? (
        <div className="student-alerts__empty">Cargando información...</div>
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
                <span>Avance académico</span>
                <strong>{completionRate}%</strong>
              </article>
            </div>
          ) : null}

          <div className="student-alerts__list">
            {alerts.length === 0 ? (
              <article className="student-alert-card student-alert-card--empty">
                <h4>Sin alertas activas</h4>
                <p>No tienes alertas académicas en este período. Sigue así.</p>
              </article>
            ) : (
              alerts.map((alert) => {
                const studentTimeline = alert.events.filter(
                  (event) =>
                    event.visible_to_student &&
                    [
                      "ALERT_CREATED",
                      "ALERT_REOPENED",
                      "TEACHER_INITIAL_SUBMITTED",
                      "TEACHER_FINAL_SUBMITTED",
                      "ADMIN_CLOSED_POSITIVE",
                      "ADMIN_CLOSED_NEGATIVE",
                    ].includes(event.event_type),
                );

                return (
                  <article key={alert.id} className="student-alert-card student-alert-card--timeline">
                    <div className="student-alert-card__top">
                      <span className={`student-alert-card__type ${alert.level.toLowerCase()}`}>
                        {alertToneLabel(alert.alert_type)}
                      </span>
                      <span className="student-alert-card__period">Periodo {alert.period}</span>
                    </div>

                    <h4>{alert.title}</h4>
                    <p className="student-alert-card__intro">{alert.message_student}</p>

                    <div className="student-alert-card__timeline">
                      {studentTimeline.map((event) => (
                        <div key={event.id} className="student-alert-card__timeline-item">
                          <div className="student-alert-card__timeline-dot" />
                          <div className="student-alert-card__timeline-content">
                            <strong>{eventTitleLabel(event)}</strong>
                            <span>{formatDateTime(event.created_at)}</span>
                            {event.notes ? <p>{event.notes}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default StudentAcademicAlerts;
