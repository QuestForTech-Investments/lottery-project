# Roadmap: Sistema de Cálculo de Premios

## Estado Actual (Post-Análisis)

El análisis reveló que **el sistema de cálculo ya existe y funciona**, pero tiene gaps:

```
✅ EXISTE: Cálculo automático al publicar resultados
✅ EXISTE: Matching de números por tipo de apuesta
✅ EXISTE: Almacenamiento en TicketLines
⚠️ BUG: Cascada incompleta (no usa DrawPrizeConfig)
❌ FALTA: Endpoint para marcar pagado
❌ FALTA: Flujo de aprobación
❌ FALTA: Reportes avanzados
```

## Roadmap Revisado

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 0: Análisis         → ✅ COMPLETA                         │
├─────────────────────────────────────────────────────────────────┤
│  FASE 1: Fix Cascada      → Arreglar bug de DrawPrizeConfig     │
├─────────────────────────────────────────────────────────────────┤
│  FASE 2: Flujo de Pago    → Endpoint + UI para marcar pagado    │
├─────────────────────────────────────────────────────────────────┤
│  FASE 3: UI Mejorada      → Filtros, acciones, exportación      │
├─────────────────────────────────────────────────────────────────┤
│  FASE 4: Reportes         → Dashboard y análisis                │
├─────────────────────────────────────────────────────────────────┤
│  FASE 5: Auditoría        → Logs de cambios y pagos             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fases Detalladas

### FASE 0 — Análisis ✅ COMPLETA
Ver `phases/phase-0.md` para hallazgos completos.

---

### FASE 1 — Fix Cascada de Multiplicadores
**Objetivo:** Arreglar el bug donde `DrawPrizeConfig` no se usa en el cálculo.

**Cambio único en:** `ExternalResultsService.cs` método `CalculatePrizeAsync()`

- [ ] Agregar búsqueda de DrawPrizeConfig antes de BancaPrizeConfig
- [ ] Agregar logging para debugging
- [ ] Test: premio con override por sorteo
- [ ] Test: premio con override por banca (fallback)
- [ ] Test: premio con default (doble fallback)

**Riesgo:** Bajo - cambio localizado, no rompe nada existente
**Impacto:** Premios se calcularán correctamente con configuración por sorteo

---

### FASE 2 — Flujo de Pago
**Objetivo:** Permitir marcar premios como pagados.

**Backend:**
- [ ] Endpoint `POST /api/winning-plays/{lineId}/pay`
- [ ] Endpoint `POST /api/winning-plays/{lineId}/cancel`
- [ ] Actualizar `TicketLine` con campos: `IsPaid`, `PaidAt`, `PaidByUserId`
- [ ] Validaciones: ticket no cancelado, resultado existe, premio > 0

**Frontend:**
- [ ] Botón "Marcar Pagado" en tabla de WinningPlays
- [ ] Modal de confirmación con monto
- [ ] Actualizar lista después de pagar
- [ ] Filtro por estado de pago

---

### FASE 3 — UI Mejorada
**Objetivo:** Mejorar usabilidad del componente WinningPlays.

- [ ] Filtro por banca específica
- [ ] Filtro por rango de monto
- [ ] Presets de fecha (Hoy, Ayer, Esta Semana)
- [ ] Exportación a Excel
- [ ] Exportación a PDF
- [ ] Detalle de ticket expandible
- [ ] Totales mejorados (pendientes vs pagados)

---

### FASE 4 — Reportes
**Objetivo:** Dashboard analítico de premios.

- [ ] Reporte: Premios por período
- [ ] Reporte: Premios por banca
- [ ] Reporte: Premios por tipo de juego
- [ ] Reporte: Rentabilidad (ventas vs premios)
- [ ] Dashboard con KPIs
- [ ] Gráficos de tendencia

---

### FASE 5 — Auditoría
**Objetivo:** Trazabilidad de cambios y pagos.

- [ ] Tabla `prize_payment_audit`
- [ ] Log de quién pagó qué y cuándo
- [ ] Alertas por premios grandes
- [ ] Historial de cambios de configuración

---

## Dependencias

```
FASE 0 ✅
   │
   ▼
FASE 1 (Fix) ──→ FASE 2 (Pago) ──→ FASE 3 (UI)
                                      │
                                      ▼
                                   FASE 4 (Reportes)
                                      │
                                      ▼
                                   FASE 5 (Auditoría)
```

## Prioridades Sugeridas

| Prioridad | Fase | Justificación |
|-----------|------|---------------|
| 🔴 Alta | 1 - Fix Cascada | Bug afecta cálculos de premios |
| 🟠 Media | 2 - Flujo Pago | Funcionalidad core faltante |
| 🟡 Normal | 3 - UI Mejorada | Mejora usabilidad |
| 🟢 Baja | 4 - Reportes | Nice to have |
| 🟢 Baja | 5 - Auditoría | Compliance futuro |

---

## Próxima Acción

**Recomendación:** Empezar con Fase 1 (Fix Cascada) - es un cambio pequeño con alto impacto.

¿Proceder con el fix?
