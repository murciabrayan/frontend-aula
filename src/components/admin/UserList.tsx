import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowRight, GraduationCap, Search, UserPlus2, Users } from "lucide-react";
import { useFeedback } from "@/context/FeedbackContext";
import UserForm from "./UserForm";
import UserProfileModal from "./UserProfileModal";
import "./UserManagement.css";
import type { User } from "../../types/User";

const UserList = () => {
  const { showToast } = useFeedback();
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = () => localStorage.getItem("access") || localStorage.getItem("access_token");

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = "/";
      return [];
    }

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      return response.data as User[];
    } catch (err: any) {
      if (err.response?.status === 401) {
        showToast({
          type: "warning",
          title: "Sesion expirada",
          message: "Tu sesion ha expirado. Por favor inicia sesion nuevamente.",
        });
        localStorage.clear();
        window.location.href = "/";
      } else {
        showToast({
          type: "error",
          title: "Usuarios",
          message: "No se pudieron cargar los usuarios.",
        });
      }
      return [];
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => user.role === filterRole)
      .filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email} ${user.cedula}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
  }, [users, filterRole, searchTerm]);

  return (
    <section className="user-workspace">
      <div className="user-workspace__hero">
        <div>
          <p className="user-workspace__eyebrow">Gestion de usuarios</p>
          <h2>{filterRole === "STUDENT" ? "Estudiantes" : "Docentes"}</h2>
          <p>
            Consulta el listado, abre cada perfil para actualizar informacion y administra
            documentos sin mezclarlo todo en la misma tabla.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setSelectedUser(null);
          }}
        >
          <UserPlus2 size={16} />
          <span>Agregar {filterRole === "STUDENT" ? "estudiante" : "docente"}</span>
        </button>
      </div>

      <div className="user-toolbar">
        <div className="user-toolbar__tabs">
          <button
            className={`btn ${filterRole === "STUDENT" ? "btn-active" : ""}`}
            onClick={() => setFilterRole("STUDENT")}
          >
            <GraduationCap size={16} />
            <span>Estudiantes</span>
          </button>
          <button
            className={`btn ${filterRole === "TEACHER" ? "btn-active" : ""}`}
            onClick={() => setFilterRole("TEACHER")}
          >
            <Users size={16} />
            <span>Docentes</span>
          </button>
        </div>

        <label className="user-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o documento"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      <div className="user-card-grid">
        {filteredUsers.length ? (
          filteredUsers.map((user) => (
            <article key={user.id} className="user-card">
              <div className="user-card__identity">
                <div className="user-card__avatar">
                  {user.avatar_url ? <img src={user.avatar_url} alt={user.first_name} /> : <Users size={24} />}
                </div>
                <div>
                  <span className="user-card__role">
                    {user.role === "STUDENT" ? "Estudiante" : "Docente"}
                  </span>
                  <h3>
                    {user.first_name} {user.last_name}
                  </h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="user-card__meta">
                <div>
                  <span>Documento</span>
                  <strong>{user.cedula}</strong>
                </div>
                <div>
                  <span>{user.role === "STUDENT" ? "Grado" : "Especialidad"}</span>
                  <strong>
                    {user.role === "STUDENT"
                      ? user.student_profile?.grado || "Sin definir"
                      : user.teacher_profile?.especialidad || "Sin definir"}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="btn user-card__action"
                onClick={() => setSelectedUser(user)}
              >
                <span>Abrir perfil</span>
                <ArrowRight size={16} />
              </button>
            </article>
          ))
        ) : (
          <div className="user-empty">
            No hay usuarios registrados para este filtro.
          </div>
        )}
      </div>

      {showForm ? (
        <UserForm
          user={null}
          role={filterRole}
          onClose={() => setShowForm(false)}
          onSave={fetchUsers}
        />
      ) : null}

      {selectedUser ? (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={async () => {
            const refreshedUsers = await fetchUsers();
            const updated = refreshedUsers.find((item) => item.id === selectedUser.id) || null;
            setSelectedUser(updated);
          }}
        />
      ) : null}
    </section>
  );
};

export default UserList;
