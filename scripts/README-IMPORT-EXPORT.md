# Importacion/Exportacion de Tickets - Documentacion

## Problema Identificado (2026-02-03)

### Causa Raiz
El script `import-tickets-csv.js` asignaba TODAS las jugadas a un solo sorteo (el primer sorteo activo, que era FLORIDA AM), cuando en realidad cada jugada pertenece a un sorteo diferente.

Esto causaba:
- Premios incorrectos: $6,516 vs $176 reales
- Jugadas que perdieron en su sorteo original aparecian como ganadoras al compararse contra FLORIDA AM

### Estructura de la API Original

La API de `la-numbers.apk.lol` retorna las jugadas agrupadas por sorteo:

```json
{
  "ticket": { "code": "LAN-010-000061156", ... },
  "plays": {
    "162": [  // drawId = 162 (LA SUERTE)
      { "numbers": "24", "playType": {"description": "Directo"}, "amount": "$1.00" }
    ],
    "159": [  // drawId = 159 (Anguila 10am)
      { "numbers": "47", "playType": {"description": "Directo"}, "amount": "$2.00" }
    ]
  }
}
```

### Mapeo de Sorteos (drawId -> nombre)

| drawId | Nombre en Original | draw_id en Nuestra DB |
|--------|-------------------|----------------------|
| 10 | Anguila 10am | 159 |
| 11 | LA PRIMERA | ? |
| 12 | LA SUERTE | 162 |
| 13 | LOTEDOM | 164 |
| 14 | King Lottery AM | ? |
| 119 | FLORIDA AM | 119 |

## Scripts Disponibles

### export-tickets-csv.js
Exporta tickets de la app original a CSV.

**Uso:**
```bash
node export-tickets-csv.js --yesterday --banca LAN-0010 -o tickets.csv
node export-tickets-csv.js -d 01/02/2026 -o tickets-feb01.csv
```

**IMPORTANTE:** Ahora incluye el sorteo en el formato:
```
numero:tipo:monto:sorteo
```

### import-tickets-csv.js
Importa tickets desde CSV a nuestra base de datos.

**Uso:**
```bash
node import-tickets-csv.js -i tickets.csv --dry-run
node import-tickets-csv.js -i tickets.csv
```

**IMPORTANTE:** El script debe mapear el nombre del sorteo al draw_id correcto.

## Bancas Mapeadas

| Codigo Original | Nombre | bettingPoolId Original | bettingPoolId Nuestro |
|-----------------|--------|------------------------|----------------------|
| LAN-0010 | GILBERTO TL | 37 | 28 (Lottobook 02) |
| LAN-0016 | DOS CHICAS TL | 43 | ? |
| LAN-0021 | DANIELA SALON TL | 48 | ? |

## Datos de Prueba - GILBERTO TL (Feb 1, 2026)

### Sistema Original
- Ventas: $632.00
- Premios: $176.00
- Tickets ganadores: 3

### Tickets Ganadores Detalle

| Ticket | Sorteo | Numero | Tipo | Apuesta | Premio | Posicion |
|--------|--------|--------|------|---------|--------|----------|
| LAN-010-000061156 | LA SUERTE | 24 | Directo | $1.00 | $56.00 | 1ra (56x) |
| LAN-010-000061158 | Anguila 10am | 47 | Directo | $2.00 | $112.00 | 1ra (56x) |
| LAN-010-000061171 | LOTEDOM | 33 | Directo | $2.00 | $8.00 | 3ra (4x) |

## Historial de Cambios

### 2026-02-03
- Identificado problema de sorteo incorrecto en importacion
- Reseteados premios de tickets importados del 2026-02-01 a $0.00
- Documentado el mapeo de sorteos de la API original
- Pendiente: Modificar export-tickets-csv.js para incluir sorteo
