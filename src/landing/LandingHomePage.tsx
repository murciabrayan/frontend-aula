import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Newspaper,
  Sparkles,
  Users,
} from "lucide-react";
import heroImageA from "@/assets/login-side.jpg";
import heroImageB from "@/assets/2.png";
import heroImageC from "@/assets/logo.png";
import { useLandingContent } from "./LandingContentContext";

const heroSlides = [
  {
    image: heroImageA,
    eyebrow: "Formacion integral",
    title: "Impulsamos valores, excelencia y futuro academico.",
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
    text: "Informacion institucional, gestion academica y comunicacion en una presencia digital ordenada, moderna y confiable.",
  },
];

const fallbackNewsItems = [
  {
    id: 1,
    image_url: heroImageA,
    title: "Encuentro institucional sobre liderazgo, convivencia y proyecto de vida",
    published_at: "2026-03-17",
    summary:
      "Una jornada para fortalecer habilidades de liderazgo estudiantil, sentido de comunidad y formacion en valores.",
  },
  {
    id: 2,
    image_url: heroImageB,
    title: "Inicio del nuevo periodo academico con experiencias de aula innovadoras",
    published_at: "2026-03-10",
    summary:
      "El colegio inicia una nueva etapa con actividades integradas, laboratorios escolares y acompanamiento permanente.",
  },
  {
    id: 3,
    image_url: heroImageA,
    title: "Salida pedagogica y cultural para fortalecer aprendizaje significativo",
    published_at: "2026-03-02",
    summary:
      "Una experiencia que une observacion, trabajo colaborativo y vivencias reales alineadas con el proceso formativo.",
  },
];

const fallbackGalleryItems = [
  { id: 1, image_url: heroImageA, title: "Ceremonia de graduacion", detail: "Logros, familia y proyeccion de futuro" },
  { id: 2, image_url: heroImageB, title: "Laboratorios escolares", detail: "Aprendizaje practico y curiosidad cientifica" },
  { id: 3, image_url: heroImageA, title: "Actos institucionales", detail: "Comunidad, identidad y participacion" },
  { id: 4, image_url: heroImageB, title: "Vida estudiantil", detail: "Arte, deporte y crecimiento integral" },
  { id: 5, image_url: heroImageA, title: "Eventos culturales", detail: "Talento, valores y sentido de pertenencia" },
];

const fallbackCalendarEntries = [
  {
    id: 1,
    title: "Entrega de informes",
    detail: "Espacio de dialogo entre familias, docentes y direccion de grupo.",
    event_date: "2026-04-04",
  },
  {
    id: 2,
    title: "Reunion con familias",
    detail: "Seguimiento formativo y acompanamiento institucional.",
    event_date: "2026-04-05",
  },
  {
    id: 3,
    title: "Semana cultural",
    detail: "Jornadas artisticas, deportivas y de convivencia.",
    event_date: "2026-04-18",
  },
  {
    id: 4,
    title: "Muestra de proyectos",
    detail: "Exposicion de trabajos y experiencias de aula.",
    event_date: "2026-04-19",
  },
];

const featuredPrograms = [
  {
    icon: GraduationCap,
    title: "Formacion academica solida",
    text: "Procesos pedagogicos orientados al pensamiento critico, la lectura, la ciencia y el desarrollo integral.",
  },
  {
    icon: Sparkles,
    title: "Educacion en valores",
    text: "Convivencia, respeto, responsabilidad y liderazgo como pilares de la vida escolar.",
  },
  {
    icon: Users,
    title: "Comunidad educativa cercana",
    text: "Familias, docentes y estudiantes construyen juntos una experiencia escolar humana y exigente.",
  },
];

const communityItems = [
  { title: "Instagram", subtitle: "@colegio.simijaca" },
  { title: "Facebook", subtitle: "Colegio Institucional Simijaca" },
  { title: "YouTube", subtitle: "Eventos, actos y comunidad escolar" },
];

const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const formatDisplayDate = (dateValue: string) =>
  new Date(`${dateValue}T00:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const buildMonthlyCalendar = (
  monthDate: Date,
  entries: Array<{ event_date: string; title: string }>,
) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  const entryMap = new Map<number, string>();
  entries.forEach((entry) => {
    const date = new Date(`${entry.event_date}T00:00:00`);
    if (date.getFullYear() === year && date.getMonth() === month) {
      entryMap.set(date.getDate(), entry.title);
    }
  });

  const cells: Array<{
    day: string;
    muted?: boolean;
    highlighted?: boolean;
    label?: string;
  }> = [];

  for (let index = offset; index > 0; index -= 1) {
    cells.push({
      day: String(previousMonthDays - index + 1),
      muted: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const label = entryMap.get(day);
    cells.push({
      day: String(day),
      highlighted: Boolean(label),
      label: label ? label.split(" ").slice(0, 2).join(" ") : undefined,
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

  const currentHero = heroSlides[activeHero];
  const newsItems = content.news.length ? content.news : fallbackNewsItems;
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
              <Link to="/institucional" className="landing-btn landing-btn--ghost">
                Mas informacion
              </Link>
            </div>

            <div className="landing-hero__metrics">
              <article>
                <strong>11</strong>
                <span>Niveles y procesos escolares articulados</span>
              </article>
              <article>
                <strong>94%</strong>
                <span>Satisfaccion de estudiantes y familias</span>
              </article>
              <article>
                <strong>12</strong>
                <span>Eventos institucionales de alto impacto cada semestre</span>
              </article>
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="landing-hero__frame">
              <img src={currentHero.image} alt={currentHero.title} />
            </div>
            <div className="landing-hero__panel">
              <span>Excelencia institucional</span>
              <strong>Formacion escolar con identidad y valores</strong>
              <p>Conoce un colegio que combina calidad academica, acompanamiento y sentido de comunidad.</p>
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
          <h2>Ultimas Noticias</h2>
          <p>
            Historias, actividades y anuncios que reflejan el dinamismo de nuestra
            comunidad educativa.
          </p>
        </div>

        <div className="landing-news-grid">
          {newsItems.slice(0, 3).map((item) => (
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
                <a href="/#noticias" className="landing-inline-link">
                  Leer mas <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="landing-news-section__action">
          <a href="/#noticias" className="landing-btn landing-btn--primary">
            Ver todas las noticias
          </a>
        </div>
      </section>

      <section id="programas" className="landing-showcase">
        <div className="landing-section-heading">
          <span className="landing-section-tag">Oferta academica</span>
          <h2>Una experiencia escolar orientada a la excelencia</h2>
          <p>
            Ambientes de aprendizaje, acompanamiento docente y vida escolar pensados
            para formar estudiantes integros, curiosos y comprometidos.
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
          <span className="landing-section-tag">Vida academica</span>
          <h2>Galeria de Eventos</h2>
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
            {galleryItems.map((item, index) => {
              const isVisible =
                index === activeGallery ||
                index === (activeGallery + 1) % galleryItems.length ||
                index === (activeGallery + 2) % galleryItems.length;

              return (
                <article
                  key={`${item.id}-${index}`}
                  className={`landing-gallery__card ${
                    index === activeGallery ? "is-active" : ""
                  } ${isVisible ? "is-visible" : ""}`}
                >
                  <img src={item.image_url || heroImageA} alt={item.title} />
                  <div className="landing-gallery__overlay">
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                </article>
              );
            })}
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
            <h2>Calendario academico del colegio</h2>
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
                  <span>{item.title}</span>
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
            Sigue conversaciones, eventos y contenidos que amplian la experiencia
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
