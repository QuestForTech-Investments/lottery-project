# Plan de Migración: Corrección Lottery → Draw

> **Problema Identificado:** Confusión conceptual entre Lotteries (tipos de lotería) y Draws (sorteos individuales)

## 📋 Resumen Ejecutivo

### Situación Actual (INCORRECTA)

```
lotteries (tabla actual)
├── Contiene: Sorteos individuales (ej: "Lotto NY Tarde", "Lotto NY Noche")
├── Usada como: Fuente principal de sorteos
└── Problema: Debería contener TIPOS de lotería, no sorteos

lotteries_copy (tabla correcta)
├── Contiene: Tipos de lotería (ej: "Lotto New York", "Powerball")
└── Situación: Ignorada, no usada en código

draws (tabla correcta pero no usada)
├── Contiene: Estructura correcta para sorteos
├── Campos: draw_id, lottery_id, draw_name, draw_time, etc.
└── Situación: Existe pero NO se usa
```

### Situación Deseada (CORRECTA)

```
lotteries (renombrar/reemplazar)
├── Debe contener: Tipos de lotería (desde lotteries_copy)
├── Ejemplo: "Lotto New York", "Powerball", "Mega Millions"
└── Uso: Categorización de sorteos

draws (usar como principal)
├── Debe ser: Fuente principal de sorteos
├── Relación: Cada draw apunta a un lottery (tipo)
├── Ejemplo: "NY Tarde" → lottery: "Lotto New York"
└── Todas las relaciones FK deben apuntar aquí
```

---

## 🔍 Análisis de Impacto

### Base de Datos

#### Tablas Afectadas Directamente

| Tabla | Campo Actual | Cambio Requerido | Impacto |
|-------|--------------|------------------|---------|
| `draws` | `lottery_id` | Mantener (apunta a tipo de lotería) | Validar datos |
| `betting_pool_prizes_commissions` | `lottery_id` | Cambiar a `draw_id` | Alto |
| `lottery_game_compatibilities` | `lottery_id` | Evaluar (probablemente mantener) | Medio |
| `lottery_bet_type_compatibilities` | `lottery_id` | Cambiar a `draw_id` | Alto |
| `banca_prize_config` | `lottery_id` | Cambiar a `draw_id` | Alto |
| `draw_prize_config` | `draw_id` | Ya correcto ✅ | Ninguno |
| `betting_pool_draws` | - | Evaluar (relación N:N) | Medio |
| `tickets` | `lottery_id`? | Cambiar a `draw_id` | Crítico |
| `ticket_lines` | `lottery_id`? | Cambiar a `draw_id` | Crítico |

#### Estimación de Registros Afectados

```sql
-- Registros en tabla actual (incorrecta)
SELECT COUNT(*) FROM lotteries;              -- ~15-20 sorteos

-- Registros en tabla correcta (no usada)
SELECT COUNT(*) FROM draws;                  -- ¿Vacía? ¿Poblada?

-- Registros en lotteries_copy (correcta)
SELECT COUNT(*) FROM lotteries_copy;         -- ~5-10 tipos de lotería

-- Dependencias
SELECT COUNT(*) FROM betting_pool_prizes_commissions WHERE lottery_id IS NOT NULL;
SELECT COUNT(*) FROM tickets WHERE lottery_id IS NOT NULL;
SELECT COUNT(*) FROM ticket_lines WHERE lottery_id IS NOT NULL;
```

### Código API (C#)

#### Modelos Afectados (7 archivos)

1. **Lottery.cs** ✅ Mantener (representa tipo de lotería)
2. **Draw.cs** ⚠️ Modificar (cambiar relaciones)
3. **BettingPoolPrizesCommission.cs** 🔴 Cambiar `LotteryId` → `DrawId`
4. **LotteryGameCompatibility.cs** ⚠️ Evaluar (probablemente OK)
5. **LotteryBetTypeCompatibility.cs** 🔴 Cambiar `LotteryId` → `DrawId`
6. **Ticket.cs** 🔴 Cambiar `LotteryId` → `DrawId`
7. **TicketLine.cs** 🔴 Cambiar `LotteryId` → `DrawId`

#### Controladores Afectados (14 archivos)

1. **LotteriesController.cs** ✅ Mantener (ahora tipos de lotería)
2. **DrawsController.cs** 🔴 CRÍTICO - Cambiar lógica principal
3. **BettingPoolPrizesCommissionsController.cs** 🔴 Cambiar FK
4. **BancaPrizeConfigController.cs** 🔴 Cambiar FK
5. **BettingPoolSortitionsController.cs** 🔴 Cambiar queries
6. **BettingPoolsController.cs** 🔴 Cambiar relaciones
7. **DrawPrizeConfigController.cs** ⚠️ Verificar (probablemente OK)
8. **PremioConfigController.cs** 🔴 Cambiar lógica
9. **Otros controllers** ⚠️ Revisión menor

#### Repositorios Afectados

1. **LotteryRepository.cs** ✅ Ajustar queries
2. **DrawRepository.cs** 🔴 Cambiar como repositorio principal
3. **Otros repositories** 🔴 Actualizar queries

#### DTOs Afectados

1. **LotteryDto.cs** ✅ Representa tipos
2. **DrawDto.cs** 🔴 Cambiar relaciones
3. **BettingPoolDto.cs** 🔴 Cambiar FK references
4. **Otros DTOs** 🔴 Actualizar según impacto

### Frontend

#### Componentes React Afectados (Estimación)

```
LottoWebApp/
├── EditBanca.jsx          🔴 CRÍTICO - Selección de sorteos
├── Sorteos.jsx            🔴 CRÍTICO - Lista de sorteos
├── ConfiguracionPremios.jsx 🔴 CRÍTICO - Premios por sorteo
├── Tickets.jsx            🔴 CRÍTICO - Creación de tickets
├── Reportes.jsx           🔴 ALTO - Filtros por sorteo
└── [Otros componentes]    ⚠️ Revisión necesaria
```

#### Endpoints API Usados en Frontend

```javascript
// Cambios necesarios en URLs
GET  /api/lotteries      → GET  /api/draws (sorteos)
GET  /api/lotteries/{id} → GET  /api/draws/{id}
POST /api/lotteries      → POST /api/draws

// Nuevos endpoints de tipos de lotería
GET  /api/lotteries      → (ahora retorna TIPOS, no sorteos)
GET  /api/lotteries/{id} → (tipo de lotería)
```

---

## 📅 Plan de Migración - 5 FASES

### FASE 0: Preparación y Backup (1-2 horas)

**Objetivo:** Asegurar rollback capability

#### Tareas:

1. **Backup Completo de Base de Datos**
   ```sql
   -- Script de backup
   BACKUP DATABASE [lottery-db]
   TO DISK = 'lottery-db-backup-pre-migration-2025-01-13.bak'
   WITH FORMAT, COMPRESSION;
   ```

2. **Crear Rama Git para Migración**
   ```bash
   git checkout -b migration/lottery-to-draw
   git push -u origin migration/lottery-to-draw
   ```

3. **Documentar Estado Actual**
   - Exportar schema actual: `schema-before-migration.sql`
   - Contar registros en todas las tablas afectadas
   - Screenshot de frontend funcionando

4. **Crear Scripts de Validación**
   ```sql
   -- validate-lottery-draw-data.sql
   -- Verificar integridad de datos antes y después
   ```

**Entregables:**
- ✅ Backup de base de datos
- ✅ Rama git `migration/lottery-to-draw`
- ✅ Documentación de estado actual
- ✅ Scripts de validación

---

### FASE 1: Migración de Base de Datos (4-6 horas)

**Objetivo:** Reestructurar schema y migrar datos

#### Paso 1.1: Análisis de Datos Actuales

```sql
-- 1. Verificar datos en lotteries (sorteos incorrectos)
SELECT
    lottery_id,
    lottery_name,
    lottery_type,
    country_id,
    is_active
FROM lotteries
ORDER BY lottery_name;

-- 2. Verificar datos en lotteries_copy (tipos correctos)
SELECT
    lottery_id,
    lottery_name,
    country_id
FROM lotteries_copy
ORDER BY lottery_name;

-- 3. Verificar tabla draws
SELECT
    draw_id,
    lottery_id,
    draw_name,
    draw_time,
    is_active
FROM draws;

-- 4. Identificar dependencias
SELECT
    OBJECT_NAME(parent_object_id) AS TableName,
    name AS ConstraintName,
    type_desc AS ConstraintType
FROM sys.foreign_keys
WHERE referenced_object_id = OBJECT_ID('lotteries');
```

#### Paso 1.2: Crear Tabla de Mapeo

```sql
-- Tabla temporal para mapear lotteries viejas → draws nuevos
CREATE TABLE lottery_to_draw_mapping (
    old_lottery_id INT NOT NULL,
    new_draw_id INT NOT NULL,
    old_lottery_name NVARCHAR(100),
    new_draw_name NVARCHAR(100),
    lottery_type_id INT, -- FK a lotteries_copy
    migration_date DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT PK_lottery_to_draw_mapping PRIMARY KEY (old_lottery_id)
);

-- Poblar tabla de mapeo
INSERT INTO lottery_to_draw_mapping (
    old_lottery_id,
    old_lottery_name,
    lottery_type_id
)
SELECT
    lottery_id,
    lottery_name,
    country_id -- Temporal, ajustar lógica
FROM lotteries;
```

#### Paso 1.3: Migrar Datos a Tabla `draws`

```sql
-- Verificar si draws está vacía o tiene datos
IF (SELECT COUNT(*) FROM draws) = 0
BEGIN
    -- Opción A: draws está vacía, migrar desde lotteries
    SET IDENTITY_INSERT draws ON;

    INSERT INTO draws (
        draw_id,
        lottery_id,  -- Temporal, necesita corrección manual
        draw_name,
        draw_time,
        description,
        abbreviation,
        display_color,
        is_active,
        created_at,
        created_by,
        updated_at,
        updated_by
    )
    SELECT
        lottery_id AS draw_id,
        1 AS lottery_id, -- TEMPORAL: Asignar tipo de lotería correcto manualmente
        lottery_name AS draw_name,
        '12:00:00' AS draw_time, -- TEMPORAL: Ajustar manualmente
        description,
        SUBSTRING(lottery_name, 1, 10) AS abbreviation,
        '#000000' AS display_color, -- TEMPORAL: Ajustar manualmente
        is_active,
        created_at,
        created_by,
        updated_at,
        updated_by
    FROM lotteries;

    SET IDENTITY_INSERT draws OFF;
END
ELSE
BEGIN
    -- Opción B: draws tiene datos, crear mapeo
    PRINT 'draws ya tiene datos, actualizar lottery_to_draw_mapping';

    UPDATE m
    SET m.new_draw_id = d.draw_id
    FROM lottery_to_draw_mapping m
    INNER JOIN draws d ON m.old_lottery_name = d.draw_name;
END
```

#### Paso 1.4: Actualizar Foreign Keys

**ADVERTENCIA:** Este paso requiere eliminar y recrear FKs. Hacer en orden específico.

```sql
-- 1. Deshabilitar todas las FK constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- 2. Agregar nuevas columnas draw_id donde sea necesario
ALTER TABLE betting_pool_prizes_commissions
ADD draw_id INT NULL;

ALTER TABLE lottery_bet_type_compatibilities
ADD draw_id INT NULL;

ALTER TABLE banca_prize_config
ADD draw_id INT NULL;

-- Si existe lottery_id en tickets
IF COL_LENGTH('tickets', 'lottery_id') IS NOT NULL
BEGIN
    ALTER TABLE tickets ADD draw_id INT NULL;
END

-- Si existe lottery_id en ticket_lines
IF COL_LENGTH('ticket_lines', 'lottery_id') IS NOT NULL
BEGIN
    ALTER TABLE ticket_lines ADD draw_id INT NULL;
END

-- 3. Migrar datos lottery_id → draw_id usando mapeo
UPDATE betting_pool_prizes_commissions
SET draw_id = m.new_draw_id
FROM betting_pool_prizes_commissions bppc
INNER JOIN lottery_to_draw_mapping m ON bppc.lottery_id = m.old_lottery_id;

UPDATE lottery_bet_type_compatibilities
SET draw_id = m.new_draw_id
FROM lottery_bet_type_compatibilities lbtc
INNER JOIN lottery_to_draw_mapping m ON lbtc.lottery_id = m.old_lottery_id;

UPDATE banca_prize_config
SET draw_id = m.new_draw_id
FROM banca_prize_config bpc
INNER JOIN lottery_to_draw_mapping m ON bpc.lottery_id = m.old_lottery_id;

-- 4. Eliminar columnas lottery_id viejas (después de verificar)
-- NO EJECUTAR HASTA VALIDAR
-- ALTER TABLE betting_pool_prizes_commissions DROP COLUMN lottery_id;
-- ALTER TABLE lottery_bet_type_compatibilities DROP COLUMN lottery_id;
-- ALTER TABLE banca_prize_config DROP COLUMN lottery_id;

-- 5. Crear nuevas FK constraints
ALTER TABLE betting_pool_prizes_commissions
ADD CONSTRAINT FK_betting_pool_prizes_commissions_draws
FOREIGN KEY (draw_id) REFERENCES draws(draw_id);

ALTER TABLE lottery_bet_type_compatibilities
ADD CONSTRAINT FK_lottery_bet_type_compatibilities_draws
FOREIGN KEY (draw_id) REFERENCES draws(draw_id);

ALTER TABLE banca_prize_config
ADD CONSTRAINT FK_banca_prize_config_draws
FOREIGN KEY (draw_id) REFERENCES draws(draw_id);

-- 6. Renombrar tabla lotteries → lotteries_old (NO ELIMINAR)
EXEC sp_rename 'lotteries', 'lotteries_old';

-- 7. Renombrar lotteries_copy → lotteries
EXEC sp_rename 'lotteries_copy', 'lotteries';

-- 8. Habilitar constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
```

#### Paso 1.5: Validación de Integridad

```sql
-- Verificar que no hay FKs rotas
SELECT
    OBJECT_NAME(parent_object_id) AS TableName,
    COL_NAME(parent_object_id, parent_column_id) AS ColumnName,
    OBJECT_NAME(referenced_object_id) AS ReferencedTable
FROM sys.foreign_key_columns
WHERE referenced_object_id = OBJECT_ID('draws');

-- Contar registros migrados
SELECT
    'lotteries_old' AS Tabla,
    COUNT(*) AS Registros
FROM lotteries_old
UNION ALL
SELECT
    'draws',
    COUNT(*)
FROM draws
UNION ALL
SELECT
    'lotteries (nuevo)',
    COUNT(*)
FROM lotteries;

-- Verificar integridad referencial
SELECT
    'betting_pool_prizes_commissions' AS Tabla,
    COUNT(*) AS TotalRegistros,
    SUM(CASE WHEN draw_id IS NULL THEN 1 ELSE 0 END) AS DrawIdNulos,
    SUM(CASE WHEN lottery_id IS NOT NULL THEN 1 ELSE 0 END) AS LotteryIdRestantes
FROM betting_pool_prizes_commissions;
```

**Entregables Fase 1:**
- ✅ Tabla `draws` poblada correctamente
- ✅ Tabla `lotteries` contiene tipos (de lotteries_copy)
- ✅ Tabla `lotteries_old` como backup
- ✅ FK actualizadas a `draw_id`
- ✅ Tabla de mapeo `lottery_to_draw_mapping`
- ✅ Scripts de validación ejecutados

---

### FASE 2: Actualización de Modelos C# (2-3 horas)

**Objetivo:** Actualizar Entity Models para reflejar nuevo schema

#### Paso 2.1: Actualizar Modelo Lottery

```csharp
// src/LotteryApi/Models/Lottery.cs
// ANTES: Representaba sorteos individuales
// DESPUÉS: Representa TIPOS de lotería

[Table("lotteries")]
public class Lottery
{
    [Key]
    [Column("lottery_id")]
    public int LotteryId { get; set; }

    [Column("country_id")]
    public int CountryId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("lottery_name")]
    public string LotteryName { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("lottery_type")]
    public string? LotteryType { get; set; }

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // Audit fields...

    // Navigation properties
    [ForeignKey("CountryId")]
    public virtual Country? Country { get; set; }

    // NUEVO: Ahora Lottery tiene muchos Draws
    public virtual ICollection<Draw> Draws { get; set; } = new List<Draw>();

    // Mantener compatibilidades
    public virtual ICollection<LotteryGameCompatibility> LotteryGameCompatibilities { get; set; } = new List<LotteryGameCompatibility>();
}
```

#### Paso 2.2: Actualizar Modelo Draw

```csharp
// src/LotteryApi/Models/Draw.cs
// Este modelo ya está correcto, solo verificar relaciones

[Table("draws")]
public class Draw
{
    [Key]
    [Column("draw_id")]
    public int DrawId { get; set; }

    [Column("lottery_id")]  // FK a Lottery (tipo)
    public int LotteryId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("draw_name")]
    public string DrawName { get; set; } = string.Empty;

    [Required]
    [Column("draw_time")]
    public TimeSpan DrawTime { get; set; }

    // ... otros campos

    // Navigation properties
    [ForeignKey("LotteryId")]
    public virtual Lottery? Lottery { get; set; }  // ✅ Ya correcto

    public virtual ICollection<Result> Results { get; set; } = new List<Result>();
    public virtual ICollection<BettingPoolDraw> BettingPoolDraws { get; set; } = new List<BettingPoolDraw>();
    public virtual ICollection<TicketLine> TicketLines { get; set; } = new List<TicketLine>();

    // NUEVAS relaciones (migradas desde Lottery)
    public virtual ICollection<BettingPoolPrizesCommission> BettingPoolPrizesCommissions { get; set; } = new List<BettingPoolPrizesCommission>();
    public virtual ICollection<BancaPrizeConfig> BancaPrizeConfigs { get; set; } = new List<BancaPrizeConfig>();
}
```

#### Paso 2.3: Actualizar Modelos con FK a Lottery → Draw

**BettingPoolPrizesCommission.cs:**
```csharp
[Table("betting_pool_prizes_commissions")]
public class BettingPoolPrizesCommission
{
    // CAMBIO: lottery_id → draw_id
    [Column("draw_id")]  // ANTES: lottery_id
    public int DrawId { get; set; }  // ANTES: LotteryId

    // ... otros campos

    // CAMBIO: Navigation property
    [ForeignKey("DrawId")]  // ANTES: LotteryId
    public virtual Draw? Draw { get; set; }  // ANTES: Lottery?
}
```

**LotteryBetTypeCompatibility.cs:**
```csharp
[Table("lottery_bet_type_compatibilities")]
public class LotteryBetTypeCompatibility
{
    // CAMBIO: lottery_id → draw_id
    [Column("draw_id")]  // ANTES: lottery_id
    public int DrawId { get; set; }  // ANTES: LotteryId

    [ForeignKey("DrawId")]  // ANTES: LotteryId
    public virtual Draw? Draw { get; set; }  // ANTES: Lottery?
}
```

**BancaPrizeConfig.cs:**
```csharp
[Table("banca_prize_config")]
public class BancaPrizeConfig
{
    // CAMBIO: lottery_id → draw_id
    [Column("draw_id")]  // ANTES: lottery_id
    public int DrawId { get; set; }  // ANTES: LotteryId

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }  // ANTES: Lottery?
}
```

**Ticket.cs y TicketLine.cs (si aplica):**
```csharp
// Verificar si tienen lottery_id y cambiar a draw_id
```

#### Paso 2.4: Actualizar DbContext

```csharp
// src/LotteryApi/Data/LotteryDbContext.cs

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Actualizar configuraciones de relaciones

    // Lottery (tipo) → Draws (sorteos)
    modelBuilder.Entity<Lottery>()
        .HasMany(l => l.Draws)
        .WithOne(d => d.Lottery)
        .HasForeignKey(d => d.LotteryId)
        .OnDelete(DeleteBehavior.Restrict);

    // Draw → BettingPoolPrizesCommissions
    modelBuilder.Entity<Draw>()
        .HasMany(d => d.BettingPoolPrizesCommissions)
        .WithOne(bp => bp.Draw)
        .HasForeignKey(bp => bp.DrawId)
        .OnDelete(DeleteBehavior.Restrict);

    // Draw → BancaPrizeConfigs
    modelBuilder.Entity<Draw>()
        .HasMany(d => d.BancaPrizeConfigs)
        .WithOne(bpc => bpc.Draw)
        .HasForeignKey(bpc => bpc.DrawId)
        .OnDelete(DeleteBehavior.Restrict);

    // ... otras configuraciones
}
```

**Entregables Fase 2:**
- ✅ 7 modelos actualizados
- ✅ DbContext configurado
- ✅ Código compila sin errores
- ✅ Migraciones EF Core generadas (opcional)

---

### FASE 3: Actualización de Repositorios y Servicios (3-4 horas)

**Objetivo:** Adaptar capa de datos a nuevo schema

#### Paso 3.1: Actualizar LotteryRepository

```csharp
// src/LotteryApi/Repositories/LotteryRepository.cs
// ANTES: Retornaba sorteos individuales
// DESPUÉS: Retorna TIPOS de lotería

public interface ILotteryRepository : IGenericRepository<Lottery>
{
    Task<IEnumerable<Lottery>> GetActiveLotteriesAsync();
    Task<Lottery?> GetByNameAsync(string name);
    Task<IEnumerable<Lottery>> GetByCountryAsync(int countryId);

    // NUEVO: Métodos para obtener draws de un tipo
    Task<IEnumerable<Draw>> GetDrawsByLotteryAsync(int lotteryId);
}

public class LotteryRepository : GenericRepository<Lottery>, ILotteryRepository
{
    public async Task<IEnumerable<Lottery>> GetActiveLotteriesAsync()
    {
        return await _context.Lotteries
            .Where(l => l.IsActive)
            .Include(l => l.Draws.Where(d => d.IsActive))  // NUEVO
            .OrderBy(l => l.LotteryName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Draw>> GetDrawsByLotteryAsync(int lotteryId)
    {
        return await _context.Draws
            .Where(d => d.LotteryId == lotteryId && d.IsActive)
            .OrderBy(d => d.DrawTime)
            .ToListAsync();
    }
}
```

#### Paso 3.2: Actualizar DrawRepository (CRÍTICO)

```csharp
// src/LotteryApi/Repositories/DrawRepository.cs
// ANTES: Poco usado
// DESPUÉS: Repositorio PRINCIPAL para sorteos

public interface IDrawRepository : IGenericRepository<Draw>
{
    Task<IEnumerable<Draw>> GetActiveDrawsAsync();
    Task<Draw?> GetByNameAsync(string name);
    Task<IEnumerable<Draw>> GetByLotteryTypeAsync(int lotteryId);
    Task<IEnumerable<Draw>> GetDrawsByTimeRangeAsync(TimeSpan startTime, TimeSpan endTime);
    Task<Draw?> GetDrawWithPrizeConfigAsync(int drawId);
}

public class DrawRepository : GenericRepository<Draw>, IDrawRepository
{
    public async Task<IEnumerable<Draw>> GetActiveDrawsAsync()
    {
        return await _context.Draws
            .Where(d => d.IsActive)
            .Include(d => d.Lottery)  // Incluir tipo de lotería
            .OrderBy(d => d.DrawTime)
            .ThenBy(d => d.DrawName)
            .ToListAsync();
    }

    public async Task<Draw?> GetDrawWithPrizeConfigAsync(int drawId)
    {
        return await _context.Draws
            .Include(d => d.Lottery)
            .Include(d => d.BancaPrizeConfigs)
            .FirstOrDefaultAsync(d => d.DrawId == drawId);
    }
}
```

#### Paso 3.3: Actualizar Otros Repositorios

Actualizar queries en:
- BettingPoolRepository
- PrizeConfigRepository
- TicketRepository

Cambiar todas las referencias `lottery_id` → `draw_id`.

**Entregables Fase 3:**
- ✅ LotteryRepository actualizado (tipos)
- ✅ DrawRepository actualizado (sorteos principales)
- ✅ Otros repositories actualizados
- ✅ Tests unitarios pasando

---

### FASE 4: Actualización de Controladores y DTOs (4-6 horas)

**Objetivo:** Adaptar endpoints API

#### Paso 4.1: Actualizar LotteriesController

```csharp
// src/LotteryApi/Controllers/LotteriesController.cs
// ANTES: Retornaba sorteos individuales
// DESPUÉS: Retorna TIPOS de lotería

[ApiController]
[Route("api/[controller]")]
public class LotteriesController : ControllerBase
{
    private readonly ILotteryRepository _lotteryRepository;

    /// <summary>
    /// Get all lottery types (e.g., "Lotto NY", "Powerball")
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllLotteryTypes()
    {
        var lotteries = await _lotteryRepository.GetActiveLotteriesAsync();
        var dtos = lotteries.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Get all draws for a specific lottery type
    /// </summary>
    [HttpGet("{lotteryId}/draws")]
    public async Task<IActionResult> GetDrawsByLotteryType(int lotteryId)
    {
        var draws = await _lotteryRepository.GetDrawsByLotteryAsync(lotteryId);
        var dtos = draws.Select(MapDrawToDto);
        return Ok(dtos);
    }
}
```

#### Paso 4.2: Actualizar DrawsController (CRÍTICO)

```csharp
// src/LotteryApi/Controllers/DrawsController.cs
// ANTES: Poco usado o no existente
// DESPUÉS: Controlador PRINCIPAL para sorteos

[ApiController]
[Route("api/[controller]")]
public class DrawsController : ControllerBase
{
    private readonly IDrawRepository _drawRepository;

    /// <summary>
    /// Get all active draws (sorteos)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllDraws(
        [FromQuery] int? lotteryTypeId = null,
        [FromQuery] TimeSpan? startTime = null,
        [FromQuery] TimeSpan? endTime = null)
    {
        IEnumerable<Draw> draws;

        if (lotteryTypeId.HasValue)
        {
            draws = await _drawRepository.GetByLotteryTypeAsync(lotteryTypeId.Value);
        }
        else if (startTime.HasValue && endTime.HasValue)
        {
            draws = await _drawRepository.GetDrawsByTimeRangeAsync(startTime.Value, endTime.Value);
        }
        else
        {
            draws = await _drawRepository.GetActiveDrawsAsync();
        }

        var dtos = draws.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Get draw by ID with lottery type information
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDrawById(int id)
    {
        var draw = await _drawRepository.GetByIdAsync(id);
        if (draw == null) return NotFound();

        var dto = MapToDetailDto(draw);
        return Ok(dto);
    }
}
```

#### Paso 4.3: Actualizar DTOs

**LotteryDto.cs** (ahora representa TIPOS):
```csharp
public class LotteryDto
{
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public string? LotteryType { get; set; }
    public string? Description { get; set; }
    public int CountryId { get; set; }
    public string? CountryName { get; set; }
    public bool IsActive { get; set; }

    // NUEVO: Lista de sorteos asociados
    public List<DrawSummaryDto>? Draws { get; set; }
}

public class DrawSummaryDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public string DrawTime { get; set; } = string.Empty;
}
```

**DrawDto.cs** (representa sorteos individuales):
```csharp
public class DrawDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public string DrawTime { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Abbreviation { get; set; }
    public string? DisplayColor { get; set; }
    public bool IsActive { get; set; }

    // Información del tipo de lotería
    public int LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public string? LotteryType { get; set; }
}

public class DrawDetailDto : DrawDto
{
    // Configuraciones de premios asociadas
    public List<PrizeConfigSummaryDto>? PrizeConfigs { get; set; }
}
```

#### Paso 4.4: Actualizar Otros Controllers

Actualizar todos los controllers que usan `lottery_id`:
- BettingPoolPrizesCommissionsController → usar `draw_id`
- BancaPrizeConfigController → usar `draw_id`
- BettingPoolsController → queries con `draw_id`
- PremioConfigController → usar `draw_id`

**Entregables Fase 4:**
- ✅ LotteriesController actualizado (tipos)
- ✅ DrawsController actualizado (sorteos)
- ✅ DTOs actualizados
- ✅ Otros controllers actualizados
- ✅ API compila y endpoints responden

---

### FASE 5: Actualización de Frontend (6-8 horas)

**Objetivo:** Adaptar componentes React

#### Paso 5.1: Actualizar API Service

```javascript
// src/services/api.js o similar
// ANTES: Endpoints mezclaban conceptos
// DESPUÉS: Separación clara

// Tipos de lotería
export const getLotteryTypes = async () => {
    return await axios.get('/api/lotteries');
};

export const getLotteryTypeById = async (id) => {
    return await axios.get(`/api/lotteries/${id}`);
};

// Sorteos (draws) - NUEVO PRINCIPAL
export const getDraws = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await axios.get(`/api/draws?${params}`);
};

export const getDrawById = async (id) => {
    return await axios.get(`/api/draws/${id}`);
};

export const getDrawsByLotteryType = async (lotteryId) => {
    return await axios.get(`/api/lotteries/${lotteryId}/draws`);
};
```

#### Paso 5.2: Actualizar Componente EditBanca.jsx

```javascript
// ANTES: Cargaba "lotteries" (sorteos)
const [lotteries, setLotteries] = useState([]);

useEffect(() => {
    const fetchLotteries = async () => {
        const response = await axios.get('/api/lotteries');
        setLotteries(response.data);
    };
    fetchLotteries();
}, []);

// DESPUÉS: Cargar "draws" (sorteos)
const [draws, setDraws] = useState([]);

useEffect(() => {
    const fetchDraws = async () => {
        const response = await axios.get('/api/draws');
        setDraws(response.data);
    };
    fetchDraws();
}, []);

// Actualizar UI
{draws.map((draw) => (
    <div key={draw.drawId}>  {/* ANTES: lottery.id */}
        <label>
            <input
                type="checkbox"
                checked={formData.selectedDraws.includes(draw.drawId)}  {/* ANTES: selectedLotteries */}
                onChange={() => handleDrawToggle(draw.drawId)}
            />
            {draw.drawName} - {draw.drawTime}  {/* ANTES: lottery.name */}
        </label>
    </div>
))}
```

#### Paso 5.3: Actualizar Otros Componentes

**Sorteos.jsx:**
```javascript
// Cambiar de lotteries → draws
const [draws, setDraws] = useState([]);

// Actualizar todas las referencias lottery → draw
```

**ConfiguracionPremios.jsx:**
```javascript
// Cambiar filtros de lotteryId → drawId
const handleDrawChange = (drawId) => {
    setSelectedDrawId(drawId);
    fetchPrizeConfig(drawId);
};
```

**Tickets.jsx:**
```javascript
// Cambiar selección de lottery → draw
const [selectedDraw, setSelectedDraw] = useState(null);

// Actualizar creación de tickets con draw_id
```

#### Paso 5.4: Actualizar Estado Global (si usa Redux/Context)

```javascript
// ANTES: lotterySlice.js
// DESPUÉS: drawSlice.js

const drawSlice = createSlice({
    name: 'draws',
    initialState: {
        draws: [],
        selectedDraw: null,
        lotteryTypes: [],  // NUEVO
    },
    reducers: {
        setDraws: (state, action) => {
            state.draws = action.payload;
        },
        setSelectedDraw: (state, action) => {
            state.selectedDraw = action.payload;
        },
        setLotteryTypes: (state, action) => {
            state.lotteryTypes = action.payload;
        },
    },
});
```

**Entregables Fase 5:**
- ✅ API service actualizado
- ✅ EditBanca.jsx actualizado
- ✅ Sorteos.jsx actualizado
- ✅ ConfiguracionPremios.jsx actualizado
- ✅ Tickets.jsx actualizado
- ✅ Estado global actualizado
- ✅ Frontend funciona con nuevos endpoints

---

## ✅ Validación Final

### Checklist de Validación

#### Base de Datos
- [ ] Tabla `draws` contiene todos los sorteos
- [ ] Tabla `lotteries` contiene tipos de lotería
- [ ] Tabla `lotteries_old` existe como backup
- [ ] Todas las FK apuntan a `draw_id`
- [ ] No hay registros huérfanos
- [ ] Constraints de FK funcionando

#### API
- [ ] GET /api/lotteries retorna tipos de lotería
- [ ] GET /api/draws retorna sorteos
- [ ] GET /api/lotteries/{id}/draws retorna sorteos de un tipo
- [ ] POST /api/draws crea sorteo correctamente
- [ ] Premios asociados a draws funcionan
- [ ] Tickets se crean con draw_id

#### Frontend
- [ ] Selector de sorteos muestra draws
- [ ] Configuración de premios usa draws
- [ ] Creación de tickets usa draws
- [ ] Reportes filtran por draws
- [ ] UI muestra tipo de lotería + sorteo

#### Pruebas End-to-End
- [ ] Crear banca con sorteos asignados
- [ ] Configurar premios por sorteo
- [ ] Crear ticket con sorteo específico
- [ ] Generar reporte por sorteo

---

## 🚨 Plan de Rollback

Si algo sale mal, seguir estos pasos:

### Rollback de Base de Datos

```sql
-- 1. Restaurar backup
RESTORE DATABASE [lottery-db]
FROM DISK = 'lottery-db-backup-pre-migration-2025-01-13.bak'
WITH REPLACE;

-- O si solo necesitas revertir cambios:
-- 2. Renombrar tablas al estado original
EXEC sp_rename 'lotteries', 'lotteries_new';  -- Nueva (tipos)
EXEC sp_rename 'lotteries_old', 'lotteries';  -- Restaurar original

-- 3. Eliminar columnas draw_id agregadas
ALTER TABLE betting_pool_prizes_commissions DROP COLUMN draw_id;
ALTER TABLE lottery_bet_type_compatibilities DROP COLUMN draw_id;
ALTER TABLE banca_prize_config DROP COLUMN draw_id;

-- 4. Restaurar FK constraints originales
-- (Ejecutar script de creación original)
```

### Rollback de Código

```bash
# Volver a rama main
git checkout main

# Eliminar rama de migración
git branch -D migration/lottery-to-draw

# Desplegar versión anterior
git push azure main --force
```

---

## 📊 Estimación de Tiempo

| Fase | Tiempo Estimado | Riesgo |
|------|-----------------|--------|
| Fase 0: Preparación | 1-2 horas | Bajo |
| Fase 1: Base de Datos | 4-6 horas | Alto |
| Fase 2: Modelos C# | 2-3 horas | Medio |
| Fase 3: Repositorios | 3-4 horas | Medio |
| Fase 4: Controllers/DTOs | 4-6 horas | Alto |
| Fase 5: Frontend | 6-8 horas | Alto |
| **TOTAL** | **20-29 horas** | - |

**Recomendación:** Hacer en 3-4 días de trabajo, no todo de una vez.

---

## 🎯 Recomendaciones

1. **NO hacer en producción directamente**
   - Probar en ambiente de desarrollo primero
   - Validar exhaustivamente
   - Hacer en horario de baja demanda

2. **Comunicar a usuarios**
   - Aviso de mantenimiento
   - Downtime esperado: 2-4 horas

3. **Tener equipo disponible**
   - Backend developer
   - Frontend developer
   - DBA o persona con acceso a Azure SQL

4. **Monitoreo post-migración**
   - Revisar logs por 24-48 horas
   - Validar reportes de usuarios
   - Verificar performance

---

## 📝 Conclusión

Este es un cambio arquitectónico mayor que corrige un error conceptual importante. Aunque tiene alto impacto, es necesario para mantener la coherencia del sistema a largo plazo.

**Ventajas de hacer la migración:**
- ✅ Estructura de datos correcta
- ✅ Código más entendible
- ✅ Escalabilidad futura
- ✅ Menos confusión conceptual

**Desventajas de NO hacer la migración:**
- ❌ Deuda técnica acumulada
- ❌ Confusión permanente en el código
- ❌ Dificultad para nuevos desarrolladores
- ❌ Problemas de mantenimiento a futuro

**Recomendación Final:** HACER LA MIGRACIÓN en un ambiente controlado, siguiendo este plan paso a paso.

---

**Documento creado:** 2025-01-13
**Versión:** 1.0
**Autor:** Lottery API Team
