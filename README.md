# Generador Estandarizado de Reportes UAFE

Herramienta interna que toma el análisis **ya realizado** por el analista de
cumplimiento sobre un caso y lo presenta con orden fijo y formato gráfico,
siguiendo los 8 temas del formato interno, para el Comité de Cumplimiento.

La herramienta **ordena, formatea y grafica**. No reemplaza el criterio del
analista ni decide nada por él.

## Qué hace y qué no hace

| Sí hace | No hace |
|---|---|
| Lee el análisis del caso desde un XLSX (9 hojas, spec sección 8). | No analiza, detecta inusualidades ni clasifica operaciones. |
| Valida que estén los 8 temas mínimos y los campos obligatorios. | No evalúa si una operación está justificada. |
| Ordena el contenido según los 8 temas, en orden fijo. | No calcula ni valida la muestra significativa (la define el analista). |
| Aplica una plantilla visual única y genera el PPTX. | No evalúa si la documentación entregada es suficiente. |
| Registra metadatos, versión, hash y trazabilidad. | No envía el reporte a la UAFE ni lo firma electrónicamente. |

> Presenta el contenido del analista **sin alterarlo ni reinterpretarlo** (RF-14).

## Requisitos

- Node.js v24 o superior.
- Acceso a la red para `npm install` (la dependencia `xlsx` se instala desde
  el CDN oficial de SheetJS).

## Instalación

```bash
npm install
```

> **Windows / PowerShell:** si `npm` falla con un error `unauthorizedAccess … npm.ps1`,
> es la política de ejecución de scripts la que bloquea los `.ps1`. Usá `npm.cmd`
> (o `cmd /c "npm …"`) para cualquier comando npm.

## Ejecución

```bash
npm start
```

Abre **http://localhost:3000**. El puerto se puede cambiar con la variable de
entorno `PORT`:

```bash
set PORT=4000 && npm start   # Windows (cmd)
```

## Uso

1. Prepara el XLSX con las 9 hojas y columnas de la sección
   [Formato de entrada](#formato-de-entrada). Puedes partir de
   [`examples/ejemplo.xlsx`](examples/ejemplo.xlsx).
2. Abre http://localhost:3000.
3. Adjunta el archivo XLSX.
4. Completa los metadatos opcionales (autor, período, versión,
   clasificación, identificador). Si se omiten, se usan valores por defecto.
5. Pulsa **Generar reporte**.
6. El PPTX se descarga automáticamente. Si el archivo no cumple los
   requisitos, la página lista **campo y fila** de cada error y no genera nada.
7. Consulta las generaciones anteriores en http://localhost:3000/reportes.

¿No tienes un archivo a mano? Genera el ejemplo ficticio incluido:

```bash
npm run example
```

Esto crea (o sobrescribe) [`examples/ejemplo.xlsx`](examples/ejemplo.xlsx) con
un caso completo y ficticio.

## Formato de entrada

Archivo **XLSX** con las 9 hojas siguientes. Cada hoja debe existir y sus
columnas obligatorias deben tener valor en cada fila; una fila vacía o un
campo en blanco bloquea la generación.

| Hoja | Columnas mínimas |
|---|---|
| `Casos` | `id_caso`, `periodo`, `fecha_corte`, `origen_caso`, `antecedentes`, `nota_muestra` (opcional), `total_movimientos`, `movimientos_incluidos` |
| `Clientes` | `id_cliente`, `tipo_identificacion`, `identificacion`, `nombre`, `segmento`, `actividad_economica`, `residencia` |
| `Productos` | `id_producto`, `id_cliente`, `tipo_producto`, `numero` |
| `MovimientoPorTipo` | `id_caso`, `tipo_transaccion`, `monto`, `moneda`, `numero_operaciones` |
| `MovimientoPorContraparte` | `id_caso`, `tipo_movimiento` (`acreedor`/`deudor`), `rol_contraparte` (`ordenante`/`beneficiario`), `identificacion`, `nombre`, `monto`, `moneda`, `numero_operaciones` |
| `Documentos` | `id_documento`, `id_caso`, `tipo`, `numero`, `fecha`, `emisor`, `referencia` |
| `Alertas` | `id_alerta`, `id_caso`, `tipo`, `descripcion`, `sustento` |
| `Terceros` | `id_tercero`, `id_caso`, `tipo_identificacion`, `identificacion`, `nombre`, `relacion`, `rol`, `monto_involucrado` |
| `Comercial` | `id_caso`, `comentario` |

Notas de formato:

- `Casos` y `Clientes` son **un solo registro** (se usa la primera fila).
  Las demás hojas admiten varias filas.
- Los movimientos se presentan en **dos vistas**: por tipo de transacción y
  por contraparte (ordenantes en acreedores, beneficiarios en deudores).
- La **muestra significativa** la define el analista; el sistema no la calcula
  ni la valida (RN-09).

## Salida: 11 diapositivas

El PPTX se genera con una plantilla única. Orden fijo:

| # | Diapositiva | Tema |
|---|---|---|
| 1 | Portada | Elemento estructural |
| 2 | Datos generales del cliente analizado | 1 |
| 3 | Antecedentes del caso | 2 |
| 4 | Movimientos transaccionales (resumen) — por tipo | 3 (vista a) |
| 5 | Movimientos transaccionales (resumen) — por contraparte | 3 (vista b) |
| 6 | Documentación entregada | 4 |
| 7 | Señales de alerta | 5 |
| 8 | Resumen gráfico del caso | 6 |
| 9 | Detalle de Terceros Relacionados | 7 |
| 10 | Comentarios del área comercial | 8 |
| 11 | Pie de trazabilidad | Elemento estructural |

El detalle por diapositiva está en [`docs/plantilla.md`](docs/plantilla.md).

## Registro de reportes

Cada generación se registra en `output/registry.json` (append-only: nunca
sobrescribe una versión anterior) con identificador, período, autor, versión,
tamaño, número de diapositivas y hash SHA-256.

- `GET /reportes` — historial de generaciones, más recientes primero.
- `GET /reportes/:id` — descarga el PPTX registrado.

## Pruebas

```bash
npm test
```

Usa el runner integrado de Node (`node:test`). La suite incluye el ejemplo
comprometido (`tests/example.test.js`), que verifica que
`examples/ejemplo.xlsx` carga y valida sin errores.

## Estructura del proyecto

```text
.
├── examples/
│   ├── generate-example.js   # genera el caso ficticio de ejemplo
│   └── ejemplo.xlsx          # caso completo y ficticio (9 hojas)
├── docs/
│   └── plantilla.md          # documentación de la plantilla, diapositiva por diapositiva
├── specs/
│   └── generador-reportes-uafe.spec.md
├── src/
│   ├── app.js                # rutas Express (formulario, generar, /reportes)
│   ├── server.js             # arranque del servidor
│   ├── loader.js             # lectura del XLSX
│   ├── validator.js          # validación de los 8 temas y campos obligatorios
│   ├── models.js             # hojas, columnas y temas (fuente de verdad)
│   ├── renderer.js           # generación del PPTX
│   ├── registry.js           # registro JSON de reportes
│   ├── theme.js              # plantilla visual única
│   └── sheetjs.js            # wiring ESM de SheetJS
└── tests/                    # pruebas con node:test
```

## Nota de seguridad

- **SheetJS (`xlsx`)** se instala desde el **CDN oficial** de SheetJS
  (`https://cdn.sheetjs.com/xlsx-0.20.3/`), no desde npm, para evitar la
  versión con vulnerabilidades publicada en el registro. Su build ESM no
  auto-carga módulos de Node, por eso `src/sheetjs.js` inyecta `node:fs`.
- Se fija **`image-size@^2.0.4`** vía `overrides` en `package.json` para
  resolver la vulnerabilidad transitiva de versiones anteriores.
- La carga de archivos está limitada a **10 MB** y las respuestas HTML
  escapan los valores no confiables.

Verificación de dependencias:

```bash
npm audit
```
