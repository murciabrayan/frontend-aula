export interface StudentProfile {
  id?: number;
  grado?: string;
  acudiente_nombre?: string;
  acudiente_cedula?: string;
  acudiente_telefono?: string;
  acudiente_email?: string;
}

export interface TeacherProfile {
  id?: number;
  especialidad?: string;
  titulo?: string;
}

export interface UserDocument {
  id?: number;
  title: string;
  category?: string;
  file_url?: string | null;
  uploaded_at?: string;
}

export interface User {
  id?: number;
  email: string;
  cedula: string;
  first_name: string;
  last_name: string;
  direccion?: string;
  rh?: string;
  password?: string;
  role: "ADMIN" | "STUDENT" | "TEACHER";
  is_active?: boolean;
  photo_url?: string | null;
  avatar_url?: string | null;
  avatar_style?: string;
  avatar_seed?: string;
  course_names?: string[];
  student_profile?: StudentProfile | null;
  teacher_profile?: TeacherProfile | null;
  documents?: UserDocument[];
}
