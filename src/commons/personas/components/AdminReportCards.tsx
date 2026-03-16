import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/adminReportCards.css";

const API_BASE = "http://127.0.0.1:8000/api/report-cards";

interface CourseItem {
  id: number;
  nombre: string;
  docente: string;
  total_estudiantes: number;
}

interface StudentItem {
  id: number;
  nombre: string;
  email: string;
  cedula: string;
}

interface CourseStudentsResponse {
  curso: {
    id: number;
    nombre: string;
  };
  estudiantes: StudentItem[];
}

interface ReportRow {
  materia_id: number;
  materia: string;
  area_id: number | null;
  area: string;
  indicadores: string[];
  p1: number | null;
  p2: number | null;
  p3: number | null;
  p4: number | null;
  definitiva: number | null;
  desempeno: string;
}

interface ReportAreaGroup {
  area: string;
  materias: ReportRow[];
}

interface StudentReportResponse {
  estudiante: {
    id: number;
    nombre: string;
    cedula: string;
    email: string;
  };
  curso: {
    id: number;
    nombre: string;
    director_curso: string;
  };
  rector_nombre: string;
  boletin: ReportRow[];
  boletin_agrupado: ReportAreaGroup[];
  promedio_general: number | null;
  desempeno_general: string;
}

const AdminReportCards: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  const [report, setReport] = useState<StudentReportResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState("Tercer periodo");

  useEffect(() => {
    loadCourses();
  }, []);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get<CourseItem[]>(`${API_BASE}/courses/`, {
        headers: authHeaders,
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error cargando cursos para boletines", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByCourse = async (course: CourseItem) => {
    try {
      setSelectedCourse(course);
      setSelectedStudent(null);
      setReport(null);

      const res = await axios.get<CourseStudentsResponse>(
        `${API_BASE}/courses/${course.id}/students/`,
        { headers: authHeaders }
      );

      setStudents(res.data.estudiantes || []);
    } catch (err) {
      console.error("Error cargando estudiantes del curso", err);
    }
  };

  const loadStudentReport = async (student: StudentItem) => {
    try {
      setSelectedStudent(student);

      const res = await axios.get<StudentReportResponse>(
        `${API_BASE}/students/${student.id}/report-card/`,
        { headers: authHeaders }
      );

      setReport(res.data);
    } catch (err) {
      console.error("Error cargando boletín del estudiante", err);
    }
  };

  const buildPeriodSlug = (period: string) => {
    return period
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleGeneratePdf = async () => {
    if (!report || !token) return;

    try {
      setDownloadingPdf(true);

      const res = await axios.get(
        `${API_BASE}/students/${report.estudiante.id}/report-card/pdf/?periodo=${encodeURIComponent(selectedPeriod)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const periodSlug = buildPeriodSlug(selectedPeriod);
      const studentSlug = report.estudiante.nombre.replace(/\s+/g, "_");
      link.download = `boletin_${studentSlug}_${periodSlug}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF", err);
      alert("No se pudo generar el PDF del boletín.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleGenerateCourseZip = async () => {
    if (!selectedCourse || !token) return;

    try {
      setDownloadingZip(true);

      const res = await axios.get(
        `${API_BASE}/courses/${selectedCourse.id}/report-cards/zip/?periodo=${encodeURIComponent(selectedPeriod)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `boletines_${selectedCourse.nombre.replace(/\s+/g, "_")}_${buildPeriodSlug(selectedPeriod)}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando ZIP de boletines", err);
      alert("No se pudieron generar los boletines masivos.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const formatScore = (value: number | null) => {
    return value !== null && value !== undefined ? value.toFixed(1) : "—";
  };

  if (loading) {
    return <p>Cargando boletines...</p>;
  }

  return (
    <div className="report-cards-container">
      {!selectedCourse && (
        <>
          <header className="report-cards-header">
            <h1>Boletines Académicos</h1>
            <p>Selecciona un curso para consultar los boletines de los estudiantes.</p>
          </header>

          <div className="report-courses-grid">
            {courses.map((course) => (
              <div
                key={course.id}
                className="report-course-card"
                onClick={() => loadStudentsByCourse(course)}
              >
                <h3>{course.nombre}</h3>
                <p>
                  <strong>Docente:</strong> {course.docente}
                </p>
                <span>{course.total_estudiantes} estudiante(s)</span>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedCourse && !selectedStudent && (
        <>
          <header className="report-cards-header">
            <h1>{selectedCourse.nombre}</h1>
            <p>Selecciona un estudiante para ver su boletín o genera todos los del curso.</p>
          </header>

          <div className="report-topbar">
            <button
              className="report-back-btn"
              onClick={() => {
                setSelectedCourse(null);
                setStudents([]);
                setSelectedStudent(null);
                setReport(null);
              }}
            >
              ← Volver a cursos
            </button>

            <div className="report-period-card">
              <div className="report-period-label">Período académico</div>
              <div className="report-period-select-wrap">
                <select
                  className="report-period-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="Primer periodo">Primer periodo</option>
                  <option value="Segundo periodo">Segundo periodo</option>
                  <option value="Tercer periodo">Tercer periodo</option>
                  <option value="Cuarto periodo">Cuarto periodo</option>
                </select>
              </div>
            </div>

            <button
              className="report-pdf-btn"
              onClick={handleGenerateCourseZip}
              disabled={downloadingZip}
            >
              {downloadingZip ? "Generando ZIP..." : "Generar boletines del curso"}
            </button>
          </div>

          <div className="report-students-grid">
            {students.length === 0 ? (
              <div className="report-empty-card">
                No hay estudiantes asignados a este curso.
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="report-student-card"
                  onClick={() => loadStudentReport(student)}
                >
                  <h3>{student.nombre}</h3>
                  <p>{student.email}</p>
                  <span>C.C. {student.cedula}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {selectedCourse && selectedStudent && report && (
        <>
          <header className="report-cards-header">
            <h1>Boletín Académico</h1>
            <p>
              {report.estudiante.nombre} · {report.curso.nombre}
            </p>
          </header>

          <div className="report-topbar">
            <button
              className="report-back-btn"
              onClick={() => {
                setSelectedStudent(null);
                setReport(null);
              }}
            >
              ← Volver a estudiantes
            </button>

            <div className="report-period-card">
              <div className="report-period-label">Período académico</div>
              <div className="report-period-select-wrap">
                <select
                  className="report-period-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="Primer periodo">Primer periodo</option>
                  <option value="Segundo periodo">Segundo periodo</option>
                  <option value="Tercer periodo">Tercer periodo</option>
                  <option value="Cuarto periodo">Cuarto periodo</option>
                </select>
              </div>
            </div>

            <button
              className="report-pdf-btn"
              onClick={handleGeneratePdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? "Generando..." : "Generar PDF"}
            </button>
          </div>

          <div className="report-student-summary">
            <div className="summary-item">
              <span>Estudiante</span>
              <strong>{report.estudiante.nombre}</strong>
            </div>
            <div className="summary-item">
              <span>Cédula</span>
              <strong>{report.estudiante.cedula}</strong>
            </div>
            <div className="summary-item">
              <span>Curso</span>
              <strong>{report.curso.nombre}</strong>
            </div>
            <div className="summary-item">
              <span>Director de curso</span>
              <strong>{report.curso.director_curso || "Sin docente asignado"}</strong>
            </div>
            <div className="summary-item">
              <span>Rector</span>
              <strong>{report.rector_nombre}</strong>
            </div>
            <div className="summary-item highlight">
              <span>Promedio general</span>
              <strong>{formatScore(report.promedio_general)}</strong>
            </div>
          </div>

          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Área</th>
                  <th>Materia</th>
                  <th>1P</th>
                  <th>2P</th>
                  <th>3P</th>
                  <th>4P</th>
                  <th>Def.</th>
                  <th>Desempeño</th>
                </tr>
              </thead>

              <tbody>
                {report.boletin_agrupado.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No hay información académica disponible.</td>
                  </tr>
                ) : (
                  report.boletin_agrupado.map((group) =>
                    group.materias.map((row, index) => (
                      <tr key={row.materia_id}>
                        {index === 0 && (
                          <td
                            className="subject-cell"
                            rowSpan={group.materias.length}
                          >
                            {group.area}
                          </td>
                        )}
                        <td className="subject-cell">{row.materia}</td>
                        <td>{formatScore(row.p1)}</td>
                        <td>{formatScore(row.p2)}</td>
                        <td>{formatScore(row.p3)}</td>
                        <td>{formatScore(row.p4)}</td>
                        <td className="final-score">{formatScore(row.definitiva)}</td>
                        <td>
                          <span className="performance-pill">{row.desempeno}</span>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportCards;