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
  [204, 45, 194],
  [42, 188, 191],
  [47, 43, 201],
  [110, 31, 196],
] as const;

const normalizeCell = (value: PdfRowValue) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Si" : "No";
  return String(value);
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

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

const darkenColor = ([r, g, b]: readonly number[], factor: number) =>
  `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;

const colorToRgb = ([r, g, b]: readonly number[]) => `rgb(${r}, ${g}, ${b})`;

const drawEllipticalSlice = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  endAngle: number,
  fillStyle: string,
) => {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(1, radiusY / radiusX);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radiusX, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
};

const drawRoundedLabel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: readonly number[],
  label: string,
  percent: number,
) => {
  const radius = 10;
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 4;
  ctx.strokeStyle = colorToRgb(color);
  ctx.stroke();

  ctx.fillStyle = "#475569";
  ctx.font = "600 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(label.toUpperCase().slice(0, 18), x + width / 2, y + 24);
  ctx.fillStyle = "#111827";
  ctx.font = "800 32px Arial";
  ctx.fillText(`${percent}%`, x + width / 2, y + 58);
  ctx.restore();
};

const createPieChartDataUrl = (summary: AttendancePdfSummaryItem[]) => {
  const canvas = document.createElement("canvas");
  canvas.width = 980;
  canvas.height = 620;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el grafico circular.");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const total = Math.max(summary.reduce((acc, item) => acc + item.value, 0), 1);
  const centerX = 460;
  const centerY = 310;
  const radiusX = 285;
  const radiusY = 122;
  const depth = 82;
  const slices = summary
    .filter((item) => item.value > 0)
    .map((item, index) => {
      const ratio = item.value / total;
      return {
        item,
        index,
        ratio,
      };
    });

  if (slices.length === 0) {
    slices.push({ item: { label: "Sin datos", value: 1 }, index: 0, ratio: 1 });
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(centerX, centerY + 130, 80, centerX, centerY + 120, 390);
  gradient.addColorStop(0, "rgba(15, 23, 42, 0.20)");
  gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + depth + 36, radiusX * 1.08, radiusY * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();

  let startAngle = -Math.PI / 2 - 0.08;
  const chartSlices = slices.map((slice) => {
    const endAngle = startAngle + slice.ratio * Math.PI * 2;
    const midAngle = (startAngle + endAngle) / 2;
    const explode = slices.length > 1 ? 13 : 0;
    const offsetX = Math.cos(midAngle) * explode;
    const offsetY = Math.sin(midAngle) * explode * 0.52;
    const result = { ...slice, startAngle, endAngle, midAngle, offsetX, offsetY };
    startAngle = endAngle;
    return result;
  });

  for (let layer = depth; layer >= 1; layer -= 2) {
    chartSlices.forEach((slice) => {
      const color = REPORT_COLORS[slice.index % REPORT_COLORS.length];
      const shade = 0.52 + (layer / depth) * 0.16;
      drawEllipticalSlice(
        ctx,
        centerX + slice.offsetX,
        centerY + slice.offsetY + layer,
        radiusX,
        radiusY,
        slice.startAngle,
        slice.endAngle,
        darkenColor(color, shade),
      );
    });
  }

  chartSlices.forEach((slice) => {
    const color = REPORT_COLORS[slice.index % REPORT_COLORS.length];
    drawEllipticalSlice(
      ctx,
      centerX + slice.offsetX,
      centerY + slice.offsetY,
      radiusX,
      radiusY,
      slice.startAngle,
      slice.endAngle,
      colorToRgb(color),
    );

    ctx.save();
    ctx.globalAlpha = 0.2;
    drawEllipticalSlice(
      ctx,
      centerX + slice.offsetX - 22,
      centerY + slice.offsetY - 10,
      radiusX * 0.88,
      radiusY * 0.82,
      slice.startAngle,
      slice.endAngle,
      "#ffffff",
    );
    ctx.restore();
  });

  chartSlices.forEach((slice) => {
    const color = REPORT_COLORS[slice.index % REPORT_COLORS.length];
    const percent = Math.round(slice.ratio * 100);
    const anchorX = centerX + slice.offsetX + Math.cos(slice.midAngle) * (radiusX + 12);
    const anchorY = centerY + slice.offsetY + Math.sin(slice.midAngle) * (radiusY + 12);
    const rightSide = Math.cos(slice.midAngle) >= 0;
    const labelX = rightSide
      ? Math.min(anchorX + 58, canvas.width - 170)
      : Math.max(anchorX - 188, 28);
    const labelY = Math.max(30, Math.min(anchorY - 38, canvas.height - 92));
    const elbowX = rightSide ? labelX - 18 : labelX + 148;
    const dotX = centerX + slice.offsetX + Math.cos(slice.midAngle) * (radiusX + 22);
    const dotY = centerY + slice.offsetY + Math.sin(slice.midAngle) * (radiusY + 22);

    ctx.strokeStyle = colorToRgb(color);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(dotX, dotY);
    ctx.lineTo(dotX, labelY + 38);
    ctx.lineTo(elbowX, labelY + 38);
    ctx.stroke();
    ctx.fillStyle = colorToRgb(color);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
    ctx.fill();

    drawRoundedLabel(ctx, labelX, labelY, 142, 82, color, slice.item.label, percent);
  });

  return canvas.toDataURL("image/png");
};

const buildAttendanceAnalysis = (summary: AttendancePdfSummaryItem[]) => {
  const total = summary.reduce((acc, item) => acc + item.value, 0);
  if (!total) {
    return {
      title: "Lectura general",
      lines: [
        "Aun no hay registros suficientes para describir el comportamiento de asistencia en este filtro.",
      ],
    };
  }

  const sorted = [...summary].sort((a, b) => b.value - a.value);
  const dominant = sorted[0];
  const dominantPercent = Math.round((dominant.value / total) * 100);
  const present = summary.find((item) => normalizeText(item.label).includes("presente"));
  const absence = summary.find((item) => normalizeText(item.label).includes("ausente"));
  const late = summary.find((item) => normalizeText(item.label).includes("tarde"));
  const justified = summary.find((item) => normalizeText(item.label).includes("just"));

  const presentPercent = present ? Math.round((present.value / total) * 100) : null;
  const riskCount = (absence?.value || 0) + (late?.value || 0);
  const riskPercent = Math.round((riskCount / total) * 100);

  const dominantLabel = dominant.label.toLowerCase();
  const recordWord = dominant.value === 1 ? "registro" : "registros";
  const riskWord = riskCount === 1 ? "caso" : "casos";
  const lines = [
    `En este corte predominan los ${dominantLabel}: ${dominant.value} ${recordWord} de ${total}, equivalente al ${dominantPercent}%.`,
  ];

  if (presentPercent !== null) {
    if (presentPercent >= 85) {
      lines.push(`La asistencia se mantiene en un nivel favorable, con ${presentPercent}% de registros presentes.`);
    } else if (presentPercent > 0) {
      lines.push(`La asistencia registrada es de ${presentPercent}%, por lo que conviene hacer seguimiento cercano.`);
    } else {
      lines.push("No se registran asistencias presentes dentro del filtro consultado.");
    }
  }

  if (riskCount > 0) {
    lines.push(
      `Hay ${riskCount} ${riskWord} entre ausencias y llegadas tarde (${riskPercent}%), recomendables para revision institucional.`,
    );
  } else {
    lines.push("No aparecen ausencias ni llegadas tarde en los registros exportados.");
  }

  if (justified?.value) {
    const justifiedWord = justified.value === 1 ? "registro cuenta" : "registros cuentan";
    lines.push(`${justified.value} ${justifiedWord} con justificacion documentada.`);
  }

  return {
    title: "Lectura general",
    lines,
  };
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
  const total = summary.reduce((acc, item) => acc + item.value, 0);
  const analysis = buildAttendanceAnalysis(summary);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(202, 165, 64);
  doc.roundedRect(MARGIN, 89, 269, 103, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("Distribucion de asistencia", 20, 100);
  doc.setFillColor(255, 252, 246);
  doc.setDrawColor(228, 218, 193);
  doc.roundedRect(160, 151, 113, 31, 4, 4, "FD");
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(analysis.title, 166, 159);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.6);
  doc.setTextColor(75, 85, 99);
  const analysisText = analysis.lines.slice(0, 3).join(" ");
  const wrappedAnalysis = doc.splitTextToSize(analysisText, 101).slice(0, 4);
  doc.text(wrappedAnalysis, 166, 165);

  doc.setFontSize(7.8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Vista grafica sobre ${total} registro(s) exportados.`, 20, 106);

  const chartData = createPieChartDataUrl(summary);
  doc.addImage(chartData, "PNG", 17, 111, 139, 74, undefined, "FAST");

  const legendStartX = 160;
  const legendStartY = 108;
  const legendWidth = 53;
  const legendHeight = 15;
  const legendGapX = 5;
  const legendGapY = 5;

  summary.forEach((item, index) => {
    const [r, g, b] = REPORT_COLORS[index % REPORT_COLORS.length];
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = legendStartX + column * (legendWidth + legendGapX);
    const y = legendStartY + row * (legendHeight + legendGapY);
    const percent = total ? Math.round((item.value / total) * 100) : 0;

    doc.setFillColor(255, 252, 246);
    doc.setDrawColor(228, 218, 193);
    doc.roundedRect(x, y, legendWidth, legendHeight, 3, 3, "FD");
    doc.setFillColor(r, g, b);
    doc.circle(x + 5, y + 7.5, 2.3, "F");
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    const label = doc.splitTextToSize(item.label, 33)[0] || item.label;
    doc.text(label, x + 10, y + 6.2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(91, 101, 120);
    doc.setFontSize(7.2);
    doc.text(`${item.value} reg. - ${percent}%`, x + 10, y + 11.6);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text("El detalle completo aparece en la tabla de las paginas siguientes.", 20, 187);
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

