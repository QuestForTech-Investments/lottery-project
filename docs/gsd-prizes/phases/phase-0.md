# Fase 0 — Análisis y Documentación

## Objetivo
Entender completamente el sistema actual de cálculo de premios antes de hacer cualquier modificación.

## Entradas
- Código fuente actual (API + Frontend)
- Base de datos existente
- Documento `PRIZE_CALCULATION_SYSTEM.md` creado

## Tareas

### 0.1 Analizar flujo de resultados
- [x] Leer `ResultsController.cs` - entender cómo entran resultados
- [x] Leer `resultsService.ts` - entender cómo se consumen
- [x] Identificar si hay sincronización automática con fuente externa
- [x] Documentar: ¿Quién publica resultados? ¿Cómo?

**Hallazgo:** Resultados se publican via `POST /api/results` o sincronización externa. Al publicar, automáticamente se llama `ProcessTicketsForDrawAsync()`.

### 0.2 Analizar endpoint de ganadores
- [x] Leer `WinningPlaysController.cs` completo
- [x] Identificar queries/vistas que usa
- [x] Entender de dónde salen los datos de ganadores
- [x] Documentar: ¿Se calculan on-the-fly o están almacenados?

**Hallazgo:** Los ganadores están almacenados en `TicketLines` con `IsWinner=true`. El endpoint simplemente hace query con filtros.

### 0.3 Mapear modelo de datos
- [x] Listar tablas relacionadas con tickets/jugadas
- [x] Listar tablas relacionadas con resultados
- [x] Listar tablas relacionadas con premios
- [x] Crear diagrama ER simplificado

**Tablas identificadas:**
```
tickets ←→ ticket_lines (1:N)
            ↓
         draws ←→ results (1:N por fecha)
            ↓
         bet_types ←→ prize_types (1:N)
                        ↓
                     banca_prize_configs (override por banca)
                     draw_prize_configs (override por sorteo) ← NO SE USA!
```

### 0.4 Identificar gaps
- [x] Comparar estado actual vs requisitos del roadmap
- [x] Listar funcionalidades faltantes
- [x] Identificar riesgos técnicos

**Gaps encontrados:**
1. ⚠️ `CalculatePrizeAsync()` NO usa `DrawPrizeConfig` - solo BancaPrizeConfig
2. ❌ No hay endpoint para marcar premios como pagados
3. ❌ No hay flujo de aprobación para premios grandes
4. ❌ No se actualiza balance de banca al pagar

### 0.5 Documentar hallazgos
- [x] Actualizar `PRIZE_CALCULATION_SYSTEM.md` con hallazgos
- [ ] Crear diagrama de flujo actual
- [x] Proponer cambios necesarios

## Decisiones tomadas

1. **¿Los ganadores se calculan en tiempo real o se almacenan?**
   → Se almacenan en `TicketLines` con `IsWinner=true`, `PrizeAmount` calculado

2. **¿Hay que crear nueva tabla para jugadas ganadoras?**
   → NO, usar la estructura existente de `TicketLines`

3. **¿El trigger de cálculo debe ser automático o manual?**
   → YA ES AUTOMÁTICO, se dispara al publicar resultados

## Criterios de finalización
- [x] Entendemos completamente cómo funcionan los resultados
- [x] Entendemos de dónde salen los datos de `/api/winning-plays`
- [x] Tenemos diagrama ER de tablas involucradas
- [x] Tenemos lista clara de cambios necesarios
- [ ] Documento de análisis aprobado por usuario

## Resultado

### El sistema de premios YA FUNCIONA, pero tiene un bug:

**Bug crítico:** La cascada de multiplicadores está incompleta:
- Actual: `BancaPrizeConfig > Default`
- Esperado: `DrawPrizeConfig > BancaPrizeConfig > Default`

**Archivo a modificar:** `ExternalResultsService.cs`, método `CalculatePrizeAsync()` (línea 813)

### Cambio propuesto:

```csharp
// ANTES (actual):
var bancaConfig = await _context.BancaPrizeConfigs
    .FirstOrDefaultAsync(bc =>
        bc.BettingPoolId == bettingPoolId.Value &&
        bc.PrizeTypeId == prizeType.PrizeTypeId);

// DESPUÉS (correcto):
// 1. Primero buscar DrawPrizeConfig
var drawConfig = await _context.DrawPrizeConfigs
    .FirstOrDefaultAsync(dc =>
        dc.BettingPoolId == bettingPoolId.Value &&
        dc.DrawId == line.DrawId &&
        dc.PrizeTypeId == prizeType.PrizeTypeId);

if (drawConfig != null)
{
    multiplier = drawConfig.CustomValue;
}
else
{
    // 2. Si no hay, buscar BancaPrizeConfig
    var bancaConfig = await _context.BancaPrizeConfigs
        .FirstOrDefaultAsync(bc =>
            bc.BettingPoolId == bettingPoolId.Value &&
            bc.PrizeTypeId == prizeType.PrizeTypeId);

    if (bancaConfig != null)
    {
        multiplier = bancaConfig.CustomValue;
    }
}
```

### Funcionalidades nuevas necesarias:

1. **Endpoint para marcar pagado:** `POST /api/winning-plays/{id}/pay`
2. **Endpoint para cancelar:** `POST /api/winning-plays/{id}/cancel`
3. **Actualizar UI:** Agregar botón "Marcar Pagado" en WinningPlays

---

**Fase 0 completada:** 2026-02-06
**Siguiente:** Fase 1 (o saltar directo al fix del bug)
