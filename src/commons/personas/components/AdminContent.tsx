import React from "react";
import { ArrowUpRight, LayoutTemplate } from "lucide-react";
import AdminAttendance from "../../../components/admin/AdminAttendance";
import CourseRosterManagement from "../../../components/admin/CourseRosterManagement";
import CourseStructureManagement from "../../../components/admin/CourseStructureManagement";
import UserList from "../../../components/admin/UserList";
import sideImage from "@/assets/1.jpg";
import AdminAcademicAlerts from "../components/AdminAcademicAlerts";
import AdminPermissionLetters from "../components/AdminPermissionLetters";
import AdminProfile from "../components/AdminProfile";
import AdminReportCards from "../components/AdminReportCards";
import { enableLandingAdminAccess } from "@/commons/Auth/services/auth.service";

interface AdminContentProps {
  activeModule: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ activeModule }) => {
  const handleOpenLandingEditor = () => {
    enableLandingAdminAccess();
    window.open("/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="admin-content">
      {activeModule === "inicio" && (
        <div className="dashboard-home">
          <section className="dashboard-home__admin-showcase">
            <div className="dashboard-home__admin-showcase-copy">
              <section className="dashboard-home__admin-hero">
                <div className="dashboard-home__admin-copy">
                  <span className="dashboard-home__badge">Panel central</span>
                  <h2>Administra el colegio con una vista clara, moderna y preparada para el día a día</h2>
                  <p>
                    Gestiona usuarios, cursos, estructura académica, asistencia,
                    boletines y alertas desde un punto de control más visual y mejor
                    organizado.
                  </p>

                  <div className="dashboard-home__admin-pills">
                    <span>Usuarios</span>
                    <span>Cursos</span>
                    <span>Boletines</span>
                    <span>Alertas</span>
                  </div>

                  <div className="dashboard-home__admin-actions">
                    <button
                      type="button"
                      className="dashboard-home__admin-link"
                      onClick={handleOpenLandingEditor}
                    >
                      <LayoutTemplate size={18} />
                      <span>Abrir landing institucional</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="dashboard-home__admin-grid">
                <article className="dashboard-home__admin-card">
                  <span>Gestión unificada</span>
                  <strong>Todo el ecosistema escolar en un mismo panel</strong>
                </article>
                <article className="dashboard-home__admin-card">
                  <span>Operación diaria</span>
                  <strong>Acceso rápido a los módulos más importantes</strong>
                </article>
                <article className="dashboard-home__admin-card">
                  <span>Experiencia</span>
                  <strong>Una portada institucional más sólida para el rol administrativo</strong>
                </article>
              </section>
            </div>

            <div
              className="dashboard-home__admin-reference-media"
              style={{ backgroundImage: `url(${sideImage})` }}
              aria-hidden="true"
            />
          </section>
        </div>
      )}

      {activeModule === "usuarios" && <UserList />}
      {activeModule === "cursos" && <CourseRosterManagement />}
      {activeModule === "estructuraCursos" && <CourseStructureManagement />}
      {activeModule === "boletines" && <AdminReportCards />}
      {activeModule === "permisos" && <AdminPermissionLetters />}
      {activeModule === "asistencia" && <AdminAttendance />}
      {activeModule === "alertasAcademicas" && <AdminAcademicAlerts />}
      {activeModule === "perfil" && <AdminProfile />}

      {activeModule === "configuracion" && (
        <div>
          <h2>Configuración del sistema</h2>
          <p>Próximamente...</p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
