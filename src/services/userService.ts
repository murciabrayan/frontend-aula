// src/services/userService.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/users/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ✅ obtener todos los docentes
export const getTeachers = async () => {
  return axios.get(`${API_URL}?role=teacher`, getAuthHeaders());
};

// ✅ obtener todos los estudiantes
export const getStudents = async () => {
  return axios.get(`${API_URL}?role=student`, getAuthHeaders());
};
