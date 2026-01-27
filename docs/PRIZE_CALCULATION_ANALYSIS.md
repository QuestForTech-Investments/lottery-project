# Análisis Completo: Cálculo de Premios en LottoWebApp

**Fecha:** Enero 2026
**Autor:** Equipo de Desarrollo
**Estado:** Fase 1 Implementada (Palé y Tripleta corregidos)

---

## Tabla de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura Actual](#2-arquitectura-actual)
3. [Loterías Dominicanas](#3-loterías-dominicanas)
4. [Loterías Estadounidenses](#4-loterías-estadounidenses)
5. [Cambios Requeridos](#5-cambios-requeridos)
6. [Plan de Implementación](#6-plan-de-implementación)
7. [Esquema de Base de Datos](#7-esquema-de-base-de-datos)

---

## 1. Resumen Ejecutivo

### Estado Actual
El sistema calcula premios usando `DisplayOrder` en la tabla `prize_types` para determinar el multiplicador según la posición donde sale el número ganador (1ra, 2da, 3ra).

### Problemas Identificados

| Prioridad | Tipo de Juego | Problema |
|-----------|---------------|----------|
| 🔴 CRÍTICO | Palé | No distingue entre combinaciones (1+2, 1+3, 2+3) |
| 🔴 CRÍTICO | Super Palé | Implementación incorrecta (debería ser entre 2 loterías) |
| 🟡 MEDIO | Tripleta | Falta premio parcial por 2 de 3 aciertos |
| 🟡 MEDIO | USA Box | No calcula según tipo de combinación (6-way, 3-way, etc.) |
| 🟢 BAJO | Pulito | Verificar implementación |

---

## 2. Arquitectura Actual

### 2.1 Flujo de Cálculo de Premios

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Resultado      │────▶│  GetWinningPosition  │────▶│  CalculatePrize │
│  (WinningNumber)│     │  (Retorna 1, 2, o 3) │     │  (DisplayOrder) │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

### 2.2 Archivo Principal
`api/src/LotteryApi/Services/ExternalResults/ExternalResultsService.cs`

### 2.3 Tabla prize_types
```sql
prize_types
├── prize_type_id (PK)
├── bet_type_id (FK) -- DIRECTO, PALE, TRIPLETA, etc.
├── display_order    -- 1, 2, 3, 4
├── multiplier       -- Factor de premio
├── name            -- "Primer Pago", "Segundo Pago", etc.
└── is_active
```

### 2.4 Código Actual de Detección de Ganador

```csharp
private int GetWinningPosition(TicketLine line, Result result)
{
    var betTypeCode = line.BetTypeCode?.ToUpper();

    return betTypeCode switch
    {
        "DIRECTO" => GetDirectoPosition(betNumber, num1, num2, num3),
        "PALE" => CheckPaleMatch(betNumber, num1, num2) ? 1 : 0,  // ⚠️ INCORRECTO
        "TRIPLETA" => CheckTripletaMatch(...) ? 1 : 0,
        "SUPER_PALE" => CheckSuperPaleMatch(betNumber, num1, num3) ? 1 : 0,  // ⚠️ INCORRECTO
        _ => GetDirectoPosition(...)
    };
}
```

---

## 3. Loterías Dominicanas

### 3.1 QUINIELA (Directo) ✅ CORRECTO

**Mecánica:** Se extraen 3 números de 2 dígitos (00-99). El jugador apuesta a un número.

**Estructura de Premios (por RD$1):**

| Posición | DisplayOrder | Premio Estándar | Premio Loteka |
|----------|--------------|-----------------|---------------|
| 1ra (Primera) | 1 | RD$60.00 | RD$60.00 |
| 2da (Segunda) | 2 | RD$8.00 | RD$10.00 |
| 3ra (Tercera) | 3 | RD$4.00 | RD$5.00 |

**Implementación Actual:** ✅ Correcta - Usa DisplayOrder para determinar multiplicador.

---

### 3.2 PALÉ 🔴 REQUIERE CORRECCIÓN

**Mecánica:** El jugador selecciona 2 números y gana si ambos coinciden con los números ganadores.

**Estructura de Premios (por RD$1):**

| Combinación | Premio | DisplayOrder Propuesto |
|-------------|--------|------------------------|
| 1ra + 2da (cualquier orden) | RD$1,000.00 | 1 |
| 1ra + 3ra (cualquier orden) | RD$1,000.00 | 2 |
| 2da + 3ra (cualquier orden) | RD$100.00 | 3 |

**Problema Actual:**
- Solo verifica si los 2 números del palé coinciden con num1 y num2
- No distingue las diferentes combinaciones
- No aplica el premio diferenciado (1000x vs 100x)

**Solución Propuesta:**

```csharp
private int GetPalePosition(string betNumber, string num1, string num2, string num3)
{
    // betNumber formato: "1234" donde primeros 2 dígitos = número A, últimos 2 = número B
    var numA = betNumber.Substring(0, 2);
    var numB = betNumber.Substring(2, 2);

    var hasNum1 = (numA == num1 || numB == num1);
    var hasNum2 = (numA == num2 || numB == num2);
    var hasNum3 = (numA == num3 || numB == num3);

    // 1ra + 2da = DisplayOrder 1 (premio mayor)
    if (hasNum1 && hasNum2) return 1;

    // 1ra + 3ra = DisplayOrder 2 (premio mayor)
    if (hasNum1 && hasNum3) return 2;

    // 2da + 3ra = DisplayOrder 3 (premio menor)
    if (hasNum2 && hasNum3) return 3;

    return 0; // No ganó
}
```

---

### 3.3 PALÉ EXACTO (Solo Loteka)

**Mecánica:** Los números deben coincidir en orden exacto.

**Estructura de Premios (por RD$1):**

| Combinación (Orden Exacto) | Premio |
|----------------------------|--------|
| 1ra + 2da | RD$3,000.00 |
| 1ra + 3ra | RD$1,500.00 |

**Nota:** Requiere un BetType separado: `PALE_EXACTO`

---

### 3.4 SUPER PALÉ 🔴 REQUIERE REDISEÑO

**Mecánica según documento:**
> "Combina el 1er premio de UNA lotería con el 1er premio de OTRA lotería"

**Estructura de Premios:**

| Tipo | Premio |
|------|--------|
| Super Palé (2 loterías, 2 aciertos) | RD$3,000.00 |
| Super Palé (2 de 3 aciertos) | RD$150.00 |

**Problema Actual:**
- Nuestra implementación verifica num1 y num3 del MISMO sorteo
- Debería comparar num1 de DOS sorteos DIFERENTES

**Solución Propuesta:**
1. Crear una tabla de relación `super_pale_combinations` que defina qué loterías se pueden combinar
2. Al crear el ticket, el usuario selecciona 2 loterías
3. Al calcular premios, comparar el resultado de ambas loterías

```csharp
// Estructura propuesta para Super Palé
public class SuperPaleBet
{
    public int DrawId1 { get; set; }  // Ej: Leidsa
    public int DrawId2 { get; set; }  // Ej: Nacional
    public string Number1 { get; set; }  // Número apostado para Leidsa
    public string Number2 { get; set; }  // Número apostado para Nacional
}

private bool CheckSuperPaleWin(SuperPaleBet bet, Result result1, Result result2)
{
    // Gana si Number1 = 1ra de Leidsa AND Number2 = 1ra de Nacional
    return bet.Number1 == result1.Num1 && bet.Number2 == result2.Num1;
}
```

**Decisión Requerida:** ¿Implementamos Super Palé correctamente o lo dejamos para una fase posterior?

---

### 3.5 TRIPLETA 🟡 FALTA PREMIO PARCIAL

**Mecánica:** El jugador selecciona 3 números.

**Estructura de Premios (por RD$1):**

| Aciertos | Premio | DisplayOrder |
|----------|--------|--------------|
| 3 números (cualquier orden) | RD$20,000.00 | 1 |
| 2 de 3 números | RD$100.00 | 2 |

**Problema Actual:**
- Solo implementamos el premio por 3 aciertos
- Falta el premio parcial por 2 de 3 aciertos

**Solución Propuesta:**

```csharp
private int GetTripletaPosition(string betNumber, string num1, string num2, string num3)
{
    // betNumber formato: "123456" (3 números de 2 dígitos)
    var betNums = new[] {
        betNumber.Substring(0, 2),
        betNumber.Substring(2, 2),
        betNumber.Substring(4, 2)
    };
    var winNums = new[] { num1, num2, num3 };

    var matches = betNums.Count(b => winNums.Contains(b));

    if (matches == 3) return 1;  // Premio completo
    if (matches == 2) return 2;  // Premio parcial
    return 0;
}
```

---

### 3.6 PULITO

**Mecánica:** Apostar al último dígito de cada posición.

**Estructura de Premios:**
Similar a Quiniela pero con números de 1 dígito (0-9).

| Posición | Premio por RD$1 |
|----------|-----------------|
| 1ra | Variable |
| 2da | Variable |
| 3ra | Variable |

**Estado:** Verificar implementación actual.

---

## 4. Loterías Estadounidenses

### 4.1 PICK 3 (Numbers) 🟡 REQUIERE BOX CALCULATION

**Mecánica:** Seleccionar 3 dígitos del 0 al 9.

**Tipos de Jugada y Premios (por $1):**

| Tipo | Descripción | Premio |
|------|-------------|--------|
| Straight | Orden exacto (123 = 123) | $500 |
| Box 6-Way | 3 dígitos diferentes | $80 |
| Box 3-Way | 2 dígitos iguales | $160 |
| Front Pair | Primeros 2 dígitos | $50 |
| Back Pair | Últimos 2 dígitos | $50 |

**Fórmula Box:**
```
Premio_Box = Premio_Straight / Número_de_Combinaciones

Box 6-Way: 6 combinaciones (ABC → ABC, ACB, BAC, BCA, CAB, CBA)
           $500 / 6 = $83.33 ≈ $80

Box 3-Way: 3 combinaciones (AAB → AAB, ABA, BAA)
           $500 / 3 = $166.67 ≈ $160
```

**Solución Propuesta:**

```csharp
private int GetPick3BoxType(string betNumber)
{
    var digits = betNumber.ToCharArray();
    var uniqueCount = digits.Distinct().Count();

    // 3 dígitos únicos = 6-Way
    if (uniqueCount == 3) return 6;

    // 2 dígitos únicos (uno repetido) = 3-Way
    if (uniqueCount == 2) return 3;

    // 1 dígito único (todos iguales) = Straight only
    return 1;
}

private decimal CalculatePick3BoxPrize(string betNumber, decimal straightPrize, string winningNumber)
{
    var boxType = GetPick3BoxType(betNumber);

    // Verificar si es ganador (cualquier orden)
    var betSorted = string.Concat(betNumber.OrderBy(c => c));
    var winSorted = string.Concat(winningNumber.OrderBy(c => c));

    if (betSorted != winSorted) return 0;

    return boxType switch
    {
        6 => straightPrize / 6,  // $80 aprox
        3 => straightPrize / 3,  // $160 aprox
        1 => straightPrize,      // Solo straight
        _ => 0
    };
}
```

---

### 4.2 PICK 4 (Win 4) 🟡 REQUIERE BOX CALCULATION

**Mecánica:** Seleccionar 4 dígitos del 0 al 9.

**Tipos de Jugada y Premios (por $1):**

| Tipo | Descripción | Combinaciones | Premio |
|------|-------------|---------------|--------|
| Straight | Orden exacto | 1 | $5,000 |
| Box 24-Way | 4 diferentes (ABCD) | 24 | $200 |
| Box 12-Way | 2 iguales (AABC) | 12 | $400 |
| Box 6-Way | 2 pares (AABB) | 6 | $800 |
| Box 4-Way | 3 iguales (AAAB) | 4 | $1,200 |

**Fórmula para determinar Box Type:**

```csharp
private int GetPick4BoxType(string betNumber)
{
    var frequency = betNumber.GroupBy(c => c)
                             .Select(g => g.Count())
                             .OrderByDescending(x => x)
                             .ToArray();

    // Patrones:
    // [1,1,1,1] = 24-Way (4 diferentes)
    // [2,1,1]   = 12-Way (1 par + 2 diferentes)
    // [2,2]     = 6-Way  (2 pares)
    // [3,1]     = 4-Way  (trío + 1 diferente)
    // [4]       = 1-Way  (todos iguales, solo straight)

    return frequency switch
    {
        [1, 1, 1, 1] => 24,
        [2, 1, 1]    => 12,
        [2, 2]       => 6,
        [3, 1]       => 4,
        [4]          => 1,
        _            => 0
    };
}
```

---

### 4.3 FRONT PAIR / BACK PAIR

**Mecánica:** Apostar solo a los primeros 2 o últimos 2 dígitos.

| Tipo | Comparación | Premio |
|------|-------------|--------|
| Front Pair | Primeros 2 dígitos | $50 |
| Back Pair | Últimos 2 dígitos | $50 |

```csharp
private bool CheckFrontPair(string betNumber, string winningNumber)
{
    return betNumber.Substring(0, 2) == winningNumber.Substring(0, 2);
}

private bool CheckBackPair(string betNumber, string winningNumber)
{
    var betLen = betNumber.Length;
    var winLen = winningNumber.Length;
    return betNumber.Substring(betLen - 2) == winningNumber.Substring(winLen - 2);
}
```

---

## 5. Cambios Requeridos

### 5.1 Prioridad Alta (Afecta dinero real)

| # | Cambio | Archivo | Complejidad | Estado |
|---|--------|---------|-------------|--------|
| 1 | Corregir cálculo de Palé | ExternalResultsService.cs | Media | ✅ COMPLETADO |
| 2 | Agregar premio parcial Tripleta | ExternalResultsService.cs | Baja | ✅ COMPLETADO |
| 3 | Implementar Box calculation USA | ExternalResultsService.cs | Alta | Pendiente |

### 5.2 Prioridad Media

| # | Cambio | Archivo | Complejidad |
|---|--------|---------|-------------|
| 4 | Agregar Front/Back Pair | ExternalResultsService.cs | Baja |
| 5 | Revisar Pulito | ExternalResultsService.cs | Baja |

### 5.3 Prioridad Baja (Requiere diseño)

| # | Cambio | Archivo | Complejidad |
|---|--------|---------|-------------|
| 6 | Rediseñar Super Palé | Múltiples | Muy Alta |
| 7 | Agregar Palé Exacto (Loteka) | Múltiples | Media |

---

## 6. Plan de Implementación

### Fase 1: Correcciones Críticas (Inmediato)

```
□ 1.1 Modificar GetWinningPosition para Palé
      - Implementar GetPalePosition()
      - Diferenciar combinaciones 1+2, 1+3, 2+3
      - Mapear a DisplayOrder 1, 2, 3

□ 1.2 Agregar premio parcial Tripleta
      - Implementar GetTripletaPosition()
      - DisplayOrder 1 = 3 aciertos
      - DisplayOrder 2 = 2 aciertos

□ 1.3 Verificar/Actualizar prize_types en BD
      - Confirmar multiplicadores para Palé
      - Agregar registro para Tripleta parcial
```

### Fase 2: Loterías USA (Siguiente Sprint)

```
□ 2.1 Implementar Box calculation
      - GetPick3BoxType()
      - GetPick4BoxType()
      - CalculateBoxPrize()

□ 2.2 Agregar Front/Back Pair
      - Nuevo BetType o flag en existente
      - CheckFrontPair() / CheckBackPair()
```

### Fase 3: Funcionalidad Avanzada (Futuro)

```
□ 3.1 Super Palé entre loterías
      - Diseñar modelo de datos
      - UI para seleccionar 2 loterías
      - Lógica de cálculo cruzado

□ 3.2 Palé Exacto (Loteka)
      - Nuevo BetType
      - Verificación de orden exacto
```

---

## 7. Esquema de Base de Datos

### 7.1 Estructura Actual de prize_types

```sql
-- Ejemplo de registros para DIRECTO
INSERT INTO prize_types (bet_type_id, display_order, name, multiplier) VALUES
('DIRECTO', 1, 'Primer Pago (1ra)', 60),
('DIRECTO', 2, 'Segundo Pago (2da)', 8),
('DIRECTO', 3, 'Tercer Pago (3ra)', 4);
```

### 7.2 Registros Requeridos para Palé

```sql
-- Palé con diferentes premios según combinación
INSERT INTO prize_types (bet_type_id, display_order, name, multiplier) VALUES
('PALE', 1, 'Palé 1ra+2da', 1000),
('PALE', 2, 'Palé 1ra+3ra', 1000),
('PALE', 3, 'Palé 2da+3ra', 100);
```

### 7.3 Registros Requeridos para Tripleta

```sql
-- Tripleta con premio parcial
INSERT INTO prize_types (bet_type_id, display_order, name, multiplier) VALUES
('TRIPLETA', 1, 'Tripleta Completa', 20000),
('TRIPLETA', 2, 'Tripleta Parcial (2 de 3)', 100);
```

### 7.4 Registros para USA Box (Propuesto)

```sql
-- Pick 3 Box Types
INSERT INTO prize_types (bet_type_id, display_order, name, multiplier) VALUES
('PICK3_STRAIGHT', 1, 'Straight', 500),
('PICK3_BOX', 1, 'Box 6-Way', 80),
('PICK3_BOX', 2, 'Box 3-Way', 160);

-- Pick 4 Box Types
INSERT INTO prize_types (bet_type_id, display_order, name, multiplier) VALUES
('PICK4_STRAIGHT', 1, 'Straight', 5000),
('PICK4_BOX', 1, 'Box 24-Way', 200),
('PICK4_BOX', 2, 'Box 12-Way', 400),
('PICK4_BOX', 3, 'Box 6-Way', 800),
('PICK4_BOX', 4, 'Box 4-Way', 1200);
```

---

## Apéndice A: Códigos de Tipos de Apuesta

| Código | Nombre | Categoría |
|--------|--------|-----------|
| DIRECTO | Quiniela/Directo | Dominicana |
| PALE | Palé | Dominicana |
| PALE_EXACTO | Palé Exacto | Dominicana (Loteka) |
| TRIPLETA | Tripleta | Dominicana |
| SUPER_PALE | Super Palé | Dominicana |
| PULITO | Pulito | Dominicana |
| PICK3_STRAIGHT | Pick 3 Straight | USA |
| PICK3_BOX | Pick 3 Box | USA |
| PICK4_STRAIGHT | Pick 4 Straight | USA |
| PICK4_BOX | Pick 4 Box | USA |
| FRONT_PAIR | Front Pair | USA |
| BACK_PAIR | Back Pair | USA |

---

## Apéndice B: Horarios de Referencia

### Loterías Dominicanas
| Lotería | Horario |
|---------|---------|
| La Primera | 12:00 PM, 8:00 PM |
| La Suerte | 12:30 PM, 6:00 PM |
| Lotería Real | 12:55 PM |
| LoteDom | 1:55 PM |
| Gana Más | 2:30 PM |
| Loteka | 7:55 PM |
| LEIDSA | 8:55 PM (Dom 3:55 PM) |
| Nacional Noche | 9:00 PM (Dom 6:00 PM) |

### Loterías USA (Eastern Time)
| Lotería | Horario |
|---------|---------|
| Florida Midday | 1:30 PM |
| New York Midday | 2:30 PM |
| Florida Evening | 9:45 PM |
| New York Evening | 10:30 PM |

---

**Documento actualizado:** Enero 2026
**Próxima revisión:** Después de implementación de Fase 1
