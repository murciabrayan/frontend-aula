import React, { useState } from "react";
import StudentProfile from "../components/StudentProfile";
import StudentAssignmentsList from "../components/StudentAssignmentsList";
import "@/commons/personas/styles/studentDashboard.css";

const StudentDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState("inicio");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <div className="student-dashboard">
      <aside className="sidebar">
        <div>
          <h2>Estudiante</h2>
          <nav>
            <a
              className={activeModule === "inicio" ? "active" : ""}
              onClick={() => setActiveModule("inicio")}
            >
              Inicio
            </a>
            <a
              className={activeModule === "materias" ? "active" : ""}
              onClick={() => setActiveModule("materias")}
            >
              Mis Materias
            </a>
            <a
              className={activeModule === "tareas" ? "active" : ""}
              onClick={() => setActiveModule("tareas")}
            >
              Tareas
            </a>
            <a
              className={activeModule === "calificaciones" ? "active" : ""}
              onClick={() => setActiveModule("calificaciones")}
            >
              Calificaciones
            </a>
            <a
              className={activeModule === "perfil" ? "active" : ""}
              onClick={() => setActiveModule("perfil")}
            >
              Perfil
            </a>
          </nav>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      <main className="main-content">
        {activeModule === "inicio" && (
          <>
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
          </>
        )}

        {activeModule === "tareas" && <StudentAssignmentsList />}

        {activeModule === "perfil" && <StudentProfile />}
      </main>
    </div>
  );
};

export default StudentDashboard;
