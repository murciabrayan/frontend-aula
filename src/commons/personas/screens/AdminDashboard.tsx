import React, { useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Home,
  TriangleAlert,
  UserCog,
  Users,
} from "lucide-react";
import AdminContent from "../components/AdminContent";
import DashboardLayout, {
  type DashboardModuleItem,
} from "../components/DashboardLayout";
import "@/commons/personas/styles/adminDashboard.css";

const adminModules: DashboardModuleItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "usuarios", label: "Gestionar usuarios", icon: Users },
  { id: "cursos", label: "Gestionar cursos", icon: BookOpen },
  { id: "boletines", label: "Boletines", icon: FileText },
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
    >
      <AdminContent activeModule={activeModule} />
    </DashboardLayout>
  );
};

export default AdminDashboard;
