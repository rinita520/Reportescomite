# ODD — Generador Estandarizado de Reportes UAFE

**Estado:** especificación congelada v1.0
**Creado:** 2026-10-02 · **Actualizado:** 2026-10-02
**Ruta de trabajo:** directa (inline) — entregables documentales, sin código

---

## Objetivo

Definir la especificación de una herramienta que **presente** el análisis ya realizado por el analista de cumplimiento, con orden fijo y formato gráfico, para el Comité de Cumplimiento. La herramienta **no analiza ni clasifica**: ordena, formatea y grafica.

## Problema

Cada analista arma su presentación en PowerPoint sin uniformidad de forma ni de fondo; el análisis se pierde en estructuras distintas y el Comité no puede revisarlo con eficiencia.

## Enfoque (aclaraciones clave del usuario)

- El análisis (inusualidades) **ya lo hizo el analista**; es insumo, no resultado del sistema.
- Los movimientos se presentan como **resumen**, en **dos vistas**: por tipo de transacción; y por contraparte (ordenantes en acreedores, beneficiarios en deudores).
- Sobre una **muestra significativa** sin criterio fijo: la define el analista y habitualmente abarca el total.
- El objetivo es que una **tercera persona** que no hizo el análisis entienda el reporte.

## Alcance

- **Dentro**: ingesta del análisis (XLSX/CSV), orden según 8 temas, plantilla única, resumen gráfico, PPTX, trazabilidad, control de acceso.
- **Fuera**: análisis automático/clasificación, gestión completa de casos, integración con el core, envío a la UAFE, firma electrónica.

## Restricciones

- Repositorio Git inicializado y publicado: https://github.com/rinita520/Reportescomite (commit `36ce58c`).
- Stack técnico aún sin definir.
- Único insumo de partida: `problema_1_reporte_uafe.md`.
- Las especificaciones usan el formato interno real; no existe instructivo normativo externo.

## Formato interno confirmado (8 temas mínimos)

1. Datos generales del cliente analizado
2. Antecedentes del caso
3. Movimientos transaccionales (resumen: por tipo y por contraparte)
4. Documentación entregada
5. Señales de alerta
6. Resumen gráfico del caso
7. Detalle de Terceros Relacionados
8. Comentarios del área comercial

Elementos estructurales: Portada y Pie de trazabilidad.

## Tareas

- [x] T1 — Borrador v0.1
- [x] T2 — Decisiones provisionales D1–D8 → v0.2
- [x] T3 — Formato interno (temas mínimos); P2 y P3 cerrados → v0.3
- [x] T4 — Ampliar el índice a 8 temas mínimos → v0.4
- [x] T5 — Validación técnica de D1–D8 → v0.4
- [x] T6 — Corrección de enfoque: presentador, no analizador; D5 retirada; D9 → v0.5
- [x] T7 — Formato real del resumen de movimientos (dos vistas + muestra); P7 cerrado → v0.6
- [x] T8 — Muestra sin criterio fijo; P8 cerrado; D10 → v0.7
- [x] T9 — Congelar y aprobar la especificación v1.0
- [ ] T10 — Fase de implementación: stack (P5), retención (P6), volumen (P4), diseño técnico

## Evidencia de verificación

| Tarea | Verificación | Resultado |
|-------|--------------|-----------|
| T1 | Secciones 1–13 creadas | OK |
| T2 | v0.2 con entrada y D1–D8 | OK |
| T3 | v0.3 con temas mínimos; P2/P3 cerrados | OK |
| T4 | v0.4 con 8 temas + Terceros + RF-13 | OK |
| T5 | Validación técnica D1–D8 | OK |
| T6 | v0.5 enfoque presentador; RF-14 y RNF-10 | OK |
| T7 | v0.6 dos vistas de movimientos; RN-09; P7 cerrado | OK |
| T8 | v0.7 muestra sin criterio fijo; D10; P8 cerrado | OK |
| T9 | v1.0 congelada con changelog (sección 15) y P1 cerrado | OK |

## Fase de implementación — stack: Node.js

**Stack decidido (2026-10-02):** Node.js v24 + `xlsx` (SheetJS) + `pptxgenjs` + `express` + `node:test`.
**Motivo:** Python no está instalado en la máquina; Node sí (v24.19.0). Con Node se puede construir y verificar con tests.

- [ ] I1 — Núcleo de datos: `package.json`, modelos, `loader` de XLSX y validador de los 8 temas (RF-01, RF-02, RF-10) + tests
- [ ] I2 — Renderizador PPTX con plantilla única y resumen gráfico (`pptxgenjs`) (RF-03, RF-04, RF-05, RF-13, RF-14)
- [ ] I3 — Interfaz web (`express`): cargar XLSX, generar y descargar el PPTX (RNF-07)
- [ ] I4 — Metadatos, versionado y trazabilidad (RF-06, RF-07, RN-04)
- [ ] I5 — Ejemplo de entrada (XLSX), README y plantilla documentada
- [ ] I6 — Verificación final de la implementación

## Próximo paso

Ejecutar I1: núcleo de datos con tests.

