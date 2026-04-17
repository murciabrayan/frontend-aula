import React from "react";
import logo from "@/assets/logo.png";

interface LoadingModalProps {
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ message = "Cargando..." }) => {
  return (
    <div className="app-loader-overlay" role="status" aria-live="polite">
      <div className="app-loader-panel">
        <div className="app-loader-emblem" aria-hidden="true">
          <span className="app-loader-ring" />
          <img src={logo} alt="" className="app-loader-logo app-loader-logo--base" />
          <img src={logo} alt="" className="app-loader-logo app-loader-logo--fill" />
        </div>

        <p className="app-loader-title">{message}</p>
        <div className="app-loader-bar" aria-hidden="true">
          <span />
        </div>
      </div>

      <style>
        {`
          .app-loader-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: rgba(17, 24, 39, 0.42);
            backdrop-filter: blur(5px);
            animation: appLoaderFadeIn 180ms ease-out;
          }

          .app-loader-panel {
            width: min(320px, 100%);
            min-height: 210px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 28px 26px;
            border: 1px solid rgba(201, 162, 39, 0.52);
            border-radius: 8px;
            background:
              linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 238, 0.98) 100%);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
            animation: appLoaderScaleIn 180ms ease-out;
          }

          .app-loader-emblem {
            position: relative;
            width: 92px;
            height: 92px;
            display: grid;
            place-items: center;
          }

          .app-loader-ring {
            position: absolute;
            inset: 0;
            border-radius: 999px;
            border: 3px solid rgba(201, 162, 39, 0.18);
            border-top-color: #c9a227;
            border-right-color: #7c5a13;
            animation: appLoaderSpin 950ms linear infinite;
          }

          .app-loader-logo {
            position: absolute;
            width: 66px;
            height: 66px;
            object-fit: contain;
          }

          .app-loader-logo--base {
            filter: grayscale(1);
            opacity: 0.28;
          }

          .app-loader-logo--fill {
            animation: appLoaderShieldFill 1.35s ease-in-out infinite;
          }

          .app-loader-title {
            margin: 0;
            color: #6b4c1e;
            font-size: 0.95rem;
            font-weight: 800;
            letter-spacing: 0;
            text-align: center;
          }

          .app-loader-bar {
            width: 168px;
            height: 6px;
            overflow: hidden;
            border-radius: 8px;
            background: rgba(201, 162, 39, 0.16);
          }

          .app-loader-bar span {
            display: block;
            width: 42%;
            height: 100%;
            border-radius: 8px;
            background: linear-gradient(90deg, #7c5a13 0%, #c9a227 52%, #f0d985 100%);
            animation: appLoaderBar 1.05s ease-in-out infinite;
          }

          @keyframes appLoaderFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes appLoaderScaleIn {
            from { transform: scale(0.97); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          @keyframes appLoaderSpin {
            to { transform: rotate(360deg); }
          }

          @keyframes appLoaderShieldFill {
            0% { clip-path: inset(100% 0 0 0); opacity: 0.55; }
            45% { clip-path: inset(0 0 0 0); opacity: 1; }
            100% { clip-path: inset(0 0 0 0); opacity: 0.86; }
          }

          @keyframes appLoaderBar {
            0% { transform: translateX(-110%); }
            50% { transform: translateX(70%); }
            100% { transform: translateX(260%); }
          }

          @media (prefers-reduced-motion: reduce) {
            .app-loader-overlay,
            .app-loader-panel,
            .app-loader-ring,
            .app-loader-logo--fill,
            .app-loader-bar span {
              animation: none;
            }

            .app-loader-logo--fill {
              clip-path: inset(0 0 0 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingModal;
