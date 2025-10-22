// src/commons/personas/screens/TeacherDashboard.tsx
import React from "react";
import "@/commons/personas/styles/teacherDashboard.css";

const TeacherDashboard = () => {
      const handleLogout = () => {
    localStorage.removeItem("token"); // Elimina el token
    window.location.href = "/"; // Redirige al login
  };
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Docente</h2>
        </div>
        <ul className="sidebar-menu">
          <li>Inicio</li>
          <li>Mis Clases</li>
          <li>Registrar Notas</li>
          <li>Perfil</li>
        </ul>
         <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
        
      </aside>

      <main className="dashboard-main">
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
      </main>
    </div>
  );
};

export default TeacherDashboard;
