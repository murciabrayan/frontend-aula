import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";

export const usePageLoader = () => {
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    showLoading("Cargando módulo...");
    const timer = setTimeout(() => {
      hideLoading();
    }, 600); // medio segundo de carga simulada
    return () => clearTimeout(timer);
  }, [location.pathname]);
};
