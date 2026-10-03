import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';
import { createRegistry } from '../src/registry.js';
import { sampleFilePath } from './helpers.js';

const PPTX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

let server;
let baseUrl;
let tempDir;
let registry;

before(async () => {
  // Never write into the real output/: use an isolated temp registry + output.
  tempDir = await mkdtemp(join(tmpdir(), 'uafe-app-'));
  registry = createRegistry({ filePath: join(tempDir, 'registry.json') });
  const app = createApp({ outputDir: tempDir, registry });
  server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

/** Start an isolated app (own temp output + registry) for registry assertions. */
async function startIsolatedApp() {
  const dir = await mkdtemp(join(tmpdir(), 'uafe-app-reg-'));
  const localRegistry = createRegistry({ filePath: join(dir, 'registry.json') });
  const app = createApp({ outputDir: dir, registry: localRegistry });
  const instance = await new Promise((resolve) => {
    const serverInstance = app.listen(0, '127.0.0.1', () =>
      resolve(serverInstance),
    );
  });
  const { port } = instance.address();
  return {
    dir,
    registry: localRegistry,
    url: `http://127.0.0.1:${port}`,
    async cleanup() {
      await new Promise((resolve, reject) =>
        instance.close((error) => (error ? reject(error) : resolve())),
      );
      await rm(dir, { recursive: true, force: true });
    },
  };
}

/** Build a multipart body from an XLSX file on disk. */
async function workbookForm(file, fields = {}) {
  const buffer = await readFile(file);
  const form = new FormData();
  form.append('archivo', new Blob([buffer]), 'caso.xlsx');
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  return form;
}

test('GET / serves the upload form', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/);

  const html = await response.text();
  assert.match(html, /<form/i);
  assert.match(html, /method="POST"/i);
  assert.match(html, /action="\/generar"/i);
  assert.match(html, /enctype="multipart\/form-data"/i);
  assert.match(html, /name="archivo"/i);
  assert.match(html, /\.xlsx/);
  assert.match(html, /name="autor"/i);
  assert.match(html, /name="periodo"/i);
  assert.match(html, /name="version"/i);
  assert.match(html, /name="confidencialidad"/i);
  assert.match(html, /name="id"/i);
  assert.match(html, /href="\/reportes"/i);
});

test('POST /generar returns a PPTX for a valid workbook', async () => {
  const { file, cleanup } = sampleFilePath();
  try {
    const response = await fetch(`${baseUrl}/generar`, {
      method: 'POST',
      body: await workbookForm(file, { autor: 'Analista de Cumplimiento' }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), PPTX_CONTENT_TYPE);
    assert.match(
      response.headers.get('content-disposition') ?? '',
      /attachment/i,
    );

    const body = Buffer.from(await response.arrayBuffer());
    // PPTX is a ZIP container: it starts with the PK magic bytes.
    assert.equal(body.subarray(0, 2).toString('latin1'), 'PK');
    assert.ok(body.length > 5000, `expected a non-trivial file, got ${body.length} bytes`);
  } finally {
    cleanup();
  }
});

test('POST /generar returns 400 and lists the missing topic for an invalid workbook', async () => {
  const { file, cleanup } = sampleFilePath({ emptySheets: ['Alertas'] });
  try {
    const response = await fetch(`${baseUrl}/generar`, {
      method: 'POST',
      body: await workbookForm(file),
    });

    assert.equal(response.status, 400);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);

    const html = await response.text();
    assert.match(html, /Señales de alerta/i);
  } finally {
    cleanup();
  }
});

test('POST /generar returns 400 when no file is provided', async () => {
  const form = new FormData();
  form.append('autor', 'Sin archivo');

  const response = await fetch(`${baseUrl}/generar`, {
    method: 'POST',
    body: form,
  });

  assert.equal(response.status, 400);
  const html = await response.text();
  assert.match(html, /archivo/i);
});

test('POST /generar records one registry entry that is listable and downloadable', async () => {
  const app = await startIsolatedApp();
  try {
    const { file, cleanup } = sampleFilePath();
    try {
      const response = await fetch(`${app.url}/generar`, {
        method: 'POST',
        body: await workbookForm(file, {
          autor: 'Analista de Cumplimiento',
          periodo: '2026-08',
          version: 'v2.0',
          id: 'REP-TEST-001',
        }),
      });
      assert.equal(response.status, 200);
    } finally {
      cleanup();
    }

    // RF-06: exactly one traceability entry, with a SHA-256 hash.
    const entries = await app.registry.list();
    assert.equal(entries.length, 1);
    const [entry] = entries;
    assert.equal(entry.report_id, 'REP-TEST-001');
    assert.equal(entry.periodo, '2026-08');
    assert.equal(entry.autor, 'Analista de Cumplimiento');
    assert.match(entry.hash, /^[0-9a-f]{64}$/);
    assert.match(entry.archivo, /\.pptx$/);
    assert.ok(entry.bytes > 0);
    assert.ok(entry.slide_count > 0);

    // RF-09: the listing shows the recorded report.
    const listing = await fetch(`${app.url}/reportes`);
    assert.equal(listing.status, 200);
    assert.match(listing.headers.get('content-type') ?? '', /text\/html/);
    const html = await listing.text();
    assert.match(html, /REP-TEST-001/);
    assert.match(html, /2026-08/);

    // RF-07 / RN-04: the stored file can be downloaded as a PPTX attachment.
    const download = await fetch(`${app.url}/reportes/${entry.id}`);
    assert.equal(download.status, 200);
    assert.equal(download.headers.get('content-type'), PPTX_CONTENT_TYPE);
    assert.match(download.headers.get('content-disposition') ?? '', /attachment/i);

    const body = Buffer.from(await download.arrayBuffer());
    assert.equal(body.subarray(0, 2).toString('latin1'), 'PK');
  } finally {
    await app.cleanup();
  }
});

test('GET /reportes/:id returns 404 HTML for an unknown report', async () => {
  const app = await startIsolatedApp();
  try {
    const response = await fetch(`${app.url}/reportes/no-existe`);
    assert.equal(response.status, 404);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);
    const html = await response.text();
    assert.match(html, /No se encontró/i);
  } finally {
    await app.cleanup();
  }
});

test('GET /reportes shows a friendly message when there are no reports', async () => {
  const app = await startIsolatedApp();
  try {
    const response = await fetch(`${app.url}/reportes`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /no hay reportes|aún no/i);
  } finally {
    await app.cleanup();
  }
});
