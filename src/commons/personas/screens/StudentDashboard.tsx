import React, { useEffect, useState } from "react";
import { ClipboardCheck, ClipboardList, Home, ScrollText, Star, TriangleAlert, User } from "lucide-react";

import NotificationBell from "../components/NotificationBell";
import StudentAcademicAlerts from "@/commons/personas/components/StudentAcademicAlerts";
import StudentAssignmentsList from "../components/StudentAssignmentsList";
import StudentAttendance from "@/commons/personas/components/StudentAttendance";
import StudentCalendar from "@/commons/personas/components/StudentCalendar";
import StudentGrades from "@/commons/personas/components/StudentGrades";
import StudentProfile from "../components/StudentProfile";
import StudentPermissionLetters from "../components/StudentPermissionLetters";
import DashboardLayout, {
  type DashboardModuleItem,
} from "../components/DashboardLayout";

// MANPROG_CAPTURA_FRONT_STUDENT_DASHBOARD_INICIO: módulos del estudiante y pantalla de inicio con calendario.
const studentModules: DashboardModuleItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "tareas", label: "Tareas", icon: ClipboardList },
  { id: "calificaciones", label: "Calificaciones", icon: Star },
  { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
  { id: "permisos", label: "Permisos", icon: ScrollText },
  { id: "alertas", label: "Alertas", icon: TriangleAlert },
  { id: "perfil", label: "Perfil", icon: User },
];

const StudentDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>("inicio");

  useEffect(() => {
    const goToTasksHandler = () => {
      setActiveModule("tareas");
    };

    window.addEventListener("goToTasks", goToTasksHandler);

    return () => {
      window.removeEventListener("goToTasks", goToTasksHandler);
    };
  }, []);

  return (
    <DashboardLayout
      roleLabel="Estudiante"
      modules={studentModules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      topbarContent={<NotificationBell setActiveModule={setActiveModule} />}
    >
      <div>
        {activeModule === "inicio" && (
          <div className="dashboard-home dashboard-home--student">
            <section className="dashboard-home__hero-panel">
              <div className="dashboard-home__hero-copy">
                <span className="dashboard-home__badge">Ruta académica</span>
                <h2>Calendario académico</h2>
                <p>
                  Consulta tareas, revisa alertas y sigue tu calendario académico con
                  una vista inicial más moderna y fácil de leer.
                </p>
              </div>
            </section>

            <section className="dashboard-home__calendar-shell">
              <div className="dashboard-home__section-head">
                <div>
                  <span>Calendario</span>
                  <h3>Calendario del estudiante</h3>
                </div>
                <p>Abre una tarea desde el calendario para ir directo al módulo correspondiente.</p>
              </div>

              <StudentCalendar />
            </section>
          </div>
        )}

        {activeModule === "tareas" && <StudentAssignmentsList />}
        {activeModule === "calificaciones" && <StudentGrades />}
        {activeModule === "asistencia" && <StudentAttendance />}
        {activeModule === "permisos" && <StudentPermissionLetters />}
        {activeModule === "alertas" && <StudentAcademicAlerts />}
        {activeModule === "perfil" && <StudentProfile />}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
// MANPROG_CAPTURA_FRONT_STUDENT_DASHBOARD_FIN
