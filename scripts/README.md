# Scripts de Extracción - Lottery Project

Scripts para extraer datos de la aplicación original (la-numbers.apk.lol) usando Playwright.

## Requisitos

```bash
cd frontend-v4
npm install playwright
npx playwright install chromium
```

## Scripts Disponibles

### extract-sales-original.js

Extrae datos de ventas diarias desde la página "Ventas del día".

#### Uso

```bash
# Extraer ventas de ayer (recomendado - usa botón incorporado)
node extract-sales-original.js --yesterday

# Extraer ventas de una fecha específica
node extract-sales-original.js -d 01/02/2026

# Filtrar por banca específica
node extract-sales-original.js --yesterday --banca GILBERTO

# Guardar resultado en archivo
node extract-sales-original.js --yesterday -o ventas.json

# Con screenshot
node extract-sales-original.js --yesterday --screenshot

# Ver navegador (debug)
node extract-sales-original.js --yesterday --no-headless
```

#### Opciones

| Opción | Alias | Descripción |
|--------|-------|-------------|
| `--yesterday` | | Extraer ventas de ayer (recomendado) |
| `--date` | `-d` | Fecha en formato DD/MM/YYYY |
| `--banca` | `-b` | Filtrar por nombre de banca (opcional) |
| `--output` | `-o` | Archivo de salida JSON (opcional) |
| `--screenshot` | | Tomar screenshot de los resultados |
| `--no-headless` | | Mostrar navegador (útil para debug) |
| `--help` | `-h` | Mostrar ayuda |

#### Salida JSON

```json
{
  "date": "02/01/2026",
  "extractedAt": "2026-02-02T09:29:46.352Z",
  "totals": {
    "pending": 5,
    "losers": 273,
    "winners": 25,
    "totalTickets": 303,
    "sales": 4324.20,
    "commissions": 918.96,
    "prizes": 5295.00,
    "net": -1889.76
  },
  "bancas": [
    {
      "ref": "GILBERTO TL",
      "code": "LAN-0010",
      "bettingPoolId": 37,
      "pending": 0,
      "losers": 45,
      "winners": 3,
      "totalTickets": 48,
      "sales": 632.00,
      "commissions": 151.68,
      "discounts": 0.00,
      "prizes": 176.00,
      "net": 304.32,
      "drop": 0.00,
      "final": 304.32,
      "balance": -493.64,
      "accumulatedDrop": -1139.44
    }
  ]
}
```

## Mapeo de Bancas

| Original (LAN-XXXX) | Nuestro Sistema (LB-XXXX) | Ref | bettingPoolId |
|---------------------|---------------------------|-----|---------------|
| LAN-0010 | LB-0001 (Lottobook 01) | GILBERTO TL | 37 |
| LAN-0016 | TBD | DOS CHICAS TL | 43 |
| LAN-0048 | TBD | PAPU TL | 75 |
| LAN-0021 | TBD | DANIELA SALON TL | 48 |
| LAN-0063 | TBD | FELO TL | 90 |

## Flujo de Trabajo

### 1. Extraer ventas del día anterior

```bash
cd /home/jorge/projects/lottery-project/scripts
node extract-sales-original.js --yesterday -o /tmp/sales-yesterday.json
```

### 2. Filtrar por banca específica

```bash
# Solo GILBERTO
node extract-sales-original.js --yesterday --banca GILBERTO

# Ver datos en JSON
cat /tmp/sales-yesterday.json | jq '.bancas[] | select(.code == "LAN-0010")'
```

### 3. Comparar con nuestro sistema

Los totales de ventas, tickets y premios deben coincidir entre sistemas.

## Credenciales

Las credenciales están en el script:
- Usuario: `oliver`
- Contraseña: `oliver0597@`

## Notas Técnicas

### Página "Ventas del día"
- URL: `https://la-numbers.apk.lol/#/sales/daily`
- Botón "PROCESAR VENTAS DE AYER" carga datos del día anterior
- Los links incluyen `bettingPoolId` para identificar cada banca

### Formato de Fecha
- La app usa formato DD/MM/YYYY en la interfaz
- El campo de fecha muestra MM/DD/YYYY internamente

### Columnas de la Tabla

| Columna | Descripción |
|---------|-------------|
| Ref. | Nombre de referencia de la banca |
| Código | Código único (LAN-XXXX) |
| P | Tickets pendientes |
| L | Tickets perdedores |
| W | Tickets ganadores |
| Total | Total de tickets |
| Venta | Monto total de ventas |
| Comisiones | Comisiones pagadas |
| Descuentos | Descuentos aplicados |
| Premios | Premios pagados |
| Neto | Venta - Comisiones - Premios |
| Caída | Caída del día |
| Final | Neto final |
| Balance | Balance de la banca |
| Caída acumulada | Caída acumulada histórica |

### Diálogos Manejados

El script maneja automáticamente:
- Diálogo de confirmación SweetAlert2 ("¿Está seguro de procesar?")
- Diálogos de notificaciones ("Nuevas notificaciones")
- Popups de resultados faltantes

## Troubleshooting

### El script no puede hacer login
- Verificar que las credenciales sean correctas
- Usar `--no-headless` para ver qué está pasando
- Revisar screenshot en `.playwright-mcp/extraction-error.png`

### Diálogos interfieren con la extracción
- El script cierra automáticamente diálogos comunes
- Si hay un nuevo tipo de diálogo, agregar el selector a la lista

### La tabla está vacía
- Verificar que hay ventas para esa fecha
- Usar `--screenshot` para ver el estado de la página

## Ejemplo de Salida Real (01/02/2026)

```
=== SUMMARY ===
Date: 02/01/2026
Total Bancas: 20
Total Tickets: 303
  - Pending: 5
  - Losers: 273
  - Winners: 25
Total Sales: $4324.20
Total Commissions: $918.96
Total Prizes: $5295.00
Net: $-1889.76

Bancas:
  1. GILBERTO TL (LAN-0010): 48 tickets, $632.00 sales, $176.00 prizes
  2. DOS CHICAS TL (LAN-0016): 29 tickets, $221.00 sales, $188.00 prizes
  3. PAPU TL (LAN-0048): 6 tickets, $148.00 sales, $560.00 prizes
  ...
```

---

### extract-ticket-details.js

Extrae detalles de un ticket específico incluyendo todas las jugadas.

#### Uso

```bash
# Extraer detalles de un ticket de ayer
node extract-ticket-details.js -t LAN-010-000061158 --yesterday

# Extraer detalles de un ticket de una fecha específica
node extract-ticket-details.js -t LAN-010-000061158 -d 01/02/2026

# Guardar resultado en archivo
node extract-ticket-details.js -t LAN-010-000061158 --yesterday -o /tmp/ticket.json

# Con screenshot
node extract-ticket-details.js -t LAN-010-000061158 --yesterday --screenshot

# Ver navegador (debug)
node extract-ticket-details.js -t LAN-010-000061158 --yesterday --no-headless
```

#### Opciones

| Opción | Alias | Descripción |
|--------|-------|-------------|
| `--ticket` | `-t` | Código del ticket (e.g., LAN-010-000061158) |
| `--date` | `-d` | Fecha en formato DD/MM/YYYY |
| `--yesterday` | | Usar la fecha de ayer |
| `--output` | `-o` | Archivo de salida JSON (opcional) |
| `--screenshot` | | Tomar screenshot del ticket expandido |
| `--no-headless` | | Mostrar navegador (útil para debug) |
| `--help` | `-h` | Mostrar ayuda |

#### Formato de Código de Ticket

El código de ticket tiene el formato `LAN-XXX-XXXXXXXXX`:
- `LAN` - Prefijo fijo
- `XXX` - Código de banca (3 dígitos, e.g., 010)
- `XXXXXXXXX` - Número de ticket (9 dígitos)

Ejemplo: `LAN-010-000061158`

#### Salida JSON

```json
{
  "ticketCode": "LAN-010-000061158",
  "date": "01/02/2026",
  "extractedAt": "2026-02-02T09:38:53.172Z",
  "ticket": {
    "code": "LAN-010-000061158",
    "internalId": "E7",
    "magicNumber": "2FFFD21519E3BAD2FEFEBD52B217651A",
    "ipAddress": "198.56.58.238",
    "totalAmount": 10,
    "pendingPayment": 0,
    "totalPrizes": 112,
    "status": "Pagado",
    "draws": [
      {
        "name": "Anguila 10am",
        "plays": [
          {
            "number": "01",
            "type": "Directo",
            "amount": "$2.00",
            "prize": null,
            "isWinner": false
          },
          {
            "number": "47",
            "type": "Directo",
            "amount": "$2.00",
            "prize": "$112.00",
            "isWinner": true,
            "paidBy": "010",
            "paidAt": "02/01/2026 09:24 AM"
          }
        ]
      }
    ]
  },
  "error": null
}
```

#### Campos del Ticket

| Campo | Descripción |
|-------|-------------|
| `code` | Código completo del ticket |
| `internalId` | ID interno (2 caracteres hex) |
| `magicNumber` | Hash de verificación (32 caracteres) |
| `ipAddress` | IP desde donde se creó el ticket |
| `totalAmount` | Monto total apostado |
| `pendingPayment` | Premios pendientes de pago |
| `totalPrizes` | Total de premios ganados |
| `status` | Estado: Pagado, Pendiente, Perdedor, Ganador, Cancelado |
| `draws` | Array de sorteos con sus jugadas |

#### Campos de cada Jugada

| Campo | Descripción |
|-------|-------------|
| `number` | Número apostado (e.g., "47", "01-47") |
| `type` | Tipo de jugada: Directo, Pale, Tripleta, Super Pale |
| `amount` | Monto apostado |
| `prize` | Premio ganado (null si perdedor) |
| `isWinner` | true si la jugada ganó |
| `paidBy` | Código del usuario que pagó el premio |
| `paidAt` | Fecha/hora del pago |

#### Ejemplo de Salida en Consola

```
=== TICKET SUMMARY ===
Ticket: LAN-010-000061158
Internal ID: E7
Status: Pagado
Total Amount: $10.00
Total Prizes: $112.00
Magic Number: 2FFFD21519E3BAD2FEFEBD52B217651A

Draws (1):
  Anguila 10am:
    - 6 plays (1 winners, 5 losers)
      01 (Directo): $2.00 → - ✗
      47 (Directo): $2.00 → $112.00 ✓ WINNER
      48 (Directo): $2.00 → - ✗
      11 (Directo): $2.00 → - ✗
      01-11 (Pale): $1.00 → - ✗
      01-47 (Pale): $1.00 → - ✗
```

---

## Mapeo Completo de Bancas

| Original (LAN-XXXX) | bettingPoolId | Ref |
|---------------------|---------------|-----|
| LAN-0010 | 37 | GILBERTO TL |
| LAN-0016 | 43 | DOS CHICAS TL |
| LAN-0021 | 48 | DANIELA SALON TL |
| LAN-0048 | 75 | PAPU TL |
| LAN-0063 | 90 | FELO TL |
| LAN-0119 | 153 | EUDDY (GF) |
| LAN-0135 | 169 | MORENA D (GF) |
| LAN-0182 | 216 | TONA (GF) |
| LAN-0186 | 220 | BOB BALATA (GF) |
| LAN-0194 | 228 | HAITI (GF) |
| LAN-0201 | 236 | CLOTILDE (GF) |
| LAN-0203 | 253 | IVAN (GF) |
| LAN-0230 | 317 | YAN (GF) |
| LAN-0254 | 6848 | DENIS (GF) |
| LAN-0278 | 11093 | MARINA (GF) |
| LAN-0284 | 11099 | YEIMY (GF) |
| LAN-0300 | 11115 | NATIVIDAD (GF) |
| LAN-0316 | 16274 | GALÁN (GF) |
| LAN-0318 | 16276 | ESTEFANY (GF) |
| LAN-0333 | 16815 | ALEJANDRO (GF) |
