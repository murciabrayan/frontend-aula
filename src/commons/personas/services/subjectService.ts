import api from "../../../api/axios";

export const getSubjectsByCourse = (courseId: number) =>
  api.get(`/api/subjects/?course=${courseId}`);

export const createSubject = (data: {
  nombre: string;
  curso: number;
}) => api.post("/api/subjects/", data);

export const deleteSubject = (id: number) =>
  api.delete(`/api/subjects/${id}/`);