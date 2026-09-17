import { jsPDF } from "jspdf";

import schoolLogo from "@/assets/logo.png";
import type { User } from "@/types/User";
import { PARENTESCO_OPTIONS } from "@/types/User";

const parentescoLabel = (value?: string) =>
  PARENTESCO_OPTIONS.find((option) => option.value === value)?.label || "";

const MARGIN = 16;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_START_Y = 68;
const SCHOOL_NAME = "GIMNASIO LOS CERROS";
const SCHOOL_SUBTITLE = "Registro institucional de usuarios";
const BLACK = [0, 0, 0] as const;
const LIGHT = [247, 247, 247] as const;
const BORDER = [198, 198, 198] as const;
const MUTED = [92, 92, 92] as const;

type PdfField = {
  label: string;
  value: string;
};

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
    .replace(/[\u0300-\u036f]/g, "")
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

const addHeader = async (doc: jsPDF, title: string, subtitle: string) => {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BLACK);
  doc.roundedRect(MARGIN, MARGIN, CONTENT_WIDTH, 34, 2, 2, "FD");

  try {
    const logoData = await loadImageDataUrl(schoolLogo);
    doc.addImage(logoData, "PNG", MARGIN + 4, 20, 14, 14, undefined, "FAST");
  } catch {
    // noop
  }

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(SCHOOL_NAME, MARGIN + 24, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(SCHOOL_SUBTITLE, MARGIN + 24, 29);

  doc.setDrawColor(...BLACK);
  doc.line(MARGIN + 4, 38, PAGE_WIDTH - MARGIN - 4, 38);

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, MARGIN + 4, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(subtitle, MARGIN + 4, 56);
};

const addPageFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  // Se lee del documento para que funcione igual en vertical y apaisado.
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.line(MARGIN, pageHeight - 10, pageWidth - MARGIN, pageHeight - 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`${SCHOOL_NAME} | Generado el ${generatedAt}`, MARGIN, pageHeight - 5);
    doc.text(`Pagina ${page} de ${pageCount}`, pageWidth - MARGIN, pageHeight - 5, {
      align: "right",
    });
  }
};

const exportDocument = (doc: jsPDF, fileName: string) => {
  addPageFooter(doc);
  doc.save(ensurePdfFileName(fileName));
};

const drawSectionTitle = (doc: jsPDF, title: string, y: number) => {
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BLACK);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 9, "FD");
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(title, MARGIN + 4, y + 5.8);
  return y + 12;
};

const drawFieldList = (doc: jsPDF, fields: PdfField[], startY: number) => {
  let cursorY = startY;

  fields.forEach((field) => {
    const valueLines = doc.splitTextToSize(field.value, 112);
    const rowHeight = Math.max(9, valueLines.length * 4.6 + 3);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.rect(MARGIN, cursorY, CONTENT_WIDTH, rowHeight, "FD");

    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${field.label}:`, MARGIN + 5, cursorY + 5.8);

    doc.setTextColor(38, 38, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(valueLines, MARGIN + 48, cursorY + 5.8);

    cursorY += rowHeight + 3;
  });

  return cursorY;
};

/* ==========================================================================
   LISTADO GENERAL (tabla apaisada)
   Se genera como tabla: una fila por persona, agrupada por curso, con
   cabecera repetida en cada pagina. El detalle completo de cada persona
   vive en su ficha individual.
   ========================================================================== */

const LANDSCAPE_MARGIN = 12;
const GOLD = [202, 165, 64] as const;
const INK = [17, 18, 24] as const;
const ZEBRA = [248, 246, 241] as const;

interface ListingColumn {
  key: string;
  header: string;
  width: number;
  align?: "left" | "center";
}

// Los anchos suman el ancho util (297 - 2*12 = 273 mm).
const STUDENT_COLUMNS: ListingColumn[] = [
  { key: "index", header: "#", width: 8, align: "center" },
  { key: "name", header: "Estudiante", width: 57 },
  { key: "document", header: "T. identidad", width: 28 },
  { key: "guardian1", header: "Acudiente 1", width: 44 },
  { key: "parentesco1", header: "Parentesco", width: 21 },
  { key: "phone1", header: "Telefono", width: 25 },
  { key: "guardian2", header: "Acudiente 2", width: 44 },
  { key: "parentesco2", header: "Parentesco", width: 21 },
  { key: "phone2", header: "Telefono", width: 25 },
];

const TEACHER_COLUMNS: ListingColumn[] = [
  { key: "index", header: "#", width: 8, align: "center" },
  { key: "name", header: "Docente", width: 60 },
  { key: "document", header: "Cedula", width: 30 },
  { key: "email", header: "Correo", width: 65 },
  { key: "especialidad", header: "Especialidad", width: 45 },
  { key: "titulo", header: "Titulo academico", width: 40 },
  { key: "phone", header: "Telefono", width: 25 },
];

const emptyDash = (value?: string | null) => (value || "").trim() || "-";

const buildListingRow = (user: User, index: number): Record<string, string> => {
  if (user.role === "TEACHER") {
    return {
      index: String(index),
      name: buildFullName(user),
      document: emptyDash(user.cedula),
      email: emptyDash(user.email),
      especialidad: emptyDash(user.teacher_profile?.especialidad),
      titulo: emptyDash(user.teacher_profile?.titulo),
      phone: emptyDash(user.teacher_profile?.telefono),
    };
  }

  const profile = user.student_profile;
  return {
    index: String(index),
    name: buildFullName(user),
    document: emptyDash(user.cedula),
    guardian1: emptyDash(profile?.acudiente_nombre),
    parentesco1: emptyDash(parentescoLabel(profile?.acudiente_parentesco)),
    phone1: emptyDash(profile?.acudiente_telefono),
    guardian2: emptyDash(profile?.acudiente2_nombre),
    parentesco2: emptyDash(parentescoLabel(profile?.acudiente2_parentesco)),
    phone2: emptyDash(profile?.acudiente2_telefono),
  };
};

const drawListingHeaderBand = async (
  doc: jsPDF,
  title: string,
  scopeLabel: string,
  total: number,
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = pageWidth - LANDSCAPE_MARGIN * 2;

  doc.setFillColor(...INK);
  doc.rect(LANDSCAPE_MARGIN, LANDSCAPE_MARGIN, width, 24, "F");
  doc.setFillColor(...GOLD);
  doc.rect(LANDSCAPE_MARGIN, LANDSCAPE_MARGIN + 24, width, 1.2, "F");

  try {
    const logoData = await loadImageDataUrl(schoolLogo);
    doc.addImage(logoData, "PNG", LANDSCAPE_MARGIN + 5, LANDSCAPE_MARGIN + 5, 14, 14, undefined, "FAST");
  } catch {
    // Sin logo el encabezado sigue siendo valido.
  }

  doc.setTextColor(255, 250, 240);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(SCHOOL_NAME, LANDSCAPE_MARGIN + 24, LANDSCAPE_MARGIN + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text(title, LANDSCAPE_MARGIN + 24, LANDSCAPE_MARGIN + 18);

  doc.setTextColor(232, 226, 214);
  doc.setFontSize(8.5);
  doc.text(
    `${scopeLabel}   |   Total de registros: ${total}`,
    pageWidth - LANDSCAPE_MARGIN - 5,
    LANDSCAPE_MARGIN + 18,
    { align: "right" },
  );
};

const drawTableHead = (doc: jsPDF, columns: ListingColumn[], y: number) => {
  const height = 8;
  const width = columns.reduce((total, column) => total + column.width, 0);

  doc.setFillColor(...INK);
  doc.rect(LANDSCAPE_MARGIN, y, width, height, "F");

  doc.setTextColor(255, 250, 240);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  let x = LANDSCAPE_MARGIN;
  columns.forEach((column) => {
    const textX = column.align === "center" ? x + column.width / 2 : x + 2.5;
    doc.text(column.header, textX, y + 5.4, {
      align: column.align === "center" ? "center" : "left",
    });
    x += column.width;
  });

  return y + height;
};

const drawTableRow = (
  doc: jsPDF,
  columns: ListingColumn[],
  row: Record<string, string>,
  y: number,
  striped: boolean,
) => {
  // Se calcula la altura real a partir del texto, para que nunca se solape.
  const cellLines = columns.map((column) =>
    doc.splitTextToSize(row[column.key] ?? "-", column.width - 5).slice(0, 2),
  );
  const maxLines = cellLines.reduce((max, lines) => Math.max(max, lines.length), 1);
  const height = Math.max(7, maxLines * 3.9 + 3.2);
  const width = columns.reduce((total, column) => total + column.width, 0);

  if (striped) {
    doc.setFillColor(...ZEBRA);
    doc.rect(LANDSCAPE_MARGIN, y, width, height, "F");
  }

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.1);
  doc.line(LANDSCAPE_MARGIN, y + height, LANDSCAPE_MARGIN + width, y + height);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  let x = LANDSCAPE_MARGIN;
  columns.forEach((column, columnIndex) => {
    const lines = cellLines[columnIndex];
    const textX = column.align === "center" ? x + column.width / 2 : x + 2.5;
    if (column.key === "name") {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);
    }
    doc.text(lines, textX, y + 4.8, {
      align: column.align === "center" ? "center" : "left",
    });
    if (column.key === "name") {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
    }
    x += column.width;
  });

  return y + height;
};

const drawCourseBand = (doc: jsPDF, label: string, count: number, y: number) => {
  const width = doc.internal.pageSize.getWidth() - LANDSCAPE_MARGIN * 2;

  doc.setFillColor(...LIGHT);
  doc.rect(LANDSCAPE_MARGIN, y, width, 7.5, "F");
  doc.setFillColor(...GOLD);
  doc.rect(LANDSCAPE_MARGIN, y, 2.2, 7.5, "F");

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(label, LANDSCAPE_MARGIN + 6, y + 5.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `${count} ${count === 1 ? "registro" : "registros"}`,
    LANDSCAPE_MARGIN + width - 3,
    y + 5.2,
    { align: "right" },
  );

  return y + 7.5;
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
    orientation: "landscape",
    compress: true,
  });

  const columns = role === "STUDENT" ? STUDENT_COLUMNS : TEACHER_COLUMNS;
  const roleLabel = role === "STUDENT" ? "estudiantes" : "docentes";
  const scopeLabel =
    courseFilter === "TODOS" ? "Todos los cursos" : `Curso: ${courseFilter}`;
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomLimit = pageHeight - 16;

  await drawListingHeaderBand(
    doc,
    `Listado general de ${roleLabel}`,
    scopeLabel,
    users.length,
  );

  const byName = (userA: User, userB: User) =>
    buildFullName(userA).localeCompare(buildFullName(userB), "es");

  const groupedUsers: Array<[string, User[]]> =
    courseFilter === "TODOS"
      ? groupUsersByCourse(users)
      : [[courseFilter, [...users].sort(byName)]];

  let cursorY = LANDSCAPE_MARGIN + 32;

  const startNewPage = () => {
    doc.addPage();
    cursorY = LANDSCAPE_MARGIN;
  };

  groupedUsers.forEach(([courseName, courseUsers]) => {
    const sortedUsers = [...courseUsers].sort(byName);

    // La banda del curso y su cabecera no deben quedar solas al pie de pagina.
    if (cursorY + 24 > bottomLimit) {
      startNewPage();
    }

    cursorY = drawCourseBand(doc, `Curso / Grupo: ${courseName}`, sortedUsers.length, cursorY);
    cursorY = drawTableHead(doc, columns, cursorY);

    sortedUsers.forEach((user, userIndex) => {
      // 12 mm cubre la fila mas alta posible (dos lineas de texto).
      if (cursorY + 12 > bottomLimit) {
        startNewPage();
        cursorY = drawCourseBand(
          doc,
          `Curso / Grupo: ${courseName} (continuacion)`,
          sortedUsers.length,
          cursorY,
        );
        cursorY = drawTableHead(doc, columns, cursorY);
      }

      cursorY = drawTableRow(
        doc,
        columns,
        buildListingRow(user, userIndex + 1),
        cursorY,
        userIndex % 2 === 1,
      );
    });

    cursorY += 5;
  });

  exportDocument(doc, fileName);
};

const paginateIfNeeded = (doc: jsPDF, cursorY: number, estimatedHeight: number) => {
  // Deja espacio para el pie de pagina.
  if (cursorY + estimatedHeight <= PAGE_HEIGHT - 19) {
    return cursorY;
  }

  doc.addPage();
  return 24;
};

const drawProfileSection = (
  doc: jsPDF,
  title: string,
  fields: PdfField[],
  startY: number,
) => {
  let cursorY = paginateIfNeeded(doc, startY, fields.length * 14 + 18);
  cursorY = drawSectionTitle(doc, title, cursorY);
  cursorY = drawFieldList(doc, fields, cursorY);
  return cursorY + 2;
};

export const exportUserProfileToPdf = async (user: User) => {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  await addHeader(
    doc,
    `Ficha profesional de ${buildRoleLabel(user.role).toLowerCase()}`,
    `${buildFullName(user)} | ${buildCourseLabel(user)}`,
  );

  let cursorY = BODY_START_Y;

  cursorY = drawProfileSection(
    doc,
    "Datos generales",
    [
      { label: "Nombre completo", value: buildFullName(user) },
      { label: "Rol", value: buildRoleLabel(user.role) },
      { label: buildDocumentLabel(user.role), value: normalizeText(user.cedula) },
      { label: "Correo", value: normalizeText(user.email) },
      { label: "Direccion", value: normalizeText(user.direccion) },
      { label: "RH", value: normalizeText(user.rh) },
      { label: "Curso", value: buildCourseLabel(user) },
      { label: "Estado", value: user.is_active === false ? "Inactivo" : "Activo" },
    ],
    cursorY,
  );

  if (user.role === "STUDENT") {
    cursorY = drawProfileSection(
      doc,
      "Datos del acudiente",
      [
        { label: "Nombre del acudiente", value: normalizeText(user.student_profile?.acudiente_nombre) },
        { label: "Parentesco", value: normalizeText(parentescoLabel(user.student_profile?.acudiente_parentesco)) },
        { label: "Cedula del acudiente", value: normalizeText(user.student_profile?.acudiente_cedula) },
        { label: "Telefono del acudiente", value: normalizeText(user.student_profile?.acudiente_telefono) },
        { label: "Correo del acudiente", value: normalizeText(user.student_profile?.acudiente_email) },
      ],
      cursorY,
    );

    if (normalizeText(user.student_profile?.acudiente2_nombre)) {
      cursorY = drawProfileSection(
        doc,
        "Datos del segundo acudiente",
        [
          { label: "Nombre del acudiente", value: normalizeText(user.student_profile?.acudiente2_nombre) },
          { label: "Parentesco", value: normalizeText(parentescoLabel(user.student_profile?.acudiente2_parentesco)) },
          { label: "Cedula del acudiente", value: normalizeText(user.student_profile?.acudiente2_cedula) },
          { label: "Telefono del acudiente", value: normalizeText(user.student_profile?.acudiente2_telefono) },
          { label: "Correo del acudiente", value: normalizeText(user.student_profile?.acudiente2_email) },
        ],
        cursorY,
      );
    }
  }

  if (user.role === "TEACHER") {
    cursorY = drawProfileSection(
      doc,
      "Información académica",
      [
        { label: "Especialidad", value: normalizeText(user.teacher_profile?.especialidad) },
        { label: "Título académico", value: normalizeText(user.teacher_profile?.titulo) },
        { label: "Telefono", value: normalizeText(user.teacher_profile?.telefono) },
      ],
      cursorY,
    );
  }

  cursorY = drawProfileSection(
    doc,
    "Documentos adjuntos",
    user.documents?.length
      ? user.documents.map((document, index) => ({
          label: `Documento ${index + 1}`,
          value: `${document.title}${document.category ? ` | ${document.category}` : ""}`,
        }))
      : [{ label: "Documentos", value: "No hay documentos cargados en este perfil." }],
    cursorY,
  );

  exportDocument(
    doc,
    sanitizeFileName(
      `ficha-${user.role === "STUDENT" ? "estudiante" : "usuario"}-${buildFullName(user)}`,
    ),
  );
};
