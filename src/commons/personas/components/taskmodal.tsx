import React from "react";
import "../styles/taskModal.css";

interface Props {
  event: any;
  onClose: () => void;
  onGoToTask: () => void;
}

const TaskModal: React.FC<Props> = ({ event, onClose, onGoToTask }) => {
  const props = event.extendedProps;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="task-modal__header">
          <div>
            <h2>{event.title}</h2>
            <p className="task-modal__subtitle">Consulta la información principal de la actividad.</p>
          </div>

          <button type="button" className="task-modal__close" onClick={onClose} aria-label="Cerrar modal">
            x
          </button>
        </div>

        <div className="modal-info">
          <p><strong>Curso:</strong> {props.curso}</p>
          <p><strong>Materia:</strong> {props.materia}</p>
          <p><strong>Fecha de entrega:</strong> {event.startStr}</p>
        </div>

        {props.descripcion && (
          <div className="modal-description">
            {props.descripcion}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>

          <button className="btn-primary" onClick={onGoToTask}>
            Ir a la tarea
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
