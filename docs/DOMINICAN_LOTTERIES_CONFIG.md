# Configuración de Loterías Dominicanas - Premios y Comisiones

**Fecha:** 2025-11-20
**Fuente:** Configuración proporcionada por usuario desde sistema en producción
**Aplica a:** 8 sorteos de loterías dominicanas

---

## 🎯 Sorteos que Usan Esta Configuración

1. **LOTEKA** (ID: 127)
2. **LA PRIMERA** (ID: 161)
3. **LA SUERTE** (ID: 162)
4. **GANA MAS** (ID: 163)
5. **LOTEDOM** (ID: 164)
6. **NACIONAL** (ID: 165)
7. **REAL** (ID: 167)
8. **SUPER PALE TARDE** (ID: 168)

**Nota adicional:** También incluye:
- **SUPER PALE NOCHE** (ID: 136)
- **SUPER PALE NY-FL AM** (ID: 137)
- **SUPER PALE NY-FL PM** (ID: 138)

**Total:** 11 sorteos con esta configuración

---

## 💰 Configuración de Tipos de Apuesta y Multiplicadores

### 1. DIRECTO (2 dígitos)

| Sub-tipo | Código Campo | Multiplicador | Descripción |
|----------|--------------|---------------|-------------|
| **Primer Pago** | DIRECTO_PRIMER_PAGO | **56** | Acierto exacto en primer premio |
| **Segundo Pago** | DIRECTO_SEGUNDO_PAGO | **12** | Acierto exacto en segundo premio |
| **Tercer Pago** | DIRECTO_TERCER_PAGO | **4** | Acierto exacto en tercer premio |
| **Dobles** | DIRECTO_DOBLES | **56** | Números dobles (11, 22, 33, etc.) |

**Total de campos:** 4

### 2. PALÉ (4 dígitos)

| Sub-tipo | Código Campo | Multiplicador | Descripción |
|----------|--------------|---------------|-------------|
| **Todos en secuencia** | PALE_TODOS_SECUENCIA | **1100** | Todos los dígitos en secuencia |
| **Primer Pago** | PALE_PRIMER_PAGO | **1100** | Acierto exacto en primer premio |
| **Segundo Pago** | PALE_SEGUNDO_PAGO | **1100** | Acierto exacto en segundo premio |
| **Tercer Pago** | PALE_TERCER_PAGO | **100** | Acierto exacto en tercer premio |

**Total de campos:** 4

### 3. TRIPLETA (6 dígitos)

| Sub-tipo | Código Campo | Multiplicador | Descripción |
|----------|--------------|---------------|-------------|
| **Primer Pago** | TRIPLETA_PRIMER_PAGO | **10000** | Acierto exacto en primer premio |
| **Segundo Pago** | TRIPLETA_SEGUNDO_PAGO | **100** | Acierto exacto en segundo premio |

**Total de campos:** 2

---

## 📊 Resumen de Tipos Habilitados

Para **todos los sorteos dominicanos**, están habilitados:

✅ **DIRECTO** (4 sub-tipos de pago)
✅ **PALÉ** (4 sub-tipos de pago)
✅ **TRIPLETA** (2 sub-tipos de pago)

**Total:** 3 tipos de apuesta principales = **10 campos de premio configurables**

---

## ⚠️ Diferencias con BD de Desarrollo

Los valores en la BD de desarrollo NO coinciden con producción:

| Tipo | BD Desarrollo | Producción (Real) | Diferencia |
|------|---------------|-------------------|------------|
| DIRECTO | 80.0x | 56.0x (Primer Pago) | ❌ Diferente |
| PALE | 600.0x | 1100.0x | ❌ Diferente |
| TRIPLETA | 8000.0x | 10000.0x | ❌ Diferente |

**Conclusión:** La BD de desarrollo tiene valores genéricos que deben actualizarse con los valores reales de producción.

---

## 🗃️ Estructura de Datos Necesaria

### Tabla: `prize_types` (prize fields)

La configuración real requiere **10 registros** en `prize_types` para loterías dominicanas:

```sql
-- DIRECTO (4 registros)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (1, 'DIRECTO_PRIMER_PAGO', 'Directo - Primer Pago', 56.0, 1),
  (1, 'DIRECTO_SEGUNDO_PAGO', 'Directo - Segundo Pago', 12.0, 2),
  (1, 'DIRECTO_TERCER_PAGO', 'Directo - Tercer Pago', 4.0, 3),
  (1, 'DIRECTO_DOBLES', 'Directo - Dobles', 56.0, 4);

-- PALE (4 registros)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (2, 'PALE_TODOS_SECUENCIA', 'Palé - Todos en secuencia', 1100.0, 1),
  (2, 'PALE_PRIMER_PAGO', 'Palé - Primer Pago', 1100.0, 2),
  (2, 'PALE_SEGUNDO_PAGO', 'Palé - Segundo Pago', 1100.0, 3),
  (2, 'PALE_TERCER_PAGO', 'Palé - Tercer Pago', 100.0, 4);

-- TRIPLETA (2 registros)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (3, 'TRIPLETA_PRIMER_PAGO', 'Tripleta - Primer Pago', 10000.0, 1),
  (3, 'TRIPLETA_SEGUNDO_PAGO', 'Tripleta - Segundo Pago', 100.0, 2);
```

### Tabla: `betting_pool_draw_game_types`

Para habilitar estos 3 tipos de apuesta en los 11 sorteos dominicanos:

```sql
-- Ejemplo para LOTEKA (draw_id: 127), asumiendo betting_pool_id = 1
INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id)
VALUES
  (1, 127, 1),  -- DIRECTO
  (1, 127, 2),  -- PALE
  (1, 127, 3);  -- TRIPLETA

-- Repetir para cada sorteo dominicano (127, 161, 162, 163, 164, 165, 167, 168, 136, 137, 138)
-- Total: 11 sorteos × 3 tipos = 33 registros por banca
```

---

## 🎨 Interfaz de Usuario - Tab Premios & Comisiones

En el formulario de creación/edición de banca, el tab "Premios & Comisiones" debería mostrar:

### Cuando se selecciona un sorteo dominicano (ej: LOTEKA):

```
┌─────────────────────────────────────────────────┐
│ PREMIOS & COMISIONES                             │
├─────────────────────────────────────────────────┤
│                                                  │
│ Sorteo: [LOTEKA ▼]                              │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ DIRECTO                                      │ │
│ │ ├─ Primer Pago:  [56.00]                    │ │
│ │ ├─ Segundo Pago: [12.00]                    │ │
│ │ ├─ Tercer Pago:  [4.00]                     │ │
│ │ └─ Dobles:       [56.00]                    │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ PALÉ                                         │ │
│ │ ├─ Todos en secuencia: [1100.00]            │ │
│ │ ├─ Primer Pago:        [1100.00]            │ │
│ │ ├─ Segundo Pago:       [1100.00]            │ │
│ │ └─ Tercer Pago:        [100.00]             │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ TRIPLETA                                     │ │
│ │ ├─ Primer Pago:  [10000.00]                 │ │
│ │ └─ Segundo Pago: [100.00]                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│                    [GUARDAR]                     │
└─────────────────────────────────────────────────┘
```

**Total de inputs:** 10 campos numéricos

---

## 📝 Notas Importantes

1. **Valores por defecto**: Los multiplicadores mostrados arriba son los valores por defecto. Cada banca puede personalizarlos.

2. **Validación**: Los multiplicadores deben ser > 0 y <= 50000 (el máximo es PICK5_STRAIGHT)

3. **Comisiones**: No se proporcionaron en la información. Probablemente hay campos adicionales para:
   - Comisión de venta (%)
   - Comisión de premio (%)

4. **Sorteos especiales**:
   - SUPER PALE tiene su propia configuración (probablemente diferente a DIRECTO/PALE/TRIPLETA)
   - Necesitamos confirmar si usa los mismos multiplicadores

5. **Estructura flexible**: El sistema permite diferentes multiplicadores para:
   - Diferentes sorteos (aunque dominicanas comparten config)
   - Diferentes bancas (cada banca puede tener sus propios multiplicadores)

---

## 🔄 Próximos Pasos

1. ✅ **Actualizar tabla `prize_types`** con los 10 registros correctos
2. ✅ **Poblar `betting_pool_draw_game_types`** para los 11 sorteos dominicanos
3. ⚠️ **Obtener configuración de loterías USA** (Florida, New York, Texas, etc.)
   - Probablemente usan: PICK2, CASH3_*, PLAY4_*, PICK5_*
   - Necesitamos multiplicadores específicos
4. ⚠️ **Obtener configuración de loterías caribeñas** (Anguila, King Lottery)

---

## 📊 Script SQL Completo (Para ejecutar en BD de desarrollo)

```sql
-- ============================================
-- CONFIGURACIÓN LOTERÍAS DOMINICANAS
-- ============================================

-- Paso 1: Limpiar configuración existente (si existe)
DELETE FROM prize_types WHERE bet_type_id IN (1, 2, 3);

-- Paso 2: Insertar prize_types correctos

-- DIRECTO (bet_type_id = 1)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order, requires_additional_number)
VALUES
  (1, 'DIRECTO_PRIMER_PAGO', 'Directo - Primer Pago', 56.0, 1, 0),
  (1, 'DIRECTO_SEGUNDO_PAGO', 'Directo - Segundo Pago', 12.0, 2, 0),
  (1, 'DIRECTO_TERCER_PAGO', 'Directo - Tercer Pago', 4.0, 3, 0),
  (1, 'DIRECTO_DOBLES', 'Directo - Dobles', 56.0, 4, 0);

-- PALE (bet_type_id = 2)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order, requires_additional_number)
VALUES
  (2, 'PALE_TODOS_SECUENCIA', 'Palé - Todos en secuencia', 1100.0, 1, 0),
  (2, 'PALE_PRIMER_PAGO', 'Palé - Primer Pago', 1100.0, 2, 0),
  (2, 'PALE_SEGUNDO_PAGO', 'Palé - Segundo Pago', 1100.0, 3, 0),
  (2, 'PALE_TERCER_PAGO', 'Palé - Tercer Pago', 100.0, 4, 0);

-- TRIPLETA (bet_type_id = 3)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order, requires_additional_number)
VALUES
  (3, 'TRIPLETA_PRIMER_PAGO', 'Tripleta - Primer Pago', 10000.0, 1, 0),
  (3, 'TRIPLETA_SEGUNDO_PAGO', 'Tripleta - Segundo Pago', 100.0, 2, 0);

-- Paso 3: Habilitar estos tipos para sorteos dominicanos
-- Asumiendo betting_pool_id = 1 (ajustar según sea necesario)

DECLARE @BettingPoolId INT = 1;

INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id)
SELECT @BettingPoolId, draw_id, game_type_id
FROM (
  -- 11 sorteos dominicanos
  SELECT 127 AS draw_id UNION ALL  -- LOTEKA
  SELECT 161 UNION ALL             -- LA PRIMERA
  SELECT 162 UNION ALL             -- LA SUERTE
  SELECT 163 UNION ALL             -- GANA MAS
  SELECT 164 UNION ALL             -- LOTEDOM
  SELECT 165 UNION ALL             -- NACIONAL
  SELECT 167 UNION ALL             -- REAL
  SELECT 168 UNION ALL             -- SUPER PALE TARDE
  SELECT 136 UNION ALL             -- SUPER PALE NOCHE
  SELECT 137 UNION ALL             -- SUPER PALE NY-FL AM
  SELECT 138                       -- SUPER PALE NY-FL PM
) draws
CROSS JOIN (
  -- 3 tipos de apuesta
  SELECT 1 AS game_type_id UNION ALL  -- DIRECTO
  SELECT 2 UNION ALL                  -- PALE
  SELECT 3                            -- TRIPLETA
) game_types;

-- Total: 11 sorteos × 3 tipos = 33 registros

-- Paso 4: Verificar
SELECT
  d.draw_name,
  gt.game_type_code,
  COUNT(*) AS num_prize_fields
FROM betting_pool_draw_game_types bpdgt
JOIN draws d ON bpdgt.draw_id = d.draw_id
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
LEFT JOIN prize_types pt ON pt.bet_type_id = gt.game_type_id
WHERE d.draw_id IN (127, 161, 162, 163, 164, 165, 167, 168, 136, 137, 138)
GROUP BY d.draw_name, gt.game_type_code
ORDER BY d.draw_name, gt.game_type_code;

-- Resultado esperado:
-- LOTEKA      DIRECTO   4
-- LOTEKA      PALE      4
-- LOTEKA      TRIPLETA  2
-- ... (repetir para los 11 sorteos)
```

---

**Última actualización:** 2025-11-20
**Estado:** ✅ Configuración completa para loterías dominicanas
**Pendiente:** Configuración de loterías USA y caribeñas

---

## ✅ EJECUCIÓN COMPLETADA (2025-11-20)

### Resumen de la Implementación

**Script ejecutado:** `configure-dominican-lotteries-fixed.sql` + `configure-dominican-all-bancas.sql`

**Resultado:**
- ✅ **10 prize_types insertados** correctamente con los multiplicadores correctos
- ✅ **330 relaciones habilitadas** (10 bancas activas × 11 sorteos × 3 tipos)
- ✅ Todos los sorteos dominicanos tienen DIRECTO, PALÉ y TRIPLETA habilitados
- ✅ Configuración aplicada a TODAS las bancas activas en la base de datos

### Estructura Final en BD

**Tabla `prize_types`:**
```
DIRECTO (bet_type_id=1)
  - DIRECTO_PRIMER_PAGO (56.0x)
  - DIRECTO_SEGUNDO_PAGO (12.0x)
  - DIRECTO_TERCER_PAGO (4.0x)
  - DIRECTO_DOBLES (56.0x)

PALÉ (bet_type_id=2)
  - PALE_TODOS_SECUENCIA (1100.0x)
  - PALE_PRIMER_PAGO (1100.0x)
  - PALE_SEGUNDO_PAGO (1100.0x)
  - PALE_TERCER_PAGO (100.0x)

TRIPLETA (bet_type_id=3)
  - TRIPLETA_PRIMER_PAGO (10000.0x)
  - TRIPLETA_SEGUNDO_PAGO (100.0x)
```

**Tabla `betting_pool_draw_game_types`:**
- 330 registros totales
- Cada banca activa puede jugar DIRECTO, PALÉ y TRIPLETA en los 11 sorteos dominicanos
- La configuración es coherente con el sistema en producción

### Verificación

Para verificar la configuración en cualquier momento:
```bash
cd /home/jorge/projects/lottery-project/api/SqlRunner
dotnet run verify-dominican-config.sql
```

### Scripts SQL Disponibles

1. `configure-dominican-lotteries-fixed.sql` - Inserción de prize_types
2. `configure-dominican-all-bancas.sql` - Habilitación para todas las bancas
3. `verify-dominican-config.sql` - Verificación de la configuración
4. `check-betting-pools.sql` - Consultar bancas disponibles

---

**Ejecutado por:** Claude Code
**Fecha de ejecución:** 2025-11-20
**Base de datos:** lottery-db (Azure SQL Database)
**Estado final:** ✅ COMPLETADO EXITOSAMENTE
