import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createApp } from '../src/app.js';
import { sampleFilePath } from './helpers.js';

const PPTX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

let server;
let baseUrl;

before(async () => {
  const app = createApp();
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
});

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
