/**
 * Domain models for the UAFE report generator.
 *
 * This module is the single source of truth for the input contract described
 * in `specs/generador-reportes-uafe.spec.md`:
 *   - section 8: required sheets and their minimum columns
 *   - section 7: the 8 mandatory report topics (RF-02 / RN-07)
 */

/**
 * Required sheets -> required columns (spec section 8).
 * Optional columns are listed separately in OPTIONAL_COLUMNS and are NOT
 * enforced by the validator.
 */
export const SHEETS = {
  Casos: [
    'id_caso',
    'periodo',
    'fecha_corte',
    'origen_caso',
    'antecedentes',
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

/**
 * Columns explicitly marked optional in spec section 8.
 */
export const OPTIONAL_COLUMNS = {
  Casos: ['nota_muestra'],
};

/**
 * Sheet name -> key of the normalized object produced by loader.loadCaso.
 */
export const SHEET_KEYS = {
  Casos: 'caso',
  Clientes: 'cliente',
  Productos: 'productos',
  MovimientoPorTipo: 'movimientosPorTipo',
  MovimientoPorContraparte: 'movimientosPorContraparte',
  Documentos: 'documentos',
  Alertas: 'alertas',
  Terceros: 'terceros',
  Comercial: 'comercial',
};

/**
 * Sheets that represent a single record in the normalized case.
 */
export const SINGULAR_SHEETS = new Set(['Casos', 'Clientes']);

const isPresent = (value) =>
  Array.isArray(value) ? value.length > 0 : value != null;

// Topic 3 and 6 both depend on the two movement views (spec section 7 / D9).
const hasBothMovementViews = (data) =>
  isPresent(data?.movimientosPorTipo) &&
  isPresent(data?.movimientosPorContraparte);

/**
 * The 8 mandatory topics (spec section 7) in presentation order.
 * Each topic knows how its presence is checked against the normalized case.
 * Topic 6 (graphical summary) is derived from the movement views (RF-13).
 */
export const TOPICS = [
  {
    id: 1,
    nombre: 'Datos generales del cliente analizado',
    sheet: 'Clientes',
    check: (data) => isPresent(data?.cliente),
  },
  {
    id: 2,
    nombre: 'Antecedentes del caso',
    sheet: 'Casos',
    check: (data) => isPresent(data?.caso),
  },
  {
    id: 3,
    nombre: 'Movimientos transaccionales (resumen)',
    sheet: 'MovimientoPorTipo',
    check: hasBothMovementViews,
  },
  {
    id: 4,
    nombre: 'Documentación entregada',
    sheet: 'Documentos',
    check: (data) => isPresent(data?.documentos),
  },
  {
    id: 5,
    nombre: 'Señales de alerta',
    sheet: 'Alertas',
    check: (data) => isPresent(data?.alertas),
  },
  {
    id: 6,
    nombre: 'Resumen gráfico del caso',
    sheet: 'MovimientoPorTipo',
    check: hasBothMovementViews,
  },
  {
    id: 7,
    nombre: 'Detalle de Terceros Relacionados',
    sheet: 'Terceros',
    check: (data) => isPresent(data?.terceros),
  },
  {
    id: 8,
    nombre: 'Comentarios del área comercial',
    sheet: 'Comercial',
    check: (data) => isPresent(data?.comercial),
  },
];
