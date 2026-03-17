import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ⭐ NUEVO
import App from "./App.tsx";
import "./index.css";
import { LoadingProvider } from "@/context/LoadingContext";
import { FeedbackProvider } from "@/context/FeedbackContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="509271286435-fpgfh78rc1vunkjpeatolrndho8cn96t.apps.googleusercontent.com">
      <FeedbackProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </FeedbackProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
