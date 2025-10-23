import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/courses/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ✅ Obtener todos los cursos
export const getCourses = async () => {
  return axios.get(API_URL, getAuthHeaders());
};

export const createCourse = async (data: any) => {
  return axios.post(API_URL, data, getAuthHeaders());
};


export const updateCourse = async (id: number, data: any) => {
  return axios.patch(`${API_URL}${id}/`, data, getAuthHeaders());
};


export const deleteCourse = async (id: number) => {
  return axios.delete(`${API_URL}${id}/`, getAuthHeaders());
};
// al inicio ya tienes axios y API_URL...
export const addStudents = async (courseId: number, studentIds: number[]) => {
  return axios.post(`${API_URL}${courseId}/add-students/`, { students: studentIds }, getAuthHeaders());
};

export const removeStudent = async (courseId: number, studentId: number) => {
  return axios.post(`${API_URL}${courseId}/remove-student/`, { student: studentId }, getAuthHeaders());
};

export const removeTeacher = async (courseId: number) => {
  return axios.post(`${API_URL}${courseId}/remove-teacher/`, {}, getAuthHeaders());
};

