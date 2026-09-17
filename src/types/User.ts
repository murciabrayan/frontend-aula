export type Parentesco =
  | "MADRE"
  | "PADRE"
  | "TIO"
  | "TIA"
  | "ABUELO"
  | "ABUELA"
  | "HERMANO"
  | "HERMANA"
  | "CONOCIDO"
  | "";

export const PARENTESCO_OPTIONS: { value: Exclude<Parentesco, "">; label: string }[] = [
  { value: "MADRE", label: "Madre" },
  { value: "PADRE", label: "Padre" },
  { value: "TIO", label: "Tío" },
  { value: "TIA", label: "Tía" },
  { value: "ABUELO", label: "Abuelo" },
  { value: "ABUELA", label: "Abuela" },
  { value: "HERMANO", label: "Hermano" },
  { value: "HERMANA", label: "Hermana" },
  { value: "CONOCIDO", label: "Conocido" },
];

export interface StudentProfile {
  id?: number;
  grado?: string;
  acudiente_nombre?: string;
  acudiente_cedula?: string;
  acudiente_telefono?: string;
  acudiente_email?: string;
  acudiente_parentesco?: Parentesco;
  acudiente2_nombre?: string;
  acudiente2_cedula?: string;
  acudiente2_telefono?: string;
  acudiente2_email?: string;
  acudiente2_parentesco?: Parentesco;
}

export interface TeacherProfile {
  id?: number;
  especialidad?: string;
  titulo?: string;
  telefono?: string;
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
  login_identifier?: string;
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

export interface GeneratedCredentials {
  full_name: string;
  role: "ADMIN" | "STUDENT" | "TEACHER";
  login_identifier: string;
  temporary_password: string;
  delivery_channel?: "manual" | "email";
}
