import { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import { ArrowRight, GraduationCap, Search, Trash2, UserPlus2, Users } from "lucide-react";
import { useFeedback } from "@/context/FeedbackContext";
import StyledSelect from "@/components/StyledSelect";
import UserForm from "./UserForm";
import UserProfileModal from "./UserProfileModal";
import "./UserManagement.css";
import type { User } from "../../types/User";

const UserList = () => {
  const { showToast, confirm } = useFeedback();
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("TODOS");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/");
      setUsers(response.data);
      return response.data as User[];
    } catch (err: any) {
      if (err.response?.status === 401) {
        showToast({
          type: "warning",
          title: "Sesion expirada",
          message: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
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
        courseFilter === "TODOS"
          ? true
          : (user.course_names || []).includes(courseFilter),
      )
      .filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email} ${user.cedula} ${(user.course_names || []).join(" ")}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
  }, [users, filterRole, searchTerm, courseFilter]);

  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    users
      .filter((user) => user.role === filterRole)
      .forEach((user) => {
        (user.course_names || []).forEach((courseName) => {
          if (courseName?.trim()) set.add(courseName);
        });
      });

    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [users, filterRole]);

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirm({
      title: "Eliminar usuario",
      message: `Se eliminará a ${user.first_name} ${user.last_name}. Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      await api.delete(`/api/users/${user.id}/`);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
      showToast({
        type: "success",
        title: "Usuario eliminado",
        message: "El usuario fue eliminado correctamente.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Eliminar usuario",
        message: "No se pudo eliminar el usuario.",
      });
    }
  };

  return (
    <section className="user-workspace">
      <div className="user-workspace__hero">
        <div>
          <p className="user-workspace__eyebrow">Gestión de usuarios</p>
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
            onClick={() => {
              setFilterRole("STUDENT");
              setCourseFilter("TODOS");
            }}
          >
            <GraduationCap size={16} />
            <span>Estudiantes</span>
          </button>
          <button
            className={`btn ${filterRole === "TEACHER" ? "btn-active" : ""}`}
            onClick={() => {
              setFilterRole("TEACHER");
              setCourseFilter("TODOS");
            }}
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

        <div className="user-search user-search--select">
          <GraduationCap size={16} />
          <StyledSelect value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <option value="TODOS">Todos los cursos</option>
            {availableCourses.map((courseName) => (
              <option key={courseName} value={courseName}>
                {courseName}
              </option>
            ))}
          </StyledSelect>
        </div>
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
                  <span>Curso</span>
                  <strong>{user.course_names?.join(", ") || "Sin asignar"}</strong>
                </div>
              </div>

              <div className="user-card__actions">
                <button
                  type="button"
                  className="btn user-card__action"
                  onClick={() => setSelectedUser(user)}
                >
                  <span>Abrir perfil</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn user-card__delete"
                  onClick={() => void handleDeleteUser(user)}
                >
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              </div>
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
