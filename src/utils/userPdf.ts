import { jsPDF } from "jspdf";

import schoolLogo from "@/assets/logo.png";
import type { User } from "@/types/User";

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

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.line(MARGIN, PAGE_HEIGHT - 10, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`Pagina ${page} de ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 5, {
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

const getListingFields = (user: User): PdfField[] => {
  const fields: PdfField[] = [
    { label: "Documento", value: normalizeText(user.cedula) },
    { label: "Correo", value: normalizeText(user.email) },
    { label: "Direccion", value: normalizeText(user.direccion) },
    { label: "RH", value: normalizeText(user.rh) },
  ];

  if (user.role === "STUDENT") {
    fields.push(
      { label: "Acudiente", value: normalizeText(user.student_profile?.acudiente_nombre) },
      { label: "Cedula acudiente", value: normalizeText(user.student_profile?.acudiente_cedula) },
      { label: "Telefono acudiente", value: normalizeText(user.student_profile?.acudiente_telefono) },
      { label: "Correo acudiente", value: normalizeText(user.student_profile?.acudiente_email) },
    );
  }

  if (user.role === "TEACHER") {
    fields.push(
      { label: "Especialidad", value: normalizeText(user.teacher_profile?.especialidad) },
      { label: "Titulo academico", value: normalizeText(user.teacher_profile?.titulo) },
    );
  }

  return fields;
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

  const roleLabel = role === "STUDENT" ? "estudiantes" : "docentes";
  const scopeLabel =
    courseFilter === "TODOS" ? "Cobertura: todos los cursos" : `Cobertura: ${courseFilter}`;

  await addHeader(
    doc,
    `Listado profesional de ${roleLabel}`,
    `${scopeLabel} | Total de registros: ${users.length}`,
  );

  let cursorY = BODY_START_Y;
  const groupedUsers: Array<[string, User[]]> =
    courseFilter === "TODOS"
      ? groupUsersByCourse(users)
      : [[
          courseFilter,
          [...users].sort((userA, userB) =>
            buildFullName(userA).localeCompare(buildFullName(userB), "es")
          ),
        ]];

  groupedUsers.forEach(([courseName, courseUsers], courseIndex) => {
    if (cursorY > 260) {
      doc.addPage();
      cursorY = 24;
    }

    if (courseIndex > 0) {
      cursorY += 2;
    }

    cursorY = drawSectionTitle(doc, `Curso / Grupo: ${courseName}`, cursorY);

    courseUsers
      .slice()
      .sort((userA, userB) => buildFullName(userA).localeCompare(buildFullName(userB), "es"))
      .forEach((user) => {
        const fields = getListingFields(user);
        const estimatedHeight = fields.reduce((accumulator, field) => {
          const lineCount = doc.splitTextToSize(field.value, 112).length;
          return accumulator + Math.max(9, lineCount * 4.6 + 3) + 3;
        }, 14);

        if (cursorY + estimatedHeight > 280) {
          doc.addPage();
          cursorY = 24;
        }

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(150, 150, 150);
        doc.rect(MARGIN, cursorY, CONTENT_WIDTH, estimatedHeight, "FD");

        doc.setTextColor(...BLACK);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(buildFullName(user), MARGIN + 4, cursorY + 8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...MUTED);
        doc.text(
          `${buildRoleLabel(user.role)} | Curso: ${buildCourseLabel(user)}`,
          MARGIN + 4,
          cursorY + 14,
        );

        cursorY = drawFieldList(doc, fields, cursorY + 18) + 2;
      });
  });

  exportDocument(doc, fileName);
};

const paginateIfNeeded = (doc: jsPDF, cursorY: number, estimatedHeight: number) => {
  if (cursorY + estimatedHeight <= 278) {
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
      { label: "Documento", value: normalizeText(user.cedula) },
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
        { label: "Cedula del acudiente", value: normalizeText(user.student_profile?.acudiente_cedula) },
        { label: "Telefono del acudiente", value: normalizeText(user.student_profile?.acudiente_telefono) },
        { label: "Correo del acudiente", value: normalizeText(user.student_profile?.acudiente_email) },
      ],
      cursorY,
    );
  }

  if (user.role === "TEACHER") {
    cursorY = drawProfileSection(
      doc,
      "Informacion academica",
      [
        { label: "Especialidad", value: normalizeText(user.teacher_profile?.especialidad) },
        { label: "Titulo academico", value: normalizeText(user.teacher_profile?.titulo) },
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
