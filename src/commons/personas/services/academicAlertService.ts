import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/academic-alerts";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export type AlertType =
  | "LOW_GRADE"
  | "ABSENCE_RISK"
  | "MISSING_ASSIGNMENTS";

export type AlertLevel = "WARNING" | "CRITICAL";
export type AlertStatus = "ACTIVE" | "RESOLVED";

export interface AcademicAlert {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_name: string;
  period: number;
  alert_type: AlertType;
  level: AlertLevel;
  status: AlertStatus;
  title: string;
  message_student: string;
  message_teacher: string;
  message_admin: string;
  metric_value: number | null;
  threshold_value: number | null;
  details: Record<string, any>;
  resolved_by: number | null;
  resolved_by_name: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateAlertsResponse {
  detail: string;
  count: number;
  results: AcademicAlert[];
}

export interface StudentAcademicSummaryResponse {
  student: {
    id: number;
    nombre: string;
  };
  course: {
    id: number;
    nombre: string;
  };
  period: number;
  summary: {
    average: number | null;
    absences: number;
    missing_assignments: number;
    total_assignments: number;
    graded_assignments: number;
  };
}

export const generateAcademicAlerts = (course: number, period: number) => {
  return axios.post<GenerateAlertsResponse>(
    `${API_BASE}/generate/`,
    { course, period },
    { headers: getAuthHeaders() }
  );
};

export const getAcademicAlerts = (params?: {
  course?: number;
  period?: number;
  alert_type?: AlertType | "";
  status?: AlertStatus | "";
}) => {
  return axios.get<AcademicAlert[]>(`${API_BASE}/`, {
    headers: getAuthHeaders(),
    params,
  });
};

export const resolveAcademicAlert = (
  alertId: number,
  resolution_notes: string
) => {
  return axios.post<AcademicAlert>(
    `${API_BASE}/${alertId}/resolve/`,
    { resolution_notes },
    { headers: getAuthHeaders() }
  );
};

export const getStudentAcademicSummary = (period: number) => {
  return axios.get<StudentAcademicSummaryResponse>(
    `${API_BASE}/student-summary/`,
    {
      headers: getAuthHeaders(),
      params: { period },
    }
  );
};