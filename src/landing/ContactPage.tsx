import { useState } from "react";
import type { FormEvent } from "react";

const contactCards = [
  {
    title: "Sede principal",
    text: "Avenida del Conocimiento 245, Bogota. Campus con ambientes academicos, culturales y de bienestar.",
  },
  {
    title: "Linea de atencion",
    text: "+57 601 555 1010. Equipo disponible para orientar procesos de admision, convenios y vida institucional.",
  },
  {
    title: "Correo institucional",
    text: "contacto@institucion.edu.co. Respuesta prioritaria para aspirantes, familias y comunidad academica.",
  },
];

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="landing-page">
      <section className="landing-inner-hero landing-inner-hero--dark">
        <div className="landing-section-heading landing-section-heading--dark">
          <span className="landing-section-tag">Contacto</span>
          <h1>Estamos listos para acompanarte en tu proceso</h1>
          <p>
            Conecta con nuestro equipo institucional para resolver dudas sobre admisiones,
            programas, servicios y oportunidades de vinculacion.
          </p>
        </div>
      </section>

      <section className="landing-contact-workspace">
        <article className="landing-contact-form-card">
          <div className="landing-section-heading">
            <span className="landing-section-tag landing-section-tag--light">Escribenos</span>
            <h2>Envianos tu mensaje</h2>
            <p>
              Comparte tus datos y el motivo de contacto. Nuestro equipo institucional
              te dara respuesta a traves de los canales oficiales.
            </p>
          </div>

          <form className="landing-contact-form" onSubmit={handleSubmit}>
            <div className="landing-contact-form__grid">
              <label>
                <span>Nombre completo</span>
                <input type="text" name="name" placeholder="Tu nombre" required />
              </label>
              <label>
                <span>Correo electronico</span>
                <input type="email" name="email" placeholder="correo@ejemplo.com" required />
              </label>
              <label>
                <span>Telefono</span>
                <input type="tel" name="phone" placeholder="+57 300 000 0000" />
              </label>
              <label>
                <span>Asunto</span>
                <input type="text" name="subject" placeholder="Admision, matriculas, informacion..." required />
              </label>
            </div>

            <label className="landing-contact-form__full">
              <span>Mensaje</span>
              <textarea
                name="message"
                rows={6}
                placeholder="Cuentanos como podemos ayudarte"
                required
              />
            </label>

            <div className="landing-contact-form__footer">
              <button type="submit" className="landing-btn landing-btn--primary">
                Enviar mensaje
              </button>
              {submitted ? (
                <p className="landing-contact-form__success">
                  Tu mensaje quedo listo para envio. Ya puedes conectarlo al backend o a un servicio de correo.
                </p>
              ) : null}
            </div>
          </form>
        </article>

        <article className="landing-map-card">
          <div className="landing-section-heading">
            <span className="landing-section-tag landing-section-tag--light">Ubicacion</span>
            <h2>Encuentranos facilmente</h2>
            <p>
              Consulta la ubicacion del colegio y orienta tu visita con una referencia visual clara.
            </p>
          </div>

          <div className="landing-map-frame">
            <iframe
              title="Ubicacion de la institucion"
              src="https://www.google.com/maps?q=Bogota%20Colombia&z=14&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </article>
      </section>

      <section className="landing-contact-grid">
        {contactCards.map((item) => (
          <article key={item.title} className="landing-contact-card">
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default ContactPage;
