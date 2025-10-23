import React, { useEffect, useState } from "react";
import axios from "axios";
import UserForm from "./UserForm";
import "./UserManagement.css";
import type { User } from "../../types/User"; 


const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 🔑 Obtener token desde localStorage
  const getToken = () => {
    return localStorage.getItem("access") || localStorage.getItem("access_token");
  };

  // 🚀 Cargar usuarios
  const fetchUsers = () => {
    const token = getToken();
    if (!token) {
      console.warn("No hay token, redirigiendo al login...");
      window.location.href = "/";
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
        if (err.response?.status === 401) {
          alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
          localStorage.clear();
          window.location.href = "/";
        }
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🧮 Filtrar usuarios por rol
  const filteredUsers = users.filter((u) => u.role === filterRole);

  // 🗑 Eliminar usuario
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    const token = getToken();
    if (!token) {
      alert("Sesión no válida, inicia sesión de nuevo.");
      window.location.href = "/";
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      if (err.response?.status === 401) {
        alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="user-container">
      <h2 className="section-title">
        Gestión de {filterRole === "STUDENT" ? "Estudiantes" : "Docentes"}
      </h2>

      <div className="filter-bar">
        <button
          className={`btn ${filterRole === "STUDENT" ? "btn-active" : ""}`}
          onClick={() => setFilterRole("STUDENT")}
        >
          Estudiantes
        </button>
        <button
          className={`btn ${filterRole === "TEACHER" ? "btn-active" : ""}`}
          onClick={() => setFilterRole("TEACHER")}
        >
          Docentes
        </button>
        <button
          className="btn btn-primary right"
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
        >
          + Agregar
        </button>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Cédula</th>
            {filterRole === "TEACHER" && <th>Especialidad</th>}
            {filterRole === "STUDENT" && <th>Acudiente</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>{user.email}</td>
                <td>{user.cedula}</td>
                {filterRole === "TEACHER" && (
                  <td>{user.teacher_profile?.especialidad || "—"}</td>
                )}
                {filterRole === "STUDENT" && (
                  <td>{user.student_profile?.acudiente || "—"}</td>
                )}
                <td>
                  <button
                    className="btn btn-edit"
                    onClick={() => {
                      setEditingUser(user);
                      setShowForm(true);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => user.id && handleDelete(user.id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No hay usuarios registrados.</td>
            </tr>
          )}
        </tbody>
      </table>

      {showForm && (
        <UserForm
          user={editingUser as User | null} // ✅ evita el error de tipado
          role={filterRole}
          onClose={() => setShowForm(false)}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserList;
