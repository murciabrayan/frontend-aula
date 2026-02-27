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

import TeacherProfile from "../components/TeacherProfile";
import AssignmentList from "../components/AssignmentList";
import "@/commons/personas/styles/teacherDashboard.css";

const TeacherDashboard = () => {
  const [activeModule, setActiveModule] = useState("inicio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>

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
            className={activeModule === "clases" ? "active" : ""}
            onClick={() => setActiveModule("clases")}
          >
            <BookOpen className="icon" />
            {!sidebarCollapsed && <span>Mis Clases</span>}
          </a>

          <a
            className={activeModule === "notas" ? "active" : ""}
            onClick={() => setActiveModule("notas")}
          >
            <Star className="icon" />
            {!sidebarCollapsed && <span>Registrar Notas</span>}
          </a>

          <a
            className={activeModule === "tareas" ? "active" : ""}
            onClick={() => setActiveModule("tareas")}
          >
            <ClipboardList className="icon" />
            {!sidebarCollapsed && <span>Gestión de Tareas</span>}
          </a>

          <a
            className={activeModule === "perfil" ? "active" : ""}
            onClick={() => setActiveModule("perfil")}
          >
            <User className="icon" />
            {!sidebarCollapsed && <span>Perfil</span>}
          </a>

        </nav>

        <button className="teacher-logout-btn" onClick={handleLogout}>
          <LogOut className="icon" />
          {!sidebarCollapsed && <span>Cerrar Sesión</span>}
        </button>

        <button className="teacher-collapse-btn" onClick={toggleSidebar}>
          {sidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>

      </aside>

      <main className="dashboard-main">
        {activeModule === "inicio" && (
          <>
            <header className="dashboard-header">
              <h1>Panel del Docente</h1>
              <p>Gestione sus clases, tareas y calificaciones</p>
            </header>

            <section className="dashboard-content">
              <div className="card">
                <h3>Clases de hoy</h3>
                <p>No hay clases activas actualmente 📚</p>
              </div>

              <div className="card">
                <h3>Estudiantes pendientes</h3>
                <p>No hay tareas pendientes por revisar.</p>
              </div>
            </section>
          </>
        )}

        {activeModule === "tareas" && <AssignmentList />}
        {activeModule === "perfil" && <TeacherProfile />}
      </main>
    </div>
  );
};

export default TeacherDashboard;