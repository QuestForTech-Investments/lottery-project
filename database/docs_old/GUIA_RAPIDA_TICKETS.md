# 🎫 GUÍA RÁPIDA: Crear Tickets

## 📋 Estructura Básica

### Pasos para Crear un Ticket:

```
1. INSERT INTO tickets       → Crear cabecera
2. SET @ticket_id = SCOPE_IDENTITY()  → Obtener ID
3. INSERT INTO ticket_lines  → Agregar jugadas
4. EXEC sp_CalculateTicketTotals     → Calcular totales
```

---

## 🚀 Ejemplo Mínimo (Copiar y Pegar)

```sql
BEGIN TRANSACTION;

-- 1. Crear ticket
DECLARE @ticket_id BIGINT;

INSERT INTO tickets (
    ticket_code, betting_pool_id, user_id, 
    global_multiplier, currency_code, status
)
VALUES (
    'LAN-20251022-0001',  -- Código único
    1,                     -- ID de la banca
    5,                     -- ID del vendedor
    1.00,                  -- Sin multiplicador
    'DOP',                 -- Moneda
    'pending'              -- Estado
);

SET @ticket_id = SCOPE_IDENTITY();

-- 2. Agregar jugada
INSERT INTO ticket_lines (
    ticket_id, line_number, lottery_id, draw_id,
    draw_date, draw_time, bet_number, bet_type_id,
    bet_amount, multiplier, subtotal, 
    total_with_multiplier, net_amount, line_status
)
VALUES (
    @ticket_id, 1, 5, 150,
    '2025-10-22', '12:00', '23', 1,
    100, 1.0, 100, 100, 90, 'pending'
);

-- 3. Calcular totales
EXEC sp_CalculateTicketTotals @ticket_id;

COMMIT TRANSACTION;
```

---

## 📊 Ejemplos por Caso de Uso

### 1️⃣ Ticket Simple (1 número, 1 sorteo)
```sql
-- Número: 23
-- Monto: $100
-- Lotería: LEIDSA 12:00 PM
-- Sin descuentos ni multiplicadores

ticket_code: 'LAN-20251022-0001'
bet_number: '23'
bet_amount: 100.00
lottery_id: 5
draw_time: '12:00'
```
📄 Ver código completo: EJEMPLOS_CREAR_TICKETS.sql (Ejemplo 1)

---

### 2️⃣ Ticket con Múltiples Números
```sql
-- 5 números diferentes
-- Mismo sorteo
-- Diferentes tipos (Directo, Pale, Tripleta)

Líneas:
- 23 Directo Primera $100
- 45 Directo Segunda $50
- 67 Pale $30
- 89 Tripleta $20
- 12 Directo Primera $25

Total: $225
```
📄 Ver código completo: EJEMPLOS_CREAR_TICKETS.sql (Ejemplo 2)

---

### 3️⃣ Ticket con Multiplicador x5
```sql
-- 2 números
-- Multiplicador global x5
-- $30 base → $150 total

global_multiplier: 5.00

Línea 1: $20 x 5 = $100
Línea 2: $10 x 5 = $50
Total: $150
```
📄 Ver código completo: EJEMPLOS_CREAR_TICKETS.sql (Ejemplo 3)

---

### 4️⃣ Ticket con Descuento 15%
```sql
-- 3 números
-- Descuento global 15%

global_discount: 15.00

Base: $100 → Descuento $15 → Total $85
Base: $50  → Descuento $7.50 → Total $42.50
Base: $30  → Descuento $4.50 → Total $25.50
```
📄 Ver código completo: EJEMPLOS_CREAR_TICKETS.sql (Ejemplo 4)

---

### 5️⃣ Ticket con Múltiples Sorteos
```sql
-- Mismo número (23) en 3 sorteos
-- LEIDSA 12:00 PM, 6:00 PM, 9:00 PM

draw_time: '12:00' → draw_id: 150
draw_time: '18:00' → draw_id: 151
draw_time: '21:00' → draw_id: 152
```
📄 Ver código completo: EJEMPLOS_CREAR_TICKETS.sql (Ejemplo 5)

---

### 6️⃣ Ticket Grande con Datos del Cliente
```sql
-- Tickets mayores a $1,000
-- Requiere información del cliente

customer_name: 'Juan Pérez García'
customer_phone: '809-555-1234'
customer_email: 'juan.perez@email.com'
customer_id_number: '001-1234567-8'
```
📄 Ver código completo: EJEMPLOS_CREAR_TICKETS.sql (Ejemplo 6)

---

## 🏆 Verificar Ganadores y Pagar

### Paso 1: Verificar Ganadores
```sql
EXEC sp_CheckTicketWinners @ticket_id = 1;
```

### Paso 2: Ver Ganadores
```sql
SELECT * FROM vw_pending_winners;
```

### Paso 3: Pagar Premio
```sql
EXEC sp_PayTicketPrize 
    @ticket_id = 1,
    @paid_by = 10,
    @payment_method = 'efectivo',
    @payment_reference = 'PAGO-001';
```

📄 Ver código completo: EJEMPLOS_CREAR_TICKETS.sql (Ejemplo 7)

---

## 📈 Consultas Útiles

### Tickets del Día
```sql
SELECT * FROM tickets
WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE);
```

### Números Calientes
```sql
SELECT TOP 10 * FROM vw_hot_numbers_today 
ORDER BY total_bet DESC;
```

### Ganadores Pendientes
```sql
SELECT * FROM vw_pending_winners;
```

### Ventas por Banca
```sql
SELECT * FROM vw_daily_sales_by_betting_pool
ORDER BY total_sales DESC;
```

---

## 🔧 Stored Procedures Disponibles

| SP | Descripción | Ejemplo |
|----|-------------|---------|
| `sp_CalculateTicketTotals` | Recalcula totales | `EXEC sp_CalculateTicketTotals @ticket_id=1;` |
| `sp_CancelTicket` | Cancela un ticket | `EXEC sp_CancelTicket @ticket_id=1, @cancelled_by=10, @reason='Error';` |
| `sp_CheckTicketWinners` | Verifica ganadores | `EXEC sp_CheckTicketWinners @ticket_id=1;` |
| `sp_PayTicketPrize` | Paga premio | `EXEC sp_PayTicketPrize @ticket_id=1, @paid_by=10, @method='efectivo';` |
| `sp_GetNumberSales` | Ventas por número | `EXEC sp_GetNumberSales @bet_number='23', @lottery_id=5, @draw_date='2025-10-22';` |

---

## 💡 Tips Importantes

### ✅ Siempre hacer:
1. Usar `BEGIN TRANSACTION` y `COMMIT`
2. Capturar `@ticket_id` con `SCOPE_IDENTITY()`
3. Llamar `sp_CalculateTicketTotals` al final
4. Validar `betting_pool_id`, `user_id`, `lottery_id`, `draw_id`

### ❌ Nunca hacer:
1. Crear tickets sin líneas
2. Usar IDs que no existen
3. Olvidar calcular totales
4. Crear tickets sin código único

### 🔒 Validaciones:
- `ticket_code` debe ser único
- `bet_amount` debe ser > 0
- `multiplier` debe ser >= 1.00
- `discount_percentage` entre 0 y 100
- `status` debe ser válido: pending, active, winner, loser, paid, cancelled

---

## 📁 Archivos de Referencia

- **EJEMPLOS_CREAR_TICKETS.sql** - 8 ejemplos completos con código
- **TICKETS_REFACTORIZACION.md** - Documentación técnica completa
- **lottery_database_complete.sql** - Script de base de datos

---

**Creado:** Octubre 2025  
**Sistema:** Lotería - Módulo de Tickets
