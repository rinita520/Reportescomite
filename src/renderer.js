import pptxgen from 'pptxgenjs';
import { validateCaso } from './validator.js';
import { theme } from './theme.js';

const { colors, fonts, sizes, layout } = theme;

const CONTENT = {
  left: layout.margin,
  top: layout.headerHeight + 0.3,
  width: layout.width - layout.margin * 2,
};

/** Human-readable labels for the client key/value table (topic 1). */
const CLIENTE_LABELS = {
  id_cliente: 'ID cliente',
  tipo_identificacion: 'Tipo de identificación',
  identificacion: 'Identificación',
  nombre: 'Nombre o razón social',
  segmento: 'Segmento',
  actividad_economica: 'Actividad económica',
  residencia: 'Residencia',
};

/** Human-readable labels for the case short fields (topic 2). */
const CASO_LABELS = {
  periodo: 'Período',
  fecha_corte: 'Fecha de corte',
  origen_caso: 'Origen / motivo de detección',
  total_movimientos: 'Total de movimientos',
  movimientos_incluidos: 'Movimientos incluidos',
};

/** Render `null`/`''` as an em dash and everything else as its raw string (RF-14). */
function formatValue(value) {
  if (value == null || value === '') return '—';
  return String(value);
}

/** Wrap the raw record into a `{ text, options }` table cell. */
function cell(text, options) {
  return { text: formatValue(text), options };
}

function addHeader(slide, pptx, title) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: layout.width,
    h: layout.headerHeight,
    fill: { color: colors.header },
    line: { color: colors.header },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: layout.headerHeight,
    w: layout.width,
    h: 0.04,
    fill: { color: colors.accent },
    line: { color: colors.accent },
  });
  slide.addText(title, {
    x: layout.margin,
    y: 0,
    w: layout.width - layout.margin * 2,
    h: layout.headerHeight,
    fontFace: fonts.heading,
    fontSize: sizes.slideTitle,
    bold: true,
    color: colors.onHeader,
    align: 'left',
    valign: 'middle',
  });
}

function addFooter(slide, pptx, { confidencialidad, reportId }) {
  slide.addShape(pptx.ShapeType.rect, {
    x: layout.margin,
    y: layout.height - layout.footerHeight - 0.02,
    w: layout.width - layout.margin * 2,
    h: 0.01,
    fill: { color: colors.border },
    line: { color: colors.border },
  });
  slide.addText(`${confidencialidad} · ${reportId}`, {
    x: layout.margin,
    y: layout.height - layout.footerHeight,
    w: layout.width - layout.margin * 2,
    h: layout.footerHeight,
    fontFace: fonts.body,
    fontSize: sizes.footer,
    color: colors.muted,
    align: 'right',
    valign: 'middle',
  });
}

/** Shared content-slide factory: header bar + footer on every content slide. */
function contentSlide(pptx, title, footerInfo) {
  const slide = pptx.addSlide();
  addHeader(slide, pptx, title);
  addFooter(slide, pptx, footerInfo);
  return slide;
}

/**
 * Add a native pptxgenjs table with the plantilla única style.
 * `rows` is an array of arrays of raw values; `headers` is the header row.
 */
function addTable(
  slide,
  { headers, rows, colW, fontSize = sizes.table, y = CONTENT.top },
) {
  const headerRow = headers.map((text) =>
    cell(text, {
      fill: { color: colors.tableHeader },
      color: colors.onHeader,
      bold: true,
      align: 'left',
      valign: 'middle',
    }),
  );

  const bodyRows = rows.map((row, index) =>
    row.map((value) =>
      cell(value, {
        fill: { color: index % 2 === 1 ? colors.tableAlt : colors.background },
        color: colors.body,
        align: 'left',
        valign: 'middle',
      }),
    ),
  );

  if (bodyRows.length === 0) {
    bodyRows.push([
      {
        text: 'Sin información',
        options: {
          colspan: headers.length,
          color: colors.muted,
          align: 'left',
          valign: 'middle',
        },
      },
    ]);
  }

  slide.addTable([headerRow, ...bodyRows], {
    x: CONTENT.left,
    y,
    w: CONTENT.width,
    colW,
    fontFace: fonts.body,
    fontSize,
    autoPage: false,
    valign: 'middle',
    margin: 0.06,
    border: { type: 'solid', color: colors.border, pt: 0.5 },
  });
}

function addPortada(pptx, { periodo, autor, fecha, confidencialidad, reportId }) {
  const slide = pptx.addSlide();

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: layout.width,
    h: 2.7,
    fill: { color: colors.header },
    line: { color: colors.header },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 2.7,
    w: layout.width,
    h: 0.06,
    fill: { color: colors.accent },
    line: { color: colors.accent },
  });

  slide.addText('Reporte al Comité de Cumplimiento', {
    x: 0.8,
    y: 0.7,
    w: layout.width - 1.6,
    h: 1.3,
    fontFace: fonts.heading,
    fontSize: sizes.coverTitle,
    bold: true,
    color: colors.onHeader,
    align: 'center',
    valign: 'middle',
  });
  slide.addText('Generador Estandarizado de Reportes UAFE', {
    x: 0.8,
    y: 2.0,
    w: layout.width - 1.6,
    h: 0.5,
    fontFace: fonts.body,
    fontSize: sizes.coverSubtitle,
    color: colors.chart[3],
    align: 'center',
    valign: 'middle',
  });

  const infoRows = [
    ['Período', periodo],
    ['Autor', autor],
    ['Fecha', fecha],
    ['Clasificación', confidencialidad],
    ['Identificador', reportId],
  ].map(([label, value]) => [
    {
      text: label,
      options: { color: colors.header, bold: true, align: 'right', valign: 'middle' },
    },
    cell(value, { color: colors.body, align: 'left', valign: 'middle' }),
  ]);

  slide.addTable(infoRows, {
    x: 4.0,
    y: 3.5,
    w: 5.33,
    colW: [2.2, 3.13],
    fontFace: fonts.body,
    fontSize: sizes.body,
    border: { type: 'solid', color: colors.border, pt: 0.5 },
    margin: 0.06,
  });

  addFooter(slide, pptx, { confidencialidad, reportId });
  return slide;
}

function addCliente(pptx, caso, footerInfo) {
  const slide = contentSlide(pptx, 'Datos generales del cliente analizado', footerInfo);
  const cliente = caso.cliente ?? {};

  const rows = Object.entries(CLIENTE_LABELS)
    .filter(([key]) => key in cliente)
    .map(([key, label]) => [label, cliente[key]]);

  addTable(slide, {
    headers: ['Campo', 'Valor'],
    rows,
    colW: [3.6, CONTENT.width - 3.6],
    fontSize: sizes.body,
  });
  return slide;
}

function addAntecedentes(pptx, caso, footerInfo) {
  const slide = contentSlide(pptx, 'Antecedentes del caso', footerInfo);
  const data = caso.caso ?? {};

  const shortRows = Object.entries(CASO_LABELS).map(([key, label]) => [
    label,
    data[key],
  ]);

  addTable(slide, {
    headers: ['Campo', 'Detalle'],
    rows: shortRows,
    colW: [3.6, CONTENT.width - 3.6],
    fontSize: sizes.body,
    y: CONTENT.top,
  });

  const textTop = CONTENT.top + 2.35;
  slide.addText(
    [
      { text: 'Antecedentes: ', options: { bold: true, color: colors.header } },
      { text: formatValue(data.antecedentes), options: { color: colors.body } },
    ],
    {
      x: CONTENT.left,
      y: textTop,
      w: CONTENT.width,
      h: 0.9,
      fontFace: fonts.body,
      fontSize: sizes.body,
      valign: 'top',
    },
  );
  slide.addText(
    [
      { text: 'Nota de muestra: ', options: { bold: true, color: colors.header } },
      { text: formatValue(data.nota_muestra), options: { color: colors.body } },
    ],
    {
      x: CONTENT.left,
      y: textTop + 0.95,
      w: CONTENT.width,
      h: 0.6,
      fontFace: fonts.body,
      fontSize: sizes.body,
      valign: 'top',
    },
  );

  const productos = caso.productos ?? [];
  slide.addText('Productos involucrados', {
    x: CONTENT.left,
    y: textTop + 1.65,
    w: CONTENT.width,
    h: 0.35,
    fontFace: fonts.heading,
    fontSize: sizes.body,
    bold: true,
    color: colors.header,
    valign: 'middle',
  });
  addTable(slide, {
    headers: ['Tipo de producto', 'Número'],
    rows: productos.map((p) => [p.tipo_producto, p.numero]),
    colW: [CONTENT.width - 4, 4],
    fontSize: sizes.table,
    y: textTop + 2.05,
  });
  return slide;
}

function addMovimientosPorTipo(pptx, caso, footerInfo) {
  const slide = contentSlide(
    pptx,
    'Movimientos transaccionales (resumen) — por tipo',
    footerInfo,
  );
  addTable(slide, {
    headers: ['Tipo de transacción', 'Monto', 'Moneda', 'N.º de operaciones'],
    rows: (caso.movimientosPorTipo ?? []).map((r) => [
      r.tipo_transaccion,
      r.monto,
      r.moneda,
      r.numero_operaciones,
    ]),
    colW: [4.5, 3.0, 2.0, CONTENT.width - 9.5],
    fontSize: sizes.body,
  });
  return slide;
}

function addMovimientosPorContraparte(pptx, caso, footerInfo) {
  const slide = contentSlide(
    pptx,
    'Movimientos transaccionales (resumen) — por contraparte',
    footerInfo,
  );
  addTable(slide, {
    headers: [
      'Tipo de movimiento',
      'Rol contraparte',
      'Identificación',
      'Nombre',
      'Monto',
      'Moneda',
      'N.º operaciones',
    ],
    rows: (caso.movimientosPorContraparte ?? []).map((r) => [
      r.tipo_movimiento,
      r.rol_contraparte,
      r.identificacion,
      r.nombre,
      r.monto,
      r.moneda,
      r.numero_operaciones,
    ]),
    colW: [1.6, 1.5, 1.9, 3.0, 1.5, 1.0, 1.833],
    fontSize: sizes.table,
  });
  return slide;
}

function addDocumentos(pptx, caso, footerInfo) {
  const slide = contentSlide(pptx, 'Documentación entregada', footerInfo);
  addTable(slide, {
    headers: ['Tipo', 'Número', 'Fecha', 'Emisor', 'Referencia'],
    rows: (caso.documentos ?? []).map((r) => [
      r.tipo,
      r.numero,
      r.fecha,
      r.emisor,
      r.referencia,
    ]),
    colW: [2.0, 2.6, 1.5, 2.6, CONTENT.width - 8.7],
    fontSize: sizes.table,
  });
  return slide;
}

function addAlertas(pptx, caso, footerInfo) {
  const slide = contentSlide(pptx, 'Señales de alerta', footerInfo);
  addTable(slide, {
    headers: ['Tipo', 'Descripción', 'Sustento'],
    rows: (caso.alertas ?? []).map((r) => [r.tipo, r.descripcion, r.sustento]),
    colW: [3.0, 4.67, CONTENT.width - 7.67],
    fontSize: sizes.table,
  });
  return slide;
}

function addResumenGrafico(pptx, caso, footerInfo) {
  const slide = contentSlide(pptx, 'Resumen gráfico del caso', footerInfo);

  const porTipo = caso.movimientosPorTipo ?? [];
  const porContraparte = caso.movimientosPorContraparte ?? [];

  slide.addChart(
    pptx.ChartType.pie,
    [
      {
        name: 'Monto por tipo de transacción',
        labels: porTipo.map((r) => formatValue(r.tipo_transaccion)),
        values: porTipo.map((r) => Number(r.monto) || 0),
      },
    ],
    {
      x: CONTENT.left,
      y: CONTENT.top,
      w: 6.0,
      h: 4.7,
      showTitle: true,
      title: 'Monto por tipo de transacción',
      titleFontSize: 12,
      titleColor: colors.header,
      showLegend: true,
      showPercent: true,
      chartColors: colors.chart,
      fontFace: fonts.body,
      dataLabelFontSize: 9,
    },
  );

  slide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: 'Monto por contraparte',
        labels: porContraparte.map((r) => formatValue(r.nombre)),
        values: porContraparte.map((r) => Number(r.monto) || 0),
      },
    ],
    {
      x: CONTENT.left + 6.25,
      y: CONTENT.top,
      w: 6.0,
      h: 4.7,
      barDir: 'col',
      showTitle: true,
      title: 'Monto por contraparte',
      titleFontSize: 12,
      titleColor: colors.header,
      showLegend: false,
      showValue: true,
      chartColors: [colors.accent],
      fontFace: fonts.body,
      dataLabelFontSize: 8,
      catAxisLabelFontSize: 8,
      valAxisLabelFontSize: 8,
    },
  );

  return slide;
}

function addTerceros(pptx, caso, footerInfo) {
  const slide = contentSlide(pptx, 'Detalle de Terceros Relacionados', footerInfo);
  addTable(slide, {
    headers: [
      'Tipo identificación',
      'Identificación',
      'Nombre',
      'Relación',
      'Rol',
      'Monto involucrado',
    ],
    rows: (caso.terceros ?? []).map((r) => [
      r.tipo_identificacion,
      r.identificacion,
      r.nombre,
      r.relacion,
      r.rol,
      r.monto_involucrado,
    ]),
    colW: [1.7, 1.9, 2.6, 2.6, 1.7, 1.833],
    fontSize: sizes.table,
  });
  return slide;
}

function addComercial(pptx, caso, footerInfo) {
  const slide = contentSlide(pptx, 'Comentarios del área comercial', footerInfo);
  const comentarios = caso.comercial ?? [];

  const text = comentarios
    .map((r) => formatValue(r.comentario))
    .join('\n\n');

  slide.addText(text, {
    x: CONTENT.left,
    y: CONTENT.top,
    w: CONTENT.width,
    h: 4.7,
    fontFace: fonts.body,
    fontSize: sizes.body,
    color: colors.body,
    align: 'left',
    valign: 'top',
  });
  return slide;
}

function addTrazabilidad(pptx, { autor, fecha, version, reportId, confidencialidad }) {
  const slide = contentSlide(pptx, 'Pie de trazabilidad', {
    confidencialidad,
    reportId,
  });

  const rows = [
    ['Autor', autor],
    ['Fecha de generación', fecha],
    ['Versión', version],
    ['Identificador del reporte', reportId],
    ['Clasificación', confidencialidad],
  ];

  addTable(slide, {
    headers: ['Campo', 'Valor'],
    rows,
    colW: [3.6, CONTENT.width - 3.6],
    fontSize: sizes.body,
  });
  return slide;
}

/**
 * Render a validated case into a PPTX deck (RF-04, RF-05) using one visual
 * template (RF-03) and native charts for the graphic summary (RF-13).
 *
 * @param {object} caso normalized case produced by `loadCaso`.
 * @param {{ outputPath: string, meta?: object }} options
 * @returns {Promise<{ outputPath: string, slideCount: number }>}
 */
export async function renderReport(caso, { outputPath, meta = {} } = {}) {
  const validation = validateCaso(caso);
  if (!validation.ok) {
    const detail = validation.errors.map((e) => `- ${e.message}`).join('\n');
    throw new Error(
      `No se puede generar el reporte: faltan temas o datos obligatorios.\n${detail}`,
    );
  }

  const periodo = meta.periodo ?? caso?.caso?.periodo ?? 'N/D';
  const autor = meta.autor ?? 'No especificado';
  const fecha = meta.fecha ?? new Date().toISOString().slice(0, 10);
  const version = meta.version ?? 'v1.0';
  const confidencialidad = meta.confidencialidad ?? 'Confidencial';
  const reportId = meta.id ?? caso?.caso?.id_caso ?? 'N/D';

  const footerInfo = { confidencialidad, reportId };

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'Reporte al Comité de Cumplimiento';
  pptx.author = autor;
  pptx.company = 'UAFE';
  pptx.subject = `Período ${periodo}`;

  addPortada(pptx, { periodo, autor, fecha, confidencialidad, reportId });
  addCliente(pptx, caso, footerInfo);
  addAntecedentes(pptx, caso, footerInfo);
  addMovimientosPorTipo(pptx, caso, footerInfo);
  addMovimientosPorContraparte(pptx, caso, footerInfo);
  addDocumentos(pptx, caso, footerInfo);
  addAlertas(pptx, caso, footerInfo);
  addResumenGrafico(pptx, caso, footerInfo);
  addTerceros(pptx, caso, footerInfo);
  addComercial(pptx, caso, footerInfo);
  addTrazabilidad(pptx, {
    autor,
    fecha,
    version,
    reportId,
    confidencialidad,
  });

  await pptx.writeFile({ fileName: outputPath });

  return { outputPath, slideCount: pptx.slides.length };
}
