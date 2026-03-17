import React from "react";
import AdminAttendance from "../../../components/admin/AdminAttendance";
import CourseAssign from "../../../components/admin/CourseAssign";
import CourseList from "../../../components/admin/CourseList";
import UserList from "../../../components/admin/UserList";
import sideImage from "@/assets/2.png";
import AdminAcademicAlerts from "../components/AdminAcademicAlerts";
import AdminProfile from "../components/AdminProfile";
import AdminReportCards from "../components/AdminReportCards";

interface AdminContentProps {
  activeModule: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ activeModule }) => {
  return (
    <div className="admin-content">
      {activeModule === "inicio" && (
        <div className="dashboard-home">
          <div className="dashboard-home__hero">
            <h2>Bienvenido al panel de administracion</h2>
            <p>
              Gestiona usuarios, cursos, asistencia, boletines y alertas desde una
              experiencia unificada y mas consistente.
            </p>
          </div>

          <div
            className="dashboard-home__media"
            style={{ backgroundImage: `url(${sideImage})` }}
            aria-hidden="true"
          />
        </div>
      )}

      {activeModule === "usuarios" && <UserList />}
      {activeModule === "cursos" && <CourseList />}
      {activeModule === "asignarCursos" && <CourseAssign />}
      {activeModule === "boletines" && <AdminReportCards />}
      {activeModule === "asistencia" && <AdminAttendance />}
      {activeModule === "alertasAcademicas" && <AdminAcademicAlerts />}
      {activeModule === "perfil" && <AdminProfile />}

      {activeModule === "configuracion" && (
        <div>
          <h2>Configuracion del sistema</h2>
          <p>Proximamente...</p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
