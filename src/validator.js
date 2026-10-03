import { SHEETS, SHEET_KEYS, SINGULAR_SHEETS, TOPICS } from './models.js';

const isEmpty = (value) =>
  value == null || (typeof value === 'string' && value.trim() === '');

/**
 * Return the normalized rows for a sheet as an array, or null when the sheet
 * is not represented in the case object at all.
 */
function rowsForSheet(data, sheet) {
  const key = SHEET_KEYS[sheet];
  const value = data?.[key];

  if (SINGULAR_SHEETS.has(sheet)) {
    return value == null ? [] : [value];
  }
  return Array.isArray(value) ? value : null;
}

/**
 * Validate a normalized case (see loader.loadCaso).
 *
 * Applies:
 *   - RF-02: required sheets and mandatory fields present
 *   - RF-10: errors reported with sheet / field / row detail
 *   - RN-07: the 8 mandatory topics must exist and not be empty
 *
 * @returns {{ ok: boolean, errors: Array<{ sheet: string, field: string|null, row: number|null, message: string }> }}
 */
export function validateCaso(data) {
  const errors = [];
  const sheets = data?._sheets ?? null;

  // 1. Required sheets must be present.
  for (const sheet of Object.keys(SHEETS)) {
    if (!sheets || !(sheet in sheets)) {
      errors.push({
        sheet,
        field: null,
        row: null,
        message: `Falta la hoja requerida "${sheet}".`,
      });
    }
  }

  // 2. Required fields must be non-empty.
  for (const [sheet, columns] of Object.entries(SHEETS)) {
    const rows = rowsForSheet(data, sheet);
    if (rows == null) continue; // sheet already reported as missing

    rows.forEach((row, index) => {
      if (row == null || typeof row !== 'object') return;
      for (const field of columns) {
        if (isEmpty(row[field])) {
          errors.push({
            sheet,
            field,
            row: index + 1,
            message: `El campo "${field}" de la hoja "${sheet}" es obligatorio (fila ${index + 1}).`,
          });
        }
      }
    });
  }

  // 3. The 8 mandatory topics must exist and not be empty.
  for (const topic of TOPICS) {
    if (!topic.check(data)) {
      errors.push({
        sheet: topic.sheet,
        field: null,
        row: null,
        message: `Falta el tema obligatorio ${topic.id}: ${topic.nombre}.`,
      });
    }
  }

  return { ok: errors.length === 0, errors };
}
