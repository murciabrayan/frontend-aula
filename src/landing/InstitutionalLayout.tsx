import { Facebook, Instagram, Menu, Twitter, Youtube, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import "./landing.css";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/institucional" },
  { label: "Contacto", href: "/contacto" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Twitter", href: "https://x.com", icon: Twitter },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
];

const quickLinks = [
  { label: "Admision", href: "/#admisiones" },
  { label: "Carreras", href: "/#programas" },
  { label: "Noticias", href: "/#noticias" },
  { label: "Contacto", href: "/contacto" },
];

const InstitutionalLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isRouteActive = (href: string) => location.pathname === href;

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-header__inner">
          <Link to="/" className="landing-header__brand">
            <img src={logo} alt="Logo institucional" className="landing-header__logo" />
            <div>
              <strong>Institucion Educativa</strong>
              <span>Excelencia academica y formacion con vision global</span>
            </div>
          </Link>

          <button
            type="button"
            className="landing-header__toggle"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={`landing-header__menu ${menuOpen ? "is-open" : ""}`}>
            <nav className="landing-header__nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={isRouteActive(item.href) ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="landing-header__tools">
              <div className="landing-header__social">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>

              <Link
                to="/plataforma"
                className="landing-header__cta"
                onClick={() => setMenuOpen(false)}
              >
                Plataforma institucional
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <Outlet />
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__grid">
          <div className="landing-footer__brand">
            <img src={logo} alt="Logo institucional" className="landing-footer__logo" />
            <strong>Institucion Educativa</strong>
            <p>
              Formamos lideres con pensamiento critico, excelencia academica y una
              comunidad que impulsa el futuro profesional.
            </p>
          </div>

          <div>
            <h3>Enlaces rapidos</h3>
            <div className="landing-footer__links">
              {quickLinks.map((item) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3>Siguenos</h3>
            <div className="landing-footer__social">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3>Contacto</h3>
            <div className="landing-footer__contact">
              <span>Tel: +57 601 555 1010</span>
              <span>Email: admisiones@institucion.edu.co</span>
              <span>Direccion: Avenida del Conocimiento 245, Bogota</span>
            </div>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <span>&copy; 2026 Institucion Educativa. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
};

export default InstitutionalLayout;
