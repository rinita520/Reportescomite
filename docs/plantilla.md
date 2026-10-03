# Plantilla del reporte (PPTX)

Documentación de la **plantilla visual única** (RF-03) del reporte al Comité de
Cumplimiento. Describe cada diapositiva, el tema que renderiza y los datos que
la alimentan. El orden es fijo (RF-04) y corresponde a los 8 temas obligatorios
de la especificación (sección 7).

Fuente: `src/renderer.js` y `src/theme.js`.

## Lienzo y estilo

| Elemento | Valor |
|---|---|
| Tamano | `LAYOUT_WIDE` (13.333 × 7.5 in) |
| Margen | 0.5 in |
| Franja de encabezado | 0.9 in de alto, azul corporativo `1F3864` + línea de acento `2E75B6` |
| Pie de pagina | 0.35 in; texto a la derecha: `Clasificación · Identificador` |
| Tipografia | Calibri (títulos y cuerpo) |
| Paleta de gráficos | `1F3864`, `2E75B6`, `5B9BD5`, `9DC3E6`, `C9DAF0`, `2F5597` |
| Tablas | Encabezado azul `1F3864` con texto blanco; filas alternadas `EDF2FA`; bordes `D9D9D9` |
| Datos vacíos | Se muestran como `—`; una tabla sin filas muestra "Sin información" |

Todas las diapositivas de contenido llevan la misma franja de encabezado con su
título y el mismo pie de trazabilidad.

## Diapositiva por diapositiva

| # | Diapositiva | Tema (sección 7) | Hoja de origen | Contenido renderizado |
|---|---|---|---|---|
| 1 | **Portada** | Elemento estructural | `Casos` + metadatos | Título, subtítulo y tabla: período, autor, fecha, clasificación e identificador. |
| 2 | **Datos generales del cliente analizado** | 1 | `Clientes` | Tabla campo/valor con ID, tipo e identificación, nombre o razón social, segmento, actividad económica y residencia. |
| 3 | **Antecedentes del caso** | 2 | `Casos` + `Productos` | Tabla corta (período, fecha de corte, origen, total e incluidos), bloque de antecedentes, nota de muestra y tabla de productos involucrados. |
| 4 | **Movimientos transaccionales (resumen) — por tipo** | 3 (vista a) | `MovimientoPorTipo` | Tabla: tipo de transacción, monto, moneda y número de operaciones. |
| 5 | **Movimientos transaccionales (resumen) — por contraparte** | 3 (vista b) | `MovimientoPorContraparte` | Tabla: tipo de movimiento, rol, identificación, nombre, monto, moneda y número de operaciones. |
| 6 | **Documentación entregada** | 4 | `Documentos` | Inventario: tipo, número, fecha, emisor y referencia. Se presenta tal como fue aportada. |
| 7 | **Señales de alerta** | 5 | `Alertas` | Tabla: tipo, descripción y sustento de cada inusualidad determinada por el analista. |
| 8 | **Resumen gráfico del caso** | 6 | `MovimientoPorTipo` + `MovimientoPorContraparte` | Gráfico circular "Monto por tipo de transacción" y gráfico de barras "Monto por contraparte". |
| 9 | **Detalle de Terceros Relacionados** | 7 | `Terceros` | Tabla: tipo de identificación, identificación, nombre, relación, rol y monto involucrado. |
| 10 | **Comentarios del área comercial** | 8 | `Comercial` | Uno o más comentarios, separados por línea en blanco. |
| 11 | **Pie de trazabilidad** | Elemento estructural | Metadatos + `Casos` | Tabla: autor, fecha de generación, versión, identificador del reporte y clasificación. |

## Movimientos: dos vistas (tema 3)

El tema 3 se divide en **dos diapositivas** sobre la misma muestra
significativa (D9, RN-09):

- **Por tipo de transacción** (`MovimientoPorTipo`): una fila por tipo, con
  monto, moneda y número de operaciones.
- **Por contraparte** (`MovimientoPorContraparte`): los movimientos
  **acreedores** se resumen por **ordenante**; los **deudores**, por
  **beneficiario**.

La muestra la define el analista y por lo general abarca el total; el sistema
no la calcula ni la valida.

## Resumen gráfico (tema 6, RF-13)

Se genera automáticamente a partir de las mismas dos hojas de movimientos:

| Gráfico | Tipo pptxgenjs | Origen | Serie |
|---|---|---|---|
| Monto por tipo de transacción | Circular (`pie`) | `MovimientoPorTipo` | `tipo_transaccion` → `monto` |
| Monto por contraparte | Barras verticales (`bar`) | `MovimientoPorContraparte` | `nombre` → `monto` |

## Trazabilidad

El pie de página (`Clasificación · Identificador`) aparece en **todas** las
diapositivas. La última diapositiva consolida autor, fecha de generación,
versión, identificador y clasificación. Cada generación queda además registrada
en `output/registry.json` (RF-06, RF-07, RN-04).

## Generar una vista de ejemplo

```bash
npm run example   # crea examples/ejemplo.xlsx (caso ficticio, 9 hojas)
npm start         # carga ese archivo en http://localhost:3000
```
