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
  return (
    <div className="landing-page">
      <section className="landing-inner-hero">
        <div className="landing-section-heading">
          <span className="landing-section-tag">Contacto</span>
          <h1>Estamos listos para acompanarte en tu proceso</h1>
          <p>
            Conecta con nuestro equipo institucional para resolver dudas sobre admisiones,
            programas, servicios y oportunidades de vinculacion.
          </p>
        </div>
      </section>

      <section className="landing-contact-grid">
        {contactCards.map((item) => (
          <article key={item.title} className="landing-contact-card">
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="landing-contact-banner">
        <div>
          <span className="landing-section-tag landing-section-tag--light">Canales de atencion</span>
          <h2>Agenda una asesoria con nuestro equipo institucional</h2>
          <p>
            Rectora, coordinacion academica, bienestar y secretaria te orientan con
            una atencion clara, humana y profesional.
          </p>
        </div>
        <a href="mailto:admisiones@institucion.edu.co" className="landing-btn landing-btn--primary">
          Escribir ahora
        </a>
      </section>
    </div>
  );
};

export default ContactPage;
