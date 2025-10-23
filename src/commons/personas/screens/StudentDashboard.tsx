import React from "react";
import "@/commons/personas/styles/studentDashboard.css";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/commons/Auth/services/auth.service";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="student-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <h2>Estudiante</h2>
          <nav>
            <a href="#" className="active">Inicio</a>
            <a href="#">Mis Materias</a>
            <a href="#">Calificaciones</a>
            <a href="#">Perfil</a>
          </nav>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <h1>Panel del Estudiante</h1>
        <p>Bienvenido al sistema académico</p>

        <div className="cards">
          <div className="card">
            <h3>📚 Próximas clases</h3>
            <p>No hay clases programadas para hoy 🎓</p>
          </div>

          <div className="card">
            <h3>🧮 Calificaciones recientes</h3>
            <p>Aún no hay calificaciones registradas.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
