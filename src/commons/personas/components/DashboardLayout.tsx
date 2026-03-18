import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { logoutUser } from "@/commons/Auth/services/auth.service";
import questionImage from "@/assets/pregunta.jpg";
import "@/commons/personas/styles/dashboardLayout.css";

export interface DashboardModuleItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  roleLabel: string;
  modules: DashboardModuleItem[];
  activeModule: string;
  onModuleChange: (module: string) => void;
  topbarContent?: ReactNode;
  children: ReactNode;
}

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

const DashboardLayout = ({
  roleLabel,
  modules,
  activeModule,
  onModuleChange,
  topbarContent,
  children,
}: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const activeModuleLabel = useMemo(
    () => modules.find((module) => module.id === activeModule)?.label ?? "Inicio",
    [activeModule, modules]
  );

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("role");
    window.location.href = "/plataforma";
  };

  useEffect(() => {
    if (showInactivityModal) return;

    let timeoutId: number | undefined;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setShowInactivityModal(true);
      }, INACTIVITY_LIMIT_MS);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [showInactivityModal]);

  return (
    <>
      <div
        className={`dashboard-layout ${
          sidebarCollapsed ? "dashboard-layout--collapsed" : ""
        }`}
      >
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar__header">
            <span className="dashboard-sidebar__eyebrow"></span>
            {!sidebarCollapsed && <h2>{roleLabel}</h2>}
          </div>

          <nav className="dashboard-sidebar__nav" aria-label={`Navegacion ${roleLabel}`}>
            {modules.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`dashboard-sidebar__link ${
                  activeModule === id ? "is-active" : ""
                }`}
                onClick={() => onModuleChange(id)}
              >
                <Icon className="dashboard-sidebar__icon" />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>

          <div className="dashboard-sidebar__footer">
            <button
              type="button"
              className="dashboard-sidebar__logout"
              onClick={handleLogout}
            >
              <LogOut className="dashboard-sidebar__icon" />
              {!sidebarCollapsed && <span>Cerrar sesion</span>}
            </button>
          </div>

          <button
            type="button"
            className="dashboard-sidebar__toggle"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </aside>

        <section className="dashboard-panel">
          <header className="dashboard-panel__header">
            <div>
              <p className="dashboard-panel__eyebrow">{roleLabel}</p>
              <h1>{activeModuleLabel}</h1>
            </div>

            <div className="dashboard-panel__tools">{topbarContent}</div>
          </header>

          <main className="dashboard-panel__content">{children}</main>
        </section>
      </div>

      {showInactivityModal ? (
        <div className="dashboard-inactivity-backdrop">
          <div className="dashboard-inactivity-modal">
            <div className="dashboard-inactivity-modal__media">
              <img src={questionImage} alt="Sesion inactiva" />
            </div>

            <div className="dashboard-inactivity-modal__content">
              <span className="dashboard-inactivity-modal__badge">Sigues ahi?</span>
              <h2>Tu sesion se quedo dormida</h2>
              <p>
                Estuviste demasiado tiempo sin hacer alguna accion. Debes volver a
                iniciar sesion para seguir dentro de la plataforma.
              </p>

              <button
                type="button"
                className="dashboard-inactivity-modal__button"
                onClick={handleLogout}
              >
                Volver al login
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default DashboardLayout;
