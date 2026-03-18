import React, { useEffect, useState } from "react";
import {
  BellRing,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Home,
  Star,
  TriangleAlert,
  User,
} from "lucide-react";

import NotificationBell from "../components/NotificationBell";
import StudentAcademicAlerts from "@/commons/personas/components/StudentAcademicAlerts";
import StudentAssignmentsList from "../components/StudentAssignmentsList";
import StudentAttendance from "@/commons/personas/components/StudentAttendance";
import StudentCalendar from "@/commons/personas/components/StudentCalendar";
import StudentGrades from "@/commons/personas/components/StudentGrades";
import StudentProfile from "../components/StudentProfile";
import DashboardLayout, {
  type DashboardModuleItem,
} from "../components/DashboardLayout";

const studentModules: DashboardModuleItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "tareas", label: "Tareas", icon: ClipboardList },
  { id: "calificaciones", label: "Calificaciones", icon: Star },
  { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
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
                <span className="dashboard-home__badge">Ruta academica</span>
                <h2>Todo tu recorrido escolar visible desde una portada mas clara</h2>
                <p>
                  Consulta tareas, revisa alertas y sigue tu calendario academico con
                  una vista inicial mas moderna y facil de leer.
                </p>
              </div>

              <div className="dashboard-home__hero-stats">
                <article className="dashboard-home__stat-card">
                  <span>Centro del modulo</span>
                  <strong>Calendario</strong>
                </article>
                <article className="dashboard-home__stat-card">
                  <span>Acceso rapido</span>
                  <strong>
                    <BellRing size={18} />
                    Notificaciones
                  </strong>
                </article>
                <article className="dashboard-home__stat-card">
                  <span>Enfoque</span>
                  <strong>
                    <CalendarRange size={18} />
                    Vida academica
                  </strong>
                </article>
              </div>
            </section>

            <section className="dashboard-home__calendar-shell">
              <div className="dashboard-home__section-head">
                <div>
                  <span>Vista general</span>
                  <h3>Calendario del estudiante</h3>
                </div>
                <p>Abre una tarea desde el calendario para ir directo al modulo correspondiente.</p>
              </div>

              <StudentCalendar />
            </section>
          </div>
        )}

        {activeModule === "tareas" && <StudentAssignmentsList />}
        {activeModule === "calificaciones" && <StudentGrades />}
        {activeModule === "asistencia" && <StudentAttendance />}
        {activeModule === "alertas" && <StudentAcademicAlerts />}
        {activeModule === "perfil" && <StudentProfile />}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
