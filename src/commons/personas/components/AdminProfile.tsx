import ProfileModule from "./ProfileModule";

const AdminProfile = () => {
  return (
    <ProfileModule
      roleTitle="Administrador"
      roleDescription="Administra tu informacion principal y manten seguro el acceso al panel."
      sections={[
        {
          title: "Datos personales",
          description: "Informacion basica asociada a tu cuenta administrativa.",
          fields: [
            { name: "first_name", label: "Nombre" },
            { name: "last_name", label: "Apellido" },
            {
              name: "email",
              label: "Correo electronico",
              type: "email",
            },
          ],
        },
      ]}
    />
  );
};

export default AdminProfile;
