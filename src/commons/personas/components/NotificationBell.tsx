import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  type Notification,
} from "../../../api/notifications";
import { Bell, X, CheckCheck } from "lucide-react";
import "@/commons/personas/styles/notificationBell.css";

interface Props {
  setActiveModule: (module: string) => void;
  mode?: "all" | "alerts";
  alertModuleId?: string;
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getTargetModule = (notification: Notification): string | null => {
  const titulo = normalizeText(notification.titulo);
  const mensaje = normalizeText(notification.mensaje);

  if (
    titulo.includes("permiso") ||
    titulo.includes("autorizacion") ||
    mensaje.includes("permiso") ||
    mensaje.includes("autorizacion")
  ) {
    return "permisos";
  }

  if (
    titulo.includes("alerta") ||
    titulo.includes("seguimiento") ||
    titulo.includes("bajo rendimiento") ||
    titulo.includes("inasistencia") ||
    titulo.includes("no entreg") ||
    mensaje.includes("seguimiento") ||
    mensaje.includes("bajo rendimiento") ||
    mensaje.includes("inasistencia") ||
    mensaje.includes("no entreg")
  ) {
    return "alertas";
  }

  if (
    titulo.includes("calificacion") ||
    mensaje.includes("calificacion")
  ) {
    return "calificaciones";
  }

  if (
    titulo.includes("tarea") ||
    titulo.includes("entrega") ||
    mensaje.includes("tarea") ||
    mensaje.includes("entrega")
  ) {
    return "tareas";
  }

  return null;
};

const formatNotificationDate = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function NotificationBell({
  setActiveModule,
  mode = "all",
  alertModuleId = "alertas",
}: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const notifData = await getNotifications();
      setNotifications(notifData);
    } catch (err) {
      console.error("Error cargando notificaciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const visibleNotifications = useMemo(() => {
    if (mode === "alerts") {
      return notifications.filter((notification) => getTargetModule(notification) === "alertas");
    }

    return notifications;
  }, [mode, notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: Notification) => {
    try {
      if (!n.leida) {
        await markAsRead(n.id);
      }

      const targetModule =
        mode === "alerts" ? alertModuleId : getTargetModule(n);

      await loadData();
      setOpen(false);

      if (targetModule) {
        setActiveModule(targetModule);
      }
    } catch (err) {
      console.error("Error marcando notificacion", err);
    }
  };

  const handleMarkAsRead = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    e.stopPropagation();

    try {
      await markAsRead(id);
      await loadData();
    } catch (err) {
      console.error("Error marcando como leida", err);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    e.stopPropagation();

    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error eliminando notificacion", err);
    }
  };

  const unread = useMemo(
    () => visibleNotifications.filter((n) => !n.leida).length,
    [visibleNotifications]
  );

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`bell-container ${unread > 0 ? "has-unread" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <Bell size={22} strokeWidth={2} />
        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notificaciones</h4>
            <span className="notification-counter">{unread} sin leer</span>
          </div>

          {loading ? (
            <p className="empty">Cargando...</p>
          ) : visibleNotifications.length === 0 ? (
            <p className="empty">
              {mode === "alerts" ? "Sin notificaciones de alertas" : "Sin notificaciones"}
            </p>
          ) : (
            <div className="notification-list">
              {visibleNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${n.leida ? "read" : "unread"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notification-item-top">
                    <strong>{n.titulo}</strong>

                    <div className="notification-item-actions">
                      {!n.leida && (
                        <button
                          type="button"
                          className="notification-action-btn"
                          title="Marcar como leida"
                          onClick={(e) => handleMarkAsRead(e, n.id)}
                        >
                          <CheckCheck size={15} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="notification-action-btn delete"
                        title="Eliminar"
                        onClick={(e) => handleDelete(e, n.id)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  <p>{n.mensaje}</p>

                  <div className="notification-item-footer">
                    <small>{formatNotificationDate(n.fecha_creacion)}</small>
                    {!n.leida && <span className="notification-dot" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
