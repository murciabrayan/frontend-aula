import api from "@/api/axios";

export const getCalendarEvents = async () => {
  const res = await api.get("/api/calendar/");
  return res.data;
};
