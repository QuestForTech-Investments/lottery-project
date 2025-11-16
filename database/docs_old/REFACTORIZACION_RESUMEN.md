# 🎯 REFACTORIZACIÓN COMPLETA DEL SISTEMA DE LOTERÍA

## 📊 Resumen de Cambios

### ✅ ANTES (Problemas)
- ❌ Tabla `betting_pools` con **40+ campos**
- ❌ Duplicidad de información
- ❌ Difícil mantenimiento
- ❌ Imposible copiar configuraciones por sección
- ❌ Queries lentas
- ❌ Mezcla de datos básicos con configuraciones

### ✅ DESPUÉS (Solución)
- ✅ Tabla `betting_pools` con **solo 13 campos** (datos básicos)
- ✅ **12 tablas especializadas** para configuraciones
- ✅ **Sin duplicidad** de datos
- ✅ **Copia modular** por sección
- ✅ **Performance optimizado**
- ✅ **Separación clara** de responsabilidades

---

## 🏗️ Estructura Nueva (12 Tablas)

### 1️⃣ **betting_pools** (Datos Básicos - Tab GENERAL)
```sql
- betting_pool_id (PK)
- branch_code (Número único)
- branch_name
- zone_id (FK)
- bank_id (FK)
- address
- phone
- location
- reference
- comment
- username
- password_hash
- is_active
- created_at, created_by, updated_at, updated_by
- deleted_at, deleted_by, deletion_reason
```

### 2️⃣ **betting_pool_config** (Tab CONFIGURACIÓN)
```sql
- config_id (PK)
- betting_pool_id (FK, UNIQUE)
- fall_type (OFF, COBRO, DIARIA, MENSUAL, etc.)
- deactivation_balance
- daily_sale_limit
- daily_balance_limit
- temporary_additional_balance
- credit_limit
- is_active
- control_winning_tickets (toggle)
- allow_jackpot (toggle)
- enable_recharges (toggle)
- allow_password_change (toggle)
- cancel_minutes
- daily_cancel_tickets
- max_cancel_amount
- max_ticket_amount
- max_daily_recharge
- payment_mode (BANCA, GRUPO, ZONA, USAR PREFERENCIA DE GRUPO)
```

### 3️⃣ **betting_pool_print_config** (Configuración de Impresión)
```sql
- print_config_id (PK)
- betting_pool_id (FK, UNIQUE)
- print_mode (DRIVER, GENERICO)
- print_enabled (toggle)
- print_ticket_copy (toggle)
- print_recharge_receipt (toggle)
- sms_only (toggle)
```

### 4️⃣ **betting_pool_discount_config** (Configuración de Descuentos)
```sql
- discount_config_id (PK)
- betting_pool_id (FK, UNIQUE)
- discount_provider (GRUPO, RIFERO)
- discount_mode (OFF, EFECTIVO, TICKET GRATIS)
```

### 5️⃣ **betting_pool_footers** (Tab PIES DE PÁGINA)
```sql
- footer_id (PK)
- betting_pool_id (FK, UNIQUE)
- auto_footer (toggle)
- footer_line_1
- footer_line_2
- footer_line_3
- footer_line_4
```

### 6️⃣ **betting_pool_prizes_commissions** (Tab PREMIOS & COMISIONES)
```sql
- prize_commission_id (PK)
- betting_pool_id (FK)
- lottery_id (FK)
- game_type (DIRECTO, PALE, TRIPLETA, etc.)
-- Premios (Pestaña 1)
- prize_payment_1, prize_payment_2, prize_payment_3, prize_payment_4
-- Comisiones (Pestaña 2)
- commission_discount_1, commission_discount_2, commission_discount_3, commission_discount_4
-- Comisiones 2 (Pestaña 3)
- commission_2_discount_1, commission_2_discount_2, commission_2_discount_3, commission_2_discount_4
- is_active
UNIQUE (betting_pool_id, lottery_id, game_type)
```

### 7️⃣ **betting_pool_schedules** (Tab HORARIOS DE SORTEOS)
```sql
- schedule_id (PK)
- betting_pool_id (FK)
- day_of_week (0-6, L-D)
- close_time
- draw_time
- is_active (toggle)
UNIQUE (betting_pool_id, day_of_week)
```

### 8️⃣ **betting_pool_draws** (Tab SORTEOS - N:M)
```sql
- betting_pool_draw_id (PK)
- betting_pool_id (FK)
- draw_id (FK)
- is_active (toggle)
UNIQUE (betting_pool_id, draw_id)
```

### 9️⃣ **betting_pool_styles** (Tab ESTILOS)
```sql
- style_id (PK)
- betting_pool_id (FK, UNIQUE)
- sales_point_style (Estilo 1, 2, etc.)
- print_style (Original, Moderno, etc.)
- ticket_colors (JSON)
- custom_logo
- font_settings (JSON)
- layout_config (JSON)
```

### 🔟 **betting_pool_automatic_expenses** (Tab GASTOS AUTOMÁTICOS)
```sql
- expense_id (PK)
- betting_pool_id (FK)
- expense_type
- amount
- percentage
- frequency
- is_active (toggle)
```

### 1️⃣1️⃣ **betting_pool_sortitions** (Configuración Adicional)
```sql
- sortition_id (PK)
- betting_pool_id (FK)
- sortition_type
- is_enabled (toggle)
- specific_config (JSON)
UNIQUE (betting_pool_id, sortition_type)
```

### 1️⃣2️⃣ **balances** (Saldos)
```sql
- balance_id (PK)
- betting_pool_id (FK)
- current_balance
- last_updated
- updated_by
```

---

## 🔧 Stored Procedures de Copia

### 1. Copiar TODA la configuración
```sql
EXEC sp_CopyBettingPoolConfig 
    @source_betting_pool_id = 1,
    @target_betting_pool_id = 2,
    @include_configuration = 1,    -- Tab Configuración
    @include_footers = 1,          -- Tab Pies
    @include_prizes_commissions = 1, -- Tab Premios
    @include_schedules = 1,        -- Tab Horarios
    @include_draws = 1,            -- Tab Sorteos
    @include_styles = 1,           -- Tab Estilos
    @include_expenses = 0;         -- Tab Gastos (opcional)
```

### 2. Copiar UNA sección específica
```sql
EXEC sp_CopyBettingPoolSection 
    @source_betting_pool_id = 1,
    @target_betting_pool_id = 2,
    @section = 'PREMIOS'; -- CONFIGURACION, PIES, PREMIOS, HORARIOS, SORTEOS, ESTILOS, GASTOS
```

---

## 📈 Beneficios de la Refactorización

### ✅ Organización
- Cada tabla tiene un propósito claro
- Fácil de entender y mantener
- Separación lógica por funcionalidad

### ✅ Performance
- Queries más rápidas (solo consultas tablas necesarias)
- Índices optimizados por tabla
- Menos datos en memoria

### ✅ Flexibilidad
- Copiar configuraciones completas o por sección
- Agregar nuevos campos sin afectar otras áreas
- Versionamiento por tabla

### ✅ Auditoría
- Tracking granular por tipo de cambio
- Histórico separado por sección
- Identificar exactamente qué cambió

### ✅ Escalabilidad
- Fácil agregar nuevas configuraciones
- Sin límite de campos por tabla
- Estructura extensible

---

## 🔍 Vistas Útiles

### Ver configuración completa de una banca
```sql
SELECT * FROM vw_betting_pool_complete_config WHERE betting_pool_id = 1;
```

### Ver todas las bancas con configuraciones
```sql
SELECT 
    betting_pool_id,
    branch_code,
    branch_name,
    zone_name,
    fall_type,
    payment_mode,
    print_mode,
    active_draws_count,
    prizes_config_count
FROM vw_betting_pool_complete_config
WHERE is_active = 1;
```

---

## 📝 Ejemplos de Uso

### Crear una banca nueva copiando configuración
```sql
-- 1. Crear banca básica
INSERT INTO betting_pools (betting_pool_id, branch_code, branch_name, zone_id, username, password_hash, is_active)
VALUES (100, 'LAN-0100', 'LA NUEVA', 5, 'user100', 'hash...', 1);

-- 2. Copiar toda la configuración de una banca existente
EXEC sp_CopyBettingPoolConfig @source_betting_pool_id = 1, @target_betting_pool_id = 100;

-- 3. Ajustar configuraciones específicas si es necesario
UPDATE betting_pool_config SET daily_sale_limit = 50000 WHERE betting_pool_id = 100;
```

### Copiar solo premios y comisiones
```sql
EXEC sp_CopyBettingPoolSection 
    @source_betting_pool_id = 1,
    @target_betting_pool_id = 100,
    @section = 'PREMIOS';
```

### Actualizar configuración de impresión de múltiples bancas
```sql
-- Cambiar modo de impresión para todas las bancas de una zona
UPDATE pc
SET pc.print_mode = 'GENERICO'
FROM betting_pool_print_config pc
INNER JOIN betting_pools bp ON pc.betting_pool_id = bp.betting_pool_id
WHERE bp.zone_id = 5;
```

---

## 🎯 Mapeo UI → Base de Datos

| Tab en UI | Tabla(s) en BD | Relación |
|-----------|----------------|----------|
| **General** | `betting_pools` | 1:1 (datos básicos) |
| **Configuración** | `betting_pool_config`<br>`betting_pool_print_config`<br>`betting_pool_discount_config` | 1:1 cada una |
| **Pies de página** | `betting_pool_footers` | 1:1 |
| **Premios & Comisiones** | `betting_pool_prizes_commissions` | 1:N (por lotería/juego) |
| **Horarios de sorteos** | `betting_pool_schedules` | 1:N (7 días) |
| **Sorteos** | `betting_pool_draws` | N:M con `draws` |
| **Estilos** | `betting_pool_styles` | 1:1 |
| **Gastos automáticos** | `betting_pool_automatic_expenses` | 1:N |

---

## ✨ Conclusión

La refactorización elimina por completo:
- ❌ Campos duplicados
- ❌ Mezcla de responsabilidades
- ❌ Dificultad para copiar configuraciones
- ❌ Queries complejas

Y proporciona:
- ✅ Estructura modular y limpia
- ✅ Copia granular de configuraciones
- ✅ Mejor performance
- ✅ Fácil mantenimiento
- ✅ Escalabilidad futura

**Total de tablas: 32+**  
**Stored Procedures: 8**  
**Vistas: 6**  
**Sin duplicidad: 100%**  
