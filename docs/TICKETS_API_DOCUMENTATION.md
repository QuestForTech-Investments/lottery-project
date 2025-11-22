# 📘 Tickets API - Documentación de Uso

**Versión:** 1.0
**Fecha:** 2025-11-20
**Base URL:** `http://localhost:5004/api`
**Autenticación:** JWT Bearer Token

---

## 📑 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Endpoints Disponibles](#endpoints-disponibles)
3. [Modelos de Datos](#modelos-de-datos)
4. [Casos de Uso Comunes](#casos-de-uso-comunes)
5. [Códigos de Error](#códigos-de-error)
6. [Validaciones](#validaciones)
7. [Ejemplos Completos](#ejemplos-completos)

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT Bearer Token.

### Obtener Token

```bash
# Login
curl -X POST http://localhost:5004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123456"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 11,
  "username": "admin",
  "expiresAt": "2027-11-20T12:00:00Z"
}
```

### Usar Token en Requests

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:5004/api/tickets
```

---

## 🎯 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **GET** | `/api/tickets/params/create` | Obtener parámetros para crear ticket |
| **GET** | `/api/tickets/params/index` | Obtener parámetros para monitor de tickets |
| **POST** | `/api/tickets` | Crear nuevo ticket |
| **PATCH** | `/api/tickets` | Obtener lista filtrada y paginada de tickets |
| **GET** | `/api/tickets/{id}` | Obtener detalle completo de un ticket |
| **PATCH** | `/api/tickets/{id}/cancel` | Cancelar un ticket |
| **PATCH** | `/api/tickets/{id}/pay` | Registrar pago de premio |

---

## 1️⃣ GET /api/tickets/params/create

Obtiene los parámetros necesarios para crear un nuevo ticket.

### Request

```bash
curl -X GET http://localhost:5004/api/tickets/params/create \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response 200 OK

```json
{
  "draws": [
    {
      "drawId": 123,
      "drawName": "NEW YORK DAY",
      "lotteryId": 10,
      "lotteryName": "New York Lottery",
      "drawDate": "2025-11-20",
      "drawTime": "12:00:00",
      "cutoffTime": "11:50:00",
      "isActive": true
    },
    // ... más sorteos
  ],
  "betTypes": [
    {
      "betTypeId": 1,
      "betTypeCode": "DIRECTO",
      "betTypeName": "Directo",
      "minBet": 1.00,
      "maxBet": 10000.00
    },
    // ... más tipos de apuesta
  ],
  "ticketCountToday": 5
}
```

### Descripción de Campos

- **draws**: Lista de sorteos disponibles para venta
  - Solo incluye sorteos activos
  - Filtrados por cutoff time (ventas no cerradas)
  - Ordenados por drawDate y drawTime

- **betTypes**: Tipos de apuesta disponibles
  - DIRECTO, PALÉ, TRIPLETA, etc.

- **ticketCountToday**: Contador de tickets creados hoy
  - Útil para generar el próximo código de ticket

### Casos de Uso

- Cargar el formulario "Crear Ticket"
- Poblar dropdowns de sorteos y tipos de apuesta
- Verificar cuántos tickets se han creado hoy

---

## 2️⃣ GET /api/tickets/params/index

Obtiene los parámetros para el monitor/índice de tickets (filtros).

### Request

```bash
curl -X GET http://localhost:5004/api/tickets/params/index \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response 200 OK

```json
{
  "bettingPools": [
    {
      "bettingPoolId": 9,
      "poolName": "admin",
      "poolCode": "RB003333",
      "isActive": true
    },
    // ... más bancas
  ],
  "lotteries": [
    {
      "lotteryId": 10,
      "lotteryName": "New York Lottery",
      "lotteryCode": "NY",
      "isActive": true
    },
    // ... más loterías
  ],
  "betTypes": [
    {
      "betTypeId": 1,
      "betTypeName": "Directo"
    }
  ],
  "zones": [
    {
      "zoneId": 1,
      "zoneName": "Zona Norte",
      "zoneCode": "NORTE"
    }
  ]
}
```

### Casos de Uso

- Cargar filtros en la página de monitor de tickets
- Buscar tickets por banca, lotería, tipo de apuesta o zona

---

## 3️⃣ POST /api/tickets

Crea un nuevo ticket con una o más líneas de apuesta.

### Request

```bash
curl -X POST http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 123,
        "betNumber": "25",
        "betTypeId": 1,
        "betAmount": 100.00,
        "multiplier": 1.00
      },
      {
        "drawId": 125,
        "betNumber": "48",
        "betTypeId": 2,
        "betAmount": 50.00,
        "multiplier": 1.00
      }
    ],
    "globalMultiplier": 1.00,
    "globalDiscount": 0.00,
    "customerName": "Juan Pérez",
    "customerPhone": "8091234567",
    "notes": "Cliente frecuente"
  }'
```

### Campos Obligatorios

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `bettingPoolId` | int | ID de la banca | > 0 |
| `userId` | int | ID del cajero | > 0 |
| `lines` | array | Líneas de apuesta | min 1 item |
| `lines[].drawId` | int | ID del sorteo | > 0 |
| `lines[].betNumber` | string | Número apostado | max 20 chars |
| `lines[].betTypeId` | int | Tipo de apuesta | > 0 |
| `lines[].betAmount` | decimal | Monto apostado | >= 1.00 |
| `lines[].multiplier` | decimal | Multiplicador | 1.00-100.00 |

### Campos Opcionales

| Campo | Tipo | Descripción | Default |
|-------|------|-------------|---------|
| `globalMultiplier` | decimal | Multiplicador global | 1.00 |
| `globalDiscount` | decimal | Descuento global (%) | 0.00 |
| `customerName` | string | Nombre del cliente | null |
| `customerPhone` | string | Teléfono del cliente | null |
| `notes` | string | Notas adicionales | null |

### Response 201 Created

```json
{
  "ticketId": 7,
  "ticketCode": "20251120-0002",
  "barcode": "MjAyNTExMjAtMDAwMg==",
  "status": "pending",
  "bettingPoolId": 9,
  "bettingPoolName": "admin",
  "userId": 11,
  "userName": "Admin User",
  "customerName": "Juan Pérez",
  "customerPhone": "8091234567",
  "totalBetAmount": 150.00,
  "totalDiscount": 0.00,
  "totalCommission": 15.00,
  "totalNet": 135.00,
  "grandTotal": 135.00,
  "createdAt": "2025-11-20T10:45:00Z",
  "notes": "Cliente frecuente",
  "lines": [
    {
      "lineId": 1,
      "lineNumber": 1,
      "lotteryId": 10,
      "lotteryName": "New York Lottery",
      "drawId": 123,
      "drawName": "NEW YORK DAY",
      "drawDate": "2025-11-20",
      "drawTime": "12:00:00",
      "betNumber": "25",
      "betTypeId": 1,
      "betTypeName": "Directo",
      "betAmount": 100.00,
      "multiplier": 1.00,
      "subtotal": 100.00,
      "totalWithMultiplier": 100.00,
      "discountAmount": 0.00,
      "commissionPercentage": 10.00,
      "commissionAmount": 10.00,
      "netAmount": 90.00,
      "isWinner": false,
      "prizeAmount": 0.00
    },
    {
      "lineId": 2,
      "lineNumber": 2,
      "lotteryId": 12,
      "lotteryName": "Florida Lottery",
      "drawId": 125,
      "drawName": "FLORIDA DAY",
      "drawDate": "2025-11-20",
      "drawTime": "13:00:00",
      "betNumber": "48",
      "betTypeId": 2,
      "betTypeName": "Palé",
      "betAmount": 50.00,
      "multiplier": 1.00,
      "subtotal": 50.00,
      "totalWithMultiplier": 50.00,
      "discountAmount": 0.00,
      "commissionPercentage": 10.00,
      "commissionAmount": 5.00,
      "netAmount": 45.00,
      "isWinner": false,
      "prizeAmount": 0.00
    }
  ]
}
```

### Cálculos Automáticos

El backend calcula automáticamente:

```javascript
// Por cada línea:
subtotal = betAmount × multiplier
totalWithMultiplier = subtotal × globalMultiplier
discountAmount = totalWithMultiplier × (globalDiscount / 100)
afterDiscount = totalWithMultiplier - discountAmount
commissionAmount = afterDiscount × (commissionPercentage / 100)
netAmount = afterDiscount - commissionAmount

// Totales del ticket:
totalBetAmount = Σ subtotales
totalDiscount = Σ discountAmount
totalCommission = Σ commissionAmount
totalNet = Σ netAmount
grandTotal = totalNet
```

### Generación Automática

- **ticketCode**: `YYYYMMDD-NNNN` (ej: `20251120-0002`)
  - YYYYMMDD: Fecha actual
  - NNNN: Número secuencial del día (padded a 4 dígitos)

- **barcode**: Base64(ticketCode)
  - Útil para escaneo con lector de códigos de barras

### Errores Posibles

**400 Bad Request**
```json
{
  "errors": {
    "Lines": ["Debe agregar al menos una línea al ticket"],
    "Lines[0].BetAmount": ["El monto de la apuesta debe ser al menos 1.00"]
  },
  "status": 400,
  "title": "One or more validation errors occurred."
}
```

**404 Not Found**
```json
{
  "message": "Banca con ID 999 no encontrada",
  "status": 404
}
```

**400 Bad Request (Cutoff)**
```json
{
  "message": "No se pueden crear tickets. Las ventas para el sorteo NEW YORK DAY están cerradas (cutoff: 11:50 AM)",
  "status": 400
}
```

---

## 4️⃣ PATCH /api/tickets

Obtiene una lista filtrada y paginada de tickets.

### Request

```bash
curl -X PATCH http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "status": "pending",
    "startDate": "2025-11-20",
    "endDate": "2025-11-20",
    "searchTerm": "Juan",
    "pageNumber": 1,
    "pageSize": 10
  }'
```

### Filtros Disponibles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `bettingPoolId` | int? | Filtrar por banca |
| `userId` | int? | Filtrar por cajero |
| `status` | string? | Filtrar por estado (pending, paid, cancelled) |
| `startDate` | date? | Fecha inicio (incluida) |
| `endDate` | date? | Fecha fin (incluida) |
| `searchTerm` | string? | Buscar en ticketCode, customerName, customerPhone |
| `pageNumber` | int | Número de página (default: 1) |
| `pageSize` | int | Tamaño de página (default: 50, max: 100) |

### Response 200 OK

```json
{
  "tickets": [
    {
      "ticketId": 7,
      "ticketCode": "20251120-0002",
      "status": "pending",
      "statusDisplay": "Pendiente",
      "bettingPoolName": "admin",
      "userName": "Admin User",
      "customerName": "Juan Pérez",
      "customerPhone": "8091234567",
      "totalLines": 2,
      "totalBetAmount": 150.00,
      "grandTotal": 135.00,
      "totalPrizes": 0.00,
      "createdAt": "2025-11-20T10:45:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "totalAmount": 135.00,
  "totalPrizes": 0.00,
  "totalPending": 135.00,
  "pendingTickets": 1,
  "paidTickets": 0,
  "cancelledTickets": 0
}
```

### Totales Calculados

- **totalAmount**: Suma de grandTotal de todos los tickets
- **totalPrizes**: Suma de premios pagados
- **totalPending**: Suma de tickets pendientes
- **pendingTickets**: Cantidad de tickets con status "pending"
- **paidTickets**: Cantidad de tickets con status "paid"
- **cancelledTickets**: Cantidad de tickets con status "cancelled"

---

## 5️⃣ GET /api/tickets/{id}

Obtiene el detalle completo de un ticket específico.

### Request

```bash
curl -X GET http://localhost:5004/api/tickets/7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response 200 OK

```json
{
  "ticketId": 7,
  "ticketCode": "20251120-0002",
  "barcode": "MjAyNTExMjAtMDAwMg==",
  "status": "pending",
  "statusDisplay": "Pendiente",
  "bettingPoolId": 9,
  "bettingPoolName": "admin",
  "userId": 11,
  "userName": "Admin User",
  "customerName": "Juan Pérez",
  "customerPhone": "8091234567",
  "totalBetAmount": 150.00,
  "totalDiscount": 0.00,
  "totalCommission": 15.00,
  "totalNet": 135.00,
  "totalMultiplier": 1.00,
  "grandTotal": 135.00,
  "totalPrizes": 0.00,
  "balanceToPay": 0.00,
  "createdAt": "2025-11-20T10:45:00Z",
  "createdBy": 11,
  "updatedAt": null,
  "updatedBy": null,
  "isCancelled": false,
  "cancelledAt": null,
  "cancelledBy": null,
  "cancelledByName": null,
  "cancellationReason": null,
  "notes": "Cliente frecuente",
  "lines": [
    {
      "lineId": 1,
      "lineNumber": 1,
      "lotteryId": 10,
      "lotteryName": "New York Lottery",
      "drawId": 123,
      "drawName": "NEW YORK DAY",
      "drawDate": "2025-11-20",
      "drawTime": "12:00:00",
      "betNumber": "25",
      "betTypeId": 1,
      "betTypeName": "Directo",
      "betAmount": 100.00,
      "multiplier": 1.00,
      "subtotal": 100.00,
      "totalWithMultiplier": 100.00,
      "discountPercentage": 0.00,
      "discountAmount": 0.00,
      "commissionPercentage": 10.00,
      "commissionAmount": 10.00,
      "netAmount": 90.00,
      "isWinner": false,
      "winningPosition": null,
      "resultNumber": null,
      "prizeMultiplier": null,
      "prizeAmount": 0.00,
      "lineStatus": "pending"
    },
    {
      "lineId": 2,
      "lineNumber": 2,
      "lotteryId": 12,
      "lotteryName": "Florida Lottery",
      "drawId": 125,
      "drawName": "FLORIDA DAY",
      "drawDate": "2025-11-20",
      "drawTime": "13:00:00",
      "betNumber": "48",
      "betTypeId": 2,
      "betTypeName": "Palé",
      "betAmount": 50.00,
      "multiplier": 1.00,
      "subtotal": 50.00,
      "totalWithMultiplier": 50.00,
      "discountPercentage": 0.00,
      "discountAmount": 0.00,
      "commissionPercentage": 10.00,
      "commissionAmount": 5.00,
      "netAmount": 45.00,
      "isWinner": false,
      "winningPosition": null,
      "resultNumber": null,
      "prizeMultiplier": null,
      "prizeAmount": 0.00,
      "lineStatus": "pending"
    }
  ]
}
```

### Estados Posibles

- **pending**: Ticket pendiente (aún no se han verificado resultados)
- **paid**: Premio pagado
- **cancelled**: Ticket cancelado

### Casos de Uso

- Ver detalle completo del ticket
- Imprimir reimpresión del ticket
- Verificar estado de pagos
- Auditoría de transacciones

---

## 6️⃣ PATCH /api/tickets/{id}/cancel

Cancela un ticket existente.

### Request

```bash
curl -X PATCH http://localhost:5004/api/tickets/7/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancelledBy": 11,
    "cancellationReason": "Cliente cambió de opinión"
  }'
```

### Campos Obligatorios

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `cancelledBy` | int | ID del usuario que cancela | > 0 |
| `cancellationReason` | string | Motivo de cancelación | max 500 chars |

### Response 200 OK

```json
{
  "ticketId": 7,
  "ticketCode": "20251120-0002",
  "status": "cancelled",
  "statusDisplay": "Cancelado",
  "isCancelled": true,
  "cancelledAt": "2025-11-20T11:00:00Z",
  "cancelledBy": 11,
  "cancelledByName": "Admin User",
  "cancellationReason": "Cliente cambió de opinión",
  "grandTotal": 135.00,
  "message": "Ticket cancelado exitosamente"
}
```

### Reglas de Negocio

✅ **Se puede cancelar si:**
- El ticket tiene status "pending"
- No se ha pagado ningún premio
- El sorteo aún no ha corrido (opcional)

❌ **NO se puede cancelar si:**
- El ticket ya fue cancelado
- El ticket ya fue pagado (status "paid")
- El ticket tiene premios pagados

### Errores Posibles

**400 Bad Request**
```json
{
  "message": "El ticket ya está cancelado",
  "status": 400
}
```

**404 Not Found**
```json
{
  "message": "Ticket con ID 999 no encontrado",
  "status": 404
}
```

---

## 7️⃣ PATCH /api/tickets/{id}/pay

Registra el pago de premio de un ticket ganador.

### Request

```bash
curl -X PATCH http://localhost:5004/api/tickets/7/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paidBy": 11,
    "paymentMethod": "cash",
    "notes": "Premio pagado en efectivo"
  }'
```

### Campos Obligatorios

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `paidBy` | int | ID del usuario que paga | > 0 |

### Campos Opcionales

| Campo | Tipo | Descripción | Default |
|-------|------|-------------|---------|
| `paymentMethod` | string | Método de pago (cash, bank_transfer, check) | "cash" |
| `notes` | string | Notas del pago | null |

### Response 200 OK

```json
{
  "ticketId": 7,
  "ticketCode": "20251120-0002",
  "status": "paid",
  "statusDisplay": "Pagado",
  "totalPrizes": 5600.00,
  "balanceToPay": 0.00,
  "paidAt": "2025-11-20T18:00:00Z",
  "paidBy": 11,
  "paidByName": "Admin User",
  "paymentMethod": "cash",
  "notes": "Premio pagado en efectivo",
  "message": "Premio pagado exitosamente"
}
```

### Reglas de Negocio

✅ **Se puede pagar si:**
- El ticket tiene al menos una línea ganadora (isWinner = true)
- El ticket no ha sido cancelado
- Hay balance pendiente por pagar (balanceToPay > 0)

❌ **NO se puede pagar si:**
- El ticket no tiene líneas ganadoras
- El ticket está cancelado
- Ya se pagó todo el balance

---

## 📦 Modelos de Datos

### CreateTicketDto

```csharp
public class CreateTicketDto
{
    public int BettingPoolId { get; set; }         // Requerido, > 0
    public int UserId { get; set; }                // Requerido, > 0
    public List<CreateTicketLineDto> Lines { get; set; } // Requerido, min 1
    public decimal GlobalMultiplier { get; set; } = 1.00m; // 1.00-100.00
    public decimal GlobalDiscount { get; set; } = 0.00m;   // 0.00-100.00
    public string? CustomerName { get; set; }      // Max 100 chars
    public string? CustomerPhone { get; set; }     // Max 20 chars
    public string? Notes { get; set; }             // Max 500 chars
}
```

### CreateTicketLineDto

```csharp
public class CreateTicketLineDto
{
    public int DrawId { get; set; }           // Requerido, > 0
    public string BetNumber { get; set; }     // Requerido, max 20 chars
    public int BetTypeId { get; set; }        // Requerido, > 0
    public decimal BetAmount { get; set; }    // Requerido, >= 1.00
    public decimal Multiplier { get; set; } = 1.00m; // 1.00-100.00
}
```

### FilterTicketsDto

```csharp
public class FilterTicketsDto
{
    public int? BettingPoolId { get; set; }
    public int? UserId { get; set; }
    public string? Status { get; set; }       // "pending", "paid", "cancelled"
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;  // Default: 1
    public int PageSize { get; set; } = 50;   // Default: 50, Max: 100
}
```

### CancelTicketDto

```csharp
public class CancelTicketDto
{
    public int CancelledBy { get; set; }           // Requerido, > 0
    public string CancellationReason { get; set; } // Requerido, max 500 chars
}
```

### PayTicketDto

```csharp
public class PayTicketDto
{
    public int PaidBy { get; set; }               // Requerido, > 0
    public string PaymentMethod { get; set; } = "cash"; // "cash", "bank_transfer", "check"
    public string? Notes { get; set; }            // Max 500 chars
}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Crear Ticket Simple (1 Línea)

```bash
# Cliente quiere apostar $100 al número 25 directo para NY 12pm

curl -X POST http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 123,
        "betNumber": "25",
        "betTypeId": 1,
        "betAmount": 100.00,
        "multiplier": 1.00
      }
    ],
    "globalMultiplier": 1.00,
    "globalDiscount": 0.00,
    "customerName": "Juan Pérez",
    "customerPhone": "8091234567"
  }'
```

**Resultado:**
- Ticket creado con ID 7
- Código: 20251120-0002
- Total a cobrar: $90.00 (después de 10% comisión)

---

### Caso 2: Crear Ticket con Múltiples Líneas

```bash
# Cliente quiere jugar 3 números diferentes en sorteos distintos

curl -X POST http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 123,
        "betNumber": "25",
        "betTypeId": 1,
        "betAmount": 100.00,
        "multiplier": 1.00
      },
      {
        "drawId": 125,
        "betNumber": "48",
        "betTypeId": 2,
        "betAmount": 50.00,
        "multiplier": 1.00
      },
      {
        "drawId": 127,
        "betNumber": "123",
        "betTypeId": 3,
        "betAmount": 75.00,
        "multiplier": 1.00
      }
    ],
    "globalMultiplier": 1.00,
    "globalDiscount": 0.00,
    "customerName": "María García"
  }'
```

**Resultado:**
- 3 líneas en un solo ticket
- Total apostado: $225.00
- Total a cobrar: $202.50 (después de comisiones)

---

### Caso 3: Ticket con Multiplicador y Descuento

```bash
# Cliente VIP con descuento del 5% y multiplicador 2x

curl -X POST http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 123,
        "betNumber": "25",
        "betTypeId": 1,
        "betAmount": 100.00,
        "multiplier": 2.00
      }
    ],
    "globalMultiplier": 1.00,
    "globalDiscount": 5.00,
    "customerName": "Cliente VIP",
    "notes": "Cliente con descuento especial"
  }'
```

**Cálculos:**
```
Subtotal: $100.00 × 2.00 = $200.00
Descuento (5%): $200.00 × 0.05 = -$10.00
Después de descuento: $190.00
Comisión (10%): $190.00 × 0.10 = -$19.00
Total a cobrar: $171.00
```

---

### Caso 4: Buscar Tickets del Día

```bash
# Ver todos los tickets creados hoy en la banca admin

curl -X PATCH http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "status": "pending",
    "startDate": "2025-11-20",
    "endDate": "2025-11-20",
    "pageNumber": 1,
    "pageSize": 50
  }'
```

---

### Caso 5: Buscar Ticket por Cliente

```bash
# Buscar tickets del cliente "Juan"

curl -X PATCH http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "searchTerm": "Juan",
    "pageNumber": 1,
    "pageSize": 10
  }'
```

---

### Caso 6: Ver Detalle de Ticket para Reimpresión

```bash
# Cliente perdió su ticket, necesita reimpresión

curl -X GET http://localhost:5004/api/tickets/7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Uso:**
- Obtener todos los datos del ticket
- Generar reimpresión con marca de agua "REIMPRESIÓN"
- Mostrar código de barras para validación

---

### Caso 7: Cancelar Ticket (Cliente se Arrepintió)

```bash
# Cliente quiere cancelar el ticket inmediatamente después de crearlo

curl -X PATCH http://localhost:5004/api/tickets/7/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancelledBy": 11,
    "cancellationReason": "Cliente cambió de opinión, quiere otro número"
  }'
```

**Resultado:**
- Status cambia a "cancelled"
- Se registra quién canceló y por qué
- Balance de banca se restaura (cuando se implemente)

---

### Caso 8: Pagar Premio Ganador

```bash
# El sorteo corrió, ticket tiene línea ganadora, cliente viene a cobrar

# Primero verificar si ganó (esto sería un endpoint de verificación de resultados)
# Supongamos que ya se verificó y hay premio de $5600

curl -X PATCH http://localhost:5004/api/tickets/7/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paidBy": 11,
    "paymentMethod": "cash",
    "notes": "Premio pagado completo en efectivo"
  }'
```

**Resultado:**
- Status cambia a "paid"
- Se registra fecha/hora del pago
- Balance de banca se actualiza (cuando se implemente)

---

## ⚠️ Códigos de Error

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| **200** | OK - Request exitoso | GET /api/tickets/7 |
| **201** | Created - Recurso creado | POST /api/tickets |
| **400** | Bad Request - Validación falló | Campos faltantes, valores inválidos |
| **401** | Unauthorized - Token inválido/expirado | Sin token o token incorrecto |
| **404** | Not Found - Recurso no existe | Ticket, Banca, Usuario no encontrado |
| **500** | Internal Server Error - Error del servidor | Error de base de datos, excepción |

### Ejemplos de Errores

#### Error de Validación (400)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "BettingPoolId": ["El ID de la banca es requerido"],
    "Lines": ["Debe agregar al menos una línea al ticket"],
    "Lines[0].BetAmount": ["El monto de la apuesta debe ser al menos 1.00"]
  }
}
```

#### Entidad No Encontrada (404)

```json
{
  "message": "Banca con ID 999 no encontrada",
  "status": 404
}
```

#### Cutoff Time Pasado (400)

```json
{
  "message": "No se pueden crear tickets. Las ventas para el sorteo NEW YORK DAY están cerradas (cutoff: 11:50 AM)",
  "status": 400
}
```

#### Token Inválido (401)

```json
{
  "message": "Token inválido o expirado",
  "status": 401
}
```

---

## ✅ Validaciones

### Validaciones de CreateTicketDto

```
✓ BettingPoolId > 0
✓ UserId > 0
✓ Lines.Count >= 1
✓ GlobalMultiplier >= 1.00 && <= 100.00
✓ GlobalDiscount >= 0.00 && <= 100.00
✓ CustomerName max 100 caracteres
✓ CustomerPhone max 20 caracteres
✓ Notes max 500 caracteres
```

### Validaciones de CreateTicketLineDto

```
✓ DrawId > 0
✓ BetNumber no vacío, max 20 caracteres
✓ BetTypeId > 0
✓ BetAmount >= 1.00
✓ Multiplier >= 1.00 && <= 100.00
```

### Validaciones de Negocio

```
✓ BettingPool existe y está activa
✓ User existe y está activo
✓ Draw existe y está activo
✓ BetType existe
✓ Cutoff time no ha pasado (ventas abiertas)
⏳ TODO: Balance suficiente en banca
⏳ TODO: Número no bloqueado para el sorteo
⏳ TODO: No excede límites de apuesta
```

### Validaciones de CancelTicketDto

```
✓ CancelledBy > 0
✓ CancellationReason no vacío, max 500 caracteres
✓ Ticket existe
✓ Ticket no está cancelado ya
✓ Ticket no tiene premios pagados
```

### Validaciones de PayTicketDto

```
✓ PaidBy > 0
✓ PaymentMethod en ["cash", "bank_transfer", "check"]
✓ Notes max 500 caracteres
✓ Ticket existe
✓ Ticket no está cancelado
✓ Ticket tiene líneas ganadoras (isWinner = true)
✓ Balance pendiente > 0
```

---

## 📊 Ejemplos de Integración

### Ejemplo JavaScript (Frontend React)

```javascript
// servicio: ticketService.js

import api from './api';

export const ticketService = {
  // Obtener parámetros para crear ticket
  async getCreateParams() {
    return await api.get('/tickets/params/create');
  },

  // Crear ticket
  async createTicket(ticketData) {
    return await api.post('/tickets', ticketData);
  },

  // Obtener lista de tickets
  async getTickets(filters) {
    return await api.patch('/tickets', filters);
  },

  // Obtener detalle de ticket
  async getTicketById(id) {
    return await api.get(`/tickets/${id}`);
  },

  // Cancelar ticket
  async cancelTicket(id, cancelData) {
    return await api.patch(`/tickets/${id}/cancel`, cancelData);
  },

  // Pagar premio
  async payTicket(id, payData) {
    return await api.patch(`/tickets/${id}/pay`, payData);
  }
};

// Uso en componente:
const CreateTicket = () => {
  const [draws, setDraws] = useState([]);
  const [betTypes, setBetTypes] = useState([]);

  useEffect(() => {
    loadParams();
  }, []);

  const loadParams = async () => {
    const params = await ticketService.getCreateParams();
    setDraws(params.draws);
    setBetTypes(params.betTypes);
  };

  const handleSubmit = async (formData) => {
    try {
      const result = await ticketService.createTicket(formData);
      alert(`Ticket creado: ${result.ticketCode}`);
      // Imprimir ticket...
    } catch (error) {
      console.error('Error al crear ticket:', error);
      alert('Error al crear ticket');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario de ticket */}
    </form>
  );
};
```

### Ejemplo C# (Consumidor de API)

```csharp
using System.Net.Http;
using System.Text.Json;

public class TicketApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl = "http://localhost:5004/api";
    private string _token;

    public TicketApiClient(string token)
    {
        _token = token;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
    }

    public async Task<CreateTicketParamsDto> GetCreateParamsAsync()
    {
        var response = await _httpClient.GetAsync($"{_baseUrl}/tickets/params/create");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<CreateTicketParamsDto>(json);
    }

    public async Task<TicketDetailDto> CreateTicketAsync(CreateTicketDto ticketDto)
    {
        var json = JsonSerializer.Serialize(ticketDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/tickets", content);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<TicketDetailDto>(responseJson);
    }
}

// Uso:
var client = new TicketApiClient("your-token-here");
var ticket = await client.CreateTicketAsync(new CreateTicketDto {
    BettingPoolId = 9,
    UserId = 11,
    Lines = new List<CreateTicketLineDto> {
        new CreateTicketLineDto {
            DrawId = 123,
            BetNumber = "25",
            BetTypeId = 1,
            BetAmount = 100.00m,
            Multiplier = 1.00m
        }
    }
});

Console.WriteLine($"Ticket creado: {ticket.TicketCode}");
```

---

## 🔍 Próximas Funcionalidades (TODO)

Las siguientes funcionalidades están en el backlog para implementación futura:

### Validaciones de Negocio Pendientes

```
⏳ Validar balance suficiente en banca
⏳ Validar números bloqueados por sorteo
⏳ Validar límites de apuesta (betting_limits)
⏳ Calcular comisiones desde configuración de banca
⏳ Actualizar balance de banca después de crear/cancelar tickets
```

### Endpoints Adicionales

```
POST /api/tickets/{id}/reprint - Reimpresión de ticket
POST /api/tickets/{id}/check-results - Verificar resultados y calcular premios
GET  /api/tickets/by-barcode/{barcode} - Buscar por código de barras
GET  /api/tickets/stats - Estadísticas de tickets
GET  /api/tickets/{id}/history - Historial de cambios del ticket
```

### Funcionalidades Avanzadas

```
⏳ Notificaciones por email/SMS de tickets ganadores
⏳ Integración con impresora térmica (ESC/POS)
⏳ Verificación de resultados automática desde fuente externa
⏳ Exportar reportes a PDF/Excel
⏳ Dashboard de ventas en tiempo real
⏳ WebSockets para actualizaciones en vivo
```

---

## 📞 Soporte y Contacto

Para reportar problemas o solicitar nuevas funcionalidades:

1. Revisar logs de la API: `dotnet run` output
2. Verificar base de datos: Azure SQL lottery-db
3. Consultar documentación adicional en `/docs`
4. Revisar código fuente en `/api/src/LotteryApi/Controllers/TicketsController.cs`

---

## 📝 Changelog

### Version 1.0 (2025-11-20)

✅ **Implementado:**
- 7 endpoints completos (6 funcionales, 1 para pruebas)
- Validación con FluentValidation
- Cálculo automático de totales y comisiones
- Generación de ticket code y barcode
- Paginación de lista de tickets
- Filtros múltiples
- Cancelación de tickets
- Registro de pago de premios
- Verificación de cutoff time
- Audit fields (created_at, created_by, updated_at, etc.)

⏳ **Pendiente:**
- Validación de balance suficiente
- Validación de números bloqueados
- Validación de límites de apuesta
- Actualización de balance de banca
- Verificación automática de resultados
- Endpoints de reimpresión y estadísticas

---

**Documentación generada:** 2025-11-20
**API Version:** 1.0
**Autor:** Claude Code
**Status:** ✅ Producción Ready (funcionalidades core completas)
