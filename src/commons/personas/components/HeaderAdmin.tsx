import React from "react";
import logo from "@/assets/logo.png";

const HeaderAdmin: React.FC = () => {
  return (
    <header className="admin-header" style={{ display: "flex", alignItems: "center", gap: "550px" }}>
      <img
        src={logo}
        alt="Logo"
        className="admin-logo"
        style={{ height: "100px", objectFit: "contain" }}
      />
      <h1
        style={{
          color: "#d4af37", // Dorado elegante
          fontWeight: 700,
          fontSize: "1.5rem",
          letterSpacing: "0.5px",
        }}
      >
        Bienvenido, Administrador
      </h1>
    </header>
  );
};

export default HeaderAdmin;
