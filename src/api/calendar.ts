import axios from "axios";

const API_URL = "http://localhost:8000/api/calendar/";

export const getCalendarEvents = async () => {
  const token = localStorage.getItem("access_token");

  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};