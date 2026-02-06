# Investigación: Premios de Lotería Dominicana

Investigación realizada: 2026-02-06

---

## 1. Reglas Oficiales de la Lotería Dominicana

### Fuentes consultadas:
- [Quiniela Palé Leidsa](https://www.miresultadoloteria.com/quiniela-pale/info)
- [Quiniela Tripleta](https://www.loto-latino.com/loteria/quiniela-tripleta/)
- [Conectate.com.do](https://www.conectate.com.do/loterias/)

### Cómo funciona el sorteo

Las quinielas dominicanas usan **3 tómbolas**, cada una con números del 00 al 99:
- **1ra posición:** Primera tómbola
- **2da posición:** Segunda tómbola
- **3ra posición:** Tercera tómbola

Ejemplo de resultado: `07-47-25`
- 1ra: 07
- 2da: 47
- 3ra: 25

---

## 2. Tipos de Apuesta y Premios Oficiales

### 2.1 QUINIELA (Directo)

Se escoge **un número de 2 dígitos** (00-99). Gana si sale en cualquiera de las 3 posiciones.

| Posición | Premio Oficial | Por cada peso |
|----------|---------------|---------------|
| **1ra** | RD$60 | 60x |
| **2da** | RD$8 | 8x |
| **3ra** | RD$4 | 4x |

**Nota:** Algunas bancas pagan 56x en 1ra para tener margen.

---

### 2.2 PALÉ

Se escogen **dos números de 2 dígitos cada uno**. Gana si ambos números salen en 2 de las 3 posiciones (orden no importa).

| Combinación | Premio Oficial | Por cada peso |
|-------------|---------------|---------------|
| **1ra + 2da** | RD$1,000 | 1000x |
| **1ra + 3ra** | RD$1,000 | 1000x |
| **2da + 3ra** | RD$100 | 100x |

**Nota importante:** El premio de 2da+3ra es **10 veces menor** que 1ra+2da o 1ra+3ra.

---

### 2.3 TRIPLETA

Se escogen **tres números de 2 dígitos cada uno**. Premio según cuántos acierten.

| Aciertos | Premio Oficial | Por cada peso |
|----------|---------------|---------------|
| **3 de 3** | RD$20,000 | 20000x |
| **2 de 3** | RD$100 | 100x |

---

## 3. Comparación: Oficial vs Sistema Actual

### 3.1 QUINIELA/DIRECTO

| Posición | Oficial | Sistema | Diferencia |
|----------|---------|---------|------------|
| 1ra | 60x | 56x | ⚠️ -6.7% |
| 2da | 8x | 12x | ⚠️ +50% |
| 3ra | 4x | 4x | ✅ Igual |

**Análisis:**
- El sistema paga **menos en 1ra** (margen de banca)
- El sistema paga **más en 2da** - ¿error o configuración intencional?

---

### 3.2 PALÉ

| Combinación | Oficial | Sistema | Diferencia |
|-------------|---------|---------|------------|
| 1ra + 2da | 1000x | 1100x | ⚠️ +10% |
| 1ra + 3ra | 1000x | 1100x | ⚠️ +10% |
| 2da + 3ra | 100x | 100x | ✅ Igual |

**Análisis:** El sistema paga **más** en 1ra+2da y 1ra+3ra. Puede ser promoción o error.

---

### 3.3 TRIPLETA

| Aciertos | Oficial | Sistema | Diferencia |
|----------|---------|---------|------------|
| 3 de 3 | 20000x | 10000x | ❌ -50% |
| 2 de 3 | 100x | 100x | ✅ Igual |

**Análisis:** El sistema paga **MITAD del premio oficial** para tripleta completa. **CRÍTICO**.

---

## 4. Discrepancias Encontradas

### ❌ Críticas (afectan al negocio)

| Problema | Impacto |
|----------|---------|
| Tripleta 3/3: 10000x vs 20000x | Clientes ganan mitad de lo esperado |
| Directo 2da: 12x vs 8x | Banca paga de más |

### ⚠️ Menores (puede ser intencional)

| Diferencia | Posible razón |
|------------|---------------|
| Directo 1ra: 56x vs 60x | Margen de banca (normal) |
| Palé 1ra+2da: 1100x vs 1000x | Promoción o error |

---

## 5. Cómo se Determinan los Ganadores

### 5.1 DIRECTO (implementación actual)

```csharp
// GetDirectoPosition()
if (betNumber == num1) return 1;  // 1ra posición
if (betNumber == num2) return 2;  // 2da posición
if (betNumber == num3) return 3;  // 3ra posición
return 0;  // No ganó
```

✅ **CORRECTO** - Coincide con reglas oficiales.

---

### 5.2 PALÉ (implementación actual)

```csharp
// GetPalePosition()
// Apuesta: 4 dígitos = 2 números (ej: "0747" = 07 y 47)
var betFirst = betNumber.Substring(0, 2);   // "07"
var betSecond = betNumber.Substring(2, 2);  // "47"

// Busca ambos números en el resultado
var hasNum1 = (betFirst == num1 || betSecond == num1);
var hasNum2 = (betFirst == num2 || betSecond == num2);
var hasNum3 = (betFirst == num3 || betSecond == num3);

// Determina premio según combinación
if (hasNum1 && hasNum2) return 2;  // 1ra+2da
if (hasNum1 && hasNum3) return 3;  // 1ra+3ra
if (hasNum2 && hasNum3) return 4;  // 2da+3ra
```

✅ **CORRECTO** - Coincide con reglas oficiales.

---

### 5.3 TRIPLETA (implementación actual)

```csharp
// GetTripletaPosition()
// Apuesta: 6 dígitos = 3 números (ej: "074725" = 07, 47, 25)
var betNums = new[] {
    betNumber.Substring(0, 2),  // "07"
    betNumber.Substring(2, 2),  // "47"
    betNumber.Substring(4, 2)   // "25"
};

var winNums = new[] { num1, num2, num3 };
var matchCount = betNums.Count(b => winNums.Contains(b));

if (matchCount == 3) return 1;  // Premio completo
if (matchCount == 2) return 2;  // Premio parcial
return 0;
```

✅ **CORRECTO** - Coincide con reglas oficiales.

---

## 6. Configuración en Base de Datos

### Tabla: prize_types (defaults actuales)

```sql
-- DIRECTO
INSERT INTO prize_types VALUES
(1, 'DIRECTO_PRIMER_PAGO', 56.00, 1),
(1, 'DIRECTO_SEGUNDO_PAGO', 12.00, 2),
(1, 'DIRECTO_TERCER_PAGO', 4.00, 3);

-- PALÉ
INSERT INTO prize_types VALUES
(2, 'PALE_PRIMER_PAGO', 1100.00, 2),
(2, 'PALE_SEGUNDO_PAGO', 1100.00, 3),
(2, 'PALE_TERCER_PAGO', 100.00, 4);

-- TRIPLETA
INSERT INTO prize_types VALUES
(3, 'TRIPLETA_PRIMER_PAGO', 10000.00, 1),  -- ❌ Debería ser 20000
(3, 'TRIPLETA_SEGUNDO_PAGO', 100.00, 2);
```

---

## 7. Recomendaciones

### 7.1 Acciones Inmediatas

| Acción | Prioridad | Razón |
|--------|-----------|-------|
| Verificar Tripleta 3/3 | 🔴 Alta | Podría estar pagando mitad del premio |
| Verificar Directo 2da | 🟠 Media | Podría estar pagando de más |
| Documentar configuración intencional | 🟡 Normal | Aclarar qué es error vs diseño |

### 7.2 Preguntas para el Negocio

1. **¿Los multiplicadores actuales son correctos para su modelo de negocio?**
2. **¿El multiplicador de Tripleta 10000x es intencional o debería ser 20000x?**
3. **¿Cada banca debe poder configurar sus propios multiplicadores?**
4. **¿Hay diferencias por lotería (Nacional, Leidsa, Loteka)?**

---

## 8. Flujo de Cálculo Actual

```
1. Resultado publicado: "074725"
   - num1 = 07, num2 = 47, num3 = 25

2. Para cada ticket pendiente:

   DIRECTO "47" (apuesta RD$100):
   - GetDirectoPosition("47", "07", "47", "25") → 2 (2da)
   - PrizeType: DIRECTO_SEGUNDO_PAGO, DisplayOrder=2, Default=12x
   - Premio = 100 × 12 = RD$1,200

   PALÉ "0747" (apuesta RD$50):
   - GetPalePosition("0747", "07", "47", "25") → 2 (1ra+2da)
   - PrizeType: PALE_PRIMER_PAGO, DisplayOrder=2, Default=1100x
   - Premio = 50 × 1100 = RD$55,000

   TRIPLETA "074725" (apuesta RD$10):
   - GetTripletaPosition("074725", "07", "47", "25") → 1 (3 aciertos)
   - PrizeType: TRIPLETA_PRIMER_PAGO, DisplayOrder=1, Default=10000x
   - Premio = 10 × 10000 = RD$100,000
   - (Si fuera oficial: 10 × 20000 = RD$200,000)
```

---

## 9. Conclusión

### Lo que funciona bien:
- ✅ Lógica de matching (DIRECTO, PALÉ, TRIPLETA)
- ✅ Diferenciación por posición
- ✅ Cascada banca > default (parcial)

### Lo que necesita revisión:
- ⚠️ Multiplicadores pueden no coincidir con estándar
- ⚠️ Tripleta 3/3 paga mitad del oficial
- ❌ Cascada no usa DrawPrizeConfig

### Próximos pasos:
1. Confirmar con negocio los multiplicadores correctos
2. Crear script de migración si hay que ajustar
3. Implementar fix de cascada DrawPrizeConfig

---

**Investigación realizada por:** Claude (GSD)
**Fecha:** 2026-02-06
