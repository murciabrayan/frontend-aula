import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import LoadingModal from "@/components/LoadingModal";

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);
const GLOBAL_LOADING_START_EVENT = "app:loading-start";
const GLOBAL_LOADING_END_EVENT = "app:loading-end";
const GLOBAL_LOADING_DELAY_MS = 260;
const GLOBAL_LOADING_MAX_MS = 20000;

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [manualVisible, setManualVisible] = useState(false);
  const [globalVisible, setGlobalVisible] = useState(false);
  const [message, setMessage] = useState("Cargando...");
  const pendingRequestsRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);

  const showLoading = (msg?: string) => {
    setMessage(msg || "Cargando...");
    setManualVisible(true);
  };

  const hideLoading = () => {
    setManualVisible(false);
  };

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };

    const clearMaxTimer = () => {
      if (maxTimerRef.current) {
        window.clearTimeout(maxTimerRef.current);
        maxTimerRef.current = null;
      }
    };

    const resetGlobalLoading = () => {
      pendingRequestsRef.current = 0;
      clearShowTimer();
      clearMaxTimer();
      setGlobalVisible(false);
    };

    const handleGlobalStart = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      pendingRequestsRef.current += 1;
      setMessage(detail?.message || "Cargando información...");

      if (!maxTimerRef.current) {
        maxTimerRef.current = window.setTimeout(resetGlobalLoading, GLOBAL_LOADING_MAX_MS);
      }

      if (!globalVisible && !showTimerRef.current) {
        showTimerRef.current = window.setTimeout(() => {
          if (pendingRequestsRef.current > 0) {
            setGlobalVisible(true);
          }
          showTimerRef.current = null;
        }, GLOBAL_LOADING_DELAY_MS);
      }
    };

    const handleGlobalEnd = () => {
      pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
      if (pendingRequestsRef.current === 0) {
        clearShowTimer();
        clearMaxTimer();
        setGlobalVisible(false);
      }
    };

    window.addEventListener(GLOBAL_LOADING_START_EVENT, handleGlobalStart);
    window.addEventListener(GLOBAL_LOADING_END_EVENT, handleGlobalEnd);

    return () => {
      clearShowTimer();
      clearMaxTimer();
      window.removeEventListener(GLOBAL_LOADING_START_EVENT, handleGlobalStart);
      window.removeEventListener(GLOBAL_LOADING_END_EVENT, handleGlobalEnd);
    };
  }, [globalVisible]);

  const visible = manualVisible || globalVisible;

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && <LoadingModal message={message} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("⚠️ useLoading debe usarse dentro de un <LoadingProvider>");
  }
  return context;
};
