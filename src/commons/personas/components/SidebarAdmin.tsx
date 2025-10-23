import React from "react";
import { LogOut, Users, Home, Settings, BookOpen } from "lucide-react";

interface SidebarProps {
  setActiveModule: (module: string) => void;
}

const SidebarAdmin: React.FC<SidebarProps> = ({ setActiveModule }) => {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Panel Admin</h2>
      </div>

      <ul className="sidebar-menu">
        <li onClick={() => setActiveModule("inicio")}>
          <Home className="icon" /> Inicio
        </li>

        <li onClick={() => setActiveModule("usuarios")}>
          <Users className="icon" /> Gestionar Usuarios
        </li>

        <li onClick={() => setActiveModule("cursos")}>
          <BookOpen className="icon" /> Gestionar Cursos
        </li>

        <li onClick={() => setActiveModule("asignarCursos")}>
          <BookOpen className="icon" /> Asignar Cursos
        </li>

        <li onClick={() => setActiveModule("configuracion")}>
          <Settings className="icon" /> Configuración
        </li>

        <li className="logout" onClick={handleLogout}>
          <LogOut className="icon" /> Cerrar Sesión
        </li>
      </ul>
    </aside>
  );
};

export default SidebarAdmin;
