import React, { useEffect, useMemo, useState } from "react";
import StyledSelect from "@/components/StyledSelect";
import {
  getMyAttendanceRecords,
  type StudentAttendanceRecord,
} from "@/commons/personas/services/attendanceService";
import "../styles/studentAttendance.css";

const formatPrettyDate = (value: string) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("es-CO");
};

const statusLabel = (status: "PRESENT" | "ABSENT" | "LATE") => {
  if (status === "PRESENT") return "Presente";
  if (status === "ABSENT") return "Ausente";
  return "Tarde";
};

const justificationLabel = (value: string) => {
  if (value === "MEDICAL") return "Excusa médica";
  if (value === "PERMISSION") return "Permiso";
  if (value === "CALAMITY") return "Calamidad";
  if (value === "OTHER") return "Otra";
  return "Sin justificar";
};

const StudentAttendance: React.FC = () => {
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await getMyAttendanceRecords();
      setRecords(res.data || []);
    } catch (error: any) {
      console.error("Error cargando asistencias del estudiante", error);
      setErrorMessage(
        error?.response?.data?.detail ||
          "No se pudo cargar la asistencia."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (statusFilter === "ALL") return records;
    return records.filter((record) => record.status === statusFilter);
  }, [records, statusFilter]);

  const summary = useMemo(() => {
    return records.reduce(
      (acc, item) => {
        if (item.status === "PRESENT") acc.present += 1;
        if (item.status === "ABSENT") acc.absent += 1;
        if (item.status === "LATE") acc.late += 1;
        if (item.is_justified) acc.justified += 1;
        acc.total += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, justified: 0, total: 0 }
    );
  }, [records]);

  return (
    <div className="student-attendance-page">
      <section className="student-attendance-hero">
        <div className="student-attendance-hero-copy">
          <span className="student-attendance-badge">Asistencia</span>
          <h1>Mi historial de asistencia</h1>
          <p>
            Consulta tus registros, revisa tus ausencias y verifica si alguna
            fue justificada.
          </p>
        </div>

        <div className="student-attendance-filter-card">
          <label>Filtrar por estado</label>
          <StyledSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="PRESENT">Presente</option>
            <option value="ABSENT">Ausente</option>
            <option value="LATE">Tarde</option>
          </StyledSelect>
        </div>
      </section>

      <div className="student-attendance-summary-grid">
        <div className="student-attendance-summary-card">
          <span>Registros</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="student-attendance-summary-card absent">
          <span>Ausencias</span>
          <strong>{summary.absent}</strong>
        </div>
        <div className="student-attendance-summary-card late">
          <span>Tardanzas</span>
          <strong>{summary.late}</strong>
        </div>
        <div className="student-attendance-summary-card justified">
          <span>Justificadas</span>
          <strong>{summary.justified}</strong>
        </div>
      </div>

      {errorMessage && (
        <div className="student-attendance-message error">{errorMessage}</div>
      )}

      {loading ? (
        <div className="student-attendance-empty-box">
          Cargando asistencias...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="student-attendance-empty-box">
          No hay registros de asistencia para mostrar.
        </div>
      ) : (
        <section className="student-attendance-table-section">
          <div className="student-attendance-section-header">
            <h3>Registros de asistencia</h3>
            <p>Aquí puedes ver tus fechas, estado, observaciones y soportes.</p>
          </div>

          <div className="student-attendance-table-wrapper">
            <table className="student-attendance-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Justificada</th>
                  <th>Motivo</th>
                  <th>Observación</th>
                  <th>Soporte</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{formatPrettyDate(record.date)}</td>
                    <td>
                      <span
                        className={`student-attendance-status-pill ${record.status.toLowerCase()}`}
                      >
                        {statusLabel(record.status)}
                      </span>
                    </td>
                    <td>
                      {record.is_justified ? (
                        <span className="student-attendance-justified yes">
                          Sí
                        </span>
                      ) : (
                        <span className="student-attendance-justified no">
                          No
                        </span>
                      )}
                    </td>
                    <td>{justificationLabel(record.justification_type)}</td>
                    <td className="student-attendance-observation-cell">
                      {record.notes || "Sin observación"}
                    </td>
                    <td>
                      {record.attachment_url ? (
                        <a
                          href={record.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="student-attendance-file-link"
                        >
                          Ver soporte
                        </a>
                      ) : (
                        <span className="student-attendance-muted">
                          Sin archivo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentAttendance;
