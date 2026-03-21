import ProfileModule from "./ProfileModule";

const AdminProfile = () => {
  return (
    <ProfileModule
      roleTitle="Administrador"
      roleDescription="Administra tu información principal y mantén seguro el acceso al panel."
      sections={[
        {
          title: "Datos personales",
          description: "Informacion basica asociada a tu cuenta administrativa.",
          fields: [
            { name: "first_name", label: "Nombre" },
            { name: "last_name", label: "Apellido" },
            {
              name: "email",
              label: "Correo electrónico",
              type: "email",
            },
            { name: "cargo", label: "Cargo" },
          ],
        },
      ]}
    />
  );
};

export default AdminProfile;
