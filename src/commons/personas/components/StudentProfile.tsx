import ProfileModule from "./ProfileModule";

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
            { name: "acudiente_telefono", label: "Telefono del acudiente" },
            {
              name: "acudiente_email",
              label: "Correo del acudiente",
              type: "email",
            },
          ],
        },
      ]}
    />
  );
};

export default StudentProfile;
