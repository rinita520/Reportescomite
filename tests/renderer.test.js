import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { sampleFilePath } from './helpers.js';
import { loadCaso } from '../src/loader.js';
import { renderReport } from '../src/renderer.js';

test('renderReport generates a PPTX deck for a valid case', async () => {
  const { file, dir, cleanup } = sampleFilePath();
  try {
    const caso = loadCaso(file);
    const outputPath = join(dir, 'reporte.pptx');

    const result = await renderReport(caso, {
      outputPath,
      meta: {
        periodo: '2026-08',
        autor: 'Analista de Cumplimiento',
        fecha: '2026-10-02',
        version: 'v1.0',
        id: 'REP-2026-08-C001',
        confidencialidad: 'Confidencial',
      },
    });

    assert.equal(result.outputPath, outputPath);
    assert.ok(
      result.slideCount >= 10,
      `expected at least 10 slides, got ${result.slideCount}`,
    );

    assert.ok(existsSync(outputPath), 'the PPTX file must exist');
    const buffer = readFileSync(outputPath);
    // PPTX is a ZIP container: it starts with the PK magic bytes.
    assert.equal(buffer.subarray(0, 2).toString('latin1'), 'PK');
    assert.ok(
      statSync(outputPath).size > 5000,
      `expected a non-trivial file, got ${statSync(outputPath).size} bytes`,
    );
  } finally {
    cleanup();
  }
});

test('renderReport rejects when a mandatory topic is missing', async () => {
  const { file, dir, cleanup } = sampleFilePath({ emptySheets: ['Alertas'] });
  try {
    const caso = loadCaso(file);
    await assert.rejects(
      () => renderReport(caso, { outputPath: join(dir, 'reporte.pptx') }),
      (error) => {
        assert.ok(error instanceof Error, 'must reject with an Error');
        assert.match(error.message, /Señales de alerta/i);
        return true;
      },
    );
  } finally {
    cleanup();
  }
});
