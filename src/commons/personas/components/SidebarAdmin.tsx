import React from "react";
import { LogOut, Users, Home, Settings } from "lucide-react";

interface SidebarProps {
  setActiveModule: (module: string) => void;
}

const SidebarAdmin: React.FC<SidebarProps> = ({ setActiveModule }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
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
        <li onClick={() => setActiveModule("docentes")}>
          <Users className="icon" /> Gestionar Docentes
        </li>
        <li onClick={() => setActiveModule("estudiantes")}>
          <Users className="icon" /> Gestionar Estudiantes
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
