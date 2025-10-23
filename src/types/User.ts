export interface StudentProfile {
  id?: number;
  grado?: string;
  acudiente?: string;
  acudiente_nombre?: string;
  acudiente_telefono?: string;
  acudiente_email?: string;
}

export interface TeacherProfile {
  id?: number;
  especialidad?: string;
  titulo?: string;
}

export interface User {
  id?: number;
  email: string;
  cedula: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: "STUDENT" | "TEACHER";
  is_active?: boolean;
  student_profile?: StudentProfile | null;
  teacher_profile?: TeacherProfile | null;
}
