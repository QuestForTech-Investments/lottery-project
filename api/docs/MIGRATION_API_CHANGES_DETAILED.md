# Cambios Necesarios en la API - Migración Database

## 📋 Resumen de Cambios en Base de Datos

### Tablas Renombradas:
1. `lottery_bet_type_compatibility` → `draw_bet_type_compatibility`
2. `lottery_game_compatibility` → `draw_game_compatibility`

### Columnas Renombradas:
- En ambas tablas: `lottery_id` → `draw_id`

### Nueva Estructura de Relaciones:
```
lotteries (31 registros)
    ↓ (1:N)
draws (69 registros) - Ahora tienen lottery_id
    ↓ (N:M)
draw_bet_type_compatibility
    ↓ (N:1)
bet_types
```

## 🔧 Cambios Requeridos en la API

### 1. MODELOS (Models/)

#### ✅ A. Renombrar y Actualizar: `LotteryBetTypeCompatibility.cs` → `DrawBetTypeCompatibility.cs`

**Archivo Actual:** `src/LotteryApi/Models/LotteryBetTypeCompatibility.cs`
**Nuevo Archivo:** `src/LotteryApi/Models/DrawBetTypeCompatibility.cs`

**Cambios:**
```csharp
// ANTES:
[Table("lottery_bet_type_compatibility")]
public class LotteryBetTypeCompatibility
{
    [Column("lottery_id")]
    public int LotteryId { get; set; }

    [ForeignKey("LotteryId")]
    public virtual Lottery? Lottery { get; set; }
}

// DESPUÉS:
[Table("draw_bet_type_compatibility")]
public class DrawBetTypeCompatibility
{
    [Column("draw_id")]
    public int DrawId { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }
}
```

#### ✅ B. Renombrar y Actualizar: `LotteryGameCompatibility.cs` → `DrawGameCompatibility.cs`

**Archivo Actual:** `src/LotteryApi/Models/LotteryGameCompatibility.cs`
**Nuevo Archivo:** `src/LotteryApi/Models/DrawGameCompatibility.cs`

**Cambios:**
```csharp
// ANTES:
[Table("lottery_game_compatibility")]
public class LotteryGameCompatibility
{
    [Column("lottery_id")]
    public int LotteryId { get; set; }

    [ForeignKey("LotteryId")]
    public virtual Lottery? Lottery { get; set; }
}

// DESPUÉS:
[Table("draw_game_compatibility")]
public class DrawGameCompatibility
{
    [Column("draw_id")]
    public int DrawId { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }
}
```

#### ✅ C. Actualizar: `Draw.cs`

**Archivo:** `src/LotteryApi/Models/Draw.cs`

**Agregar navegaciones:**
```csharp
public class Draw
{
    // ... propiedades existentes ...

    // AGREGAR:
    public virtual ICollection<DrawBetTypeCompatibility> DrawBetTypeCompatibilities { get; set; } = new List<DrawBetTypeCompatibility>();
    public virtual ICollection<DrawGameCompatibility> DrawGameCompatibilities { get; set; } = new List<DrawGameCompatibility>();
}
```

#### ✅ D. Actualizar: `Lottery.cs`

**Archivo:** `src/LotteryApi/Models/Lottery.cs`

**Verificar navegación a Draws:**
```csharp
public class Lottery
{
    // ... propiedades existentes ...

    // DEBE TENER:
    public virtual ICollection<Draw> Draws { get; set; } = new List<Draw>();
}
```

### 2. DbContext

#### ✅ Actualizar: `LotteryDbContext.cs`

**Archivo:** `src/LotteryApi/Data/LotteryDbContext.cs`

**Cambios:**
```csharp
// ANTES:
public DbSet<LotteryBetTypeCompatibility> LotteryBetTypeCompatibilities { get; set; }
public DbSet<LotteryGameCompatibility> LotteryGameCompatibilities { get; set; }

// DESPUÉS:
public DbSet<DrawBetTypeCompatibility> DrawBetTypeCompatibilities { get; set; }
public DbSet<DrawGameCompatibility> DrawGameCompatibilities { get; set; }
```

**En OnModelCreating:**
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ACTUALIZAR relaciones:
    modelBuilder.Entity<DrawBetTypeCompatibility>()
        .HasOne(d => d.Draw)
        .WithMany(d => d.DrawBetTypeCompatibilities)
        .HasForeignKey(d => d.DrawId);

    modelBuilder.Entity<DrawGameCompatibility>()
        .HasOne(d => d.Draw)
        .WithMany(d => d.DrawGameCompatibilities)
        .HasForeignKey(d => d.DrawId);

    modelBuilder.Entity<Draw>()
        .HasOne(d => d.Lottery)
        .WithMany(l => l.Draws)
        .HasForeignKey(d => d.LotteryId);
}
```

### 3. CONTROLLERS

#### ✅ A. Actualizar: `LotteriesController.cs`

**Problema en línea 179-240:**

El endpoint `GET /api/lotteries/{id}/bet-types` está consultando `LotteryBetTypeCompatibilities` que ya no existe.

**Opción 1: Cambiar a consultar draws de la lotería**
```csharp
[HttpGet("{id}/bet-types")]
public async Task<IActionResult> GetBetTypesByLottery(int id)
{
    // Verificar que la lotería existe
    var lottery = await _context.Lotteries
        .Where(l => l.LotteryId == id && l.IsActive)
        .FirstOrDefaultAsync();

    if (lottery == null)
    {
        return NotFound(new { message = $"Lottery with ID {id} not found" });
    }

    // Obtener todos los draws de esta lotería
    var drawIds = await _context.Draws
        .Where(d => d.LotteryId == id && d.IsActive)
        .Select(d => d.DrawId)
        .ToListAsync();

    // Obtener bet types únicos de todos los draws de esta lotería
    var betTypes = await _context.DrawBetTypeCompatibilities
        .Where(dbtc => drawIds.Contains(dbtc.DrawId) && dbtc.IsActive)
        .Include(dbtc => dbtc.BetType)
            .ThenInclude(bt => bt!.PrizeFields.Where(pf => pf.IsActive))
        .Select(dbtc => dbtc.BetType!)
        .Distinct()
        .Where(bt => bt.IsActive)
        .OrderBy(bt => bt.BetTypeId)
        .ToListAsync();

    // ... resto del código igual ...
}
```

**Opción 2: Agregar endpoint en DrawsController**
```csharp
// En DrawsController.cs
[HttpGet("{id}/bet-types")]
public async Task<IActionResult> GetBetTypesByDraw(int id)
{
    var draw = await _context.Draws
        .Where(d => d.DrawId == id && d.IsActive)
        .FirstOrDefaultAsync();

    if (draw == null)
    {
        return NotFound(new { message = $"Draw with ID {id} not found" });
    }

    var betTypes = await _context.DrawBetTypeCompatibilities
        .Where(dbtc => dbtc.DrawId == id && dbtc.IsActive)
        .Include(dbtc => dbtc.BetType)
            .ThenInclude(bt => bt!.PrizeFields.Where(pf => pf.IsActive))
        .Select(dbtc => dbtc.BetType!)
        .Where(bt => bt.IsActive)
        .OrderBy(bt => bt.BetTypeId)
        .ToListAsync();

    // ... mapeo a DTOs ...

    return Ok(result);
}
```

#### ✅ B. Revisar: `DrawsController.cs`

**Archivo:** `src/LotteryApi/Controllers/DrawsController.cs`

Este controlador ya está bien. Tiene:
- `LotteryId` en línea 41, 81, 106, 133, 157
- Include de `"Lottery,Lottery.Country"` en línea 35
- Endpoint `GET /api/draws/lottery/{lotteryId}` para obtener draws por lotería

**Posible mejora:** Agregar endpoint para bet-types por draw (ver Opción 2 arriba)

### 4. DTOs

#### ✅ Verificar: `DrawDto.cs`

**Debe incluir:**
```csharp
public class DrawDto
{
    public int DrawId { get; set; }
    public int LotteryId { get; set; }  // ✓ Debe estar presente
    public string DrawName { get; set; }
    public TimeSpan DrawTime { get; set; }
    // ... otras propiedades ...
    public string? LotteryName { get; set; }  // ✓ Navegación
    public string? CountryName { get; set; }   // ✓ Navegación
}
```

#### ✅ Verificar: `CreateDrawDto.cs` y `UpdateDrawDto.cs`

**Deben incluir:**
```csharp
public class CreateDrawDto
{
    public int LotteryId { get; set; }  // ✓ REQUERIDO
    public string DrawName { get; set; }
    // ... otras propiedades ...
}
```

### 5. REPOSITORIES

#### ✅ Verificar: `DrawRepository.cs`

**Métodos que deben existir:**
- `GetDrawWithDetailsAsync(int id)` - Include Lottery y Country
- `GetDrawsByLotteryAsync(int lotteryId)` - Filtrar por LotteryId
- `GetDrawsByCountryAsync(int countryId)` - Join con Lottery.CountryId

#### ✅ Verificar: `LotteryRepository.cs`

**Métodos que deben existir:**
- `GetLotteryWithDrawsAsync(int id)` - Include Draws
- `GetLotteriesByCountryAsync(int countryId)`

### 6. NUEVOS ENDPOINTS SUGERIDOS

#### A. En `DrawsController.cs`:

```csharp
/// <summary>
/// Get bet types available for a specific draw
/// </summary>
[HttpGet("{id}/bet-types")]
[AllowAnonymous]
public async Task<IActionResult> GetBetTypesByDraw(int id) { ... }

/// <summary>
/// Get game types available for a specific draw
/// </summary>
[HttpGet("{id}/game-types")]
[AllowAnonymous]
public async Task<IActionResult> GetGameTypesByDraw(int id) { ... }
```

#### B. En `LotteriesController.cs`:

```csharp
/// <summary>
/// Get all draws for a specific lottery
/// </summary>
[HttpGet("{id}/draws")]
[AllowAnonymous]
public async Task<IActionResult> GetDrawsByLottery(int id) { ... }
```

## 📝 PASOS DE IMPLEMENTACIÓN

1. ✅ **Crear nuevos modelos:**
   - Renombrar `LotteryBetTypeCompatibility.cs` → `DrawBetTypeCompatibility.cs`
   - Renombrar `LotteryGameCompatibility.cs` → `DrawGameCompatibility.cs`
   - Actualizar propiedades y navegaciones

2. ✅ **Actualizar DbContext:**
   - Cambiar DbSet names
   - Actualizar relaciones en OnModelCreating

3. ✅ **Actualizar Controllers:**
   - Cambiar referencias de `LotteryBetTypeCompatibilities` → `DrawBetTypeCompatibilities`
   - Cambiar referencias de `LotteryGameCompatibilities` → `DrawGameCompatibilities`
   - Actualizar queries con `DrawId` en lugar de `LotteryId`

4. ✅ **Probar cambios:**
   - Compilar proyecto
   - Ejecutar migraciones si es necesario
   - Probar endpoints en Swagger
   - Verificar queries en base de datos

5. ✅ **Actualizar documentación:**
   - README.md
   - Swagger comments
   - API documentation

## ⚠️ IMPACTO EN FRONTEND

Si el frontend está consumiendo estos endpoints, necesitará actualizaciones:

### Endpoints Afectados:
- `GET /api/lotteries/{id}/bet-types` - Cambió lógica interna
- Cualquier referencia a `lottery_id` en compatibilidades debe cambiar a `draw_id`

### Nuevos Endpoints Disponibles:
- `GET /api/draws/{id}/bet-types` - Para obtener bet types de un draw específico
- `GET /api/draws/lottery/{lotteryId}` - Ya existía, para obtener draws de una lotería
- `GET /api/lotteries/{id}/draws` - Nuevo, alternativa al anterior

## 🔄 ESTADO ACTUAL

### ✅ Completado en Base de Datos:
- Tablas renombradas
- Columnas actualizadas
- Foreign keys recreadas
- Relación lottery → draws establecida (1:N)
- 31 lotteries con 69 draws relacionados

### ⏳ Pendiente en API:
- Actualizar modelos
- Actualizar DbContext
- Actualizar controllers
- Probar y validar

---

**Fecha:** 2025-11-13
**Base de Datos:** lottery-db (producción)
**API:** Lottery-Apis
