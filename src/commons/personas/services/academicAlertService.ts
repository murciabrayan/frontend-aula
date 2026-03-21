import api from "@/api/axios";

const API_BASE = "/api/academic-alerts";

export type AlertType =
  | "LOW_GRADE"
  | "ABSENCE_RISK"
  | "MISSING_ASSIGNMENTS";

export type AlertLevel = "WARNING" | "CRITICAL";
export type AlertStatus =
  | "TEACHER_INITIAL_PENDING"
  | "ADMIN_INITIAL_REVIEW"
  | "MONITORING"
  | "TEACHER_FINAL_PENDING"
  | "ADMIN_FINAL_REVIEW"
  | "RESOLVED_POSITIVE"
  | "RESOLVED_NEGATIVE";

export type AlertEventType =
  | "ALERT_CREATED"
  | "ALERT_REOPENED"
  | "TEACHER_INITIAL_SUBMITTED"
  | "ADMIN_REVIEW_APPROVED"
  | "ADMIN_REVIEW_REJECTED"
  | "SECOND_FOLLOW_UP_REQUESTED"
  | "TEACHER_FINAL_SUBMITTED"
  | "ADMIN_CLOSED_POSITIVE"
  | "ADMIN_CLOSED_NEGATIVE";

export interface AcademicAlertEvent {
  id: number;
  event_type: AlertEventType;
  title: string;
  notes: string;
  metadata: Record<string, any>;
  visible_to_student: boolean;
  actor: number | null;
  actor_name: string | null;
  created_at: string;
}

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
  next_follow_up_due_at: string | null;
  resolved_by: number | null;
  resolved_by_name: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  events: AcademicAlertEvent[];
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

export const generateAcademicAlerts = (course: number, period: number) =>
  api.post<GenerateAlertsResponse>(`${API_BASE}/generate/`, { course, period });

export const getAcademicAlerts = (params?: {
  course?: number;
  period?: number;
  alert_type?: AlertType | "";
  status?: AlertStatus | "";
}) => api.get<AcademicAlert[]>(`${API_BASE}/`, { params });

export const submitTeacherFollowUp = (
  alertId: number,
  payload: { notes: string; improvement_confirmed?: boolean },
) => api.post<AcademicAlert>(`${API_BASE}/${alertId}/teacher-follow-up/`, payload);

export const reviewAcademicAlert = (
  alertId: number,
  payload: { decision: "APPROVE" | "REJECT"; notes: string },
) => api.post<AcademicAlert>(`${API_BASE}/${alertId}/admin-review/`, payload);

export const closeAcademicAlert = (
  alertId: number,
  payload: { outcome: "POSITIVE" | "NEGATIVE"; notes: string },
) => api.post<AcademicAlert>(`${API_BASE}/${alertId}/admin-close/`, payload);

export const getStudentAcademicSummary = (period: number) =>
  api.get<StudentAcademicSummaryResponse>(`${API_BASE}/student-summary/`, {
    params: { period },
  });
