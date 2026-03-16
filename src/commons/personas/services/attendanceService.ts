import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const getMultipartHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface TeacherAttendanceStudent {
  id: number;
  student_name: string;
  attendance_id: number | null;
  status: "PRESENT" | "ABSENT" | "LATE";
  is_justified: boolean;
  justification_type: string;
  notes: string;
  periodo: number;
  attachment_url: string | null;
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
  attachment: string | null;
  attachment_url: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
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

export const getTeacherAttendanceByDate = (date: string) => {
  return axios.get<TeacherAttendanceDayResponse>(
    `${API_BASE}/attendance/teacher/course-day/?date=${date}`,
    {
      headers: getAuthHeaders(),
    }
  );
};

export const saveTeacherAttendanceBulk = (data: BulkAttendancePayload) => {
  return axios.post(`${API_BASE}/attendance/teacher/bulk-save/`, data, {
    headers: getAuthHeaders(),
  });
};

export const getMyAttendanceRecords = () => {
  return axios.get<StudentAttendanceRecord[]>(
    `${API_BASE}/attendance/my-records/`,
    {
      headers: getAuthHeaders(),
    }
  );
};

export const getAttendanceByCourseAndDate = (courseId: number, date: string) => {
  return axios.get<StudentAttendanceRecord[]>(
    `${API_BASE}/attendance/?course=${courseId}&date=${date}`,
    {
      headers: getAuthHeaders(),
    }
  );
};

export const getAttendanceCourseSummary = (courseId: number, date: string) => {
  return axios.get<AdminCourseAttendanceSummary>(
    `${API_BASE}/attendance/course-summary/?course=${courseId}&date=${date}`,
    {
      headers: getAuthHeaders(),
    }
  );
};

export const createAttendanceRecord = (data: FormData) => {
  return axios.post(`${API_BASE}/attendance/`, data, {
    headers: getMultipartHeaders(),
  });
};

export const updateAttendanceRecord = (attendanceId: number, data: FormData) => {
  return axios.patch(`${API_BASE}/attendance/${attendanceId}/`, data, {
    headers: getMultipartHeaders(),
  });
};