# 📋 Plan de Implementación Incremental - Crear Banca

**Fecha:** 19 de Octubre, 2025
**Estrategia:** Paso a paso, probando cada fase antes de continuar

---

## ✅ Hallazgo Importante

**Las tablas YA EXISTEN en el Schema V4.0 de la BD:**
- `branches` (con todas las columnas de configuración)
- `branch_footers`
- `branch_prizes_commissions`
- `branch_schedules`
- `branch_sortitions`
- `branch_styles`
- `branch_automatic_expenses`

**Archivo:** `/mnt/h/GIT/lottery-api/LotteryAPI/Docs/complete_database_schema_v4.sql`

---

## 🔍 Paso 0: Verificar Estado Actual de la BD

### Opción A: Consulta SQL Directa (RECOMENDADO)

```sql
-- Conectarse a Azure SQL Database
-- Server: lottery-sql-1505.database.windows.net
-- Database: LottoTest

-- Verificar columnas de la tabla branches
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'branches'
ORDER BY ORDINAL_POSITION;

-- Verificar si existen las tablas adicionales
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'branch_%'
ORDER BY TABLE_NAME;
```

### Opción B: Desde la API

Crear un endpoint temporal para verificar:

```csharp
// BranchesController.cs
[HttpGet("check-schema")]
public IActionResult CheckDatabaseSchema()
{
    var tables = _context.Database
        .SqlQueryRaw<string>("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'branch_%'")
        .ToList();

    return Ok(new { tables });
}
```

---

## 📊 Fase 1: Solo Tabs General + Configuración (LO QUE YA FUNCIONA)

**Estado:** ✅ **YA IMPLEMENTADO**

**Campos que funcionan (37 campos):**
- Tab General: `branchName`, `branchCode`, `username`, `password`, `location`, `reference`, `comment`, `zoneId`
- Tab Configuración: Todos los 29 campos de configuración financiera, operativa y toggles

**Acción:** NINGUNA - Ya funciona perfectamente.

---

## 🚀 Fase 2: Agregar Tab de Estilos (MÁS SIMPLE)

**Prioridad:** ⭐ Alta (solo 2 campos)
**Complejidad:** 🟢 Baja
**Tiempo:** 2-3 horas

### Paso 2.1: Verificar/Agregar Columnas en BD

```sql
-- Verificar si existen
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'branches'
  AND COLUMN_NAME IN ('sell_screen_style', 'ticket_print_style');

-- Si NO existen, agregar:
ALTER TABLE branches
ADD sell_screen_style NVARCHAR(50) DEFAULT 'estilo1',
    ticket_print_style NVARCHAR(50) DEFAULT 'original';
```

### Paso 2.2: Actualizar API (Backend)

**Archivo:** `CreateBranchRequest.cs`

```csharp
public class CreateBranchRequest
{
    // ... campos existentes ...

    // NUEVOS CAMPOS - Tab Estilos
    public string? SellScreenStyle { get; set; } = "estilo1";
    public string? TicketPrintStyle { get; set; } = "original";
}
```

**Archivo:** `BranchesController.cs` - Método `CreateBranch()`

```csharp
var branch = new Branch
{
    // ... campos existentes ...

    // NUEVOS - Tab Estilos
    SellScreenStyle = request.SellScreenStyle ?? "estilo1",
    TicketPrintStyle = request.TicketPrintStyle ?? "original"
};
```

### Paso 2.3: Actualizar Frontend

**Archivo:** `CreateBanca.jsx` - Función `handleSubmit()`

```javascript
const branchData = {
  // ... campos existentes (37) ...

  // NUEVOS - Tab Estilos (2)
  sellScreenStyle: formData.sellScreenStyles,
  ticketPrintStyle: formData.ticketPrintStyles
};
```

### Paso 2.4: Probar

1. Crear una banca nueva con estilos seleccionados
2. Verificar que se guarden en la BD
3. Editar la banca y verificar que se carguen los estilos
4. ✅ Si funciona, continuar a Fase 3

---

## 🚀 Fase 3: Agregar Tab de Pies de Página

**Prioridad:** ⭐⭐ Media (7 campos)
**Complejidad:** 🟡 Media
**Tiempo:** 1 día

### Opción A: Usar Tabla Existente `branch_footers`

**Ventaja:** Ya existe en schema V4
**Desventaja:** Estructura no coincide exactamente con frontend

**Schema Actual:**
```sql
CREATE TABLE branch_footers (
    footer_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,
    footer_text TEXT,           -- ¿Mapear todos los textos aquí?
    contact_info VARCHAR(255),
    terms_conditions TEXT,
    custom_message TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
```

**Frontend necesita:**
- `autoFooter` (BIT)
- `footerText1`, `footerText2`, `footerText3`, `footerText4` (4 strings)
- `showBranchInfo` (BIT)
- `showDateTime` (BIT)

### Opción B: Agregar Columnas Directamente a `branches`

**Ventaja:** Más simple, no requiere JOIN
**Desventaja:** Agrega 7 columnas más a branches

```sql
ALTER TABLE branches
ADD auto_footer BIT DEFAULT 0,
    footer_text_1 NVARCHAR(255),
    footer_text_2 NVARCHAR(255),
    footer_text_3 NVARCHAR(255),
    footer_text_4 NVARCHAR(255),
    show_branch_info BIT DEFAULT 1,
    show_date_time BIT DEFAULT 1;
```

### 🎯 Recomendación: Opción B (Columnas en branches)

**Razones:**
- Más simple de implementar
- No requiere modificar tabla existente
- Relación 1:1 con branch (no necesita tabla separada)
- Más rápido en consultas (no JOIN)

### Pasos de Implementación:

1. ✅ Ejecutar ALTER TABLE en BD
2. ✅ Actualizar modelo C# `Branch.cs`
3. ✅ Actualizar `CreateBranchRequest.cs`
4. ✅ Actualizar controller para guardar/cargar footers
5. ✅ Actualizar frontend para enviar footers
6. ✅ Probar crear + editar banca

---

## 🚀 Fase 4: Agregar Tab de Horarios de Sorteos

**Prioridad:** ⭐⭐ Media (14 campos → 7 filas)
**Complejidad:** 🟡 Media
**Tiempo:** 1-2 días

### Opción A: Usar Tabla `branch_schedules` (RECOMENDADO)

**Ventaja:** Normalizado, ya existe en schema V4

**Modificar tabla existente:**
```sql
-- La tabla actual tiene: close_time, draw_time
-- Necesitamos: start_time, end_time

ALTER TABLE branch_schedules
DROP COLUMN close_time;

ALTER TABLE branch_schedules
DROP COLUMN draw_time;

ALTER TABLE branch_schedules
ADD start_time TIME NOT NULL DEFAULT '00:00:00',
    end_time TIME NOT NULL DEFAULT '23:59:00';
```

**Datos por banca:** 7 filas (Domingo=0, Lunes=1, ... Sábado=6)

### API Implementation:

**Crear DTO:**
```csharp
public class BranchScheduleDto
{
    public int DayOfWeek { get; set; } // 0-6
    public string DayName { get; set; } // "Sunday", "Monday", etc.
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}
```

**En CreateBranchRequest:**
```csharp
public List<BranchScheduleDto>? Schedules { get; set; }
```

**En Controller:**
```csharp
// Al crear banca
if (request.Schedules != null && request.Schedules.Any())
{
    foreach (var schedule in request.Schedules)
    {
        var branchSchedule = new BranchSchedule
        {
            BranchId = branch.BranchId,
            DayOfWeek = schedule.DayOfWeek,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime
        };
        _context.BranchSchedules.Add(branchSchedule);
    }
}
```

### Frontend Implementation:

```javascript
// Convertir campos del formulario a array
const schedules = [
  { dayOfWeek: 0, dayName: "Sunday", startTime: formData.domingoInicio, endTime: formData.domingoFin },
  { dayOfWeek: 1, dayName: "Monday", startTime: formData.lunesInicio, endTime: formData.lunesFin },
  { dayOfWeek: 2, dayName: "Tuesday", startTime: formData.martesInicio, endTime: formData.martesFin },
  { dayOfWeek: 3, dayName: "Wednesday", startTime: formData.miercolesInicio, endTime: formData.miercolesFin },
  { dayOfWeek: 4, dayName: "Thursday", startTime: formData.juevesInicio, endTime: formData.juevesFin },
  { dayOfWeek: 5, dayName: "Friday", startTime: formData.viernesInicio, endTime: formData.viernesFin },
  { dayOfWeek: 6, dayName: "Saturday", startTime: formData.sabadoInicio, endTime: formData.sabadoFin }
];

const branchData = {
  // ... otros campos ...
  schedules: schedules
};
```

---

## 🚀 Fase 5: Agregar Tab de Sorteos (Lotteries)

**Prioridad:** ⭐⭐⭐ Alta (selección de 69 sorteos)
**Complejidad:** 🟡 Media
**Tiempo:** 1-2 días

### Opción: Usar/Modificar Tabla `branch_sortitions`

**Tabla actual:**
```sql
CREATE TABLE branch_sortitions (
    sortition_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,
    sortition_type VARCHAR(50) NOT NULL,
    is_enabled BIT DEFAULT 1,
    specific_config NVARCHAR(MAX), -- JSON
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE(branch_id, sortition_type)
);
```

**Necesitamos mapear a:**
- `selectedLotteries`: Array de IDs [1, 2, 3, ...]
- `anticipatedClosing`: String ('5min', '10min', '15min', etc.)

### Modificar Tabla:

```sql
-- Renombrar/modificar tabla para que sea más clara
DROP TABLE branch_sortitions;

CREATE TABLE branch_lotteries (
    branch_id INT NOT NULL,
    lottery_id INT NOT NULL,
    anticipated_closing NVARCHAR(20), -- '5min', '10min', '15min', etc.
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (branch_id, lottery_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id)
);
```

### API Implementation:

```csharp
public class BranchLotteryDto
{
    public int LotteryId { get; set; }
    public string? AnticipatedClosing { get; set; } // "5min", "10min", etc.
}

// En CreateBranchRequest
public List<int>? SelectedLotteries { get; set; }
public string? AnticipatedClosing { get; set; } // Aplicado a todos
```

---

## 🚀 Fase 6: Agregar Tab de Premios & Comisiones

**Prioridad:** ⭐⭐⭐ Alta (90+ campos)
**Complejidad:** 🔴 Alta
**Tiempo:** 3-5 días

### Desafío:

La tabla actual `branch_prizes_commissions` tiene:
```sql
game_type VARCHAR(50) NOT NULL,
prize_percentage DECIMAL(5,2),
commission_percentage DECIMAL(5,2),
max_prize_amount DECIMAL(10,2),
```

Pero el frontend tiene **90+ campos específicos**:
- `pick3FirstPayment`, `pick3SecondPayment`, `pick3ThirdPayment`, `pick3Doubles`
- `pick4FirstPayment`, `pick4SecondPayment`
- `powerball4NumbersFirstRound`, `powerball3NumbersFirstRound`, etc.

### Opciones:

#### Opción A: Tabla Desnormalizada (1 fila por banca)

```sql
CREATE TABLE branch_prize_configurations (
    branch_id INT PRIMARY KEY,
    -- Pick 3
    pick3_first_payment DECIMAL(18,2),
    pick3_second_payment DECIMAL(18,2),
    pick3_third_payment DECIMAL(18,2),
    pick3_doubles DECIMAL(18,2),
    -- ... 86+ campos más
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
```

**Ventajas:** Simple, fácil mapeo 1:1 con frontend
**Desventajas:** Tabla muy ancha (90+ columnas)

#### Opción B: Tabla Normalizada (N filas por banca)

```sql
CREATE TABLE branch_prize_fields (
    branch_id INT NOT NULL,
    lottery_type VARCHAR(50) NOT NULL, -- 'PICK3', 'PICK4', etc.
    field_name VARCHAR(100) NOT NULL,   -- 'firstPayment', 'doubles', etc.
    field_value DECIMAL(18,2),
    PRIMARY KEY (branch_id, lottery_type, field_name),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
```

**Ventajas:** Normalizado, flexible
**Desventajas:** Requiere múltiples INSERT/UPDATE, más complejo en queries

### 🎯 Recomendación: Opción A (Tabla Desnormalizada)

**Razones:**
- Frontend ya tiene estructura plana
- Más fácil de implementar
- Más rápido en queries (1 JOIN vs múltiples)
- Premios no cambian frecuentemente

---

## 🚀 Fase 7: Agregar Tab de Gastos Automáticos

**Prioridad:** ⭐ Baja (feature secundaria)
**Complejidad:** 🟢 Baja
**Tiempo:** 1 día

### Usar Tabla `branch_automatic_expenses` (Ya existe)

```sql
CREATE TABLE branch_automatic_expenses (
    expense_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,
    expense_type VARCHAR(50) NOT NULL,     -- Mapear a 'description'
    amount DECIMAL(10,2),
    percentage DECIMAL(5,2),               -- Opcional
    frequency VARCHAR(50) NOT NULL,        -- 'DAILY', 'WEEKLY', 'MONTHLY'
    is_active BIT DEFAULT 1,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
```

**Frontend envía:**
```javascript
expenses: [
  {
    expenseName: "Alquiler mensual",
    expenseAmount: 500.00,
    isRecurring: true,
    recurrenceType: "MONTHLY"
  }
]
```

**Mapeo API:**
- `expenseName` → `expense_type`
- `expenseAmount` → `amount`
- `recurrenceType` → `frequency`

---

## ✅ Resumen: Orden de Implementación Recomendado

| Fase | Tab | Campos | Complejidad | Tiempo | Prioridad |
|------|-----|--------|-------------|--------|-----------|
| 0 | Verificar BD | - | 🟢 | 30 min | ⭐⭐⭐⭐⭐ |
| 1 | General + Config | 37 | ✅ YA HECHO | - | - |
| 2 | Estilos | 2 | 🟢 | 2-3 horas | ⭐⭐⭐⭐ |
| 3 | Pies de página | 7 | 🟡 | 1 día | ⭐⭐⭐ |
| 4 | Horarios | 14→7 filas | 🟡 | 1-2 días | ⭐⭐⭐ |
| 5 | Sorteos | 69 IDs | 🟡 | 1-2 días | ⭐⭐⭐⭐ |
| 6 | Premios | 90+ | 🔴 | 3-5 días | ⭐⭐⭐⭐⭐ |
| 7 | Gastos | Array | 🟢 | 1 día | ⭐⭐ |

**Tiempo Total Estimado:** 8-12 días (vs 6-8 semanas del plan original)

---

## 🎯 Siguiente Paso Inmediato

**Ejecutar Paso 0: Verificar Estado de la BD**

Conectarse a Azure SQL y ejecutar:

```sql
-- 1. Ver columnas actuales de branches
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'branches'
ORDER BY ORDINAL_POSITION;

-- 2. Ver tablas branch_* que existan
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'branch_%'
ORDER BY TABLE_NAME;

-- 3. Si existe branch_footers, ver su estructura
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'branch_footers';
```

**Responder:**
- ¿Qué columnas tiene actualmente la tabla `branches`?
- ¿Existen las tablas `branch_footers`, `branch_schedules`, etc.?
- ¿Qué estructura tienen?

Con esa información podemos decidir:
- ✅ Si ya están todas las columnas → Empezar Fase 2 directamente
- 🔧 Si faltan columnas → Crear script de migración específico
- 🏗️ Si faltan tablas → Ejecutar solo las partes necesarias del schema V4

---

**¿Quieres que te ayude a verificar el estado actual de la BD y decidir el próximo paso?**
