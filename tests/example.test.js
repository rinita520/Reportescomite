import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCaso } from '../src/loader.js';
import { validateCaso } from '../src/validator.js';

const here = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_PATH = join(here, '..', 'examples', 'ejemplo.xlsx');

test('el ejemplo comprometido se carga con loadCaso', () => {
  assert.ok(existsSync(EXAMPLE_PATH), 'examples/ejemplo.xlsx debe existir');
  const caso = loadCaso(EXAMPLE_PATH);

  assert.equal(caso.caso.id_caso, 'C-2026-08-001');
  assert.equal(caso.cliente.nombre, 'Distribuidora Andesur Ficticia S.A.');
  assert.ok(caso.productos.length >= 1, 'debe incluir al menos un producto');
});

test('el ejemplo comprometido pasa la validación de los 8 temas', () => {
  const caso = loadCaso(EXAMPLE_PATH);
  const { ok, errors } = validateCaso(caso);

  assert.equal(ok, true, errors.map((error) => error.message).join('\n'));
  assert.deepEqual(errors, []);
});

test('el ejemplo trae varios movimientos en ambas vistas, acreedor y deudor', () => {
  const caso = loadCaso(EXAMPLE_PATH);

  assert.ok(
    caso.movimientosPorTipo.length >= 2,
    'la vista por tipo debe tener varias filas',
  );
  assert.ok(
    caso.movimientosPorContraparte.length >= 2,
    'la vista por contraparte debe tener varias filas',
  );
  assert.ok(
    caso.movimientosPorContraparte.some((r) => r.tipo_movimiento === 'acreedor'),
    'debe haber al menos un movimiento acreedor',
  );
  assert.ok(
    caso.movimientosPorContraparte.some((r) => r.tipo_movimiento === 'deudor'),
    'debe haber al menos un movimiento deudor',
  );
});
