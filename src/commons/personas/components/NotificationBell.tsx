import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  type Notification,
} from "../../../api/notifications";
import { Bell, X, CheckCheck } from "lucide-react";

interface Props {
  setActiveModule: (module: string) => void;
}

const getTargetModule = (notification: Notification): string | null => {
  const titulo = notification.titulo.toLowerCase();
  const mensaje = notification.mensaje.toLowerCase();

  if (
    titulo.includes("calificación") ||
    titulo.includes("calificacion") ||
    mensaje.includes("calificación") ||
    mensaje.includes("calificacion")
  ) {
    return "calificaciones";
  }

  if (
    titulo.includes("alerta") ||
    titulo.includes("bajo rendimiento") ||
    titulo.includes("inasistencia") ||
    titulo.includes("no entreg") ||
    mensaje.includes("bajo rendimiento") ||
    mensaje.includes("inasistencia") ||
    mensaje.includes("no entreg")
  ) {
    return "alertas";
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

export default function NotificationBell({ setActiveModule }: Props) {
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

      const targetModule = getTargetModule(n);

      await loadData();
      setOpen(false);

      if (targetModule) {
        setActiveModule(targetModule);
      }
    } catch (err) {
      console.error("Error marcando notificación", err);
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
      console.error("Error marcando como leída", err);
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
      console.error("Error eliminando notificación", err);
    }
  };

  const unread = useMemo(
    () => notifications.filter((n) => !n.leida).length,
    [notifications]
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
            <span className="notification-counter">
              {unread} sin leer
            </span>
          </div>

          {loading ? (
            <p className="empty">Cargando...</p>
          ) : notifications.length === 0 ? (
            <p className="empty">Sin notificaciones</p>
          ) : (
            <div className="notification-list">
              {notifications.map((n) => (
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
                          title="Marcar como leída"
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