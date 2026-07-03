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
  login_identifier?: string;
  first_name?: string;
  last_name?: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  must_change_password?: boolean;
  has_accepted_data_policy?: boolean;
  data_policy_accepted_at?: string | null;
  has_saved_signature?: boolean;
  photo_url?: string | null;
  avatar_url?: string | null;
  avatar_style?: string;
  avatar_seed?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: StoredUser;
}

export const AUTH_CHANGE_EVENT = "auth-change";
const LANDING_ADMIN_ACCESS_KEY = "landing_admin_access";
const INACTIVITY_LAST_ACTIVITY_KEY = "dashboard_last_activity_at";
const INACTIVITY_LOCK_KEY = "dashboard_inactivity_locked";

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getDashboardRoute = (role?: DecodedToken["role"] | null) => {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  if (role === "STUDENT") return "/student";
  return "/plataforma";
};

export const getNextAuthRoute = (user?: StoredUser | null) => {
  if (!user) return "/plataforma";
  if (!user.has_accepted_data_policy) return "/tratamiento-datos";
  if (user.must_change_password) return "/primer-acceso";
  return getDashboardRoute(user.role);
};

export const loginUser = async (identifier: string, password: string) => {
  try {
    const response = await api.post<LoginResponse>("/api/token/", { email: identifier, password });
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
      login_identifier: user?.login_identifier || user?.cedula || decoded.cedula || user?.email || decoded.email,
      role: user?.role || decoded.role,
      must_change_password: user?.must_change_password || false,
      has_accepted_data_policy: user?.has_accepted_data_policy || false,
      data_policy_accepted_at: user?.data_policy_accepted_at || null,
      has_saved_signature: user?.has_saved_signature || false,
      photo_url: user?.photo_url || null,
      avatar_url: user?.avatar_url || user?.photo_url || null,
      avatar_style: user?.avatar_style,
      avatar_seed: user?.avatar_seed,
    };

    localStorage.setItem("user", JSON.stringify(storedUser));
    localStorage.setItem(INACTIVITY_LAST_ACTIVITY_KEY, Date.now().toString());
    localStorage.removeItem(INACTIVITY_LOCK_KEY);

    notifyAuthChange();

    return storedUser;
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
    localStorage.setItem(INACTIVITY_LAST_ACTIVITY_KEY, Date.now().toString());
    localStorage.removeItem(INACTIVITY_LOCK_KEY);

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
  localStorage.removeItem(LANDING_ADMIN_ACCESS_KEY);
  localStorage.removeItem(INACTIVITY_LAST_ACTIVITY_KEY);
  localStorage.removeItem(INACTIVITY_LOCK_KEY);
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

export const enableLandingAdminAccess = () => {
  localStorage.setItem(LANDING_ADMIN_ACCESS_KEY, "true");
};

export const hasLandingAdminAccess = () =>
  localStorage.getItem(LANDING_ADMIN_ACCESS_KEY) === "true";

export const completeInitialPassword = async (newPassword: string) => {
  const response = await api.post<{ message: string; user: StoredUser }>(
    "/api/complete-initial-password/",
    { new_password: newPassword },
  );

  const currentUser = getCurrentUser();
  const updatedUser: StoredUser = {
    ...(currentUser || {}),
    ...response.data.user,
    must_change_password: false,
  };

  setCurrentUser(updatedUser);
  return response.data;
};

export interface DataPolicyStatusResponse {
  version: string;
  title: string;
  institution_name: string;
  paragraphs: string[];
  signer_name: string;
  signer_document: string;
  signer_role: string;
  accepted: boolean;
  accepted_at: string | null;
}

export const getDataPolicyStatus = async () => {
  const response = await api.get<DataPolicyStatusResponse>("/api/data-policy/");
  return response.data;
};

export const acceptDataPolicy = async (signatureFile: File) => {
  const payload = new FormData();
  payload.append("accept", "true");
  payload.append("signature_file", signatureFile);

  const response = await api.post<{ message: string; user: StoredUser }>(
    "/api/data-policy/accept/",
    payload,
  );

  const currentUser = getCurrentUser();
  const updatedUser: StoredUser = {
    ...(currentUser || {}),
    ...response.data.user,
    has_accepted_data_policy: true,
    has_saved_signature: response.data.user?.has_saved_signature ?? currentUser?.has_saved_signature ?? false,
  };

  setCurrentUser(updatedUser);
  return response.data;
};

export const isAuthenticated = () => Boolean(localStorage.getItem("access_token"));
