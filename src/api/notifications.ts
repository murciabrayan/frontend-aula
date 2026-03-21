import api from "@/api/axios";

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>("/api/mis-notificaciones/");
  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await api.patch(`/api/notificaciones/${id}/`, { leida: true });
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const response = await api.delete(`/api/notificaciones/${id}/`);
  return response.data;
};
