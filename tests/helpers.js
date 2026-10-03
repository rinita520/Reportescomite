import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import XLSX from 'xlsx';

/**
 * A complete, valid workbook payload (spec section 8).
 * Every sheet has at least one row and all required fields are populated.
 */
export const SAMPLE = {
  Casos: [
    {
      id_caso: 'C-001',
      periodo: '2026-08',
      fecha_corte: '2026-08-31',
      origen_caso: 'Alerta del sistema de monitoreo',
      antecedentes: 'Cliente con operaciones fuera de su perfil historico.',
      nota_muestra: 'Muestra significativa: total de movimientos del periodo.',
      total_movimientos: 120,
      movimientos_incluidos: 120,
    },
  ],
  Clientes: [
    {
      id_cliente: 'CL-001',
      tipo_identificacion: 'CEDULA',
      identificacion: '1712345678',
      nombre: 'Juan Perez',
      segmento: 'Persona Natural',
      actividad_economica: 'Comercio al por mayor',
      residencia: 'Quito',
    },
  ],
  Productos: [
    {
      id_producto: 'P-001',
      id_cliente: 'CL-001',
      tipo_producto: 'Cuenta de ahorro',
      numero: '00012345',
    },
  ],
  MovimientoPorTipo: [
    {
      id_caso: 'C-001',
      tipo_transaccion: 'Transferencia',
      monto: 15000,
      moneda: 'USD',
      numero_operaciones: 5,
    },
  ],
  MovimientoPorContraparte: [
    {
      id_caso: 'C-001',
      tipo_movimiento: 'acreedor',
      rol_contraparte: 'ordenante',
      identificacion: '0912345678',
      nombre: 'Empresa X',
      monto: 8000,
      moneda: 'USD',
      numero_operaciones: 3,
    },
    {
      id_caso: 'C-001',
      tipo_movimiento: 'deudor',
      rol_contraparte: 'beneficiario',
      identificacion: '1798765432',
      nombre: 'Ana Lopez',
      monto: 7000,
      moneda: 'USD',
      numero_operaciones: 2,
    },
  ],
  Documentos: [
    {
      id_documento: 'D-001',
      id_caso: 'C-001',
      tipo: 'Factura',
      numero: '001-001-000000123',
      fecha: '2026-08-15',
      emisor: 'Proveedor SA',
      referencia: 'Pago de servicios',
    },
  ],
  Alertas: [
    {
      id_alerta: 'A-001',
      id_caso: 'C-001',
      tipo: 'Desviacion de perfil',
      descripcion: 'Operaciones no consistentes con la actividad declarada.',
      sustento: 'Reporte interno #12 del area de monitoreo.',
    },
  ],
  Terceros: [
    {
      id_tercero: 'T-001',
      id_caso: 'C-001',
      tipo_identificacion: 'CEDULA',
      identificacion: '0912345678',
      nombre: 'Empresa X',
      relacion: 'Proveedor del cliente',
      rol: 'Ordenante',
      monto_involucrado: 8000,
    },
  ],
  Comercial: [
    {
      id_caso: 'C-001',
      comentario: 'El ejecutivo de cuenta no reporta observaciones adicionales.',
    },
  ],
};

/**
 * Build an in-memory XLSX workbook from the sample data.
 * Options let tests intentionally corrupt the workbook.
 */
export function buildWorkbook({
  dropSheets = [],
  emptySheets = [],
  omitFields = [],
  blankCells = [],
} = {}) {
  const wb = XLSX.utils.book_new();

  for (const [sheet, rows] of Object.entries(SAMPLE)) {
    if (dropSheets.includes(sheet)) continue;

    if (emptySheets.includes(sheet)) {
      const header = Object.keys(rows[0] ?? {});
      const ws = XLSX.utils.json_to_sheet([], { header });
      XLSX.utils.book_append_sheet(wb, ws, sheet);
      continue;
    }

    const effective = rows.map((row) => {
      const copy = { ...row };
      for (const { sheet: s, field } of omitFields) {
        if (s === sheet) delete copy[field];
      }
      for (const { sheet: s, field } of blankCells) {
        if (s === sheet) copy[field] = '';
      }
      return copy;
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(effective), sheet);
  }

  return wb;
}

/**
 * Write a workbook to a fresh temp file and return the path plus a cleanup fn.
 */
export function writeTempWorkbook(wb) {
  const dir = mkdtempSync(join(tmpdir(), 'uafe-test-'));
  const file = join(dir, 'caso.xlsx');
  XLSX.writeFile(wb, file);
  return { file, dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/**
 * Convenience: build + write in one call.
 */
export function sampleFilePath(options) {
  return writeTempWorkbook(buildWorkbook(options));
}
