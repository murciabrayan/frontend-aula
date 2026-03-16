import React, { useState } from "react";
import {
  LogOut,
  Users,
  Home,
  BookOpen,
  UserCog,
  ChevronLeft,
  FileText,
  TriangleAlert,
  ClipboardCheck,
} from "lucide-react";

interface SidebarProps {
  setActiveModule: (module: string) => void;
}

const SidebarAdmin: React.FC<SidebarProps> = ({ setActiveModule }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? "" : "Panel Admin"}</h2>
      </div>

      <div className="sidebar-divider">
        <button
          className={`collapse-btn ${collapsed ? "rotated" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <ul className="sidebar-menu">
        <li onClick={() => setActiveModule("inicio")}>
          <Home className="icon" />
          <span>Inicio</span>
        </li>

        <li onClick={() => setActiveModule("usuarios")}>
          <Users className="icon" />
          <span>Gestionar Usuarios</span>
        </li>

        <li onClick={() => setActiveModule("cursos")}>
          <BookOpen className="icon" />
          <span>Gestionar Cursos</span>
        </li>

        <li onClick={() => setActiveModule("asignarCursos")}>
          <BookOpen className="icon" />
          <span>Asignar Cursos</span>
        </li>

        <li onClick={() => setActiveModule("boletines")}>
          <FileText className="icon" />
          <span>Boletines</span>
        </li>

        <li onClick={() => setActiveModule("asistencia")}>
          <ClipboardCheck className="icon" />
          <span>Asistencia</span>
        </li>

        <li onClick={() => setActiveModule("alertasAcademicas")}>
          <TriangleAlert className="icon" />
          <span>Alertas Tempranas</span>
        </li>

        <li onClick={() => setActiveModule("perfil")}>
          <UserCog className="icon" />
          <span>Mi Perfil</span>
        </li>

        <li className="logout" onClick={handleLogout}>
          <LogOut className="icon" />
          <span>Cerrar Sesión</span>
        </li>
      </ul>
    </aside>
  );
};

export default SidebarAdmin;