# Patrón de Guardado en Lote (Batch Save)

## Problema Original

Cuando un formulario tiene N items que guardar individualmente, hacer N requests HTTP es:
- **Lento:** 200+ requests secuenciales = 90+ segundos
- **Propenso a errores:** Rate limiting (429), timeouts
- **Mala UX:** El usuario espera demasiado

## Solución: Endpoints Batch

### Principio
> Recolectar todos los datos en memoria → enviar en 1-2 requests → procesar todo en DB con una sola transacción

### Implementación Backend (.NET)

```csharp
// 1. DTO para el batch
public class BatchSaveItemDto {
    public int ItemId { get; set; }
    public string Value { get; set; }
}

public class BatchSaveRequestDto {
    public List<BatchSaveItemDto> Items { get; set; } = new();
}

public class BatchSaveResponseDto {
    public bool Success { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
}

// 2. Endpoint batch
[HttpPost("batch")]
public async Task<ActionResult<BatchSaveResponseDto>> BatchSave(
    int parentId,
    [FromBody] BatchSaveRequestDto dto)
{
    // CLAVE: Cargar todos los registros existentes en UNA query
    var existingRecords = await _context.Items
        .Where(i => i.ParentId == parentId)
        .ToListAsync();

    var created = 0;
    var updated = 0;

    // Procesar todo en memoria
    foreach (var item in dto.Items)
    {
        var existing = existingRecords.FirstOrDefault(r => r.ItemId == item.ItemId);

        if (existing != null)
        {
            existing.Value = item.Value;
            updated++;
        }
        else
        {
            _context.Items.Add(new Item {
                ParentId = parentId,
                ItemId = item.ItemId,
                Value = item.Value
            });
            created++;
        }
    }

    // UNA SOLA llamada a la DB
    await _context.SaveChangesAsync();

    return Ok(new BatchSaveResponseDto {
        Success = true,
        CreatedCount = created,
        UpdatedCount = updated
    });
}
```

### Implementación Frontend (TypeScript)

```typescript
// ANTES: N requests secuenciales (LENTO)
for (const item of items) {
    await api.post(`/items/${item.id}`, item);
}

// DESPUÉS: 1 request batch (RÁPIDO)
const batchItems = items.map(item => ({
    itemId: item.id,
    value: item.value
}));

await api.post('/items/batch', { items: batchItems });
```

## Caso Real: Premios y Comisiones

### Antes
- 70 sorteos × 3 tipos de apuesta = 210 requests
- Cada request: POST o PUT individual
- Tiempo: 90+ segundos
- Problema adicional: Rate limit 429

### Después
- Comisiones: 1 request batch
- Premios: 2 requests (general + batch draws)
- Tiempo: ~14 segundos
- Sin rate limiting

### Endpoints Creados

| Endpoint | Propósito |
|----------|-----------|
| `POST /betting-pools/{id}/prizes-commissions/batch` | Todas las comisiones en 1 request |
| `POST /betting-pools/{id}/draws/prize-config/batch` | Todos los premios por sorteo en 1 request |

## Lecciones Aprendidas

### ✅ Aciertos
1. **Cargar existentes primero:** Una sola query para todos los registros existentes
2. **Procesar en memoria:** Iterar sin llamadas DB intermedias
3. **SaveChangesAsync() al final:** EF Core optimiza las operaciones en batch
4. **DTOs específicos:** No reutilizar DTOs de operaciones individuales
5. **⭐ Herencia > Propagación:** Si el backend soporta herencia/fallback, no propagar en frontend

### ❌ Errores a Evitar
1. **No cargar existentes:** Cada item hace su propia query → N+1 problem
2. **SaveChangesAsync() por item:** Pierde la optimización de batch
3. **No actualizar lista local:** Error 400 al intentar POST duplicado
4. **Propagar todos los valores:** Aunque uses batch, 3920 items sigue siendo lento

### 🔥 Caso Real: Herencia vs Propagación

**Problema encontrado (2026-02-07):**
- Batch de premios seguía lento (~30s) aunque solo hacía 1 request
- Razón: Enviaba ~3920 items (70 draws × 14 bet types × 4 fields)

**Solución:**
```typescript
// ❌ ANTES: Propagar valores en frontend y guardar todos
if (drawId === 'general') {
  Object.keys(formData).forEach(key => {
    if (key.startsWith('general_') || key.startsWith('draw_')) { // 3920 items
      filteredFormData[key] = formData[key];
    }
  });
}

// ✅ DESPUÉS: Solo guardar general, draws heredan del backend
if (drawId === 'general') {
  Object.keys(formData).forEach(key => {
    if (key.startsWith('general_')) { // ~56 items
      filteredFormData[key] = formData[key];
    }
  });
}
```

**Backend con herencia:**
```csharp
// Endpoint: GET /prize-config/resolved
// Prioridad: draw_specific → banca_default → system_default
```

**Resultado:** 30 segundos → 2 segundos

### Problema del Error 400 (POST duplicado)

```typescript
// PROBLEMA: existingRecords se carga al inicio
// Después de POST exitoso, el siguiente draw con mismo lotteryId
// intenta POST de nuevo porque existingRecords no sabe del nuevo registro

// SOLUCIÓN: Actualizar existingRecords después de POST
if (response.ok) {
    existingRecords.push({
        lotteryId: newRecord.lotteryId,
        // ... otros campos
    });
}
```

## Cuándo Usar Este Patrón

| Escenario | ¿Usar Batch? |
|-----------|--------------|
| Guardar 1-3 items | No |
| Guardar 10+ items | Sí |
| Items independientes entre sí | Sí (ideal) |
| Items con dependencias | Tal vez (evaluar) |
| Rate limiting frecuente | Definitivamente sí |

## Checklist de Implementación

- [ ] Crear DTOs para batch request/response
- [ ] Endpoint backend con una sola query de existentes
- [ ] Procesar todo en memoria (sin await intermedios)
- [ ] Un solo SaveChangesAsync() al final
- [ ] Frontend: recolectar todos los items antes de enviar
- [ ] Manejar errores a nivel de batch (rollback si falla)
- [ ] Probar con datos reales (70+ items)

---

**Fecha de creación:** 2026-02-07
**Aplicado en:** EditBettingPool - Premios & Comisiones
