import { useEffect, useMemo, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import {
  BookOpen,
  Compass,
  Download,
  FileText,
  Flag,
  HeartHandshake,
  Leaf,
  Music4,
  Shield,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import banderaInstitucional from "@/assets/bandera.png";
import escudoInstitucional from "@/assets/logo.png";
import himnoGimnasioAudio from "@/assets/himno-gimnasio.mp3";
import logoGimnasio from "@/assets/logogim.png";
import { useLandingContent } from "./LandingContentContext";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type SectionKey = "identity" | "symbols" | "documents";

type InstitutionalInfoPageProps = {
  section: SectionKey;
};

const fallbackDocuments = [
  {
    id: 1,
    title: "Proyecto Educativo Institucional",
    description:
      "Marco estratégico con lineamientos pedagógicos, horizonte institucional y metas formativas.",
    file_url: "/documents/pei-resumen.txt",
    preview_url: null,
  },
  {
    id: 2,
    title: "Manual de convivencia",
    description:
      "Documento institucional con acuerdos, principios de comunidad y rutas de acompañamiento.",
    file_url: "/documents/manual-convivencia.txt",
    preview_url: null,
  },
];

const identityHighlights = [
  {
    icon: Target,
    title: "Misión",
    preview:
      "La institución educativa Gimnasio Los Cerros trabaja para formar un estudiante integral, activo, autónomo, creativo, investigativo y con sentido de responsabilidad.",
    content: [
      "La Institución educativa Gimnasio Los Cerros, y sus directivas trabajan para que el alumno sea un ser integral, activo, que forme parte de su proceso enseñanza aprendizaje donde él saque sus propias conclusiones y llegue a la construcción de valores y conocimiento por medio de las bases que el docente le va fomentando en él, el desarrollo de su personalidad, creatividad y autonomía, motivándolo a la investigación y dándole un sentido a la responsabilidad.",
      "Por otra parte se le está inculcando la importancia que tiene la lectura, en primer lugar familiarizándolo con ambientes como la biblioteca, la ludoteca y la escritura de diferentes textos, para que ellos tengan claro el papel tan importante que juega la lectura en la investigación, ya que los conocimientos cambian día a día sin dejar la importancia de las demás áreas y de formar en ellos un pensamiento crítico por medio del análisis y la construcción de textos.",
    ],
  },
  {
    icon: Compass,
    title: "Visión",
    preview:
      "Para 2028, el Gimnasio Los Cerros busca consolidarse como una institución reconocida por calidad educativa, innovación, valores y acompañamiento a las familias.",
    content: [
      "Para el 2028 El Gimnasio Los Cerros será una institución reconocida por sus altos índices de calidad educativa, cumpliendo con las metas propuestas por la Secretaría de Educación Departamental y por los requerimientos del Ministerio de Educación Nacional.",
      "Será una institución que se caracteriza por la formación integral que ofrece a su comunidad educativa teniendo como premisa la autonomía y ética, de sus docentes y estudiantes.",
      "Será una institución que fomente la innovación pedagógica, la actualización constante en nuevas tecnologías las cuales le proporcionarán a todos nuestros graduados de quinto las capacidades y competencias que le permitan asumir de manera adecuada el ingreso a la educación básica secundaria y media vocacional.",
      "Será una institución reconocida por el acompañamiento a los padres de familia con el ánimo de propiciar ambientes seguros y hábitos para sus hijos.",
      "Será una institución que fundamenta su oferta educativa en valores como el respeto, la responsabilidad y rectitud, forjando estudiantes con la capacidad de generar e implementar alternativas para la transformación social con impacto.",
      "Será una institución educativa con sede propia, con los espacios adecuados que permitan el desarrollo integral de todos nuestros estudiantes.",
    ],
  },
  {
    icon: Sparkles,
    title: "Filosofía",
    preview:
      "Los estudiantes son el centro y razón de ser del colegio, dentro de una propuesta humanista, investigativa, comunicativa y comprometida con la diversidad.",
    content: [
      "Los estudiantes son el centro y razón de ser del Gimnasio Los Cerros, y por ello tenemos una fe inquebrantable en sus capacidades individuales para aprender y lograr el éxito.",
      "Nuestras metas académicas son altas aspirando a conseguir la excelencia. Se enseña en el amor que es el mayor reto en la vida pues para ello se necesita una gran fortaleza.",
      "Nos estamos proponiendo cambiar la educación formativa y memorística por una educación más humanista, investigativa y comunicativa que permita a los educandos y padres de familia participar en el proceso educativo y en el cual aprender y comprender no sea un problema más para los padres de familia, los niños y las niñas.",
      "Existe aquí un gran compromiso con la educación, basada en los valores espirituales y morales que conforman nuestra idiosincrasia y promueven el orgullo y respeto por nuestra herencia cultural. Al mismo tiempo se enseña con el ejemplo a respetar la diversidad de opiniones, modos de vida y creencias de otras personas, además se incentivará el desarrollo del aprecio por los recursos de nuestro país y el mundo, y el deseo de practicar la conservación de nuestro medio ambiente en nuestro planeta que es el hogar de todos.",
      "El Gimnasio Los Cerros, proporciona un ambiente de respeto y aceptación por la diversidad cultural, grupos étnicos, religiosos de todos los miembros de la comunidad educativa, promovemos el crecimiento de la autoestima a través de la participación abierta y activa en las diferentes actividades y programas educativos.",
      "Educar es el avivar la llama de la curiosidad y el compromiso por los valores democráticos de vida de un pueblo, por lo tanto nuestro colegio es un modelo de micro sociedad democrática donde se fomenta la participación activa de todos sus miembros, se respeten sus derechos y donde cada cual cumpla con sus deberes.",
    ],
  },
];

const principles = [
  {
    icon: HeartHandshake,
    title: "Formacion en valores",
    text: "Promovemos respeto, tolerancia, justicia, diálogo, lealtad, honestidad, sentido de pertenencia, solidaridad y responsabilidad.",
  },
  {
    icon: Users,
    title: "Derechos y deberes",
    text: "La comunidad educativa participa activamente en el desarrollo del estudiante, la familia y el territorio.",
  },
  {
    icon: BookOpen,
    title: "Investigación y lectura",
    text: "El proyecto institucional impulsa lectura, escritura, pensamiento crítico e investigación como parte del aprendizaje diario.",
  },
  {
    icon: Shield,
    title: "Bienestar y acompañamiento",
    text: "Cada estudiante es guiado según su proceso en un ambiente de seguridad, cercanía y crecimiento integral.",
  },
];

const valueHighlights = [
  "Amor a Dios y respeto por la dignidad humana.",
  "Responsabilidad y cumplimiento espontaneo de las obligaciones.",
  "Honestidad, rectitud y transparencia en cada decisión.",
  "Solidaridad, empatía, convivencia pacífica y vocación de servicio.",
  "Liderazgo con capacidad de orientar y comprometer a otros hacia el bien común.",
];

const studentProfile = [
  "Alegre, receptivo, respetuoso, responsable y participativo.",
  "Seguro de sí mismo, con sentido de pertenencia por la institución, el municipio y el país.",
  "Capaz de amar la verdad, pensar críticamente y evaluar los acontecimientos con criterio.",
  "Comprometido con sus relaciones interpersonales y con la defensa de la naturaleza.",
];

const teacherProfile = [
  "Profesionales con amor por Dios, vocación, creatividad y liderazgo.",
  "Capaces de adaptarse a los cambios y comunicar con claridad, asertividad y cercanía.",
  "Con excelentes relaciones interpersonales y expresión oral enriquecida por su lenguaje gestual.",
  "Docentes amorosos, inteligentes, carismáticos y comprometidos con la formación integral.",
];

const symbols = [
  {
    title: "Bandera",
    image: banderaInstitucional,
    text: "El verde habla de naturaleza y vida; el amarillo expresa alegría, energía e inteligencia; el azul simboliza confianza y formación del ser.",
  },
  {
    title: "Escudo",
    image: escudoInstitucional,
    text: "Reúne medio ambiente, ciencia, historia, deporte y cultura, en diálogo con los cerros que dan identidad al municipio y al colegio.",
  },
  {
    title: "Logo",
    image: logoGimnasio,
    text: "El libro abierto representa sabiduría; los engranes, trabajo en equipo y pertenencia; el círculo expresa amor y pasión por aprender.",
  },
];

const anthemLyrics = [
  {
    title: "I",
    lines: [
      "En la cima brilla un sueño,",
      "con honor y con valor.",
      "Unidos por la enseñanza,",
      "con esfuerzo y con amor.",
    ],
  },
  {
    title: "Coro",
    lines: [
      "Gimnasio en los Cerros, faro de luz.",
      "Forjamos el alma, la ciencia y virtud.",
      "Con paso firme, con fe y honor,",
      "hacia el futuro con gran esplendor.",
    ],
  },
  {
    title: "II",
    lines: [
      "La montaña nos inspira,",
      "su grandeza bajo el sol.",
      "Con respeto y con entrega,",
      "levantamos nuestra voz.",
    ],
  },
  {
    title: "Coro",
    lines: [
      "Gimnasio en los Cerros, faro de luz.",
      "Forjamos el alma, la ciencia y virtud.",
      "Con paso firme, con fe y honor,",
      "hacia el futuro con gran esplendor.",
    ],
  },
  {
    title: "III",
    lines: [
      "Tus aulas son faros de esperanza y unión,",
      "forjando carácter con gran convicción.",
      "El verde nos llama a cuidar y crecer,",
      "el amarillo a brillar y vencer.",
    ],
  },
  {
    title: "Coro",
    lines: [
      "Gimnasio en los Cerros, faro de luz.",
      "Forjamos el alma, la ciencia y virtud.",
      "Con paso firme, con fe y honor,",
      "hacia el futuro con gran esplendor.",
    ],
  },
];

const pageMeta: Record<
  SectionKey,
  {
    tag: string;
    title: string;
    description: string;
  }
> = {
  identity: {
    tag: "Nosotros",
    title: "Identidad institucional",
    description:
      "Una lectura más clara de nuestra misión, visión, filosofía, perfiles y principios que orientan la experiencia educativa.",
  },
  symbols: {
    tag: "Nosotros",
    title: "Símbolos institucionales",
    description:
      "Un recorrido visual por los emblemas que representan la historia, el sentido de pertenencia y la voz del colegio.",
  },
  documents: {
    tag: "Nosotros",
    title: "Documentos institucionales",
    description:
      "Accede a los archivos base del proyecto educativo en una vista más ordenada, elegante y fácil de consultar.",
  },
};

const anthemEmbedUrl = "https://www.youtube.com/embed/5esbclQLsrM?rel=0";

const InstitutionalInfoPage = ({ section }: InstitutionalInfoPageProps) => {
  const { content } = useLandingContent();
  const documents = content.documents.length ? content.documents : fallbackDocuments;
  const [documentPreviewImages, setDocumentPreviewImages] = useState<Record<number, string>>({});
  const [activeIdentityCard, setActiveIdentityCard] = useState<(typeof identityHighlights)[number] | null>(null);

  const currentPage = useMemo(() => pageMeta[section], [section]);

  useEffect(() => {
    let isMounted = true;
    let cancelled = false;

    const loadPreviews = async () => {
      const entries = await Promise.all(
        documents.map(async (docItem) => {
          const previewSource = docItem.preview_url || docItem.file_url;
          if (!previewSource) return null;

          try {
            const response = await fetch(previewSource, {
              method: "GET",
              credentials: "omit",
            });

            if (!response.ok) {
              return null;
            }

            const fileBytes = await response.arrayBuffer();
            const contentType = response.headers.get("content-type")?.toLowerCase() || "";
            const isPdf =
              contentType.includes("application/pdf") ||
              previewSource.toLowerCase().includes(".pdf");

            if (!isPdf) return null;

            const pdf = await getDocument({ data: fileBytes }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.6 });
            const canvas = window.document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
              return null;
            }

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
              canvas,
              canvasContext: context,
              viewport,
            }).promise;

            return [docItem.id, canvas.toDataURL("image/png")] as const;
          } catch (error) {
            console.error("No se pudo generar la vista previa del documento institucional:", error);
            return null;
          }
        }),
      );

      if (!isMounted || cancelled) return;

      setDocumentPreviewImages(
        entries.reduce<Record<number, string>>((accumulator, entry) => {
          if (entry) accumulator[entry[0]] = entry[1];
          return accumulator;
        }, {}),
      );
    };

    void loadPreviews();

    return () => {
      isMounted = false;
      cancelled = true;
    };
  }, [documents]);

  const buildDownloadUrl = (fileUrl: string | null) => {
    return fileUrl || "#";
  };

  return (
    <div className="landing-page">
      <section className="landing-inner-hero landing-inner-hero--dark landing-inner-hero--institutional">
        <div className="landing-section-heading landing-section-heading--dark">
          <span className="landing-section-tag">{currentPage.tag}</span>
          <h1>{currentPage.title}</h1>
          <p>{currentPage.description}</p>
        </div>
      </section>

      {section === "identity" ? (
        <>
          <section className="landing-identity-showcase">
            <div className="landing-identity-showcase__intro">
              <span className="landing-section-tag landing-section-tag--light">Horizonte</span>
              <h2>La identidad del colegio se expresa en propósito, proyección y forma de educar</h2>
              <p>
                Organizar esta información por capas permite leer mejor el sentido institucional,
                sin saturar la página ni repetir elementos visuales innecesarios.
              </p>
            </div>

            <div className="landing-identity-showcase__grid">
              {identityHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    className="landing-identity-card"
                    onClick={() => setActiveIdentityCard(item)}
                  >
                    <div className="landing-identity-card__head">
                      <div className="landing-identity-card__icon">
                        <Icon size={18} />
                      </div>
                      <h3>{item.title}</h3>
                    </div>
                    <div className="landing-identity-card__copy">
                      <p>{item.preview}</p>
                      <span className="landing-identity-card__link">Ver texto completo</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="landing-identity-columns">
            <article className="landing-identity-panel landing-identity-panel--profiles">
              <div className="landing-identity-panel__heading">
                <span className="landing-section-tag landing-section-tag--light">Comunidad</span>
                <h2>Perfiles de la comunidad educativa</h2>
              </div>

              <div className="landing-profile-grid">
                <article className="landing-profile-card">
                  <div className="landing-profile-card__header">
                    <Leaf size={20} />
                    <h3>Perfil del estudiante</h3>
                  </div>
                  <ul className="landing-bullet-list">
                    {studentProfile.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="landing-profile-card">
                  <div className="landing-profile-card__header">
                    <Users size={20} />
                    <h3>Perfil del docente</h3>
                  </div>
                  <ul className="landing-bullet-list">
                    {teacherProfile.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </article>

            <article className="landing-identity-panel landing-identity-panel--principles">
              <div className="landing-identity-panel__heading">
                <span className="landing-section-tag landing-section-tag--light">Principios</span>
                <h2>Principios y valores que orientan la vida escolar</h2>
              </div>

              <div className="landing-principles-grid">
                {principles.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article key={item.title} className="landing-principle-card">
                      <div className="landing-principle-card__icon">
                        <Icon size={20} />
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </article>
                  );
                })}
              </div>

              <div className="landing-value-band">
                <div className="landing-value-band__copy">
                  <span className="landing-section-tag landing-section-tag--light">Valores</span>
                  <h3>Lo que debe reflejar la familia Gimnasio Los Cerros</h3>
                  <p>
                    Amor, respeto, justicia, servicio, convivencia, superación personal,
                    honestidad, solidaridad, liderazgo y libertad responsable.
                  </p>
                </div>
                <ul className="landing-bullet-list">
                  {valueHighlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          </section>
        </>
      ) : null}

      {section === "symbols" ? (
        <>
          <section className="landing-symbols-stage">
            <article className="landing-symbols-panel landing-symbols-panel--flag">
              <div className="landing-symbols-panel__title">
                <Flag size={16} />
                <span>Bandera</span>
              </div>

              <div className="landing-symbols-panel__content landing-symbols-panel__content--hero">
                <div className="landing-symbols-panel__image landing-symbols-panel__image--flag">
                  <img src={banderaInstitucional} alt="Bandera institucional" />
                </div>
                <div className="landing-symbols-panel__copy">
                  <p className="landing-symbols-panel__quote">
                    Nuestros colores, nuestra identidad, nuestro compromiso.
                  </p>
                  <p>{symbols[0].text}</p>
                </div>
              </div>
            </article>

            <div className="landing-symbols-grid-panel">
              <article className="landing-symbols-panel">
                <div className="landing-symbols-panel__title">
                  <Shield size={16} />
                  <span>Escudo</span>
                </div>

                <div className="landing-symbols-panel__content landing-symbols-panel__content--stacked">
                  <div className="landing-symbols-panel__image">
                    <img src={escudoInstitucional} alt="Escudo institucional" />
                  </div>
                  <div className="landing-symbols-panel__copy">
                    <p>{symbols[1].text}</p>
                  </div>
                </div>
              </article>

              <article className="landing-symbols-panel">
                <div className="landing-symbols-panel__title">
                  <Sparkles size={16} />
                  <span>Logo</span>
                </div>

                <div className="landing-symbols-panel__content landing-symbols-panel__content--stacked">
                  <div className="landing-symbols-panel__image">
                    <img src={logoGimnasio} alt="Logo institucional" />
                  </div>
                  <div className="landing-symbols-panel__copy">
                    <p>{symbols[2].text}</p>
                  </div>
                </div>
              </article>
            </div>

            <article className="landing-symbols-panel landing-symbols-panel--anthem">
              <div className="landing-symbols-panel__title">
                <Music4 size={16} />
                <span>Himno institucional</span>
              </div>

              <div className="landing-symbols-panel__anthem">
                <div className="landing-symbols-panel__anthem-media">
                  <div className="landing-anthem-embed">
                    <iframe
                      src={anthemEmbedUrl}
                      title="Himno Gimnasio Los Cerros"
                      className="landing-anthem-embed__frame"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>

                <article className="landing-anthem-lyrics landing-anthem-lyrics--symbols">
                  <div className="landing-anthem-lyrics__header">
                    <div>
                      <span className="landing-section-tag">Letra</span>
                      <h3>Letra del himno</h3>
                    </div>
                    <a
                      href={himnoGimnasioAudio}
                      download="himno-gimnasio.mp3"
                      className="landing-btn landing-btn--ghost"
                    >
                      <Download size={16} />
                      <span>Descargar audio</span>
                    </a>
                  </div>

                  <div className="landing-anthem-lyrics__grid">
                    {anthemLyrics.map((verse, index) => (
                      <article key={`${verse.title}-${index}`} className="landing-anthem-verse">
                        <strong>{verse.title}</strong>
                        {verse.lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </article>
                    ))}
                  </div>
                </article>
              </div>
            </article>
          </section>
        </>
      ) : null}

      {section === "documents" ? (
        <>
          <section className="landing-document-grid landing-document-grid--institutional">
            {documents.map((document) => (
              <article key={document.id} className="landing-document-card">
                <div className="landing-document-card__preview">
                  {documentPreviewImages[document.id] ? (
                    <img
                      src={documentPreviewImages[document.id]}
                      alt={`Vista previa de ${document.title}`}
                      className="landing-document-card__preview-image"
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

                <div className="landing-document-card__content">
                    <span className="landing-document-card__eyebrow">Documento institucional</span>
                  <h3>{document.title}</h3>
                  <p>{document.description}</p>
                </div>

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
                    href={buildDownloadUrl(document.file_url)}
                    className="landing-btn landing-btn--primary"
                  >
                    Descargar
                  </a>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}

      {activeIdentityCard ? (
        <div className="landing-news-modal__overlay" onClick={() => setActiveIdentityCard(null)}>
          <div className="landing-news-modal landing-identity-modal" onClick={(event) => event.stopPropagation()}>
            <div className="landing-news-modal__header">
              <div>
                <span className="landing-section-tag landing-section-tag--light">Identidad</span>
                <h2>{activeIdentityCard.title}</h2>
              </div>
              <button
                type="button"
                className="landing-news-modal__close"
                onClick={() => setActiveIdentityCard(null)}
                aria-label={`Cerrar ${activeIdentityCard.title}`}
              >
                <X size={18} />
              </button>
            </div>
            <div className="landing-news-modal__body">
              <div className="landing-identity-modal__content">
                {activeIdentityCard.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
};

export default InstitutionalInfoPage;
