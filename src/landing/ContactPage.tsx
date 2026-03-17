const ContactPage = () => {
  return (
    <div className="landing-page">
      <section className="landing-section">
        <p className="landing-eyebrow">Contactanos</p>
        <h1 className="landing-section__title">Estamos para atenderte</h1>
        <div className="landing-contact">
          <article className="landing-card">
            <h2>Sede principal</h2>
            <p>Calle Institucional 123, Ciudad Educativa</p>
          </article>
          <article className="landing-card">
            <h2>Telefono</h2>
            <p>+57 300 000 0000</p>
          </article>
          <article className="landing-card">
            <h2>Correo</h2>
            <p>contacto@institucion.edu.co</p>
          </article>
        </div>

        <article className="landing-card landing-contact__form">
          <h2>Canales de atencion</h2>
          <p>
            Puedes comunicarte con rectoria, coordinacion academica o secretaria
            institucional para recibir orientacion.
          </p>
        </article>
      </section>
    </div>
  );
};

export default ContactPage;
