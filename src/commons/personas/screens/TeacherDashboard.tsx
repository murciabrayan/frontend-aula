import React, { useState } from "react";
import TeacherProfile from "../components/TeacherProfile";
import "@/commons/personas/styles/teacherDashboard.css";

const TeacherDashboard = () => {
  const [activeModule, setActiveModule] = useState("inicio");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Docente</h2>
        </div>
        <ul className="sidebar-menu">
          <li
            className={activeModule === "inicio" ? "active" : ""}
            onClick={() => setActiveModule("inicio")}
          >
            Inicio
          </li>
          <li
            className={activeModule === "clases" ? "active" : ""}
            onClick={() => setActiveModule("clases")}
          >
            Mis Clases
          </li>
          <li
            className={activeModule === "notas" ? "active" : ""}
            onClick={() => setActiveModule("notas")}
          >
            Registrar Notas
          </li>
          <li
            className={activeModule === "perfil" ? "active" : ""}
            onClick={() => setActiveModule("perfil")}
          >
            Perfil
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="dashboard-main">
        {activeModule === "inicio" && (
          <>
            <header className="dashboard-header">
              <h1>Panel del Docente</h1>
              <p>Gestione sus clases y calificaciones</p>
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

        {activeModule === "perfil" && <TeacherProfile />}
      </main>
    </div>
  );
};

export default TeacherDashboard;
