// src/api/axios.ts
import axios from "axios";

// 🧱 Instancia base de Axios
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // URL de tu backend Django
});

// 🔐 Interceptor para incluir automáticamente el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
