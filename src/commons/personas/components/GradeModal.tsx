import React from "react";

interface Props {
  calificacion: number;
  retroalimentacion?: string;
  onClose: () => void;
}

const GradeModal: React.FC<Props> = ({
  calificacion,
  retroalimentacion,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal premium" onClick={(e) => e.stopPropagation()}>
        <h3>📊 Calificación</h3>

        <div className="grade-box">
          <span className="grade-number">{calificacion}</span>
        </div>

        <div className="feedback-box">
          <h4>Retroalimentación</h4>
          <p>{retroalimentacion || "Sin retroalimentación."}</p>
        </div>

        <button className="btn-primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default GradeModal;