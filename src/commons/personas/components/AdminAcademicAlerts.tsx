import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  generateAcademicAlerts,
  getAcademicAlerts,
  resolveAcademicAlert,
  type AcademicAlert,
  type AlertStatus,
  type AlertType,
} from "@/commons/personas/services/academicAlertService";
import "./../styles/adminAcademicAlerts.css";

const API_COURSES = "http://127.0.0.1:8000/api/report-cards/courses/";

interface CourseItem {
  id: number;
  nombre: string;
  docente: string;
  total_estudiantes: number;
}

const alertTypeLabel = (type: AlertType) => {
  if (type === "LOW_GRADE") return "Bajo rendimiento";
  if (type === "ABSENCE_RISK") return "Inasistencia";
  return "No entregas";
};

const alertLevelLabel = (level: string) => {
  if (level === "CRITICAL") return "Crítica";
  return "Advertencia";
};

const alertStatusLabel = (status: string) => {
  if (status === "RESOLVED") return "Resuelta";
  return "Activa";
};

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const AdminAcademicAlerts: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  const [filterType, setFilterType] = useState<AlertType | "">("");
  const [filterStatus, setFilterStatus] = useState<AlertStatus | "">("ACTIVE");

  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AcademicAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse !== "") {
      loadAlerts();
    }
  }, [selectedCourse, selectedPeriod, filterType, filterStatus]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await axios.get<CourseItem[]>(API_COURSES, {
        headers: authHeaders,
      });
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error cargando cursos", error);
      setErrorMessage("No se pudieron cargar los cursos.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAlerts = async () => {
    if (selectedCourse === "") return;

    try {
      setLoadingAlerts(true);
      setErrorMessage("");

      const res = await getAcademicAlerts({
        course: Number(selectedCourse),
        period: selectedPeriod,
        alert_type: filterType,
        status: filterStatus,
      });

      setAlerts(res.data || []);
    } catch (error) {
      console.error("Error cargando alertas", error);
      setErrorMessage("No se pudieron cargar las alertas.");
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleGenerateAlerts = async () => {
    if (selectedCourse === "") {
      setErrorMessage("Debes seleccionar un curso.");
      return;
    }

    try {
      setGenerating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await generateAcademicAlerts(Number(selectedCourse), selectedPeriod);

      setSuccessMessage(
        `${res.data.detail} Se generaron ${res.data.count} alerta(s).`
      );

      await loadAlerts();
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      console.error("Error generando alertas", error);
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron generar las alertas."
      );
    } finally {
      setGenerating(false);
    }
  };

  const openResolveModal = (alert: AcademicAlert) => {
    setSelectedAlert(alert);
    setResolutionNotes(alert.resolution_notes || "");
    setShowResolveModal(true);
  };

  const closeResolveModal = () => {
    setShowResolveModal(false);
    setSelectedAlert(null);
    setResolutionNotes("");
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;

    try {
      setResolvingId(selectedAlert.id);
      setErrorMessage("");

      await resolveAcademicAlert(selectedAlert.id, resolutionNotes);

      setSuccessMessage("Alerta resuelta correctamente.");
      closeResolveModal();
      await loadAlerts();
      setTimeout(() => setSuccessMessage(""), 2200);
    } catch (error: any) {
      console.error("Error resolviendo alerta", error);
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo resolver la alerta."
      );
    } finally {
      setResolvingId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      total: alerts.length,
      active: alerts.filter((a) => a.status === "ACTIVE").length,
      critical: alerts.filter((a) => a.level === "CRITICAL").length,
      warning: alerts.filter((a) => a.level === "WARNING").length,
    };
  }, [alerts]);

  if (loadingCourses) {
    return <div className="admin-alerts-empty">Cargando alertas académicas...</div>;
  }

  return (
    <div className="admin-alerts-page">
      <section className="admin-alerts-hero">
        <div className="admin-alerts-hero-copy">
          <span className="admin-alerts-badge">Alertas tempranas</span>
          <h1>Seguimiento académico preventivo</h1>
          <p>
            Genera y consulta alertas por bajo rendimiento, inasistencia y no
            entrega de actividades antes de finalizar el período.
          </p>
        </div>

        <div className="admin-alerts-controls">
          <div className="admin-alerts-control-card">
            <label>Curso</label>
            <select
              value={selectedCourse}
              onChange={(e) =>
                setSelectedCourse(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Selecciona un curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-alerts-control-card">
            <label>Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            >
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </select>
          </div>

          <div className="admin-alerts-control-card">
            <label>Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AlertType | "")}
            >
              <option value="">Todos</option>
              <option value="LOW_GRADE">Bajo rendimiento</option>
              <option value="ABSENCE_RISK">Inasistencia</option>
              <option value="MISSING_ASSIGNMENTS">No entregas</option>
            </select>
          </div>

          <div className="admin-alerts-control-card">
            <label>Estado</label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as AlertStatus | "")
              }
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Activas</option>
              <option value="RESOLVED">Resueltas</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-alerts-generate-btn"
            onClick={handleGenerateAlerts}
            disabled={generating || selectedCourse === ""}
          >
            {generating ? "Generando..." : "Generar alertas"}
          </button>
        </div>
      </section>

      {successMessage && (
        <div className="admin-alerts-message success">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="admin-alerts-message error">{errorMessage}</div>
      )}

      <section className="admin-alerts-summary-grid">
        <div className="admin-alerts-summary-card">
          <span>Total</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="admin-alerts-summary-card active">
          <span>Activas</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="admin-alerts-summary-card critical">
          <span>Críticas</span>
          <strong>{summary.critical}</strong>
        </div>
        <div className="admin-alerts-summary-card warning">
          <span>Advertencias</span>
          <strong>{summary.warning}</strong>
        </div>
      </section>

      {!selectedCourse ? (
        <div className="admin-alerts-empty">
          Selecciona un curso para ver y generar alertas.
        </div>
      ) : loadingAlerts ? (
        <div className="admin-alerts-empty">Cargando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="admin-alerts-empty">
          No hay alertas para los filtros seleccionados.
        </div>
      ) : (
        <section className="admin-alerts-table-section">
          <div className="admin-alerts-table-header">
            <h3>Listado de alertas</h3>
            <p>
              Consulta el detalle de cada estudiante y resuelve las alertas cuando
              ya exista seguimiento.
            </p>
          </div>

          <div className="admin-alerts-table-wrapper">
            <table className="admin-alerts-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Período</th>
                  <th>Tipo</th>
                  <th>Nivel</th>
                  <th>Estado</th>
                  <th>Mensaje</th>
                  <th>Métrica</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="admin-alerts-student-cell">
                      {alert.student_name}
                    </td>
                    <td>{alert.course_name}</td>
                    <td>{alert.period}</td>
                    <td>{alertTypeLabel(alert.alert_type)}</td>
                    <td>
                      <span
                        className={`alert-level-pill ${alert.level.toLowerCase()}`}
                      >
                        {alertLevelLabel(alert.level)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`alert-status-pill ${alert.status.toLowerCase()}`}
                      >
                        {alertStatusLabel(alert.status)}
                      </span>
                    </td>
                    <td className="admin-alerts-message-cell">
                      {alert.message_admin}
                    </td>
                    <td>
                      {alert.metric_value !== null ? alert.metric_value : "—"}
                    </td>
                    <td>
                      {alert.status === "ACTIVE" ? (
                        <button
                          type="button"
                          className="admin-alerts-resolve-btn"
                          onClick={() => openResolveModal(alert)}
                        >
                          Resolver
                        </button>
                      ) : (
                        <div className="admin-alerts-resolved-box">
                          <span>Resuelta</span>
                          <small>{formatDateTime(alert.resolved_at)}</small>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showResolveModal && selectedAlert && (
        <div className="admin-alerts-modal-backdrop">
          <div className="admin-alerts-modal">
            <div className="admin-alerts-modal-header">
              <div>
                <h2>Resolver alerta</h2>
                <p>{selectedAlert.title}</p>
              </div>

              <button
                type="button"
                className="admin-alerts-close-btn"
                onClick={closeResolveModal}
              >
                ✕
              </button>
            </div>

            <div className="admin-alerts-modal-body">
              <div className="admin-alerts-detail-card">
                <div>
                  <span>Estudiante</span>
                  <strong>{selectedAlert.student_name}</strong>
                </div>
                <div>
                  <span>Curso</span>
                  <strong>{selectedAlert.course_name}</strong>
                </div>
                <div>
                  <span>Período</span>
                  <strong>{selectedAlert.period}</strong>
                </div>
                <div>
                  <span>Tipo</span>
                  <strong>{alertTypeLabel(selectedAlert.alert_type)}</strong>
                </div>
              </div>

              <div className="admin-alerts-full-message">
                <label>Mensaje institucional</label>
                <div>{selectedAlert.message_admin}</div>
              </div>

              <div className="admin-alerts-notes-block">
                <label>Observación de seguimiento</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe la acción realizada, reunión, seguimiento o acuerdo..."
                />
              </div>
            </div>

            <div className="admin-alerts-modal-footer">
              <button
                type="button"
                className="admin-alerts-secondary-btn"
                onClick={closeResolveModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-alerts-primary-btn"
                onClick={handleResolveAlert}
                disabled={resolvingId === selectedAlert.id}
              >
                {resolvingId === selectedAlert.id
                  ? "Resolviendo..."
                  : "Marcar como resuelta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicAlerts;