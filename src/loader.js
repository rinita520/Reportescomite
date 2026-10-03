import XLSX from 'xlsx';
import { SHEETS, SHEET_KEYS, SINGULAR_SHEETS } from './models.js';

/**
 * Read an XLSX file and return `{ [sheetName]: rows[] }`.
 *
 * Throws a descriptive error if any sheet required by the spec (section 8) is
 * missing from the workbook.
 */
export function readWorkbook(filePath) {
  const workbook = XLSX.readFile(filePath);
  const present = new Set(workbook.SheetNames);

  const missing = Object.keys(SHEETS).filter((sheet) => !present.has(sheet));
  if (missing.length > 0) {
    throw new Error(
      `Faltan hojas requeridas en el archivo: ${missing.join(', ')}.`,
    );
  }

  const result = {};
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    result[sheetName] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  }
  return result;
}

/**
 * Read a case XLSX file and normalize it into the structure consumed by the
 * validator and (later) the PPTX renderer.
 *
 * `caso` and `cliente` are single objects (one record); the remaining keys are
 * arrays of records. The raw sheet map is kept under `_sheets` so the
 * validator can verify sheet presence with the original names.
 */
export function loadCaso(filePath) {
  const sheets = readWorkbook(filePath);

  const data = { _sheets: sheets };
  for (const [sheet, key] of Object.entries(SHEET_KEYS)) {
    const rows = sheets[sheet] ?? [];
    if (SINGULAR_SHEETS.has(sheet)) {
      data[key] = rows.length > 0 ? { ...rows[0] } : null;
    } else {
      data[key] = rows.map((row) => ({ ...row }));
    }
  }
  return data;
}
