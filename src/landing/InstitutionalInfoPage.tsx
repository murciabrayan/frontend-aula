import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useLandingContent } from "./LandingContentContext";

const fallbackDocuments = [
  {
    id: 1,
    title: "Proyecto Educativo Institucional",
    description:
      "Marco estratégico con lineamientos pedagógicos, horizonte institucional y metas formativas.",
    file_url: "/documents/pei-resumen.txt",
  },
  {
    id: 2,
    title: "Manual de convivencia",
    description:
      "Documento institucional con acuerdos, principios de comunidad y rutas de acompañamiento.",
    file_url: "/documents/manual-convivencia.txt",
  },
];

const values = [
  "Excelencia académica con enfoque humano.",
  "Innovación metodológica y pensamiento crítico.",
  "Convivencia, respeto y liderazgo transformador.",
];

const InstitutionalInfoPage = () => {
  const { content } = useLandingContent();
  const documents = content.documents.length ? content.documents : fallbackDocuments;
  const [documentPreviewUrls, setDocumentPreviewUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    let isMounted = true;
    const objectUrls: string[] = [];

    const loadPreviews = async () => {
      const entries = await Promise.all(
        documents.map(async (document) => {
          if (!document.file_url) return null;

          try {
            const response = await fetch(document.file_url);
            const blob = await response.blob();
            const isPdf =
              blob.type === "application/pdf" ||
              document.file_url.toLowerCase().endsWith(".pdf");

            if (!isPdf) return null;

            const objectUrl = window.URL.createObjectURL(blob);
            objectUrls.push(objectUrl);
            return [document.id, `${objectUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`] as const;
          } catch (error) {
            console.error("No se pudo generar la vista previa del documento institucional:", error);
            return null;
          }
        }),
      );

      if (!isMounted) return;

      setDocumentPreviewUrls(
        entries.reduce<Record<number, string>>((accumulator, entry) => {
          if (entry) accumulator[entry[0]] = entry[1];
          return accumulator;
        }, {}),
      );
    };

    void loadPreviews();

    return () => {
      isMounted = false;
      objectUrls.forEach((objectUrl) => window.URL.revokeObjectURL(objectUrl));
    };
  }, [documents]);

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
            Nuestro proyecto educativo integra rigor académico, acompañamiento humano
            y una visión moderna de la formación para responder a los desafíos del mundo actual.
          </p>
        </div>
      </section>

      <section className="landing-info-panels">
        <article className="landing-info-panel">
          <div className="landing-info-panel__header">
            <h2>Misión</h2>
          </div>
          <div className="landing-info-panel__body">
            <p>
              Formar estudiantes íntegros, autónomos y comprometidos con la excelencia,
              preparados para liderar con criterio ético, pensamiento analítico y sentido social.
            </p>
          </div>
        </article>
        <article className="landing-info-panel">
          <div className="landing-info-panel__header">
            <h2>Visión</h2>
          </div>
          <div className="landing-info-panel__body">
            <p>
              Consolidarnos como una institución referente por la calidad de sus procesos,
              el prestigio de su comunidad académica y la proyección de sus egresados.
            </p>
          </div>
        </article>
        <article className="landing-info-panel">
          <div className="landing-info-panel__header">
            <h2>Principios</h2>
          </div>
          <div className="landing-info-panel__body">
            <ul className="landing-bullet-list">
              {values.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="landing-document-section">
        <div className="landing-section-heading">
          <span className="landing-section-tag landing-section-tag--light">Documentación</span>
          <h2>Documentos institucionales disponibles para consulta</h2>
          <p>
            Facilita el acceso a la información clave de la institución con descargas
            claras, visibles y alineadas con una experiencia institucional premium.
          </p>
        </div>

        <div className="landing-document-grid">
          {documents.map((document) => (
            <article key={document.id} className="landing-document-card">
              <div className="landing-document-card__preview">
                {documentPreviewUrls[document.id] ? (
                  <iframe
                    src={documentPreviewUrls[document.id]}
                    title={`Vista previa de ${document.title}`}
                  />
                ) : (
                  <div className="landing-document-card__preview-fallback">
                    <div className="landing-document-card__icon">
                      <FileText size={24} />
                    </div>
                    <strong>{document.title}</strong>
                    <span>Vista previa no disponible</span>
                  </div>
                )}
                <div className="landing-document-card__preview-badge">
                  <FileText size={14} />
                  <span>PDF</span>
                </div>
              </div>
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
