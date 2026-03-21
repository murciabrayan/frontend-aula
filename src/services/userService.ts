import api from "@/api/axios";

const API_URL = "/api/users/";

export const getTeachers = async () => api.get(`${API_URL}?role=teacher`);

export const getStudents = async () => api.get(`${API_URL}?role=student`);
