import React, { useEffect, useState } from "react";
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
  if (level === "CRITICAL") return "Crítica";
  if (level === "WARNING") return "Advertencia";
  return level;
};

const TeacherAcademicAlerts: React.FC = () => {
  const [period, setPeriod] = useState<number>(1);
  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);

      const res = await getAcademicAlerts({
        period,
        status: "ACTIVE",
      });

      setAlerts(res.data || []);
    } catch (error) {
      console.error("Error cargando alertas", error);
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

      // En tu backend docente genera sobre su curso al validar permisos.
      // Si luego cambias el backend para no pedir course en docente, ajustamos esto.
      await generateAcademicAlerts(0, period);
      await loadAlerts();
    } catch (error) {
      console.error("Error generando alertas", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      setResolvingId(id);
      await resolveAcademicAlert(id, "Seguimiento docente realizado.");
      await loadAlerts();
    } catch (error) {
      console.error("Error resolviendo alerta", error);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="teacher-alerts">
      <div className="teacher-alerts-header">
        <div>
          <h2>Alertas Académicas</h2>
          <p>Consulta estudiantes con riesgo académico en el período seleccionado.</p>
        </div>

        <div className="teacher-alerts-controls">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={1}>Periodo 1</option>
            <option value={2}>Periodo 2</option>
            <option value={3}>Periodo 3</option>
            <option value={4}>Periodo 4</option>
          </select>

          <button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generando..." : "Generar Alertas"}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando alertas...</p>
      ) : alerts.length === 0 ? (
        <p>No hay alertas activas para este período.</p>
      ) : (
        <table className="teacher-alerts-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Tipo</th>
              <th>Nivel</th>
              <th>Mensaje</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.student_name}</td>
                <td>{alertTypeLabel(alert.alert_type)}</td>
                <td>{alertLevelLabel(alert.level)}</td>
                <td>{alert.message_teacher}</td>

                <td>
                  {alert.status === "ACTIVE" && (
                    <button
                      className="resolve-btn"
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolvingId === alert.id}
                    >
                      {resolvingId === alert.id ? "Resolviendo..." : "Resolver"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherAcademicAlerts;