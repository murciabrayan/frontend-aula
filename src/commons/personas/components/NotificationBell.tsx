import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
  type Notification,
} from "../../../api/notifications";
import { Bell } from "lucide-react";

interface Props {
  setActiveModule: (module: string) => void;
}

export default function NotificationBell({ setActiveModule }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const notifData = await getNotifications();
      setNotifications(notifData);
    } catch (err) {
      console.error("Error cargando notificaciones", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (n: Notification) => {
    try {
      if (!n.leida) {
        await markAsRead(n.id);
      }

      await loadData();
      setOpen(false);

      // 🔔 Si es calificación → cambiar módulo
      if (n.titulo.toLowerCase().includes("calificación")) {
        setActiveModule("calificaciones");
      }
    } catch (err) {
      console.error("Error marcando notificación", err);
    }
  };

  const unread = notifications.filter(n => !n.leida).length;

  return (
    <div className="notification-wrapper">
      <div
        className="bell-container"
        onClick={() => setOpen(!open)}
      >
        <Bell size={22} />

        {unread > 0 && (
          <span className="notification-badge">
            {unread}
          </span>
        )}
      </div>

      {open && (
        <div className="notification-dropdown">
          <h4>Notificaciones</h4>

          {notifications.length === 0 ? (
            <p className="empty">Sin notificaciones</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${
                  n.leida ? "" : "unread"
                }`}
                onClick={() => handleNotificationClick(n)}
              >
                <strong>{n.titulo}</strong>
                <p>{n.mensaje}</p>
                <small>
                  {new Date(n.fecha_creacion).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}