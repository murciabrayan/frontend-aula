import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import "@/commons/personas/styles/feedback.css";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
}

interface ToastItem extends Required<Omit<ToastOptions, "duration">> {
  id: number;
  duration: number;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface FeedbackContextValue {
  showToast: (options: ToastOptions) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const iconByType = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  warning: TriangleAlert,
};

const defaultTitleByType: Record<ToastType, string> = {
  success: "Listo",
  error: "Ocurrio un problema",
  info: "Aviso",
  warning: "Atencion",
};

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const idRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 3600 }: ToastOptions) => {
      const id = ++idRef.current;
      const toast: ToastItem = {
        id,
        type,
        title: title || defaultTitleByType[type],
        message,
        duration,
      };

      setToasts((current) => [...current, toast]);
      window.setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        ...options,
        resolve,
      });
    });
  }, []);

  const closeConfirm = (value: boolean) => {
    if (!confirmState) return;
    confirmState.resolve(value);
    setConfirmState(null);
  };

  const value = useMemo(
    () => ({
      showToast,
      confirm,
    }),
    [showToast, confirm]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="feedback-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = iconByType[toast.type];

          return (
            <div
              key={toast.id}
              className={`feedback-toast feedback-toast--${toast.type}`}
            >
              <div className="feedback-toast__icon">
                <Icon size={18} />
              </div>

              <div className="feedback-toast__body">
                <strong>{toast.title}</strong>
                <p>{toast.message}</p>
              </div>

              <button
                type="button"
                className="feedback-toast__close"
                onClick={() => dismissToast(toast.id)}
                aria-label="Cerrar aviso"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {confirmState ? (
        <div className="feedback-confirm__overlay" onClick={() => closeConfirm(false)}>
          <div
            className="feedback-confirm"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`feedback-confirm__badge ${
                confirmState.tone === "danger"
                  ? "feedback-confirm__badge--danger"
                  : ""
              }`}
            >
              <TriangleAlert size={18} />
            </div>

            <h3>{confirmState.title}</h3>
            <p>{confirmState.message}</p>

            <div className="feedback-confirm__actions">
              <button
                type="button"
                className="feedback-btn feedback-btn--secondary"
                onClick={() => closeConfirm(false)}
              >
                {confirmState.cancelText || "Cancelar"}
              </button>
              <button
                type="button"
                className={`feedback-btn ${
                  confirmState.tone === "danger"
                    ? "feedback-btn--danger"
                    : "feedback-btn--primary"
                }`}
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback debe usarse dentro de un FeedbackProvider");
  }

  return context;
};
