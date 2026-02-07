# Guía de Creación de Tickets

## Resumen

Este documento describe cómo crear tickets en el sistema de lotería mediante la API.

---

## Endpoint

```
POST /api/tickets
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Estructura del Request

### CreateTicketDto (Body)

```json
{
  "bettingPoolId": 9,           // REQUERIDO: ID de la banca
  "userId": 1,                  // REQUERIDO: ID del usuario
  "lines": [                    // REQUERIDO: Array de jugadas (1-100)
    {
      "drawId": 119,            // REQUERIDO: ID del sorteo
      "betNumber": "45",        // REQUERIDO: Número apostado (1-20 dígitos)
      "betTypeId": 1,           // REQUERIDO: ID del tipo de jugada
      "betAmount": 2.00         // REQUERIDO: Monto de la apuesta
    }
  ],
  "globalMultiplier": 1.00,     // Opcional: Multiplicador global (default: 1.00)
  "globalDiscount": 0.00,       // Opcional: Descuento global % (default: 0.00)
  "terminalId": "TERM001",      // Opcional: ID de terminal
  "ipAddress": "192.168.1.1",   // Opcional: Dirección IP
  "customerName": "Juan Pérez", // Opcional: Nombre del cliente
  "notes": "Ticket de prueba"   // Opcional: Notas
}
```

### CreateTicketLineDto (Cada jugada)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `drawId` | int | ✅ | ID del sorteo (ej: 119 = FLORIDA AM) |
| `betNumber` | string | ✅ | Número apostado (1-20 dígitos) |
| `betTypeId` | int | ✅ | Tipo de jugada (ej: 1 = Directo) |
| `betAmount` | decimal | ✅ | Monto (0.01 - 999,999.99) |
| `multiplier` | decimal | ❌ | Multiplicador línea (default: 1.00) |
| `position` | int | ❌ | Posición (opcional) |
| `isLuckyPick` | bool | ❌ | Selección aleatoria (default: false) |

---

## IDs de Referencia

### Sorteos (DrawId)

| DrawId | Nombre | Lotería |
|--------|--------|---------|
| 119 | FLORIDA AM | Florida Lottery |
| 120 | FLORIDA PM | Florida Lottery |
| 123 | NEW YORK DAY | New York Lottery |
| 124 | NEW YORK NIGHT | New York Lottery |
| 127 | LOTEKA | Loteka |
| 161 | LA PRIMERA | La Primera |
| 162 | LA SUERTE | La Suerte |
| 163 | GANA MAS | Gana Más |
| 164 | LOTEDOM | Lotedom |
| 165 | NACIONAL | Lotería Nacional Dominicana |
| 167 | REAL | Loto Real |

### Tipos de Jugada (BetTypeId)

| BetTypeId | Código | Nombre |
|-----------|--------|--------|
| 1 | DIRECTO | Directo |
| 2 | PALÉ | Palé |
| 3 | TRIPLETA | Tripleta |
| 4 | CASH3_STRAIGHT | Cash3 Straight |
| 5 | CASH3_BOX | Cash3 Box |
| 6 | PLAY4_STRAIGHT | Play4 Straight |
| 7 | PLAY4_BOX | Play4 Box |
| 9 | SUPER_PALE | Super Pale |
| 25 | BOLITA 1 | Bolita 1 |
| 26 | BOLITA 2 | Bolita 2 |

### Bancas (BettingPoolId)

| BettingPoolId | Código | Nombre |
|---------------|--------|--------|
| 9 | LB-0001 | Lottobook 01 |
| 28 | LAN-0001 | LA CENTRAL 01 |

---

## Ejemplo Completo

### Request

```bash
curl -X POST "http://localhost:5000/api/tickets" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "userId": 1,
    "lines": [
      {
        "drawId": 119,
        "betNumber": "45",
        "betTypeId": 1,
        "betAmount": 2.00
      },
      {
        "drawId": 119,
        "betNumber": "48",
        "betTypeId": 1,
        "betAmount": 2.00
      },
      {
        "drawId": 163,
        "betNumber": "45",
        "betTypeId": 1,
        "betAmount": 2.00
      }
    ]
  }'
```

### Response (Success - 201 Created)

```json
{
  "ticketId": 12345,
  "ticketCode": "EA-LB-0001-000000001",
  "barcode": "738199870546",
  "bettingPoolId": 9,
  "bettingPoolName": "Lottobook 01",
  "userId": 1,
  "createdAt": "2026-02-01T12:30:00Z",
  "totalLines": 3,
  "totalBetAmount": 6.00,
  "totalCommission": 1.44,
  "totalNet": 4.56,
  "grandTotal": 6.00,
  "status": "pending",
  "ticketState": "P",
  "lines": [
    {
      "lineId": 1,
      "drawId": 119,
      "drawName": "FLORIDA AM",
      "betNumber": "45",
      "betTypeId": 1,
      "betTypeName": "Directo",
      "betAmount": 2.00,
      "commissionPercentage": 24.00,
      "commissionAmount": 0.48,
      "netAmount": 1.52,
      "lineStatus": "pending"
    }
  ]
}
```

---

## Cálculos Automáticos

El servidor calcula automáticamente:

1. **Por línea:**
   - `discountAmount` = betAmount × (globalDiscount / 100)
   - `subtotal` = betAmount - discountAmount
   - `totalWithMultiplier` = subtotal × multiplier
   - `commissionAmount` = totalWithMultiplier × (commissionPercentage / 100)
   - `netAmount` = totalWithMultiplier - commissionAmount

2. **Por ticket:**
   - `totalBetAmount` = Σ(betAmount)
   - `totalCommission` = Σ(commissionAmount)
   - `totalNet` = Σ(netAmount)
   - `grandTotal` = totalWithMultiplier

---

## Validaciones

| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| bettingPoolId | > 0 | "El ID de banca es requerido" |
| userId | > 0 | "El ID de usuario es requerido" |
| lines | 1-100 items | "Debe incluir al menos una línea" |
| betNumber | 1-20 dígitos | "Solo dígitos, 1-20 caracteres" |
| betAmount | 0.01 - 999,999.99 | Rango inválido |
| ipAddress | IPv4/IPv6 válido | "IP no tiene formato válido" |

---

## Errores Comunes

| Código HTTP | Escenario |
|-------------|-----------|
| 400 | Validación falló o apuestas exceden límites |
| 401 | Token de autenticación inválido/expirado |
| 404 | Banca, usuario o sorteo no existe |
| 422 | Violación de regla de negocio (usuario inactivo, sorteo cerrado) |

---

## Obtener Token de Autenticación

```bash
TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123456"}' | jq -r '.token')

echo $TOKEN
```

---

## Archivos de Referencia

- **Controller:** `/api/src/LotteryApi/Controllers/TicketsController.cs`
- **DTOs:** `/api/src/LotteryApi/DTOs/TicketDto.cs`
- **Modelo:** `/api/src/LotteryApi/Models/Ticket.cs`
- **Validadores:** `/api/src/LotteryApi/Validators/CreateTicketDtoValidator.cs`

---

## Script de Ejemplo: Copiar Ticket desde App Original

```javascript
// Datos extraídos de la app original (GILBERTO - LAN-010-000061189)
const ticketData = {
  bettingPoolId: 9,  // Lottobook 01
  userId: 1,
  lines: [
    // FLORIDA AM
    { drawId: 119, betNumber: "45", betTypeId: 1, betAmount: 2.00 },
    { drawId: 119, betNumber: "48", betTypeId: 1, betAmount: 2.00 },
    { drawId: 119, betNumber: "49", betTypeId: 1, betAmount: 2.00 },
    { drawId: 119, betNumber: "74", betTypeId: 1, betAmount: 2.00 },
    { drawId: 119, betNumber: "12", betTypeId: 1, betAmount: 2.00 },
    // GANA MAS
    { drawId: 163, betNumber: "45", betTypeId: 1, betAmount: 2.00 },
    { drawId: 163, betNumber: "48", betTypeId: 1, betAmount: 2.00 },
    { drawId: 163, betNumber: "49", betTypeId: 1, betAmount: 2.00 },
    { drawId: 163, betNumber: "74", betTypeId: 1, betAmount: 2.00 },
    { drawId: 163, betNumber: "12", betTypeId: 1, betAmount: 2.00 }
  ]
};

// Crear ticket via API
fetch('http://localhost:5000/api/tickets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(ticketData)
});
```

---

**Última actualización:** 2026-02-01
