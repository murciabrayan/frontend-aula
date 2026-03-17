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
    eyebrow: "Formacion de alto nivel",
    title: "Impulsamos talento, liderazgo y futuro academico.",
    text: "Una experiencia institucional pensada para formar profesionales con vision global, criterio humano y excelencia sostenida.",
  },
  {
    image: heroImageB,
    eyebrow: "Vida universitaria",
    title: "Innovacion, investigacion y comunidad en un mismo ecosistema.",
    text: "Creamos entornos que conectan ciencia, creatividad y acompanamiento para que cada estudiante proyecte su mejor version.",
  },
  {
    image: heroImageC,
    eyebrow: "Plataforma integral",
    title: "Una institucion conectada con su comunidad academica.",
    text: "Informacion institucional, gestion academica y comunicacion en una presencia digital ordenada, moderna y confiable.",
  },
];

const newsItems = [
  {
    image: heroImageA,
    title: "Seminario internacional de liderazgo y excelencia directiva",
    date: "17 de marzo de 2026",
    description:
      "Una jornada con invitados nacionales e internacionales para fortalecer la toma de decisiones, la vision estrategica y la innovacion educativa.",
  },
  {
    image: heroImageB,
    title: "Inicio del nuevo ciclo academico con enfoque en investigacion aplicada",
    date: "10 de marzo de 2026",
    description:
      "Nuestros programas abren un nuevo periodo con laboratorios, experiencias inmersivas y acompanamiento integral para estudiantes y docentes.",
  },
  {
    image: heroImageA,
    title: "Viaje academico y cultural para fortalecer aprendizaje global",
    date: "2 de marzo de 2026",
    description:
      "Una experiencia de campo que integra intercambio cultural, pensamiento critico y vivencias reales alineadas con el proyecto formativo.",
  },
];

const galleryItems = [
  { image: heroImageA, title: "Ceremonia de graduacion", detail: "Excelencia y proyeccion profesional" },
  { image: heroImageB, title: "Laboratorios especializados", detail: "Aprendizaje aplicado y tecnologia" },
  { image: heroImageA, title: "Conferencias magistrales", detail: "Expertos invitados y debate academico" },
  { image: heroImageB, title: "Vida estudiantil", detail: "Cultura, deporte y comunidad" },
  { image: heroImageA, title: "Eventos institucionales", detail: "Prestigio, red y proyeccion" },
];

const featuredPrograms = [
  {
    icon: GraduationCap,
    title: "Programas de excelencia",
    text: "Trayectorias formativas orientadas a resultados, rigor academico y empleabilidad.",
  },
  {
    icon: Sparkles,
    title: "Modelo integral",
    text: "Acompanamiento humano, bienestar, orientacion y cultura institucional premium.",
  },
  {
    icon: Users,
    title: "Comunidad global",
    text: "Alianzas, eventos, practicas y redes que amplian el horizonte profesional.",
  },
];

const admissionSteps = [
  "Explora la oferta academica y el proyecto institucional.",
  "Agenda una asesoria con nuestro equipo de admisiones.",
  "Formaliza tu proceso y accede a acompanamiento personalizado.",
];

const communityItems = [
  { title: "Instagram", subtitle: "@institucion.premium" },
  { title: "Facebook", subtitle: "Institucion Educativa Oficial" },
  { title: "YouTube", subtitle: "Eventos, conferencias y comunidad" },
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
                Ver carreras
              </a>
              <Link to="/institucional" className="landing-btn landing-btn--ghost">
                Mas informacion
              </Link>
            </div>

            <div className="landing-hero__metrics">
              <article>
                <strong>25+</strong>
                <span>Programas y trayectorias formativas</span>
              </article>
              <article>
                <strong>94%</strong>
                <span>Satisfaccion de estudiantes y familias</span>
              </article>
              <article>
                <strong>12</strong>
                <span>Eventos academicos de alto impacto cada semestre</span>
              </article>
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="landing-hero__frame">
              <img src={currentHero.image} alt={currentHero.title} />
            </div>
            <div className="landing-hero__panel">
              <span>Excelencia institucional</span>
              <strong>Admisiones abiertas 2026</strong>
              <p>Conoce una propuesta academica con prestigio, acompanamiento y vision de futuro.</p>
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
            comunidad academica.
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
          <h2>Una experiencia educativa orientada a la excelencia</h2>
          <p>
            Programas, metodologias y entornos de aprendizaje pensados para lograr
            prestigio academico y desarrollo integral.
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
            Un recorrido visual por graduaciones, conferencias, laboratorios y momentos
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
            <span className="landing-section-tag landing-section-tag--light">Admision 2026</span>
            <h2>Un proceso claro, acompanado y alineado con tu proyecto de vida</h2>
            <p>
              Nuestro equipo orienta cada etapa para que el ingreso a la institucion
              sea tan inspirador como la experiencia academica que ofrecemos.
            </p>
          </div>

          <div className="landing-admissions__steps">
            {admissionSteps.map((item, index) => (
              <article key={item} className="landing-admissions__step">
                <strong>0{index + 1}</strong>
                <p>{item}</p>
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
              <li>
                <strong>24 MAR</strong>
                <span>Open house de programas y recorridos guiados</span>
              </li>
              <li>
                <strong>05 ABR</strong>
                <span>Sesion informativa para familias y aspirantes</span>
              </li>
              <li>
                <strong>19 ABR</strong>
                <span>Inicio de entrevistas y cierre del primer corte</span>
              </li>
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
            academica dentro y fuera del campus.
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
