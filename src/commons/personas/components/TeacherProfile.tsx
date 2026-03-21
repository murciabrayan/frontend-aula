import ProfileModule from "./ProfileModule";

const TeacherProfile = () => {
  return (
    <ProfileModule
      roleTitle="Docente"
      roleDescription="Actualiza tu información profesional y gestiona tu acceso desde un solo lugar."
      sections={[
        {
          title: "Datos personales",
          description: "Informacion principal visible en tu perfil de docente.",
          fields: [
            { name: "first_name", label: "Nombre" },
            { name: "last_name", label: "Apellido" },
            {
              name: "email",
              label: "Correo electrónico",
              type: "email",
            },
          ],
        },
        {
          title: "Perfil profesional",
          description: "Datos asociados a tu rol académico dentro de la institución.",
          fields: [
            { name: "especialidad", label: "Especialidad" },
            { name: "titulo", label: "Título académico" },
          ],
        },
      ]}
    />
  );
};

export default TeacherProfile;
