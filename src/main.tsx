import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google"; // NUEVO
import App from "./App.tsx";
import "./api/axios";
import "./index.css";
import { GOOGLE_CLIENT_ID } from "@/config/api";
import { LoadingProvider } from "@/context/LoadingContext";
import { FeedbackProvider } from "@/context/FeedbackContext";

// MANPROG_CAPTURA_FRONT_MAIN_INICIO: punto de entrada del frontend con proveedores globales y arranque de React.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <FeedbackProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </FeedbackProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
// MANPROG_CAPTURA_FRONT_MAIN_FIN
