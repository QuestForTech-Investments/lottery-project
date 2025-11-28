# API - Crear Ticket (Punto de Venta)

## Información General

**Endpoint:** `POST /api/tickets`
**Base URL:** `http://localhost:5000` (desarrollo) | `https://your-domain.com` (producción)
**Autenticación:** Bearer Token (JWT)
**Content-Type:** `application/json`

---

## Descripción

Este endpoint permite crear un nuevo ticket de lotería con múltiples líneas de apuesta (jugadas). El sistema valida automáticamente:

- ✅ Banca activa
- ✅ Usuario activo
- ✅ Sorteos disponibles y no cerrados
- ✅ Cálculos de montos, descuentos y comisiones
- ✅ Generación automática de código de ticket y código de barras

---

## Autenticación

Todas las solicitudes deben incluir un token JWT válido en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
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
  "fullName": "Administrator",
  "role": "admin"
}
```

---

## Request Body

### Estructura JSON

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "lines": [
    {
      "drawId": 1,
      "betNumber": "123",
      "betTypeId": 1,
      "betAmount": 100.00,
      "multiplier": 1.00,
      "position": null,
      "isLuckyPick": false,
      "notes": null
    }
  ],
  "globalMultiplier": 1.00,
  "globalDiscount": 0.00,
  "terminalId": "POS-001",
  "ipAddress": "192.168.1.100",
  "customerName": "Juan Pérez",
  "customerPhone": "809-555-1234",
  "customerEmail": "juan@example.com",
  "customerIdNumber": "001-1234567-8",
  "notes": "Cliente frecuente"
}
```

### Campos Requeridos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `bettingPoolId` | integer | ID de la banca donde se crea el ticket |
| `userId` | integer | ID del usuario/vendedor que crea el ticket |
| `lines` | array | Array de líneas de apuesta (mínimo 1) |

### Campos de Línea (lines)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `drawId` | integer | ✅ Sí | ID del sorteo |
| `betNumber` | string | ✅ Sí | Número apostado (máx 20 caracteres) |
| `betTypeId` | integer | ✅ Sí | ID del tipo de apuesta (Quiniela, Pale, Tripleta, etc.) |
| `betAmount` | decimal | ✅ Sí | Monto de la apuesta (0.01 - 999,999.99) |
| `multiplier` | decimal | No | Multiplicador de la línea (default: 1.00) |
| `position` | integer | No | Posición específica de la apuesta |
| `isLuckyPick` | boolean | No | Si es número de la suerte (default: false) |
| `notes` | string | No | Notas adicionales de la línea |

### Campos Opcionales del Ticket

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `globalMultiplier` | decimal | Multiplicador global (default: 1.00) |
| `globalDiscount` | decimal | Descuento global en % (default: 0.00) |
| `terminalId` | string | ID del terminal/punto de venta |
| `ipAddress` | string | Dirección IP del terminal |
| `customerName` | string | Nombre del cliente |
| `customerPhone` | string | Teléfono del cliente |
| `customerEmail` | string | Email del cliente |
| `customerIdNumber` | string | Cédula/ID del cliente |
| `notes` | string | Notas adicionales del ticket |

---

## Response Body

### Respuesta Exitosa (201 Created)

```json
{
  "ticketId": 12345,
  "ticketCode": "20251124-0001",
  "barcode": "MjAyNTExMjQtMDAwMQ==",
  "bettingPoolId": 9,
  "bettingPoolName": "Banca Admin",
  "bettingPoolCode": "RB003333",
  "userId": 11,
  "userName": "Administrator",
  "terminalId": "POS-001",
  "ipAddress": "192.168.1.100",
  "createdAt": "2025-11-24T16:30:00Z",
  "globalMultiplier": 1.00,
  "globalDiscount": 0.00,
  "currencyCode": "DOP",
  "totalLines": 3,
  "totalBetAmount": 300.00,
  "totalDiscount": 0.00,
  "totalSubtotal": 300.00,
  "totalWithMultiplier": 300.00,
  "totalCommission": 30.00,
  "totalNet": 270.00,
  "grandTotal": 270.00,
  "totalPrize": 0.00,
  "winningLines": 0,
  "status": "pending",
  "isCancelled": false,
  "cancelledAt": null,
  "isPaid": false,
  "paidAt": null,
  "customerName": "Juan Pérez",
  "customerPhone": "809-555-1234",
  "customerEmail": "juan@example.com",
  "customerIdNumber": "001-1234567-8",
  "lotteryIds": "1,2",
  "totalLotteries": 2,
  "earliestDrawTime": "2025-11-24T11:00:00Z",
  "latestDrawTime": "2025-11-24T15:00:00Z",
  "printCount": 0,
  "notes": "Cliente frecuente",
  "lines": [
    {
      "lineId": 54321,
      "ticketId": 12345,
      "lineNumber": 1,
      "lotteryId": 1,
      "lotteryName": "Lotería Nacional",
      "drawId": 1,
      "drawName": "DIARIA 11AM",
      "drawDate": "2025-11-24",
      "drawTime": "11:00:00",
      "betNumber": "123",
      "betTypeId": 1,
      "betTypeCode": "QUI",
      "betTypeName": "Quiniela",
      "position": null,
      "betAmount": 100.00,
      "multiplier": 1.00,
      "discountPercentage": 0.00,
      "discountAmount": 0.00,
      "subtotal": 100.00,
      "totalWithMultiplier": 100.00,
      "commissionPercentage": 10.00,
      "commissionAmount": 10.00,
      "netAmount": 90.00,
      "prizeMultiplier": null,
      "prizeAmount": 0.00,
      "isWinner": false,
      "winningPosition": null,
      "resultNumber": null,
      "resultCheckedAt": null,
      "lineStatus": "pending",
      "exceedsLimit": false,
      "isLuckyPick": false,
      "isHotNumber": false,
      "notes": null
    }
  ]
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Ticket Simple (1 línea)

```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 1,
        "betNumber": "456",
        "betTypeId": 1,
        "betAmount": 50.00
      }
    ],
    "terminalId": "POS-001"
  }'
```

### Ejemplo 2: Ticket Múltiple (3 líneas diferentes sorteos)

```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 1,
        "betNumber": "123",
        "betTypeId": 1,
        "betAmount": 100.00,
        "multiplier": 2.00
      },
      {
        "drawId": 2,
        "betNumber": "456",
        "betTypeId": 2,
        "betAmount": 150.00
      },
      {
        "drawId": 1,
        "betNumber": "789",
        "betTypeId": 1,
        "betAmount": 75.00
      }
    ],
    "globalDiscount": 5.00,
    "terminalId": "POS-002",
    "customerName": "María García",
    "customerPhone": "809-555-9876"
  }'
```

### Ejemplo 3: Con descuento y multiplicador global

```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 1,
        "betNumber": "100",
        "betTypeId": 1,
        "betAmount": 200.00
      },
      {
        "drawId": 1,
        "betNumber": "200",
        "betTypeId": 1,
        "betAmount": 200.00
      }
    ],
    "globalMultiplier": 2.50,
    "globalDiscount": 10.00,
    "customerName": "Pedro Martínez"
  }'
```

---

## Códigos de Error

### 400 - Bad Request

Request inválido o datos faltantes:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Lines": ["Debe incluir al menos una línea de apuesta"],
    "BettingPoolId": ["El ID de banca es requerido"]
  }
}
```

### 401 - Unauthorized

Token inválido o expirado:

```json
{
  "message": "Token inválido o expirado"
}
```

### 404 - Not Found

Banca o usuario no encontrado:

```json
{
  "message": "La banca especificada no existe"
}
```

### 422 - Unprocessable Entity

Validación de negocio fallida:

```json
{
  "message": "La banca no está activa"
}
```

```json
{
  "message": "El sorteo DIARIA 11AM ya cerró las ventas a las 10:30"
}
```

### 500 - Internal Server Error

Error del servidor:

```json
{
  "message": "Error al crear el ticket",
  "error": "Database connection failed"
}
```

---

## Reglas de Negocio

### Validaciones Automáticas

1. **Banca**
   - ✅ Debe existir en el sistema
   - ✅ Debe estar activa (`IsActive = true`)

2. **Usuario**
   - ✅ Debe existir en el sistema
   - ✅ Debe estar activo (`IsActive = true`)

3. **Sorteos (Draws)**
   - ✅ Todos los `drawId` deben existir
   - ✅ ~~No deben estar cerrados (30 min antes del sorteo)~~ *Temporalmente deshabilitado para testing*

4. **Líneas de Apuesta**
   - ✅ Mínimo 1 línea
   - ✅ Máximo 20 caracteres por número
   - ✅ Monto entre $0.01 y $999,999.99

### Cálculos Automáticos

El sistema calcula automáticamente por cada línea:

1. **Descuento**: `BetAmount * (DiscountPercentage / 100)`
2. **Subtotal**: `BetAmount - DiscountAmount`
3. **Con Multiplicador**: `Subtotal * Multiplier`
4. **Comisión**: `TotalWithMultiplier * (CommissionPercentage / 100)`
5. **Neto**: `TotalWithMultiplier - CommissionAmount`

**Porcentajes por defecto:**
- Comisión: 10%
- Descuento: 0% (o el especificado en `globalDiscount`)

### Generación Automática

1. **Código de Ticket**: Formato `YYYYMMDD-NNNN`
   - Ejemplo: `20251124-0001`
   - Secuencial por día

2. **Código de Barras**: Base64 del código de ticket
   - Ejemplo: `MjAyNTExMjQtMDAwMQ==`

3. **Timestamps**: Automáticos
   - `CreatedAt`: Fecha/hora de creación
   - `EarliestDrawTime`: Sorteo más temprano
   - `LatestDrawTime`: Sorteo más tardío

---

## Tipos de Apuesta (BetTypeId)

| ID | Código | Nombre | Longitud |
|----|--------|--------|----------|
| 1 | QUI | Quiniela | 2 dígitos |
| 2 | PAL | Pale | 2 dígitos |
| 3 | TRI | Tripleta | 3 dígitos |
| 4 | SUP | Super Pale | 2 dígitos |

*Consultar endpoint `/api/bet-types/with-fields` para lista completa*

---

## Endpoints Relacionados

### Obtener Parámetros de Creación

```bash
GET /api/tickets/params/create?bettingPoolId=9
```

Retorna sorteos disponibles, tipos de apuesta, límites y estadísticas.

### Listar Tickets

```bash
PATCH /api/tickets
Content-Type: application/json

{
  "date": "2025-11-24",
  "bettingPoolId": 9,
  "pageNumber": 1,
  "pageSize": 50
}
```

### Ver Detalle de Ticket

```bash
GET /api/tickets/{ticketId}
```

### Cancelar Ticket

```bash
PATCH /api/tickets/{ticketId}/cancel
Content-Type: application/json

{
  "cancelledBy": 11,
  "cancellationReason": "Error en el número"
}
```

*Nota: Solo dentro de 30 minutos de creación*

---

## Notas Importantes

1. **Moneda**: Todos los montos son en Pesos Dominicanos (DOP)
2. **Zona Horaria**: UTC (convertir según sea necesario)
3. **Límite de Timeout**: 30 segundos por request
4. **Rate Limiting**: 100 requests por minuto por token
5. **Transacciones**: El sistema usa transacciones de base de datos - si falla cualquier parte, todo se revierte

---

## Soporte

Para dudas o problemas técnicos:
- **Documentación API**: `http://localhost:5000/swagger`
- **Repositorio**: https://github.com/jorge-vsoftware-solutions/Lottery-Apis
- **Email**: support@lottery-api.com

---

**Última actualización**: 2025-11-24
**Versión API**: 1.0.0
**Ambiente**: Development
