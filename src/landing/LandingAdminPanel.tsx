import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  FileText,
  Images,
  Newspaper,
  PencilLine,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useFeedback } from "@/context/FeedbackContext";
import {
  createLandingCalendarEntry,
  createLandingDocument,
  createLandingGalleryItem,
  createLandingNews,
  deleteLandingCalendarEntry,
  deleteLandingDocument,
  deleteLandingGalleryItem,
  deleteLandingNews,
  updateLandingCalendarEntry,
  updateLandingDocument,
  updateLandingGalleryItem,
  updateLandingNews,
} from "./landing.api";
import { useLandingContent } from "./LandingContentContext";

type LandingTab = "news" | "gallery" | "documents" | "calendar";

interface Props {
  open: boolean;
  onClose: () => void;
}

const tabs: Array<{ id: LandingTab; label: string; icon: typeof Newspaper }> = [
  { id: "news", label: "Noticias", icon: Newspaper },
  { id: "gallery", label: "Galeria", icon: Images },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "calendar", label: "Agenda", icon: CalendarDays },
];

const getTodayDateValue = () => new Date().toISOString().slice(0, 10);

const weekDayLabels = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const buildCalendarDays = (dateValue: string) => {
  const baseDate = new Date(`${dateValue}T00:00:00`);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    const cellDate = new Date(year, month, dayNumber);
    const iso = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;

    return {
      iso,
      day: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month,
    };
  });
};

const emptyNewsForm = {
  id: null as number | null,
  title: "",
  summary: "",
  published_at: getTodayDateValue(),
  display_order: 0,
  is_active: true,
  image: null as File | null,
  currentImageUrl: "",
};

const emptyGalleryForm = {
  id: null as number | null,
  title: "",
  detail: "",
  event_date: getTodayDateValue(),
  display_order: 0,
  is_active: true,
  image: null as File | null,
  currentImageUrl: "",
};

const emptyDocumentForm = {
  id: null as number | null,
  title: "",
  description: "",
  display_order: 0,
  is_active: true,
  file: null as File | null,
  currentFileUrl: "",
};

const emptyCalendarForm = {
  id: null as number | null,
  title: "",
  detail: "",
  event_date: getTodayDateValue(),
  display_order: 0,
  is_active: true,
};

const LandingAdminPanel = ({ open, onClose }: Props) => {
  const { content, refreshLandingContent } = useLandingContent();
  const { showToast, confirm } = useFeedback();
  const [activeTab, setActiveTab] = useState<LandingTab>("news");
  const [saving, setSaving] = useState(false);

  const [newsForm, setNewsForm] = useState(emptyNewsForm);
  const [galleryForm, setGalleryForm] = useState(emptyGalleryForm);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [calendarForm, setCalendarForm] = useState(emptyCalendarForm);
  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false);
  const [calendarPickerValue, setCalendarPickerValue] = useState(getTodayDateValue());

  useEffect(() => {
    if (!open) {
      setActiveTab("news");
      setNewsForm(emptyNewsForm);
      setGalleryForm(emptyGalleryForm);
      setDocumentForm(emptyDocumentForm);
      setCalendarForm(emptyCalendarForm);
      setCalendarPickerOpen(false);
      setCalendarPickerValue(getTodayDateValue());
    }
  }, [open]);

  const activeTitle = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.label || "Contenido",
    [activeTab],
  );

  const newsPreviewUrl = useMemo(
    () => (newsForm.image ? URL.createObjectURL(newsForm.image) : newsForm.currentImageUrl),
    [newsForm.image, newsForm.currentImageUrl],
  );

  const galleryPreviewUrl = useMemo(
    () => (galleryForm.image ? URL.createObjectURL(galleryForm.image) : galleryForm.currentImageUrl),
    [galleryForm.image, galleryForm.currentImageUrl],
  );

  const documentPreviewName = documentForm.file?.name || documentForm.currentFileUrl || "";
  const calendarGrid = useMemo(() => buildCalendarDays(calendarPickerValue), [calendarPickerValue]);
  const calendarPickerDate = useMemo(
    () => new Date(`${calendarPickerValue}T00:00:00`),
    [calendarPickerValue],
  );

  if (!open) return null;

  const handleDelete = async (type: LandingTab, id: number) => {
    const confirmed = await confirm({
      title: "Eliminar contenido",
      message: "Esta accion eliminara el registro seleccionado de la landing.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!confirmed) return;

    try {
      if (type === "news") await deleteLandingNews(id);
      if (type === "gallery") await deleteLandingGalleryItem(id);
      if (type === "documents") await deleteLandingDocument(id);
      if (type === "calendar") await deleteLandingCalendarEntry(id);

      await refreshLandingContent();
      showToast({
        type: "success",
        title: "Contenido eliminado",
        message: "La landing se actualizo correctamente.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "No fue posible eliminar este contenido.",
      });
    }
  };

  const submitNews = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: newsForm.title,
        summary: newsForm.summary,
        published_at: newsForm.published_at || getTodayDateValue(),
        display_order: String(newsForm.display_order),
        is_active: String(newsForm.is_active),
        image: newsForm.image,
      };

      if (newsForm.id) await updateLandingNews(newsForm.id, payload);
      else await createLandingNews(payload);

      setNewsForm(emptyNewsForm);
      await refreshLandingContent();
      showToast({ type: "success", message: "Noticias actualizadas correctamente." });
    } catch (error) {
      showToast({ type: "error", message: "No se pudo guardar la noticia." });
    } finally {
      setSaving(false);
    }
  };

  const submitGallery = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: galleryForm.title,
        detail: galleryForm.detail,
        event_date: galleryForm.event_date,
        display_order: String(galleryForm.display_order),
        is_active: String(galleryForm.is_active),
        image: galleryForm.image,
      };

      if (galleryForm.id) await updateLandingGalleryItem(galleryForm.id, payload);
      else await createLandingGalleryItem(payload);

      setGalleryForm(emptyGalleryForm);
      await refreshLandingContent();
      showToast({ type: "success", message: "Galeria actualizada correctamente." });
    } catch (error) {
      showToast({ type: "error", message: "No se pudo guardar el evento de galeria." });
    } finally {
      setSaving(false);
    }
  };

  const submitDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: documentForm.title,
        description: documentForm.description,
        display_order: String(documentForm.display_order),
        is_active: String(documentForm.is_active),
        file: documentForm.file,
      };

      if (documentForm.id) await updateLandingDocument(documentForm.id, payload);
      else await createLandingDocument(payload);

      setDocumentForm(emptyDocumentForm);
      await refreshLandingContent();
      showToast({ type: "success", message: "Documentacion actualizada correctamente." });
    } catch (error) {
      showToast({ type: "error", message: "No se pudo guardar el documento." });
    } finally {
      setSaving(false);
    }
  };

  const submitCalendar = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: calendarForm.title,
        detail: calendarForm.detail,
        event_date: calendarForm.event_date,
        display_order: calendarForm.display_order,
        is_active: calendarForm.is_active,
      };

      if (calendarForm.id) await updateLandingCalendarEntry(calendarForm.id, payload);
      else await createLandingCalendarEntry(payload);

      setCalendarForm(emptyCalendarForm);
      await refreshLandingContent();
      showToast({ type: "success", message: "Agenda institucional actualizada correctamente." });
    } catch (error) {
      showToast({ type: "error", message: "No se pudo guardar el evento del calendario." });
    } finally {
      setSaving(false);
    }
  };

  const openCalendarPicker = () => {
    setCalendarPickerValue(calendarForm.event_date || getTodayDateValue());
    setCalendarPickerOpen(true);
  };

  const moveCalendarMonth = (direction: -1 | 1) => {
    const current = new Date(`${calendarPickerValue}T00:00:00`);
    current.setMonth(current.getMonth() + direction, 1);
    setCalendarPickerValue(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-01`,
    );
  };

  const selectCalendarDate = (iso: string) => {
    setCalendarForm((current) => ({ ...current, event_date: iso }));
    setCalendarPickerValue(iso);
    setCalendarPickerOpen(false);
  };

  return (
    <div className="landing-admin__overlay" onClick={onClose}>
      <div className="landing-admin" onClick={(event) => event.stopPropagation()}>
        <div className="landing-admin__header">
          <div>
            <span className="landing-section-tag landing-section-tag--light">Administracion</span>
            <h2>Editor de landing</h2>
            <p>Gestiona el contenido dinamico visible en la pagina institucional.</p>
          </div>
          <button
            type="button"
            className="landing-admin__close"
            onClick={onClose}
            aria-label="Cerrar editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className="landing-admin__body">
          <aside className="landing-admin__sidebar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`landing-admin__tab ${activeTab === tab.id ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          <section className="landing-admin__workspace">
            <div className="landing-admin__workspace-header">
              <h3>{activeTitle}</h3>
              <p>Edita, crea o elimina contenido visible en la landing.</p>
            </div>

            {activeTab === "news" ? (
              <div className="landing-admin__grid">
                <form className="landing-admin__form" onSubmit={submitNews}>
                  <h4>{newsForm.id ? "Editar noticia" : "Nueva noticia"}</h4>
                  <div className="landing-admin__preview landing-admin__preview--image">
                    {newsPreviewUrl ? (
                      <img src={newsPreviewUrl} alt="Vista previa de noticia" />
                    ) : (
                      <div className="landing-admin__preview-empty">
                        <Upload size={18} />
                        <span>Vista previa de la imagen principal</span>
                      </div>
                    )}
                  </div>
                  <input value={newsForm.title} onChange={(e) => setNewsForm((c) => ({ ...c, title: e.target.value }))} placeholder="Titulo" required />
                  <textarea value={newsForm.summary} onChange={(e) => setNewsForm((c) => ({ ...c, summary: e.target.value }))} placeholder="Resumen" rows={5} required />
                  <div className="landing-admin__form-meta">
                    <span>Fecha de publicacion: {newsForm.published_at}</span>
                  </div>
                  <label className="landing-admin__upload">
                    <Upload size={16} />
                    <span>{newsForm.image ? newsForm.image.name : "Subir imagen de noticia"}</span>
                    <input type="file" accept="image/*" onChange={(e) => setNewsForm((c) => ({ ...c, image: e.target.files?.[0] || null }))} />
                  </label>
                  <label className="landing-admin__checkbox">
                    <input type="checkbox" checked={newsForm.is_active} onChange={(e) => setNewsForm((c) => ({ ...c, is_active: e.target.checked }))} />
                    <span>Visible</span>
                  </label>
                  <div className="landing-admin__actions">
                    <button type="submit" className="landing-btn landing-btn--primary" disabled={saving}>{newsForm.id ? "Actualizar" : "Crear noticia"}</button>
                    {newsForm.id ? (
                      <>
                        <button
                          type="button"
                          className="landing-btn landing-btn--danger"
                          onClick={() => handleDelete("news", newsForm.id!)}
                        >
                          Eliminar
                        </button>
                        <button type="button" className="landing-btn landing-btn--ghost-dark" onClick={() => setNewsForm(emptyNewsForm)}>Cancelar</button>
                      </>
                    ) : null}
                  </div>
                </form>

                <div className="landing-admin__list landing-admin__list--cards">
                  {content.news.map((item) => (
                    <article key={item.id} className="landing-admin__card">
                      <div className="landing-admin__card-media">
                        {item.image_url ? <img src={item.image_url} alt={item.title} /> : null}
                        <div className="landing-admin__card-actions-overlay">
                          <button
                            type="button"
                            className="landing-admin__action-button landing-admin__action-button--edit"
                            onClick={() => setNewsForm({ id: item.id, title: item.title, summary: item.summary, published_at: item.published_at, display_order: item.display_order, is_active: item.is_active, image: null, currentImageUrl: item.image_url || "" })}
                          >
                            <PencilLine size={16} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className="landing-admin__action-button landing-admin__action-button--delete"
                            onClick={() => handleDelete("news", item.id)}
                          >
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                      <div className="landing-admin__card-body">
                        <strong>{item.title}</strong>
                        <span>{item.published_at}</span>
                        <p>{item.summary}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "gallery" ? (
              <div className="landing-admin__grid">
                <form className="landing-admin__form" onSubmit={submitGallery}>
                  <h4>{galleryForm.id ? "Editar evento visual" : "Nuevo evento visual"}</h4>
                  <div className="landing-admin__preview landing-admin__preview--image">
                    {galleryPreviewUrl ? (
                      <img src={galleryPreviewUrl} alt="Vista previa de galeria" />
                    ) : (
                      <div className="landing-admin__preview-empty">
                        <Images size={18} />
                        <span>Vista previa del evento visual</span>
                      </div>
                    )}
                  </div>
                  <input value={galleryForm.title} onChange={(e) => setGalleryForm((c) => ({ ...c, title: e.target.value }))} placeholder="Titulo" required />
                  <textarea value={galleryForm.detail} onChange={(e) => setGalleryForm((c) => ({ ...c, detail: e.target.value }))} placeholder="Descripcion corta" rows={4} required />
                  <div className="landing-admin__form-meta">
                    <span>Fecha del evento: {galleryForm.event_date}</span>
                  </div>
                  <input type="date" value={galleryForm.event_date} onChange={(e) => setGalleryForm((c) => ({ ...c, event_date: e.target.value }))} />
                  <label className="landing-admin__upload">
                    <Upload size={16} />
                    <span>{galleryForm.image ? galleryForm.image.name : "Subir imagen de galeria"}</span>
                    <input type="file" accept="image/*" onChange={(e) => setGalleryForm((c) => ({ ...c, image: e.target.files?.[0] || null }))} />
                  </label>
                  <label className="landing-admin__checkbox">
                    <input type="checkbox" checked={galleryForm.is_active} onChange={(e) => setGalleryForm((c) => ({ ...c, is_active: e.target.checked }))} />
                    <span>Visible</span>
                  </label>
                  <div className="landing-admin__actions">
                    <button type="submit" className="landing-btn landing-btn--primary" disabled={saving}>{galleryForm.id ? "Actualizar" : "Crear evento"}</button>
                    {galleryForm.id ? (
                      <>
                        <button
                          type="button"
                          className="landing-btn landing-btn--danger"
                          onClick={() => handleDelete("gallery", galleryForm.id!)}
                        >
                          Eliminar
                        </button>
                        <button type="button" className="landing-btn landing-btn--ghost-dark" onClick={() => setGalleryForm(emptyGalleryForm)}>Cancelar</button>
                      </>
                    ) : null}
                  </div>
                </form>

                <div className="landing-admin__list landing-admin__list--cards">
                  {content.gallery.map((item) => (
                    <article key={item.id} className="landing-admin__card">
                      <div className="landing-admin__card-media">
                        {item.image_url ? <img src={item.image_url} alt={item.title} /> : null}
                        <div className="landing-admin__card-actions-overlay">
                          <button
                            type="button"
                            className="landing-admin__action-button landing-admin__action-button--edit"
                            onClick={() => setGalleryForm({ id: item.id, title: item.title, detail: item.detail, event_date: item.event_date || "", display_order: item.display_order, is_active: item.is_active, image: null, currentImageUrl: item.image_url || "" })}
                          >
                            <PencilLine size={16} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className="landing-admin__action-button landing-admin__action-button--delete"
                            onClick={() => handleDelete("gallery", item.id)}
                          >
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                      <div className="landing-admin__card-body">
                        <strong>{item.title}</strong>
                        <span>{item.event_date || "Sin fecha"}</span>
                        <p>{item.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "documents" ? (
              <div className="landing-admin__grid">
                <form className="landing-admin__form" onSubmit={submitDocument}>
                  <h4>{documentForm.id ? "Editar documento" : "Nuevo documento"}</h4>
                  <div className="landing-admin__preview landing-admin__preview--file">
                    {documentPreviewName ? (
                      <div className="landing-admin__file-preview">
                        <FileText size={22} />
                        <div>
                          <strong>{documentForm.file?.name || documentForm.title || "Documento actual"}</strong>
                          <span>{documentForm.file ? "Archivo listo para subir" : "Documento actualmente publicado"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="landing-admin__preview-empty">
                        <FileText size={18} />
                        <span>Vista previa del documento institucional</span>
                      </div>
                    )}
                  </div>
                  <input value={documentForm.title} onChange={(e) => setDocumentForm((c) => ({ ...c, title: e.target.value }))} placeholder="Titulo" required />
                  <textarea value={documentForm.description} onChange={(e) => setDocumentForm((c) => ({ ...c, description: e.target.value }))} placeholder="Descripcion" rows={4} required />
                  <label className="landing-admin__upload">
                    <Upload size={16} />
                    <span>{documentForm.file ? documentForm.file.name : "Subir documento institucional"}</span>
                    <input type="file" onChange={(e) => setDocumentForm((c) => ({ ...c, file: e.target.files?.[0] || null }))} />
                  </label>
                  <label className="landing-admin__checkbox">
                    <input type="checkbox" checked={documentForm.is_active} onChange={(e) => setDocumentForm((c) => ({ ...c, is_active: e.target.checked }))} />
                    <span>Visible</span>
                  </label>
                  <div className="landing-admin__actions">
                    <button type="submit" className="landing-btn landing-btn--primary" disabled={saving}>{documentForm.id ? "Actualizar" : "Crear documento"}</button>
                    {documentForm.id ? (
                      <>
                        <button
                          type="button"
                          className="landing-btn landing-btn--danger"
                          onClick={() => handleDelete("documents", documentForm.id!)}
                        >
                          Eliminar
                        </button>
                        <button type="button" className="landing-btn landing-btn--ghost-dark" onClick={() => setDocumentForm(emptyDocumentForm)}>Cancelar</button>
                      </>
                    ) : null}
                  </div>
                </form>

                <div className="landing-admin__list landing-admin__list--cards">
                  {content.documents.map((item) => (
                    <article key={item.id} className="landing-admin__card landing-admin__card--document">
                      <div className="landing-admin__card-file"><FileText size={24} /></div>
                      <div className="landing-admin__card-body">
                        <strong>{item.title}</strong>
                        <span>{item.file_url ? "Documento activo" : "Sin archivo"}</span>
                        <p>{item.description}</p>
                        {item.file_url ? <a href={item.file_url} target="_blank" rel="noreferrer" className="landing-admin__link"><Eye size={14} /><span>Ver documento</span></a> : null}
                      </div>
                      <div className="landing-admin__item-actions">
                        <button
                          type="button"
                          className="landing-admin__action-button landing-admin__action-button--edit"
                          onClick={() => setDocumentForm({ id: item.id, title: item.title, description: item.description, display_order: item.display_order, is_active: item.is_active, file: null, currentFileUrl: item.file_url || "" })}
                        >
                          <PencilLine size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          className="landing-admin__action-button landing-admin__action-button--delete"
                          onClick={() => handleDelete("documents", item.id)}
                        >
                          <Trash2 size={16} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "calendar" ? (
              <div className="landing-admin__grid">
                <form className="landing-admin__form" onSubmit={submitCalendar}>
                  <h4>{calendarForm.id ? "Editar fecha" : "Nueva fecha institucional"}</h4>
                  <input value={calendarForm.title} onChange={(e) => setCalendarForm((c) => ({ ...c, title: e.target.value }))} placeholder="Titulo" required />
                  <textarea value={calendarForm.detail} onChange={(e) => setCalendarForm((c) => ({ ...c, detail: e.target.value }))} placeholder="Detalle" rows={4} required />
                  <div className="landing-admin__form-meta">
                    <span>Fecha seleccionada: {calendarForm.event_date}</span>
                  </div>
                  <div className="landing-admin__date-field">
                    <input
                      type="text"
                      value={calendarForm.event_date}
                      readOnly
                    />
                    <button
                      type="button"
                      className="landing-admin__date-trigger"
                      onClick={openCalendarPicker}
                    >
                      <CalendarDays size={16} />
                      <span>Abrir calendario</span>
                    </button>
                  </div>
                  {calendarPickerOpen ? (
                    <div className="landing-admin__calendar-popover">
                      <div className="landing-admin__calendar-toolbar">
                        <button type="button" onClick={() => moveCalendarMonth(-1)}>
                          Anterior
                        </button>
                        <strong>
                          {calendarPickerDate.toLocaleDateString("es-CO", {
                            month: "long",
                            year: "numeric",
                          })}
                        </strong>
                        <button type="button" onClick={() => moveCalendarMonth(1)}>
                          Siguiente
                        </button>
                      </div>
                      <div className="landing-admin__calendar-weekdays">
                        {weekDayLabels.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                      <div className="landing-admin__calendar-grid">
                        {calendarGrid.map((day) => (
                          <button
                            key={day.iso}
                            type="button"
                            className={`landing-admin__calendar-day ${day.isCurrentMonth ? "" : "is-muted"} ${calendarForm.event_date === day.iso ? "is-selected" : ""}`}
                            onClick={() => selectCalendarDate(day.iso)}
                          >
                            {day.day}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <label className="landing-admin__checkbox">
                    <input type="checkbox" checked={calendarForm.is_active} onChange={(e) => setCalendarForm((c) => ({ ...c, is_active: e.target.checked }))} />
                    <span>Visible</span>
                  </label>
                  <div className="landing-admin__actions">
                    <button type="submit" className="landing-btn landing-btn--primary" disabled={saving}>{calendarForm.id ? "Actualizar" : "Crear fecha"}</button>
                    {calendarForm.id ? (
                      <>
                        <button
                          type="button"
                          className="landing-btn landing-btn--danger"
                          onClick={() => handleDelete("calendar", calendarForm.id!)}
                        >
                          Eliminar
                        </button>
                        <button type="button" className="landing-btn landing-btn--ghost-dark" onClick={() => setCalendarForm(emptyCalendarForm)}>Cancelar</button>
                      </>
                    ) : null}
                  </div>
                </form>

                <div className="landing-admin__list landing-admin__list--cards">
                  {content.calendar_entries.map((item) => (
                    <article key={item.id} className="landing-admin__card landing-admin__card--calendar">
                      <div className="landing-admin__calendar-pill">
                        <strong>{new Date(`${item.event_date}T00:00:00`).getDate()}</strong>
                        <span>{new Date(`${item.event_date}T00:00:00`).toLocaleDateString("es-CO", { month: "short" })}</span>
                      </div>
                      <div className="landing-admin__card-body">
                        <strong>{item.title}</strong>
                        <span>{item.event_date}</span>
                        <p>{item.detail}</p>
                      </div>
                      <div className="landing-admin__item-actions">
                        <button
                          type="button"
                          className="landing-admin__action-button landing-admin__action-button--edit"
                          onClick={() => setCalendarForm({ id: item.id, title: item.title, detail: item.detail, event_date: item.event_date, display_order: item.display_order, is_active: item.is_active })}
                        >
                          <PencilLine size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          className="landing-admin__action-button landing-admin__action-button--delete"
                          onClick={() => handleDelete("calendar", item.id)}
                        >
                          <Trash2 size={16} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default LandingAdminPanel;
