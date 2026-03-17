import {
  CircleUserRound,
  Facebook,
  Instagram,
  LogOut,
  Menu,
  PencilLine,
  Twitter,
  UserCircle2,
  Youtube,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
  AUTH_CHANGE_EVENT,
  getCurrentUser,
  getDashboardRoute,
  logoutUser,
} from "@/commons/Auth/services/auth.service";
import { LandingContentProvider } from "./LandingContentContext";
import LandingAdminPanel from "./LandingAdminPanel";
import LandingLoginModal from "./LandingLoginModal";
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
  { label: "Agenda escolar", href: "/#admisiones" },
  { label: "Oferta academica", href: "/#programas" },
  { label: "Noticias", href: "/#noticias" },
  { label: "Contacto", href: "/contacto" },
];

const InstitutionalLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());

    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const platformTarget = useMemo(
    () => getDashboardRoute(currentUser?.role || null),
    [currentUser],
  );

  const isRouteActive = (href: string) => location.pathname === href;

  const handlePlatformAccess = () => {
    navigate(platformTarget);
  };

  const handleLogout = () => {
    logoutUser();
    setProfileOpen(false);
    navigate("/");
  };

  const handleProfileAction = () => {
    setProfileOpen((current) => !current);
  };

  const profileLabel = !currentUser
    ? "Iniciar sesion"
    : currentUser.role === "ADMIN"
      ? "Mi cuenta"
      : "Cerrar sesion";

  return (
    <LandingContentProvider>
      <div className="landing-shell">
        <header className="landing-header">
          <div className="landing-header__inner">
            <Link to="/" className="landing-header__brand">
              <img src={logo} alt="Logo institucional" className="landing-header__logo" />
              <div>
                <strong>Gimnasio los cerros</strong>
                <span>Un camino feliz hacia la construccion del conocimiento</span>
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

                <button
                  type="button"
                  className="landing-header__cta"
                  onClick={handlePlatformAccess}
                >
                  Plataforma institucional
                </button>

                <div className="landing-profile">
                  <button
                    type="button"
                    className="landing-profile__trigger"
                    onClick={handleProfileAction}
                    aria-label={profileLabel}
                  >
                    <CircleUserRound size={18} />
                  </button>

                  {profileOpen ? (
                    <div className="landing-profile__menu">
                      {currentUser ? (
                        <>
                          <div className="landing-profile__summary">
                            <UserCircle2 size={22} />
                            <div>
                              <strong>{currentUser.email}</strong>
                              <span>{currentUser.role}</span>
                            </div>
                          </div>

                          <button type="button" onClick={handlePlatformAccess}>
                            <UserCircle2 size={16} />
                            <span>Ir a mi panel</span>
                          </button>

                          {currentUser.role === "ADMIN" ? (
                            <button type="button" onClick={() => setEditorOpen(true)}>
                              <PencilLine size={16} />
                              <span>Editar landing</span>
                            </button>
                          ) : null}

                          <button type="button" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span>Cerrar sesion</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            setLoginOpen(true);
                          }}
                        >
                          <UserCircle2 size={16} />
                          <span>Iniciar sesion</span>
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
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
                comunidad escolar que impulsa el crecimiento integral de cada estudiante.
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
                <span>Direccion: Cl. 8 # 6-87, Simijaca, Cundinamarca</span>
              </div>
            </div>
          </div>

          <div className="landing-footer__bottom">
            <span>&copy; 2026 Institucion Educativa. Todos los derechos reservados.</span>
          </div>
        </footer>

        <LandingLoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onAuthenticated={() => setCurrentUser(getCurrentUser())}
        />
        <LandingAdminPanel open={editorOpen} onClose={() => setEditorOpen(false)} />
      </div>
    </LandingContentProvider>
  );
};

export default InstitutionalLayout;
