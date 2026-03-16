import React, { useEffect, useState } from "react";
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

  return (
    <div className="student-alerts">
      <div className="student-alerts-top">
        <div>
          <h2>Alertas Académicas</h2>
          <p>Revisa señales de riesgo y haz seguimiento a tu proceso.</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={1}>Periodo 1</option>
          <option value={2}>Periodo 2</option>
          <option value={3}>Periodo 3</option>
          <option value={4}>Periodo 4</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando información...</p>
      ) : (
        <>
          {summary && (
            <div className="student-alert-summary">
              <div>
                <strong>Promedio</strong>
                <span>
                  {summary.average !== null && summary.average !== undefined
                    ? summary.average.toFixed(1)
                    : "—"}
                </span>
              </div>

              <div>
                <strong>Fallas</strong>
                <span>{summary.absences}</span>
              </div>

              <div>
                <strong>Tareas sin entregar</strong>
                <span>{summary.missing_assignments}</span>
              </div>
            </div>
          )}

          <div className="student-alert-list">
            {alerts.length === 0 ? (
              <div className="student-alert-card">
                <h4>Sin alertas</h4>
                <p>No tienes alertas académicas en este período.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="student-alert-card">
                  <h4>{alert.title}</h4>
                  <p>{alert.message_student}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAcademicAlerts;