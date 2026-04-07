import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, PenLine, Upload, X } from "lucide-react";

import logo from "@/assets/logo.png";
import {
  acceptDataPolicy,
  getCurrentUser,
  getDataPolicyStatus,
  getNextAuthRoute,
  logoutUser,
  type DataPolicyStatusResponse,
} from "@/commons/Auth/services/auth.service";
import "@/commons/Auth/styles/dataPolicy.css";

type SignatureMode = "draw" | "upload";

const CANVAS_WIDTH = 680;
const CANVAS_HEIGHT = 220;

const DataPolicyConsentScreen = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const drawingRef = useRef(false);

  const [statusData, setStatusData] = useState<DataPolicyStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/plataforma", { replace: true });
      return;
    }

    if (currentUser.has_accepted_data_policy) {
      navigate(getNextAuthRoute(currentUser), { replace: true });
      return;
    }

    const loadStatus = async () => {
      try {
        const response = await getDataPolicyStatus();
        setStatusData(response);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.error ||
            "No fue posible cargar la autorizacion de tratamiento de datos.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadStatus();
  }, [currentUser, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.2;
    context.strokeStyle = "#111111";
  }, []);

  const signerSummary = useMemo(() => {
    if (!statusData) return "";
    return `${statusData.signer_role}: ${statusData.signer_name} | Documento: ${statusData.signer_document}`;
  }, [statusData]);

  const getCanvasCoordinates = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const { x, y } = getCanvasCoordinates(event);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const { x, y } = getCanvasCoordinates(event);
    context.lineTo(x, y);
    context.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    setHasDrawnSignature(false);
    setErrorMessage("");
  };

  const getSignatureFileFromCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnSignature) return null;

    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(new File([blob], "firma-tratamiento-datos.png", { type: "image/png" }));
      }, "image/png");
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (!accepted) {
      setErrorMessage("Debes aceptar la autorizacion para continuar.");
      return;
    }

    let fileToSend = signatureFile;
    if (signatureMode === "draw") {
      fileToSend = await getSignatureFileFromCanvas();
    }

    if (!fileToSend) {
      setErrorMessage(
        signatureMode === "draw"
          ? "Debes firmar en el recuadro antes de continuar."
          : "Debes subir una imagen de firma para continuar.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await acceptDataPolicy(fileToSend);
      navigate(getNextAuthRoute(getCurrentUser()), { replace: true });
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error ||
          "No fue posible registrar la aceptacion de tratamiento de datos.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="data-policy-loading">Cargando autorizacion...</div>;
  }

  return (
    <div className="data-policy-page">
      <button
        type="button"
        className="data-policy-exit"
        onClick={() => {
          logoutUser();
          navigate("/plataforma");
        }}
      >
        Salir
      </button>

      <div className="data-policy-page__inner">
        <header className="data-policy-header">
          <img src={logo} alt="Logo Institucional" className="data-policy-header__logo" />
          <div className="data-policy-header__copy">
            <div className="data-policy-header__eyebrow">Proceso obligatorio de ingreso</div>
            <div className="data-policy-header__institution">
              <strong>GIMNASIO LOS CERROS</strong>
              <div>Autorizacion de tratamiento de datos</div>
            </div>
          </div>
        </header>

        <section className="data-policy-card">
          <div className="data-policy-card__intro">
            <h1>{statusData?.title || "Tratamiento de datos personales"}</h1>
            <p className="data-policy-intro">
              Antes de ingresar a la plataforma debes leer y aceptar la politica de tratamiento
              de datos personales. El documento firmado quedara guardado automaticamente en el
              perfil del usuario.
            </p>
          </div>

          <div className="data-policy-letter">
            <div className="data-policy-letter__meta">
              <strong>{statusData?.institution_name}</strong>
              <span>Version {statusData?.version}</span>
            </div>

            {statusData?.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            <div className="data-policy-letter__signer">
              <strong>Firmante autorizado</strong>
              <span>{signerSummary}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="data-policy-form">
            <div className="data-policy-mode-switch">
              <button
                type="button"
                className={`data-policy-mode ${signatureMode === "draw" ? "is-active" : ""}`}
                onClick={() => {
                  setSignatureMode("draw");
                  setErrorMessage("");
                }}
              >
                <PenLine size={16} />
                <span>Firmar aqui</span>
              </button>
              <button
                type="button"
                className={`data-policy-mode ${signatureMode === "upload" ? "is-active" : ""}`}
                onClick={() => {
                  setSignatureMode("upload");
                  setErrorMessage("");
                }}
              >
                <Upload size={16} />
                <span>Subir firma</span>
              </button>
            </div>

            {signatureMode === "draw" ? (
              <div className="data-policy-signature-pad">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                />
                <div className="data-policy-signature-pad__actions">
                  <span>Dibuja la firma del firmante autorizado con mouse o pantalla tactil.</span>
                  <button type="button" className="data-policy-link" onClick={clearCanvas}>
                    Limpiar firma
                  </button>
                </div>
              </div>
            ) : (
              <div className="data-policy-upload-box">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(event) => {
                    setSignatureFile(event.target.files?.[0] || null);
                    setErrorMessage("");
                  }}
                />
                <div className="data-policy-upload-box__info">
                  <Download size={16} />
                  <span>
                    {signatureFile
                      ? signatureFile.name
                      : "Sube una imagen PNG o JPG con la firma del firmante autorizado."}
                  </span>
                </div>
              </div>
            )}

            <label className="data-policy-checkbox">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                Confirmo que he leido, comprendido y acepto la autorizacion de tratamiento
                de datos personales.
              </span>
            </label>

            {errorMessage ? <div className="error-message">{errorMessage}</div> : null}

            <div className="data-policy-actions">
              <button
                type="button"
                className="data-policy-secondary"
                onClick={() => {
                  logoutUser();
                  navigate("/plataforma");
                }}
              >
                <X size={16} />
                <span>Salir</span>
              </button>

              <button type="submit" className="data-policy-submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Aceptar y continuar"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default DataPolicyConsentScreen;
