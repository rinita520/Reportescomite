/**
 * SheetJS ESM wiring.
 *
 * The SheetJS ESM build does not auto-load Node core modules, so the
 * filesystem must be injected with `set_fs` before `readFile`/`writeFile` can
 * be used from an ESM process (SheetJS installation docs, NodeJS section).
 */
import * as XLSX from 'xlsx';
import * as fs from 'node:fs';

XLSX.set_fs(fs);

export default XLSX;
