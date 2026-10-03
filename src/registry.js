import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Report registry backed by a JSON file (array of entries).
 *
 * Satisfies RF-06 (metadata), RF-07 (traceability) and RN-04 (a new version
 * is always appended, never overwriting a previous one). Dependency-free:
 * reads and writes the whole file with `node:fs/promises`.
 *
 * @param {{ filePath: string }} options absolute path of the JSON store.
 * @returns {{
 *   append: (entry: object) => Promise<object>,
 *   list: () => Promise<object[]>,
 *   get: (id: string) => Promise<object | null>,
 * }}
 */
export function createRegistry({ filePath }) {
  /** Read the whole store; a missing file is an empty registry. */
  async function readEntries() {
    try {
      const raw = await readFile(filePath, 'utf8');
      if (raw.trim() === '') return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  /** Persist the whole store, creating parent directories lazily. */
  async function writeEntries(entries) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  }

  return {
    async append(entry) {
      const entries = await readEntries();

      // A caller-supplied id is honored unless it would collide with an
      // existing entry; the assigned id is always unique (RN-04).
      const existingIds = new Set(entries.map((item) => item.id));
      const id =
        entry.id && !existingIds.has(entry.id) ? entry.id : randomUUID();

      const stored = {
        ...entry,
        id,
        fecha_generacion: entry.fecha_generacion ?? new Date().toISOString(),
      };

      entries.push(stored);
      await writeEntries(entries);
      return stored;
    },

    async list() {
      const entries = await readEntries();
      // Newest first: the store is append-only, so reverse insertion order.
      return entries.reverse();
    },

    async get(id) {
      const entries = await readEntries();
      return entries.find((entry) => entry.id === id) ?? null;
    },
  };
}
