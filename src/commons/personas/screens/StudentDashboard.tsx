import React, { useState, useEffect } from "react";
import {
  Home,
  ClipboardList,
  Star,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardCheck,
  TriangleAlert,
} from "lucide-react";

import StudentProfile from "../components/StudentProfile";
import StudentAssignmentsList from "../components/StudentAssignmentsList";
import NotificationBell from "../components/NotificationBell";
import StudentCalendar from "@/commons/personas/components/StudentCalendar";
import StudentGrades from "@/commons/personas/components/StudentGrades";
import StudentAttendance from "@/commons/personas/components/StudentAttendance";
import StudentAcademicAlerts from "@/commons/personas/components/StudentAcademicAlerts";

import "@/commons/personas/styles/studentDashboard.css";

const StudentDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>("inicio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const goToTasksHandler = () => {
      setActiveModule("tareas");
    };

    window.addEventListener("goToTasks", goToTasksHandler);

    return () => {
      window.removeEventListener("goToTasks", goToTasksHandler);
    };
  }, []);

  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="student-dashboard">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <h2 className="sidebar-title">
            {!sidebarCollapsed && "Estudiante"}
          </h2>

          <nav>
            <a
              className={activeModule === "inicio" ? "active" : ""}
              onClick={() => setActiveModule("inicio")}
            >
              <Home className="icon" />
              {!sidebarCollapsed && <span>Inicio</span>}
            </a>

            <a
              className={activeModule === "tareas" ? "active" : ""}
              onClick={() => setActiveModule("tareas")}
            >
              <ClipboardList className="icon" />
              {!sidebarCollapsed && <span>Tareas</span>}
            </a>

            <a
              className={activeModule === "calificaciones" ? "active" : ""}
              onClick={() => setActiveModule("calificaciones")}
            >
              <Star className="icon" />
              {!sidebarCollapsed && <span>Calificaciones</span>}
            </a>

            <a
              className={activeModule === "asistencia" ? "active" : ""}
              onClick={() => setActiveModule("asistencia")}
            >
              <ClipboardCheck className="icon" />
              {!sidebarCollapsed && <span>Asistencia</span>}
            </a>

            <a
              className={activeModule === "alertas" ? "active" : ""}
              onClick={() => setActiveModule("alertas")}
            >
              <TriangleAlert className="icon" />
              {!sidebarCollapsed && <span>Alertas</span>}
            </a>

            <a
              className={activeModule === "perfil" ? "active" : ""}
              onClick={() => setActiveModule("perfil")}
            >
              <User className="icon" />
              {!sidebarCollapsed && <span>Perfil</span>}
            </a>
          </nav>
        </div>

        <button className="student-logout-btn" onClick={handleLogout}>
          <LogOut className="icon" />
          {!sidebarCollapsed && <span>Cerrar Sesión</span>}
        </button>

        <button className="student-collapse-btn" onClick={toggleSidebar}>
          {sidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </aside>

      <main className="main-content">
        <div className="dashboard-topbar">
          <NotificationBell setActiveModule={setActiveModule} />
        </div>

        <div className="main-inner">
          {activeModule === "inicio" && (
            <>
              <h1>Panel del Estudiante</h1>
              <p>Próximas actividades y tareas</p>
              <StudentCalendar />
            </>
          )}

          {activeModule === "tareas" && <StudentAssignmentsList />}
          {activeModule === "calificaciones" && <StudentGrades />}
          {activeModule === "asistencia" && <StudentAttendance />}
          {activeModule === "alertas" && <StudentAcademicAlerts />}
          {activeModule === "perfil" && <StudentProfile />}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;