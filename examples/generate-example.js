/**
 * Genera `examples/ejemplo.xlsx`: un caso completo y ficticio con las 9 hojas
 * del formato de entrada (spec, sección 8).
 *
 * El archivo es re-ejecutable: cada corrida sobrescribe `ejemplo.xlsx` con el
 * mismo contenido determinista. Todos los datos son inventados; no
 * corresponden a personas, empresas ni identificaciones reales.
 *
 * Uso: `npm run example`
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from '../src/sheetjs.js';

const here = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(here, 'ejemplo.xlsx');

/**
 * Columnas mínimas por hoja, en el orden del formato de entrada (sección 8).
 * `Casos` agrega `nota_muestra`, que es opcional según la especificación.
 */
const SHEET_HEADERS = {
  Casos: [
    'id_caso',
    'periodo',
    'fecha_corte',
    'origen_caso',
    'antecedentes',
    'nota_muestra',
    'total_movimientos',
    'movimientos_incluidos',
  ],
  Clientes: [
    'id_cliente',
    'tipo_identificacion',
    'identificacion',
    'nombre',
    'segmento',
    'actividad_economica',
    'residencia',
  ],
  Productos: ['id_producto', 'id_cliente', 'tipo_producto', 'numero'],
  MovimientoPorTipo: [
    'id_caso',
    'tipo_transaccion',
    'monto',
    'moneda',
    'numero_operaciones',
  ],
  MovimientoPorContraparte: [
    'id_caso',
    'tipo_movimiento',
    'rol_contraparte',
    'identificacion',
    'nombre',
    'monto',
    'moneda',
    'numero_operaciones',
  ],
  Documentos: [
    'id_documento',
    'id_caso',
    'tipo',
    'numero',
    'fecha',
    'emisor',
    'referencia',
  ],
  Alertas: ['id_alerta', 'id_caso', 'tipo', 'descripcion', 'sustento'],
  Terceros: [
    'id_tercero',
    'id_caso',
    'tipo_identificacion',
    'identificacion',
    'nombre',
    'relacion',
    'rol',
    'monto_involucrado',
  ],
  Comercial: ['id_caso', 'comentario'],
};

const CASO_ID = 'C-2026-08-001';

/** Contenido del caso. Todo ficticio, con totales coherentes entre hojas. */
const EXAMPLE = {
  Casos: [
    {
      id_caso: CASO_ID,
      periodo: '2026-08',
      fecha_corte: '2026-08-31',
      origen_caso:
        'Alerta automática de monitoreo transaccional (regla R-07: variación de volumen).',
      antecedentes:
        'Cliente con incremento atípico de recaudaciones y transferencias que no guardan relación con su actividad declarada. Caso usado como demostración: todos los datos son ficticios.',
      nota_muestra:
        'Muestra significativa: 180 de 480 movimientos, seleccionados por el analista (operaciones mayores a USD 2.000).',
      total_movimientos: 480,
      movimientos_incluidos: 180,
    },
  ],
  Clientes: [
    {
      id_cliente: 'CL-2026-0042',
      tipo_identificacion: 'RUC',
      identificacion: '1790012345001',
      nombre: 'Distribuidora Andesur Ficticia S.A.',
      segmento: 'Persona Jurídica - Empresarial',
      actividad_economica: 'Venta al por mayor de productos de consumo masivo',
      residencia: 'Quito, Pichincha',
    },
  ],
  Productos: [
    {
      id_producto: 'P-001',
      id_cliente: 'CL-2026-0042',
      tipo_producto: 'Cuenta corriente',
      numero: '0001234567',
    },
    {
      id_producto: 'P-002',
      id_cliente: 'CL-2026-0042',
      tipo_producto: 'Cuenta de ahorro',
      numero: '0007654321',
    },
    {
      id_producto: 'P-003',
      id_cliente: 'CL-2026-0042',
      tipo_producto: 'Crédito comercial',
      numero: '0009988776',
    },
  ],
  // Suma de operaciones: 42 + 65 + 18 + 30 + 25 = 180 (= movimientos_incluidos).
  MovimientoPorTipo: [
    {
      id_caso: CASO_ID,
      tipo_transaccion: 'Transferencia interbancaria',
      monto: 185000,
      moneda: 'USD',
      numero_operaciones: 42,
    },
    {
      id_caso: CASO_ID,
      tipo_transaccion: 'Recaudación de proveedores',
      monto: 96000,
      moneda: 'USD',
      numero_operaciones: 65,
    },
    {
      id_caso: CASO_ID,
      tipo_transaccion: 'Pago de nómina',
      monto: 54000,
      moneda: 'USD',
      numero_operaciones: 18,
    },
    {
      id_caso: CASO_ID,
      tipo_transaccion: 'Débito automático',
      monto: 27500,
      moneda: 'USD',
      numero_operaciones: 30,
    },
    {
      id_caso: CASO_ID,
      tipo_transaccion: 'Depósito en efectivo',
      monto: 31000,
      moneda: 'USD',
      numero_operaciones: 25,
    },
  ],
  // Acreedores/ordenantes: 42 operaciones. Deudores/beneficiarios: 138. Total: 180.
  MovimientoPorContraparte: [
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'acreedor',
      rol_contraparte: 'ordenante',
      identificacion: '1791111111001',
      nombre: 'Importadora Pacífico Ficticia Cía. Ltda.',
      monto: 62000,
      moneda: 'USD',
      numero_operaciones: 14,
    },
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'acreedor',
      rol_contraparte: 'ordenante',
      identificacion: '1792222222001',
      nombre: 'Servicios Logísticos Ficticios S.A.',
      monto: 45000,
      moneda: 'USD',
      numero_operaciones: 11,
    },
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'acreedor',
      rol_contraparte: 'ordenante',
      identificacion: '1713333333001',
      nombre: 'Comercial Ficticia del Norte',
      monto: 38000,
      moneda: 'USD',
      numero_operaciones: 9,
    },
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'acreedor',
      rol_contraparte: 'ordenante',
      identificacion: '1794444444001',
      nombre: 'Agroexportadora Ficticia S.A.',
      monto: 40000,
      moneda: 'USD',
      numero_operaciones: 8,
    },
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'deudor',
      rol_contraparte: 'beneficiario',
      identificacion: '1795555555001',
      nombre: 'Proveedores Ficticios Reunidos S.A.',
      monto: 52000,
      moneda: 'USD',
      numero_operaciones: 52,
    },
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'deudor',
      rol_contraparte: 'beneficiario',
      identificacion: '1716666666001',
      nombre: 'Transportes Ficticios Andinos',
      monto: 34000,
      moneda: 'USD',
      numero_operaciones: 34,
    },
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'deudor',
      rol_contraparte: 'beneficiario',
      identificacion: '1797777777001',
      nombre: 'Suministros Ficticios del Austro',
      monto: 29000,
      moneda: 'USD',
      numero_operaciones: 30,
    },
    {
      id_caso: CASO_ID,
      tipo_movimiento: 'deudor',
      rol_contraparte: 'beneficiario',
      identificacion: '1718888888001',
      nombre: 'Nómina Ficticia (varios empleados)',
      monto: 67000,
      moneda: 'USD',
      numero_operaciones: 22,
    },
  ],
  Documentos: [
    {
      id_documento: 'D-001',
      id_caso: CASO_ID,
      tipo: 'Estados financieros',
      numero: 'EEFF-2026-06',
      fecha: '2026-07-15',
      emisor: 'Distribuidora Andesur Ficticia S.A.',
      referencia: 'Balance y estado de resultados a junio 2026',
    },
    {
      id_documento: 'D-002',
      id_caso: CASO_ID,
      tipo: 'Certificado tributario',
      numero: 'CERT-2026-7788',
      fecha: '2026-08-02',
      emisor: 'Servicio de Rentas Internas (ficticio)',
      referencia: 'Vigencia de obligaciones al corte',
    },
    {
      id_documento: 'D-003',
      id_caso: CASO_ID,
      tipo: 'Contrato de mutuo',
      numero: 'CTR-2026-0451',
      fecha: '2026-06-20',
      emisor: 'Notaría Ficticia No. 7',
      referencia: 'Préstamo entre partes relacionadas',
    },
    {
      id_documento: 'D-004',
      id_caso: CASO_ID,
      tipo: 'Facturas de proveedores',
      numero: 'LOTE-FACT-0912',
      fecha: '2026-08-10',
      emisor: 'Distribuidora Andesur Ficticia S.A.',
      referencia: 'Carpeta de facturas mayores a USD 2.000',
    },
    {
      id_documento: 'D-005',
      id_caso: CASO_ID,
      tipo: 'Justificación del área comercial',
      numero: 'MEMO-COM-2026-014',
      fecha: '2026-08-28',
      emisor: 'Área Comercial (ficticia)',
      referencia: 'Contexto comercial del incremento de volumen',
    },
  ],
  Alertas: [
    {
      id_alerta: 'A-001',
      id_caso: CASO_ID,
      tipo: 'Desviación de perfil transaccional',
      descripcion:
        'Incremento de 210% en el volumen mensual frente al promedio de los últimos 12 meses.',
      sustento: 'Reporte interno de monitoreo M-2026-08-114.',
    },
    {
      id_alerta: 'A-002',
      id_caso: CASO_ID,
      tipo: 'Fragmentación de operaciones',
      descripcion:
        'Múltiples transferencias cercanas al umbral de reporte dentro de la misma jornada.',
      sustento: 'Extracto de la cuenta corriente 0001234567.',
    },
    {
      id_alerta: 'A-003',
      id_caso: CASO_ID,
      tipo: 'Contrapartes sin relación comercial declarada',
      descripcion:
        'Cuatro ordenantes no figuran en el detalle de proveedores registrado por el cliente.',
      sustento: 'Listado de proveedores registrado y detalle de contrapartes.',
    },
    {
      id_alerta: 'A-004',
      id_caso: CASO_ID,
      tipo: 'Pago de nómina no recurrente',
      descripcion:
        'Pago de nómina atípico por USD 67.000 ejecutado en un único lote.',
      sustento: 'Archivo de nómina COB-2026-08-31.',
    },
  ],
  Terceros: [
    {
      id_tercero: 'T-001',
      id_caso: CASO_ID,
      tipo_identificacion: 'RUC',
      identificacion: '1791111111001',
      nombre: 'Importadora Pacífico Ficticia Cía. Ltda.',
      relacion: 'Proveedor no registrado del cliente',
      rol: 'Ordenante',
      monto_involucrado: 62000,
    },
    {
      id_tercero: 'T-002',
      id_caso: CASO_ID,
      tipo_identificacion: 'RUC',
      identificacion: '1792222222001',
      nombre: 'Servicios Logísticos Ficticios S.A.',
      relacion: 'Cliente del mismo grupo económico',
      rol: 'Ordenante',
      monto_involucrado: 45000,
    },
    {
      id_tercero: 'T-003',
      id_caso: CASO_ID,
      tipo_identificacion: 'RUC',
      identificacion: '1795555555001',
      nombre: 'Proveedores Ficticios Reunidos S.A.',
      relacion: 'Proveedor habitual del cliente',
      rol: 'Beneficiario',
      monto_involucrado: 52000,
    },
    {
      id_tercero: 'T-004',
      id_caso: CASO_ID,
      tipo_identificacion: 'CÉDULA',
      identificacion: '1716666666',
      nombre: 'Transportes Ficticios Andinos',
      relacion: 'Prestador de servicios de transporte',
      rol: 'Beneficiario',
      monto_involucrado: 34000,
    },
    {
      id_tercero: 'T-005',
      id_caso: CASO_ID,
      tipo_identificacion: 'RUC',
      identificacion: '1794444444001',
      nombre: 'Agroexportadora Ficticia S.A.',
      relacion: 'Vinculada por préstamo entre partes relacionadas',
      rol: 'Ordenante',
      monto_involucrado: 40000,
    },
  ],
  Comercial: [
    {
      id_caso: CASO_ID,
      comentario:
        'El incremento de recaudaciones corresponde a la campaña de temporada alta (julio-agosto) y a la incorporación de dos distribuidores regionales. El ejecutivo de cuenta confirma contratos vigentes y estima que el volumen se normalice desde septiembre.',
    },
    {
      id_caso: CASO_ID,
      comentario:
        'Respecto del pago de nómina del 31 de agosto, corresponde a la liquidación de utilidades del personal de temporada; el área comercial conserva el soporte documental respectivo.',
    },
  ],
};

const workbook = XLSX.utils.book_new();

for (const [sheet, rows] of Object.entries(EXAMPLE)) {
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: SHEET_HEADERS[sheet],
  });
  XLSX.utils.book_append_sheet(workbook, worksheet, sheet);
}

XLSX.writeFile(workbook, OUTPUT_PATH);

console.log(`Ejemplo generado: ${OUTPUT_PATH}`);
console.log(
  `Hojas: ${Object.keys(EXAMPLE).length} · Caso: ${CASO_ID} · Datos ficticios.`,
);
