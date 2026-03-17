const documents = [
  {
    title: "Proyecto Educativo Institucional",
    description: "Resumen institucional para consulta general de la comunidad.",
    href: "/documents/pei-resumen.txt",
  },
  {
    title: "Manual de convivencia",
    description: "Documento base con lineamientos de convivencia y participacion.",
    href: "/documents/manual-convivencia.txt",
  },
];

const InstitutionalInfoPage = () => {
  return (
    <div className="landing-page">
      <section className="landing-section">
        <p className="landing-eyebrow">Informacion institucional</p>
        <h1 className="landing-section__title">Identidad y horizonte formativo</h1>
        <div className="landing-info-grid">
          <article className="landing-card">
            <h2>Mision</h2>
            <p>
              Formar estudiantes integros con sentido etico, compromiso social y
              competencias academicas para transformar su entorno.
            </p>
          </article>
          <article className="landing-card">
            <h2>Vision</h2>
            <p>
              Ser una institucion reconocida por su calidad humana, excelencia
              academica e innovacion en los procesos educativos.
            </p>
          </article>
          <article className="landing-card">
            <h2>Principios</h2>
            <p>
              Respeto, responsabilidad, inclusion, convivencia, participacion y
              construccion de proyecto de vida.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section__subtitle">Documentos institucionales</h2>
        <div className="landing-docs">
          {documents.map((document) => (
            <article key={document.title} className="landing-card landing-doc">
              <h3>{document.title}</h3>
              <p>{document.description}</p>
              <a href={document.href} download className="landing-card__link">
                Descargar documento
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InstitutionalInfoPage;
