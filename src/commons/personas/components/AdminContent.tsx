import React from "react";
import UserList from "../../../components/admin/UserList";
import CourseList from "../../../components/admin/CourseList";
import CourseAssign from "../../../components/admin/CourseAssign";
import AdminProfile from "../components/AdminProfile";
import sideImage from "@/assets/2.png";

interface AdminContentProps {
  activeModule: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ activeModule }) => {
  return (
    <div className="admin-content">
      {activeModule === "inicio" && (
        <div>
          <div
            className="login-right"
            style={{
              backgroundImage: `url(${sideImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "50%",
              height: "100vh",
              position: "absolute",
              top: 0,
              right: 0,
            }}
            aria-hidden="true"
          ></div>

          <h2 className="titulo 1">Bienvenido al Panel de Administración</h2>
          <p>Selecciona una opción en el menú lateral para comenzar.</p>
        </div>
      )}

      {activeModule === "usuarios" && <UserList />}
      {activeModule === "cursos" && <CourseList />}
      {activeModule === "asignarCursos" && <CourseAssign />}
      {activeModule === "perfil" && <AdminProfile />}
      {activeModule === "configuracion" && (
        <div>
          <h2>Configuración del Sistema</h2>
          <p>Proximamente...</p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
