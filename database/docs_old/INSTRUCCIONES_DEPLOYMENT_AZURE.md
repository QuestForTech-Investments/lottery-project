# 🚀 INSTRUCCIONES DE DEPLOYMENT A AZURE SQL

**IMPORTANTE:** Estas instrucciones son para subir la base de datos optimizada a **PRODUCCIÓN**

---

## 📋 INFORMACIÓN DE CONEXIÓN

```
Servidor: lottery-sql-1505.database.windows.net
Base de datos: lottery-db
Usuario: lotteryAdmin
Contraseña: IotSlotsLottery123!
Suscripción: IotSlots
```

---

## ⚡ OPCIÓN 1: DEPLOYMENT AUTOMÁTICO (RECOMENDADO)

### Usando el Script de PowerShell

**1. Abrir PowerShell como Administrador**
```powershell
# En Windows, buscar "PowerShell" y ejecutar como administrador
```

**2. Navegar al directorio del proyecto**
```powershell
cd H:\GIT\Lottery-Database
```

**3. Ejecutar el script de deployment**
```powershell
# Deployment completo con backup
.\deploy-to-azure-production.ps1

# O sin confirmación interactiva
.\deploy-to-azure-production.ps1 -ConfirmDelete

# O sin backup (si la BD está vacía)
.\deploy-to-azure-production.ps1 -SkipBackup -ConfirmDelete
```

**4. Seguir las instrucciones en pantalla**

El script automáticamente:
- ✅ Verifica la conexión
- ✅ Obtiene estadísticas de la BD actual
- ✅ Crea backup (si tiene datos)
- ✅ Elimina todos los objetos existentes
- ✅ Despliega el nuevo esquema optimizado
- ✅ Verifica que todo esté correcto
- ✅ Ejecuta queries de prueba
- ✅ Genera log detallado

---

## 🔧 OPCIÓN 2: DEPLOYMENT MANUAL

### Paso a Paso desde PowerShell

**1. Conectar y verificar**
```powershell
$server = "lottery-sql-1505.database.windows.net"
$database = "lottery-db"
$username = "lotteryAdmin"
$password = "IotSlotsLottery123!"

# Test de conexión
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query "SELECT @@VERSION;"
```

**2. Ver tablas actuales (si hay)**
```powershell
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query "SELECT name FROM sys.tables ORDER BY name;" | Format-Table
```

**3. Eliminar todos los objetos (CUIDADO!)**
```powershell
$dropScript = @"
-- Eliminar Foreign Keys
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id))
    + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;
EXEC sp_executesql @sql;

-- Eliminar Views
SET @sql = N'';
SELECT @sql += N'DROP VIEW ' + QUOTENAME(SCHEMA_NAME(schema_id))
    + '.' + QUOTENAME(name) + ';'
FROM sys.views WHERE is_ms_shipped = 0;
EXEC sp_executesql @sql;

-- Eliminar Stored Procedures
SET @sql = N'';
SELECT @sql += N'DROP PROCEDURE ' + QUOTENAME(SCHEMA_NAME(schema_id))
    + '.' + QUOTENAME(name) + ';'
FROM sys.procedures WHERE is_ms_shipped = 0;
EXEC sp_executesql @sql;

-- Eliminar Functions
SET @sql = N'';
SELECT @sql += N'DROP FUNCTION ' + QUOTENAME(SCHEMA_NAME(schema_id))
    + '.' + QUOTENAME(name) + ';'
FROM sys.objects WHERE type IN ('FN', 'IF', 'TF') AND is_ms_shipped = 0;
EXEC sp_executesql @sql;

-- Eliminar Tables
SET @sql = N'';
SELECT @sql += N'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id))
    + '.' + QUOTENAME(name) + ';'
FROM sys.tables WHERE is_ms_shipped = 0;
EXEC sp_executesql @sql;
"@

Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query $dropScript `
  -QueryTimeout 300
```

**4. Ejecutar el script optimizado**
```powershell
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -InputFile "H:\GIT\Lottery-Database\lottery_database_complete.sql" `
  -QueryTimeout 0 `
  -Verbose
```

**5. Verificar deployment**
```powershell
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query @"
SELECT
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') AS Tablas,
    (SELECT COUNT(*) FROM sys.procedures WHERE is_ms_shipped = 0) AS StoredProcs,
    (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped = 0) AS Vistas,
    (SELECT COUNT(*) FROM sys.check_constraints) AS CheckConstraints
"@ | Format-Table
```

**Resultado esperado:**
- Tablas: 37
- StoredProcs: 8+
- Vistas: 6+
- CheckConstraints: 33+

---

## 🔍 OPCIÓN 3: DEPLOYMENT CON AZURE DATA STUDIO

**1. Abrir Azure Data Studio**

**2. Crear nueva conexión**
```
Connection type: Microsoft SQL Server
Server: lottery-sql-1505.database.windows.net
Authentication: SQL Login
User name: lotteryAdmin
Password: IotSlotsLottery123!
Database: lottery-db
```

**3. Ejecutar script de limpieza**
- New Query
- Copiar el script de eliminación (del Paso 3 de Opción 2)
- Execute (F5)

**4. Abrir y ejecutar script optimizado**
- File > Open File > lottery_database_complete.sql
- Execute (F5)
- Esperar 5-10 minutos

**5. Verificar en el Object Explorer**
- Refrescar
- Ver que aparezcan 37 tablas

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### Queries de Verificación

**1. Tablas críticas creadas:**
```sql
SELECT name FROM sys.tables
WHERE name IN (
    'tickets', 'ticket_lines', 'betting_pools', 'users', 'draws', 'results',
    'limit_rules', 'limit_consumption', 'hot_numbers',
    'error_logs', 'audit_log', 'financial_transactions'
)
ORDER BY name;
```

**Resultado esperado: 12 tablas**

**2. game_types tiene game_type_code:**
```sql
SELECT COUNT(*) AS tiene_game_type_code
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'game_types'
  AND COLUMN_NAME = 'game_type_code';
```

**Resultado esperado: 1**

**3. results tiene position:**
```sql
SELECT COUNT(*) AS tiene_position
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'results'
  AND COLUMN_NAME = 'position';
```

**Resultado esperado: 1**

**4. prizes.line_id es BIGINT:**
```sql
SELECT DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'prizes'
  AND COLUMN_NAME = 'line_id';
```

**Resultado esperado: bigint**

**5. CHECK constraints:**
```sql
SELECT COUNT(*) AS total_check_constraints
FROM sys.check_constraints;
```

**Resultado esperado: 33+**

**6. Índices críticos:**
```sql
SELECT name FROM sys.indexes
WHERE name LIKE 'IX_ticket%'
   OR name LIKE 'IX_result%'
ORDER BY name;
```

**Resultado esperado: Al menos 4 índices**

---

## 📊 ESTADÍSTICAS ESPERADAS

Después del deployment exitoso deberías tener:

| Objeto | Cantidad Esperada |
|--------|-------------------|
| **Tablas** | 37 |
| **Stored Procedures** | 8+ |
| **Vistas** | 6+ |
| **CHECK Constraints** | 33+ |
| **Índices (no PK)** | 44+ |
| **Foreign Keys** | 20+ |

### Tablas Nuevas (6 críticas):
- ✅ limit_rules
- ✅ limit_consumption
- ✅ hot_numbers
- ✅ error_logs
- ✅ audit_log
- ✅ financial_transactions

### Stored Procedures Clave:
- ✅ sp_CheckTicketWinners (mejorado)
- ✅ sp_PayTicketPrize (mejorado)
- ✅ sp_CopyBettingPoolConfig (mejorado)
- ✅ sp_CalculateTicketTotals
- ✅ sp_GetUserPermissions
- ✅ sp_GrantPermissionToUser
- ✅ sp_RevokePermissionFromUser
- ✅ sp_CancelTicket

---

## ⚠️ TROUBLESHOOTING

### Error: "Login failed for user 'lotteryAdmin'"
**Solución:**
1. Verificar que tu IP esté en el firewall de Azure SQL
2. Agregar tu IP:
```powershell
az sql server firewall-rule create `
  --resource-group rg-lottery-api `
  --server lottery-sql-1505 `
  --name AllowMyIP `
  --start-ip-address $(Invoke-RestMethod https://ifconfig.me) `
  --end-ip-address $(Invoke-RestMethod https://ifconfig.me)
```

### Error: "Timeout expired"
**Solución:**
- Aumentar el QueryTimeout a 0 (sin límite)
- O ejecutar el script en secciones

### Error: "Cannot drop the table 'X' because it is being referenced"
**Solución:**
- Usar el script de eliminación en orden (primero FKs, luego tablas)
- El script automático ya hace esto correctamente

### Error: "CREATE DATABASE not supported in Azure SQL Database"
**Solución:**
- El script de PowerShell automáticamente remueve estos comandos
- Si ejecutas manualmente, comenta las líneas con CREATE DATABASE y USE

---

## 📝 LOGS Y BACKUPS

### Ubicación de Archivos:

- **Backup de esquema:** `H:\GIT\Lottery-Database\backups\lottery-db-backup-YYYYMMDD-HHMMSS-schema.sql`
- **Deployment log:** `H:\GIT\Lottery-Database\deployment_log_YYYYMMDD_HHMMSS.txt`
- **Script original:** `H:\GIT\Lottery-Database\lottery_database_complete.sql.backup`

---

## ✅ CHECKLIST DE DEPLOYMENT

Antes de ejecutar:
- [ ] Backup local del script (ya existe: lottery_database_complete.sql.backup)
- [ ] PowerShell 7+ instalado
- [ ] SqlServer module instalado
- [ ] Conexión a internet estable
- [ ] Credenciales verificadas

Durante ejecución:
- [ ] Conexión exitosa
- [ ] Estadísticas obtenidas
- [ ] Backup creado (si tiene datos)
- [ ] Objetos eliminados
- [ ] Script ejecutado sin errores

Post-deployment:
- [ ] 37 tablas creadas
- [ ] 8+ stored procedures
- [ ] 6+ vistas
- [ ] 33+ CHECK constraints
- [ ] Verificar tablas críticas
- [ ] Ejecutar queries de prueba

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DEL DEPLOYMENT

1. **Configurar usuarios de aplicación:**
   ```sql
   -- Crear usuario de API
   CREATE USER api_user WITH PASSWORD = 'SecureApiPassword123!';
   ALTER ROLE db_datareader ADD MEMBER api_user;
   ALTER ROLE db_datawriter ADD MEMBER api_user;
   GRANT EXECUTE TO api_user;
   ```

2. **Poblar datos iniciales:**
   - Catálogos (countries, zones, lotteries, game_types)
   - Configuración inicial de betting pools
   - Usuarios administradores

3. **Configurar alertas:**
   - CPU > 80%
   - Storage > 90%
   - Errores en error_logs

4. **Configurar backup de largo plazo:**
   ```powershell
   az sql db ltr-policy set `
     --resource-group rg-lottery-api `
     --server lottery-sql-1505 `
     --database lottery-db `
     --weekly-retention P4W `
     --monthly-retention P12M `
     --yearly-retention P5Y
   ```

---

## 📞 SOPORTE

Si encuentras algún problema durante el deployment:

1. Revisar el log: `deployment_log_YYYYMMDD_HHMMSS.txt`
2. Verificar el archivo de backup creado
3. Consultar la documentación: `DATABASE_ANALYSIS_REPORT.md`
4. Revisar cambios aplicados: `SCRIPT_CHANGES_APPLIED.md`

---

**Generado:** 22 de Octubre, 2025
**Script:** lottery_database_complete.sql (versión optimizada 1.1)
**Tamaño:** 113 KB, 2,999 líneas, 37 tablas
