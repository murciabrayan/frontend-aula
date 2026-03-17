import { useState } from "react";
import {
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
          <div className="dashboard-home">
            <div className="dashboard-home__intro">
              <h2>Panel del docente</h2>
              <p>Calendario academico, seguimiento de estudiantes y gestion diaria del curso.</p>
            </div>
            <TeacherCalendar />
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
