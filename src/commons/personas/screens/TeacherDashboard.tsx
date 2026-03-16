import { useState } from "react";
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

import TeacherProfile from "../components/TeacherProfile";
import AssignmentList from "../components/AssignmentList";
import TeacherCalendar from "../components/TeacherCalendar";
import TeacherGrades from "../components/TeacherGrades";
import TeacherAttendance from "../components/TeacherAttendance";
import TeacherAcademicAlerts from "../components/TeacherAcademicAlerts";

import "@/commons/personas/styles/teacherDashboard.css";

const TeacherDashboard = () => {
  const [activeModule, setActiveModule] = useState("inicio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <div className={`dashboard-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-header">
            {!sidebarCollapsed && <h2>Docente</h2>}
          </div>

          <nav className="sidebar-menu">
            <a
              className={activeModule === "inicio" ? "active" : ""}
              onClick={() => setActiveModule("inicio")}
            >
              <Home className="icon" />
              {!sidebarCollapsed && <span>Inicio</span>}
            </a>

            <a
              className={activeModule === "notas" ? "active" : ""}
              onClick={() => setActiveModule("notas")}
            >
              <Star className="icon" />
              {!sidebarCollapsed && <span>Notas</span>}
            </a>

            <a
              className={activeModule === "tareas" ? "active" : ""}
              onClick={() => setActiveModule("tareas")}
            >
              <ClipboardList className="icon" />
              {!sidebarCollapsed && <span>Gestión de Tareas</span>}
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

        <div className="sidebar-bottom">
          <button className="teacher-logout-btn" onClick={handleLogout}>
            <LogOut className="icon" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>

        <button
          className="teacher-collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </aside>

      <main className="dashboard-main">
        {activeModule === "inicio" && (
          <>
            <header className="dashboard-header">
              <h1>Panel del Docente</h1>
              <p>Calendario académico y actividades</p>
            </header>
            <TeacherCalendar />
          </>
        )}

        {activeModule === "notas" && <TeacherGrades />}
        {activeModule === "tareas" && <AssignmentList />}
        {activeModule === "asistencia" && <TeacherAttendance />}
        {activeModule === "alertas" && <TeacherAcademicAlerts />}
        {activeModule === "perfil" && <TeacherProfile />}
      </main>
    </div>
  );
};

export default TeacherDashboard;