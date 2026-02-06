# Estado del Proyecto: Sistema de Cálculo de Premios

## Fase actual
**FASE 0 — Análisis y Documentación** (casi completa)

## Progreso
4/5 tareas completadas

## Hallazgos del Análisis

### ✅ El cálculo de premios YA ES AUTOMÁTICO

El sistema ya tiene implementado el cálculo automático:

```
Resultado se publica (POST /api/results)
        ↓
ResultsController llama ProcessTicketsForDrawAsync()
        ↓
ExternalResultsService busca líneas pendientes
        ↓
Compara números apostados vs resultado
        ↓
Marca ganadores (IsWinner=true, LineStatus="winner")
        ↓
Calcula premio = BetAmount × Multiplier
        ↓
Actualiza Ticket (TotalPrize, WinningLines, TicketState)
```

### ✅ Estructura de datos existente

**NO hay tabla separada de ganadores** - están en `TicketLines`:

| Campo | Uso |
|-------|-----|
| `IsWinner` | true si ganó |
| `LineStatus` | "pending", "winner", "loser" |
| `PrizeAmount` | Monto del premio calculado |
| `PrizeMultiplier` | Multiplicador usado |
| `WinningPosition` | Posición donde coincidió (1, 2, 3) |
| `ResultNumber` | Número ganador del sorteo |
| `ResultCheckedAt` | Cuándo se verificó |

**Ticket** tiene campos de resumen:
- `WinningLines` - cantidad de líneas ganadoras
- `TotalPrize` - suma de premios
- `TicketState` - "P" (pending), "W" (winner), "L" (loser)
- `IsPaid` - si fue pagado (existe pero NO se usa)
- `PaidAt` - cuándo se pagó (existe pero NO se usa)

### ✅ Tipos de apuesta soportados

| Tipo | Matching | Posiciones |
|------|----------|------------|
| DIRECTO | Exacto | 1, 2, o 3 |
| PALE | 2 números | 1+2, 1+3, 2+3 |
| TRIPLETA | 3 números | 3 aciertos o 2 aciertos |
| COMBINADO/BOX | Permutación | Cualquier orden |
| PULITO | Último dígito | 1, 2, o 3 |
| SUPER PALE | Especial | 1+3 |

### ⚠️ Gap crítico encontrado

**El cálculo NO usa `DrawPrizeConfig`** (línea 854-867 de ExternalResultsService.cs):

```csharp
// Solo busca BancaPrizeConfig, ignora DrawPrizeConfig
var bancaConfig = await _context.BancaPrizeConfigs
    .FirstOrDefaultAsync(bc =>
        bc.BettingPoolId == bettingPoolId.Value &&
        bc.PrizeTypeId == prizeType.PrizeTypeId);
```

**Cascada actual:** `BancaPrizeConfig > PrizeType.Default`
**Cascada esperada:** `DrawPrizeConfig > BancaPrizeConfig > PrizeType.Default`

### ❌ Funcionalidades faltantes

1. **Cascada incompleta** - No usa DrawPrizeConfig
2. **Marcar como pagado** - Campos existen pero no hay endpoint
3. **Flujo de aprobación** - No existe
4. **Validación de pago** - No hay verificación de límites/balance

## Archivos clave analizados

| Archivo | Función |
|---------|---------|
| `ResultsController.cs` | Publica resultados, dispara cálculo |
| `WinningPlaysController.cs` | Lista ganadores (query a TicketLines) |
| `ExternalResultsService.cs` | **Lógica de cálculo de premios** |
| `TicketLine.cs` | Modelo con campos de ganador |
| `Ticket.cs` | Modelo con totales y estado de pago |

## Decisiones tomadas

1. **No crear tabla nueva** - Usar `TicketLines` existente
2. **El trigger ya existe** - Solo falta arreglar la cascada
3. **Priorizar arreglar cascada** - Antes de agregar features nuevas

## Problemas abiertos

1. ~~Falta entender el flujo actual~~ → **RESUELTO**
2. ~~No está claro si el cálculo es automático~~ → **RESUELTO** (sí es automático)
3. La cascada de premios está incompleta (solo usa banca, no sorteo)
4. No hay endpoint para marcar premio como pagado

## Próximo paso inmediato

Completar tarea 0.5: Documentar hallazgos y proponer plan de acción.

Opciones:
1. **Fix urgente**: Arreglar cascada en `CalculatePrizeAsync()` para usar DrawPrizeConfig
2. **Feature nuevo**: Agregar endpoint para marcar premios pagados
3. **Ambos**: Fix + Feature en paralelo

## Investigación de Premios Dominicana

Ver documento completo: `INVESTIGACION_PREMIOS_DOMINICANA.md`

### Discrepancias encontradas con premios oficiales:

| Tipo | Posición | Oficial | Sistema | Estado |
|------|----------|---------|---------|--------|
| Directo | 1ra | 60x | 56x | ⚠️ Menor (margen banca) |
| Directo | 2da | 8x | 12x | ⚠️ Sistema paga MÁS |
| Directo | 3ra | 4x | 4x | ✅ Igual |
| Palé | 1ra+2da | 1000x | 1100x | ⚠️ Sistema paga más |
| Palé | 1ra+3ra | 1000x | 1100x | ⚠️ Sistema paga más |
| Palé | 2da+3ra | 100x | 100x | ✅ Igual |
| Tripleta | 3/3 | 20000x | 10000x | ❌ MITAD del oficial |
| Tripleta | 2/3 | 100x | 100x | ✅ Igual |

### ❌ Problema crítico: Tripleta

El sistema paga **10,000x** para tripleta completa, pero el premio oficial es **20,000x**.

**Impacto:** Clientes que ganan tripleta reciben la mitad del premio esperado.

### Preguntas pendientes para el negocio

1. ¿Los multiplicadores actuales son correctos o hay que ajustarlos?
2. ¿La tripleta a 10000x es intencional?
3. ¿Hay diferencias por lotería (Nacional, Leidsa, Loteka)?

## Fecha de última actualización
2026-02-06
