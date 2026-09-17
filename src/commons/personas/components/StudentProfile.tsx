import ProfileModule from "./ProfileModule";
import { PARENTESCO_OPTIONS } from "@/types/User";

const StudentProfile = () => {
  return (
    <ProfileModule
      roleTitle="Estudiante"
      roleDescription="Consulta y actualiza tus datos personales y la información de tu acudiente."
      sections={[
        {
          title: "Datos personales",
          description: "Informacion principal de tu cuenta estudiantil.",
          fields: [
            { name: "first_name", label: "Nombre" },
            { name: "last_name", label: "Apellido" },
            {
              name: "email",
              label: "Correo electrónico",
              type: "email",
            },
            { name: "grado", label: "Grado" },
          ],
        },
        {
          title: "Datos del acudiente",
          description: "Informacion de contacto del responsable del estudiante.",
          fields: [
            { name: "acudiente_nombre", label: "Nombre del acudiente" },
            {
              name: "acudiente_parentesco",
              label: "Parentesco",
              type: "select",
              placeholder: "Selecciona el parentesco",
              options: PARENTESCO_OPTIONS,
            },
            { name: "acudiente_cedula", label: "Cedula del acudiente" },
            { name: "acudiente_telefono", label: "Telefono del acudiente" },
            {
              name: "acudiente_email",
              label: "Correo del acudiente",
              type: "email",
            },
          ],
        },
        {
          title: "Segundo acudiente (opcional)",
          description: "Si aplica, registra un segundo responsable del estudiante.",
          fields: [
            { name: "acudiente2_nombre", label: "Nombre del segundo acudiente" },
            {
              name: "acudiente2_parentesco",
              label: "Parentesco",
              type: "select",
              placeholder: "Selecciona el parentesco",
              options: PARENTESCO_OPTIONS,
            },
            { name: "acudiente2_cedula", label: "Cedula del segundo acudiente" },
            { name: "acudiente2_telefono", label: "Telefono del segundo acudiente" },
            {
              name: "acudiente2_email",
              label: "Correo del segundo acudiente",
              type: "email",
            },
          ],
        },
      ]}
    />
  );
};

export default StudentProfile;
