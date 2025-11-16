# 🎫 DATOS NECESARIOS PARA GENERACIÓN DE TICKETS
## Análisis Completo de Estructura de Datos - Sistema Lotto

---

## 📋 ÍNDICE

1. [Datos de Cabecera del Ticket](#1-datos-de-cabecera-del-ticket)
2. [Datos de Líneas/Jugadas](#2-datos-de-líneasjugadas)
3. [Datos de Configuración](#3-datos-de-configuración)
4. [Datos de Validación](#4-datos-de-validación)
5. [Datos Calculados](#5-datos-calculados)
6. [Modelo de Datos Completo](#6-modelo-de-datos-completo)
7. [Ejemplos Prácticos](#7-ejemplos-prácticos)
8. [Reglas de Negocio](#8-reglas-de-negocio)

---

## 1. DATOS DE CABECERA DEL TICKET

### 1.1 Identificación del Ticket

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Generado Por |
|-------|------|-------------|-------------|---------|--------------|
| `ticket_id` | INT/BIGINT | ID único interno (PK) | ✅ | 12345678 | Base de datos (IDENTITY) |
| `ticket_code` | VARCHAR(20) | Código legible para el cliente | ✅ | LAN-20251007-0001 | Sistema (algoritmo) |
| `barcode` | VARCHAR(50) | Código de barras/QR | ✅ | *LAN20251007000123* | Sistema (EAN-13/QR) |
| `created_at` | DATETIME2 | Fecha y hora de creación | ✅ | 2025-10-07 10:30:45 | Sistema (GETDATE()) |

**Formato del `ticket_code`:**
```
LAN-YYYYMMDD-NNNN
 │    │       │
 │    │       └─ Número secuencial del día (0001-9999)
 │    └───────── Fecha (año-mes-día)
 └────────────── Prefijo fijo de la casa matriz
```

### 1.2 Datos de la Banca

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Fuente |
|-------|------|-------------|-------------|---------|--------|
| `branch_id` | INT | ID de la banca que vende | ✅ | 10 | Sesión usuario |
| `branch_code` | VARCHAR(10) | Código de la banca | ✅ | 010 | Tabla `branch` |
| `branch_name` | VARCHAR(100) | Nombre comercial | ✅ | LA CENTRAL 10 | Tabla `branch` |
| `branch_owner` | VARCHAR(100) | Propietario/Referencia | ✅ | GILBERTO TL | Tabla `branch` |
| `zone_id` | INT | Zona geográfica | ✅ | 5 | Tabla `branch` |
| `zone_name` | VARCHAR(100) | Nombre de la zona | ✅ | GRUPO GILBERTO TL | Tabla `zone` |

### 1.3 Datos del Usuario/Vendedor

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Fuente |
|-------|------|-------------|-------------|---------|--------|
| `user_id` | INT | ID del vendedor | ✅ | 234 | Sesión JWT |
| `username` | VARCHAR(50) | Login del vendedor | ✅ | juan001 | Tabla `user` |
| `user_fullname` | VARCHAR(100) | Nombre completo | ❌ | Juan Pérez | Tabla `user` |
| `ip_address` | VARCHAR(45) | IP del terminal | ✅ | 192.168.1.50 | Request HTTP |
| `terminal_id` | VARCHAR(20) | Identificador del terminal | ❌ | TERM-001 | Config local |

### 1.4 Datos de Estado y Control

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Valores Posibles |
|-------|------|-------------|-------------|---------|------------------|
| `status` | VARCHAR(20) | Estado actual del ticket | ✅ | pending | pending, active, winner, loser, paid, cancelled |
| `is_cancelled` | BIT | ¿Está cancelado? | ✅ | 0 | 0=No, 1=Sí |
| `cancelled_at` | DATETIME2 | Fecha de cancelación | ❌ | NULL | NULL o fecha |
| `cancelled_by` | INT | Usuario que canceló | ❌ | NULL | user_id |
| `cancellation_reason` | VARCHAR(200) | Motivo de cancelación | ❌ | NULL | Texto libre |
| `is_paid` | BIT | ¿Premio pagado? | ✅ | 0 | 0=No, 1=Sí |
| `paid_at` | DATETIME2 | Fecha de pago del premio | ❌ | NULL | NULL o fecha |
| `paid_by` | INT | Usuario que pagó | ❌ | NULL | user_id |

### 1.5 Datos de Cliente (Opcional)

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Notas |
|-------|------|-------------|-------------|---------|-------|
| `customer_id` | INT | ID del cliente (si registrado) | ❌ | 456 | Para clientes VIP/registrados |
| `customer_name` | VARCHAR(100) | Nombre del cliente | ❌ | María García | Solo si se captura |
| `customer_phone` | VARCHAR(20) | Teléfono del cliente | ❌ | 809-555-1234 | Para notificaciones |
| `customer_email` | VARCHAR(100) | Email del cliente | ❌ | maria@email.com | Para notificaciones |

---

## 2. DATOS DE LÍNEAS/JUGADAS

### 2.1 Estructura de Línea Individual

**Cada línea representa UNA apuesta a UN sorteo con UN número**

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Validación |
|-------|------|-------------|-------------|---------|------------|
| `line_id` | INT/BIGINT | ID único de la línea (PK) | ✅ | 987654 | IDENTITY |
| `ticket_id` | INT/BIGINT | ID del ticket padre (FK) | ✅ | 12345678 | FK a `ticket` |
| `line_number` | INT | Número de línea (1, 2, 3...) | ✅ | 1 | >= 1 |
| `lottery_id` | INT | ID del sorteo | ✅ | 5 | FK a `lottery` |
| `lottery_code` | VARCHAR(20) | Código del sorteo | ✅ | REAL | Tabla `lottery` |
| `lottery_name` | VARCHAR(100) | Nombre del sorteo | ✅ | Real Tarde | Tabla `lottery` |
| `draw_id` | INT | ID del sorteo específico | ✅ | 1523 | FK a `draw` |
| `draw_date` | DATE | Fecha del sorteo | ✅ | 2025-10-07 | Tabla `draw` |
| `draw_time` | TIME | Hora del sorteo | ✅ | 17:00:00 | Tabla `draw` |

### 2.2 Datos del Número Apostado

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Formato |
|-------|------|-------------|-------------|---------|---------|
| `bet_number` | VARCHAR(20) | Número apostado | ✅ | 23 | Según tipo de jugada |
| `bet_type_id` | INT | ID del tipo de jugada | ✅ | 1 | FK a `bet_type` |
| `bet_type_code` | VARCHAR(20) | Código tipo jugada | ✅ | DIRECTO | DIRECTO, PALE, TRIPLETA, etc. |
| `bet_type_name` | VARCHAR(50) | Nombre tipo jugada | ✅ | Directo | Descripción legible |
| `position` | INT | Posición apostada (si aplica) | ❌ | 1 | 1=Primera, 2=Segunda, 3=Tercera, NULL=Cualquiera |

**Formatos de `bet_number` según tipo:**

| Tipo Jugada | Formato | Ejemplo | Longitud |
|-------------|---------|---------|----------|
| Directo | 00-99 | 23 | 2 dígitos |
| Pale | 00-99 | 23 | 2 dígitos |
| Tripleta | 000-999 | 456 | 3 dígitos |
| Cash3 | 000-999 | 789 | 3 dígitos |
| Play4 | 0000-9999 | 1234 | 4 dígitos |
| Pick5 | Múltiples números | 03-15-22-34-45 | Variable |
| Super Pale | 00-99 | 67 | 2 dígitos |

### 2.3 Datos Monetarios de la Línea

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Cálculo |
|-------|------|-------------|-------------|---------|---------|
| `bet_amount` | DECIMAL(18,2) | Monto apostado base | ✅ | 100.00 | Ingresado por usuario |
| `multiplier` | DECIMAL(5,2) | Multiplicador aplicado | ✅ | 1.00 | 1.00, 2.00, 5.00, 10.00 |
| `discount_percentage` | DECIMAL(5,2) | % de descuento | ✅ | 10.00 | 0.00 - 50.00 |
| `discount_amount` | DECIMAL(18,2) | Monto del descuento | ✅ | 10.00 | bet_amount * discount_percentage / 100 |
| `subtotal` | DECIMAL(18,2) | Subtotal después descuento | ✅ | 90.00 | bet_amount - discount_amount |
| `total_with_multiplier` | DECIMAL(18,2) | Total con multiplicador | ✅ | 180.00 | subtotal * multiplier |
| `commission_percentage` | DECIMAL(5,2) | % comisión banca | ✅ | 8.00 | Tabla `commission_schema` |
| `commission_amount` | DECIMAL(18,2) | Monto comisión | ✅ | 14.40 | total_with_multiplier * commission_percentage / 100 |
| `net_amount` | DECIMAL(18,2) | Monto neto para casa | ✅ | 165.60 | total_with_multiplier - commission_amount |

**Fórmulas de Cálculo:**
```sql
-- Paso 1: Descuento
discount_amount = bet_amount * (discount_percentage / 100)
subtotal = bet_amount - discount_amount

-- Paso 2: Multiplicador
total_with_multiplier = subtotal * multiplier

-- Paso 3: Comisión
commission_amount = total_with_multiplier * (commission_percentage / 100)
net_amount = total_with_multiplier - commission_amount
```

### 2.4 Datos de Premio de la Línea

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Cuándo se llena |
|-------|------|-------------|-------------|---------|-----------------|
| `prize_multiplier` | DECIMAL(10,2) | Multiplicador del premio | ❌ | 60.00 | Al publicar resultado |
| `prize_amount` | DECIMAL(18,2) | Monto del premio | ❌ | 10800.00 | Si es ganadora |
| `is_winner` | BIT | ¿Es línea ganadora? | ✅ | 0 | Al publicar resultado |
| `winning_position` | INT | Posición ganadora | ❌ | 1 | 1, 2, 3 o NULL |
| `result_number` | VARCHAR(20) | Número que salió | ❌ | 23 | Al publicar resultado |

**Cálculo de Premio:**
```sql
prize_amount = bet_amount * multiplier * prize_multiplier
```

**Ejemplo:**
- Apuesta: $100
- Multiplicador: x2
- Premio (Directo 1ra): 60x
- **Premio Total: $100 × 2 × 60 = $12,000**

### 2.5 Datos de Estado de la Línea

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Valores |
|-------|------|-------------|-------------|---------|---------|
| `line_status` | VARCHAR(20) | Estado de la línea | ✅ | active | pending, active, winner, loser, cancelled |
| `is_void` | BIT | ¿Línea anulada? | ✅ | 0 | 0=No, 1=Sí |
| `void_reason` | VARCHAR(200) | Motivo de anulación | ❌ | NULL | Texto libre |

---

## 3. DATOS DE CONFIGURACIÓN

### 3.1 Configuración Global del Ticket

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Fuente |
|-------|------|-------------|-------------|---------|--------|
| `global_multiplier` | DECIMAL(5,2) | Multiplicador global | ✅ | 1.00 | Toggle UI "Mult." |
| `global_discount` | DECIMAL(5,2) | Descuento global % | ✅ | 0.00 | Toggle UI "Desc." |
| `currency_code` | VARCHAR(3) | Código de moneda | ✅ | DOP | ISO 4217 |
| `currency_symbol` | VARCHAR(5) | Símbolo de moneda | ✅ | RD$ | Config sistema |
| `exchange_rate` | DECIMAL(10,4) | Tasa de cambio | ✅ | 1.0000 | Config sistema |

### 3.2 Datos de Impresión

| Campo | Tipo | Descripción | Obligatorio | Ejemplo | Fuente |
|-------|------|-------------|-------------|---------|--------|
| `footer_line1` | VARCHAR(100) | Línea 1 pie de ticket | ❌ | ¡Buena Suerte! | Tabla `branch_footer` |
| `footer_line2` | VARCHAR(100) | Línea 2 pie de ticket | ❌ | No se aceptan devoluciones | Tabla `branch_footer` |
| `footer_line3` | VARCHAR(100) | Línea 3 pie de ticket | ❌ | www.lotto.com | Tabla `branch_footer` |
| `print_format` | VARCHAR(20) | Formato de impresión | ✅ | thermal_80mm | thermal_80mm, thermal_58mm, A4 |
| `print_copies` | INT | Copias a imprimir | ✅ | 1 | 1-3 |
| `show_prizes` | BIT | ¿Mostrar tabla premios? | ✅ | 1 | 0=No, 1=Sí |

### 3.3 Configuración de Sorteos en el Ticket

**Necesitamos saber qué sorteos están incluidos:**

| Campo | Tipo | Descripción | Obligatorio | Ejemplo |
|-------|------|-------------|-------------|---------|
| `lottery_ids` | VARCHAR(500) | IDs sorteos separados | ✅ | 1,5,12,15 |
| `total_lotteries` | INT | Cantidad de sorteos | ✅ | 4 |
| `earliest_draw_time` | DATETIME2 | Sorteo más temprano | ✅ | 2025-10-07 12:00:00 |
| `latest_draw_time` | DATETIME2 | Sorteo más tardío | ✅ | 2025-10-07 21:00:00 |

---

## 4. DATOS DE VALIDACIÓN

### 4.1 Validación de Límites

**Datos necesarios ANTES de crear el ticket:**

| Dato | Descripción | Fuente | Ejemplo |
|------|-------------|--------|---------|
| `current_limit` | Límite actual del número | Tabla `limit_rule` | $500.00 |
| `sold_today` | Total vendido hoy | Consulta SUM | $450.00 |
| `available_limit` | Disponible para apostar | Cálculo | $50.00 |
| `is_blocked` | ¿Número bloqueado? | Tabla `number_block` | false |
| `block_reason` | Motivo del bloqueo | Tabla `number_block` | NULL |

**Query de Validación:**
```sql
SELECT 
    lr.max_amount AS current_limit,
    ISNULL(SUM(tl.bet_amount), 0) AS sold_today,
    (lr.max_amount - ISNULL(SUM(tl.bet_amount), 0)) AS available_limit,
    CASE WHEN nb.number IS NOT NULL THEN 1 ELSE 0 END AS is_blocked
FROM limit_rule lr
LEFT JOIN ticket_line tl ON tl.bet_number = '23' 
    AND tl.lottery_id = @lottery_id
    AND CAST(tl.created_at AS DATE) = @today
LEFT JOIN number_block nb ON nb.number = '23' 
    AND nb.lottery_id = @lottery_id
    AND nb.is_active = 1
WHERE lr.lottery_id = @lottery_id
    AND lr.number = '23'
    AND lr.is_active = 1
```

### 4.2 Validación de Sorteos

| Dato | Descripción | Fuente | Validación |
|------|-------------|--------|------------|
| `draw_status` | Estado del sorteo | Tabla `draw` | Debe ser 'open' |
| `draw_close_time` | Hora de cierre | Tabla `draw` | Debe ser > NOW() |
| `is_active` | ¿Sorteo activo? | Tabla `lottery` | Debe ser 1 |
| `accepts_bets` | ¿Acepta apuestas? | Tabla `lottery` | Debe ser 1 |

### 4.3 Validación de Banca

| Dato | Descripción | Fuente | Validación |
|------|-------------|--------|------------|
| `branch_status` | Estado de la banca | Tabla `branch` | Debe ser 'active' |
| `branch_balance` | Balance actual | Tabla `balance` | Debe ser >= 0 (según config) |
| `has_permission` | Permiso para vender | Tabla `user_permission` | Debe ser true |
| `is_within_hours` | ¿Dentro horario? | Tabla `branch` | open_time <= NOW() <= close_time |

---

## 5. DATOS CALCULADOS

### 5.1 Totales del Ticket

| Campo | Tipo | Descripción | Fórmula |
|-------|------|-------------|---------|
| `total_lines` | INT | Total de líneas | COUNT(*) |
| `total_bet_amount` | DECIMAL(18,2) | Total apostado base | SUM(bet_amount) |
| `total_discount` | DECIMAL(18,2) | Total descuentos | SUM(discount_amount) |
| `total_subtotal` | DECIMAL(18,2) | Subtotal después desc. | SUM(subtotal) |
| `total_with_multiplier` | DECIMAL(18,2) | Total con multiplicador | SUM(total_with_multiplier) |
| `total_commission` | DECIMAL(18,2) | Total comisiones | SUM(commission_amount) |
| `total_net` | DECIMAL(18,2) | Total neto | SUM(net_amount) |
| `grand_total` | DECIMAL(18,2) | Total a pagar | SUM(total_with_multiplier) |

**Ejemplo de Cálculo:**
```
Línea 1: REAL|23|100 → $100
Línea 2: REAL|23P|50 → $50
Línea 3: NACIONAL|456T|25 → $25
─────────────────────────
Total bet_amount: $175.00
Descuento 10%: -$17.50
Subtotal: $157.50
Multiplicador x1: $157.50
Comisión 8%: -$12.60
─────────────────────────
TOTAL A PAGAR: $157.50
```

### 5.2 Datos de Premio Total (Después del Sorteo)

| Campo | Tipo | Descripción | Fórmula |
|-------|------|-------------|---------|
| `total_prize` | DECIMAL(18,2) | Total premio | SUM(prize_amount) WHERE is_winner=1 |
| `winning_lines` | INT | Líneas ganadoras | COUNT(*) WHERE is_winner=1 |
| `net_result` | DECIMAL(18,2) | Resultado neto | total_with_multiplier - total_prize |

---

## 6. MODELO DE DATOS COMPLETO

### 6.1 Estructura JSON Completa

```json
{
  "ticket": {
    "header": {
      "ticket_id": 12345678,
      "ticket_code": "LAN-20251007-0001",
      "barcode": "*LAN20251007000123*",
      "created_at": "2025-10-07T10:30:45",
      "branch": {
        "branch_id": 10,
        "branch_code": "010",
        "branch_name": "LA CENTRAL 10",
        "branch_owner": "GILBERTO TL",
        "zone_id": 5,
        "zone_name": "GRUPO GILBERTO TL"
      },
      "user": {
        "user_id": 234,
        "username": "juan001",
        "fullname": "Juan Pérez",
        "ip_address": "192.168.1.50",
        "terminal_id": "TERM-001"
      },
      "status": {
        "current_status": "pending",
        "is_cancelled": false,
        "is_paid": false
      },
      "customer": {
        "customer_id": null,
        "customer_name": null,
        "customer_phone": null
      }
    },
    "configuration": {
      "global_multiplier": 1.00,
      "global_discount": 0.00,
      "currency": {
        "code": "DOP",
        "symbol": "RD$",
        "exchange_rate": 1.0000
      },
      "print": {
        "footer_line1": "¡Buena Suerte!",
        "footer_line2": "No se aceptan devoluciones",
        "footer_line3": "www.lotto.com",
        "format": "thermal_80mm",
        "copies": 1,
        "show_prizes": true
      }
    },
    "lines": [
      {
        "line_id": 987654,
        "line_number": 1,
        "lottery": {
          "lottery_id": 5,
          "lottery_code": "REAL",
          "lottery_name": "Real Tarde",
          "draw_id": 1523,
          "draw_date": "2025-10-07",
          "draw_time": "17:00:00"
        },
        "bet": {
          "bet_number": "23",
          "bet_type_id": 1,
          "bet_type_code": "DIRECTO",
          "bet_type_name": "Directo",
          "position": 1
        },
        "amounts": {
          "bet_amount": 100.00,
          "multiplier": 1.00,
          "discount_percentage": 10.00,
          "discount_amount": 10.00,
          "subtotal": 90.00,
          "total_with_multiplier": 90.00,
          "commission_percentage": 8.00,
          "commission_amount": 7.20,
          "net_amount": 82.80
        },
        "prize": {
          "prize_multiplier": null,
          "prize_amount": null,
          "is_winner": false,
          "winning_position": null,
          "result_number": null
        },
        "status": {
          "line_status": "pending",
          "is_void": false
        }
      },
      {
        "line_id": 987655,
        "line_number": 2,
        "lottery": {
          "lottery_id": 5,
          "lottery_code": "REAL",
          "lottery_name": "Real Tarde",
          "draw_id": 1523,
          "draw_date": "2025-10-07",
          "draw_time": "17:00:00"
        },
        "bet": {
          "bet_number": "23",
          "bet_type_id": 2,
          "bet_type_code": "PALE",
          "bet_type_name": "Palé",
          "position": null
        },
        "amounts": {
          "bet_amount": 50.00,
          "multiplier": 1.00,
          "discount_percentage": 10.00,
          "discount_amount": 5.00,
          "subtotal": 45.00,
          "total_with_multiplier": 45.00,
          "commission_percentage": 10.00,
          "commission_amount": 4.50,
          "net_amount": 40.50
        },
        "prize": {
          "prize_multiplier": null,
          "prize_amount": null,
          "is_winner": false,
          "winning_position": null,
          "result_number": null
        },
        "status": {
          "line_status": "pending",
          "is_void": false
        }
      },
      {
        "line_id": 987656,
        "line_number": 3,
        "lottery": {
          "lottery_id": 8,
          "lottery_code": "NACIONAL",
          "lottery_name": "Nacional Tarde",
          "draw_id": 1524,
          "draw_date": "2025-10-07",
          "draw_time": "18:00:00"
        },
        "bet": {
          "bet_number": "456",
          "bet_type_id": 3,
          "bet_type_code": "TRIPLETA",
          "bet_type_name": "Tripleta",
          "position": null
        },
        "amounts": {
          "bet_amount": 25.00,
          "multiplier": 1.00,
          "discount_percentage": 10.00,
          "discount_amount": 2.50,
          "subtotal": 22.50,
          "total_with_multiplier": 22.50,
          "commission_percentage": 12.00,
          "commission_amount": 2.70,
          "net_amount": 19.80
        },
        "prize": {
          "prize_multiplier": null,
          "prize_amount": null,
          "is_winner": false,
          "winning_position": null,
          "result_number": null
        },
        "status": {
          "line_status": "pending",
          "is_void": false
        }
      }
    ],
    "totals": {
      "total_lines": 3,
      "total_bet_amount": 175.00,
      "total_discount": 17.50,
      "total_subtotal": 157.50,
      "total_with_multiplier": 157.50,
      "total_commission": 14.40,
      "total_net": 143.10,
      "grand_total": 157.50,
      "total_prize": 0.00,
      "winning_lines": 0,
      "net_result": 157.50
    },
    "metadata": {
      "lottery_ids": "5,8",
      "total_lotteries": 2,
      "earliest_draw_time": "2025-10-07T17:00:00",
      "latest_draw_time": "2025-10-07T18:00:00",
      "hash": "a3f5e892bc1234567890abcdef",
      "created_by_api_version": "v2.1.0"
    }
  }
}
```

---

## 7. EJEMPLOS PRÁCTICOS

### 7.1 Ticket Simple (1 Apuesta, 1 Sorteo)

**Input del Usuario:**
```
Banca: LA CENTRAL 10
Sorteo: REAL
Jugada: REAL|23|100
```

**Datos Generados:**

```json
{
  "ticket_code": "LAN-20251007-0001",
  "branch_id": 10,
  "user_id": 234,
  "status": "pending",
  "lines": [
    {
      "line_number": 1,
      "lottery_code": "REAL",
      "bet_number": "23",
      "bet_type_code": "DIRECTO",
      "bet_amount": 100.00,
      "total_with_multiplier": 100.00
    }
  ],
  "grand_total": 100.00
}
```

### 7.2 Ticket Múltiple (Varias Apuestas, 1 Sorteo)

**Input del Usuario:**
```
Banca: LA CENTRAL 10
Sorteo: REAL
Jugadas:
  REAL|23|100
  REAL|45|50
  REAL|67|75
  REAL|23P|50  (Pale al 23)
```

**Datos Generados:**

```json
{
  "ticket_code": "LAN-20251007-0002",
  "branch_id": 10,
  "user_id": 234,
  "status": "pending",
  "lines": [
    {
      "line_number": 1,
      "lottery_code": "REAL",
      "bet_number": "23",
      "bet_type_code": "DIRECTO",
      "bet_amount": 100.00
    },
    {
      "line_number": 2,
      "lottery_code": "REAL",
      "bet_number": "45",
      "bet_type_code": "DIRECTO",
      "bet_amount": 50.00
    },
    {
      "line_number": 3,
      "lottery_code": "REAL",
      "bet_number": "67",
      "bet_type_code": "DIRECTO",
      "bet_amount": 75.00
    },
    {
      "line_number": 4,
      "lottery_code": "REAL",
      "bet_number": "23",
      "bet_type_code": "PALE",
      "bet_amount": 50.00
    }
  ],
  "total_lines": 4,
  "grand_total": 275.00
}
```

### 7.3 Ticket Multi-Sorteo (Varias Apuestas, Varios Sorteos)

**Input del Usuario:**
```
Banca: LA CENTRAL 10
Sorteos: REAL, NACIONAL, LEIDSA
Jugadas:
  REAL|23|100
  REAL|45|50
  NACIONAL|23|100
  NACIONAL|67|75
  LEIDSA|456T|25  (Tripleta)
  LEIDSA|789|30
```

**Datos Generados:**

```json
{
  "ticket_code": "LAN-20251007-0003",
  "branch_id": 10,
  "user_id": 234,
  "status": "pending",
  "lines": [
    {
      "line_number": 1,
      "lottery_code": "REAL",
      "draw_id": 1523,
      "bet_number": "23",
      "bet_type_code": "DIRECTO",
      "bet_amount": 100.00
    },
    {
      "line_number": 2,
      "lottery_code": "REAL",
      "draw_id": 1523,
      "bet_number": "45",
      "bet_type_code": "DIRECTO",
      "bet_amount": 50.00
    },
    {
      "line_number": 3,
      "lottery_code": "NACIONAL",
      "draw_id": 1524,
      "bet_number": "23",
      "bet_type_code": "DIRECTO",
      "bet_amount": 100.00
    },
    {
      "line_number": 4,
      "lottery_code": "NACIONAL",
      "draw_id": 1524,
      "bet_number": "67",
      "bet_type_code": "DIRECTO",
      "bet_amount": 75.00
    },
    {
      "line_number": 5,
      "lottery_code": "LEIDSA",
      "draw_id": 1525,
      "bet_number": "456",
      "bet_type_code": "TRIPLETA",
      "bet_amount": 25.00
    },
    {
      "line_number": 6,
      "lottery_code": "LEIDSA",
      "draw_id": 1525,
      "bet_number": "789",
      "bet_type_code": "DIRECTO",
      "bet_amount": 30.00
    }
  ],
  "total_lines": 6,
  "total_lotteries": 3,
  "lottery_ids": "5,8,12",
  "grand_total": 380.00
}
```

### 7.4 Ticket con Multiplicador y Descuento

**Input del Usuario:**
```
Banca: LA CENTRAL 10
Opciones: 
  - Multiplicador: x2
  - Descuento: 10%
Sorteo: REAL
Jugadas:
  REAL|23|100
  REAL|45|50
```

**Datos Generados:**

```json
{
  "ticket_code": "LAN-20251007-0004",
  "branch_id": 10,
  "user_id": 234,
  "global_multiplier": 2.00,
  "global_discount": 10.00,
  "status": "pending",
  "lines": [
    {
      "line_number": 1,
      "lottery_code": "REAL",
      "bet_number": "23",
      "bet_type_code": "DIRECTO",
      "bet_amount": 100.00,
      "discount_percentage": 10.00,
      "discount_amount": 10.00,
      "subtotal": 90.00,
      "multiplier": 2.00,
      "total_with_multiplier": 180.00
    },
    {
      "line_number": 2,
      "lottery_code": "REAL",
      "bet_number": "45",
      "bet_type_code": "DIRECTO",
      "bet_amount": 50.00,
      "discount_percentage": 10.00,
      "discount_amount": 5.00,
      "subtotal": 45.00,
      "multiplier": 2.00,
      "total_with_multiplier": 90.00
    }
  ],
  "total_lines": 2,
  "total_bet_amount": 150.00,
  "total_discount": 15.00,
  "total_subtotal": 135.00,
  "grand_total": 270.00
}
```

---

## 8. REGLAS DE NEGOCIO

### 8.1 Restricciones de Entrada

| Regla | Descripción | Validación |
|-------|-------------|------------|
| **Mínimo por línea** | Cada línea debe tener monto ≥ $1 | bet_amount >= 1.00 |
| **Máximo por línea** | Cada línea debe tener monto ≤ límite configurado | bet_amount <= max_bet_amount |
| **Mínimo de líneas** | Ticket debe tener al menos 1 línea | total_lines >= 1 |
| **Máximo de líneas** | Ticket no puede exceder X líneas | total_lines <= 100 (configurable) |
| **Sorteos abiertos** | Solo sorteos con estado 'open' | draw_status = 'open' AND draw_close_time > NOW() |
| **Números válidos** | Números según formato del tipo de jugada | REGEX según bet_type |
| **Sin duplicados exactos** | No puede haber líneas idénticas en el mismo ticket | UNIQUE(lottery_id, bet_number, bet_type_id) dentro del ticket |

### 8.2 Validaciones de Límites

| Regla | Descripción | Validación |
|-------|-------------|------------|
| **Límite por número** | No exceder límite individual | SUM(bet_amount) por número <= limit |
| **Límite por sorteo** | No exceder límite total del sorteo | SUM(bet_amount) por sorteo <= limit |
| **Límite por banca** | No exceder límite de la banca | SUM(bet_amount) por banca <= limit |
| **Número no bloqueado** | Número no debe estar en lista negra | NOT EXISTS en number_block |
| **Balance suficiente** | Banca debe tener balance (opcional) | branch_balance >= 0 (según config) |

### 8.3 Cálculos Automáticos

| Cálculo | Cuándo | Fórmula |
|---------|--------|---------|
| **Descuento** | Al crear línea | bet_amount * (discount_percentage / 100) |
| **Multiplicador** | Al crear línea | subtotal * multiplier |
| **Comisión** | Al crear línea | total_with_multiplier * (commission_percentage / 100) |
| **Premio** | Al publicar resultado | bet_amount * multiplier * prize_multiplier (si gana) |
| **Balance banca** | Al crear/pagar ticket | balance - ventas + premios |

### 8.4 Estados y Transiciones

```
Estado del Ticket:
pending → active (cuando cierra el último sorteo)
active → winner (si al menos 1 línea gana)
active → loser (si todas las líneas pierden)
winner → paid (cuando se paga el premio)
* → cancelled (cancelación manual, según reglas)

Estado de Línea:
pending → active (cuando cierra el sorteo)
active → winner (si gana)
active → loser (si pierde)
* → void (anulación manual)
```

### 8.5 Auditoría

| Evento | Datos a Registrar |
|--------|-------------------|
| **Creación** | user_id, ip_address, timestamp, hash(lines), totals |
| **Modificación** | old_values, new_values, changed_by, reason |
| **Cancelación** | cancelled_by, timestamp, reason, ticket_status_at_time |
| **Pago** | paid_by, timestamp, prize_amount, payment_method |
| **Validación** | validation_result, failed_rules, timestamp |

---

## 9. RESUMEN DE DATOS MÍNIMOS REQUERIDOS

### Para Crear un Ticket se necesita:

#### ✅ **Datos Obligatorios Mínimos:**

1. **Identificación:**
   - `branch_id` (de dónde se vende)
   - `user_id` (quién vende)

2. **Por cada línea:**
   - `lottery_id` (a qué sorteo)
   - `bet_number` (qué número)
   - `bet_type_id` (tipo de jugada)
   - `bet_amount` (cuánto apuesta)

3. **Configuración:**
   - `global_multiplier` (default: 1.00)
   - `global_discount` (default: 0.00)

#### 📊 **Datos que se Generan Automáticamente:**

- `ticket_id` (PK, autoincremental)
- `ticket_code` (generado por algoritmo)
- `barcode` (generado a partir del código)
- `created_at` (timestamp actual)
- `status` (default: 'pending')
- `line_id` (PK, autoincremental)
- `line_number` (secuencial 1, 2, 3...)
- Todos los cálculos monetarios
- `draw_id` (lookup según lottery + fecha)

#### 🔍 **Datos que se Consultan de Otras Tablas:**

- Información de la banca (`branch`, `zone`)
- Información del usuario (`user`)
- Información del sorteo (`lottery`, `draw`)
- Esquema de comisiones (`commission_schema`)
- Límites (`limit_rule`)
- Bloqueos (`number_block`)
- Configuración de impresión (`branch_footer`)

---

## 10. EJEMPLO DE PAYLOAD API

### Request para Crear Ticket:

```json
POST /api/v1/tickets

{
  "branch_id": 10,
  "user_id": 234,
  "configuration": {
    "global_multiplier": 1.00,
    "global_discount": 10.00
  },
  "lines": [
    {
      "lottery_id": 5,
      "bet_number": "23",
      "bet_type_id": 1,
      "bet_amount": 100.00
    },
    {
      "lottery_id": 5,
      "bet_number": "23",
      "bet_type_id": 2,
      "bet_amount": 50.00
    },
    {
      "lottery_id": 8,
      "bet_number": "456",
      "bet_type_id": 3,
      "bet_amount": 25.00
    }
  ],
  "customer": {
    "customer_name": null,
    "customer_phone": null
  }
}
```

### Response Exitoso:

```json
HTTP 201 Created

{
  "success": true,
  "ticket": {
    "ticket_id": 12345678,
    "ticket_code": "LAN-20251007-0001",
    "barcode": "*LAN20251007000123*",
    "status": "pending",
    "created_at": "2025-10-07T10:30:45",
    "totals": {
      "total_lines": 3,
      "total_bet_amount": 175.00,
      "total_discount": 17.50,
      "grand_total": 157.50
    },
    "print_url": "/api/v1/tickets/12345678/print",
    "preview_url": "/api/v1/tickets/12345678/preview"
  },
  "message": "Ticket creado exitosamente"
}
```

### Response con Error de Validación:

```json
HTTP 400 Bad Request

{
  "success": false,
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "El número 23 ha alcanzado su límite en el sorteo REAL",
    "details": {
      "lottery": "REAL",
      "number": "23",
      "limit": 500.00,
      "sold": 475.00,
      "requested": 100.00,
      "available": 25.00
    }
  }
}
```

---

## 📌 CONCLUSIÓN

Para generar un ticket con **varias apuestas a varios sorteos**, necesitamos:

### 📦 **Datos de Entrada del Usuario:**
1. Banca donde se vende (`branch_id`)
2. Usuario que vende (`user_id`)
3. Configuración global (multiplicador, descuento)
4. **Lista de líneas**, cada una con:
   - Sorteo (`lottery_id`)
   - Número apostado (`bet_number`)
   - Tipo de jugada (`bet_type_id`)
   - Monto (`bet_amount`)

### 🔧 **Datos que el Sistema Genera:**
1. Identificadores únicos (ticket_id, ticket_code, barcode)
2. Timestamps (created_at)
3. Cálculos monetarios (descuentos, comisiones, totales)
4. Referencias a sorteos específicos (draw_id)

### 🔍 **Datos que el Sistema Consulta:**
1. Información de banca, zona, usuario
2. Configuración de sorteos y horarios
3. Límites y bloqueos activos
4. Esquemas de comisiones
5. Configuración de impresión

### ✅ **Validaciones Críticas:**
1. Sorteos deben estar abiertos
2. Números no deben estar bloqueados
3. No exceder límites configurados
4. Balance de banca suficiente (opcional)
5. Formatos de número válidos según tipo de jugada

---

**Documento generado:** Octubre 2025  
**Versión:** 1.0  
**Propósito:** Diseño de base de datos para sistema Lotto
