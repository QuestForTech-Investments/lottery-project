# Migración Rápida: Lottery → Draw (Desarrollo)

> **Contexto:** Estamos en desarrollo, sin usuarios en producción. Podemos hacer cambios directos.

## ✅ **¿Por qué es fácil ahora?**

```
✓ No hay usuarios afectados
✓ Datos de prueba (fácil regenerar)
✓ Frontend en desarrollo (cambios rápidos)
✓ Endpoints mantienen mismos nombres
✓ Solo cambia estructura interna
```

---

## 🚀 **PLAN EJECUTIVO (4-6 horas)**

### **PASO 1: Base de Datos (30 min)**

**Ejecutar script:**
```bash
cd /home/jorge/projects/Lottery-Apis
# El script está en: scripts/migrate-lottery-to-draw-simple.sql
```

**¿Qué hace el script?**
1. Renombra columnas: `lottery_id` → `draw_id` en todas las tablas
2. Renombra tablas:
   - `lotteries` → `lotteries_old` (backup)
   - `lotteries_copy` → `lotteries` (tipos correctos)
3. Recrea Foreign Keys apuntando a `draws`

**Resultado:**
```
✅ draws = Tabla principal de sorteos
✅ lotteries = Tipos de lotería
✅ Todas las FKs apuntan a draw_id
```

---

### **PASO 2: Modelos C# (30 min)**

#### 2.1 BettingPoolPrizesCommission.cs

```csharp
// ANTES
[Column("lottery_id")]
public int LotteryId { get; set; }

[ForeignKey("LotteryId")]
public virtual Lottery? Lottery { get; set; }

// DESPUÉS
[Column("draw_id")]
public int DrawId { get; set; }

[ForeignKey("DrawId")]
public virtual Draw? Draw { get; set; }
```

#### 2.2 LotteryBetTypeCompatibility.cs

```csharp
// CAMBIAR: lottery_id → draw_id
[Column("draw_id")]
public int DrawId { get; set; }

[ForeignKey("DrawId")]
public virtual Draw? Draw { get; set; }
```

#### 2.3 BancaPrizeConfig.cs

```csharp
// CAMBIAR: lottery_id → draw_id
[Column("draw_id")]
public int DrawId { get; set; }

[ForeignKey("DrawId")]
public virtual Draw? Draw { get; set; }
```

#### 2.4 Ticket.cs / TicketLine.cs (si aplica)

```csharp
// Si tienen lottery_id, cambiar a draw_id
```

#### 2.5 DbContext (actualizar relaciones)

```csharp
// src/LotteryApi/Data/LotteryDbContext.cs

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Draw → BettingPoolPrizesCommissions
    modelBuilder.Entity<Draw>()
        .HasMany(d => d.BettingPoolPrizesCommissions)
        .WithOne(bp => bp.Draw)
        .HasForeignKey(bp => bp.DrawId)
        .OnDelete(DeleteBehavior.Restrict);

    // ... otras relaciones
}
```

---

### **PASO 3: Repositorios y Queries (1 hora)**

**Buscar y reemplazar:**
```bash
# En todos los repositories
lottery_id → draw_id
LotteryId  → DrawId
```

**Ejemplo DrawRepository:**
```csharp
public async Task<IEnumerable<Draw>> GetActiveDrawsAsync()
{
    return await _context.Draws
        .Where(d => d.IsActive)
        .Include(d => d.Lottery)  // Tipo de lotería
        .OrderBy(d => d.DrawTime)
        .ToListAsync();
}
```

---

### **PASO 4: Controllers (1 hora)**

**CLAVE:** Mantener rutas `/api/lotteries` pero trabajar con `draws` internamente

#### LotteriesController.cs

```csharp
[ApiController]
[Route("api/[controller]")]  // Sigue siendo /api/lotteries
public class LotteriesController : ControllerBase
{
    // CAMBIO INTERNO: Usar DrawRepository en vez de LotteryRepository
    private readonly IDrawRepository _drawRepository;

    public LotteriesController(IDrawRepository drawRepository)
    {
        _drawRepository = drawRepository;
    }

    /// <summary>
    /// Get all draws (sorteos) - Endpoint mantiene nombre "lotteries"
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // INTERNAMENTE usa draws
        var draws = await _drawRepository.GetActiveDrawsAsync();

        // Mapear a DTO
        var dtos = draws.Select(d => new LotteryDto  // DTO sigue llamándose LotteryDto
        {
            LotteryId = d.DrawId,  // Mapear DrawId → LotteryId en respuesta
            LotteryName = d.DrawName,
            // ... otros campos
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var draw = await _drawRepository.GetByIdAsync(id);
        if (draw == null) return NotFound();

        var dto = new LotteryDto
        {
            LotteryId = draw.DrawId,
            LotteryName = draw.DrawName,
            // ...
        };

        return Ok(dto);
    }
}
```

**¿Por qué funciona?**
- Frontend sigue llamando `/api/lotteries`
- Frontend sigue enviando `lotteryId` en JSON
- Internamente la API traduce a `draw_id`
- **Frontend NO necesita cambiar nada (por ahora)**

---

### **PASO 5: DTOs (30 min)**

**Opción A: Mantener nombres actuales (sin cambios en frontend)**

```csharp
// LotteryDto.cs - Representa draws internamente
public class LotteryDto
{
    public int LotteryId { get; set; }  // Mapea a DrawId
    public string LotteryName { get; set; }  // Mapea a DrawName
    // ...
}
```

**Opción B: Crear DTOs nuevos (migración gradual)**

```csharp
// DrawDto.cs - Nuevo DTO correcto
public class DrawDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; }
    // ...
}

// Mantener LotteryDto para compatibilidad
// Agregar endpoints /api/draws gradualmente
```

---

### **PASO 6: Frontend (2 horas)**

**Opción A: No cambiar nada (mantener lotteryId)**
```javascript
// Frontend sigue igual
const response = await axios.get('/api/lotteries');
setLotteries(response.data);  // Funciona igual

// Payload sigue usando lotteryId
{ lotteryId: 5, nombre: "NY Tarde" }
```

**Opción B: Actualizar gradualmente (recomendado)**
```javascript
// Cambiar nombres en frontend
const response = await axios.get('/api/lotteries');  // Endpoint igual
const draws = response.data.map(item => ({
    drawId: item.lotteryId,  // Mapear en cliente
    drawName: item.lotteryName,
    // ...
}));
setDraws(draws);

// Actualizar componentes
{draws.map(draw => (
    <div key={draw.drawId}>
        {draw.drawName}
    </div>
))}
```

---

## 🎯 **Orden de Ejecución Recomendado**

### **Día 1: Base de Datos + Modelos (2-3 horas)**
1. ✅ Ejecutar script SQL (30 min)
2. ✅ Actualizar 5 modelos C# (1 hora)
3. ✅ Actualizar DbContext (30 min)
4. ✅ Compilar y verificar (30 min)

### **Día 2: API (2-3 horas)**
5. ✅ Actualizar repositories (1 hora)
6. ✅ Actualizar controllers (1 hora)
7. ✅ Probar endpoints (1 hora)

### **Día 3 (Opcional): Frontend**
8. ⚠️ Actualizar nombres de variables (si quieres)
9. ⚠️ O dejarlo como está (funciona igual)

---

## 🧪 **Testing Rápido**

### Después de DB + Modelos:
```bash
# Compilar
dotnet build

# Debería compilar sin errores
```

### Después de Controllers:
```bash
# Iniciar API
dotnet run

# Probar endpoints
curl http://localhost:5000/api/lotteries
curl http://localhost:5000/api/lotteries/1
```

### Después de Frontend:
```bash
# Iniciar webapp
npm run dev

# Verificar en browser:
# - Selector de sorteos funciona
# - Configuración de premios funciona
# - Creación de tickets funciona
```

---

## 📝 **Checklist Final**

### Base de Datos
- [ ] Script SQL ejecutado sin errores
- [ ] Tabla `draws` tiene datos
- [ ] Tabla `lotteries` tiene tipos
- [ ] FKs apuntan a `draw_id`

### API
- [ ] 5 modelos actualizados (draw_id en vez de lottery_id)
- [ ] DbContext configurado
- [ ] Código compila
- [ ] Repositories usan draw_id
- [ ] Controllers responden correctamente

### Frontend
- [ ] Selector de sorteos funciona
- [ ] Configuración de premios funciona
- [ ] Tickets se crean correctamente

---

## 🚨 **Si Algo Sale Mal**

### Rollback de Base de Datos
```sql
-- Renombrar tablas al estado original
EXEC sp_rename 'lotteries', 'lotteries_new';
EXEC sp_rename 'lotteries_old', 'lotteries';

-- Renombrar columnas
EXEC sp_rename 'betting_pool_prizes_commissions.draw_id', 'lottery_id', 'COLUMN';
-- ... repetir para otras tablas
```

### Rollback de Código
```bash
git checkout main
```

---

## 💡 **Ventajas de Este Approach**

```
✅ Frontend sigue funcionando (endpoints iguales)
✅ Cambios incrementales (no todo de golpe)
✅ Base de datos correcta desde ahora
✅ Código más claro a largo plazo
✅ Fácil de entender para nuevos developers
```

---

## 📞 **Siguiente Paso**

**¿Empezamos?**

1. **Opción A:** Empezar con DB ahora (30 min)
2. **Opción B:** Revisar script SQL primero
3. **Opción C:** Hacer backup de DB antes

**¿Cuál prefieres?**
