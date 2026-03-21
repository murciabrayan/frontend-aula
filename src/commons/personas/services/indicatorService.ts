import api from "@/api/axios";

const API_BASE = "/api/report-cards";

export interface Indicator {
  id: number;
  descripcion: string;
}

export interface SubjectIndicatorAssignment {
  id: number;
  materia: number;
  materia_nombre?: string;
  periodo: number;
  indicador: number;
  indicador_descripcion: string;
}

export const getIndicators = () => api.get<Indicator[]>(`${API_BASE}/indicators/`);

export const createIndicator = (data: { descripcion: string }) =>
  api.post<Indicator>(`${API_BASE}/indicators/`, data);

export const updateIndicator = (indicatorId: number, data: { descripcion: string }) =>
  api.patch<Indicator>(`${API_BASE}/indicators/${indicatorId}/`, data);

export const deleteIndicator = (indicatorId: number) =>
  api.delete(`${API_BASE}/indicators/${indicatorId}/`);

export const getAssignmentsByCourse = (courseId: number) =>
  api.get<SubjectIndicatorAssignment[]>(
    `${API_BASE}/indicator-assignments/?course=${courseId}`
  );

export const createAssignment = (data: {
  materia: number;
  periodo: number;
  indicador: number;
}) => api.post<SubjectIndicatorAssignment>(`${API_BASE}/indicator-assignments/`, data);

export const deleteAssignment = (assignmentId: number) =>
  api.delete(`${API_BASE}/indicator-assignments/${assignmentId}/`);
