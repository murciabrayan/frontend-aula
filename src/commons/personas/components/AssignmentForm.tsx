import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

interface Props {
  courseId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignmentForm: React.FC<Props> = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("curso", String(courseId));
    data.append("titulo", formData.title);
    data.append("descripcion", formData.description);
    data.append("fecha_entrega", formData.due_date);
    if (formData.file) data.append("archivo", formData.file);

    try {
      await axios.post(`${API_BASE}/assignments/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al crear la tarea. Verifica los datos e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="assignment-form">
      <div className="form-group">
        <label>Título:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Descripción:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe brevemente la tarea..."
        />
      </div>

      <div className="form-group">
        <label>Fecha de entrega:</label>
        <input
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Archivo (opcional):</label>
        <input type="file" onChange={handleFileChange} />
      </div>

      {error && <p className="msg error">{error}</p>}

      <button type="submit" className="btn-primary full-btn" disabled={loading}>
        {loading ? "Guardando..." : "Guardar tarea"}
      </button>
    </form>
  );
};

export default AssignmentForm;
