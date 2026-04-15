import React, { useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Home,
  ScrollText,
  TriangleAlert,
  UserCog,
  Users,
} from "lucide-react";
import AdminContent from "../components/AdminContent";
import DashboardLayout, {
  type DashboardModuleItem,
} from "../components/DashboardLayout";
import NotificationBell from "../components/NotificationBell";
import "@/commons/personas/styles/adminDashboard.css";

// MANPROG_CAPTURA_FRONT_ADMIN_DASHBOARD_INICIO: navegación principal del rol administrador.
const adminModules: DashboardModuleItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "usuarios", label: "Gestionar usuarios", icon: Users },
  { id: "cursos", label: "Cursos y equipo", icon: BookOpen },
  { id: "estructuraCursos", label: "Estructura académica", icon: FileText },
  { id: "boletines", label: "Boletines", icon: FileText },
  { id: "permisos", label: "Permisos", icon: ScrollText },
  { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
  { id: "alertasAcademicas", label: "Alertas tempranas", icon: TriangleAlert },
  { id: "perfil", label: "Mi perfil", icon: UserCog },
];

const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState("inicio");

  return (
    <DashboardLayout
      roleLabel="Administrador"
      modules={adminModules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      topbarContent={
        <NotificationBell
          setActiveModule={setActiveModule}
          mode="alerts"
          alertModuleId="alertasAcademicas"
        />
      }
    >
      <AdminContent activeModule={activeModule} />
    </DashboardLayout>
  );
};

export default AdminDashboard;
// MANPROG_CAPTURA_FRONT_ADMIN_DASHBOARD_FIN
