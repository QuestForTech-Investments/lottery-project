# Manual de Comprobación de Premios

Este documento describe cómo el sistema verifica automáticamente los tickets ganadores cuando se publican resultados.

## Tabla de Contenidos

1. [Flujo de Verificación Automática](#flujo-de-verificación-automática)
2. [Endpoints de la API](#endpoints-de-la-api)
3. [Estados de Tickets y Líneas](#estados-de-tickets-y-líneas)
4. [Proceso de Verificación](#proceso-de-verificación)
5. [Consultas SQL Útiles](#consultas-sql-útiles)
6. [Troubleshooting](#troubleshooting)

---

## Flujo de Verificación Automática

### Diagrama de Flujo

```
┌─────────────────┐
│ Admin publica   │
│    resultado    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ResultsController│
│  CreateResult() │
│  UpdateResult() │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ ExternalResultsService      │
│ ProcessTicketsForDrawAsync()│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ Buscar líneas   │
│ pendientes para │
│ este sorteo     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Por cada línea: │
│ GetWinningPos() │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Ganador│ │Perdió │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│Calculate│ │LineStatus│
│ Prize() │ │= "loser"│
└────┬────┘ └────┬────┘
     │           │
     ▼           │
┌──────────┐     │
│LineStatus│     │
│= "winner"│     │
│PrizeAmt  │     │
└────┬─────┘     │
     │           │
     └─────┬─────┘
           │
           ▼
┌─────────────────────┐
│ UpdateTicketStates()│
│ W = Winner          │
│ L = Loser           │
│ P = Pending         │
└─────────────────────┘
```

### Cuándo se Ejecuta

La verificación se ejecuta automáticamente cuando:

1. **POST /api/results** - Se crea un nuevo resultado
2. **PUT /api/results/{id}** - Se actualiza un resultado existente
3. **POST /api/results/sync** - Se sincronizan resultados externos
4. **POST /api/results/refresh** - Se refrescan resultados manualmente

---

## Endpoints de la API

### 1. Crear/Actualizar Resultado (Automático)

**POST /api/results**

```json
// Request
{
  "drawId": 1,
  "winningNumber": "889475",
  "additionalNumber": "084017908401",
  "resultDate": "2026-01-27"
}

// Response
{
  "result": {
    "resultId": 123,
    "drawId": 1,
    "drawName": "Loteka",
    "winningNumber": "889475",
    "num1": "88",
    "num2": "94",
    "num3": "75"
  },
  "ticketsProcessed": 45,
  "winnersFound": 3
}
```

### 2. Actualizar Resultado (PUT)

**PUT /api/results/{id}**

```json
// Response incluye estadísticas de verificación
{
  "result": { ... },
  "ticketsProcessed": 45,
  "winnersFound": 3
}
```

### 3. Sincronizar Resultados Externos

**POST /api/results/sync**

```json
// Request
{
  "date": "2026-01-27",
  "results": [
    {
      "name": "Loteka",
      "num1": "88",
      "num2": "94",
      "num3": "75"
    }
  ]
}

// Response
{
  "success": true,
  "message": "Sync completed: 1 updated, 0 created, 0 skipped, 3 winners found",
  "ticketsProcessed": 45,
  "winnersFound": 3
}
```

### 4. Refrescar Resultados Manualmente

**POST /api/results/refresh?date=2026-01-27**

---

## Estados de Tickets y Líneas

### Estados de Línea (ticket_lines.line_status)

| Estado | Descripción |
|--------|-------------|
| `pending` | Aún no se ha verificado contra el resultado |
| `winner` | Línea ganadora, premio calculado |
| `loser` | Línea perdedora, resultado verificado |

### Estados de Ticket (tickets.ticket_state)

| Estado | Descripción |
|--------|-------------|
| `P` | Pendiente - Al menos una línea sin verificar |
| `W` | Ganador - Al menos una línea ganadora |
| `L` | Perdedor - Todas las líneas verificadas, ninguna ganó |

### Lógica de Actualización de Estado

```csharp
// En UpdateTicketStatesAsync()
if (hasWinner)
    newState = "W";  // Al menos una línea ganó
else if (allProcessed && !hasPending)
    newState = "L";  // Todas perdieron
else
    newState = "P";  // Aún hay líneas pendientes
```

---

## Proceso de Verificación

### Paso 1: Obtener Líneas Pendientes

```csharp
var pendingLines = await _context.Set<TicketLine>()
    .Include(tl => tl.Ticket)
    .Include(tl => tl.BetType)
    .Where(tl =>
        tl.DrawId == drawId &&
        tl.DrawDate.Date == date.Date &&
        tl.LineStatus == "pending" &&
        !tl.Ticket!.IsCancelled)
    .ToListAsync();
```

### Paso 2: Verificar Cada Línea

```csharp
foreach (var line in pendingLines)
{
    var winningPosition = GetWinningPosition(line, result);

    line.ResultNumber = result.WinningNumber;
    line.ResultCheckedAt = DateTime.UtcNow;

    if (winningPosition > 0)
    {
        line.IsWinner = true;
        line.LineStatus = "winner";
        line.PrizeAmount = await CalculatePrizeAsync(line, winningPosition);

        line.Ticket.WinningLines++;
        line.Ticket.TotalPrize += line.PrizeAmount;
    }
    else
    {
        line.LineStatus = "loser";
    }
}
```

### Paso 3: Actualizar Estado del Ticket

Un ticket puede tener múltiples líneas (apuestas a diferentes sorteos). El estado final depende de todas las líneas:

```csharp
private async Task UpdateTicketStatesAsync(HashSet<long> ticketIds)
{
    foreach (var ticket in tickets)
    {
        var lines = ticket.TicketLines;

        var hasWinner = lines.Any(l => l.IsWinner == true);
        var allProcessed = lines.All(l =>
            l.LineStatus == "winner" || l.LineStatus == "loser");
        var hasPending = lines.Any(l => l.LineStatus == "pending");

        if (hasWinner)
            ticket.TicketState = "W";
        else if (allProcessed)
            ticket.TicketState = "L";
        else
            ticket.TicketState = "P";
    }
}
```

---

## Campos Actualizados

### En ticket_lines

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `result_number` | Número ganador del sorteo | "889475" |
| `result_checked_at` | Fecha/hora de verificación | 2026-01-27 15:30:00 |
| `is_winner` | Si la línea ganó | true/false |
| `line_status` | Estado de la línea | "winner"/"loser" |
| `prize_amount` | Monto del premio | 5600.00 |
| `prize_multiplier` | Multiplicador usado | 56 |

### En tickets

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `ticket_state` | Estado del ticket | "W"/"L"/"P" |
| `winning_lines` | Cantidad de líneas ganadoras | 2 |
| `total_prize` | Suma de premios de líneas ganadoras | 6800.00 |

---

## Consultas SQL Útiles

### Ver Tickets Ganadores de Hoy

```sql
SELECT
    t.ticket_id,
    t.ticket_number,
    t.ticket_state,
    t.winning_lines,
    t.total_prize,
    bp.name AS banca
FROM tickets t
JOIN betting_pools bp ON t.betting_pool_id = bp.betting_pool_id
WHERE t.ticket_state = 'W'
  AND t.created_at >= CAST(GETDATE() AS DATE)
ORDER BY t.total_prize DESC;
```

### Ver Detalle de Líneas Ganadoras

```sql
SELECT
    tl.line_id,
    tl.ticket_id,
    tl.bet_number,
    tl.bet_amount,
    tl.prize_amount,
    tl.prize_multiplier,
    tl.result_number,
    tl.result_checked_at,
    d.draw_name,
    bt.code AS bet_type
FROM ticket_lines tl
JOIN draws d ON tl.draw_id = d.draw_id
JOIN bet_types bt ON tl.bet_type_id = bt.bet_type_id
WHERE tl.is_winner = 1
  AND tl.draw_date = CAST(GETDATE() AS DATE)
ORDER BY tl.prize_amount DESC;
```

### Ver Líneas Pendientes de Verificación

```sql
SELECT
    COUNT(*) AS pending_lines,
    d.draw_name,
    tl.draw_date
FROM ticket_lines tl
JOIN draws d ON tl.draw_id = d.draw_id
JOIN tickets t ON tl.ticket_id = t.ticket_id
WHERE tl.line_status = 'pending'
  AND t.is_cancelled = 0
GROUP BY d.draw_name, tl.draw_date
ORDER BY tl.draw_date DESC, d.draw_name;
```

### Verificar Que el Resultado Existe

```sql
SELECT
    r.result_id,
    r.draw_id,
    d.draw_name,
    r.winning_number,
    r.result_date,
    r.created_at
FROM results r
JOIN draws d ON r.draw_id = d.draw_id
WHERE r.result_date = '2026-01-27'
ORDER BY d.draw_name;
```

### Resumen de Premios por Banca

```sql
SELECT
    bp.name AS banca,
    COUNT(DISTINCT t.ticket_id) AS tickets_ganadores,
    SUM(tl.prize_amount) AS total_premios
FROM ticket_lines tl
JOIN tickets t ON tl.ticket_id = t.ticket_id
JOIN betting_pools bp ON t.betting_pool_id = bp.betting_pool_id
WHERE tl.is_winner = 1
  AND tl.draw_date = CAST(GETDATE() AS DATE)
GROUP BY bp.betting_pool_id, bp.name
ORDER BY total_premios DESC;
```

---

## Troubleshooting

### Problema: Líneas no se verifican

**Síntomas**: `ticketsProcessed = 0` después de publicar resultado

**Posibles causas**:
1. No hay tickets para ese sorteo y fecha
2. Las líneas ya fueron verificadas
3. El ticket está cancelado

**Diagnóstico**:
```sql
-- Verificar si hay líneas pendientes
SELECT COUNT(*)
FROM ticket_lines tl
JOIN tickets t ON tl.ticket_id = t.ticket_id
WHERE tl.draw_id = @drawId
  AND tl.draw_date = @date
  AND tl.line_status = 'pending'
  AND t.is_cancelled = 0;
```

### Problema: Premio incorrecto

**Síntomas**: El premio calculado no coincide con lo esperado

**Posibles causas**:
1. DisplayOrder incorrecto en prize_types
2. Configuración de banca con multiplicador diferente
3. Bug en GetWinningPosition() para el tipo de apuesta

**Diagnóstico**:
```sql
-- Verificar configuración de premios
SELECT
    bt.code,
    pt.name,
    pt.display_order,
    pt.default_multiplier,
    bpc.custom_value AS banca_multiplier
FROM prize_types pt
JOIN bet_types bt ON pt.bet_type_id = bt.bet_type_id
LEFT JOIN banca_prize_configs bpc ON pt.prize_type_id = bpc.prize_type_id
    AND bpc.betting_pool_id = @bancaId
WHERE bt.bet_type_id = @betTypeId
ORDER BY pt.display_order;
```

### Problema: Ticket queda en estado "P" indefinidamente

**Síntomas**: Ticket tiene estado "P" pero todos los sorteos ya tienen resultado

**Posibles causas**:
1. Línea con draw_id que no tiene resultado
2. Resultado publicado con fecha incorrecta
3. El sorteo fue desactivado

**Diagnóstico**:
```sql
-- Ver líneas pendientes del ticket
SELECT
    tl.line_id,
    tl.draw_id,
    d.draw_name,
    tl.draw_date,
    tl.line_status,
    r.winning_number AS resultado
FROM ticket_lines tl
JOIN draws d ON tl.draw_id = d.draw_id
LEFT JOIN results r ON tl.draw_id = r.draw_id
    AND tl.draw_date = r.result_date
WHERE tl.ticket_id = @ticketId;
```

### Problema: Palé paga premio incorrecto

**Síntomas**: Un Palé 2da+3ra paga como si fuera 1ra+2da

**Posibles causas**:
1. GetPalePosition() no distingue correctamente las combinaciones
2. DisplayOrder 4 no está configurado en prize_types

**Verificación**:
```sql
-- Verificar que existe DisplayOrder 4 para Palé
SELECT * FROM prize_types
WHERE bet_type_id = (SELECT bet_type_id FROM bet_types WHERE code = 'PALE')
ORDER BY display_order;

-- Debe existir:
-- DisplayOrder 2 = 1ra+2da (~1100x)
-- DisplayOrder 3 = 1ra+3ra (~1100x)
-- DisplayOrder 4 = 2da+3ra (~100x)
```

---

## Logs del Sistema

Los logs de verificación se encuentran en la salida de la aplicación:

```
info: LotteryApi.Services.ExternalResults.ExternalResultsService
      Processing 45 pending ticket lines

info: LotteryApi.Services.ExternalResults.ExternalResultsService
      Winner found! Ticket 12345 Line 67890: 88 matches position 1 in 889475, Prize: 5600

info: LotteryApi.Services.ExternalResults.ExternalResultsService
      Palé match: 1ra+2da (88+94), DisplayOrder 2

info: LotteryApi.Controllers.ResultsController
      Processed 45 tickets for draw 1, found 3 winners
```

---

## Recálculo de Premios

Si se necesita recalcular premios (por ejemplo, después de corregir configuración):

**Endpoint**: `POST /api/results/recalculate?date=2026-01-27`

Este método:
1. Busca todas las líneas ganadoras de la fecha
2. Determina nuevamente la posición ganadora
3. Recalcula el premio con el multiplicador correcto
4. Actualiza los totales del ticket

---

## Resumen del Proceso

| Paso | Acción | Tabla Afectada |
|------|--------|----------------|
| 1 | Publicar resultado | `results` |
| 2 | Buscar líneas pendientes | Lee `ticket_lines` |
| 3 | Verificar cada línea | Actualiza `ticket_lines` |
| 4 | Calcular premio si ganó | Actualiza `ticket_lines.prize_amount` |
| 5 | Actualizar estado ticket | Actualiza `tickets.ticket_state` |
| 6 | Retornar estadísticas | Response JSON |

---

**Última actualización**: 2026-01-27
**Autor**: Sistema de Lotería
