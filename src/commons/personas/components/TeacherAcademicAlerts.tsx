import React, { useEffect, useMemo, useState } from "react";
import StyledSelect from "@/components/StyledSelect";
import {
  getAcademicAlerts,
  submitTeacherFollowUp,
} from "@/commons/personas/services/academicAlertService";
import type {
  AcademicAlert,
  AlertEventType,
} from "@/commons/personas/services/academicAlertService";
import "../styles/teacherAcademicAlerts.css";

const AUTO_REFRESH_MS = 15000;

type TeacherView = "PENDING" | "MONITORING" | "CLOSED";

const alertTypeLabel = (type: string) => {
  if (type === "LOW_GRADE") return "Bajo rendimiento";
  if (type === "ABSENCE_RISK") return "Inasistencia";
  if (type === "MISSING_ASSIGNMENTS") return "No entregas";
  return type;
};

const alertLevelLabel = (level: string) => {
  if (level === "CRITICAL") return "Crítica";
  if (level === "WARNING") return "Advertencia";
  return level;
};

const statusLabel = (status: AcademicAlert["status"]) => {
  switch (status) {
    case "TEACHER_INITIAL_PENDING":
      return "Pendiente de seguimiento";
    case "ADMIN_INITIAL_REVIEW":
      return "En revisión administrativa";
    case "MONITORING":
      return "En seguimiento";
    case "TEACHER_FINAL_PENDING":
      return "Pendiente de confirmación";
    case "ADMIN_FINAL_REVIEW":
      return "Pendiente de cierre administrativo";
    case "RESOLVED_POSITIVE":
      return "Cierre satisfactorio";
    case "RESOLVED_NEGATIVE":
      return "Cierre no satisfactorio";
    default:
      return status;
  }
};

const formatDateTime = (value: string | null) => {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleString("es-CO");
};

const getLatestEvent = (alert: AcademicAlert, types?: AlertEventType[]) => {
  const events = types
    ? alert.events.filter((event) => types.includes(event.event_type))
    : alert.events;
  return events.length ? events[events.length - 1] : null;
};

const TeacherAcademicAlerts: React.FC = () => {
  const [period, setPeriod] = useState<number>(1);
  const [view, setView] = useState<TeacherView>("PENDING");
  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AcademicAlert | null>(null);
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [improvementConfirmed, setImprovementConfirmed] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await getAcademicAlerts({ period });
      setAlerts(res.data || []);
    } catch (error) {
      console.error("Error cargando alertas", error);
      setErrorMessage("No fue posible cargar las alertas del curso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, [period]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadAlerts();
    }, AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [period]);

  const categorizedAlerts = useMemo(() => {
    const pending = alerts.filter((alert) =>
      ["TEACHER_INITIAL_PENDING", "TEACHER_FINAL_PENDING"].includes(alert.status),
    );
    const monitoring = alerts.filter((alert) =>
      ["ADMIN_INITIAL_REVIEW", "MONITORING", "ADMIN_FINAL_REVIEW"].includes(alert.status),
    );
    const closed = alerts.filter((alert) =>
      ["RESOLVED_POSITIVE", "RESOLVED_NEGATIVE"].includes(alert.status),
    );

    return { pending, monitoring, closed };
  }, [alerts]);

  const visibleAlerts = useMemo(() => {
    if (view === "PENDING") return categorizedAlerts.pending;
    if (view === "MONITORING") return categorizedAlerts.monitoring;
    return categorizedAlerts.closed;
  }, [categorizedAlerts, view]);

  const handleOpenFollowUp = (alert: AcademicAlert) => {
    setSelectedAlert(alert);
    setFollowUpNotes("");
    setImprovementConfirmed(true);
    setErrorMessage("");
  };

  const handleCloseFollowUp = () => {
    setSelectedAlert(null);
    setFollowUpNotes("");
    setImprovementConfirmed(true);
  };

  const handleSubmitFollowUp = async () => {
    if (!selectedAlert) return;

    try {
      setSubmittingId(selectedAlert.id);
      setErrorMessage("");
      setSuccessMessage("");

      await submitTeacherFollowUp(selectedAlert.id, {
        notes: followUpNotes,
        improvement_confirmed:
          selectedAlert.status === "TEACHER_FINAL_PENDING" ? improvementConfirmed : undefined,
      });

      setSuccessMessage(
        selectedAlert.status === "TEACHER_FINAL_PENDING"
          ? "La confirmación final fue enviada a coordinación."
          : "El seguimiento fue enviado a coordinación."
      );
      handleCloseFollowUp();
      await loadAlerts();
      window.setTimeout(() => setSuccessMessage(""), 2200);
    } catch (error) {
      console.error("Error enviando seguimiento", error);
      setErrorMessage("No se pudo registrar el seguimiento docente.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="teacher-alerts">
      <div className="teacher-alerts__hero">
        <div className="teacher-alerts__hero-copy">
          <span className="teacher-alerts__badge">Alertas tempranas</span>
          <h2>Seguimiento preventivo del curso</h2>
          <p>
            Atiende las alertas pendientes, revisa cuáles están en seguimiento y conserva
            el historial de los cierres ya realizados.
          </p>
        </div>

        <div className="teacher-alerts__hero-actions">
          <label className="teacher-alerts__control-card">
            <span>Período</span>
            <StyledSelect value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </StyledSelect>
          </label>
        </div>
      </div>

      <div className="teacher-alerts__status-tabs" role="tablist" aria-label="Vista de alertas">
        <button
          type="button"
          role="tab"
          aria-selected={view === "PENDING"}
          className={`teacher-alerts__status-tab ${view === "PENDING" ? "is-active" : ""}`}
          onClick={() => setView("PENDING")}
        >
          Pendientes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "MONITORING"}
          className={`teacher-alerts__status-tab ${view === "MONITORING" ? "is-active" : ""}`}
          onClick={() => setView("MONITORING")}
        >
          En seguimiento
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "CLOSED"}
          className={`teacher-alerts__status-tab ${view === "CLOSED" ? "is-active" : ""}`}
          onClick={() => setView("CLOSED")}
        >
          Cerradas
        </button>
      </div>

      <div className="teacher-alerts__summary-grid">
        <article className="teacher-alerts__summary-card">
          <span>Pendientes</span>
          <strong>{categorizedAlerts.pending.length}</strong>
        </article>
        <article className="teacher-alerts__summary-card accent">
          <span>En seguimiento</span>
          <strong>{categorizedAlerts.monitoring.length}</strong>
        </article>
        <article className="teacher-alerts__summary-card warning">
          <span>Cerradas</span>
          <strong>{categorizedAlerts.closed.length}</strong>
        </article>
        <article className="teacher-alerts__summary-card critical">
          <span>Críticas</span>
          <strong>{alerts.filter((alert) => alert.level === "CRITICAL").length}</strong>
        </article>
      </div>

      {successMessage ? <div className="teacher-alerts__message success">{successMessage}</div> : null}
      {errorMessage ? <div className="teacher-alerts__message error">{errorMessage}</div> : null}

      {loading ? (
        <div className="teacher-alerts__empty">Cargando alertas...</div>
      ) : visibleAlerts.length === 0 ? (
        <div className="teacher-alerts__empty">
          {view === "PENDING"
            ? "No hay alertas pendientes para tu seguimiento en este período."
            : view === "MONITORING"
              ? "No hay alertas en seguimiento en este período."
              : "No hay alertas cerradas en este período."}
        </div>
      ) : (
        <div className="teacher-alerts__grid">
          {visibleAlerts.map((alert) => {
            const latestTeacherEvent = getLatestEvent(alert, [
              "TEACHER_INITIAL_SUBMITTED",
              "TEACHER_FINAL_SUBMITTED",
            ]);
            const latestAdminEvent = getLatestEvent(alert, [
              "ADMIN_REVIEW_APPROVED",
              "ADMIN_REVIEW_REJECTED",
              "ADMIN_CLOSED_POSITIVE",
              "ADMIN_CLOSED_NEGATIVE",
            ]);

            return (
              <article key={alert.id} className="teacher-alert-card">
                <div className="teacher-alert-card__top">
                  <div>
                    <span className="teacher-alert-card__type">{alertTypeLabel(alert.alert_type)}</span>
                    <h3>{alert.student_name}</h3>
                  </div>
                  <span className={`teacher-alert-card__level ${alert.level.toLowerCase()}`}>
                    {alertLevelLabel(alert.level)}
                  </span>
                </div>

                <p className="teacher-alert-card__message">{alert.message_teacher}</p>

                <div className="teacher-alert-card__meta">
                  <span>Periodo {alert.period}</span>
                  <span>{statusLabel(alert.status)}</span>
                </div>

                {latestTeacherEvent ? (
                  <div className="teacher-alert-card__info-box">
                    <strong>{latestTeacherEvent.title}</strong>
                    <span>{formatDateTime(latestTeacherEvent.created_at)}</span>
                    {latestTeacherEvent.notes ? <p>{latestTeacherEvent.notes}</p> : null}
                  </div>
                ) : null}

                {latestAdminEvent ? (
                  <div className="teacher-alert-card__info-box subtle">
                    <strong>{latestAdminEvent.title}</strong>
                    <span>{formatDateTime(latestAdminEvent.created_at)}</span>
                    {latestAdminEvent.notes ? <p>{latestAdminEvent.notes}</p> : null}
                  </div>
                ) : null}

                {alert.status === "MONITORING" && alert.next_follow_up_due_at ? (
                  <div className="teacher-alert-card__info-box subtle">
                    <strong>Próxima revisión docente</strong>
                    <span>{formatDateTime(alert.next_follow_up_due_at)}</span>
                  </div>
                ) : null}

                {alert.status === "TEACHER_INITIAL_PENDING" || alert.status === "TEACHER_FINAL_PENDING" ? (
                  <button
                    className="teacher-alert-card__action"
                    onClick={() => handleOpenFollowUp(alert)}
                  >
                    {alert.status === "TEACHER_FINAL_PENDING"
                      ? "Confirmar evolución"
                      : "Registrar seguimiento"}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {selectedAlert ? (
        <div className="teacher-alerts-modal-backdrop">
          <div className="teacher-alerts-modal">
            <div className="teacher-alerts-modal__header">
              <div>
                <h3>
                  {selectedAlert.status === "TEACHER_FINAL_PENDING"
                    ? "Confirmación final del seguimiento"
                    : "Seguimiento docente"}
                </h3>
                <p>{selectedAlert.student_name}</p>
              </div>
              <button type="button" className="teacher-alerts-modal__close" onClick={handleCloseFollowUp}>
                ×
              </button>
            </div>

            <div className="teacher-alerts-modal__body">
              <div className="teacher-alerts-modal__summary">
                <span>{alertTypeLabel(selectedAlert.alert_type)}</span>
                <span>Periodo {selectedAlert.period}</span>
                <span>{statusLabel(selectedAlert.status)}</span>
              </div>

              <div className="teacher-alerts-modal__message">
                <label>Detalle de la alerta</label>
                <div>{selectedAlert.message_teacher}</div>
              </div>

              {selectedAlert.status === "TEACHER_FINAL_PENDING" ? (
                <div className="teacher-alerts-modal__toggle-group">
                  <label>¿Hubo mejora después del seguimiento?</label>
                  <div className="teacher-alerts-modal__choice-row">
                    <button
                      type="button"
                      className={`teacher-alerts-modal__choice ${improvementConfirmed ? "is-active" : ""}`}
                      onClick={() => setImprovementConfirmed(true)}
                    >
                      Sí, hubo mejora
                    </button>
                    <button
                      type="button"
                      className={`teacher-alerts-modal__choice ${!improvementConfirmed ? "is-active" : ""}`}
                      onClick={() => setImprovementConfirmed(false)}
                    >
                      No hubo mejora
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="teacher-alerts-modal__notes">
                <label>Observación docente</label>
                <textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Describe la intervención realizada, acuerdos con el estudiante o hallazgos del seguimiento..."
                />
              </div>
            </div>

            <div className="teacher-alerts-modal__footer">
              <button type="button" className="teacher-alerts-modal__secondary" onClick={handleCloseFollowUp}>
                Cancelar
              </button>
              <button
                type="button"
                className="teacher-alerts-modal__primary"
                onClick={handleSubmitFollowUp}
                disabled={submittingId === selectedAlert.id}
              >
                {submittingId === selectedAlert.id ? "Enviando..." : "Enviar a coordinación"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default TeacherAcademicAlerts;
