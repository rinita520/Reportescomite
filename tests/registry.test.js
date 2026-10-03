import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRegistry } from '../src/registry.js';

let dir;

before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'uafe-registry-'));
});

after(async () => {
  await rm(dir, { recursive: true, force: true });
});

/** A complete registry entry (all metadata required by RF-06). */
function sampleEntry(overrides = {}) {
  return {
    report_id: 'REP-2026-08-C001',
    archivo: 'reporte-abc.pptx',
    hash: 'a'.repeat(64),
    autor: 'Analista de Cumplimiento',
    periodo: '2026-08',
    version: 'v1.0',
    confidencialidad: 'Confidencial',
    casos: ['C-001'],
    slide_count: 11,
    bytes: 12345,
    ...overrides,
  };
}

test('append/list/get round-trip persists the entry', async () => {
  const filePath = join(dir, 'nested', 'roundtrip.json');
  const registry = createRegistry({ filePath });

  const stored = await registry.append(sampleEntry());

  assert.ok(stored.id, 'append assigns an id');
  assert.match(
    stored.fecha_generacion,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    'append assigns an ISO fecha_generacion',
  );

  const list = await registry.list();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, stored.id);
  assert.equal(list[0].report_id, 'REP-2026-08-C001');
  assert.deepEqual(list[0].casos, ['C-001']);

  const got = await registry.get(stored.id);
  assert.deepEqual(got, stored);
  assert.equal(await registry.get('does-not-exist'), null);

  // Persisted as a JSON array that creates parent dirs lazily.
  const raw = JSON.parse(await readFile(filePath, 'utf8'));
  assert.ok(Array.isArray(raw));
  assert.equal(raw.length, 1);
});

test('list returns entries newest-first', async () => {
  const registry = createRegistry({ filePath: join(dir, 'order.json') });

  await registry.append(sampleEntry({ report_id: 'A' }));
  await registry.append(sampleEntry({ report_id: 'B' }));
  await registry.append(sampleEntry({ report_id: 'C' }));

  const list = await registry.list();
  assert.deepEqual(
    list.map((entry) => entry.report_id),
    ['C', 'B', 'A'],
  );
});

test('append assigns unique ids, even when a duplicate id is supplied', async () => {
  const registry = createRegistry({ filePath: join(dir, 'ids.json') });

  const generated = [];
  for (let i = 0; i < 5; i += 1) {
    generated.push(await registry.append(sampleEntry({ report_id: `R${i}` })));
  }
  const ids = new Set(generated.map((entry) => entry.id));
  assert.equal(ids.size, 5, 'generated ids are unique');

  // A caller-supplied id must never collide with an existing entry (RN-04).
  const first = await registry.append(sampleEntry({ id: 'fixed', report_id: 'X' }));
  const second = await registry.append(sampleEntry({ id: 'fixed', report_id: 'Y' }));
  assert.notEqual(first.id, second.id);
});

test('two registry instances on the same file share state', async () => {
  const filePath = join(dir, 'shared.json');
  const writer = createRegistry({ filePath });
  const stored = await writer.append(sampleEntry());

  const reader = createRegistry({ filePath });
  const list = await reader.list();

  assert.equal(list.length, 1);
  assert.equal(list[0].id, stored.id);
  assert.equal((await reader.get(stored.id)).report_id, stored.report_id);
});
