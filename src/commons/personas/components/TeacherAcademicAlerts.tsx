import React, { useEffect, useMemo, useState } from "react";
import {
  generateAcademicAlerts,
  getAcademicAlerts,
  resolveAcademicAlert,
} from "@/commons/personas/services/academicAlertService";
import type { AcademicAlert } from "@/commons/personas/services/academicAlertService";
import "../styles/teacherAcademicAlerts.css";

const alertTypeLabel = (type: string) => {
  if (type === "LOW_GRADE") return "Bajo rendimiento";
  if (type === "ABSENCE_RISK") return "Inasistencia";
  if (type === "MISSING_ASSIGNMENTS") return "No entregas";
  return type;
};

const alertLevelLabel = (level: string) => {
  if (level === "CRITICAL") return "Critica";
  if (level === "WARNING") return "Advertencia";
  return level;
};

const TeacherAcademicAlerts: React.FC = () => {
  const [period, setPeriod] = useState<number>(1);
  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await getAcademicAlerts({
        period,
        status: "ACTIVE",
      });

      setAlerts(res.data || []);
    } catch (error) {
      console.error("Error cargando alertas", error);
      setErrorMessage("No fue posible cargar las alertas del curso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [period]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setErrorMessage("");
      setSuccessMessage("");
      await generateAcademicAlerts(0, period);
      await loadAlerts();
      setSuccessMessage("Las alertas del periodo fueron actualizadas.");
      setTimeout(() => setSuccessMessage(""), 2200);
    } catch (error) {
      console.error("Error generando alertas", error);
      setErrorMessage("No se pudieron generar las alertas del periodo.");
    } finally {
      setGenerating(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      setResolvingId(id);
      setErrorMessage("");
      setSuccessMessage("");
      await resolveAcademicAlert(id, "Seguimiento docente realizado.");
      await loadAlerts();
      setSuccessMessage("La alerta fue marcada como atendida.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error resolviendo alerta", error);
      setErrorMessage("No se pudo resolver la alerta.");
    } finally {
      setResolvingId(null);
    }
  };

  const summary = useMemo(
    () => ({
      total: alerts.length,
      critical: alerts.filter((alert) => alert.level === "CRITICAL").length,
      warning: alerts.filter((alert) => alert.level === "WARNING").length,
      absences: alerts.filter((alert) => alert.alert_type === "ABSENCE_RISK").length,
    }),
    [alerts],
  );

  return (
    <section className="teacher-alerts">
      <div className="teacher-alerts__hero">
        <div className="teacher-alerts__hero-copy">
          <span className="teacher-alerts__badge">Alertas tempranas</span>
          <h2>Seguimiento preventivo del curso</h2>
          <p>
            Consulta senales de riesgo, genera alertas del periodo y deja al dia el
            seguimiento academico de tus estudiantes.
          </p>
        </div>

        <div className="teacher-alerts__hero-actions">
          <label className="teacher-alerts__control-card">
            <span>Periodo</span>
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </select>
          </label>

          <button
            className="teacher-alerts__primary-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generando..." : "Actualizar alertas"}
          </button>
        </div>
      </div>

      <div className="teacher-alerts__summary-grid">
        <article className="teacher-alerts__summary-card">
          <span>Total activas</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="teacher-alerts__summary-card critical">
          <span>Criticas</span>
          <strong>{summary.critical}</strong>
        </article>
        <article className="teacher-alerts__summary-card warning">
          <span>Advertencias</span>
          <strong>{summary.warning}</strong>
        </article>
        <article className="teacher-alerts__summary-card accent">
          <span>Por inasistencia</span>
          <strong>{summary.absences}</strong>
        </article>
      </div>

      {successMessage ? (
        <div className="teacher-alerts__message success">{successMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className="teacher-alerts__message error">{errorMessage}</div>
      ) : null}

      {loading ? (
        <div className="teacher-alerts__empty">Cargando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="teacher-alerts__empty">
          No hay alertas activas para este periodo.
        </div>
      ) : (
        <div className="teacher-alerts__grid">
          {alerts.map((alert) => (
            <article key={alert.id} className="teacher-alert-card">
              <div className="teacher-alert-card__top">
                <div>
                  <span className="teacher-alert-card__type">
                    {alertTypeLabel(alert.alert_type)}
                  </span>
                  <h3>{alert.student_name}</h3>
                </div>
                <span
                  className={`teacher-alert-card__level ${alert.level.toLowerCase()}`}
                >
                  {alertLevelLabel(alert.level)}
                </span>
              </div>

              <p className="teacher-alert-card__message">{alert.message_teacher}</p>

              <div className="teacher-alert-card__meta">
                <span>Periodo {alert.period}</span>
                <span>
                  {alert.metric_value !== null ? `Indicador ${alert.metric_value}` : "Sin metrica"}
                </span>
              </div>

              <button
                className="teacher-alert-card__action"
                onClick={() => handleResolve(alert.id)}
                disabled={resolvingId === alert.id}
              >
                {resolvingId === alert.id ? "Resolviendo..." : "Marcar seguimiento"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeacherAcademicAlerts;
