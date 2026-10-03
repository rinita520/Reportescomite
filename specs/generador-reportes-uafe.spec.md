# Especificación funcional: Generador Estandarizado de Reportes UAFE

> **Estado:** Congelada v1.0 · **Fecha:** 2026-10-02
> **Alcance:** herramienta que **presenta** el análisis ya realizado por el analista, con orden fijo y formato gráfico, para el Comité de Cumplimiento.
> **v1.0:** versión congelada y aprobada por el usuario. La parte funcional está completa; los puntos diferidos a implementación se listan en la sección 13.

---

## 1. Resumen

Herramienta interna que toma el **análisis ya realizado** por el analista de cumplimiento sobre un caso y lo presenta con un **orden específico** y **formato gráfico**, siguiendo los 8 temas del formato interno, para que el Comité de Cumplimiento lo entienda con facilidad aunque no haya participado del análisis. La herramienta **ordena, formatea y grafica**; no reemplaza el criterio del analista.

## 2. Problema y objetivo

| | |
|---|---|
| **Problema** | Cada analista arma su presentación en PowerPoint sin uniformidad de forma ni de fondo; el análisis se pierde en estructuras distintas. |
| **Causa raíz** | No hay una herramienta que imponga el orden, la estructura y la presentación gráfica del análisis. |
| **Objetivo** | Presentar el análisis del analista con orden fijo, formato uniforme y gráficos, comprensible para terceros. |
| **Indicador de éxito** | 100% de los reportes con la misma estructura, los 8 temas completos y sin intervención manual de diseño. |

## 3. Alcance

**Dentro de alcance (v1):**

- Ingesta del análisis del caso desde un archivo estructurado (XLSX/CSV).
- Ordenamiento del contenido según los 8 temas del formato interno.
- Plantilla visual única y configurable sin código.
- Generación del resumen gráfico a partir de los resúmenes de movimientos.
- Generación del archivo PPTX.
- Metadatos, versionado y trazabilidad por reporte.
- Roles y permisos básicos.

**Fuera de alcance (v1):**

- Análisis automático, detección de inusualidades o clasificación de operaciones.
- Decidir si una operación está justificada o no.
- Workflow completo de gestión de casos.
- Integración directa con el core bancario.
- Envío del reporte a la UAFE.
- Firma electrónica o certificación de autenticidad.

## 4. Stakeholders y roles

| Rol | Interés / responsabilidad |
|---|---|
| Analista de cumplimiento | Realiza el análisis y carga su contenido. Usuario principal. |
| Ejecutivo de cuenta / área comercial | Aporta documentación y emite los comentarios del área comercial. |
| Comité de Cumplimiento | Revisa y decide. Destinatario del reporte. |
| Oficial de cumplimiento | Administra plantilla, reglas y usuarios. |
| Auditoría / TI | Exige trazabilidad, seguridad y control de acceso. |

## 5. Glosario

| Término | Definición |
|---|---|
| **Análisis del caso** | Trabajo previo del analista que determina las inusualidades. Es un insumo, no un resultado del sistema. |
| **Inusualidad / señal de alerta** | Hallazgo determinado por el analista que motiva el reporte al Comité. |
| **Movimiento acreedor** | Movimiento de crédito (entrada de fondos); se resume por **ordenante**. |
| **Movimiento deudor** | Movimiento de débito (salida de fondos); se resume por **beneficiario**. |
| **Ordenante** | Quien origina un movimiento acreedor. |
| **Beneficiario** | Quien recibe un movimiento deudor. |
| **Muestra significativa** | Subconjunto de movimientos seleccionado para el resumen; no es el 100% de los movimientos. |
| **Tercero relacionado** | Persona o entidad vinculada al cliente o a los movimientos del caso. |
| **Documentación entregada** | Documentos aportados por el cliente o el ejecutivo de cuenta, presentados como inventario. |
| **UAFE** | Unidad de Análisis Financiero y Económico; entidad a la que se reportan las operaciones. |
| **Comité de Cumplimiento** | Alta gerencia que aprueba o deniega el reporte previo a la UAFE. |
| **Reporte** | Documento generado (PPTX) que presenta el análisis del caso al Comité. |

## 6. Flujo del proceso

**Actual (as-is):**
1. El analista estudia el caso y determina las inusualidades.
2. Arma manualmente la presentación en PowerPoint, con estructura propia.
3. El Comité revisa y decide.

**Propuesto (to-be):**
1. El analista ya realizó el análisis y armó los resúmenes de movimientos.
2. Carga el contenido del caso en el formato definido (sección 8).
3. El sistema ordena el contenido, aplica la plantilla, grafica y genera el PPTX.
4. El Comité revisa y decide.
5. El sistema registra versión y trazabilidad del reporte.

## 7. Estructura obligatoria del reporte (temas mínimos del formato interno)

Toda presentación debe contener, en este orden, los 8 temas. Si falta alguno, la generación se bloquea (RF-02).

| # | Tema mínimo | Contenido mínimo obligatorio |
|---|---|---|
| 1 | **Datos generales del cliente analizado** | Nombre o razón social, tipo e identificación, segmento, actividad económica, residencia. |
| 2 | **Antecedentes del caso** | Período y fecha de corte, origen o motivo de la detección, productos involucrados, reportes previos si existieran, y nota de la muestra si corresponde. |
| 3 | **Movimientos transaccionales (resumen)** | Dos vistas sobre una **muestra significativa** definida por el analista (sin criterio fijo; por lo general abarca el total): (a) resumen por **tipo de transacción**; (b) resumen por **contraparte** — ordenantes para movimientos acreedores y beneficiarios para movimientos deudores. Con montos y número de operaciones. |
| 4 | **Documentación entregada** | Inventario de documentos recibidos (tipo, número, fecha, emisor, referencia). Se presenta tal como fue aportada; el sistema no evalúa si es suficiente. |
| 5 | **Señales de alerta** | Inusualidades determinadas por el analista: tipo, descripción y sustento. |
| 6 | **Resumen gráfico del caso** | Gráficos sobre la muestra: distribución por tipo de transacción, por ordenante (acreedores) y por beneficiario (deudores), montos y número de operaciones. |
| 7 | **Detalle de Terceros Relacionados** | Por tercero: identificación, relación con el cliente, rol en los movimientos y monto involucrado. |
| 8 | **Comentarios del área comercial** | Observaciones o justificaciones del ejecutivo de cuenta o área comercial. |

**Elementos estructurales** (no son temas mínimos, pero forman parte del documento):

- **Portada**: período, fecha de corte, versión, autor y clasificación de confidencialidad.
- **Pie de trazabilidad**: autor, fecha de generación, versión e identificador del reporte.

## 8. Formato de entrada

Archivo estructurado **XLSX** (o CSV equivalente) con estas hojas y columnas mínimas:

| Hoja | Columnas mínimas |
|---|---|
| `Casos` | `id_caso`, `periodo`, `fecha_corte`, `origen_caso`, `antecedentes`, `nota_muestra` (opcional), `total_movimientos`, `movimientos_incluidos` |
| `Clientes` | `id_cliente`, `tipo_identificacion`, `identificacion`, `nombre`, `segmento`, `actividad_economica`, `residencia` |
| `Productos` | `id_producto`, `id_cliente`, `tipo_producto`, `numero` |
| `MovimientoPorTipo` | `id_caso`, `tipo_transaccion`, `monto`, `moneda`, `numero_operaciones` |
| `MovimientoPorContraparte` | `id_caso`, `tipo_movimiento` (acreedor/deudor), `rol_contraparte` (ordenante/beneficiario), `identificacion`, `nombre`, `monto`, `moneda`, `numero_operaciones` |
| `Documentos` | `id_documento`, `id_caso`, `tipo`, `numero`, `fecha`, `emisor`, `referencia` |
| `Alertas` | `id_alerta`, `id_caso`, `tipo`, `descripcion`, `sustento` |
| `Terceros` | `id_tercero`, `id_caso`, `tipo_identificacion`, `identificacion`, `nombre`, `relacion`, `rol`, `monto_involucrado` |
| `Comercial` | `id_caso`, `comentario` |

## 9. Requisitos funcionales

| ID | Requisito | Prioridad |
|---|---|---|
| RF-01 | Ingresar el contenido del análisis desde archivo estructurado conforme a la sección 8 (XLSX/CSV). | Alta |
| RF-02 | Validar que estén los 8 temas mínimos y los datos obligatorios; bloquear si falta algo. | Alta |
| RF-03 | Aplicar una plantilla visual única a todos los reportes. | Alta |
| RF-04 | Ordenar el contenido según los 8 temas de la sección 7, en ese orden. | Alta |
| RF-05 | Generar el reporte en formato PPTX. | Alta |
| RF-06 | Registrar metadatos: período, autor, fecha, versión, identificador, hash. | Alta |
| RF-07 | Mantener trazabilidad de generaciones y reprocesos. | Media |
| RF-08 | Gestionar roles y permisos (analista, oficial de cumplimiento, Comité). | Media |
| RF-09 | Consultar y localizar reportes generados por período y caso. | Media |
| RF-10 | Reportar errores de validación con detalle por campo y fila. | Media |
| RF-11 | Permitir editar la plantilla sin modificar el código. | Media |
| RF-12 | Incluir un bloque por caso dentro de un mismo reporte (un reporte por período/sesión). | Alta |
| RF-13 | Generar el resumen gráfico a partir de `MovimientoPorTipo` y `MovimientoPorContraparte`. | Alta |
| RF-14 | Presentar el contenido del analista sin alterarlo ni reinterpretarlo. | Alta |

## 10. Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-01 | Confidencialidad: datos bancarios cifrados en tránsito y en reposo. |
| RNF-02 | Control de acceso basado en roles. |
| RNF-03 | Generación de un reporte típico en ≤ 30 segundos. |
| RNF-04 | Operación mensual estable y reproducible en fecha de corte. |
| RNF-05 | Plantilla mantenible por personal no técnico. |
| RNF-06 | Despliegue interno (on-premise) dentro de la infraestructura del banco. |
| RNF-07 | Interfaz usable por analistas sin perfil técnico. |
| RNF-08 | Compatibilidad con Microsoft PowerPoint vigente. |
| RNF-09 | Retención y respaldo de los reportes generados según la política del banco. |
| RNF-10 | Comprensibilidad: el reporte debe ser entendible por una persona que no realizó el análisis. |

## 11. Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Se incluyen los casos que el área de cumplimiento determine presentar al Comité. |
| RN-02 | No se genera reporte si falta información mínima obligatoria. |
| RN-03 | Un reporte corresponde a un período y a un corte definido, y agrupa los casos como bloques. |
| RN-04 | Toda regeneración crea una nueva versión; no sobrescribe la anterior. |
| RN-05 | Solo roles autorizados pueden generar, ver o aprobar. |
| RN-06 | El sistema **no clasifica ni decide** la justificación de operaciones: presenta el análisis ya realizado por el analista, sin alterarlo. |
| RN-07 | Los 8 temas mínimos (sección 7) deben existir y no estar vacíos. |
| RN-08 | La plantilla y las reglas tienen versionado; todo cambio queda registrado y trazable. |
| RN-09 | El resumen de movimientos se arma sobre una **muestra significativa definida por el analista**; no hay criterio fijo y el sistema no la calcula ni la valida. |

## 12. Validación de decisiones

Validación técnica realizada el 2026-10-02. Actualizada tras los cambios de enfoque de v0.5 y v0.6.

| # | Decisión | Resultado | Estado |
|---|---|---|---|
| D1 | Formato de entrada: XLSX/CSV estructurado (sección 8). | Consistente. Riesgo: carga manual, mitigado por RF-02 y RF-10. | Validada (técnica) |
| D2 | Salida en PPTX. | Consistente con el proceso actual. | Validada (técnica) |
| D3 | Un reporte por período/sesión, con un bloque por caso. | Consistente. Si se agregan casos, exige regeneración versionada (RN-04). | Validada (técnica) |
| D4 | Estructura = 8 temas mínimos del formato interno. | Confirmada por el usuario. | Confirmada |
| D5 | Umbral de "documentación suficiente". | **Retirada**: el sistema no evalúa suficiencia; solo presenta la documentación entregada. | Retirada |
| D6 | Plantilla y reglas administradas por el Oficial de Cumplimiento. | Consistente. Se agrega RN-08 (versionado de plantilla). | Validada (técnica) |
| D7 | Volumen de referencia por período. | **No validable** sin dato real. Impacta RNF-03. | Pendiente P4 |
| D8 | Despliegue on-premise, uso interno mensual. | Consistente. Se agrega RNF-09 (retención y respaldo). | Validada (técnica) |
| D9 | Movimientos como **resumen en dos vistas** (por tipo de transacción; por contraparte: ordenantes en acreedores, beneficiarios en deudores), sobre una **muestra significativa**. | Confirmada por el usuario. | Confirmada |
| D10 | La muestra **no tiene criterio fijo**: la define el analista y por lo general abarca el total de los movimientos. | Confirmada por el usuario. | Confirmada |

## 13. Pendientes de validación (bloquean v1.0)

| ID | Pendiente | A quién corresponde | Estado |
|---|---|---|---|
| P1 | OK a las decisiones validadas y confirmadas. | Usuario / área de cumplimiento | **Cerrado: v1.0 congelada** |
| P2 | Verificar si una norma o instructivo externo fija el contenido. | Oficial de Cumplimiento | **Cerrado: no existe; manda el formato interno** |
| P3 | Validar los temas mínimos del reporte. | Comité / Oficial | **Cerrado: índice de 8 temas** |
| P4 | Confirmar volumen real por período (D7). | Analistas | Abierto: parámetro a completar en implementación (afina RNF-03, no bloquea la v1.0) |
| P5 | Definir stack tecnológico o restricciones de infraestructura. | TI | Diferido a la fase de implementación |
| P6 | Definir el período de retención de reportes (RNF-09). | Oficial de Cumplimiento / TI | Diferido a la fase de implementación |
| P7 | Confirmar los campos del resumen de movimientos. | Analistas | **Cerrado: dos vistas (por tipo; por contraparte)** |
| P8 | Criterio y tamaño de la "muestra significativa". | Analistas | **Cerrado: sin criterio fijo; la define el analista (habitualmente el total)** |

## 14. Criterios de aceptación (alto nivel)

- [ ] Todo reporte generado usa la misma plantilla visual.
- [ ] El reporte contiene los 8 temas mínimos en orden y al menos un bloque por caso.
- [ ] Los movimientos se presentan en las dos vistas (por tipo y por contraparte), sobre la muestra definida por el analista.
- [ ] El resumen gráfico se genera automáticamente a partir de los resúmenes de movimientos.
- [ ] El contenido del analista se presenta sin alteraciones.
- [ ] El sistema bloquea la generación ante datos incompletos y explica por qué (campo y fila).
- [ ] Cada reporte queda identificado y trazable a su período, autor y versión.
- [ ] Una persona que no hizo el análisis puede entender el reporte sin ayuda.

## 15. Control de versiones

| Versión | Cambio |
|---|---|
| v0.1 | Borrador inicial con estructura general. |
| v0.2 | Formato de entrada y decisiones provisionales D1–D8. |
| v0.3 | Se incorpora el formato interno (temas mínimos); se cierran P2 y P3. |
| v0.4 | El índice pasa a 8 temas mínimos; se agregan hoja Terceros y RF-13. |
| v0.5 | Cambio de enfoque: la herramienta **presenta** el análisis, no lo produce; movimientos resumidos; D5 retirada; RF-14 y RNF-10. |
| v0.6 | Dos vistas del resumen de movimientos (por tipo y por contraparte); RN-09; P7 cerrado. |
| v0.7 | Muestra sin criterio fijo; RN-09 ajustada; D10; P8 cerrado. |
| **v1.0** | **Versión congelada y aprobada.** Parte funcional completa; P4, P5 y P6 diferidos. |
