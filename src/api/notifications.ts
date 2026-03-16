import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/notifications";

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await axios.get<Notification[]>(`${API_BASE}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await axios.patch(
    `${API_BASE}/${id}/`,
    { leida: true },
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const response = await axios.delete(`${API_BASE}/${id}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};