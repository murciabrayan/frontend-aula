import { useLandingContent } from "./LandingContentContext";

const fallbackDocuments = [
  {
    id: 1,
    title: "Proyecto Educativo Institucional",
    description:
      "Marco estrategico con lineamientos pedagogicos, horizonte institucional y metas formativas.",
    file_url: "/documents/pei-resumen.txt",
  },
  {
    id: 2,
    title: "Manual de convivencia",
    description:
      "Documento institucional con acuerdos, principios de comunidad y rutas de acompanamiento.",
    file_url: "/documents/manual-convivencia.txt",
  },
];

const values = [
  "Excelencia academica con enfoque humano.",
  "Innovacion metodologica y pensamiento critico.",
  "Convivencia, respeto y liderazgo transformador.",
];

const InstitutionalInfoPage = () => {
  const { content } = useLandingContent();
  const documents = content.documents.length ? content.documents : fallbackDocuments;

  const handleDownload = async (fileUrl: string | null, title: string) => {
    if (!fileUrl) return;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const extension =
        blob.type === "application/pdf"
          ? ".pdf"
          : fileUrl.split(".").pop()
            ? `.${fileUrl.split(".").pop()}`
            : "";

      link.href = objectUrl;
      link.download = `${title}${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("No se pudo descargar el documento:", error);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="landing-page">
      <section className="landing-inner-hero landing-inner-hero--dark">
        <div className="landing-section-heading landing-section-heading--dark">
          <span className="landing-section-tag">Nosotros</span>
          <h1>Una identidad institucional construida para inspirar excelencia</h1>
          <p>
            Nuestro proyecto educativo integra rigor academico, acompanamiento humano
            y una vision moderna de la formacion para responder a los desafios del mundo actual.
          </p>
        </div>
      </section>

      <section className="landing-info-panels">
        <article className="landing-info-panel">
          <h2>Mision</h2>
          <p>
            Formar estudiantes integros, autonomos y comprometidos con la excelencia,
            preparados para liderar con criterio etico, pensamiento analitico y sentido social.
          </p>
        </article>
        <article className="landing-info-panel">
          <h2>Vision</h2>
          <p>
            Consolidarnos como una institucion referente por la calidad de sus procesos,
            el prestigio de su comunidad academica y la proyeccion de sus egresados.
          </p>
        </article>
        <article className="landing-info-panel">
          <h2>Principios</h2>
          <ul className="landing-bullet-list">
            {values.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="landing-document-section">
        <div className="landing-section-heading">
          <span className="landing-section-tag landing-section-tag--light">Documentacion</span>
          <h2>Documentos institucionales disponibles para consulta</h2>
          <p>
            Facilita el acceso a la informacion clave de la institucion con descargas
            claras, visibles y alineadas con una experiencia institucional premium.
          </p>
        </div>

        <div className="landing-document-grid">
          {documents.map((document) => (
            <article key={document.id} className="landing-document-card">
              <h3>{document.title}</h3>
              <p>{document.description}</p>
              <div className="landing-document-card__actions">
                <a
                  href={document.file_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="landing-btn landing-btn--ghost-dark"
                >
                  Visualizar en vivo
                </a>
                <a
                  href={document.file_url || "#"}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleDownload(document.file_url, document.title);
                  }}
                  className="landing-btn landing-btn--primary"
                >
                  Descargar
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InstitutionalInfoPage;
