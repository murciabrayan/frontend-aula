import React, { useState } from "react";
import {
  Home,
  BookOpen,
  ClipboardList,
  Star,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

import StudentProfile from "../components/StudentProfile";
import StudentAssignmentsList from "../components/StudentAssignmentsList";
import NotificationBell from "../components/NotificationBell";
import "@/commons/personas/styles/studentDashboard.css";

const StudentDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>("inicio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
              className={activeModule === "materias" ? "active" : ""}
              onClick={() => setActiveModule("materias")}
            >
              <BookOpen className="icon" />
              {!sidebarCollapsed && <span>Mis Materias</span>}
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
              className={activeModule === "perfil" ? "active" : ""}
              onClick={() => setActiveModule("perfil")}
            >
              <User className="icon" />
              {!sidebarCollapsed && <span>Perfil</span>}
            </a>
          </nav>
        </div>

        {/* 🔹 LOGOUT RENOMBRADO */}
        <button className="student-logout-btn" onClick={handleLogout}>
          <LogOut className="icon" />
          {!sidebarCollapsed && <span>Cerrar Sesión</span>}
        </button>

        {/* 🔹 COLLAPSE RENOMBRADO */}
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
              <p>Bienvenido al sistema académico</p>
            </>
          )}

          {activeModule === "tareas" && <StudentAssignmentsList />}
          {activeModule === "perfil" && <StudentProfile />}

          {activeModule === "calificaciones" && (
            <>
              <h1>Calificaciones</h1>
              <p>Aquí podrás ver tus calificaciones.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;