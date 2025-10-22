// src/commons/Auth/services/auth.service.ts
import api from "@/api/axios";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  email: string;
  cedula: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  exp: number;
  iat: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post<LoginResponse>("/api/token/", { email, password });
    const { access, refresh } = response.data;

    // Guardar los tokens en localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Decodificar el JWT para extraer datos del usuario
    const decoded: DecodedToken = jwtDecode(access);

    // Guardar datos del usuario actual (opcional)
    localStorage.setItem("user", JSON.stringify(decoded));

    return decoded; // devuelve el usuario con su rol, email, etc.
  } catch (error: any) {
    console.error("Error en login:", error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = (): DecodedToken | null => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
