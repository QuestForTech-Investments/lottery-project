# Paso 1 (Alternativa): Verificar BD desde la API

Si no tienes acceso directo a la base de datos, podemos crear un endpoint temporal en la API para verificar las columnas.

## Opción A: Crear Endpoint Temporal de Verificación

### 1. Agregar al BranchesController.cs (temporal, solo para verificación)

```csharp
// TEMPORAL - Solo para verificar estructura de BD
[HttpGet("check-database-schema")]
public async Task<IActionResult> CheckDatabaseSchema()
{
    try
    {
        var columns = await _context.Database
            .SqlQueryRaw<string>(@"
                SELECT COLUMN_NAME + ' (' + DATA_TYPE + ')' as ColumnInfo
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'branches'
                ORDER BY ORDINAL_POSITION
            ")
            .ToListAsync();

        var tables = await _context.Database
            .SqlQueryRaw<string>(@"
                SELECT TABLE_NAME
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_NAME LIKE 'branch%'
                ORDER BY TABLE_NAME
            ")
            .ToListAsync();

        return Ok(new
        {
            success = true,
            totalColumns = columns.Count,
            branchesTableColumns = columns,
            branchRelatedTables = tables
        });
    }
    catch (Exception ex)
    {
        return Ok(new
        {
            success = false,
            error = ex.Message
        });
    }
}
```

### 2. Ejecutar desde el navegador o Postman

```
GET http://localhost:7001/api/branches/check-database-schema
```

O desde el frontend:

```
GET https://localhost:7001/api/branches/check-database-schema
```

### 3. Revisar la respuesta

```json
{
  "success": true,
  "totalColumns": 25,
  "branchesTableColumns": [
    "branch_id (int)",
    "zone_id (int)",
    "name (nvarchar)",
    "location (nvarchar)",
    "credit_limit (decimal)",
    "fall_type (nvarchar)",
    ...
  ],
  "branchRelatedTables": [
    "branches",
    "branch_footers",
    "branch_schedules",
    ...
  ]
}
```

---

## Opción B: Verificar el Modelo Branch.cs

También podemos ver qué propiedades tiene el modelo actual de C#:

### 1. Revisar archivo: `/mnt/h/GIT/lottery-api/LotteryAPI/Models/Branch.cs`

Buscar algo como:

```csharp
public class Branch
{
    public int BranchId { get; set; }
    public string Name { get; set; }
    public int ZoneId { get; set; }

    // Ver todas las propiedades aquí
    // Las que existan aquí, existen en la BD

    public decimal? CreditLimit { get; set; }
    public bool? SmsOnly { get; set; }  // ¿Existe esta?
    public int? CancelMinutes { get; set; }  // ¿Existe esta?
    // etc.
}
```

---

## Opción C: Revisar los Scripts de Migración Ejecutados

Verificar qué scripts SQL ya se ejecutaron:

```bash
# En el proyecto de la API
ls -la /mnt/h/GIT/lottery-api/LotteryAPI/*.sql
```

Especialmente revisar:
- `add_branch_configuration_columns.sql` (ya existe)
- Ver si hay más scripts de migración

---

## ¿Qué opción prefieres?

1. **Opción A**: Crear endpoint temporal (más rápido, no requiere acceso a BD)
2. **Opción B**: Revisar el modelo Branch.cs (inmediato)
3. **Opción C**: Conectarse directamente a Azure SQL (más preciso)

**Recomendación**: Empezar con Opción B (revisar Branch.cs), luego confirmar con Opción A (endpoint).
