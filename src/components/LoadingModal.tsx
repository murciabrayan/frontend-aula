import React from "react";

interface LoadingModalProps {
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ message = "Cargando..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center space-y-4 border border-[#c9a437] animate-scaleIn">
        {/* Spinner dorado */}
        <div className="w-10 h-10 border-4 border-[#c9a437] border-t-transparent rounded-full animate-spin"></div>

        {/* Mensaje */}
        <p className="text-[#6b4c1e] text-sm font-semibold tracking-wide">
          {message}
        </p>
      </div>

      {/* Animaciones personalizadas */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.25s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default LoadingModal;
