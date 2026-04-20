import api from "@/api/axios";

export interface PermissionLetterRecipient {
  id: number;
  student: number;
  student_name: string;
  student_email: string;
  student_document: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  responded_at: string | null;
  signed_document_url?: string | null;
  user_document?: {
    id?: number;
    title: string;
    category?: string;
    file_url?: string | null;
    uploaded_at?: string;
  } | null;
}

export interface PermissionLetter {
  id: number;
  title: string;
  description: string;
  course: number;
  course_name: string;
  document_url?: string | null;
  created_at: string;
  updated_at: string;
  accepted_count: number;
  rejected_count: number;
  pending_count: number;
  recipients: PermissionLetterRecipient[];
}

export interface StudentPermissionLetter {
  id: number;
  permission_letter_id: number;
  title: string;
  description: string;
  course_name: string;
  document_url?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  responded_at: string | null;
  signed_document_url?: string | null;
}

export const getPermissionLetters = async () => {
  const response = await api.get<PermissionLetter[]>("/api/permission-letters/");
  return response.data;
};

export const createPermissionLetter = async (payload: FormData) => {
  const response = await api.post<PermissionLetter>("/api/permission-letters/", payload);
  return response.data;
};

export const deletePermissionLetter = async (letterId: number) => {
  await api.delete(`/api/permission-letters/${letterId}/`);
};

export const getStudentPermissionLetters = async () => {
  const response = await api.get<StudentPermissionLetter[]>("/api/student/permission-letters/");
  return response.data;
};

export const respondPermissionLetter = async (
  recipientId: number,
  action: "ACCEPT" | "REJECT"
) => {
  const response = await api.post<{ message: string; item: StudentPermissionLetter }>(
    `/api/student/permission-letters/${recipientId}/respond/`,
    { action },
  );
  return response.data;
};
