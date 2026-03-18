import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

interface Assignment {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  periodo: number;
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
  const [periodo, setPeriodo] = useState("1");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.titulo);
      setDescription(assignmentToEdit.descripcion || "");
      setDueDate(assignmentToEdit.fecha_entrega);
      setPeriodo(String(assignmentToEdit.periodo ?? 1));
    } else {
      resetForm();
    }
  }, [assignmentToEdit]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPeriodo("1");
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
    data.append("periodo", periodo);

    if (file) {
      data.append("archivo", file);
    }

    try {
      if (assignmentToEdit) {
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
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
        <label>Periodo</label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          required
        >
          <option value="1">Periodo 1</option>
          <option value="2">Periodo 2</option>
          <option value="3">Periodo 3</option>
          <option value="4">Periodo 4</option>
        </select>
      </div>

      <div className="form-group">
        <label>Archivo PDF (opcional)</label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            if (selectedFile && !isPdfFile(selectedFile)) {
              setError("Solo se permiten archivos PDF.");
              e.currentTarget.value = "";
              setFile(null);
              return;
            }
            setError("");
            setFile(selectedFile);
          }}
        />
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
