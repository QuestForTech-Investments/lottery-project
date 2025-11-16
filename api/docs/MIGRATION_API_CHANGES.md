# API Changes Required: Migración lotteries → draws

**Fecha:** 2025-11-13
**Proyecto:** Lottery-Apis
**Relacionado con:** Lottery-Database/MIGRATION_SIMPLE_LOTTERIES_TO_DRAWS.sql

---

## 📋 Resumen de Cambios en Base de Datos

La base de datos `lottery-db` ha sido migrada para:
- ❌ Deprecar la tabla `lotteries`
- ✅ Usar solo la tabla `draws` como referencia principal
- ✅ Eliminar todas las columnas `lottery_id`
- ✅ Renombrar `lottery_game_compatibility` → `draw_game_compatibility`
- ✅ Renombrar `lottery_bet_type_compatibility` → `draw_bet_type_compatibility`

---

## 🔧 Cambios Requeridos en la API

### 1. Models (src/LotteryApi/Models/)

#### ✅ **TicketLine.cs** - MODIFICAR
```csharp
// ❌ ANTES
public class TicketLine
{
    public long LineId { get; set; }
    public long TicketId { get; set; }
    public int LotteryId { get; set; }  // ELIMINAR
    public int DrawId { get; set; }

    // Navigation properties
    public Lottery Lottery { get; set; }  // ELIMINAR
    public Draw Draw { get; set; }
    public Ticket Ticket { get; set; }
}

// ✅ DESPUÉS
public class TicketLine
{
    public long LineId { get; set; }
    public long TicketId { get; set; }
    public int DrawId { get; set; }  // Solo draw_id

    // Navigation properties
    public Draw Draw { get; set; }  // Solo Draw
    public Ticket Ticket { get; set; }
}
```

#### ✅ **Draw.cs** - MODIFICAR
```csharp
// ❌ ANTES
public class Draw
{
    public int DrawId { get; set; }
    public int LotteryId { get; set; }  // ELIMINAR
    public string DrawName { get; set; }

    // Navigation properties
    public Lottery Lottery { get; set; }  // ELIMINAR
}

// ✅ DESPUÉS
public class Draw
{
    public int DrawId { get; set; }
    public string DrawName { get; set; }
    public TimeSpan DrawTime { get; set; }
    public bool IsActive { get; set; }

    // No navigation a Lottery
}
```

#### ✅ **LotteryGameCompatibility.cs** - RENOMBRAR A **DrawGameCompatibility.cs**
```csharp
// ❌ ANTES (LotteryGameCompatibility.cs)
public class LotteryGameCompatibility
{
    public int CompatibilityId { get; set; }
    public int LotteryId { get; set; }
    public int GameTypeId { get; set; }

    public Lottery Lottery { get; set; }
    public GameType GameType { get; set; }
}

// ✅ DESPUÉS (DrawGameCompatibility.cs)
public class DrawGameCompatibility
{
    public int CompatibilityId { get; set; }
    public int DrawId { get; set; }  // Cambio aquí
    public int GameTypeId { get; set; }

    public Draw Draw { get; set; }  // Cambio aquí
    public GameType GameType { get; set; }
}
```

#### ✅ **LotteryBetTypeCompatibility.cs** - RENOMBRAR A **DrawBetTypeCompatibility.cs**
```csharp
// ❌ ANTES (LotteryBetTypeCompatibility.cs)
public class LotteryBetTypeCompatibility
{
    public int CompatibilityId { get; set; }
    public int LotteryId { get; set; }
    public int BetTypeId { get; set; }

    public Lottery Lottery { get; set; }
    public BetType BetType { get; set; }
}

// ✅ DESPUÉS (DrawBetTypeCompatibility.cs)
public class DrawBetTypeCompatibility
{
    public int CompatibilityId { get; set; }
    public int DrawId { get; set; }  // Cambio aquí
    public int BetTypeId { get; set; }

    public Draw Draw { get; set; }  // Cambio aquí
    public BetType BetType { get; set; }
}
```

#### ⚠️ **Lottery.cs** - DEPRECAR (opcional)
```csharp
// Opción 1: Mantener pero marcar como obsoleto
[Obsolete("Lottery entity is deprecated. Use Draw instead.")]
public class Lottery
{
    // ... campos existentes
}

// Opción 2: Eliminar completamente el archivo
```

#### ✅ **BettingPoolPrizesCommission.cs** - MODIFICAR (si existe)
```csharp
// ❌ ANTES
public class BettingPoolPrizesCommission
{
    public int PrizeCommissionId { get; set; }
    public int BettingPoolId { get; set; }
    public int LotteryId { get; set; }  // ELIMINAR

    public Lottery Lottery { get; set; }  // ELIMINAR
}

// ✅ DESPUÉS
public class BettingPoolPrizesCommission
{
    public int PrizeCommissionId { get; set; }
    public int BettingPoolId { get; set; }
    // Sin LotteryId
}
```

---

### 2. DTOs (src/LotteryApi/DTOs/)

#### ✅ **TicketLineDto.cs** - MODIFICAR
```csharp
// ❌ ANTES
public class TicketLineDto
{
    public long LineId { get; set; }
    public int LotteryId { get; set; }  // ELIMINAR
    public int DrawId { get; set; }
    public string LotteryName { get; set; }  // ELIMINAR
    public string DrawName { get; set; }
}

// ✅ DESPUÉS
public class TicketLineDto
{
    public long LineId { get; set; }
    public int DrawId { get; set; }
    public string DrawName { get; set; }
    // Sin referencias a Lottery
}
```

#### ✅ **CreateTicketLineDto.cs** - MODIFICAR
```csharp
// ❌ ANTES
public class CreateTicketLineDto
{
    public int LotteryId { get; set; }  // ELIMINAR
    public int DrawId { get; set; }
    public string BetNumber { get; set; }
}

// ✅ DESPUÉS
public class CreateTicketLineDto
{
    public int DrawId { get; set; }  // Solo DrawId
    public string BetNumber { get; set; }
}
```

#### ✅ **DrawDto.cs** - MODIFICAR
```csharp
// ❌ ANTES
public class DrawDto
{
    public int DrawId { get; set; }
    public int LotteryId { get; set; }  // ELIMINAR
    public string LotteryName { get; set; }  // ELIMINAR
    public string DrawName { get; set; }
}

// ✅ DESPUÉS
public class DrawDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; }
    public string DrawTime { get; set; }
    public bool IsActive { get; set; }
    // Sin referencias a Lottery
}
```

#### ⚠️ **LotteryDto.cs** - DEPRECAR
```csharp
// Opción 1: Marcar como obsoleto
[Obsolete("LotteryDto is deprecated. Use DrawDto instead.")]
public class LotteryDto { }

// Opción 2: Eliminar completamente
```

---

### 3. DbContext (src/LotteryApi/Data/LotteryDbContext.cs)

```csharp
// ❌ ANTES
public class LotteryDbContext : DbContext
{
    public DbSet<Lottery> Lotteries { get; set; }
    public DbSet<Draw> Draws { get; set; }
    public DbSet<LotteryGameCompatibility> LotteryGameCompatibility { get; set; }
    public DbSet<LotteryBetTypeCompatibility> LotteryBetTypeCompatibility { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuración de Lottery
        modelBuilder.Entity<Lottery>()
            .ToTable("lotteries");

        // Draw con FK a Lottery
        modelBuilder.Entity<Draw>()
            .HasOne(d => d.Lottery)
            .WithMany()
            .HasForeignKey(d => d.LotteryId);
    }
}

// ✅ DESPUÉS
public class LotteryDbContext : DbContext
{
    // Opción 1: Mantener Lotteries pero no usarlo
    [Obsolete("Lotteries is deprecated")]
    public DbSet<Lottery> Lotteries { get; set; }

    // Tablas activas
    public DbSet<Draw> Draws { get; set; }
    public DbSet<DrawGameCompatibility> DrawGameCompatibility { get; set; }  // RENOMBRADO
    public DbSet<DrawBetTypeCompatibility> DrawBetTypeCompatibility { get; set; }  // RENOMBRADO

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Lottery (deprecado, solo para backward compatibility)
        modelBuilder.Entity<Lottery>()
            .ToTable("lotteries");

        // Draw (sin FK a Lottery)
        modelBuilder.Entity<Draw>()
            .ToTable("draws");

        // DrawGameCompatibility (tabla renombrada)
        modelBuilder.Entity<DrawGameCompatibility>()
            .ToTable("draw_game_compatibility")
            .HasOne(dgc => dgc.Draw)
            .WithMany()
            .HasForeignKey(dgc => dgc.DrawId);

        // DrawBetTypeCompatibility (tabla renombrada)
        modelBuilder.Entity<DrawBetTypeCompatibility>()
            .ToTable("draw_bet_type_compatibility")
            .HasOne(dbtc => dbtc.Draw)
            .WithMany()
            .HasForeignKey(dbtc => dbtc.DrawId);

        // TicketLine (sin FK a Lottery)
        modelBuilder.Entity<TicketLine>()
            .HasOne(tl => tl.Draw)
            .WithMany()
            .HasForeignKey(tl => tl.DrawId);
    }
}
```

---

### 4. Repositories (src/LotteryApi/Repositories/)

#### ✅ **ILotteryRepository.cs** - DEPRECAR
```csharp
// Opción 1: Marcar como obsoleto
[Obsolete("Use IDrawRepository instead")]
public interface ILotteryRepository { }

// Opción 2: Eliminar completamente
```

#### ✅ **LotteryRepository.cs** - DEPRECAR
```csharp
// Eliminar o marcar como obsoleto
```

#### ✅ **TicketRepository.cs** - MODIFICAR
```csharp
// ❌ ANTES
public async Task<TicketLine> GetTicketLineAsync(long lineId)
{
    return await _context.TicketLines
        .Include(tl => tl.Lottery)  // ELIMINAR
        .Include(tl => tl.Draw)
        .FirstOrDefaultAsync(tl => tl.LineId == lineId);
}

// ✅ DESPUÉS
public async Task<TicketLine> GetTicketLineAsync(long lineId)
{
    return await _context.TicketLines
        .Include(tl => tl.Draw)  // Solo Draw
        .FirstOrDefaultAsync(tl => tl.LineId == lineId);
}
```

---

### 5. Controllers (src/LotteryApi/Controllers/)

#### ✅ **LotteriesController.cs** - DEPRECAR
```csharp
// Opción 1: Marcar endpoints como obsoletos
[ApiController]
[Route("api/[controller]")]
[Obsolete("This controller is deprecated. Use DrawsController instead.")]
public class LotteriesController : ControllerBase
{
    [HttpGet]
    [Obsolete("Use GET /api/draws instead")]
    public async Task<IActionResult> GetAll()
    {
        // Retornar mensaje de deprecación
        return StatusCode(410, new {
            message = "This endpoint is deprecated. Use /api/draws instead.",
            deprecatedSince = "2025-11-13",
            alternativeEndpoint = "/api/draws"
        });
    }
}

// Opción 2: Eliminar completamente el controlador
```

#### ✅ **DrawsController.cs** - MODIFICAR
```csharp
// ❌ ANTES
[HttpGet]
public async Task<ActionResult<IEnumerable<DrawDto>>> GetDraws([FromQuery] int? lotteryId)
{
    var query = _context.Draws.AsQueryable();

    if (lotteryId.HasValue)
        query = query.Where(d => d.LotteryId == lotteryId.Value);  // ELIMINAR

    var draws = await query.ToListAsync();
    return Ok(draws);
}

// ✅ DESPUÉS
[HttpGet]
public async Task<ActionResult<IEnumerable<DrawDto>>> GetDraws(
    [FromQuery] bool? isActive,
    [FromQuery] string search)
{
    var query = _context.Draws.AsQueryable();

    if (isActive.HasValue)
        query = query.Where(d => d.IsActive == isActive.Value);

    if (!string.IsNullOrEmpty(search))
        query = query.Where(d => d.DrawName.Contains(search));

    var draws = await query.ToListAsync();
    return Ok(draws);
}
```

#### ✅ **TicketsController.cs** - MODIFICAR
```csharp
// ❌ ANTES
[HttpPost("lines")]
public async Task<IActionResult> CreateTicketLine([FromBody] CreateTicketLineDto dto)
{
    // Validar lottery exists
    var lottery = await _context.Lotteries.FindAsync(dto.LotteryId);  // ELIMINAR
    if (lottery == null)
        return NotFound("Lottery not found");

    var ticketLine = new TicketLine
    {
        TicketId = dto.TicketId,
        LotteryId = dto.LotteryId,  // ELIMINAR
        DrawId = dto.DrawId,
        // ...
    };
}

// ✅ DESPUÉS
[HttpPost("lines")]
public async Task<IActionResult> CreateTicketLine([FromBody] CreateTicketLineDto dto)
{
    // Validar draw exists
    var draw = await _context.Draws.FindAsync(dto.DrawId);
    if (draw == null)
        return NotFound("Draw not found");

    var ticketLine = new TicketLine
    {
        TicketId = dto.TicketId,
        DrawId = dto.DrawId,  // Solo DrawId
        // ...
    };
}
```

---

### 6. Validators (src/LotteryApi/Validators/)

#### ✅ **CreateTicketLineDtoValidator.cs** - MODIFICAR
```csharp
// ❌ ANTES
public class CreateTicketLineDtoValidator : AbstractValidator<CreateTicketLineDto>
{
    public CreateTicketLineDtoValidator(LotteryDbContext context)
    {
        RuleFor(x => x.LotteryId)  // ELIMINAR
            .NotEmpty()
            .MustAsync(async (lotteryId, cancellation) =>
            {
                return await context.Lotteries.AnyAsync(l => l.LotteryId == lotteryId);
            })
            .WithMessage("Lottery does not exist");

        RuleFor(x => x.DrawId)
            .NotEmpty();
    }
}

// ✅ DESPUÉS
public class CreateTicketLineDtoValidator : AbstractValidator<CreateTicketLineDto>
{
    public CreateTicketLineDtoValidator(LotteryDbContext context)
    {
        RuleFor(x => x.DrawId)
            .NotEmpty()
            .MustAsync(async (drawId, cancellation) =>
            {
                return await context.Draws.AnyAsync(d => d.DrawId == drawId);
            })
            .WithMessage("Draw does not exist");
    }
}
```

---

## 📝 Checklist de Cambios

### Models
- [ ] ✅ Modificar `TicketLine.cs` - eliminar `LotteryId`
- [ ] ✅ Modificar `Draw.cs` - eliminar `LotteryId`
- [ ] ✅ Renombrar `LotteryGameCompatibility.cs` → `DrawGameCompatibility.cs`
- [ ] ✅ Renombrar `LotteryBetTypeCompatibility.cs` → `DrawBetTypeCompatibility.cs`
- [ ] ✅ Deprecar/eliminar `Lottery.cs`
- [ ] ✅ Modificar `BettingPoolPrizesCommission.cs` (si existe)

### DTOs
- [ ] ✅ Modificar `TicketLineDto.cs`
- [ ] ✅ Modificar `CreateTicketLineDto.cs`
- [ ] ✅ Modificar `DrawDto.cs`
- [ ] ✅ Deprecar/eliminar `LotteryDto.cs`

### Data
- [ ] ✅ Modificar `LotteryDbContext.cs`
  - [ ] Renombrar DbSets
  - [ ] Actualizar configuraciones de Entity Framework
  - [ ] Eliminar FK a Lottery

### Repositories
- [ ] ✅ Deprecar/eliminar `ILotteryRepository.cs`
- [ ] ✅ Deprecar/eliminar `LotteryRepository.cs`
- [ ] ✅ Modificar `TicketRepository.cs` - eliminar Include de Lottery

### Controllers
- [ ] ✅ Deprecar/eliminar `LotteriesController.cs`
- [ ] ✅ Modificar `DrawsController.cs` - eliminar filtro por lotteryId
- [ ] ✅ Modificar `TicketsController.cs` - eliminar validación de lottery

### Validators
- [ ] ✅ Modificar `CreateTicketLineDtoValidator.cs`
- [ ] ✅ Modificar otros validadores que referencien Lottery

### Tests
- [ ] ✅ Actualizar tests de TicketLine
- [ ] ✅ Actualizar tests de Draw
- [ ] ✅ Eliminar tests de Lottery

---

## 🚀 Orden de Implementación

1. **Fase 1: Backup y preparación**
   - Backup del código actual
   - Crear rama `feature/migrate-to-draws`

2. **Fase 2: Models y DTOs**
   - Modificar/renombrar clases de modelo
   - Modificar DTOs
   - **NO compilar todavía** (habrá errores)

3. **Fase 3: DbContext**
   - Actualizar LotteryDbContext.cs
   - Actualizar configuraciones de EF

4. **Fase 4: Repositories**
   - Modificar repositorios existentes
   - Deprecar/eliminar LotteryRepository

5. **Fase 5: Controllers**
   - Modificar controllers existentes
   - Deprecar/eliminar LotteriesController

6. **Fase 6: Validators y Services**
   - Actualizar validadores
   - Actualizar servicios

7. **Fase 7: Testing**
   - Compilar proyecto
   - Ejecutar tests
   - Testing manual

8. **Fase 8: Deploy**
   - Merge a main
   - Deploy a producción

---

## ⚠️ IMPORTANTE

**ORDEN DE EJECUCIÓN:**

1. ✅ PRIMERO: Ejecutar script de migración de base de datos
2. ✅ DESPUÉS: Desplegar código actualizado de API
3. ✅ FINALMENTE: Actualizar frontend

**NO desplegar código antes de migrar la base de datos o la API dejará de funcionar.**

---

**Última actualización:** 2025-11-13
**Estado:** Pendiente de implementación
**Relacionado:** MIGRATION_SIMPLE_LOTTERIES_TO_DRAWS.sql
