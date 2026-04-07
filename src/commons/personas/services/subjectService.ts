import api from "../../../api/axios";

export const getSubjectsByCourse = (courseId: number) =>
  api.get(`/api/subjects/?course=${courseId}`);

export const createSubject = (data: {
  nombre: string;
  curso: number;
  area?: number | null;
  teacher?: number | null;
}) =>
  api.post("/api/subjects/", data);

export const updateSubject = (
  id: number,
  data: {
    nombre?: string;
    area?: number | null;
    teacher?: number | null;
  }
) =>
  api.patch(`/api/subjects/${id}/`, data);

export const deleteSubject = (id: number) =>
  api.delete(`/api/subjects/${id}/`);
