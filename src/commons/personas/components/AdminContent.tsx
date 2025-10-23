import React from "react";
import UserList from "../../../components/admin/UserList";
import CourseList from "../../../components/admin/CourseList";
import CourseAssign from "../../../components/admin/CourseAssign"; // ✅ Nuevo componente

interface AdminContentProps {
  activeModule: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ activeModule }) => {
  return (
    <div className="admin-content">
      {activeModule === "inicio" && (
        <div>
          <h2>Bienvenido al Panel de Administración</h2>
          <p>Selecciona una opción en el menú lateral para comenzar.</p>
        </div>
      )}

      {activeModule === "usuarios" && <UserList />}

      {activeModule === "cursos" && <CourseList />}

      {activeModule === "asignarCursos" && <CourseAssign />} {/* ✅ Nuevo módulo */}

      {activeModule === "configuracion" && (
        <div>
          <h2>Configuración del Sistema</h2>
          <p>Aquí podrás modificar parámetros generales más adelante.</p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
