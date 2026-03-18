import { useState } from "react";
import {
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Home,
  Star,
  TriangleAlert,
  User,
} from "lucide-react";

import AssignmentList from "../components/AssignmentList";
import TeacherAcademicAlerts from "../components/TeacherAcademicAlerts";
import TeacherAttendance from "../components/TeacherAttendance";
import TeacherCalendar from "../components/TeacherCalendar";
import TeacherGrades from "../components/TeacherGrades";
import TeacherProfile from "../components/TeacherProfile";
import DashboardLayout, {
  type DashboardModuleItem,
} from "../components/DashboardLayout";

const teacherModules: DashboardModuleItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "notas", label: "Notas", icon: Star },
  { id: "tareas", label: "Gestion de tareas", icon: ClipboardList },
  { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
  { id: "alertas", label: "Alertas", icon: TriangleAlert },
  { id: "perfil", label: "Perfil", icon: User },
];

const TeacherDashboard = () => {
  const [activeModule, setActiveModule] = useState("inicio");

  return (
    <DashboardLayout
      roleLabel="Docente"
      modules={teacherModules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      <div>
        {activeModule === "inicio" && (
          <div className="dashboard-home dashboard-home--teacher">
            <section className="dashboard-home__hero-panel">
              <div className="dashboard-home__hero-copy">
                <span className="dashboard-home__badge">Agenda docente</span>
                <h2>Planifica clases, eventos y seguimiento del curso en un solo lugar</h2>
                <p>
                  Visualiza el calendario academico, registra eventos importantes y
                  mantente al dia con la dinamica del grupo desde una portada mas clara.
                </p>
              </div>

              <div className="dashboard-home__hero-stats">
                <article className="dashboard-home__stat-card">
                  <span>Vista central</span>
                  <strong>Calendario</strong>
                </article>
                <article className="dashboard-home__stat-card">
                  <span>Accion rapida</span>
                  <strong>Crear eventos</strong>
                </article>
                <article className="dashboard-home__stat-card">
                  <span>Enfoque</span>
                  <strong>
                    <CalendarRange size={18} />
                    Curso activo
                  </strong>
                </article>
              </div>
            </section>

            <section className="dashboard-home__calendar-shell">
              <div className="dashboard-home__section-head">
                <div>
                  <span>Organizacion semanal</span>
                  <h3>Calendario academico del docente</h3>
                </div>
                <p>Haz clic en un dia para registrar un nuevo evento institucional.</p>
              </div>

              <TeacherCalendar />
            </section>
          </div>
        )}

        {activeModule === "notas" && <TeacherGrades />}
        {activeModule === "tareas" && <AssignmentList />}
        {activeModule === "asistencia" && <TeacherAttendance />}
        {activeModule === "alertas" && <TeacherAcademicAlerts />}
        {activeModule === "perfil" && <TeacherProfile />}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
