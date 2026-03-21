import api from "@/api/axios";

const API_URL = "/api/courses/";

export const getCourses = async () => api.get(API_URL);

export const createCourse = async (data: any) => api.post(API_URL, data);

export const updateCourse = async (id: number, data: any) =>
  api.patch(`${API_URL}${id}/`, data);

export const deleteCourse = async (id: number) => api.delete(`${API_URL}${id}/`);

export const addStudents = async (courseId: number, studentIds: number[]) =>
  api.post(`${API_URL}${courseId}/add-students/`, { students: studentIds });

export const removeStudent = async (courseId: number, studentId: number) =>
  api.post(`${API_URL}${courseId}/remove-student/`, { student: studentId });

export const removeTeacher = async (courseId: number) =>
  api.post(`${API_URL}${courseId}/remove-teacher/`, {});
