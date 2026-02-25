import React, { useState } from "react";
import StudentProfile from "../components/StudentProfile";
import StudentAssignmentsList from "../components/StudentAssignmentsList";
import NotificationBell from "../components/NotificationBell";
import "@/commons/personas/styles/studentDashboard.css";

const StudentDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>("inicio");

  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <div className="student-dashboard">
      {/* 🔵 SIDEBAR */}
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

      {/* 🟡 CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* 🔔 TOPBAR */}
        <div className="dashboard-topbar">
          <NotificationBell setActiveModule={setActiveModule} />
        </div>

        {/* 📦 CONTENIDO INTERNO */}
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