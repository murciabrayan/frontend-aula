import React from "react";

interface ContentProps {
  activeModule: string;
}

const AdminContent: React.FC<ContentProps> = ({ activeModule }) => {
  return (
    <div className="admin-content">
      {activeModule === "inicio" && <h2>Resumen del Sistema</h2>}

      {activeModule === "docentes" && (
        <div>
          <h2>Gestión de Docentes</h2>
          <p>Aquí podrás agregar, editar o eliminar docentes.</p>
        </div>
      )}

      {activeModule === "estudiantes" && (
        <div>
          <h2>Gestión de Estudiantes</h2>
          <p>Aquí podrás administrar la información de los estudiantes.</p>
        </div>
      )}

      {activeModule === "configuracion" && (
        <div>
          <h2>Configuración del Sistema</h2>
          <p>Opciones generales y preferencias.</p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
