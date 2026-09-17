import { jsPDF } from "jspdf";

import schoolLogo from "@/assets/logo.png";
import type { User } from "@/types/User";
import { PARENTESCO_OPTIONS } from "@/types/User";

/* ==========================================================================
   Sistema de diseño de los PDF institucionales.
   Ambos documentos (listado general y ficha individual) comparten la misma
   paleta y primitivas: banda oscura con filete dorado, titulos de seccion en
   dorado y campos "apilados" (etiqueta pequeña arriba, valor destacado).
   ========================================================================== */

const MARGIN = 14;
const SCHOOL_NAME = "GIMNASIO LOS CERROS";
const SCHOOL_SUBTITLE = "Registro institucional";

const INK = [17, 18, 24] as const;
const GOLD = [178, 141, 58] as const;
const GOLD_SOFT = [246, 241, 228] as const;
const LINE = [226, 222, 212] as const;
const SOFT = [250, 249, 245] as const;
const TEXT = [34, 34, 38] as const;
const MUTED = [122, 119, 112] as const;
const WHITE = [255, 255, 255] as const;

// Metricas de un campo apilado (etiqueta + valor).
const LABEL_TO_VALUE = 4.2;
const VALUE_LINE_HEIGHT = 3.7;
const FIELD_BOTTOM_GAP = 3.6;
const SECTION_LABEL_HEIGHT = 5.6;

type PdfField = {
  label: string;
  value: string;
};

type FieldGroup = {
  title: string;
  fields: PdfField[];
};

const parentescoLabel = (value?: string) =>
  PARENTESCO_OPTIONS.find((option) => option.value === value)?.label || "";

const loadImageDataUrl = (src: string) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo crear el contexto del logo."));
        return;
      }
      ctx.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = src;
  });

const sanitizeFileName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const ensurePdfFileName = (value: string) =>
  value.toLowerCase().endsWith(".pdf") ? value : `${value}.pdf`;

const normalizeText = (value?: string | null) => (value || "").trim() || "No registrado";

const buildFullName = (user: User) =>
  `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Sin nombre";

const buildCourseLabel = (user: User) =>
  user.course_names?.length ? user.course_names.join(", ") : "Sin curso asignado";

const buildRoleLabel = (role: User["role"]) => {
  if (role === "STUDENT") return "Estudiante";
  if (role === "TEACHER") return "Docente";
  return "Administrador";
};

const buildDocumentLabel = (role: User["role"]) =>
  role === "STUDENT" ? "Tarjeta de identidad" : "Documento";

const groupUsersByCourse = (users: User[]) => {
  const grouped = new Map<string, User[]>();

  users.forEach((user) => {
    const courseKeys =
      user.course_names?.length
        ? user.course_names.map((course) => course.trim()).filter(Boolean)
        : ["Sin curso asignado"];

    courseKeys.forEach((courseKey) => {
      const courseUsers = grouped.get(courseKey) || [];
      courseUsers.push(user);
      grouped.set(courseKey, courseUsers);
    });
  });

  return Array.from(grouped.entries()).sort(([courseA], [courseB]) =>
    courseA.localeCompare(courseB, "es")
  );
};

const formattedToday = () =>
  new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const pageWidthOf = (doc: jsPDF) => doc.internal.pageSize.getWidth();
const pageHeightOf = (doc: jsPDF) => doc.internal.pageSize.getHeight();
const contentWidthOf = (doc: jsPDF) => pageWidthOf(doc) - MARGIN * 2;

/* --------------------------------------------------------------------------
   Primitivas de dibujo
   -------------------------------------------------------------------------- */

interface BrandHeaderOptions {
  eyebrow: string;
  title: string;
  meta?: string;
  logoData?: string | null;
}

const drawBrandHeader = (doc: jsPDF, options: BrandHeaderOptions) => {
  const width = contentWidthOf(doc);
  const bandHeight = 24;

  doc.setFillColor(...INK);
  doc.rect(MARGIN, MARGIN, width, bandHeight, "F");
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, MARGIN + bandHeight, width, 1.3, "F");

  if (options.logoData) {
    try {
      doc.addImage(options.logoData, "PNG", MARGIN + 5, MARGIN + 5, 14, 14, undefined, "FAST");
    } catch {
      // Un logo invalido no debe impedir la generacion del documento.
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...WHITE);
  doc.text(SCHOOL_NAME, MARGIN + 23, MARGIN + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...GOLD);
  doc.text(SCHOOL_SUBTITLE.toUpperCase(), MARGIN + 23, MARGIN + 16.5);

  const rightX = MARGIN + width - 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...WHITE);
  doc.text(options.title, rightX, MARGIN + 11, { align: "right" });

  if (options.eyebrow) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(...GOLD);
    doc.text(options.eyebrow.toUpperCase(), rightX, MARGIN + 16.5, { align: "right" });
  }

  if (options.meta) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(214, 210, 200);
    doc.text(options.meta, rightX, MARGIN + 21, { align: "right" });
  }

  return MARGIN + bandHeight + 9;
};

/** Banda compacta para las paginas de continuacion. */
const drawContinuationHeader = (doc: jsPDF, title: string) => {
  const width = contentWidthOf(doc);

  doc.setFillColor(...INK);
  doc.rect(MARGIN, MARGIN, width, 10, "F");
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, MARGIN + 10, width, 0.9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.4);
  doc.setTextColor(...WHITE);
  doc.text(SCHOOL_NAME, MARGIN + 4, MARGIN + 6.6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.6);
  doc.setTextColor(...GOLD);
  doc.text(title, MARGIN + width - 4, MARGIN + 6.6, { align: "right" });

  return MARGIN + 10 + 7;
};

const drawSectionLabel = (doc: jsPDF, text: string, x: number, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...GOLD);
  doc.text(text.toUpperCase(), x, y);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.45);
  doc.line(x, y + 1.7, x + 9, y + 1.7);

  return y + SECTION_LABEL_HEIGHT;
};

const measureFieldHeight = (doc: jsPDF, value: string, width: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  const lines = doc.splitTextToSize(value, width);
  return LABEL_TO_VALUE + (lines.length - 1) * VALUE_LINE_HEIGHT + FIELD_BOTTOM_GAP;
};

const drawField = (
  doc: jsPDF,
  field: PdfField,
  x: number,
  y: number,
  width: number,
) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  doc.setTextColor(...MUTED);
  doc.text(field.label.toUpperCase(), x, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(...TEXT);
  const lines = doc.splitTextToSize(field.value, width);
  doc.text(lines, x, y + LABEL_TO_VALUE);

  return y + LABEL_TO_VALUE + (lines.length - 1) * VALUE_LINE_HEIGHT + FIELD_BOTTOM_GAP;
};

const measureGroupHeight = (doc: jsPDF, group: FieldGroup, width: number) =>
  group.fields.reduce(
    (total, field) => total + measureFieldHeight(doc, field.value, width),
    SECTION_LABEL_HEIGHT,
  );

const drawGroup = (
  doc: jsPDF,
  group: FieldGroup,
  x: number,
  y: number,
  width: number,
) => {
  let cursorY = drawSectionLabel(doc, group.title, x, y);
  group.fields.forEach((field) => {
    cursorY = drawField(doc, field, x, cursorY, width);
  });
  return cursorY;
};

/* --------------------------------------------------------------------------
   Datos por rol
   -------------------------------------------------------------------------- */

const buildGuardianGroup = (
  title: string,
  name?: string,
  parentesco?: string,
  cedula?: string,
  telefono?: string,
  email?: string,
): FieldGroup => ({
  title,
  fields: [
    { label: "Nombre", value: normalizeText(name) },
    { label: "Parentesco", value: normalizeText(parentescoLabel(parentesco)) },
    { label: "Documento", value: normalizeText(cedula) },
    { label: "Telefono", value: normalizeText(telefono) },
    { label: "Correo", value: normalizeText(email) },
  ],
});

/** Grupos con TODOS los datos de la persona (los usan el listado y la ficha). */
const buildUserGroups = (user: User): FieldGroup[] => {
  const identity: FieldGroup = {
    title: user.role === "STUDENT" ? "Datos del estudiante" : "Datos del docente",
    fields: [
      { label: buildDocumentLabel(user.role), value: normalizeText(user.cedula) },
      { label: "Correo", value: normalizeText(user.email) },
      { label: "Direccion", value: normalizeText(user.direccion) },
      { label: "RH", value: normalizeText(user.rh) },
      { label: "Estado", value: user.is_active === false ? "Inactivo" : "Activo" },
    ],
  };

  if (user.role === "TEACHER") {
    return [
      identity,
      {
        title: "Informacion academica",
        fields: [
          { label: "Especialidad", value: normalizeText(user.teacher_profile?.especialidad) },
          { label: "Titulo academico", value: normalizeText(user.teacher_profile?.titulo) },
          { label: "Telefono", value: normalizeText(user.teacher_profile?.telefono) },
        ],
      },
    ];
  }

  const profile = user.student_profile;
  const hasSecondGuardian = Boolean((profile?.acudiente2_nombre || "").trim());

  return [
    identity,
    buildGuardianGroup(
      "Acudiente principal",
      profile?.acudiente_nombre,
      profile?.acudiente_parentesco,
      profile?.acudiente_cedula,
      profile?.acudiente_telefono,
      profile?.acudiente_email,
    ),
    hasSecondGuardian
      ? buildGuardianGroup(
          "Segundo acudiente",
          profile?.acudiente2_nombre,
          profile?.acudiente2_parentesco,
          profile?.acudiente2_cedula,
          profile?.acudiente2_telefono,
          profile?.acudiente2_email,
        )
      : {
          title: "Segundo acudiente",
          fields: [{ label: "Registro", value: "No registrado" }],
        },
  ];
};

/* --------------------------------------------------------------------------
   Pie de pagina y guardado
   -------------------------------------------------------------------------- */

const addPageFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = pageWidthOf(doc);
  const pageHeight = pageHeightOf(doc);
  const generatedAt = formattedToday();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, pageHeight - 11, pageWidth - MARGIN, pageHeight - 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...MUTED);
    doc.text(`${SCHOOL_NAME}  |  Generado el ${generatedAt}`, MARGIN, pageHeight - 6.5);
    doc.text(`Pagina ${page} de ${pageCount}`, pageWidth - MARGIN, pageHeight - 6.5, {
      align: "right",
    });
  }
};

const exportDocument = (doc: jsPDF, fileName: string) => {
  addPageFooter(doc);
  doc.save(ensurePdfFileName(fileName));
};

const loadLogoSafely = async () => {
  try {
    return await loadImageDataUrl(schoolLogo);
  } catch {
    return null;
  }
};

/* --------------------------------------------------------------------------
   LISTADO GENERAL
   Una tarjeta por persona con TODOS sus datos, repartidos en columnas.
   -------------------------------------------------------------------------- */

const CARD_PADDING = 5;
const CARD_HEADER_HEIGHT = 10;
const CARD_GAP = 5;
const COLUMN_GAP = 5;

const measureCardHeight = (doc: jsPDF, groups: FieldGroup[], cardWidth: number) => {
  const columnCount = groups.length;
  const columnWidth =
    (cardWidth - CARD_PADDING * 2 - COLUMN_GAP * (columnCount - 1)) / columnCount;
  const tallestColumn = groups.reduce(
    (max, group) => Math.max(max, measureGroupHeight(doc, group, columnWidth)),
    0,
  );
  return CARD_HEADER_HEIGHT + tallestColumn + CARD_PADDING;
};

const drawUserCard = (
  doc: jsPDF,
  user: User,
  index: number,
  y: number,
  cardWidth: number,
) => {
  const groups = buildUserGroups(user);
  const height = measureCardHeight(doc, groups, cardWidth);

  // Contenedor
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, cardWidth, height, 1.6, 1.6, "FD");

  // Franja del encabezado + acento dorado lateral
  doc.setFillColor(...SOFT);
  doc.rect(MARGIN + 0.3, y + 0.3, cardWidth - 0.6, CARD_HEADER_HEIGHT, "F");
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN + 0.3, y + 0.3, 1.8, height - 0.6, "F");

  // Numero de orden
  doc.setFillColor(...INK);
  doc.roundedRect(MARGIN + 4.5, y + 2.4, 9, 5.4, 0.8, 0.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text(String(index).padStart(2, "0"), MARGIN + 9, y + 6.1, { align: "center" });

  // Nombre
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(buildFullName(user), MARGIN + 16.5, y + 6.4);

  // Curso / rol a la derecha
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...MUTED);
  doc.text(
    user.role === "STUDENT"
      ? `Curso: ${buildCourseLabel(user)}`
      : buildRoleLabel(user.role),
    MARGIN + cardWidth - 5,
    y + 6.4,
    { align: "right" },
  );

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 2.1, y + CARD_HEADER_HEIGHT, MARGIN + cardWidth, y + CARD_HEADER_HEIGHT);

  // Columnas con todos los datos
  const columnCount = groups.length;
  const columnWidth =
    (cardWidth - CARD_PADDING * 2 - COLUMN_GAP * (columnCount - 1)) / columnCount;
  const bodyY = y + CARD_HEADER_HEIGHT + 5.5;

  groups.forEach((group, groupIndex) => {
    const x = MARGIN + CARD_PADDING + groupIndex * (columnWidth + COLUMN_GAP);
    drawGroup(doc, group, x, bodyY, columnWidth);
  });

  return y + height + CARD_GAP;
};

const drawCourseBand = (doc: jsPDF, label: string, count: number, y: number) => {
  const width = contentWidthOf(doc);

  doc.setFillColor(...GOLD_SOFT);
  doc.rect(MARGIN, y, width, 7.5, "F");
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, y, 2.2, 7.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.6);
  doc.setTextColor(...INK);
  doc.text(label, MARGIN + 6, y + 5.1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...MUTED);
  doc.text(
    `${count} ${count === 1 ? "registro" : "registros"}`,
    MARGIN + width - 4,
    y + 5.1,
    { align: "right" },
  );

  return y + 7.5 + 4;
};

interface UserListingPdfOptions {
  users: User[];
  role: "STUDENT" | "TEACHER";
  courseFilter: string;
  fileName: string;
}

export const exportUserListingToPdf = async ({
  users,
  role,
  courseFilter,
  fileName,
}: UserListingPdfOptions) => {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const logoData = await loadLogoSafely();
  const roleLabel = role === "STUDENT" ? "Estudiantes" : "Docentes";
  const documentTitle = `Listado general de ${roleLabel.toLowerCase()}`;
  const scopeLabel = courseFilter === "TODOS" ? "Todos los cursos" : `Curso: ${courseFilter}`;

  let cursorY = drawBrandHeader(doc, {
    logoData,
    eyebrow: roleLabel,
    title: "Listado general",
    meta: `${scopeLabel}  |  ${users.length} ${users.length === 1 ? "registro" : "registros"}`,
  });

  const cardWidth = contentWidthOf(doc);
  const bottomLimit = pageHeightOf(doc) - 16;

  const byName = (userA: User, userB: User) =>
    buildFullName(userA).localeCompare(buildFullName(userB), "es");

  const groupedUsers: Array<[string, User[]]> =
    courseFilter === "TODOS"
      ? groupUsersByCourse(users)
      : [[courseFilter, [...users].sort(byName)]];

  groupedUsers.forEach(([courseName, courseUsers]) => {
    const sortedUsers = [...courseUsers].sort(byName);

    // La banda del curso nunca debe quedar sola al pie de la pagina.
    if (cursorY + 34 > bottomLimit) {
      doc.addPage();
      cursorY = drawContinuationHeader(doc, documentTitle);
    }

    cursorY = drawCourseBand(doc, `Curso / Grupo: ${courseName}`, sortedUsers.length, cursorY);

    sortedUsers.forEach((user, userIndex) => {
      const cardHeight = measureCardHeight(doc, buildUserGroups(user), cardWidth);

      if (cursorY + cardHeight > bottomLimit) {
        doc.addPage();
        cursorY = drawContinuationHeader(doc, documentTitle);
        cursorY = drawCourseBand(
          doc,
          `Curso / Grupo: ${courseName} (continuacion)`,
          sortedUsers.length,
          cursorY,
        );
      }

      cursorY = drawUserCard(doc, user, userIndex + 1, cursorY, cardWidth);
    });

    cursorY += 2;
  });

  exportDocument(doc, fileName);
};

/* --------------------------------------------------------------------------
   FICHA INDIVIDUAL
   -------------------------------------------------------------------------- */

const drawProfileHero = (doc: jsPDF, user: User, y: number) => {
  const width = contentWidthOf(doc);
  const height = 26;

  doc.setFillColor(...SOFT);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, width, height, 1.8, 1.8, "FD");
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN + 0.3, y + 0.3, 2, height - 0.6, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...GOLD);
  doc.text(buildRoleLabel(user.role).toUpperCase(), MARGIN + 7, y + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(buildFullName(user), MARGIN + 7, y + 15.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `${buildDocumentLabel(user.role)}: ${normalizeText(user.cedula)}   |   ${
      user.role === "STUDENT" ? buildCourseLabel(user) : normalizeText(user.email)
    }`,
    MARGIN + 7,
    y + 21.5,
  );

  return y + height + 8;
};

/** Dibuja una seccion a lo ancho, repartiendo los campos en varias columnas. */
const drawWideSection = (
  doc: jsPDF,
  group: FieldGroup,
  y: number,
  columnCount = 3,
) => {
  const width = contentWidthOf(doc);
  const columnWidth = (width - COLUMN_GAP * (columnCount - 1)) / columnCount;

  let cursorY = drawSectionLabel(doc, group.title, MARGIN, y);
  const bodyTop = cursorY;

  const perColumn = Math.ceil(group.fields.length / columnCount);
  let tallest = bodyTop;

  for (let column = 0; column < columnCount; column += 1) {
    const columnFields = group.fields.slice(column * perColumn, (column + 1) * perColumn);
    if (!columnFields.length) continue;

    const x = MARGIN + column * (columnWidth + COLUMN_GAP);
    let columnY = bodyTop;
    columnFields.forEach((field) => {
      columnY = drawField(doc, field, x, columnY, columnWidth);
    });
    tallest = Math.max(tallest, columnY);
  }

  return tallest + 3;
};

const measureWideSection = (doc: jsPDF, group: FieldGroup, columnCount = 3) => {
  const width = contentWidthOf(doc);
  const columnWidth = (width - COLUMN_GAP * (columnCount - 1)) / columnCount;
  const perColumn = Math.ceil(group.fields.length / columnCount);

  let tallest = 0;
  for (let column = 0; column < columnCount; column += 1) {
    const columnFields = group.fields.slice(column * perColumn, (column + 1) * perColumn);
    const columnHeight = columnFields.reduce(
      (total, field) => total + measureFieldHeight(doc, field.value, columnWidth),
      0,
    );
    tallest = Math.max(tallest, columnHeight);
  }

  return SECTION_LABEL_HEIGHT + tallest + 3;
};

export const exportUserProfileToPdf = async (user: User) => {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const logoData = await loadLogoSafely();
  const documentTitle = `Ficha de ${buildRoleLabel(user.role).toLowerCase()}`;

  let cursorY = drawBrandHeader(doc, {
    logoData,
    eyebrow: buildRoleLabel(user.role),
    title: "Ficha individual",
    meta: formattedToday(),
  });

  cursorY = drawProfileHero(doc, user, cursorY);

  const bottomLimit = pageHeightOf(doc) - 16;
  const sections = buildUserGroups(user);

  sections.forEach((group) => {
    const sectionHeight = measureWideSection(doc, group);
    if (cursorY + sectionHeight > bottomLimit) {
      doc.addPage();
      cursorY = drawContinuationHeader(doc, documentTitle);
    }
    cursorY = drawWideSection(doc, group, cursorY);
  });

  // Documentos adjuntos
  const documentsGroup: FieldGroup = {
    title: "Documentos adjuntos",
    fields: user.documents?.length
      ? user.documents.map((document, index) => ({
          label: `Documento ${index + 1}`,
          value: `${document.title}${document.category ? ` - ${document.category}` : ""}`,
        }))
      : [{ label: "Sin adjuntos", value: "No hay documentos cargados en este perfil." }],
  };

  const documentsHeight = measureWideSection(doc, documentsGroup, 2);
  if (cursorY + documentsHeight > bottomLimit) {
    doc.addPage();
    cursorY = drawContinuationHeader(doc, documentTitle);
  }
  cursorY = drawWideSection(doc, documentsGroup, cursorY, 2);

  // Espacio de firma institucional
  if (cursorY + 26 <= bottomLimit) {
    const width = contentWidthOf(doc);
    const signatureY = cursorY + 12;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, signatureY, MARGIN + width / 2 - 8, signatureY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...MUTED);
    doc.text("Firma y sello institucional", MARGIN, signatureY + 4.5);
  }

  exportDocument(
    doc,
    sanitizeFileName(
      `ficha-${user.role === "STUDENT" ? "estudiante" : "docente"}-${buildFullName(user)}`,
    ),
  );
};
