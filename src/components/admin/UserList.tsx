import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/api/axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  GraduationCap,
  Search,
  Sheet,
  Trash2,
  Upload,
  UserPlus2,
  Users,
  X,
} from "lucide-react";
import { useFeedback } from "@/context/FeedbackContext";
import StyledSelect from "@/components/StyledSelect";
import { exportUserListingToPdf } from "@/utils/userPdf";
import UserForm from "./UserForm";
import UserProfileModal from "./UserProfileModal";
import "./UserManagement.css";
import type { GeneratedCredentials, User } from "../../types/User";

const UserList = () => {
  const { showToast, confirm } = useFeedback();
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("TODOS");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkPreviewFile, setBulkPreviewFile] = useState<File | null>(null);
  const [bulkPreviewRows, setBulkPreviewRows] = useState<any[]>([]);
  const [bulkExpandedRows, setBulkExpandedRows] = useState<Record<string, boolean>>({});
  const [bulkPreviewSummary, setBulkPreviewSummary] = useState({
    total_count: 0,
    valid_count: 0,
    error_count: 0,
  });
  const [bulkImportResult, setBulkImportResult] = useState<any | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<GeneratedCredentials | null>(null);
  const bulkInputRef = useRef<HTMLInputElement | null>(null);
  const studentDocumentLabel = "Tarjeta de identidad";

  const downloadTextFile = (filename: string, content: string, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadSingleCredentials = (credentials: GeneratedCredentials) => {
    const roleLabel = credentials.role === "STUDENT" ? "Estudiante" : "Docente";
    const content = [
      "Gimnasio Los Cerros",
      "Credenciales de acceso",
      "",
      `Nombre: ${credentials.full_name}`,
      `Rol: ${roleLabel}`,
      `Usuario de acceso: ${credentials.login_identifier}`,
      `Contrasena temporal: ${credentials.temporary_password}`,
      "",
      "Al ingresar por primera vez, la plataforma solicitara cambiar la contrasena.",
    ].join("\r\n");

    downloadTextFile(`credenciales-${credentials.login_identifier}.txt`, content);
  };

  const downloadBulkCredentials = (credentialsList: GeneratedCredentials[]) => {
    if (!credentialsList.length) {
      showToast({
        type: "warning",
        title: "Credenciales",
        message: "No hay credenciales disponibles para descargar.",
      });
      return;
    }

    const content = [
      "Gimnasio Los Cerros",
      "Credenciales generadas en carga masiva",
      "",
      ...credentialsList.flatMap((item, index) => [
        `${index + 1}. ${item.full_name}`,
        `Rol: ${item.role === "STUDENT" ? "Estudiante" : "Docente"}`,
        `Usuario de acceso: ${item.login_identifier}`,
        `Contrasena temporal: ${item.temporary_password}`,
        "",
      ]),
      "Al ingresar por primera vez, cada usuario debera cambiar su contrasena.",
    ].join("\r\n");

    downloadTextFile("credenciales-usuarios.txt", content);
  };

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
          message: "Tu sesion ha expirado. Por favor inicia sesion nuevamente.",
        });
        localStorage.clear();
        window.location.href = "/";
      } else {
        const backendMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "No se pudieron cargar los usuarios.";
        showToast({
          type: "error",
          title: "Usuarios",
          message: backendMessage,
        });
      }
      return [];
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => user.role === filterRole)
      .filter((user) => (courseFilter === "TODOS" ? true : (user.course_names || []).includes(courseFilter)))
      .filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email} ${user.cedula} ${user.login_identifier || ""} ${(user.course_names || []).join(" ")}`
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
      message: `Se eliminara a ${user.first_name} ${user.last_name}. Esta accion no se puede deshacer.`,
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

  const handleExportUsers = async () => {
    if (!filteredUsers.length) {
      showToast({
        type: "warning",
        title: "Exportar usuarios",
        message: "No hay usuarios visibles en el filtro actual para exportar.",
      });
      return;
    }

    try {
      const roleLabel = filterRole === "STUDENT" ? "estudiantes" : "docentes";
      const scopeLabel =
        courseFilter === "TODOS" ? `todos-los-cursos-${roleLabel}` : `${courseFilter}-${roleLabel}`;

      await exportUserListingToPdf({
        users: filteredUsers,
        role: filterRole,
        courseFilter,
        fileName: `listado-${scopeLabel}`,
      });

      showToast({
        type: "success",
        title: "PDF generado",
        message:
          courseFilter === "TODOS"
            ? "Se descargo el listado agrupado por cursos."
            : "Se descargo el listado del curso seleccionado.",
      });
    } catch (error) {
      console.error("Error exportando listado de usuarios", error);
      showToast({
        type: "error",
        title: "Exportar usuarios",
        message: "No se pudo generar el PDF del listado.",
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/api/users/bulk/template/", {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "plantilla-usuarios-masivos.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      showToast({
        type: "success",
        title: "Plantilla descargada",
        message: "Se descargo el formato Excel para estudiantes y docentes.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Usuarios masivos",
        message: error.response?.data?.error || "No se pudo descargar la plantilla Excel.",
      });
    }
  };

  const handleBulkPreview = async (file: File | null) => {
    if (!file) return;

    try {
      setBulkImporting(true);
      setBulkImportResult(null);
      const payload = new FormData();
      payload.append("file", file);

      const response = await api.post("/api/users/bulk/preview/", payload);
      const rows = response.data?.rows || [];
      const initialExpandedState = Object.fromEntries(
        rows.map((row: any) => [`${row.sheet}-${row.row}`, false]),
      );

      setBulkPreviewFile(file);
      setBulkPreviewRows(rows);
      setBulkExpandedRows(initialExpandedState);
      setBulkPreviewSummary({
        total_count: response.data?.total_count || 0,
        valid_count: response.data?.valid_count || 0,
        error_count: response.data?.error_count || 0,
      });
      setBulkPreviewOpen(true);

      if (!rows.length) {
        showToast({
          type: "warning",
          title: "Usuarios masivos",
          message: "El Excel no trae filas de estudiantes o docentes para importar.",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Importacion masiva",
        message: error.response?.data?.error || "No se pudo revisar el archivo Excel.",
      });
    } finally {
      setBulkImporting(false);
      if (bulkInputRef.current) {
        bulkInputRef.current.value = "";
      }
    }
  };

  const handleBulkImport = async () => {
    if (!bulkPreviewFile) return;

    const confirmed = await confirm({
      title: "Confirmar carga masiva",
      message:
        bulkPreviewSummary.error_count > 0
          ? `Se crearan ${bulkPreviewSummary.valid_count} usuarios validos y se omitiran ${bulkPreviewSummary.error_count} filas con errores.`
          : `Se crearan ${bulkPreviewSummary.valid_count} usuarios desde el archivo seleccionado.`,
      confirmText: "Crear usuarios",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      setBulkImporting(true);
      const payload = new FormData();
      payload.append("file", bulkPreviewFile);

      const response = await api.post("/api/users/bulk/import/", payload);
      await fetchUsers();
      setBulkImportResult(response.data);

      const createdCount = response.data?.created_count || 0;
      const errorCount = response.data?.error_count || 0;
      const warningCount = response.data?.warning_count || 0;

      showToast({
        type: errorCount ? "warning" : "success",
        title: "Importacion masiva",
        message:
          errorCount || warningCount
            ? `Creados: ${createdCount}. Errores: ${errorCount}. Advertencias: ${warningCount}.`
            : `Se crearon ${createdCount} usuarios correctamente desde el Excel.`,
      });

      if (!errorCount) {
        setBulkPreviewRows([]);
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Importacion masiva",
        message: error.response?.data?.error || "No se pudo procesar el archivo Excel.",
      });
    } finally {
      setBulkImporting(false);
    }
  };

  const closeBulkPreview = () => {
    setBulkPreviewOpen(false);
    setBulkPreviewFile(null);
    setBulkPreviewRows([]);
    setBulkExpandedRows({});
    setBulkPreviewSummary({ total_count: 0, valid_count: 0, error_count: 0 });
    setBulkImportResult(null);
  };

  const toggleBulkRow = (rowKey: string) => {
    setBulkExpandedRows((current) => ({
      ...current,
      [rowKey]: !current[rowKey],
    }));
  };

  const renderBulkFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      email: "Correo",
      cedula: studentDocumentLabel,
      first_name: "Nombres",
      last_name: "Apellidos",
      direccion: "Direccion",
      rh: "RH",
      acudiente_nombre: "Acudiente",
      acudiente_cedula: "Cedula del acudiente",
      acudiente_telefono: "Telefono del acudiente",
      especialidad: "Especialidad",
      titulo: "Titulo",
    };

    return labels[field] || field;
  };

  const shouldDisplayBulkField = (field: string, role: "STUDENT" | "TEACHER") => {
    if (role === "STUDENT" && (field === "email" || field === "acudiente_email")) {
      return false;
    }

    return true;
  };

  const previewRowsBySheet = useMemo(() => {
    return {
      Estudiantes: bulkPreviewRows.filter((row) => row.sheet === "Estudiantes"),
      Docentes: bulkPreviewRows.filter((row) => row.sheet === "Docentes"),
    };
  }, [bulkPreviewRows]);

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

        <div className="user-workspace__hero-actions">
          <button className="btn" onClick={() => void handleDownloadTemplate()}>
            <Sheet size={16} />
            <span>Descargar plantilla Excel</span>
          </button>

          <button className="btn" onClick={() => bulkInputRef.current?.click()} disabled={bulkImporting}>
            <Upload size={16} />
            <span>{bulkImporting ? "Procesando..." : "Cargar usuarios por Excel"}</span>
          </button>
          <input
            ref={bulkInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              void handleBulkPreview(file);
            }}
          />

          <button className="btn" onClick={() => void handleExportUsers()}>
            <Download size={16} />
            <span>
              {courseFilter === "TODOS" ? "Descargar listado general" : "Descargar listado del curso"}
            </span>
          </button>

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
            placeholder="Buscar por nombre, documento o correo"
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
                  <span className="user-card__role">{user.role === "STUDENT" ? "Estudiante" : "Docente"}</span>
                  <h3>
                    {user.first_name} {user.last_name}
                  </h3>
                  <p>
                    {user.role === "STUDENT"
                      ? `Acceso por tarjeta de identidad: ${user.login_identifier || user.cedula}`
                      : user.email}
                  </p>
                </div>
              </div>

              <div className="user-card__meta">
                <div>
                  <span>{user.role === "STUDENT" ? studentDocumentLabel : "Documento"}</span>
                  <strong>{user.cedula}</strong>
                </div>
                <div>
                  <span>Curso</span>
                  <strong>{user.course_names?.join(", ") || "Sin asignar"}</strong>
                </div>
              </div>

              <div className="user-card__actions">
                <button type="button" className="btn user-card__action" onClick={() => setSelectedUser(user)}>
                  <span>Abrir perfil</span>
                  <ArrowRight size={16} />
                </button>

                <button type="button" className="btn user-card__delete" onClick={() => void handleDeleteUser(user)}>
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="user-empty">No hay usuarios registrados para este filtro.</div>
        )}
      </div>

      {showForm ? (
        <UserForm
          user={null}
          role={filterRole}
          onClose={() => setShowForm(false)}
          onSave={() => {
            void fetchUsers();
          }}
          onCreatedCredentials={(credentials) => setCreatedCredentials(credentials)}
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

      {createdCredentials ? (
        <div className="modal-overlay">
          <div className="modal-container user-credentials-modal">
            <div className="modal-shell__header">
              <div>
                <span className="modal-shell__eyebrow">Credenciales generadas</span>
                <h2 className="modal-title">Acceso listo para entregar</h2>
                <p className="modal-shell__subtitle">
                  Comparte estos datos con {createdCredentials.full_name}. La contrasena se debera
                  cambiar en el primer ingreso.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => setCreatedCredentials(null)}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </div>

            <div className="form user-credentials-modal__body">
              <div className="user-credentials-modal__card">
                <span>Usuario de acceso</span>
                <strong>{createdCredentials.login_identifier}</strong>
              </div>
              <div className="user-credentials-modal__card">
                <span>Contrasena temporal</span>
                <strong>{createdCredentials.temporary_password}</strong>
              </div>

              <div className="user-credentials-modal__actions">
                <button type="button" className="btn" onClick={() => downloadSingleCredentials(createdCredentials)}>
                  <Download size={16} />
                  <span>Descargar credenciales</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCreatedCredentials(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {bulkPreviewOpen ? (
        <div className="modal-overlay">
          <div className="user-profile-modal bulk-import-modal">
            <button type="button" className="close-btn" onClick={closeBulkPreview} aria-label="Cerrar">
              <X size={18} />
            </button>

            <div className="user-profile-modal__header">
              <div>
                <span className="user-profile-modal__eyebrow">Carga masiva</span>
                <h2>Revision previa de usuarios</h2>
                <p>
                  Revisa el archivo antes de crear usuarios. Puedes abrir cada fila para corroborar
                  los datos y ver los errores exactos.
                </p>
              </div>
            </div>

            <div className="user-profile-modal__body">
              <section className="bulk-import-summary">
                <div className="bulk-import-summary__card">
                  <span>Total</span>
                  <strong>{bulkPreviewSummary.total_count}</strong>
                </div>
                <div className="bulk-import-summary__card">
                  <span>Validos</span>
                  <strong>{bulkPreviewSummary.valid_count}</strong>
                </div>
                <div className="bulk-import-summary__card">
                  <span>Con errores</span>
                  <strong>{bulkPreviewSummary.error_count}</strong>
                </div>
                <div className="bulk-import-summary__actions">
                  <button type="button" className="btn" onClick={closeBulkPreview}>
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void handleBulkImport()}
                    disabled={bulkImporting || !bulkPreviewSummary.valid_count}
                  >
                    <Upload size={16} />
                    <span>{bulkImporting ? "Importando..." : "Importar usuarios validos"}</span>
                  </button>
                </div>
              </section>

              {bulkImportResult ? (
                <section className="bulk-import-result">
                  <div className="bulk-import-result__header">
                    <h3>Resultado de la importacion</h3>
                    <p>
                      Creados: {bulkImportResult.created_count || 0}. Errores:{" "}
                      {bulkImportResult.error_count || 0}. Advertencias:{" "}
                      {bulkImportResult.warning_count || 0}.
                    </p>
                    {bulkImportResult.created?.length ? (
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          downloadBulkCredentials(
                            bulkImportResult.created
                              .map((item: any) => item.credentials)
                              .filter(Boolean),
                          )
                        }
                      >
                        <Download size={16} />
                        <span>Descargar credenciales creadas</span>
                      </button>
                    ) : null}
                  </div>

                  {bulkImportResult.created?.length ? (
                    <div className="bulk-import-credentials">
                      {bulkImportResult.created
                        .map((item: any) => item.credentials)
                        .filter(Boolean)
                        .map((credentials: GeneratedCredentials) => (
                          <article
                            key={`${credentials.login_identifier}-${credentials.temporary_password}`}
                            className="bulk-import-credentials__card"
                          >
                            <div className="bulk-import-credentials__info">
                              <span>
                                {credentials.role === "STUDENT" ? "Estudiante" : "Docente"}
                              </span>
                              <strong>{credentials.full_name}</strong>
                              <p>Usuario: {credentials.login_identifier}</p>
                              <p>Contrasena temporal: {credentials.temporary_password}</p>
                            </div>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => downloadSingleCredentials(credentials)}
                            >
                              <Download size={16} />
                              <span>Descargar</span>
                            </button>
                          </article>
                        ))}
                    </div>
                  ) : null}

                  {bulkImportResult.errors?.length ? (
                    <div className="bulk-import-result__list">
                      {bulkImportResult.errors.map((errorItem: any, index: number) => (
                        <article
                          key={`${errorItem.sheet}-${errorItem.row}-${index}`}
                          className="bulk-import-result__item bulk-import-result__item--error"
                        >
                          <strong>
                            {errorItem.name || `Fila ${errorItem.row}`} - {errorItem.sheet} fila{" "}
                            {errorItem.row}
                          </strong>
                          {Object.entries(errorItem.errors || {}).map(([field, messages]) => (
                            <p key={field}>
                              <span>{renderBulkFieldLabel(field)}:</span>{" "}
                              {Array.isArray(messages) ? messages.join(" ") : String(messages)}
                            </p>
                          ))}
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {(["Estudiantes", "Docentes"] as const).map((sheetName) => {
                const rows = previewRowsBySheet[sheetName];
                if (!rows.length) return null;

                return (
                  <section key={sheetName} className="bulk-import-section">
                    <div className="user-documents-panel__header">
                      <h3>{sheetName}</h3>
                      <p>
                        {rows.length} registro{rows.length === 1 ? "" : "s"} detectado
                        {rows.length === 1 ? "" : "s"} en esta hoja.
                      </p>
                    </div>

                    <div className="bulk-import-list">
                      {rows.map((row: any) => {
                        const rowKey = `${row.sheet}-${row.row}`;
                        const expanded = !!bulkExpandedRows[rowKey];

                        return (
                          <article key={rowKey} className="bulk-import-row">
                            <button
                              type="button"
                              className="bulk-import-row__toggle"
                              onClick={() => toggleBulkRow(rowKey)}
                            >
                              <div className="bulk-import-row__identity">
                                <div className={`bulk-import-row__status bulk-import-row__status--${row.status}`}>
                                  {row.status === "valid" ? (
                                    <CheckCircle2 size={16} />
                                  ) : (
                                    <AlertCircle size={16} />
                                  )}
                                </div>
                                <div>
                                  <strong>{row.name}</strong>
                                  <span>
                                    {row.role === "STUDENT"
                                      ? `${studentDocumentLabel} ${row.cedula || "Sin dato"} · fila ${row.row}`
                                      : `${row.email || "Sin correo"} · fila ${row.row}`}
                                  </span>
                                </div>
                              </div>

                              <div className="bulk-import-row__meta">
                                <span className={`bulk-import-chip bulk-import-chip--${row.status}`}>
                                  {row.status === "valid" ? "Listo para importar" : "Revisar errores"}
                                </span>
                                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </button>

                            {expanded ? (
                              <div className="bulk-import-row__details">
                                <div className="bulk-import-row__fields">
                                  {Object.entries(row.data || {}).map(([field, value]) => {
                                    if (field === "role" || !shouldDisplayBulkField(field, row.role)) {
                                      return null;
                                    }
                                    return (
                                      <div key={field} className="bulk-import-row__field">
                                        <span>{renderBulkFieldLabel(field)}</span>
                                        <strong>{String(value || "Sin dato")}</strong>
                                      </div>
                                    );
                                  })}
                                </div>

                                {row.status === "error" ? (
                                  <div className="bulk-import-row__errors">
                                    {Object.entries(row.errors || {}).map(([field, messages]) => (
                                      <p key={field}>
                                        <span>{renderBulkFieldLabel(field)}:</span>{" "}
                                        {Array.isArray(messages) ? messages.join(" ") : String(messages)}
                                      </p>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default UserList;
