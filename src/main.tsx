import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google"; // NUEVO
import App from "./App.tsx";
import "./api/axios";
import "./index.css";
import { GOOGLE_CLIENT_ID } from "@/config/api";
import { LoadingProvider } from "@/context/LoadingContext";
import { FeedbackProvider } from "@/context/FeedbackContext";

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
