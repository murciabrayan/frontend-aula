import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

interface Assignment {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
}

interface Props {
  subjectId: number;
  assignmentToEdit?: Assignment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignmentForm: React.FC<Props> = ({
  subjectId,
  assignmentToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  // 🔄 CARGAR DATOS SI ES EDICIÓN
  useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.titulo);
      setDescription(assignmentToEdit.descripcion || "");
      setDueDate(assignmentToEdit.fecha_entrega);
    }
  }, [assignmentToEdit]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("materia", String(subjectId));
    data.append("titulo", title);
    data.append("descripcion", description);
    data.append("fecha_entrega", dueDate);
    if (file) data.append("archivo", file);

    try {
      if (assignmentToEdit) {
        // ✏️ EDITAR
        await axios.put(
          `${API_BASE}/assignments/${assignmentToEdit.id}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // ➕ CREAR
        await axios.post(`${API_BASE}/assignments/`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al guardar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="assignment-form">
      <div className="form-group">
        <label>Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Fecha de entrega</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Archivo (opcional)</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      {error && <p className="msg error">{error}</p>}

      <div className="modal-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : assignmentToEdit
            ? "Guardar cambios"
            : "Crear tarea"}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;