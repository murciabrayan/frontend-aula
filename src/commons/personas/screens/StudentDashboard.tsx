// src/commons/personas/screens/StudentDashboard.tsx
import React from "react";
import "@/commons/personas/styles/studentDashboard.css";
import { logoutUser } from "@/commons/Auth/services/auth.service";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {

      const navigate = useNavigate();
    
 const handleLogout = () => {
     logoutUser();
     navigate("/");
   };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Estudiante</h2>
        </div>
        <ul className="sidebar-menu">
          <li>Inicio</li>
          <li>Mis Materias</li>
          <li>Calificaciones</li>
          <li>Perfil</li>
        </ul>
<button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Panel del Estudiante</h1>
          <p>Bienvenido al sistema académico</p>
        </header>

        <section className="dashboard-content">
          <div className="card">
            <h3>Próximas clases</h3>
            <p>No hay clases programadas para hoy 🎓</p>
          </div>
          <div className="card">
            <h3>Calificaciones recientes</h3>
            <p>Aún no hay calificaciones registradas.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
