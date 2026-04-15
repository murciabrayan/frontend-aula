import api from "@/api/axios";

const API_BASE = "/api";

export const getAreasByCourse = (courseId: number) =>
  api.get(`${API_BASE}/areas/?course=${courseId}`);

export const createArea = (data: { nombre: string; curso: number }) =>
  api.post(`${API_BASE}/areas/`, data);

export const updateArea = (areaId: number, data: { nombre: string }) =>
  api.patch(`${API_BASE}/areas/${areaId}/`, data);

export const deleteArea = (areaId: number) =>
  api.delete(`${API_BASE}/areas/${areaId}/`);

export const updateSubjectArea = (subjectId: number, areaId: number | null) =>
  api.patch(`${API_BASE}/subjects/${subjectId}/`, { area: areaId });
