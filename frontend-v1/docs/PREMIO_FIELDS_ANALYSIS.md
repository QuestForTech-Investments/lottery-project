# Análisis: Frontend Hardcoded vs Base de Datos - Campos de Premios

**Fecha:** 2025-10-31
**Estado:** CRÍTICO - Requiere Decisión

---

## 🚨 Problema Principal

El formulario hardcoded en `PremiosComisionesTab.jsx` tiene **46 campos** con nombres específicos que **NO coinciden** con los **64 campos** que existen en la base de datos `prize_fields`.

### Números
- **Frontend:** 46 campos hardcoded
- **Base de Datos:** 64 prize fields
- **Coincidencias Perfectas:** Solo 8 campos (DIRECTO + PALE)
- **Mapeos Aproximados:** 38 campos (diferentes nombres/semántica)
- **Sin Mapeo Posible:** Varios campos de PANAMA y otros

---

## ✅ Coincidencias Perfectas (8 campos)

### DIRECTO (4 campos) ✅
```
Frontend              →  Base de Datos
directo_primerPago    →  DIRECTO_PRIMER_PAGO
directo_segundoPago   →  DIRECTO_SEGUNDO_PAGO
directo_tercerPago    →  DIRECTO_TERCER_PAGO
directo_dobles        →  DIRECTO_DOBLES
```

### PALE (4 campos) ✅
```
Frontend                →  Base de Datos
pale_todosEnSecuencia   →  PALE_TODOS_EN_SECUENCIA
pale_primerPago         →  PALE_PRIMER_PAGO
pale_segundoPago        →  PALE_SEGUNDO_PAGO
pale_tercerPago         →  PALE_TERCER_PAGO
```

---

## ⚠️ Mapeos Aproximados (requieren decisión)

### TRIPLETA
**Frontend (2 campos):**
- `tripleta_primerPago`
- `tripleta_segundoPago`

**Base de Datos (4 campos):**
- `TRIPLETA_PRIMER_PAGO` ✅ match
- `TRIPLETA_SEGUNDO_PAGO` ✅ match
- `TRIPLETA_TODOS_EN_SECUENCIA` ❌ no existe en frontend
- `TRIPLETA_TRIPLES` ❌ no existe en frontend

**Decisión Necesaria:** ¿Agregamos 2 campos más al frontend o ignoramos estos campos extras de la BD?

---

### CASH3 STRAIGHT
**Frontend (2 campos):**
- `cash3Straight_todosEnSecuencia` (nombre descriptivo)
- `cash3Straight_triples` (nombre descriptivo)

**Base de Datos (2 campos):**
- `CASH3_STRAIGHT_PRIMER_PAGO` (genérico)
- `CASH3_STRAIGHT_SEGUNDO_PAGO` (genérico)

**Problema:** Los nombres tienen **diferente semántica**. Frontend usa nombres descriptivos del tipo de premio, BD usa numeración genérica.

**Mapeo Propuesto (aproximado):**
```
cash3Straight_todosEnSecuencia  →  CASH3_STRAIGHT_PRIMER_PAGO
cash3Straight_triples           →  CASH3_STRAIGHT_SEGUNDO_PAGO
```

---

### CASH3 BOX
**Frontend (2 campos):**
- `cash3Box_threeWay` (tipo específico)
- `cash3Box_sixWay` (tipo específico)

**Base de Datos (2 campos):**
- `CASH3_BOX_PRIMER_PAGO` (genérico)
- `CASH3_BOX_SEGUNDO_PAGO` (genérico)

**Mapeo Propuesto:**
```
cash3Box_threeWay  →  CASH3_BOX_PRIMER_PAGO
cash3Box_sixWay    →  CASH3_BOX_SEGUNDO_PAGO
```

---

### PLAY4 STRAIGHT
**Frontend (2 campos):**
- `play4Straight_todosEnSecuencia`
- `play4Straight_dobles`

**Base de Datos (2 campos):**
- `PLAY4_STRAIGHT_PRIMER_PAGO`
- `PLAY4_STRAIGHT_SEGUNDO_PAGO`

**Mapeo Propuesto:**
```
play4Straight_todosEnSecuencia  →  PLAY4_STRAIGHT_PRIMER_PAGO
play4Straight_dobles            →  PLAY4_STRAIGHT_SEGUNDO_PAGO
```

---

### PLAY4 BOX
**Frontend (4 campos):**
- `play4Box_24way`
- `play4Box_12way`
- `play4Box_6way`
- `play4Box_4way`

**Base de Datos:** Solo en `PICK_FOUR_BOX_24`:
- `PLAY4_BOX_PRIMER_PAGO`
- `PLAY4_BOX_SEGUNDO_PAGO`
- `PLAY4_BOX_TERCER_PAGO`
- `PLAY4_BOX_CUARTO_PAGO`

**Problema:** Frontend tiene campos separados por tipo de "way", pero BD solo tiene campos bajo BOX_24.

**Mapeo Propuesto:**
```
play4Box_24way  →  PLAY4_BOX_PRIMER_PAGO
play4Box_12way  →  PLAY4_BOX_SEGUNDO_PAGO
play4Box_6way   →  PLAY4_BOX_TERCER_PAGO
play4Box_4way   →  PLAY4_BOX_CUARTO_PAGO
```

---

### PICK5 STRAIGHT
**Frontend (2 campos):**
- `pick5Straight_todosEnSecuencia`
- `pick5Straight_quadruples`

**Base de Datos (2 campos):**
- `PICK5_STRAIGHT_PRIMER_PAGO`
- `PICK5_STRAIGHT_SEGUNDO_PAGO`

**Mapeo Propuesto:**
```
pick5Straight_todosEnSecuencia  →  PICK5_STRAIGHT_PRIMER_PAGO
pick5Straight_quadruples        →  PICK5_STRAIGHT_SEGUNDO_PAGO
```

---

### PICK5 BOX
**Frontend (6 campos por tipo):**
- `pick5Box_5way`
- `pick5Box_10way`
- `pick5Box_20way`
- `pick5Box_30way`
- `pick5Box_60way`
- `pick5Box_120way`

**Base de Datos (6 campos genéricos):**
- `PICK5_BOX_PRIMER_PAGO`
- `PICK5_BOX_SEGUNDO_PAGO`
- `PICK5_BOX_TERCER_PAGO`
- `PICK5_BOX_CUARTO_PAGO`
- `PICK5_BOX_QUINTO_PAGO`
- `PICK5_BOX_SEXTO_PAGO`

**Mapeo Propuesto (orden específico):**
```
pick5Box_5way    →  PICK5_BOX_PRIMER_PAGO
pick5Box_10way   →  PICK5_BOX_SEGUNDO_PAGO
pick5Box_20way   →  PICK5_BOX_TERCER_PAGO
pick5Box_30way   →  PICK5_BOX_CUARTO_PAGO
pick5Box_60way   →  PICK5_BOX_QUINTO_PAGO
pick5Box_120way  →  PICK5_BOX_SEXTO_PAGO
```

---

### SUPER PALE, BOLITA, SINGULACIÓN
**Frontend usa:** `_primerPago`
**Base de Datos usa:** `_PREMIO`

```
superPale_primerPago        →  SUPER_PALE_PREMIO
bolita1_primerPago          →  BOLITA_1_PREMIO
bolita2_primerPago          →  BOLITA_2_PREMIO
singulacion1_primerPago     →  SINGULACION_1_PREMIO
singulacion2_primerPago     →  SINGULACION_2_PREMIO
singulacion3_primerPago     →  SINGULACION_3_PREMIO
```

---

### PICK TWO VARIANTS
**Frontend (solo primerPago):**
- `pickTwo_primerPago`
- `pickTwoFront_primerPago`
- `pickTwoBack_primerPago`
- `pickTwoMiddle_primerPago`

**Base de Datos (primer y segundo pago):**
- `PICK_TWO_PRIMER_PAGO` + `PICK_TWO_SEGUNDO_PAGO`
- `PICK_TWO_FRONT_PRIMER_PAGO` + `PICK_TWO_FRONT_SEGUNDO_PAGO`
- `PICK_TWO_BACK_PRIMER_PAGO` + `PICK_TWO_BACK_SEGUNDO_PAGO`
- `PICK_TWO_MIDDLE_PRIMER_PAGO` + `PICK_TWO_MIDDLE_SEGUNDO_PAGO`

**Problema:** Frontend solo tiene `primerPago`, pero BD tiene `primerPago` y `segundoPago` para cada uno.

---

### CASH3 FRONT/BACK
**Frontend (3 campos cada uno):**
```
cash3FrontStraight_todosEnSecuencia
cash3FrontBox_3way
cash3FrontBox_6way

cash3BackStraight_todosEnSecuencia
cash3BackBox_3way
cash3BackBox_6way
```

**Base de Datos (4 campos cada uno):**
```
CASH3_FRONT_STRAIGHT_PRIMER_PAGO
CASH3_FRONT_STRAIGHT_SEGUNDO_PAGO
CASH3_FRONT_BOX_PRIMER_PAGO
CASH3_FRONT_BOX_SEGUNDO_PAGO

CASH3_BACK_STRAIGHT_PRIMER_PAGO
CASH3_BACK_STRAIGHT_SEGUNDO_PAGO
CASH3_BACK_BOX_PRIMER_PAGO
CASH3_BACK_BOX_SEGUNDO_PAGO
```

**Problema:** Frontend tiene 3 campos (1 straight + 2 box), BD tiene 4 campos (2 straight + 2 box).

---

## 🔥 PROBLEMA CRÍTICO: PANAMA

### Frontend (6 campos - 3 rondas × 2 pagos)
```
panama_primeraRonda_primerPago
panama_primeraRonda_segundoPago
panama_segundaRonda_primerPago
panama_segundaRonda_segundoPago
panama_terceraRonda_primerPago
panama_terceraRonda_segundoPago
```

### Base de Datos (12 campos - 3 rondas × 4 categorías)
```
PANAMA_4_NUMEROS_PRIMERA_RONDA
PANAMA_3_NUMEROS_PRIMERA_RONDA
PANAMA_ULTIMOS_2_NUMEROS_PRIMERA_RONDA
PANAMA_ULTIMO_NUMERO_PRIMERA_RONDA

PANAMA_4_NUMEROS_SEGUNDA_RONDA
PANAMA_3_NUMEROS_SEGUNDA_RONDA
PANAMA_ULTIMOS_2_NUMEROS_SEGUNDA_RONDA
PANAMA_ULTIMO_NUMERO_SEGUNDA_RONDA

PANAMA_4_NUMEROS_TERCERA_RONDA
PANAMA_3_NUMEROS_TERCERA_RONDA
PANAMA_ULTIMOS_2_NUMEROS_TERCERA_RONDA
PANAMA_ULTIMO_NUMERO_TERCERA_RONDA
```

**INCOMPATIBLES:** Las estructuras son completamente diferentes.

**Mapeo Propuesto (muy aproximado - pierde información):**
```
panama_primeraRonda_primerPago   →  PANAMA_4_NUMEROS_PRIMERA_RONDA
panama_primeraRonda_segundoPago  →  PANAMA_3_NUMEROS_PRIMERA_RONDA
panama_segundaRonda_primerPago   →  PANAMA_4_NUMEROS_SEGUNDA_RONDA
panama_segundaRonda_segundoPago  →  PANAMA_3_NUMEROS_SEGUNDA_RONDA
panama_terceraRonda_primerPago   →  PANAMA_4_NUMEROS_TERCERA_RONDA
panama_terceraRonda_segundoPago  →  PANAMA_3_NUMEROS_TERCERA_RONDA
```

**Consecuencia:** Se pierden los campos de "últimos 2 números" y "último número" de la BD.

---

## 📊 Resumen Estadístico

| Categoría | Frontend | Base de Datos | Estado |
|-----------|----------|---------------|--------|
| **DIRECTO** | 4 campos | 4 campos | ✅ Perfecto |
| **PALE** | 4 campos | 4 campos | ✅ Perfecto |
| **TRIPLETA** | 2 campos | 4 campos | ⚠️ Incompleto |
| **CASH3 variants** | 10 campos | 14 campos | ⚠️ Diferentes |
| **PLAY4 variants** | 6 campos | 6 campos | ⚠️ Aproximado |
| **PICK5 variants** | 8 campos | 8 campos | ⚠️ Aproximado |
| **PICK2 variants** | 4 campos | 8 campos | ⚠️ Incompleto |
| **PANAMA** | 6 campos | 12 campos | 🔥 Incompatible |
| **Otros** | 2 campos | 4 campos | ⚠️ Aproximado |
| **TOTAL** | **46 campos** | **64 campos** | **❌ Desiguales** |

---

## 🎯 Opciones para Resolver

### Opción 1: Mapeo "Best Effort" (Implementado)
**Pros:**
- Mantiene el frontend exactamente como está
- Funciona para la mayoría de los casos (DIRECTO, PALE, etc.)
- Implementación rápida

**Contras:**
- Pierde datos de la BD que no tienen equivalente en frontend
- Mapeos aproximados pueden causar confusión semántica
- PANAMA quedará incompleto (6 de 12 campos usados)

**Estado:** ✅ Implementado en `/src/utils/premioFieldMapping.js`

---

### Opción 2: Actualizar la Base de Datos
Modificar el esquema `prize_fields` para que coincida exactamente con los campos hardcoded del frontend.

**Pros:**
- Coincidencia perfecta entre frontend y BD
- No se pierde funcionalidad del frontend

**Contras:**
- Requiere migración de datos existentes
- Puede perder información más detallada (ej: PANAMA)
- Cambios en el esquema de BD

---

### Opción 3: Actualizar el Frontend
Agregar los campos faltantes al formulario hardcoded.

**Pros:**
- Usa toda la información de la BD
- Captura más detalles (ej: PANAMA completo)

**Contras:**
- ❌ **BLOQUEADO POR CLIENTE:** "necesito que sea exactamente igual que aparecen en los harcoded, porque así me lo solicita el cliente"

---

### Opción 4: Sistema Híbrido
Usar los mapeos aproximados pero agregar campos ocultos para los datos extras de la BD.

**Pros:**
- Mantiene el frontend visible igual
- No pierde datos de la BD
- Permite guardar/recuperar información completa

**Contras:**
- Complejidad adicional
- Usuario no ve/edita los campos ocultos

---

## 🤔 Recomendación

Dado el requisito del cliente de **no modificar el frontend**, recomiendo:

1. **Implementar Opción 1** (Best Effort - Ya hecho)
2. **Documentar las limitaciones** claramente
3. **Para PANAMA:** Decidir si:
   - a) Usar solo 6 de 12 campos (mapeo actual)
   - b) Crear lógica especial para distribuir valores
   - c) Usar campos DEFAULT para los valores faltantes

---

## 📝 Archivos Creados

1. **`/src/utils/premioFieldMapping.js`**
   - Mapeos completos frontend ↔ BD
   - Funciones helper para conversión
   - Documentación de discrepancias
   - Reporte de validación

---

## ⏭️ Próximos Pasos

Necesito que decidas:

1. ¿Procedo con los mapeos aproximados tal como están?
2. ¿Modificamos la BD para que coincida con el frontend?
3. ¿Implementamos lógica especial para PANAMA?
4. ¿Qué hacemos con los campos de BD que no tienen equivalente en frontend?

Una vez decidido, continuaré con:
- Cargar valores default desde `/api/prize-fields`
- Implementar guardado en `CreateBanca`
- Implementar actualización en `EditBanca`
