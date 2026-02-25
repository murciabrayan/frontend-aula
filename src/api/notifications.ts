import axios from "axios";

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// 🔐 Interceptor para enviar el token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Obtener mis notificaciones
export const getNotifications = async (): Promise<Notification[]> => {
  const res = await API.get("/mis-notificaciones/");
  return res.data;
};

// ✅ Marcar como leída
export const markAsRead = async (id: number): Promise<void> => {
  await API.post(`/notificaciones/${id}/leer/`);
};