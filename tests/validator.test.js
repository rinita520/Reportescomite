import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleFilePath } from './helpers.js';
import { loadCaso } from '../src/loader.js';
import { validateCaso } from '../src/validator.js';

test('validateCaso passes for a valid workbook', () => {
  const { file, cleanup } = sampleFilePath();
  try {
    const result = validateCaso(loadCaso(file));
    assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
    assert.deepEqual(result.errors, []);
  } finally {
    cleanup();
  }
});

test('validateCaso reports a missing required field with sheet/field/row detail', () => {
  const { file, cleanup } = sampleFilePath({
    omitFields: [{ sheet: 'Alertas', field: 'sustento' }],
  });
  try {
    const result = validateCaso(loadCaso(file));
    assert.equal(result.ok, false);
    const error = result.errors.find(
      (e) => e.sheet === 'Alertas' && e.field === 'sustento',
    );
    assert.ok(error, `expected Alertas.sustento error, got ${JSON.stringify(result.errors)}`);
    assert.ok(Number.isInteger(error.row) && error.row >= 1, 'row must be a positive integer');
    assert.equal(typeof error.message, 'string');
  } finally {
    cleanup();
  }
});

test('validateCaso reports an empty mandatory topic', () => {
  const { file, cleanup } = sampleFilePath({ emptySheets: ['Alertas'] });
  try {
    const result = validateCaso(loadCaso(file));
    assert.equal(result.ok, false);
    const topicError = result.errors.find((e) => /Señales de alerta/i.test(e.message));
    assert.ok(
      topicError,
      `expected empty-topic error, got ${JSON.stringify(result.errors)}`,
    );
    assert.equal(topicError.field, null);
  } finally {
    cleanup();
  }
});

test('validateCaso reports every missing required field of a sheet', () => {
  const { file, cleanup } = sampleFilePath({
    omitFields: [{ sheet: 'Comercial', field: 'comentario' }],
  });
  try {
    const result = validateCaso(loadCaso(file));
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((e) => e.sheet === 'Comercial' && e.field === 'comentario'),
    );
  } finally {
    cleanup();
  }
});
