import { useMemo, useState } from "react";
import { Layers3, Plus, Search, X } from "lucide-react";
import StyledSelect from "@/components/StyledSelect";
import type {
  Indicator,
  SubjectIndicatorAssignment,
} from "../../commons/personas/services/indicatorService";

type Area = {
  id: number;
  nombre: string;
};

type Subject = {
  id: number;
  nombre: string;
  area?: number | null;
  area_nombre?: string;
  teacher?: number | null;
  teacher_name?: string;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
};

type StructureTab = "areas" | "subjects" | "indicators";

interface CourseStructureBoardProps {
  courseName: string;
  onClose: () => void;
  loading: boolean;
  areas: Area[];
  subjects: Subject[];
  teachers: User[];
  selectedSubjectId: number | null;
  onSelectSubject: (subjectId: number) => void;
  onOpenAreaModal: () => void;
  onRemoveArea: (areaId: number) => void;
  onOpenSubjectModal: () => void;
  savingSubjectId: number | null;
  onAssignAreaToSubject: (subjectId: number, areaId: number | "") => void;
  onAssignTeacherToSubject: (subjectId: number, teacherId: number | "") => void;
  onRemoveSubject: (subjectId: number) => void;
  onOpenSubjectIndicators: (subjectId: number) => void;
  indicatorBank: Indicator[];
  editingIndicatorId: number | null;
  editingIndicatorDescription: string;
  onEditingIndicatorDescriptionChange: (value: string) => void;
  onStartEditIndicator: (indicatorId: number, description: string) => void;
  onSaveEditedIndicator: () => void;
  onCancelEditIndicator: () => void;
  onRemoveIndicatorFromBank: (indicatorId: number) => void;
  indicatorAssignments: SubjectIndicatorAssignment[];
  onOpenAssignIndicator: (subjectId: number, period: 1 | 2 | 3 | 4) => void;
  onOpenCreateIndicator: () => void;
}

const CourseStructureBoard = ({
  courseName,
  onClose,
  loading,
  areas,
  subjects,
  teachers,
  selectedSubjectId,
  onSelectSubject,
  onOpenAreaModal,
  onRemoveArea,
  onOpenSubjectModal,
  savingSubjectId,
  onAssignAreaToSubject,
  onAssignTeacherToSubject,
  onRemoveSubject,
  onOpenSubjectIndicators,
  indicatorBank,
  editingIndicatorId,
  editingIndicatorDescription,
  onEditingIndicatorDescriptionChange,
  onStartEditIndicator,
  onSaveEditedIndicator,
  onCancelEditIndicator,
  onRemoveIndicatorFromBank,
  indicatorAssignments,
  onOpenAssignIndicator,
  onOpenCreateIndicator,
}: CourseStructureBoardProps) => {
  const [activeTab, setActiveTab] = useState<StructureTab>("areas");
  const [subjectSearch, setSubjectSearch] = useState("");

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter((subject) =>
      `${subject.nombre} ${subject.area_nombre || ""}`.toLowerCase().includes(query)
    );
  }, [subjectSearch, subjects]);

  const sortedIndicators = useMemo(
    () => [...indicatorBank].sort((a, b) => a.descripcion.localeCompare(b.descripcion)),
    [indicatorBank]
  );

  return (
    <div className="course-management__modal-backdrop">
      <div className="course-management__modal course-management__modal--wide course-management__structure-modal">
        <div className="course-management__modal-header">
          <div>
            <h3>{courseName}</h3>
            <p>Administra areas, materias e indicadores del curso desde este modal.</p>
          </div>
          <button
            type="button"
            className="course-management__modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            x
          </button>
        </div>

        <div className="course-management__team-tabs" role="tablist" aria-label="Estructura académica">
          <button
            type="button"
            className={activeTab === "areas" ? "is-active" : ""}
            onClick={() => setActiveTab("areas")}
          >
            Areas
          </button>
          <button
            type="button"
            className={activeTab === "subjects" ? "is-active" : ""}
            onClick={() => setActiveTab("subjects")}
          >
            Materias
          </button>
          <button
            type="button"
            className={activeTab === "indicators" ? "is-active" : ""}
            onClick={() => setActiveTab("indicators")}
          >
            Indicadores
          </button>
        </div>

        {loading ? (
          <div className="course-management__state">Cargando estructura del curso...</div>
        ) : activeTab === "areas" ? (
          <div className="course-management__team-modal-body">
            <div className="course-management__team-toolbar">
              <div className="course-management__section-copy">
                <p className="course-management__flow-step">Organizacion base</p>
                <h4>Areas del curso</h4>
              </div>
              <button
                type="button"
                className="course-management__primary-btn"
                onClick={onOpenAreaModal}
              >
                <Plus size={14} />
                <span>Crear area</span>
              </button>
            </div>

            <div className="course-management__student-table-wrap course-management__student-table-wrap--modal course-management__student-table-wrap--areas">
              <table className="course-management__student-table course-management__student-table--fixedhead">
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Materias relacionadas</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.length === 0 ? (
                    <tr>
                      <td colSpan={3}>Aún no hay áreas creadas para este curso.</td>
                    </tr>
                  ) : (
                    areas.map((area) => (
                      <tr key={area.id}>
                        <td>
                          <div className="course-management__student-cell course-management__student-cell--uniform">
                            <Layers3 size={16} />
                            <strong>{area.nombre}</strong>
                          </div>
                        </td>
                        <td>
                          {subjects.filter((subject) => subject.area === area.id).length} materias
                        </td>
                        <td>
                          <button
                            type="button"
                            className="course-management__action-pill"
                            onClick={() => onRemoveArea(area.id)}
                          >
                            <X size={14} />
                            <span>Eliminar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "subjects" ? (
          <div className="course-management__team-modal-body">
            <div className="course-management__team-toolbar">
              <div className="course-management__section-copy">
                <p className="course-management__flow-step">Catálogo académico</p>
                <h4>Materias del curso</h4>
              </div>
              <button
                type="button"
                className="course-management__primary-btn"
                onClick={onOpenSubjectModal}
              >
                <Plus size={14} />
                <span>Crear materia</span>
              </button>
            </div>
<label className="course-management__search course-management__search--wide">
              <Search size={16} />
              <input
                type="text"
                value={subjectSearch}
                onChange={(event) => setSubjectSearch(event.target.value)}
                placeholder="Buscar materia..."
              />
            </label>

            <div className="course-management__structure-subject-list">
              {filteredSubjects.length === 0 ? (
                <div className="course-management__empty">Aún no hay materias creadas.</div>
              ) : (
                filteredSubjects.map((subject) => {
                  const assignmentCount = indicatorAssignments.filter(
                    (assignment) => assignment.materia === subject.id
                  ).length;

                  return (
                    <article
                      key={subject.id}
                      className={`course-management__structure-subject-card ${
                        selectedSubjectId === subject.id ? "is-active" : ""
                      }`}
                    >
                      <div className="course-management__structure-subject-copy">
                        <button
                          type="button"
                          className="course-management__structure-subject-title"
                          onClick={() => onSelectSubject(subject.id)}
                        >
                          <strong>{subject.nombre}</strong>
                          <span>
                            {subject.teacher_name || "Sin docente de materia"} • {assignmentCount} indicadores asignados
                          </span>
                        </button>
                      </div>

                      <div className="course-management__structure-subject-actions">
                        <StyledSelect
                          value={subject.teacher ?? ""}
                          disabled={savingSubjectId === subject.id}
                          onChange={(event) =>
                            onAssignTeacherToSubject(
                              subject.id,
                              event.target.value ? Number(event.target.value) : ""
                            )
                          }
                        >
                          <option value="">Sin docente de materia</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.first_name} {teacher.last_name}
                            </option>
                          ))}
                        </StyledSelect>

                        <StyledSelect
                          value={subject.area ?? ""}
                          disabled={savingSubjectId === subject.id}
                          onChange={(event) =>
                            onAssignAreaToSubject(
                              subject.id,
                              event.target.value ? Number(event.target.value) : ""
                            )
                          }
                        >
                          <option value="">Sin area</option>
                          {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.nombre}
                            </option>
                          ))}
                        </StyledSelect>

                        <div className="course-management__team-actions course-management__team-actions--inline">
                          <button
                            type="button"
                            className="course-management__secondary-btn"
                            onClick={() => onOpenSubjectIndicators(subject.id)}
                          >
                            Ver indicadores
                          </button>
                          <button
                            type="button"
                            className="course-management__danger-btn"
                            onClick={() => onRemoveSubject(subject.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="course-management__team-modal-body">
            <div className="course-management__team-toolbar">
              <div className="course-management__section-copy">
                <p className="course-management__flow-step">Evaluación</p>
                <h4>Indicadores del curso</h4>
              </div>
              <div className="course-management__team-actions course-management__team-actions--inline">
                <button
                  type="button"
                  className="course-management__secondary-btn"
                  onClick={onOpenCreateIndicator}
                >
                  <Plus size={14} />
                  <span>Crear indicador</span>
                </button>
                <button
                  type="button"
                  className="course-management__primary-btn"
                  onClick={() =>
                    onOpenAssignIndicator(selectedSubjectId ?? subjects[0]?.id ?? 0, 1)
                  }
                  disabled={subjects.length === 0}
                >
                  <Plus size={14} />
                  <span>Asignar indicador</span>
                </button>
              </div>
            </div>

            <div className="course-management__student-table-wrap course-management__student-table-wrap--modal course-management__student-table-wrap--indicators">
              <table className="course-management__student-table course-management__student-table--fixedhead course-management__student-table--indicators-layout">
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Asignaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedIndicators.length === 0 ? (
                    <tr>
                      <td colSpan={3}>Aún no hay indicadores creados.</td>
                    </tr>
                  ) : (
                    sortedIndicators.map((indicator) => {
                      const totalAssignments = indicatorAssignments.filter(
                        (assignment) => assignment.indicador === indicator.id
                      ).length;

                      return (
                        <tr key={indicator.id}>
                          <td>
                            {editingIndicatorId === indicator.id ? (
                              <textarea
                                className="course-management__indicator-inline-editor"
                                value={editingIndicatorDescription}
                                onChange={(event) =>
                                  onEditingIndicatorDescriptionChange(event.target.value)
                                }
                              />
                            ) : (
                              <span>{indicator.descripcion}</span>
                            )}
                          </td>
                          <td>{totalAssignments} asignaciones</td>
                          <td>
                            <div className="course-management__team-actions course-management__team-actions--inline">
                              {editingIndicatorId === indicator.id ? (
                                <>
                                  <button
                                    type="button"
                                    className="course-management__primary-btn"
                                    onClick={onSaveEditedIndicator}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    type="button"
                                    className="course-management__secondary-btn"
                                    onClick={onCancelEditIndicator}
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="course-management__secondary-btn"
                                    onClick={() =>
                                      onStartEditIndicator(indicator.id, indicator.descripcion)
                                    }
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="course-management__danger-btn"
                                    onClick={() => onRemoveIndicatorFromBank(indicator.id)}
                                  >
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStructureBoard;




