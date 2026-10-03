import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleFilePath } from './helpers.js';
import { readWorkbook, loadCaso } from '../src/loader.js';

test('readWorkbook returns rows keyed by sheet name', () => {
  const { file, cleanup } = sampleFilePath();
  try {
    const sheets = readWorkbook(file);
    assert.ok(Array.isArray(sheets.Casos), 'Casos should be an array');
    assert.equal(sheets.Casos[0].id_caso, 'C-001');
    assert.equal(sheets.MovimientoPorTipo.length, 1);
    assert.equal(sheets.MovimientoPorContraparte.length, 2);
  } finally {
    cleanup();
  }
});

test('loadCaso normalizes the workbook into the expected shape', () => {
  const { file, cleanup } = sampleFilePath();
  try {
    const caso = loadCaso(file);

    for (const key of [
      'caso',
      'cliente',
      'productos',
      'movimientosPorTipo',
      'movimientosPorContraparte',
      'documentos',
      'alertas',
      'terceros',
      'comercial',
    ]) {
      assert.ok(key in caso, `missing normalized key: ${key}`);
    }

    assert.equal(caso.caso.id_caso, 'C-001');
    assert.equal(caso.cliente.nombre, 'Juan Perez');
    assert.equal(caso.alertas.length, 1);
    assert.equal(caso.movimientosPorContraparte[1].rol_contraparte, 'beneficiario');
  } finally {
    cleanup();
  }
});

test('loadCaso throws a descriptive error when a required sheet is missing', () => {
  const { file, cleanup } = sampleFilePath({ dropSheets: ['Alertas'] });
  try {
    assert.throws(() => loadCaso(file), /Alertas/);
  } finally {
    cleanup();
  }
});
