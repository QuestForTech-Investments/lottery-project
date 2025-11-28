# API Endpoint: Sales Reports by Betting Pool and Draw

## ✅ IMPLEMENTADO (2025-11-26)

Este documento describe el endpoint implementado para generar reportes de ventas por banca y sorteo.

---

## Endpoint Propuesto

### `POST /api/reports/sales/by-betting-pool-draw`

Genera un reporte agregado de ventas por banca (betting pool) agrupado por sorteo (draw) para un rango de fechas.

#### Request Body

```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "drawIds": [1, 2, 3, 45],  // opcional - si no se envía, incluir todos los sorteos activos
  "zoneIds": [1, 2, 3]       // opcional - si no se envía, incluir todas las zonas
}
```

#### Response

```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "totalNet": 46576.41,
  "bettingPools": [
    {
      "bettingPoolId": 380,
      "bettingPoolName": "LIDIA (GF)",
      "bettingPoolCode": "LAN-0380",
      "zoneId": 1,
      "zoneName": "GRUPO GUYANA (OMAR)",
      "totalSold": 8841.40,
      "totalPrizes": 5335.00,
      "totalCommissions": 1768.28,
      "totalNet": 1738.12
    },
    {
      "bettingPoolId": 475,
      "bettingPoolName": "LEIDY(GF)",
      "bettingPoolCode": "LAN-0475",
      "zoneId": 1,
      "zoneName": "GRUPO GUYANA (OMAR)",
      "totalSold": 5745.20,
      "totalPrizes": 13687.50,
      "totalCommissions": 1149.04,
      "totalNet": -9091.34
    }
    // ... más bancas
  ],
  "totalCount": 112,
  "summary": {
    "totalSold": 340910.44,
    "totalPrizes": 225081.50,
    "totalCommissions": 69252.53,
    "totalNet": 46576.41
  }
}
```

---

## Lógica de Negocio

### Cálculos por Banca

Para cada banca en el período especificado:

```sql
-- Pseudo-SQL para ilustrar la lógica

SELECT
  bp.betting_pool_id,
  bp.betting_pool_name,
  bp.betting_pool_code,
  bp.zone_id,
  z.zone_name,
  SUM(t.grand_total) as total_sold,
  SUM(t.total_prize) as total_prizes,
  SUM(t.total_commission) as total_commissions,
  (SUM(t.grand_total) - SUM(t.total_commission) - SUM(t.total_prize)) as total_net
FROM betting_pools bp
LEFT JOIN tickets t ON t.betting_pool_id = bp.betting_pool_id
  AND t.created_at >= @startDate
  AND t.created_at <= @endDate
  AND t.is_cancelled = false
LEFT JOIN zones z ON z.zone_id = bp.zone_id
WHERE
  (@zoneIds IS NULL OR bp.zone_id IN (@zoneIds))
GROUP BY
  bp.betting_pool_id,
  bp.betting_pool_name,
  bp.betting_pool_code,
  bp.zone_id,
  z.zone_name
HAVING SUM(t.grand_total) > 0  -- solo bancas con ventas
ORDER BY bp.betting_pool_code
```

### Filtro por Sorteos

Si se especifica `drawIds`, filtrar también:

```sql
AND EXISTS (
  SELECT 1 FROM ticket_lines tl
  WHERE tl.ticket_id = t.ticket_id
  AND tl.draw_id IN (@drawIds)
)
```

---

## Implementación Sugerida

### Controller: `SalesReportsController.cs`

```csharp
[ApiController]
[Route("api/reports/sales")]
[Authorize]
public class SalesReportsController : ControllerBase
{
    [HttpPost("by-betting-pool-draw")]
    public async Task<ActionResult<SalesReportResponseDto>> GetSalesByBettingPoolAndDraw(
        [FromBody] SalesReportFilterDto filter)
    {
        // Implementación aquí
    }
}
```

### DTOs Necesarios

```csharp
public class SalesReportFilterDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<int>? DrawIds { get; set; }
    public List<int>? ZoneIds { get; set; }
    public int? GroupId { get; set; }
}

public class SalesReportResponseDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalNet { get; set; }
    public List<BettingPoolSalesDto> BettingPools { get; set; }
    public int TotalCount { get; set; }
    public SalesSummaryDto Summary { get; set; }
}

public class BettingPoolSalesDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; }
    public string BettingPoolCode { get; set; }
    public int ZoneId { get; set; }
    public string ZoneName { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
}

public class SalesSummaryDto
{
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
}
```

---

## Endpoints Implementados

### 1. Reporte Principal por Banca y Sorteo
`POST /api/reports/sales/by-betting-pool-draw`

### 2. Resumen de Ventas Diarias
`GET /api/reports/sales/daily-summary?date=2025-01-15`

### 3. Ventas por Banca (Simplificado)
`GET /api/reports/sales/by-betting-pool?startDate=2025-01-01&endDate=2025-01-31&zoneId=1`

## Archivos Implementados

### DTOs
- `/api/src/LotteryApi/DTOs/SalesReportFilterDto.cs`
- `/api/src/LotteryApi/DTOs/SalesReportResponseDto.cs`
- `/api/src/LotteryApi/DTOs/BettingPoolSalesDto.cs`
- `/api/src/LotteryApi/DTOs/SalesSummaryDto.cs`

### Controlador
- `/api/src/LotteryApi/Controllers/SalesReportsController.cs`

## Notas

- Este endpoint es necesario para la pestaña "Banca por sorteo" en `DailySales`
- Actualizar el servicio en `/frontend-v2/src/services/salesReportService.js` para usar este endpoint
- El campo `groupId` fue removido porque no existe en el modelo BettingPool

---

**Fecha Implementación:** 2025-11-26
**Estado:** ✅ Implementado y compilado exitosamente
