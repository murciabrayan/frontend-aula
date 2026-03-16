import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAreasByCourse = (courseId: number) => {
  return axios.get(`${API_BASE}/areas/?course=${courseId}`, {
    headers: getAuthHeaders(),
  });
};

export const createArea = (data: { nombre: string; curso: number }) => {
  return axios.post(`${API_BASE}/areas/`, data, {
    headers: getAuthHeaders(),
  });
};

export const deleteArea = (areaId: number) => {
  return axios.delete(`${API_BASE}/areas/${areaId}/`, {
    headers: getAuthHeaders(),
  });
};

export const updateSubjectArea = (
  subjectId: number,
  areaId: number | null
) => {
  return axios.patch(
    `${API_BASE}/subjects/${subjectId}/`,
    { area: areaId },
    {
      headers: getAuthHeaders(),
    }
  );
};