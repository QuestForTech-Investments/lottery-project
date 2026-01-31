# Ticket Creation Reference (API)

Reference for creating tickets via the production API.

---

## API Endpoint

```
POST https://lottery-api-prod.azurewebsites.net/api/tickets
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

### Get Token

```bash
curl -s -X POST https://lottery-api-prod.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123456"}'
```

---

## Request Body

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "globalMultiplier": 1.00,
  "globalDiscount": 0.00,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 1.00,
      "multiplier": 1.00
    }
  ]
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `bettingPoolId` | int | ID de la banca (ver tabla abajo) |
| `userId` | int | ID del usuario (ver tabla abajo) |
| `lines` | array | Al menos 1 línea, máximo 100 |
| `lines[].drawId` | int | ID del sorteo |
| `lines[].betNumber` | string | **Solo dígitos, sin guiones** |
| `lines[].betTypeId` | int | ID del tipo de apuesta |
| `lines[].betAmount` | decimal | Monto (0.01 - 999,999.99) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `globalMultiplier` | decimal | 1.00 | Multiplicador global (1.00 - 100.00) |
| `globalDiscount` | decimal | 0.00 | Descuento global % (0.00 - 99.99) |
| `lines[].multiplier` | decimal | 1.00 | Multiplicador por línea |
| `customerName` | string | null | Nombre del cliente |
| `customerPhone` | string | null | Teléfono del cliente |
| `notes` | string | null | Notas (max 500 chars) |

---

## REGLA CRÍTICA: betNumber

**`betNumber` solo acepta dígitos (regex: `^[0-9]+$`). NO usar guiones, espacios ni letras.**

| Tipo de Apuesta | Correcto | Incorrecto |
|-----------------|----------|------------|
| Directo (2 dígitos) | `"25"` | `"2-5"` |
| Palé (4 dígitos) | `"2538"` | `"25-38"` |
| Tripleta (6 dígitos) | `"253842"` | `"25-38-42"` |
| Cash3 (3 dígitos) | `"123"` | `"1-2-3"` |
| Play4 (4 dígitos) | `"1234"` | `"12-34"` |
| Pick5 (5 dígitos) | `"12345"` | `"1-2-3-4-5"` |
| Singulación (1 dígito) | `"5"` | - |

---

## Bet Types (game_types)

| ID | Code | Name | Dígitos | Multiplicador Premio |
|----|------|------|---------|---------------------|
| 1 | DIRECTO | Directo | 2 | 80x |
| 2 | PALE | Palé | 4 | 600x |
| 3 | TRIPLETA | Tripleta | 6 | 8,000x |
| 4 | CASH3_STRAIGHT | Cash3 Straight | 3 | 500x |
| 5 | CASH3_BOX | Cash3 Box | 3 | 80x |
| 6 | CASH3_FRONT_STRAIGHT | Cash3 Front Straight | 3 | 250x |
| 7 | CASH3_FRONT_BOX | Cash3 Front Box | 3 | 80x |
| 8 | CASH3_BACK_STRAIGHT | Cash3 Back Straight | 3 | 250x |
| 9 | CASH3_BACK_BOX | Cash3 Back Box | 3 | 80x |
| 10 | PLAY4_STRAIGHT | Play4 Straight | 4 | 5,000x |
| 11 | PLAY4_BOX | Play4 Box | 4 | 200x |
| 12 | PICK5_STRAIGHT | Pick5 Straight | 5 | 50,000x |
| 13 | PICK5_BOX | Pick5 Box | 5 | 1,000x |
| 14 | SUPER_PALE | Super Palé | 4 | 1,200x |
| 15 | PICK2 | Pick2 | 2 | 90x |
| 16 | PICK2_FRONT | Pick2 Front | 2 | 90x |
| 17 | PICK2_BACK | Pick2 Back | 2 | 90x |
| 18 | PICK2_MIDDLE | Pick2 Middle | 2 | 90x |
| 19 | BOLITA | Bolita | 2 | 70x |
| 20 | SINGULACION | Singulación | 1 | 8x |
| 21 | PANAMA | Panamá | 4 | 5,000x |

---

## Draws (Sorteos Activos)

### USA Lotteries

| Draw ID | Draw Name | Lottery |
|---------|-----------|---------|
| 119 | FLORIDA AM | Florida Lottery |
| 120 | FLORIDA PM | Florida Lottery |
| 186 | FL PICK2 AM | Florida Lottery |
| 123 | NEW YORK DAY | New York Lottery |
| 124 | NEW YORK NIGHT | New York Lottery |
| 185 | King Lottery PM | New York Lottery |
| 121 | GEORGIA-MID AM | Georgia Lottery |
| 122 | GEORGIA EVENING | Georgia Lottery |
| 147 | GEORGIA NIGHT | Georgia Lottery |
| 130 | NEW JERSEY AM | New Jersey Lottery |
| 149 | NEW JERSEY PM | New Jersey Lottery |
| 134 | PENN MIDDAY | Pennsylvania Lottery |
| 150 | PENN EVENING | Pennsylvania Lottery |
| 125 | CALIFORNIA AM | California Lottery |
| 132 | CALIFORNIA PM | California Lottery |
| 131 | CONNECTICUT AM | Connecticut Lottery |
| 156 | CONNECTICUT PM | Connecticut Lottery |
| 129 | DELAWARE AM | Delaware Lottery |
| 152 | DELAWARE PM | Delaware Lottery |
| 133 | CHICAGO AM | Illinois Lottery |
| 155 | CHICAGO PM | Illinois Lottery |
| 135 | INDIANA MIDDAY | Indiana Lottery |
| 148 | INDIANA EVENING | Indiana Lottery |
| 144 | MARYLAND MIDDAY | Maryland Lottery |
| 157 | MARYLAND EVENING | Maryland Lottery |
| 128 | MASS AM | Massachusetts Lottery |
| 136 | MASS PM | Super Pale |
| 153 | NORTH CAROLINA AM | North Carolina Lottery |
| 166 | NORTH CAROLINA PM | North Carolina Lottery |
| 143 | SOUTH CAROLINA AM | South Carolina Lottery |
| 158 | SOUTH CAROLINA PM | South Carolina Lottery |
| 139 | TEXAS MORNING | Texas Lottery |
| 140 | TEXAS DAY | Texas Lottery |
| 141 | TEXAS EVENING | Texas Lottery |
| 145 | TEXAS NIGHT | Texas Lottery |
| 142 | VIRGINIA AM | Virginia Lottery |
| 151 | VIRGINIA PM | Virginia Lottery |

### Dominican Republic / Caribbean

| Draw ID | Draw Name | Lottery |
|---------|-----------|---------|
| 165 | NACIONAL | Lotería Nacional Dominicana |
| 127 | LOTEKA | Loteka |
| 164 | LOTEDOM | Lotedom |
| 163 | GANA MAS | Gana Más |
| 161 | LA PRIMERA | La Primera |
| 162 | LA SUERTE | La Suerte |
| 167 | REAL | Loto Real |
| 168 | LEIDSA | Super Pale |
| 126 | King Lottery AM | King Lottery |
| 159 | Anguila 10am | Anguilla Lottery |
| 160 | Anguila 1pm | Anguilla Lottery |
| 146 | Anguila 6PM | Anguilla Lottery |
| 154 | Anguila 9pm | Anguilla Lottery |

### Super Pale / Special

| Draw ID | Draw Name | Lottery |
|---------|-----------|---------|
| 177 | SUPER PALE NY-FL AM | Florida Lottery |
| 178 | SUPER PALE NY-FL PM | Lotería Electrónica PR |
| 175 | SUPER PALE TARDE | Massachusetts Lottery |
| 176 | SUPER PALE NOCHE | New York Lottery |
| 138 | QUINIELA PALE | Super Pale |

---

## Betting Pools (Bancas)

| ID | Name | Code |
|----|------|------|
| 9 | Lottobook 01 | LB-0001 |
| 28 | Lottobook 02 | LB-0002 |
| 29 | Lottobook 03 | LB-0003 |
| 30 | Lottobook 04 | LB-0004 |
| 31 | Lottobook 05 | LB-0005 |
| 32 | Lottobook 06 | LB-0006 |
| 33 | Lottobook 07 | LB-0007 |
| 34 | Lottobook 08 | LB-0008 |
| 35 | Lottobook 09 | LB-0009 |
| 36 | Lottobook 10 | LB-0010 |
| 37 | Lottobook 11 | LB-0011 |
| 38 | Lottobook 12 | LB-0012 |

## Users

| ID | Username | Name |
|----|----------|------|
| 11 | admin | Administrador |
| 43 | 009 | Usuario Banca 9 |
| 49 | LB01 | Lottobook 01 |
| 50 | LB02 | Lottobook 02 |

---

## Examples

### Ticket simple: Directo $1 en Florida AM

```bash
curl -s -X POST "$API/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [{
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 1.00
    }]
  }'
```

### Ticket con múltiples líneas

```bash
curl -s -X POST "$API/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {"drawId": 119, "betNumber": "25", "betTypeId": 1, "betAmount": 1.00},
      {"drawId": 120, "betNumber": "2538", "betTypeId": 2, "betAmount": 5.00},
      {"drawId": 123, "betNumber": "42", "betTypeId": 1, "betAmount": 10.00}
    ]
  }'
```

### Ticket con descuento global

```bash
curl -s -X POST "$API/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "globalDiscount": 10.00,
    "lines": [{
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 5.00
    }]
  }'
```

---

## Validation Rules

- `betNumber`: **Solo dígitos** (`^[0-9]+$`), max 20 chars
- `betAmount`: 0.01 - 999,999.99
- `multiplier`: 1.00 - 100.00
- `globalDiscount`: 0.00 - 99.99%
- `lines`: 1 - 100 per ticket
- Commission is calculated server-side, stored internally, but **NOT deducted from GrandTotal**

---

## Commission Behavior

- Commissions are loaded from `betting_pool_prizes_commissions` table
- They are calculated per line and stored in `commission_amount` / `commission_percentage`
- `GrandTotal = TotalWithMultiplier` (full bet amount, no deduction)
- `TotalNet = TotalWithMultiplier - TotalCommission` (internal accounting only)

---

## Delete Tickets (SQL Direct)

```bash
/opt/mssql-tools18/bin/sqlcmd \
  -S lottery-sql-1505.database.windows.net \
  -d lottery-db \
  -U lotteryAdmin -P 'NewLottery2025' -C -I -Q "
BEGIN TRANSACTION;
DELETE FROM ticket_lines WHERE ticket_id IN (SELECT ticket_id FROM tickets WHERE betting_pool_id = 9);
DELETE FROM tickets WHERE betting_pool_id = 9;
COMMIT;"
```

Replace `betting_pool_id = 9` with the target pool.
