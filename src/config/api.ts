const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL =
  rawApiUrl ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : "http://proyecto-aula-backend-env.eba-2bmwxmrx.us-east-2.elasticbeanstalk.com");

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
  "509271286435-fpgfh78rc1vunkjpeatolrndho8cn96t.apps.googleusercontent.com";
