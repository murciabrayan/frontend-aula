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

export interface StoredUser {
  id?: number;
  email: string;
  cedula?: string;
  first_name?: string;
  last_name?: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  photo_url?: string | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: StoredUser;
}

export const AUTH_CHANGE_EVENT = "auth-change";

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getDashboardRoute = (role?: DecodedToken["role"] | null) => {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  if (role === "STUDENT") return "/student";
  return "/plataforma";
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post<LoginResponse>("/api/token/", { email, password });
    const { access, refresh, user } = response.data;

    // Guardar los tokens en localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Decodificar el JWT para extraer datos del usuario
    const decoded: DecodedToken = jwtDecode(access);

    const storedUser: StoredUser = {
      ...decoded,
      ...user,
      email: user?.email || decoded.email,
      cedula: user?.cedula || decoded.cedula,
      role: user?.role || decoded.role,
      photo_url: user?.photo_url || null,
    };

    localStorage.setItem("user", JSON.stringify(storedUser));

    notifyAuthChange();

    return decoded; // devuelve el usuario con su rol, email, etc.
  } catch (error: any) {
    console.error("Error en login:", error.response?.data || error.message);
    throw error;
  }
};

export const loginWithGoogle = async (googleToken: string) => {
  try {
    const response = await api.post("/api/auth/google/", {
      token: googleToken,
    });

    const { access, refresh, user } = response.data;

    // Guardar tokens
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Guardar usuario
    localStorage.setItem("user", JSON.stringify(user));

    notifyAuthChange();

    return user;
  } catch (error: any) {
    console.error(
      "Error en login con Google:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  notifyAuthChange();
};

export const getCurrentUser = (): StoredUser | null => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: StoredUser) => {
  localStorage.setItem("user", JSON.stringify(user));
  notifyAuthChange();
};

export const isAuthenticated = () => Boolean(localStorage.getItem("access_token"));
