import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Megaphone,
} from "lucide-react";
import heroImageA from "@/assets/login-side.jpg";
import heroImageB from "@/assets/2.png";
import heroImageC from "@/assets/logo.png";

const slides = [
  {
    image: heroImageA,
    title: "Formacion integral con identidad institucional",
    text: "Construimos comunidad, excelencia academica y acompanamiento permanente.",
  },
  {
    image: heroImageB,
    title: "Experiencias educativas con sentido humano",
    text: "Una institucion que conecta proyecto de vida, convivencia y aprendizaje.",
  },
  {
    image: heroImageC,
    title: "Tecnologia al servicio de la comunidad educativa",
    text: "Informacion, seguimiento y comunicacion desde una plataforma unificada.",
  },
];

const news = [
  {
    title: "Semana institucional de ciencia y creatividad",
    date: "Abril 12",
    description: "Exposiciones, proyectos y experiencias de aula para toda la comunidad.",
  },
  {
    title: "Encuentro con familias y docentes",
    date: "Abril 18",
    description: "Espacio de dialogo para fortalecer acompanamiento academico y convivencia.",
  },
  {
    title: "Jornada cultural y deportiva",
    date: "Abril 27",
    description: "Actividades artisticas, deportivas y recreativas en la sede principal.",
  },
];

const calendarEvents = [
  { day: "08", label: "Consejo academico" },
  { day: "12", label: "Feria de proyectos" },
  { day: "18", label: "Reunion con familias" },
  { day: "27", label: "Muestra cultural" },
];

const socialLinks = [
  { label: "Facebook", handle: "@InstitucionEducativa" },
  { label: "Instagram", handle: "@institucion.educativa" },
  { label: "YouTube", handle: "Canal Institucional" },
];

const LandingHomePage = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = slides[activeSlide];

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="landing-eyebrow">Bienvenidos</p>
          <h1>{currentSlide.title}</h1>
          <p>{currentSlide.text}</p>
          <div className="landing-hero__actions">
            <Link to="/institucional" className="landing-btn landing-btn--primary">
              Conocer la institucion
            </Link>
            <Link to="/contacto" className="landing-btn landing-btn--secondary">
              Contactanos
            </Link>
          </div>
        </div>

        <div className="landing-carousel">
          <div
            className="landing-carousel__image"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          />

          <div className="landing-carousel__controls">
            <button
              type="button"
              onClick={() =>
                setActiveSlide((current) => (current - 1 + slides.length) % slides.length)
              }
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="landing-carousel__dots">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={index === activeSlide ? "is-active" : ""}
                onClick={() => setActiveSlide(index)}
                aria-label={`Ir a ${slide.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="landing-grid">
        <article className="landing-card">
          <div className="landing-card__header">
            <FileText size={18} />
            <h2>Informacion institucional</h2>
          </div>
          <p>
            Conoce nuestra propuesta educativa, principios institucionales,
            organizacion academica y documentos oficiales.
          </p>
          <Link to="/institucional" className="landing-card__link">
            Ver mision, vision y documentos
          </Link>
        </article>

        <article className="landing-card">
          <div className="landing-card__header">
            <Megaphone size={18} />
            <h2>Noticias y eventos</h2>
          </div>
          <div className="landing-news">
            {news.map((item) => (
              <div key={item.title} className="landing-news__item">
                <span>{item.date}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="landing-calendar">
        <div className="landing-card__header">
          <CalendarDays size={18} />
          <h2>Calendario institucional</h2>
        </div>
        <div className="landing-calendar__grid">
          {calendarEvents.map((event) => (
            <div key={event.label} className="landing-calendar__event">
              <strong>{event.day}</strong>
              <span>{event.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-social">
        <div>
          <p className="landing-eyebrow">Comunidad digital</p>
          <h2>Siguenos en nuestras redes</h2>
        </div>
        <div className="landing-social__grid">
          {socialLinks.map((item) => (
            <div key={item.label} className="landing-social__card">
              <strong>{item.label}</strong>
              <span>{item.handle}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <p className="landing-eyebrow">Acceso rapido</p>
          <h2>Ingresa a la plataforma institucional</h2>
        </div>
        <Link to="/plataforma" className="landing-btn landing-btn--primary">
          Ir al login
        </Link>
      </section>
    </div>
  );
};

export default LandingHomePage;
