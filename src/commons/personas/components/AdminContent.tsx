import React from "react";
import AdminAttendance from "../../../components/admin/AdminAttendance";
import CourseRosterManagement from "../../../components/admin/CourseRosterManagement";
import CourseStructureManagement from "../../../components/admin/CourseStructureManagement";
import UserList from "../../../components/admin/UserList";
import sideImage from "@/assets/1.jpg";
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
          <section className="dashboard-home__admin-showcase">
            <div className="dashboard-home__admin-showcase-copy">
              <section className="dashboard-home__admin-hero">
                <div className="dashboard-home__admin-copy">
                  <span className="dashboard-home__badge">Panel central</span>
                  <h2>Administra el colegio con una vista clara, moderna y preparada para el dia a dia</h2>
                  <p>
                    Gestiona usuarios, cursos, estructura academica, asistencia,
                    boletines y alertas desde un punto de control mas visual y mejor
                    organizado.
                  </p>

                  <div className="dashboard-home__admin-pills">
                    <span>Usuarios</span>
                    <span>Cursos</span>
                    <span>Boletines</span>
                    <span>Alertas</span>
                  </div>
                </div>
              </section>

              <section className="dashboard-home__admin-grid">
                <article className="dashboard-home__admin-card">
                  <span>Gestion unificada</span>
                  <strong>Todo el ecosistema escolar en un mismo panel</strong>
                </article>
                <article className="dashboard-home__admin-card">
                  <span>Operacion diaria</span>
                  <strong>Acceso rapido a los modulos mas importantes</strong>
                </article>
                <article className="dashboard-home__admin-card">
                  <span>Experiencia</span>
                  <strong>Una portada institucional mas solida para el rol administrativo</strong>
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
