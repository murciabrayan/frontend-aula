import React, { useEffect, useState } from "react";
import {
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
          <div className="dashboard-home">
            <div className="dashboard-home__intro">
              <h2>Panel del estudiante</h2>
              <p>Consulta tus tareas, revisa alertas y sigue de cerca tu calendario academico.</p>
            </div>
            <StudentCalendar />
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
