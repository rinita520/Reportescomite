import express from 'express';
import multer from 'multer';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCaso } from './loader.js';
import { validateCaso } from './validator.js';
import { renderReport } from './renderer.js';
import { createRegistry } from './registry.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(currentDir, '..', 'output');

/** RNF-07: bounded upload so a mis-click cannot exhaust memory (RNF-03). */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const PPTX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

const OPTIONAL_FIELDS = ['autor', 'periodo', 'version', 'confidencialidad', 'id'];

/** Escape untrusted values before embedding them in HTML (avoid injection). */
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Shared page shell so every response follows the same trusted markup. */
function layout({ title, body }) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: #f4f6f8;
      color: #1f2933;
      margin: 0;
      padding: 2.5rem 1rem;
      display: flex;
      justify-content: center;
    }
    main {
      background: #ffffff;
      border: 1px solid #d9e2ec;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(16, 42, 67, 0.08);
      max-width: 640px;
      width: 100%;
      padding: 2rem 2.25rem 2.5rem;
    }
    h1 { font-size: 1.4rem; margin: 0 0 .25rem; }
    p.subtitle { color: #52606d; margin: 0 0 1.5rem; }
    label { display: block; font-weight: 600; font-size: .9rem; margin-bottom: .3rem; }
    input[type="text"], input[type="file"] {
      width: 100%;
      box-sizing: border-box;
      padding: .55rem .65rem;
      border: 1px solid #bcccdc;
      border-radius: 6px;
      font-size: .95rem;
      background: #fff;
      margin-bottom: 1rem;
    }
    fieldset { border: 0; padding: 0; margin: 0 0 1rem; }
    legend { font-weight: 700; font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; color: #52606d; margin-bottom: .6rem; }
    button {
      background: #1f6feb;
      color: #fff;
      border: 0;
      border-radius: 6px;
      padding: .7rem 1.2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #1858c4; }
    .errores { background: #fff5f5; border-left: 4px solid #c53030; border-radius: 6px; padding: 1rem 1.25rem; margin: 0 0 1.5rem; }
    .errores h2 { margin: 0 0 .6rem; font-size: 1rem; color: #9b2c2c; }
    .errores ul { margin: 0; padding-left: 1.2rem; }
    .errores li { margin-bottom: .35rem; }
    a.volver { display: inline-block; margin-top: 1.25rem; color: #1f6feb; }
    table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    th, td { text-align: left; padding: .45rem .35rem; border-bottom: 1px solid #e4eaf1; vertical-align: top; }
    th { color: #52606d; text-transform: uppercase; font-size: .68rem; letter-spacing: .04em; }
    code { font-size: .78rem; background: #f0f4f8; padding: .1rem .3rem; border-radius: 4px; }
    td a { color: #1f6feb; text-decoration: none; }
    .vacio { color: #52606d; }
  </style>
</head>
<body>
  <main>
${body}
  </main>
</body>
</html>`;
}

/** Upload form (RNF-07: usable without technical knowledge). */
function formPage() {
  return layout({
    title: 'Generador de Reportes UAFE',
    body: `    <h1>Generador Estandarizado de Reportes UAFE</h1>
    <p class="subtitle">Cargue el archivo XLSX con el análisis del caso para generar el reporte del Comité de Cumplimiento.</p>
    <form method="POST" action="/generar" enctype="multipart/form-data">
      <fieldset>
        <legend>Archivo del caso</legend>
        <label for="archivo">Archivo XLSX (obligatorio)</label>
        <input type="file" id="archivo" name="archivo" accept=".xlsx,.xls" required>
      </fieldset>
      <fieldset>
        <legend>Metadatos (opcionales)</legend>
        <label for="autor">Autor</label>
        <input type="text" id="autor" name="autor" placeholder="Analista de Cumplimiento">
        <label for="periodo">Período</label>
        <input type="text" id="periodo" name="periodo" placeholder="2026-08">
        <label for="version">Versión</label>
        <input type="text" id="version" name="version" placeholder="v1.0">
        <label for="confidencialidad">Clasificación de confidencialidad</label>
        <input type="text" id="confidencialidad" name="confidencialidad" placeholder="Confidencial">
        <label for="id">Identificador del reporte</label>
        <input type="text" id="id" name="id" placeholder="REP-2026-08-C001">
      </fieldset>
      <button type="submit">Generar reporte</button>
    </form>
    <a class="volver" href="/reportes">Ver reportes generados</a>`,
  });
}

/** Error page (RF-10: list each validation message, with detail by field/row). */
function errorPage({ title, messages }) {
  const items = messages
    .map((message) => `        <li>${escapeHtml(message)}</li>`)
    .join('\n');

  return layout({
    title,
    body: `    <h1>No se pudo generar el reporte</h1>
    <div class="errores">
      <h2>${escapeHtml(title)}</h2>
      <ul>
${items}
      </ul>
    </div>
    <a class="volver" href="/">Volver al formulario</a>`,
  });
}

/** Human-readable file size (RF-06: metadata shown to non-technical users). */
function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

/** Registry listing (RF-09): every recorded report newest-first. */
function reportsPage(entries) {
  const body =
    entries.length === 0
      ? `    <h1>Reportes generados</h1>
    <p class="vacio">Aún no hay reportes registrados.</p>
    <a class="volver" href="/">Volver al formulario</a>`
      : `    <h1>Reportes generados</h1>
    <p class="subtitle">Historial de generaciones y reprocesos (RF-07).</p>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Identificador</th>
          <th>Período</th>
          <th>Autor</th>
          <th>Versión</th>
          <th>Tamaño</th>
          <th>Hash</th>
        </tr>
      </thead>
      <tbody>
${entries
  .map((entry) => {
    const id = encodeURIComponent(entry.id);
    const shortHash = String(entry.hash ?? '').slice(0, 12);
    return `        <tr>
          <td>${escapeHtml(entry.fecha_generacion)}</td>
          <td><a href="/reportes/${id}">${escapeHtml(entry.report_id)}</a></td>
          <td>${escapeHtml(entry.periodo)}</td>
          <td>${escapeHtml(entry.autor)}</td>
          <td>${escapeHtml(entry.version)}</td>
          <td>${escapeHtml(formatBytes(entry.bytes))}</td>
          <td><code>${escapeHtml(shortHash)}</code></td>
        </tr>`;
  })
  .join('\n')}
      </tbody>
    </table>
    <a class="volver" href="/">Volver al formulario</a>`;

  return layout({ title: 'Reportes generados', body });
}

/** 404 page for an unknown or unavailable report (RF-09). */
function notFoundPage() {
  return layout({
    title: 'Reporte no encontrado',
    body: `    <h1>Reporte no encontrado</h1>
    <p>No se encontró el reporte solicitado en el registro.</p>
    <a class="volver" href="/reportes">Volver al listado de reportes</a>`,
  });
}

/** Build renderer meta from the optional form fields (blank values omitted). */
function buildMeta(fields) {
  const meta = {};
  for (const field of OPTIONAL_FIELDS) {
    const value = fields?.[field];
    if (typeof value === 'string' && value.trim() !== '') {
      meta[field] = value.trim();
    }
  }
  return meta;
}

/** POST /generar: validate the uploaded workbook and stream back the PPTX. */
async function generar(req, res, { outputDir, registry }) {
  const file = req.file;
  if (!file || !file.buffer || file.buffer.length === 0) {
    res.status(400).type('html').send(
      errorPage({
        title: 'Debe adjuntar un archivo XLSX.',
        messages: ['El campo "archivo" es obligatorio.'],
      }),
    );
    return;
  }

  const tempPath = join(tmpdir(), `uafe-upload-${randomUUID()}.xlsx`);

  try {
    await writeFile(tempPath, file.buffer);

    let caso;
    try {
      caso = loadCaso(tempPath);
    } catch (error) {
      res.status(400).type('html').send(
        errorPage({
          title: 'No se pudo leer el archivo cargado.',
          messages: [error.message],
        }),
      );
      return;
    }

    const { ok, errors } = validateCaso(caso);
    if (!ok) {
      res.status(400).type('html').send(
        errorPage({
          title: 'El archivo no cumple los requisitos mínimos.',
          messages: errors.map((error) => error.message),
        }),
      );
      return;
    }

    await mkdir(outputDir, { recursive: true });
    // RN-04: every generation is a new file; never overwrite a previous one.
    const outputPath = join(outputDir, `reporte-${randomUUID()}.pptx`);
    const meta = buildMeta(req.body);

    const { slideCount } = await renderReport(caso, { outputPath, meta });

    const pptx = await readFile(outputPath);

    // RF-06 / RF-07: record the metadata of every generation, appending a new
    // version instead of overwriting the previous one (RN-04).
    const reportId = meta.id ?? caso?.caso?.id_caso ?? 'N/D';
    await registry.append({
      report_id: reportId,
      archivo: basename(outputPath),
      hash: createHash('sha256').update(pptx).digest('hex'),
      autor: meta.autor ?? 'No especificado',
      periodo: meta.periodo ?? caso?.caso?.periodo ?? 'N/D',
      version: meta.version ?? 'v1.0',
      confidencialidad: meta.confidencialidad ?? 'Confidencial',
      casos: [caso?.caso?.id_caso].filter(Boolean),
      slide_count: slideCount,
      bytes: pptx.length,
    });

    const downloadName = `reporte-${meta.periodo ?? 'uafe'}.pptx`;
    res
      .status(200)
      .set('Content-Type', PPTX_CONTENT_TYPE)
      .set(
        'Content-Disposition',
        `attachment; filename="${downloadName.replaceAll('"', '')}"`,
      )
      .send(pptx);
  } catch (error) {
    res.status(500).type('html').send(
      errorPage({
        title: 'Ocurrió un error inesperado al generar el reporte.',
        messages: [error.message],
      }),
    );
  } finally {
    // Always remove the temporary upload, whatever happened.
    await unlink(tempPath).catch(() => {});
  }
}

/**
 * Build the Express app for the local UAFE report generator (RNF-07).
 * Returns a configured app so tests can `listen(0)` on an ephemeral port.
 *
 * @param {{ outputDir?: string, registry?: object }} [options] Injectable
 *   output directory and registry so tests never touch the real `output/`.
 */
export function createApp(options = {}) {
  const outputDir = options.outputDir ?? OUTPUT_DIR;
  const registry =
    options.registry ??
    createRegistry({ filePath: join(outputDir, 'registry.json') });

  const app = express();
  app.use(express.urlencoded({ extended: false }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES },
  });

  app.get('/', (req, res) => {
    res.status(200).type('html').send(formPage());
  });

  app.post('/generar', (req, res, next) => {
    upload.single('archivo')(req, res, (error) => {
      if (error) {
        const message =
          error.code === 'LIMIT_FILE_SIZE'
            ? `El archivo supera el tamaño máximo permitido (${MAX_UPLOAD_BYTES / (1024 * 1024)} MB).`
            : error.message;
        res.status(400).type('html').send(
          errorPage({
            title: 'No se pudo procesar el archivo cargado.',
            messages: [message],
          }),
        );
        return;
      }
      generar(req, res, { outputDir, registry }).catch(next);
    });
  });

  // RF-09: list every recorded report (newest first).
  app.get('/reportes', async (req, res, next) => {
    try {
      const entries = await registry.list();
      res.status(200).type('html').send(reportsPage(entries));
    } catch (error) {
      next(error);
    }
  });

  // RF-07: download a stored report by its registry id.
  app.get('/reportes/:id', async (req, res, next) => {
    try {
      const entry = await registry.get(req.params.id);
      if (!entry || !entry.archivo) {
        res.status(404).type('html').send(notFoundPage());
        return;
      }

      let pptx;
      try {
        // `basename` prevents escaping `outputDir` via a tampered registry.
        pptx = await readFile(join(outputDir, basename(entry.archivo)));
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.status(404).type('html').send(notFoundPage());
          return;
        }
        throw error;
      }

      res
        .status(200)
        .set('Content-Type', PPTX_CONTENT_TYPE)
        .set(
          'Content-Disposition',
          `attachment; filename="${basename(entry.archivo).replaceAll('"', '')}"`,
        )
        .send(pptx);
    } catch (error) {
      next(error);
    }
  });

  // Final safety net: never crash, always answer with HTML.
  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(500).type('html').send(
      errorPage({
        title: 'Ocurrió un error inesperado.',
        messages: [error?.message ?? 'Error desconocido.'],
      }),
    );
  });

  return app;
}
