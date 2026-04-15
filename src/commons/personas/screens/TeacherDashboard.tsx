import { useState } from "react";
import { ClipboardCheck, ClipboardList, Home, Star, TriangleAlert, User } from "lucide-react";

import AssignmentList from "../components/AssignmentList";
import NotificationBell from "../components/NotificationBell";
import TeacherAcademicAlerts from "../components/TeacherAcademicAlerts";
import TeacherAttendance from "../components/TeacherAttendance";
import TeacherCalendar from "../components/TeacherCalendar";
import TeacherGrades from "../components/TeacherGrades";
import TeacherProfile from "../components/TeacherProfile";
import DashboardLayout, {
  type DashboardModuleItem,
} from "../components/DashboardLayout";

// MANPROG_CAPTURA_FRONT_TEACHER_DASHBOARD_INICIO: módulos principales del docente y calendario inicial.
const teacherModules: DashboardModuleItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "notas", label: "Notas", icon: Star },
  { id: "tareas", label: "Gestión de tareas", icon: ClipboardList },
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
      topbarContent={
        <NotificationBell
          setActiveModule={setActiveModule}
          mode="alerts"
          alertModuleId="alertas"
        />
      }
    >
      <div>
        {activeModule === "inicio" && (
          <div className="dashboard-home dashboard-home--teacher">
            <section className="dashboard-home__hero-panel">
              <div className="dashboard-home__hero-copy">
                <span className="dashboard-home__badge">Agenda docente</span>
                <h2>Calendario docente</h2>
                <p>
                  Visualiza el calendario académico, registra eventos importantes y
                  mantente al día con la dinámica del grupo desde una portada más clara.
                </p>
              </div>
            </section>

            <section className="dashboard-home__calendar-shell">
              <div className="dashboard-home__section-head">
                <div>
                  <span>Calendario académico del docente</span>
                </div>
                <p>Haz clic en el día que quieras para registrar un evento o una actividad del curso.</p>
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
// MANPROG_CAPTURA_FRONT_TEACHER_DASHBOARD_FIN
