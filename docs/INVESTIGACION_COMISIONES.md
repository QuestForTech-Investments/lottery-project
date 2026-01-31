# Investigación: Sistema de Comisiones

**Fecha**: 2026-01-27
**Estado**: Investigación completada

---

## Resumen Ejecutivo

El sistema de comisiones está **parcialmente implementado**:
- ✅ Estructura de base de datos existe
- ✅ API endpoints funcionan
- ❌ Frontend NO conectado (mockup)
- ❌ Cálculo de comisiones DESHABILITADO en creación de tickets

---

## 1. Cómo Funcionan las Comisiones (Diseño Original)

### Flujo de Cálculo por Línea de Ticket

```
bet_amount (monto apostado)
    ↓
- discount_amount (descuento)
= subtotal
    ↓
× multiplier (multiplicador)
= total_with_multiplier
    ↓
× commission_percentage / 100
= commission_amount (comisión de la banca)
    ↓
total_with_multiplier - commission_amount
= net_amount (monto neto para la casa)
```

### Fórmulas

```
discount_amount = bet_amount × (discount_percentage / 100)
subtotal = bet_amount - discount_amount
total_with_multiplier = subtotal × multiplier
commission_amount = total_with_multiplier × (commission_percentage / 100)
net_amount = total_with_multiplier - commission_amount
```

### Ejemplo

```
Apuesta: $100
Descuento: 10%
Multiplicador: x2
Comisión: 8%

discount_amount = $100 × 0.10 = $10
subtotal = $100 - $10 = $90
total_with_multiplier = $90 × 2 = $180
commission_amount = $180 × 0.08 = $14.40
net_amount = $180 - $14.40 = $165.60

El cliente paga: $180
La banca gana: $14.40 (comisión)
La casa recibe: $165.60 (neto)
```

---

## 2. Niveles de Configuración de Comisiones

### Nivel 1: Usuario (users.commission_rate)

```sql
-- Tabla: users
commission_rate DECIMAL(5,2) DEFAULT 0.00
```

Cada usuario puede tener una tasa de comisión personal.

### Nivel 2: Banca (betting_pool_prizes_commissions)

```sql
-- Tabla: betting_pool_prizes_commissions
-- 8 campos de comisión por tipo de juego

commission_discount_1 DECIMAL(5,2)  -- Primer nivel
commission_discount_2 DECIMAL(5,2)
commission_discount_3 DECIMAL(5,2)
commission_discount_4 DECIMAL(5,2)

commission_2_discount_1 DECIMAL(5,2)  -- Segundo nivel (¿sub-agentes?)
commission_2_discount_2 DECIMAL(5,2)
commission_2_discount_3 DECIMAL(5,2)
commission_2_discount_4 DECIMAL(5,2)
```

**Pregunta sin resolver**: ¿Qué representan los 4 niveles de comisión?
- ¿Posición del premio? (1ra, 2da, 3ra, 4ta)
- ¿Volumen de ventas?
- ¿Tipo de apuesta dentro del juego?

### Nivel 3: Agentes Externos (agent_commission_schema)

```sql
-- Tabla faltante que debe crearse
CREATE TABLE agent_commission_schema (
    schema_id INT PRIMARY KEY IDENTITY,
    agent_id INT NOT NULL,
    lottery_id INT NOT NULL,
    game_type_id INT NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    is_active BIT DEFAULT 1
);
```

---

## 3. Estado Actual de la Implementación

### 3.1 En el API (Backend)

**Archivo**: `api/src/LotteryApi/Controllers/TicketsController.cs`

```csharp
// Línea 497 - ¡COMISIONES DESHABILITADAS!
var commissionPercentage = 0.00m; // Commissions disabled
var discountPercentage = dto.GlobalDiscount > 0 ? dto.GlobalDiscount : 0.00m;
```

**Método de cálculo** (líneas 1139-1148):
```csharp
private void CalculateTicketLine(TicketLine line, decimal commissionPercentage, decimal discountPercentage)
{
    line.DiscountPercentage = discountPercentage;
    line.DiscountAmount = line.BetAmount * (discountPercentage / 100);
    line.Subtotal = line.BetAmount - line.DiscountAmount;
    line.TotalWithMultiplier = line.Subtotal * line.Multiplier;
    line.CommissionPercentage = commissionPercentage;
    line.CommissionAmount = line.TotalWithMultiplier * (commissionPercentage / 100);
    line.NetAmount = line.TotalWithMultiplier - line.CommissionAmount;
}
```

### 3.2 En las Tablas

**Ticket** (`tickets`):
```sql
total_commission DECIMAL(18,2) DEFAULT 0.00  -- Suma de comisiones de todas las líneas
total_net DECIMAL(18,2) DEFAULT 0.00         -- Monto neto después de comisiones
```

**Línea de Ticket** (`ticket_lines`):
```sql
commission_percentage DECIMAL(5,2) DEFAULT 0.00  -- % de comisión aplicado
commission_amount DECIMAL(18,2) DEFAULT 0.00     -- Monto de comisión calculado
net_amount DECIMAL(18,2)                         -- Monto neto
```

**Configuración de Premios/Comisiones** (`betting_pool_prizes_commissions`):
```sql
prize_payment_1 DECIMAL(10,2)
prize_payment_2 DECIMAL(10,2)
prize_payment_3 DECIMAL(10,2)
prize_payment_4 DECIMAL(10,2)
commission_discount_1 DECIMAL(5,2)
commission_discount_2 DECIMAL(5,2)
commission_discount_3 DECIMAL(5,2)
commission_discount_4 DECIMAL(5,2)
commission_2_discount_1 DECIMAL(5,2)
commission_2_discount_2 DECIMAL(5,2)
commission_2_discount_3 DECIMAL(5,2)
commission_2_discount_4 DECIMAL(5,2)
```

### 3.3 Frontend (NO Funcional)

**Página**: `/my-group/configuration`
**Componente**: `GroupConfiguration/CommissionsSubTab.tsx`

```typescript
// Valores por defecto hardcodeados
INITIAL_COMMISSIONS_DATA: {
  general: '',
  directo: '20',      // 20%
  pale: '30',         // 30%
  tripleta: '30',     // 30%
  cash3Straight: '20',
  cash3Box: '20',
  play4Straight: '20',
  play4Box: '20',
  superPale: '30',
  bolita1: '20',
  bolita2: '20',
  singulacion1: '10',
  singulacion2: '10',
  singulacion3: '10',
  pickTwo: '20',
  pick5Straight: '20'
}
```

**Problema**: Al guardar muestra:
```
"Configuracion actualizada (mockup)
Esto enviara los datos al backend cuando este conectado."
```

---

## 4. API Endpoints Disponibles

**Base**: `/api/betting-pools/{bettingPoolId}/prizes-commissions`

| Método | Endpoint | Estado |
|--------|----------|--------|
| GET | `/` | ✅ Funciona |
| GET | `/{id}` | ✅ Funciona |
| POST | `/` | ✅ Funciona |
| PUT | `/{id}` | ✅ Funciona |
| DELETE | `/{id}` | ✅ Funciona |
| GET | `/prizes-bulk` | ✅ Funciona |
| POST | `/prizes-bulk` | ✅ Funciona |

---

## 5. Lo Que Falta Implementar

### 5.1 Backend - Habilitar Comisiones

**Archivo**: `TicketsController.cs`, línea ~497

```csharp
// CAMBIAR DE:
var commissionPercentage = 0.00m; // Commissions disabled

// A:
var commissionPercentage = await GetCommissionPercentage(
    bettingPoolId,
    betTypeId,
    lotteryId
);
```

**Crear método para obtener comisión**:
```csharp
private async Task<decimal> GetCommissionPercentage(
    int bettingPoolId,
    int betTypeId,
    int? lotteryId)
{
    // 1. Buscar en betting_pool_prizes_commissions
    var config = await _context.BettingPoolPrizesCommissions
        .FirstOrDefaultAsync(c =>
            c.BettingPoolId == bettingPoolId &&
            c.GameType == GetGameTypeCode(betTypeId) &&
            (c.LotteryId == null || c.LotteryId == lotteryId) &&
            c.IsActive == true);

    if (config != null && config.CommissionDiscount1.HasValue)
        return config.CommissionDiscount1.Value;

    // 2. Fallback: usar comisión del usuario
    // 3. Fallback: usar valor por defecto (ej: 10%)
    return 10.00m;
}
```

### 5.2 Frontend - Conectar con API

**Archivo**: `bettingPoolService.ts`

```typescript
// Agregar métodos:
export const getPrizesCommissions = async (bettingPoolId: number) => {
  return api.get(`/betting-pools/${bettingPoolId}/prizes-commissions`);
};

export const savePrizesCommissionsBulk = async (bettingPoolId: number, data: any) => {
  return api.post(`/betting-pools/${bettingPoolId}/prizes-commissions/prizes-bulk`, data);
};
```

**Archivo**: `GroupConfiguration/index.tsx`

```typescript
// En useEffect, cargar datos:
useEffect(() => {
  const loadCommissions = async () => {
    const data = await getPrizesCommissions(currentBettingPoolId);
    setCommissionsData(mapApiToFormData(data));
  };
  loadCommissions();
}, [currentBettingPoolId]);

// En handleSubmit, guardar al API:
const handleSubmit = async () => {
  await savePrizesCommissionsBulk(currentBettingPoolId, {
    commissions: mapFormDataToApi(commissionsData)
  });
  toast.success('Configuración guardada');
};
```

---

## 6. Preguntas Pendientes (Consultar con el Cliente)

1. **¿Qué representan los 4 niveles de comisión?**
   - `commission_discount_1` hasta `commission_discount_4`
   - ¿Son para diferentes posiciones de premio?
   - ¿Son para diferentes volúmenes?

2. **¿Qué son `commission_2_discount_*`?**
   - ¿Segundo nivel de comisión para sub-agentes?
   - ¿Comisión para la casa vs comisión para el vendedor?

3. **¿Cómo se determina qué nivel de comisión aplicar?**
   - ¿Por tipo de apuesta?
   - ¿Por monto apostado?
   - ¿Por configuración de la banca?

4. **¿Las comisiones se calculan sobre venta bruta o neta?**
   - Actualmente: sobre `total_with_multiplier` (después de descuento)

---

## 7. Próximos Pasos

### Fase 1: Conectar Frontend (Sin cambiar lógica)
1. [ ] Agregar métodos en `bettingPoolService.ts`
2. [ ] Modificar `GroupConfiguration` para cargar/guardar
3. [ ] Probar flujo CRUD de comisiones

### Fase 2: Habilitar Comisiones en Tickets
1. [ ] Crear método `GetCommissionPercentage()`
2. [ ] Modificar `CalculateTicketLine()` para usar comisión real
3. [ ] Probar cálculo de comisiones en tickets nuevos

### Fase 3: Reportes de Comisiones
1. [ ] Endpoint para ver comisiones por período
2. [ ] Endpoint para comisiones por banca
3. [ ] Vista de resumen de comisiones

---

## 8. Consultas SQL Útiles

```sql
-- Ver configuración de comisiones por banca
SELECT
    bp.betting_pool_name,
    bpc.game_type,
    bpc.commission_discount_1,
    bpc.commission_discount_2,
    bpc.commission_2_discount_1,
    bpc.prize_payment_1,
    bpc.prize_payment_2
FROM betting_pool_prizes_commissions bpc
JOIN betting_pools bp ON bpc.betting_pool_id = bp.betting_pool_id
WHERE bpc.is_active = 1
ORDER BY bp.betting_pool_name, bpc.game_type;

-- Ver comisiones calculadas en tickets
SELECT
    t.ticket_code,
    t.total_with_multiplier,
    t.total_commission,
    t.total_net,
    tl.bet_type_code,
    tl.bet_amount,
    tl.commission_percentage,
    tl.commission_amount
FROM tickets t
JOIN ticket_lines tl ON t.ticket_id = tl.ticket_id
WHERE t.created_at >= DATEADD(day, -7, GETDATE())
ORDER BY t.created_at DESC;

-- Resumen de comisiones por banca (actualmente será 0)
SELECT
    bp.betting_pool_name,
    COUNT(t.ticket_id) as total_tickets,
    SUM(t.total_with_multiplier) as total_ventas,
    SUM(t.total_commission) as total_comisiones,
    SUM(t.total_net) as total_neto
FROM tickets t
JOIN betting_pools bp ON t.betting_pool_id = bp.betting_pool_id
WHERE t.created_at >= CAST(GETDATE() AS DATE)
GROUP BY bp.betting_pool_id, bp.betting_pool_name
ORDER BY total_ventas DESC;
```

---

## 9. Resumen Final

| Componente | Estado | Prioridad |
|------------|--------|-----------|
| Modelo de BD | ✅ Completo | - |
| API Controller | ✅ Funcional | - |
| Cálculo en tickets | ❌ Deshabilitado | Alta |
| Frontend config | ❌ Mockup | Media |
| Reportes | ❌ No existe | Baja |

**Acción inmediata recomendada**:
1. Consultar con cliente sobre estructura de comisiones
2. Conectar frontend con API existente
3. Habilitar cálculo de comisiones en creación de tickets

---

**Última actualización**: 2026-01-27
