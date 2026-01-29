# Manual de Cálculo de Premios

Este documento describe cómo se calculan los premios para cada tipo de apuesta en el sistema de lotería.

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Loterías Dominicanas](#loterías-dominicanas)
3. [Loterías USA](#loterías-usa)
4. [DisplayOrder y Posiciones](#displayorder-y-posiciones)
5. [Configuración de Bancas](#configuración-de-bancas)
6. [Ejemplos de Cálculo](#ejemplos-de-cálculo)

---

## Arquitectura General

### Flujo de Cálculo

```
Resultado publicado → ProcessTicketsForDrawAsync() → GetWinningPosition() → CalculatePrizeAsync()
```

1. **Resultado publicado**: El administrador ingresa el resultado (num1, num2, num3)
2. **Procesamiento**: El sistema busca tickets pendientes para ese sorteo
3. **Verificación**: Para cada línea, determina si ganó y en qué posición
4. **Cálculo**: Multiplica el monto apostado por el multiplicador según la posición

### Tablas Involucradas

| Tabla | Descripción |
|-------|-------------|
| `bet_types` | Tipos de apuesta (Directo, Palé, Tripleta, etc.) |
| `prize_types` | Premios por tipo de apuesta y posición (DisplayOrder) |
| `banca_prize_configs` | Configuración personalizada de premios por banca |
| `ticket_lines` | Líneas de apuesta (donde se registra si ganó) |

### Fórmula Base

```
Premio = Monto Apostado × Multiplicador
```

Donde el **Multiplicador** se obtiene de:
1. `banca_prize_configs.custom_value` (si existe configuración personalizada)
2. `prize_types.default_multiplier` (valor por defecto)

---

## Loterías Dominicanas

### Formato de Resultado

Un resultado dominicano tiene la estructura:
```
AABBCC
  ↓
AA = 1ra posición (num1)
BB = 2da posición (num2)
CC = 3ra posición (num3)
```

**Ejemplo**: Resultado `889475`
- 1ra: `88`
- 2da: `94`
- 3ra: `75`

### QUINIELA / DIRECTO

**Descripción**: Acierto de 2 dígitos en cualquier posición.

| Posición | Nombre | DisplayOrder | Multiplicador |
|----------|--------|--------------|---------------|
| 1ra | Primer Pago | 1 | 56x |
| 2da | Segundo Pago | 2 | 12x |
| 3ra | Tercer Pago | 3 | 4x |

**Ejemplo**: Apuesta `88` con $10
- Si sale en 1ra → $10 × 56 = $560
- Si sale en 2da → $10 × 12 = $120
- Si sale en 3ra → $10 × 4 = $40

**Código**: `GetDirectoPosition()`
```csharp
if (betNumber == num1) return 1;  // 1ra
if (betNumber == num2) return 2;  // 2da
if (betNumber == num3) return 3;  // 3ra
return 0;  // No ganó
```

### PALÉ

**Descripción**: Acierto de 2 números (4 dígitos) en cualquier orden.

| Combinación | DisplayOrder | Multiplicador |
|-------------|--------------|---------------|
| 1ra + 2da | 2 | 1000x - 1100x |
| 1ra + 3ra | 3 | 1000x - 1100x |
| 2da + 3ra | 4 | 100x |

**IMPORTANTE**: La combinación 2da + 3ra paga **10 veces menos** que las otras.

**Ejemplo**: Resultado `889475`
- Apuesta `8894` (1ra+2da) → DisplayOrder 2 → Premio mayor
- Apuesta `8875` (1ra+3ra) → DisplayOrder 3 → Premio mayor
- Apuesta `9475` (2da+3ra) → DisplayOrder 4 → Premio menor (100x)

**Código**: `GetPalePosition()`
```csharp
var hasNum1 = (betFirst == num1 || betSecond == num1);
var hasNum2 = (betFirst == num2 || betSecond == num2);
var hasNum3 = (betFirst == num3 || betSecond == num3);

if (hasNum1 && hasNum2) return 2;  // 1ra + 2da
if (hasNum1 && hasNum3) return 3;  // 1ra + 3ra
if (hasNum2 && hasNum3) return 4;  // 2da + 3ra (premio menor)
return 0;
```

### TRIPLETA

**Descripción**: Acierto de 3 números (6 dígitos) en cualquier orden.

| Aciertos | DisplayOrder | Multiplicador |
|----------|--------------|---------------|
| 3 de 3 | 1 | 10000x - 20000x |
| 2 de 3 | 2 | 100x |

**Ejemplo**: Resultado `889475`, Apuesta `889475`
- Si aciertas los 3: DisplayOrder 1 → Premio completo
- Si aciertas 2 de 3: DisplayOrder 2 → Premio parcial (100x)

**Código**: `GetTripletaPosition()`
```csharp
var matchCount = betNums.Count(b => winNums.Contains(b));

if (matchCount == 3) return 1;  // Premio completo
if (matchCount == 2) return 2;  // Premio parcial
return 0;
```

### PULITO

**Descripción**: Acierto del último dígito del número en cualquier posición.

| Posición | DisplayOrder | Multiplicador |
|----------|--------------|---------------|
| 1ra | 1 | ~5x |
| 2da | 2 | ~3x |
| 3ra | 3 | ~2x |

**Ejemplo**: Resultado `889475`, Apuesta `8` (pulito)
- `88` termina en `8` → Gana en 1ra
- `94` no termina en `8`
- `75` no termina en `8`

**Código**: `GetPulitoPosition()`
```csharp
if (num1.EndsWith(betNumber)) return 1;
if (num2.EndsWith(betNumber)) return 2;
if (num3.EndsWith(betNumber)) return 3;
return 0;
```

### SUPER PALÉ

**Descripción**: Combinación de números entre dos loterías diferentes.

**Estado actual**: Implementación parcial (verifica posiciones 1 y 3 del mismo sorteo).

**TODO**: Implementar verificación cruzada entre dos sorteos diferentes.

---

## Loterías USA

### Formato de Resultado

Para loterías USA, se usa el campo `AdditionalNumber`:
```
AAABBBBBCCCCC
AAA    = Cash3 (3 dígitos)
BBBB   = Play4 (4 dígitos)
CCCCC  = Pick5 (5 dígitos)
```

### Pick 3 / Cash 3 (Straight)

**Descripción**: Acierto exacto de 3 dígitos.

| Tipo | Multiplicador |
|------|---------------|
| Straight | 500x |

### Pick 3 / Cash 3 (Box)

**Descripción**: Los 3 dígitos en cualquier orden.

| Variante | Multiplicador | Condición |
|----------|---------------|-----------|
| 6-Way | 80x | 3 dígitos diferentes |
| 3-Way | 160x | 2 dígitos iguales |

**Fórmula**:
- Si los 3 dígitos son diferentes: 500 / 6 ≈ 80x
- Si hay 2 dígitos iguales: 500 / 3 ≈ 160x

### Pick 4 / Play 4 (Straight)

| Tipo | Multiplicador |
|------|---------------|
| Straight | 5000x |

### Pick 4 / Play 4 (Box)

| Variante | Multiplicador | Permutaciones |
|----------|---------------|---------------|
| 24-Way | 200x | ABCD |
| 12-Way | 400x | AABC |
| 6-Way | 800x | AABB |
| 4-Way | 1250x | AAAB |

### Pick 5

| Tipo | Multiplicador |
|------|---------------|
| Straight | 50000x |

---

## DisplayOrder y Posiciones

El campo `DisplayOrder` en la tabla `prize_types` determina el premio según la posición ganadora:

### Para Quiniela/Directo:
```
DisplayOrder 1 = 1ra posición (premio mayor)
DisplayOrder 2 = 2da posición (premio medio)
DisplayOrder 3 = 3ra posición (premio menor)
```

### Para Palé:
```
DisplayOrder 2 = 1ra + 2da (premio mayor)
DisplayOrder 3 = 1ra + 3ra (premio mayor)
DisplayOrder 4 = 2da + 3ra (premio menor - ¡IMPORTANTE!)
```

### Para Tripleta:
```
DisplayOrder 1 = 3 aciertos (premio completo)
DisplayOrder 2 = 2 de 3 aciertos (premio parcial)
```

### Consulta SQL para ver premios:

```sql
SELECT
    bt.code AS bet_type,
    pt.name AS prize_name,
    pt.display_order,
    pt.default_multiplier
FROM prize_types pt
JOIN bet_types bt ON pt.bet_type_id = bt.bet_type_id
WHERE bt.is_active = 1
ORDER BY bt.code, pt.display_order;
```

---

## Configuración de Bancas

Cada banca puede tener multiplicadores personalizados que sobrescriben los valores por defecto.

### Tabla: `banca_prize_configs`

```sql
SELECT
    bp.betting_pool_id,
    b.name AS banca_name,
    bt.code AS bet_type,
    pt.name AS prize_name,
    bp.custom_value AS multiplicador_personalizado,
    pt.default_multiplier AS multiplicador_default
FROM banca_prize_configs bp
JOIN betting_pools b ON bp.betting_pool_id = b.betting_pool_id
JOIN prize_types pt ON bp.prize_type_id = pt.prize_type_id
JOIN bet_types bt ON pt.bet_type_id = bt.bet_type_id
WHERE bp.betting_pool_id = @bancaId;
```

### Prioridad de Multiplicadores

1. **banca_prize_configs.custom_value** (si existe)
2. **prize_types.default_multiplier** (fallback)

---

## Ejemplos de Cálculo

### Ejemplo 1: Quiniela en 1ra

```
Resultado: 889475 (1ra=88, 2da=94, 3ra=75)
Apuesta: Número 88, Monto $100, Tipo: Directo

Paso 1: GetDirectoPosition("88", "88", "94", "75")
        → betNumber == num1 → return 1 (1ra posición)

Paso 2: CalculatePrizeAsync(line, position=1)
        → Busca prize_types WHERE bet_type_id=DIRECTO AND display_order=1
        → Multiplicador = 56

Paso 3: Premio = $100 × 56 = $5,600
```

### Ejemplo 2: Palé 2da+3ra

```
Resultado: 889475 (1ra=88, 2da=94, 3ra=75)
Apuesta: Número 9475, Monto $10, Tipo: Palé

Paso 1: GetPalePosition("9475", "88", "94", "75")
        betFirst = "94", betSecond = "75"
        hasNum1 = false (ni 94 ni 75 es 88)
        hasNum2 = true (94 == 94)
        hasNum3 = true (75 == 75)
        → hasNum2 && hasNum3 → return 4 (2da+3ra)

Paso 2: CalculatePrizeAsync(line, position=4)
        → Busca prize_types WHERE bet_type_id=PALE AND display_order=4
        → Multiplicador = 100 (premio menor)

Paso 3: Premio = $10 × 100 = $1,000

NOTA: Si hubiera sido 8894 (1ra+2da), el multiplicador sería ~1100
      Premio = $10 × 1100 = $11,000
```

### Ejemplo 3: Tripleta Parcial

```
Resultado: 889475 (1ra=88, 2da=94, 3ra=75)
Apuesta: Número 889412, Monto $5, Tipo: Tripleta

Paso 1: GetTripletaPosition("889412", "88", "94", "75")
        betNums = ["88", "94", "12"]
        winNums = ["88", "94", "75"]
        matchCount = 2 (88 y 94 coinciden, 12 no)
        → matchCount == 2 → return 2 (premio parcial)

Paso 2: CalculatePrizeAsync(line, position=2)
        → Busca prize_types WHERE bet_type_id=TRIPLETA AND display_order=2
        → Multiplicador = 100

Paso 3: Premio = $5 × 100 = $500

NOTA: Si hubiera sido 889475 (3 aciertos), multiplicador ~20000
      Premio = $5 × 20000 = $100,000
```

---

## Archivo de Servicio Principal

**Ubicación**: `api/src/LotteryApi/Services/ExternalResults/ExternalResultsService.cs`

### Métodos Clave:

| Método | Descripción |
|--------|-------------|
| `GetWinningPosition()` | Determina si ganó y en qué posición |
| `GetDirectoPosition()` | Posición para apuestas Directo |
| `GetPalePosition()` | Posición para apuestas Palé |
| `GetTripletaPosition()` | Posición para apuestas Tripleta |
| `GetPulitoPosition()` | Posición para apuestas Pulito |
| `CalculatePrizeAsync()` | Calcula el premio basado en la posición |

---

## Resumen de Multiplicadores

| Tipo de Apuesta | DisplayOrder | Posición/Combinación | Multiplicador Típico |
|-----------------|--------------|----------------------|---------------------|
| Directo | 1 | 1ra | 56x |
| Directo | 2 | 2da | 12x |
| Directo | 3 | 3ra | 4x |
| Palé | 2 | 1ra + 2da | 1000x - 1100x |
| Palé | 3 | 1ra + 3ra | 1000x - 1100x |
| Palé | 4 | 2da + 3ra | 100x |
| Tripleta | 1 | 3 aciertos | 10000x - 20000x |
| Tripleta | 2 | 2 aciertos | 100x |
| Pulito | 1 | 1ra | 5x |
| Pulito | 2 | 2da | 3x |
| Pulito | 3 | 3ra | 2x |

---

## TEST CASES PARA VALIDACIÓN DE PREMIOS

Esta sección contiene todos los casos de prueba necesarios para validar que el cálculo de premios funciona correctamente.

### TEST CASES: DIRECTO

| # | Número Apostado | Resultado (1ª-2ª-3ª) | Monto | Posición | Multiplicador | Premio Esperado |
|---|-----------------|----------------------|-------|----------|---------------|-----------------|
| D1 | 45 | 45-23-78 | $10 | 1ª | 56x | $560 |
| D2 | 23 | 45-23-78 | $10 | 2ª | 12x | $120 |
| D3 | 78 | 45-23-78 | $10 | 3ª | 4x | $40 |
| D4 | 99 | 45-23-78 | $10 | - | - | $0 (pierde) |
| D5 | 22 | 22-45-78 | $10 | 1ª (doble) | 56x | $560 |
| D6 | 00 | 00-12-34 | $5 | 1ª | 56x | $280 |
| D7 | 45 | 78-45-23 | $20 | 2ª | 12x | $240 |

### TEST CASES: PALÉ

| # | Números | Resultado (1ª-2ª-3ª) | Monto | Combinación | DisplayOrder | Multiplicador | Premio |
|---|---------|----------------------|-------|-------------|--------------|---------------|--------|
| P1 | 45-23 | 45-23-78 | $10 | 1ª+2ª | 2 | 1100x | $11,000 |
| P2 | 45-78 | 45-23-78 | $10 | 1ª+3ª | 3 | 1100x | $11,000 |
| P3 | 23-78 | 45-23-78 | $10 | 2ª+3ª | 4 | 100x | $1,000 |
| P4 | 23-45 | 45-23-78 | $10 | 1ª+2ª | 2 | 1100x | $11,000 |
| P5 | 78-45 | 45-23-78 | $10 | 1ª+3ª | 3 | 1100x | $11,000 |
| P6 | 45-99 | 45-23-78 | $10 | - | - | - | $0 (pierde) |
| P7 | 99-12 | 45-23-78 | $10 | - | - | - | $0 (pierde) |

**Nota Palé**: El orden de los números en la apuesta NO importa. 45-23 es igual a 23-45.

### TEST CASES: TRIPLETA

| # | Números | Resultado (1ª-2ª-3ª) | Monto | Aciertos | DisplayOrder | Multiplicador | Premio |
|---|---------|----------------------|-------|----------|--------------|---------------|--------|
| T1 | 45-23-78 | 45-23-78 | $5 | 3/3 | 1 | 10000x | $50,000 |
| T2 | 78-45-23 | 45-23-78 | $5 | 3/3 | 1 | 10000x | $50,000 |
| T3 | 23-78-45 | 45-23-78 | $5 | 3/3 | 1 | 10000x | $50,000 |
| T4 | 45-23-99 | 45-23-78 | $5 | 2/3 | 2 | 100x | $500 |
| T5 | 45-99-12 | 45-23-78 | $5 | 1/3 | - | - | $0 (pierde) |
| T6 | 99-12-34 | 45-23-78 | $5 | 0/3 | - | - | $0 (pierde) |

### TEST CASES: CASH3 STRAIGHT (USA)

| # | Número | Resultado | Monto | Tipo | Multiplicador | Premio |
|---|--------|-----------|-------|------|---------------|--------|
| C3S1 | 457 | 457 | $2 | Exact | 600x | $1,200 |
| C3S2 | 475 | 457 | $2 | - | - | $0 (pierde) |
| C3S3 | 333 | 333 | $2 | Triple | 600x | $1,200 |
| C3S4 | 123 | 321 | $2 | - | - | $0 (pierde) |

### TEST CASES: CASH3 BOX (USA)

| # | Número | Resultado | Monto | Ways | Multiplicador | Premio |
|---|--------|-----------|-------|------|---------------|--------|
| C3B1 | 457 | 457 | $2 | 6-Way | 100x | $200 |
| C3B2 | 574 | 457 | $2 | 6-Way | 100x | $200 |
| C3B3 | 745 | 457 | $2 | 6-Way | 100x | $200 |
| C3B4 | 447 | 447 | $2 | 3-Way | 100x | $200 |
| C3B5 | 474 | 447 | $2 | 3-Way | 100x | $200 |
| C3B6 | 744 | 447 | $2 | 3-Way | 100x | $200 |
| C3B7 | 123 | 457 | $2 | - | - | $0 (pierde) |

**Cálculo de Ways:**
- 6-Way: 3 dígitos diferentes (ABC → 6 permutaciones)
- 3-Way: 2 dígitos iguales (AAB → 3 permutaciones)

### TEST CASES: PLAY4 STRAIGHT (USA)

| # | Número | Resultado | Monto | Multiplicador | Premio |
|---|--------|-----------|-------|---------------|--------|
| P4S1 | 1234 | 1234 | $1 | 5000x | $5,000 |
| P4S2 | 4321 | 1234 | $1 | - | $0 (pierde) |
| P4S3 | 1111 | 1111 | $1 | 5000x | $5,000 |

### TEST CASES: PLAY4 BOX (USA)

| # | Número | Resultado | Monto | Ways | Descripción | Multiplicador | Premio |
|---|--------|-----------|-------|------|-------------|---------------|--------|
| P4B1 | 4321 | 1234 | $1 | 24-Way | 4 únicos | 200x | $200 |
| P4B2 | 3211 | 1123 | $1 | 12-Way | 1 par | 200x | $200 |
| P4B3 | 2211 | 1122 | $1 | 6-Way | 2 pares | 200x | $200 |
| P4B4 | 2111 | 1112 | $1 | 4-Way | 3 iguales | 200x | $200 |
| P4B5 | 5678 | 1234 | $1 | - | - | - | $0 (pierde) |

**Cálculo de Ways (Play4):**
- 24-Way: 4 dígitos únicos → 4! = 24
- 12-Way: 1 par (AABC) → 4!/2! = 12
- 6-Way: 2 pares (AABB) → 4!/(2!×2!) = 6
- 4-Way: 3 iguales (AAAB) → 4!/3! = 4

### TEST CASES: PICK5 STRAIGHT (USA)

| # | Número | Resultado | Monto | Multiplicador | Premio |
|---|--------|-----------|-------|---------------|--------|
| P5S1 | 12345 | 12345 | $1 | 30000x | $30,000 |
| P5S2 | 54321 | 12345 | $1 | - | $0 (pierde) |

### TEST CASES: PICK5 BOX (USA)

| # | Número | Resultado | Monto | Ways | Descripción | Multiplicador | Premio |
|---|--------|-----------|-------|------|-------------|---------------|--------|
| P5B1 | 54321 | 12345 | $1 | 120-Way | 5 únicos | 416x | $416 |
| P5B2 | 43211 | 11234 | $1 | 60-Way | 1 par | 830x | $830 |
| P5B3 | 32211 | 11223 | $1 | 30-Way | 2 pares | 1660x | $1,660 |
| P5B4 | 21113 | 11123 | $1 | 20-Way | 3 iguales | 2500x | $2,500 |
| P5B5 | 21112 | 11122 | $1 | 10-Way | 3+par | 5000x | $5,000 |
| P5B6 | 21111 | 11112 | $1 | 5-Way | 4 iguales | 10000x | $10,000 |

### TEST CASES: BOLITA

| # | Dígito | Resultado | Posición | Monto | Multiplicador | Premio |
|---|--------|-----------|----------|-------|---------------|--------|
| B1 | 5 | 45-23-78 | 1ª (último dígito=5) | $5 | 75x | $375 |
| B2 | 3 | 45-23-78 | 2ª (último dígito=3) | $5 | 75x | $375 |
| B3 | 8 | 45-23-78 | 3ª (último dígito=8) | $5 | 75x | $375 |
| B4 | 9 | 45-23-78 | - | $5 | - | $0 (pierde) |

### TEST CASES: SINGULACIÓN

| # | Dígito | Resultado | Tipo | Monto | Multiplicador | Premio |
|---|--------|-----------|------|-------|---------------|--------|
| S1 | 5 | 45-23-78 | Singulación 1 | $10 | 9x | $90 |
| S2 | 3 | 45-23-78 | Singulación 2 | $10 | 9x | $90 |
| S3 | 8 | 45-23-78 | Singulación 3 | $10 | 9x | $90 |
| S4 | 9 | 45-23-78 | Singulación 1 | $10 | - | $0 (pierde) |

### TEST CASES: PICK TWO

| # | Número | Resultado | Tipo | Monto | Multiplicador | Premio |
|---|--------|-----------|------|-------|---------------|--------|
| PT1 | 12 | 1234 | Front | $2 | 75x | $150 |
| PT2 | 23 | 1234 | Middle | $2 | 75x | $150 |
| PT3 | 34 | 1234 | Back | $2 | 75x | $150 |
| PT4 | 56 | 1234 | Front | $2 | - | $0 (pierde) |

### TEST CASES: SUPER PALÉ

| # | Números | Resultado Sorteo 1 | Resultado Sorteo 2 | Monto | Multiplicador | Premio |
|---|---------|-------------------|-------------------|-------|---------------|--------|
| SP1 | 45-23 | 45-XX-XX | 23-XX-XX | $5 | 2000x | $10,000 |
| SP2 | 45-99 | 45-XX-XX | 12-XX-XX | $5 | - | $0 (pierde) |

### TEST CASES: MÚLTIPLES LÍNEAS EN UN TICKET

```
TICKET #001 - 4 líneas - Fecha: 2026-01-29

Línea 1: Directo "45" × $10
Línea 2: Directo "23" × $10
Línea 3: Directo "99" × $10
Línea 4: Palé "45-23" × $5

Resultado: 45-23-78

VERIFICACIÓN:
┌────────┬─────────┬───────────┬───────────┬─────────┐
│ Línea  │ Apuesta │ Resultado │ Premio    │ Estado  │
├────────┼─────────┼───────────┼───────────┼─────────┤
│ 1      │ 45      │ 1ª pos    │ $560      │ winner  │
│ 2      │ 23      │ 2ª pos    │ $120      │ winner  │
│ 3      │ 99      │ -         │ $0        │ loser   │
│ 4      │ 45-23   │ 1ª+2ª     │ $5,500    │ winner  │
└────────┴─────────┴───────────┴───────────┴─────────┘

TOTALES:
- Monto apostado: $35
- Líneas ganadoras: 3
- Líneas perdedoras: 1
- Premio total: $6,180
- Estado ticket: "W" (Winner)
```

### TEST CASES: TICKET TOTALMENTE PERDEDOR

```
TICKET #002 - 3 líneas - Fecha: 2026-01-29

Línea 1: Directo "99" × $10
Línea 2: Directo "12" × $10
Línea 3: Palé "99-12" × $5

Resultado: 45-23-78

VERIFICACIÓN:
┌────────┬─────────┬───────────┬─────────┬─────────┐
│ Línea  │ Apuesta │ Resultado │ Premio  │ Estado  │
├────────┼─────────┼───────────┼─────────┼─────────┤
│ 1      │ 99      │ -         │ $0      │ loser   │
│ 2      │ 12      │ -         │ $0      │ loser   │
│ 3      │ 99-12   │ -         │ $0      │ loser   │
└────────┴─────────┴───────────┴─────────┴─────────┘

TOTALES:
- Monto apostado: $25
- Líneas ganadoras: 0
- Líneas perdedoras: 3
- Premio total: $0
- Estado ticket: "L" (Loser)
```

### TEST CASES: TICKET CON SORTEOS PENDIENTES

```
TICKET #003 - 3 líneas - Fecha: 2026-01-29

Línea 1: Directo "45" × $10 - Sorteo: Loteka
Línea 2: Directo "23" × $10 - Sorteo: Nacional (sin resultado aún)
Línea 3: Palé "45-78" × $5 - Sorteo: Loteka

Resultado Loteka: 45-23-78
Resultado Nacional: (pendiente)

VERIFICACIÓN:
┌────────┬─────────┬──────────┬───────────┬─────────┐
│ Línea  │ Sorteo  │ Resultado│ Premio    │ Estado  │
├────────┼─────────┼──────────┼───────────┼─────────┤
│ 1      │ Loteka  │ 1ª pos   │ $560      │ winner  │
│ 2      │ Nacional│ -        │ -         │ pending │
│ 3      │ Loteka  │ 1ª+3ª    │ $5,500    │ winner  │
└────────┴─────────┴──────────┴───────────┴─────────┘

TOTALES:
- Monto apostado: $25
- Líneas ganadoras: 2
- Líneas perdedoras: 0
- Líneas pendientes: 1
- Premio parcial: $6,060
- Estado ticket: "P" (Pending) - hay líneas sin verificar
```

---

## CHECKLIST DE TESTING COMPLETO

### Pruebas Básicas Obligatorias
- [ ] Directo ganador en 1ª posición
- [ ] Directo ganador en 2ª posición
- [ ] Directo ganador en 3ª posición
- [ ] Directo perdedor (no coincide)
- [ ] Palé ganador 1ª+2ª
- [ ] Palé ganador 1ª+3ª
- [ ] Palé ganador 2ª+3ª (premio menor)
- [ ] Palé perdedor
- [ ] Tripleta ganadora (3/3)
- [ ] Tripleta parcial (2/3)
- [ ] Tripleta perdedora

### Pruebas USA
- [ ] Cash3 Straight exacto
- [ ] Cash3 Box 6-Way
- [ ] Cash3 Box 3-Way
- [ ] Play4 Straight exacto
- [ ] Play4 Box 24-Way
- [ ] Play4 Box 12-Way
- [ ] Play4 Box 6-Way
- [ ] Play4 Box 4-Way
- [ ] Pick5 Straight
- [ ] Pick5 Box 120-Way

### Pruebas de Ticket
- [ ] Ticket con múltiples líneas ganadoras
- [ ] Ticket con mix de ganadoras/perdedoras
- [ ] Ticket totalmente perdedor
- [ ] Ticket con líneas pendientes (estado "P")

### Pruebas de Configuración
- [ ] Multiplicador por defecto del sistema
- [ ] Multiplicador personalizado de banca
- [ ] Multiplicador específico por sorteo

### Pruebas de Estados
- [ ] Estado "W" cuando hay al menos 1 ganadora
- [ ] Estado "L" cuando todas las líneas pierden
- [ ] Estado "P" cuando hay sorteos sin resultado

---

**Última actualización**: 2026-01-29
**Autor**: Sistema de Lotería
