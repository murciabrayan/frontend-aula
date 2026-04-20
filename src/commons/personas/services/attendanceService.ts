import api from "@/api/axios";

const API_BASE = "/api";

export interface TeacherAttendanceStudent {
  id: number;
  student_name: string;
  attendance_id: number | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "UNREGISTERED";
  is_justified: boolean;
  justification_type: string;
  notes: string;
  teacher_notes?: string | null;
  admin_notes?: string | null;
  periodo: number;
  attachment_url: string | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;
  updated_by_role?: string | null;
  latest_admin_event?: AttendanceEventSummary | null;
  latest_teacher_event?: AttendanceEventSummary | null;
}

export interface AttendanceEventSummary {
  summary: string;
  notes: string;
  actor_name: string | null;
  created_at: string;
  details?: {
    changes?: Record<
      string,
      {
        label: string;
        from: string | number | boolean | null;
        to: string | number | boolean | null;
      }
    >;
  };
}

export interface TeacherAttendanceDayResponse {
  course: {
    id: number;
    nombre: string;
  };
  date: string;
  students: TeacherAttendanceStudent[];
  summary: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export interface BulkAttendancePayload {
  date: string;
  periodo: 1 | 2 | 3 | 4;
  records: {
    student: number;
    status: "PRESENT" | "ABSENT" | "LATE";
    notes?: string;
  }[];
}

export interface StudentAttendanceRecord {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_name: string;
  date: string;
  periodo: number;
  status: "PRESENT" | "ABSENT" | "LATE";
  is_justified: boolean;
  justification_type: string;
  notes: string | null;
  teacher_notes?: string | null;
  admin_notes?: string | null;
  attachment: string | null;
  attachment_url: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;
  updated_by_role?: string | null;
  created_at: string;
  updated_at: string;
  events?: AttendanceHistoryEvent[];
}

export interface AttendanceHistoryEvent {
  id: number;
  action:
    | "TEACHER_CREATED"
    | "TEACHER_UPDATED"
    | "ADMIN_CREATED"
    | "ADMIN_UPDATED"
    | "ADMIN_JUSTIFIED"
    | "ADMIN_SUPPORT_ADDED";
  summary: string;
  notes: string;
  details?: {
    changes?: Record<
      string,
      {
        label: string;
        from: string | number | boolean | null;
        to: string | number | boolean | null;
      }
    >;
  };
  actor: number | null;
  actor_name: string | null;
  actor_role: string | null;
  created_at: string;
}

export interface AdminCourseAttendanceSummary {
  course: {
    id: number;
    nombre: string;
  };
  date: string;
  present: number;
  absent: number;
  late: number;
  justified: number;
  total: number;
}

export const getTeacherAttendanceByDate = (date: string) =>
  api.get<TeacherAttendanceDayResponse>(
    `${API_BASE}/attendance/teacher/course-day/?date=${date}`
  );

export const saveTeacherAttendanceBulk = (data: BulkAttendancePayload) =>
  api.post(`${API_BASE}/attendance/teacher/bulk-save/`, data);

export const getMyAttendanceRecords = () =>
  api.get<StudentAttendanceRecord[]>(`${API_BASE}/attendance/my-records/`);

export const getAttendanceByCourseAndDate = (courseId: number, date: string) =>
  api.get<StudentAttendanceRecord[]>(`${API_BASE}/attendance/?course=${courseId}&date=${date}`);

export const getAttendanceCourseSummary = (courseId: number, date: string) =>
  api.get<AdminCourseAttendanceSummary>(
    `${API_BASE}/attendance/course-summary/?course=${courseId}&date=${date}`
  );

export const createAttendanceRecord = (data: FormData) =>
  api.post(`${API_BASE}/attendance/`, data);

export const updateAttendanceRecord = (attendanceId: number, data: FormData) =>
  api.patch(`${API_BASE}/attendance/${attendanceId}/`, data);
