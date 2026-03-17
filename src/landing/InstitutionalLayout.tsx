import { Link, NavLink, Outlet } from "react-router-dom";
import logo from "@/assets/logo.png";
import "./landing.css";

const InstitutionalLayout = () => {
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-header__brand">
          <img src={logo} alt="Logo institucional" className="landing-header__logo" />
          <div>
            <strong>Institucion Educativa</strong>
            <span>Plataforma informativa e institucional</span>
          </div>
        </div>

        <nav className="landing-header__nav">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/institucional">Informacion institucional</NavLink>
          <NavLink to="/contacto">Contactanos</NavLink>
        </nav>

        <Link to="/plataforma" className="landing-header__cta">
          Plataforma institucional
        </Link>
      </header>

      <main className="landing-main">
        <Outlet />
      </main>
    </div>
  );
};

export default InstitutionalLayout;
