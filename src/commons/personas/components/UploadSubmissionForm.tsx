import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

interface Props {
  assignmentId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadSubmissionForm: React.FC<Props> = ({ assignmentId, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecciona un archivo para subir.");
      return;
    }

    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("tarea", String(assignmentId));
    data.append("archivo", file);

    try {
      await axios.post(`${API_BASE}/submissions/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Error al subir la entrega. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="assignment-form">
      <label>Archivo de la entrega:</label>
      <input type="file" onChange={handleFileChange} required />

      {error && <p className="msg error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Subiendo..." : "Enviar entrega"}
      </button>
    </form>
  );
};

export default UploadSubmissionForm;
