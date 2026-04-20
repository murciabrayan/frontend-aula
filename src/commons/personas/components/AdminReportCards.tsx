import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { useFeedback } from "@/context/FeedbackContext";
import StyledSelect from "@/components/StyledSelect";
import "../styles/adminReportCards.css";

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
  periodo_seleccionado?: number | null;
  boletin: ReportRow[];
  boletin_agrupado: ReportAreaGroup[];
  promedio_general: number | null;
  desempeno_general: string;
}

const AdminReportCards: React.FC = () => {
  const { showToast } = useFeedback();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [report, setReport] = useState<StudentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get<CourseItem[]>("/api/report-cards/courses/");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error cargando cursos para boletines", err);
      showToast({
        type: "error",
        title: "Boletines",
        message: "No se pudieron cargar los cursos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByCourse = async (course: CourseItem) => {
    try {
      setSelectedCourse(course);
      setSelectedStudent(null);
      setReport(null);

      const res = await api.get<CourseStudentsResponse>(
        `/api/report-cards/courses/${course.id}/students/`,
      );

      setStudents(res.data.estudiantes || []);
    } catch (err) {
      console.error("Error cargando estudiantes del curso", err);
      showToast({
        type: "error",
        title: "Boletines",
        message: "No se pudieron cargar los estudiantes del curso.",
      });
    }
  };

  const loadStudentReport = async (student: StudentItem) => {
    if (!selectedPeriod) {
      showToast({
        type: "warning",
        title: "Periodo requerido",
        message: "Selecciona un periodo academico antes de consultar el boletin.",
      });
      return;
    }

    try {
      setSelectedStudent(student);

      const res = await api.get<StudentReportResponse>(
        `/api/report-cards/students/${student.id}/report-card/?periodo=${encodeURIComponent(selectedPeriod)}`,
      );

      setReport(res.data);
    } catch (err) {
      console.error("Error cargando boletin del estudiante", err);
      showToast({
        type: "error",
        title: "Boletín",
        message: "No se pudo cargar el boletin del estudiante.",
      });
    }
  };

  useEffect(() => {
    if (!selectedStudent || !selectedPeriod) return;
    void loadStudentReport(selectedStudent);
  }, [selectedPeriod]);

  const buildPeriodSlug = (period: string) =>
    period
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

  const handleGeneratePdf = async () => {
    if (!report) return;
    if (!selectedPeriod) {
      showToast({
        type: "warning",
        title: "Periodo requerido",
        message: "Selecciona un periodo academico antes de generar el PDF.",
      });
      return;
    }

    try {
      setDownloadingPdf(true);

      const res = await api.get(
        `/api/report-cards/students/${report.estudiante.id}/report-card/pdf/?periodo=${encodeURIComponent(selectedPeriod)}`,
        {
          responseType: "blob",
        },
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
      showToast({
        type: "error",
        title: "PDF",
        message: "No se pudo generar el PDF del boletin.",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleGenerateCourseZip = async () => {
    if (!selectedCourse) return;
    if (!selectedPeriod) {
      showToast({
        type: "warning",
        title: "Periodo requerido",
        message: "Selecciona un periodo academico antes de generar los boletines.",
      });
      return;
    }

    try {
      setDownloadingZip(true);

      const res = await api.get(
        `/api/report-cards/courses/${selectedCourse.id}/report-cards/zip/?periodo=${encodeURIComponent(selectedPeriod)}`,
        {
          responseType: "blob",
        },
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
      showToast({
        type: "error",
        title: "Boletines masivos",
        message: "No se pudieron generar los boletines masivos.",
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  const formatScore = (value: number | null) =>
    value !== null && value !== undefined ? value.toFixed(1) : "--";

  if (loading) {
    return <div className="report-empty-state">Cargando boletines...</div>;
  }

  return (
    <div className="report-cards-container">
      {!selectedCourse ? (
        <>
          <section className="report-hero">
            <div className="report-hero__copy">
              <span className="report-hero__badge">Boletines</span>
              <h1>Gestion institucional de boletines</h1>
              <p>
                Selecciona un curso para consultar el consolidado académico,
                revisar estudiantes y generar boletines individuales o masivos.
              </p>
            </div>
          </section>

          <div className="report-courses-grid">
            {courses.map((course) => (
              <article
                key={course.id}
                className="report-course-card"
                onClick={() => loadStudentsByCourse(course)}
              >
                <span className="report-card__eyebrow">Curso</span>
                <h3>{course.nombre}</h3>
                <p>
                  <strong>Director:</strong> {course.docente}
                </p>
                <span>{course.total_estudiantes} estudiante(s)</span>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {selectedCourse && !selectedStudent ? (
        <>
          <section className="report-hero">
            <div className="report-hero__copy">
              <span className="report-hero__badge">Curso activo</span>
              <h1>{selectedCourse.nombre}</h1>
              <p>
                Selecciona un estudiante para revisar su boletin o genera el
                paquete completo del curso.
              </p>
            </div>

            <div className="report-hero__stats">
              <div className="report-hero__stat">
                <span>Director</span>
                <strong>{selectedCourse.docente}</strong>
              </div>
              <div className="report-hero__stat">
                <span>Estudiantes</span>
                <strong>{selectedCourse.total_estudiantes}</strong>
              </div>
            </div>
          </section>

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
              Volver a cursos
            </button>

            <div className="report-period-card">
              <div className="report-period-label">Período académico</div>
              <div className="report-period-select-wrap">
                <StyledSelect
                  className="report-period-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="">Selecciona un periodo</option>
                  <option value="Primer periodo">Primer periodo</option>
                  <option value="Segundo periodo">Segundo periodo</option>
                  <option value="Tercer periodo">Tercer periodo</option>
                  <option value="Cuarto periodo">Cuarto periodo</option>
                </StyledSelect>
              </div>
            </div>

            <button
              className="report-pdf-btn"
              onClick={handleGenerateCourseZip}
              disabled={downloadingZip || !selectedPeriod}
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
                <article
                  key={student.id}
                  className="report-student-card"
                  onClick={() => loadStudentReport(student)}
                >
                  <span className="report-card__eyebrow">Estudiante</span>
                  <h3>{student.nombre}</h3>
                  <p>{student.email}</p>
                  <span>C.C. {student.cedula}</span>
                </article>
              ))
            )}
          </div>
        </>
      ) : null}

      {selectedCourse && selectedStudent && report ? (
        <>
          <section className="report-hero">
            <div className="report-hero__copy">
              <span className="report-hero__badge">Boletín académico</span>
              <h1>{report.estudiante.nombre}</h1>
              <p>
                Consulta el rendimiento consolidado del estudiante y genera el PDF
                institucional del periodo.
              </p>
            </div>

            <div className="report-hero__stats">
              <div className="report-hero__stat">
                <span>Curso</span>
                <strong>{report.curso.nombre}</strong>
              </div>
              <div className="report-hero__stat">
                <span>Promedio</span>
                <strong>{formatScore(report.promedio_general)}</strong>
              </div>
            </div>
          </section>

          <div className="report-topbar">
            <button
              className="report-back-btn"
              onClick={() => {
                setSelectedStudent(null);
                setReport(null);
              }}
            >
              Volver a estudiantes
            </button>

            <div className="report-period-card">
              <div className="report-period-label">Período académico</div>
              <div className="report-period-select-wrap">
                <StyledSelect
                  className="report-period-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="">Selecciona un periodo</option>
                  <option value="Primer periodo">Primer periodo</option>
                  <option value="Segundo periodo">Segundo periodo</option>
                  <option value="Tercer periodo">Tercer periodo</option>
                  <option value="Cuarto periodo">Cuarto periodo</option>
                </StyledSelect>
              </div>
            </div>

            <button
              className="report-pdf-btn"
              onClick={handleGeneratePdf}
              disabled={downloadingPdf || !selectedPeriod}
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
              <span>Cedula</span>
              <strong>{report.estudiante.cedula}</strong>
            </div>
            <div className="summary-item">
              <span>Curso</span>
              <strong>{report.curso.nombre}</strong>
            </div>
            <div className="summary-item">
              <span>Director de curso</span>
              <strong>{report.curso.director_curso || "Sin director asignado"}</strong>
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
                  <th>Area</th>
                  <th>Materia</th>
                  <th>1P</th>
                  <th>2P</th>
                  <th>3P</th>
                  <th>4P</th>
                  <th>Def.</th>
                  <th>Desempeno</th>
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
                        {index === 0 ? (
                          <td className="subject-cell" rowSpan={group.materias.length}>
                            {group.area}
                          </td>
                        ) : null}
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
                    )),
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminReportCards;
