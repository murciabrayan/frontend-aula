import axios from "axios";

import api from "@/api/axios";
import { API_BASE_URL } from "@/config/api";

const publicLandingApi = axios.create({
  baseURL: API_BASE_URL,
});

export interface LandingNewsItem {
  id: number;
  title: string;
  summary: string;
  published_at: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface LandingGalleryItem {
  id: number;
  title: string;
  detail: string;
  event_date: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface LandingDocumentItem {
  id: number;
  title: string;
  description: string;
  file_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface LandingCalendarEntry {
  id: number;
  title: string;
  detail: string;
  event_date: string;
  display_order: number;
  is_active: boolean;
}

export interface LandingContentPayload {
  news: LandingNewsItem[];
  gallery: LandingGalleryItem[];
  documents: LandingDocumentItem[];
  calendar_entries: LandingCalendarEntry[];
}

export interface LandingContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const fetchLandingContent = async () => {
  const response = await publicLandingApi.get<LandingContentPayload>("/api/landing/content/");
  return response.data;
};

export const sendLandingContactMessage = async (payload: LandingContactPayload) => {
  const response = await publicLandingApi.post("/api/landing/contact/", payload);
  return response.data;
};

const buildMultipartPayload = (payload: Record<string, FormDataEntryValue | null | undefined>) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
};

export const createLandingNews = async (payload: Record<string, FormDataEntryValue | null | undefined>) => {
  const response = await api.post("/api/landing/news/", buildMultipartPayload(payload));
  return response.data;
};

export const updateLandingNews = async (
  id: number,
  payload: Record<string, FormDataEntryValue | null | undefined>,
) => {
  const response = await api.patch(`/api/landing/news/${id}/`, buildMultipartPayload(payload));
  return response.data;
};

export const deleteLandingNews = async (id: number) => {
  await api.delete(`/api/landing/news/${id}/`);
};

export const createLandingGalleryItem = async (
  payload: Record<string, FormDataEntryValue | null | undefined>,
) => {
  const response = await api.post("/api/landing/gallery/", buildMultipartPayload(payload));
  return response.data;
};

export const updateLandingGalleryItem = async (
  id: number,
  payload: Record<string, FormDataEntryValue | null | undefined>,
) => {
  const response = await api.patch(`/api/landing/gallery/${id}/`, buildMultipartPayload(payload));
  return response.data;
};

export const deleteLandingGalleryItem = async (id: number) => {
  await api.delete(`/api/landing/gallery/${id}/`);
};

export const createLandingDocument = async (
  payload: Record<string, FormDataEntryValue | null | undefined>,
) => {
  const response = await api.post("/api/landing/documents/", buildMultipartPayload(payload));
  return response.data;
};

export const updateLandingDocument = async (
  id: number,
  payload: Record<string, FormDataEntryValue | null | undefined>,
) => {
  const response = await api.patch(`/api/landing/documents/${id}/`, buildMultipartPayload(payload));
  return response.data;
};

export const deleteLandingDocument = async (id: number) => {
  await api.delete(`/api/landing/documents/${id}/`);
};

export const createLandingCalendarEntry = async (payload: Record<string, string | number | boolean>) => {
  const response = await api.post("/api/landing/calendar/", payload);
  return response.data;
};

export const updateLandingCalendarEntry = async (
  id: number,
  payload: Record<string, string | number | boolean>,
) => {
  const response = await api.patch(`/api/landing/calendar/${id}/`, payload);
  return response.data;
};

export const deleteLandingCalendarEntry = async (id: number) => {
  await api.delete(`/api/landing/calendar/${id}/`);
};
