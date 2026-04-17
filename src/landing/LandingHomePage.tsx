import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Newspaper,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import heroImageA from "@/assets/carrusel.jpg";
import heroImageB from "@/assets/carrusel2.jpg";
import heroImageC from "@/assets/carrusel3.jpg";
import type { LandingCalendarEntry } from "./landing.api";
import { useLandingContent } from "./LandingContentContext";

const heroSlides = [
  {
    eyebrow: "Formación integral",
    image: heroImageA,
    title: "Impulsamos valores, excelencia y futuro académico.",
    text: "Una experiencia escolar pensada para formar estudiantes con liderazgo, criterio humano y un profundo sentido de pertenencia.",
  },
  {
    image: heroImageB,
    eyebrow: "Vida escolar",
    title: "Aprendizaje, comunidad y crecimiento en un mismo entorno.",
    text: "Creamos espacios donde la ciencia, la convivencia y la creatividad fortalecen el proyecto de vida de cada estudiante.",
  },
  {
    image: heroImageC,
    eyebrow: "Plataforma integral",
    title: "Un colegio conectado con su comunidad educativa.",
    text: "Información institucional, gestión académica y comunicación en una presencia digital ordenada, moderna y confiable.",
  },
];

const fallbackNewsItems = [
  {
    id: 1,
    image_url: heroImageA,
    title: "Encuentro institucional sobre liderazgo, convivencia y proyecto de vida",
    published_at: "2026-03-17",
    summary:
      "Una jornada para fortalecer habilidades de liderazgo estudiantil, sentido de comunidad y formación en valores.",
  },
  {
    id: 2,
    image_url: heroImageB,
    title: "Inicio del nuevo período académico con experiencias de aula innovadoras",
    published_at: "2026-03-10",
    summary:
      "El colegio inicia una nueva etapa con actividades integradas, laboratorios escolares y acompañamiento permanente.",
  },
  {
    id: 3,
    image_url: heroImageC,
    title: "Salida pedagógica y cultural para fortalecer aprendizaje significativo",
    published_at: "2026-03-02",
    summary:
      "Una experiencia que une observación, trabajo colaborativo y vivencias reales alineadas con el proceso formativo.",
  },
];

const fallbackGalleryItems = [
  { id: 1, image_url: heroImageA, title: "Ceremonia de graduación", detail: "Logros, familia y proyección de futuro" },
  { id: 2, image_url: heroImageB, title: "Laboratorios escolares", detail: "Aprendizaje práctico y curiosidad científica" },
  { id: 3, image_url: heroImageA, title: "Actos institucionales", detail: "Comunidad, identidad y participación" },
  { id: 4, image_url: heroImageB, title: "Vida estudiantil", detail: "Arte, deporte y crecimiento integral" },
  { id: 5, image_url: heroImageA, title: "Eventos culturales", detail: "Talento, valores y sentido de pertenencia" },
];

const fallbackCalendarEntries = [
  {
    id: 1,
    title: "Entrega de informes",
    detail: "Espacio de diálogo entre familias, docentes y dirección de grupo.",
    event_date: "2026-04-04",
    event_time: "07:00:00",
    location: "Sede principal",
    display_order: 1,
    is_active: true,
  },
  {
    id: 2,
    title: "Reunión con familias",
    detail: "Seguimiento formativo y acompañamiento institucional.",
    event_date: "2026-04-05",
    event_time: "08:00:00",
    location: "Sala múltiple",
    display_order: 2,
    is_active: true,
  },
  {
    id: 3,
    title: "Semana cultural",
    detail: "Jornadas artísticas, deportivas y de convivencia.",
    event_date: "2026-04-18",
    event_time: "09:30:00",
    location: "Patio central",
    display_order: 3,
    is_active: true,
  },
  {
    id: 4,
    title: "Muestra de proyectos",
    detail: "Exposición de trabajos y experiencias de aula.",
    event_date: "2026-04-19",
    event_time: "10:00:00",
    location: "Aulas y biblioteca",
    display_order: 4,
    is_active: true,
  },
];

const featuredPrograms = [
  {
    icon: GraduationCap,
    title: "Formación académica sólida",
    text: "Procesos pedagógicos orientados al pensamiento crítico, la lectura, la ciencia y el desarrollo integral.",
  },
  {
    icon: Sparkles,
    title: "Educación en valores",
    text: "Convivencia, respeto, responsabilidad y liderazgo como pilares de la vida escolar.",
  },
  {
    icon: Users,
    title: "Comunidad educativa cercana",
    text: "Familias, docentes y estudiantes construyen juntos una experiencia escolar humana y exigente.",
  },
];

heroSlides.splice(
  0,
  heroSlides.length,
  {
    eyebrow: "Un camino feliz",
    image: heroImageA,
    title: "Formamos estudiantes integrales, activos y felices en su proceso de aprender.",
    text: "El Gimnasio Los Cerros orienta su labor a la construcción de valores y conocimiento, fortaleciendo personalidad, creatividad, autonomía e investigación.",
  },
  {
    eyebrow: "Horizonte institucional",
    image: heroImageB,
    title: "La lectura, la exploración y el pensamiento crítico hacen parte del camino escolar.",
    text: "Biblioteca, ludoteca, escritura, análisis y acompañamiento humano se integran para que cada niño descubra su voz y construya sentido frente al conocimiento.",
  },
  {
    eyebrow: "Identidad institucional",
    image: heroImageC,
    title: "Naturaleza, comunidad y excelencia académica en un mismo proyecto educativo.",
    text: "Nuestra propuesta resalta el respeto, la responsabilidad, la rectitud y el cuidado del medio ambiente como parte esencial de la formación integral.",
  },
);

featuredPrograms.splice(
  0,
  featuredPrograms.length,
  {
    icon: GraduationCap,
    title: "Formación integral",
    text: "El estudiante es acompañado para crecer en autonomía, creatividad, responsabilidad y construcción de conocimiento.",
  },
  {
    icon: Sparkles,
    title: "Investigación y lectura",
    text: "La institución fortalece biblioteca, ludoteca, escritura y pensamiento crítico como bases del aprendizaje significativo.",
  },
  {
    icon: Users,
    title: "Familia y comunidad",
    text: "El acompañamiento a padres y la participación activa de la comunidad educativa hacen parte del proyecto institucional.",
  },
);

const communityItems = [
  { title: "Instagram", subtitle: "@colegio.simijaca" },
  { title: "Facebook", subtitle: "Colegio Institucional Simijaca" },
  { title: "YouTube", subtitle: "Eventos, actos y comunidad escolar" },
];

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const formatDisplayDate = (dateValue: string) =>
  new Date(`${dateValue}T00:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatEventTime = (timeValue?: string | null) => {
  if (!timeValue) return "Hora por confirmar";
  return timeValue.slice(0, 5);
};

const buildMonthlyCalendar = (
  monthDate: Date,
  entries: LandingCalendarEntry[],
) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  const entryMap = new Map<number, LandingCalendarEntry>();
  entries.forEach((entry) => {
    const date = new Date(`${entry.event_date}T00:00:00`);
    if (date.getFullYear() === year && date.getMonth() === month) {
      entryMap.set(date.getDate(), entry);
    }
  });

  const cells: Array<{
    day: string;
    muted?: boolean;
    highlighted?: boolean;
    label?: string;
    entry?: LandingCalendarEntry;
  }> = [];

  for (let index = offset; index > 0; index -= 1) {
    cells.push({
      day: String(previousMonthDays - index + 1),
      muted: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const entry = entryMap.get(day);
    cells.push({
      day: String(day),
      highlighted: Boolean(entry),
      label: entry?.title || undefined,
      entry,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      day: String(cells.length - daysInMonth - offset + 1),
      muted: true,
    });
  }

  return cells;
};

const LandingHomePage = () => {
  const [activeHero, setActiveHero] = useState(0);
  const [activeGallery, setActiveGallery] = useState(0);
  const [allNewsOpen, setAllNewsOpen] = useState(false);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<LandingCalendarEntry | null>(null);
  const lockedScrollY = useRef(0);
  const { content } = useLandingContent();

  useEffect(() => {
    const heroTimer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length);
    }, 5200);

    const galleryTimer = window.setInterval(() => {
      setActiveGallery((current) => (current + 1) % galleryItems.length);
    }, 4200);

    return () => {
      window.clearInterval(heroTimer);
      window.clearInterval(galleryTimer);
    };
  }, []);

  useEffect(() => {
    if (!allNewsOpen) {
      return undefined;
    }

    lockedScrollY.current = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.body.style.width = previousBodyWidth;
      window.scrollTo({ top: lockedScrollY.current, behavior: "auto" });
    };
  }, [allNewsOpen]);

  const currentHero = heroSlides[activeHero];
  const newsItems = content.news.length ? content.news : fallbackNewsItems;
  const latestNewsItems = [...newsItems].slice(0, 3);
  const allNewsItems = [...newsItems].sort((a, b) => b.published_at.localeCompare(a.published_at));
  const galleryItems = content.gallery.length ? content.gallery : fallbackGalleryItems;
  const calendarEntries = content.calendar_entries.length
    ? [...content.calendar_entries].sort((a, b) => a.event_date.localeCompare(b.event_date))
    : fallbackCalendarEntries;

  const activeMonthDate = useMemo(() => {
    const firstEntry = calendarEntries[0];
    return firstEntry
      ? new Date(`${firstEntry.event_date}T00:00:00`)
      : new Date("2026-04-01T00:00:00");
  }, [calendarEntries]);

  const monthLabel = activeMonthDate.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  const calendarCells = buildMonthlyCalendar(activeMonthDate, calendarEntries);

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero__backdrop" />
        <div className="landing-hero__content">
          <div className="landing-hero__copy">
            <span className="landing-section-tag">{currentHero.eyebrow}</span>
            <h1>{currentHero.title}</h1>
            <p>{currentHero.text}</p>
            <div className="landing-hero__actions">
              <a href="/#programas" className="landing-btn landing-btn--primary">
                Conocer el colegio
              </a>
              <Link to="/institucional/identidad" className="landing-btn landing-btn--ghost">
                Más información
              </Link>
            </div>

            <div className="landing-hero__metrics">
              <article>
                <strong></strong>
                <span>Niveles y procesos escolares articulados</span>
              </article>
              <article>
                <strong></strong>
                <span>Satisfacción de estudiantes y familias</span>
              </article>
              <article>
                <strong></strong>
                <span>Eventos institucionales de alto impacto cada semestre</span>
              </article>
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="landing-hero__frame">
              <img src={currentHero.image} alt={currentHero.title} />
            </div>
          </div>
        </div>

        <div className="landing-hero__ornament landing-hero__ornament--top" />
        <div className="landing-hero__ornament landing-hero__ornament--bottom" />

        <div className="landing-hero__controls">
          <button
            type="button"
            onClick={() =>
              setActiveHero((current) => (current - 1 + heroSlides.length) % heroSlides.length)
            }
            aria-label="Hero anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="landing-hero__dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={index === activeHero ? "is-active" : ""}
                onClick={() => setActiveHero(index)}
                aria-label={`Ir a ${slide.title}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActiveHero((current) => (current + 1) % heroSlides.length)}
            aria-label="Hero siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section id="noticias" className="landing-news-section">
        <div className="landing-section-heading landing-section-heading--center">
          <span className="landing-section-tag landing-section-tag--light">Actualidad institucional</span>
          <h2>Últimas Noticias</h2>
          <p>
            Historias, actividades y anuncios que reflejan el dinamismo de nuestra
            comunidad educativa.
          </p>
        </div>

        <div className="landing-news-grid">
          {latestNewsItems.map((item) => (
            <article key={item.id} className="landing-news-card">
              <div className="landing-news-card__image-wrap">
                <img
                  src={item.image_url || heroImageA}
                  alt={item.title}
                  className="landing-news-card__image"
                />
                <span className="landing-news-card__date">
                  {formatDisplayDate(item.published_at)}
                </span>
              </div>
              <div className="landing-news-card__body">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="landing-news-section__action">
          <button
            type="button"
            className="landing-btn landing-btn--primary"
            onClick={() => setAllNewsOpen(true)}
          >
            Ver todas las noticias
          </button>
        </div>
      </section>

      {allNewsOpen ? (
        <div className="landing-news-modal__overlay" onClick={() => setAllNewsOpen(false)}>
          <div className="landing-news-modal" onClick={(event) => event.stopPropagation()}>
            <div className="landing-news-modal__header">
              <div>
                <span className="landing-section-tag landing-section-tag--light">Histórico</span>
                <h2>Todas las noticias</h2>
                <p>Consulta el registro completo de publicaciones institucionales de la landing.</p>
              </div>
              <button
                type="button"
                className="landing-news-modal__close"
                onClick={() => setAllNewsOpen(false)}
                aria-label="Cerrar historial de noticias"
              >
                <X size={18} />
              </button>
            </div>

            <div className="landing-news-modal__body">
              <div className="landing-news-modal__grid">
                {allNewsItems.map((item) => (
                  <article key={`all-news-${item.id}`} className="landing-news-card">
                    <div className="landing-news-card__image-wrap">
                      <img
                        src={item.image_url || heroImageA}
                        alt={item.title}
                        className="landing-news-card__image"
                      />
                      <span className="landing-news-card__date">
                        {formatDisplayDate(item.published_at)}
                      </span>
                    </div>
                    <div className="landing-news-card__body">
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCalendarEvent ? (
        <div
          className="landing-news-modal__overlay"
          onClick={() => setSelectedCalendarEvent(null)}
        >
          <div
            className="landing-news-modal landing-calendar-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="landing-news-modal__header">
              <div>
                <span className="landing-section-tag landing-section-tag--light">Evento</span>
                <h2>{selectedCalendarEvent.title}</h2>
                <p>Consulta la información principal del evento institucional.</p>
              </div>
              <button
                type="button"
                className="landing-news-modal__close"
                onClick={() => setSelectedCalendarEvent(null)}
                aria-label="Cerrar detalle del evento"
              >
                <X size={18} />
              </button>
            </div>

            <div className="landing-news-modal__body">
              <div className="landing-calendar-modal__content">
                <article className="landing-calendar-modal__meta">
                  <strong>Fecha</strong>
                  <span>{formatDisplayDate(selectedCalendarEvent.event_date)}</span>
                </article>
                <article className="landing-calendar-modal__meta">
                  <strong>Hora</strong>
                  <span>{formatEventTime(selectedCalendarEvent.event_time)}</span>
                </article>
                <article className="landing-calendar-modal__meta">
                  <strong>Lugar</strong>
                  <span>{selectedCalendarEvent.location || "Lugar por confirmar"}</span>
                </article>
              </div>
              {selectedCalendarEvent.detail ? (
                <div className="landing-calendar-modal__detail">
                  <strong>Descripción</strong>
                  <p>{selectedCalendarEvent.detail}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <section id="programas" className="landing-showcase">
        <div className="landing-section-heading">
          <span className="landing-section-tag">Oferta académica</span>
          <h2>Una experiencia escolar orientada a la excelencia</h2>
          <p>
            Ambientes de aprendizaje, acompañamiento docente y vida escolar pensados
            para formar estudiantes íntegros, curiosos y comprometidos.
          </p>
        </div>

        <div className="landing-showcase__grid">
          {featuredPrograms.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="landing-showcase__card">
                <div className="landing-showcase__icon">
                  <Icon size={20} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-gallery">
        <div className="landing-section-heading landing-section-heading--center landing-section-heading--dark">
          <span className="landing-section-tag">Vida académica</span>
          <h2>Galería de Eventos</h2>
          <p>
            Un recorrido visual por actos, graduaciones, actividades escolares y momentos
            que fortalecen nuestra identidad institucional.
          </p>
        </div>

        <div className="landing-gallery__viewport">
          <button
            type="button"
            className="landing-gallery__arrow"
            onClick={() =>
              setActiveGallery((current) => (current - 1 + galleryItems.length) % galleryItems.length)
            }
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="landing-gallery__track">
            {galleryItems.map((item, index) => (
              <article
                key={`${item.id}-${index}`}
                className={`landing-gallery__card ${index === activeGallery ? "is-active" : ""}`}
              >
                <img src={item.image_url || heroImageA} alt={item.title} />
                <div className="landing-gallery__overlay">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="landing-gallery__arrow"
            onClick={() => setActiveGallery((current) => (current + 1) % galleryItems.length)}
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="landing-gallery__dots">
          {galleryItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === activeGallery ? "is-active" : ""}
              onClick={() => setActiveGallery(index)}
              aria-label={`Ir a ${item.title}`}
            />
          ))}
        </div>
      </section>

      <section id="admisiones" className="landing-admissions">
        <div className="landing-admissions__panel">
          <div className="landing-section-heading">
            <span className="landing-section-tag landing-section-tag--light">Agenda escolar</span>
            <h2>Calendario académico del colegio</h2>
            <p>
              Una vista mensual que resume la vida institucional del periodo y se
              complementa con el detalle del calendario al lado.
            </p>
          </div>

          <div className="landing-school-calendar">
            <div className="landing-school-calendar__topbar">
              <strong>{monthLabel}</strong>
              <span>Vista mensual escolar</span>
            </div>
            <div className="landing-school-calendar__weekdays">
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="landing-school-calendar__grid">
              {calendarCells.map((item, index) => (
                <article
                  key={`${item.day}-${index}`}
                  className={`landing-school-calendar__cell ${item.muted ? "is-muted" : ""} ${
                    item.highlighted ? "is-highlighted" : ""
                  }`}
                  onClick={() => {
                    if (item.entry) setSelectedCalendarEvent(item.entry);
                  }}
                >
                  <strong>{item.day}</strong>
                  {item.label ? <span>{item.label}</span> : null}
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="landing-admissions__calendar">
          <div className="landing-calendar-card">
            <div className="landing-calendar-card__header">
              <CalendarDays size={20} />
              <span>Calendario institucional</span>
            </div>
            <ul>
              {calendarEntries.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <strong>
                    {new Date(`${item.event_date}T00:00:00`).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </strong>
                  <button
                    type="button"
                    className="landing-calendar-card__event"
                    onClick={() => setSelectedCalendarEvent(item)}
                  >
                    <span>{item.title}</span>
                    <small>
                      {formatEventTime(item.event_time)}{item.location ? ` · ${item.location}` : ""}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-community">
        <div className="landing-section-heading landing-section-heading--center">
          <span className="landing-section-tag landing-section-tag--light">Comunidad digital</span>
          <h2>Conecta con nuestra comunidad</h2>
          <p>
            Sigue conversaciones, eventos y contenidos que amplían la experiencia
            escolar dentro y fuera del aula.
          </p>
        </div>

        <div className="landing-community__grid">
          {communityItems.map((item) => (
            <article key={item.title} className="landing-community__card">
              <Newspaper size={20} />
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingHomePage;
