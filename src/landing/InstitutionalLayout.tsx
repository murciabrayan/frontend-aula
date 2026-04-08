import {
  Facebook,
  Instagram,
  LogOut,
  Menu,
  PencilLine,
  Twitter,
  UserRound,
  UserCircle2,
  Youtube,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
  AUTH_CHANGE_EVENT,
  getCurrentUser,
  getDashboardRoute,
  hasLandingAdminAccess,
  logoutUser,
} from "@/commons/Auth/services/auth.service";
import { LandingContentProvider } from "./LandingContentContext";
import LandingAdminPanel from "./LandingAdminPanel";
import "./landing.css";

const navItems = [
  { label: "Inicio", href: "/" },
  {
    label: "Nosotros",
    href: "/institucional/identidad",
    children: [
      { label: "Identidad", href: "/institucional/identidad" },
      { label: "Símbolos institucionales", href: "/institucional/simbolos" },
      { label: "Documentos institucionales", href: "/institucional/documentos" },
    ],
  },
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
  { label: "Oferta académica", href: "/#programas" },
  { label: "Noticias", href: "/#noticias" },
  { label: "Contacto", href: "/contacto" },
];

const InstitutionalLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutMenuOpen, setAboutMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const profileRef = useRef<HTMLDivElement | null>(null);
  const aboutMenuRef = useRef<HTMLDivElement | null>(null);
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
    setAboutMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!aboutMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!aboutMenuRef.current?.contains(event.target as Node)) {
        setAboutMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [aboutMenuOpen]);

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [profileOpen]);

  const platformTarget = useMemo(
    () => getDashboardRoute(currentUser?.role || null),
    [currentUser],
  );
  const showLandingAdminTools =
    currentUser?.role === "ADMIN" && hasLandingAdminAccess();

  const isRouteActive = (href: string) => location.pathname === href;
  const isAboutSectionActive = location.pathname.startsWith("/institucional");

  const handlePlatformAccess = () => {
    setProfileOpen(false);
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

  const profileLabel = "Mi cuenta";

  return (
    <LandingContentProvider>
      <div className="landing-shell">
        <header className="landing-header">
          <div className="landing-header__inner">
            <Link to="/" className="landing-header__brand">
              <img src={logo} alt="Logo institucional" className="landing-header__logo" />
              <div>
                <strong>Gimnasio los cerros</strong>
                <span>Un camino feliz hacia la construcción del conocimiento</span>
              </div>
            </Link>

            <button
              type="button"
              className="landing-header__toggle"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className={`landing-header__menu ${menuOpen ? "is-open" : ""}`}>
              <nav className="landing-header__nav">
                {navItems.map((item) => {
                  if (!item.children) {
                    return (
                      <NavLink
                        key={item.label}
                        to={item.href}
                        className={isRouteActive(item.href) ? "active" : ""}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    );
                  }

                  return (
                    <div
                      key={item.label}
                      className={`landing-header__dropdown ${isAboutSectionActive ? "is-active" : ""} ${aboutMenuOpen ? "is-open" : ""}`}
                      ref={aboutMenuRef}
                      onMouseEnter={() => setAboutMenuOpen(true)}
                      onMouseLeave={() => setAboutMenuOpen(false)}
                    >
                      <button
                        type="button"
                        className={`landing-header__dropdown-trigger ${isAboutSectionActive ? "active" : ""}`}
                        onClick={() => setAboutMenuOpen((current) => !current)}
                        aria-expanded={aboutMenuOpen}
                      >
                        <span>{item.label}</span>
                      </button>

                      <div className="landing-header__dropdown-menu">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={isRouteActive(child.href) ? "active" : ""}
                            onClick={() => {
                              setMenuOpen(false);
                              setAboutMenuOpen(false);
                            }}
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  );
                })}
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

                {showLandingAdminTools ? (
                  <div className="landing-profile" ref={profileRef}>
                    <button
                      type="button"
                      className="landing-profile__trigger"
                      onClick={handleProfileAction}
                      aria-label={profileLabel}
                    >
                      {currentUser?.avatar_url ? (
                        <img
                          src={currentUser.avatar_url}
                          alt="Perfil"
                          className="landing-profile__avatar"
                        />
                      ) : (
                        <UserRound size={28} strokeWidth={2.5} />
                      )}
                    </button>

                    {profileOpen ? (
                      <div className="landing-profile__menu">
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

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            setEditorOpen(true);
                          }}
                        >
                          <PencilLine size={16} />
                          <span>Editar landing</span>
                        </button>

                        <button type="button" onClick={handleLogout}>
                          <LogOut size={16} />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
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
              <strong>Institución Educativa</strong>
              <p>
                Formamos líderes con pensamiento crítico, excelencia académica y una
                comunidad escolar que impulsa el crecimiento integral de cada estudiante.
              </p>
            </div>

            <div>
              <h3>Enlaces rápidos</h3>
              <div className="landing-footer__links">
                {quickLinks.map((item) => (
                  <a key={item.label} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3>Síguenos</h3>
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
                <span>Dirección: Cl. 8 # 6-87, Simijaca, Cundinamarca</span>
              </div>
            </div>
          </div>

          <div className="landing-footer__bottom">
            <span>&copy; 2026 Institución Educativa. Todos los derechos reservados.</span>
          </div>
        </footer>
        <LandingAdminPanel open={editorOpen} onClose={() => setEditorOpen(false)} />
      </div>
    </LandingContentProvider>
  );
};

export default InstitutionalLayout;
