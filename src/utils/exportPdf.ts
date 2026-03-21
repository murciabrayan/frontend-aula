import { jsPDF } from "jspdf";
import schoolLogo from "@/assets/logo.png";

type PdfRowValue = string | number | boolean | null | undefined;

export interface AttendancePdfColumn {
  header: string;
  key: string;
  width: number;
}

export interface AttendancePdfSummaryItem {
  label: string;
  value: number;
}

export interface AttendancePdfOptions {
  filename: string;
  title: string;
  subtitle: string;
  summary: AttendancePdfSummaryItem[];
  columns: AttendancePdfColumn[];
  rows: Array<Record<string, PdfRowValue>>;
}

const PAGE_HEIGHT = 210;
const MARGIN = 14;
const REPORT_COLORS = [
  [255, 159, 64],
  [54, 162, 235],
  [75, 192, 192],
  [255, 99, 132],
] as const;

const normalizeCell = (value: PdfRowValue) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Si" : "No";
  return String(value);
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

const createPieChartDataUrl = (summary: AttendancePdfSummaryItem[]) => {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el grafico circular.");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const total = Math.max(summary.reduce((acc, item) => acc + item.value, 0), 1);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 145;
  const innerRadius = 80;
  let startAngle = -Math.PI / 2;

  summary.forEach((item, index) => {
    const ratio = item.value / total;
    const endAngle = startAngle + ratio * Math.PI * 2;
    const [r, g, b] = REPORT_COLORS[index % REPORT_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#111111";
    ctx.stroke();

    startAngle = endAngle;
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fffdf8";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#111111";
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText(String(total), centerX, centerY - 6);
  ctx.font = "22px Arial";
  ctx.fillText("registros", centerX, centerY + 28);

  return canvas.toDataURL("image/png");
};

const addHeader = async (doc: jsPDF, options: AttendancePdfOptions) => {
  doc.setFillColor(13, 13, 16);
  doc.roundedRect(MARGIN, MARGIN, 269, 38, 7, 7, "F");

  try {
    const logoData = await loadImageDataUrl(schoolLogo);
    doc.addImage(logoData, "PNG", 243, 17, 24, 24, undefined, "FAST");
  } catch {
    // no-op if logo cannot load
  }

  doc.setFillColor(231, 203, 115);
  doc.setDrawColor(17, 17, 17);
  doc.roundedRect(20, 20, 32, 9, 4, 4, "FD");
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("REPORTE", 27, 26);

  doc.setTextColor(255, 248, 234);
  doc.setFontSize(23);
  doc.text(options.title, 20, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(236, 229, 215);
  doc.text(options.subtitle, 20, 46);
};

const addSummaryCards = (doc: jsPDF, summary: AttendancePdfSummaryItem[]) => {
  const top = 60;
  const gap = 4;
  const width = (269 - gap * 3) / 4;

  summary.forEach((item, index) => {
    const x = MARGIN + index * (width + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(17, 17, 17);
    doc.roundedRect(x, top, width, 24, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(91, 101, 120);
    doc.text(item.label, x + 4, top + 8);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(20);
    doc.text(String(item.value), x + 4, top + 19);
  });
};

const addChartSection = (doc: jsPDF, summary: AttendancePdfSummaryItem[]) => {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(17, 17, 17);
  doc.roundedRect(MARGIN, 89, 269, 84, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("Distribucion de asistencia", 20, 99);

  const chartData = createPieChartDataUrl(summary);
  doc.addImage(chartData, "PNG", 22, 105, 56, 56, undefined, "FAST");

  const legendStartX = 92;
  const legendStartY = 110;
  const legendWidth = 82;
  const legendHeight = 18;
  const legendGapX = 8;
  const legendGapY = 7;

  summary.forEach((item, index) => {
    const [r, g, b] = REPORT_COLORS[index % REPORT_COLORS.length];
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = legendStartX + column * (legendWidth + legendGapX);
    const y = legendStartY + row * (legendHeight + legendGapY);

    doc.setFillColor(255, 252, 246);
    doc.setDrawColor(17, 17, 17);
    doc.roundedRect(x, y, legendWidth, legendHeight, 3, 3, "FD");
    doc.setFillColor(r, g, b);
    doc.circle(x + 6, y + 9, 2.6, "F");
    doc.setDrawColor(17, 17, 17);
    doc.circle(x + 6, y + 9, 2.6, "S");
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(item.label, x + 12, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(91, 101, 120);
    doc.setFontSize(8.5);
    doc.text(`${item.value} registros`, x + 12, y + 14);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text("El detalle completo aparece en la tabla de las paginas siguientes.", 20, 167);
};

const addTablePages = (doc: jsPDF, options: AttendancePdfOptions) => {
  const normalizedColumns = options.columns.map((column) => ({
    ...column,
    width: (column.width / options.columns.reduce((acc, item) => acc + item.width, 0)) * 269,
  }));

  const addTableHeader = (startY: number) => {
    doc.setFillColor(17, 24, 39);
    doc.setDrawColor(0, 0, 0);
    doc.rect(MARGIN, startY, 269, 10, "FD");
    let x = MARGIN;
    doc.setTextColor(255, 248, 234);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    normalizedColumns.forEach((column) => {
      doc.text(column.header, x + 2, startY + 6.5);
      x += column.width;
    });
    return startY + 10;
  };

  doc.addPage("a4", "landscape");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text("Detalle de asistencia", MARGIN, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(91, 101, 120);
  doc.text(options.subtitle, MARGIN, 24);

  let cursorY = addTableHeader(30);

  if (!options.rows.length) {
    doc.setFillColor(255, 250, 240);
    doc.setDrawColor(0, 0, 0);
    doc.rect(MARGIN, cursorY, 269, 14, "FD");
    doc.setTextColor(17, 24, 39);
    doc.text("No hay registros para exportar en este filtro.", MARGIN + 4, cursorY + 8.5);
    return;
  }

  options.rows.forEach((row, rowIndex) => {
    const lineSets = normalizedColumns.map((column) =>
      doc.splitTextToSize(normalizeCell(row[column.key]) || "-", Math.max(column.width - 4, 8)),
    );
    const maxLines = Math.max(...lineSets.map((lines) => lines.length), 1);
    const rowHeight = Math.max(10, maxLines * 4.4 + 3);

    if (cursorY + rowHeight > PAGE_HEIGHT - 16) {
      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text("Detalle de asistencia", MARGIN, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(91, 101, 120);
      doc.text(options.subtitle, MARGIN, 24);
      cursorY = addTableHeader(30);
    }

    if (rowIndex % 2 === 0) {
      doc.setFillColor(255, 248, 234);
      doc.rect(MARGIN, cursorY, 269, rowHeight, "F");
    }

    doc.setDrawColor(0, 0, 0);
    doc.rect(MARGIN, cursorY, 269, rowHeight, "S");

    let x = MARGIN;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(8.3);
    normalizedColumns.forEach((column, index) => {
      lineSets[index].forEach((line: string, lineIndex: number) => {
        doc.text(line, x + 2, cursorY + 5 + lineIndex * 4.4);
      });
      x += column.width;
    });

    cursorY += rowHeight;
  });
};

export const exportRowsToPdf = async (options: AttendancePdfOptions) => {
  const filename = options.filename.endsWith(".pdf") ? options.filename : `${options.filename}.pdf`;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  await addHeader(doc, options);
  addSummaryCards(doc, options.summary);
  addChartSection(doc, options.summary);
  addTablePages(doc, options);
  doc.save(filename);
};

