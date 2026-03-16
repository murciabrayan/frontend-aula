import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/report-cards";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

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

export const getIndicators = () => {
  return axios.get<Indicator[]>(`${API_BASE}/indicators/`, {
    headers: getAuthHeaders(),
  });
};

export const createIndicator = (data: { descripcion: string }) => {
  return axios.post<Indicator>(`${API_BASE}/indicators/`, data, {
    headers: getAuthHeaders(),
  });
};

export const updateIndicator = (
  indicatorId: number,
  data: { descripcion: string }
) => {
  return axios.patch<Indicator>(`${API_BASE}/indicators/${indicatorId}/`, data, {
    headers: getAuthHeaders(),
  });
};

export const deleteIndicator = (indicatorId: number) => {
  return axios.delete(`${API_BASE}/indicators/${indicatorId}/`, {
    headers: getAuthHeaders(),
  });
};

export const getAssignmentsByCourse = (courseId: number) => {
  return axios.get<SubjectIndicatorAssignment[]>(
    `${API_BASE}/indicator-assignments/?course=${courseId}`,
    {
      headers: getAuthHeaders(),
    }
  );
};

export const createAssignment = (data: {
  materia: number;
  periodo: number;
  indicador: number;
}) => {
  return axios.post<SubjectIndicatorAssignment>(
    `${API_BASE}/indicator-assignments/`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );
};

export const deleteAssignment = (assignmentId: number) => {
  return axios.delete(`${API_BASE}/indicator-assignments/${assignmentId}/`, {
    headers: getAuthHeaders(),
  });
};