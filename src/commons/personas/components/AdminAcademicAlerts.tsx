import React, { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import StyledSelect from "@/components/StyledSelect";
import {
  closeAcademicAlert,
  generateAcademicAlerts,
  getAcademicAlerts,
  reviewAcademicAlert,
  type AcademicAlert,
  type AlertType,
} from "@/commons/personas/services/academicAlertService";
import "./../styles/adminAcademicAlerts.css";

const API_COURSES = "/api/report-cards/courses/";

type AdminView = "PENDING_REVIEW" | "IN_PROGRESS" | "CLOSED";
type CourseFilterValue = number | "ALL";

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

const alertStatusLabel = (status: AcademicAlert["status"]) => {
  switch (status) {
    case "TEACHER_INITIAL_PENDING":
      return "Pendiente docente";
    case "ADMIN_INITIAL_REVIEW":
      return "Revisión inicial";
    case "MONITORING":
      return "En seguimiento";
    case "TEACHER_FINAL_PENDING":
      return "Confirmación docente";
    case "ADMIN_FINAL_REVIEW":
      return "Cierre pendiente";
    case "RESOLVED_POSITIVE":
      return "Cierre satisfactorio";
    case "RESOLVED_NEGATIVE":
      return "Cierre no satisfactorio";
    default:
      return status;
  }
};

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-CO");
};

const AdminAcademicAlerts: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseFilterValue>("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [filterType, setFilterType] = useState<AlertType | "">("");
  const [activeView, setActiveView] = useState<AdminView>("PENDING_REVIEW");
  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [processingAlertId, setProcessingAlertId] = useState<number | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AcademicAlert | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadCourses();
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [selectedCourse, selectedPeriod, filterType]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await api.get<CourseItem[]>(API_COURSES);
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error cargando cursos", error);
      setErrorMessage("No se pudieron cargar los cursos.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setLoadingAlerts(true);
      setErrorMessage("");

      const res = await getAcademicAlerts({
        course: selectedCourse === "ALL" ? undefined : Number(selectedCourse),
        period: selectedPeriod,
        alert_type: filterType,
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
    if (selectedCourse === "ALL") {
      setErrorMessage("Para generar alertas debes escoger un curso específico.");
      return;
    }

    try {
      setGenerating(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await generateAcademicAlerts(selectedCourse, selectedPeriod);
      setSuccessMessage(`${res.data.detail} Se generaron ${res.data.count} alerta(s).`);
      await loadAlerts();
      window.setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      console.error("Error generando alertas", error);
      setErrorMessage(error?.response?.data?.detail || "No se pudieron generar las alertas.");
    } finally {
      setGenerating(false);
    }
  };

  const categorizedAlerts = useMemo(() => {
    const pendingReview = alerts.filter((alert) =>
      ["ADMIN_INITIAL_REVIEW", "ADMIN_FINAL_REVIEW"].includes(alert.status),
    );
    const inProgress = alerts.filter((alert) =>
      ["TEACHER_INITIAL_PENDING", "MONITORING", "TEACHER_FINAL_PENDING"].includes(alert.status),
    );
    const closed = alerts.filter((alert) =>
      ["RESOLVED_POSITIVE", "RESOLVED_NEGATIVE"].includes(alert.status),
    );
    return { pendingReview, inProgress, closed };
  }, [alerts]);

  const visibleAlerts = useMemo(() => {
    if (activeView === "PENDING_REVIEW") return categorizedAlerts.pendingReview;
    if (activeView === "IN_PROGRESS") return categorizedAlerts.inProgress;
    return categorizedAlerts.closed;
  }, [activeView, categorizedAlerts]);

  const summary = useMemo(
    () => ({
      total: alerts.length,
      pendingReview: categorizedAlerts.pendingReview.length,
      inProgress: categorizedAlerts.inProgress.length,
      closed: categorizedAlerts.closed.length,
    }),
    [alerts, categorizedAlerts],
  );

  const openActionModal = (alert: AcademicAlert) => {
    setSelectedAlert(alert);
    setAdminNotes(alert.resolution_notes || "");
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedAlert(null);
    setAdminNotes("");
  };

  const handleAdminReview = async (decision: "APPROVE" | "REJECT") => {
    if (!selectedAlert) return;
    try {
      setProcessingAlertId(selectedAlert.id);
      setErrorMessage("");
      await reviewAcademicAlert(selectedAlert.id, { decision, notes: adminNotes });
      setSuccessMessage(
        decision === "APPROVE"
          ? "El seguimiento inicial fue aprobado."
          : "El seguimiento inicial fue rechazado y volvió al docente."
      );
      closeActionModal();
      await loadAlerts();
      window.setTimeout(() => setSuccessMessage(""), 2200);
    } catch (error: any) {
      console.error("Error revisando seguimiento", error);
      setErrorMessage(error?.response?.data?.detail || "No se pudo registrar la revisión.");
    } finally {
      setProcessingAlertId(null);
    }
  };

  const handleAdminClose = async (outcome: "POSITIVE" | "NEGATIVE") => {
    if (!selectedAlert) return;
    try {
      setProcessingAlertId(selectedAlert.id);
      setErrorMessage("");
      await closeAcademicAlert(selectedAlert.id, { outcome, notes: adminNotes });
      setSuccessMessage(
        outcome === "POSITIVE"
          ? "La alerta fue cerrada satisfactoriamente."
          : "La alerta fue cerrada con resultado no satisfactorio."
      );
      closeActionModal();
      await loadAlerts();
      window.setTimeout(() => setSuccessMessage(""), 2200);
    } catch (error: any) {
      console.error("Error cerrando alerta", error);
      setErrorMessage(error?.response?.data?.detail || "No se pudo cerrar la alerta.");
    } finally {
      setProcessingAlertId(null);
    }
  };

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
            Coordina el flujo completo de revisión: alerta inicial, seguimiento docente,
            monitoreo semanal y cierre final con trazabilidad.
          </p>
        </div>

        <div className="admin-alerts-controls">
          <div className="admin-alerts-control-card">
            <label>Curso</label>
            <StyledSelect
              value={selectedCourse}
              onChange={(e) =>
                setSelectedCourse(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                )
              }
            >
              <option value="ALL">Todos los cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.nombre}
                </option>
              ))}
            </StyledSelect>
          </div>

          <div className="admin-alerts-control-card">
            <label>Período</label>
            <StyledSelect value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value))}>
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </StyledSelect>
          </div>

          <div className="admin-alerts-control-card">
            <label>Tipo</label>
            <StyledSelect value={filterType} onChange={(e) => setFilterType(e.target.value as AlertType | "") }>
              <option value="">Todos</option>
              <option value="LOW_GRADE">Bajo rendimiento</option>
              <option value="ABSENCE_RISK">Inasistencia</option>
              <option value="MISSING_ASSIGNMENTS">No entregas</option>
            </StyledSelect>
          </div>

          <button
            type="button"
            className="admin-alerts-generate-btn"
            onClick={handleGenerateAlerts}
            disabled={generating || selectedCourse === "ALL"}
          >
            {generating ? "Generando..." : "Generar alertas"}
          </button>
        </div>
      </section>

      <div className="admin-alerts-status-tabs" role="tablist" aria-label="Vista de alertas">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === "PENDING_REVIEW"}
          className={`admin-alerts-status-tab ${activeView === "PENDING_REVIEW" ? "is-active" : ""}`}
          onClick={() => setActiveView("PENDING_REVIEW")}
        >
          Por revisar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === "IN_PROGRESS"}
          className={`admin-alerts-status-tab ${activeView === "IN_PROGRESS" ? "is-active" : ""}`}
          onClick={() => setActiveView("IN_PROGRESS")}
        >
          En curso
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === "CLOSED"}
          className={`admin-alerts-status-tab ${activeView === "CLOSED" ? "is-active" : ""}`}
          onClick={() => setActiveView("CLOSED")}
        >
          Cerradas
        </button>
      </div>

      {successMessage ? <div className="admin-alerts-message success">{successMessage}</div> : null}
      {errorMessage ? <div className="admin-alerts-message error">{errorMessage}</div> : null}

      <section className="admin-alerts-summary-grid">
        <div className="admin-alerts-summary-card">
          <span>Total</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="admin-alerts-summary-card active">
          <span>Por revisar</span>
          <strong>{summary.pendingReview}</strong>
        </div>
        <div className="admin-alerts-summary-card warning">
          <span>En curso</span>
          <strong>{summary.inProgress}</strong>
        </div>
        <div className="admin-alerts-summary-card critical">
          <span>Cerradas</span>
          <strong>{summary.closed}</strong>
        </div>
      </section>

      {loadingAlerts ? (
        <div className="admin-alerts-empty">Cargando alertas...</div>
      ) : visibleAlerts.length === 0 ? (
        <div className="admin-alerts-empty">
          {activeView === "PENDING_REVIEW"
            ? "No hay alertas pendientes de revisión administrativa."
            : activeView === "IN_PROGRESS"
              ? "No hay alertas en curso para los filtros seleccionados."
              : "No hay alertas cerradas para los filtros seleccionados."}
        </div>
      ) : (
        <section className="admin-alerts-table-section">
          <div className="admin-alerts-table-header">
            <h3>
              {activeView === "PENDING_REVIEW"
                ? "Bandeja de revisión administrativa"
                : activeView === "IN_PROGRESS"
                  ? "Alertas en curso"
                  : "Historial de cierres"}
            </h3>
            <p>
              {activeView === "PENDING_REVIEW"
                ? "Aquí decides si el seguimiento docente inicial se aprueba o vuelve para ajustes, y también realizas el cierre final."
                : activeView === "IN_PROGRESS"
                  ? "Consulta qué alertas siguen en manos del docente o están esperando la segunda verificación semanal."
                  : "Mantén la trazabilidad de los cierres satisfactorios y no satisfactorios del proceso."}
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
                {visibleAlerts.map((alert) => {
                  const latestTeacherEvent = [...alert.events]
                    .reverse()
                    .find((event) =>
                      ["TEACHER_INITIAL_SUBMITTED", "TEACHER_FINAL_SUBMITTED"].includes(event.event_type),
                    );

                  return (
                    <tr key={alert.id}>
                      <td className="admin-alerts-student-cell">{alert.student_name}</td>
                      <td>{alert.course_name}</td>
                      <td>{alert.period}</td>
                      <td>{alertTypeLabel(alert.alert_type)}</td>
                      <td>
                        <span className={`alert-level-pill ${alert.level.toLowerCase()}`}>
                          {alertLevelLabel(alert.level)}
                        </span>
                      </td>
                      <td>
                        <span className={`alert-status-pill ${alert.status.toLowerCase()}`}>
                          {alertStatusLabel(alert.status)}
                        </span>
                      </td>
                      <td className="admin-alerts-message-cell">{alert.message_admin}</td>
                      <td>{alert.metric_value !== null ? alert.metric_value : "—"}</td>
                      <td>
                        {alert.status === "ADMIN_INITIAL_REVIEW" || alert.status === "ADMIN_FINAL_REVIEW" ? (
                          <button
                            type="button"
                            className="admin-alerts-resolve-btn"
                            onClick={() => openActionModal(alert)}
                          >
                            {alert.status === "ADMIN_INITIAL_REVIEW" ? "Revisar" : "Cerrar"}
                          </button>
                        ) : alert.status === "MONITORING" ? (
                          <div className="admin-alerts-resolved-box">
                            <span>Próxima verificación</span>
                            <small>{formatDateTime(alert.next_follow_up_due_at)}</small>
                          </div>
                        ) : alert.status === "TEACHER_INITIAL_PENDING" || alert.status === "TEACHER_FINAL_PENDING" ? (
                          <div className="admin-alerts-resolved-box">
                            <span>Esperando docente</span>
                            <small>
                              {latestTeacherEvent
                                ? `Último envío: ${formatDateTime(latestTeacherEvent.created_at)}`
                                : "Aún sin seguimiento"}
                            </small>
                          </div>
                        ) : (
                          <div className="admin-alerts-resolved-box">
                            <span>{alert.resolved_by_name ? `Por ${alert.resolved_by_name}` : "Cerrada"}</span>
                            <small>{formatDateTime(alert.resolved_at)}</small>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showActionModal && selectedAlert ? (
        <div className="admin-alerts-modal-backdrop">
          <div className="admin-alerts-modal">
            <div className="admin-alerts-modal-header">
              <div>
                <h2>
                  {selectedAlert.status === "ADMIN_INITIAL_REVIEW"
                    ? "Revisión del seguimiento docente"
                    : "Cierre final de la alerta"}
                </h2>
                <p>{selectedAlert.student_name}</p>
              </div>
              <button type="button" className="admin-alerts-close-btn" onClick={closeActionModal}>
                ✕
              </button>
            </div>

            <div className="admin-alerts-modal-body">
              <div className="admin-alerts-detail-card">
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
                <div>
                  <span>Estado</span>
                  <strong>{alertStatusLabel(selectedAlert.status)}</strong>
                </div>
              </div>

              <div className="admin-alerts-full-message">
                <label>Mensaje institucional</label>
                <div>{selectedAlert.message_admin}</div>
              </div>

              {[...selectedAlert.events]
                .filter((event) =>
                  selectedAlert.status === "ADMIN_INITIAL_REVIEW"
                    ? event.event_type === "TEACHER_INITIAL_SUBMITTED"
                    : event.event_type === "TEACHER_FINAL_SUBMITTED",
                )
                .slice(-1)
                .map((event) => (
                  <div key={event.id} className="admin-alerts-full-message">
                    <label>{event.title}</label>
                    <div>
                      <strong>{event.actor_name || "Docente"}</strong>
                      <br />
                      <small>{formatDateTime(event.created_at)}</small>
                      {event.notes ? (
                        <p className="admin-alerts-event-notes">{event.notes}</p>
                      ) : null}
                      {event.metadata?.improvement_confirmed !== undefined ? (
                        <p className="admin-alerts-event-notes">
                          {event.metadata.improvement_confirmed
                            ? "El docente reportó mejora en el estudiante."
                            : "El docente reportó que no hubo mejora."}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}

              <div className="admin-alerts-notes-block">
                <label>
                  {selectedAlert.status === "ADMIN_INITIAL_REVIEW"
                    ? "Observación de revisión"
                    : "Observación final"}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    selectedAlert.status === "ADMIN_INITIAL_REVIEW"
                      ? "Indica por qué apruebas o rechazas el seguimiento docente..."
                      : "Registra el comentario final del cierre satisfactorio o no satisfactorio..."
                  }
                />
              </div>
            </div>

            <div className="admin-alerts-modal-footer admin-alerts-modal-footer--spread">
              <button type="button" className="admin-alerts-secondary-btn" onClick={closeActionModal}>
                Cancelar
              </button>

              {selectedAlert.status === "ADMIN_INITIAL_REVIEW" ? (
                <div className="admin-alerts-modal-footer-actions">
                  <button
                    type="button"
                    className="admin-alerts-danger-btn"
                    onClick={() => handleAdminReview("REJECT")}
                    disabled={processingAlertId === selectedAlert.id}
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    className="admin-alerts-primary-btn"
                    onClick={() => handleAdminReview("APPROVE")}
                    disabled={processingAlertId === selectedAlert.id}
                  >
                    Aprobar seguimiento
                  </button>
                </div>
              ) : (
                <div className="admin-alerts-modal-footer-actions">
                  <button
                    type="button"
                    className="admin-alerts-danger-btn"
                    onClick={() => handleAdminClose("NEGATIVE")}
                    disabled={processingAlertId === selectedAlert.id}
                  >
                    Cierre negativo
                  </button>
                  <button
                    type="button"
                    className="admin-alerts-primary-btn"
                    onClick={() => handleAdminClose("POSITIVE")}
                    disabled={processingAlertId === selectedAlert.id}
                  >
                    Cierre satisfactorio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminAcademicAlerts;
