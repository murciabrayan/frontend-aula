import React from "react";
import logo from "@/assets/logo.png";

const HeaderAdmin: React.FC = () => {
  return (
    <header className="admin-header">
      <img src={logo} alt="Logo" className="admin-logo" />
      <h1>Bienvenido, Administrador</h1>
    </header>
  );
};

export default HeaderAdmin;
