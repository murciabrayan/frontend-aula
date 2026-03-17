import { useEffect, useState } from "react";
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

const newsItems = [
  {
    image: heroImageA,
    title: "Encuentro institucional sobre liderazgo, convivencia y proyecto de vida",
    date: "17 de marzo de 2026",
    description:
      "Una jornada para fortalecer habilidades de liderazgo estudiantil, sentido de comunidad y formacion en valores.",
  },
  {
    image: heroImageB,
    title: "Inicio del nuevo periodo academico con experiencias de aula innovadoras",
    date: "10 de marzo de 2026",
    description:
      "El colegio inicia una nueva etapa con actividades integradas, laboratorios escolares y acompanamiento permanente.",
  },
  {
    image: heroImageA,
    title: "Salida pedagogica y cultural para fortalecer aprendizaje significativo",
    date: "2 de marzo de 2026",
    description:
      "Una experiencia que une observacion, trabajo colaborativo y vivencias reales alineadas con el proceso formativo.",
  },
];

const galleryItems = [
  { image: heroImageA, title: "Ceremonia de graduacion", detail: "Logros, familia y proyeccion de futuro" },
  { image: heroImageB, title: "Laboratorios escolares", detail: "Aprendizaje practico y curiosidad cientifica" },
  { image: heroImageA, title: "Actos institucionales", detail: "Comunidad, identidad y participacion" },
  { image: heroImageB, title: "Vida estudiantil", detail: "Arte, deporte y crecimiento integral" },
  { image: heroImageA, title: "Eventos culturales", detail: "Talento, valores y sentido de pertenencia" },
];

const featuredPrograms = [
  {
    icon: GraduationCap,
    title: "Formacion academica solida",
    text: "Procesos pedagógicos orientados al pensamiento critico, la lectura, la ciencia y el desarrollo integral.",
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

const schoolCalendar = [
  {
    month: "Marzo",
    date: "22",
    title: "Izada de bandera y homenaje institucional",
    detail: "Actividad formativa con protagonismo de primaria y bachillerato.",
  },
  {
    month: "Abril",
    date: "04",
    title: "Entrega de informes del primer corte",
    detail: "Espacio de dialogo entre familias, docentes y direccion de grupo.",
  },
  {
    month: "Abril",
    date: "18",
    title: "Semana cultural y deportiva",
    detail: "Jornadas artisticas, deportivas y de convivencia para toda la comunidad.",
  },
];

const institutionalCalendar = [
  { day: "24 MAR", label: "Consejo academico y planeacion institucional" },
  { day: "05 ABR", label: "Reunion con familias y seguimiento formativo" },
  { day: "19 ABR", label: "Muestra de proyectos escolares" },
];

const communityItems = [
  { title: "Instagram", subtitle: "@colegio.simijaca" },
  { title: "Facebook", subtitle: "Colegio Institucional Simijaca" },
  { title: "YouTube", subtitle: "Eventos, actos y comunidad escolar" },
];

const LandingHomePage = () => {
  const [activeHero, setActiveHero] = useState(0);
  const [activeGallery, setActiveGallery] = useState(0);

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
          {newsItems.map((item) => (
            <article key={item.title} className="landing-news-card">
              <div className="landing-news-card__image-wrap">
                <img src={item.image} alt={item.title} className="landing-news-card__image" />
                <span className="landing-news-card__date">{item.date}</span>
              </div>
              <div className="landing-news-card__body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
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
                  key={`${item.title}-${index}`}
                  className={`landing-gallery__card ${
                    index === activeGallery ? "is-active" : ""
                  } ${isVisible ? "is-visible" : ""}`}
                >
                  <img src={item.image} alt={item.title} />
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
              key={item.title}
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
              Un resumen visual de fechas, actividades y encuentros que organizan la
              vida institucional durante el periodo escolar.
            </p>
          </div>

          <div className="landing-school-calendar">
            {schoolCalendar.map((item) => (
              <article key={`${item.month}-${item.date}-${item.title}`} className="landing-school-calendar__item">
                <div className="landing-school-calendar__date">
                  <span>{item.month}</span>
                  <strong>{item.date}</strong>
                </div>
                <div className="landing-school-calendar__body">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="landing-admissions__calendar">
          <div className="landing-calendar-card">
            <div className="landing-calendar-card__header">
              <CalendarDays size={20} />
              <span>Calendario institucional</span>
            </div>
            <ul>
              {institutionalCalendar.map((item) => (
                <li key={item.day}>
                  <strong>{item.day}</strong>
                  <span>{item.label}</span>
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
