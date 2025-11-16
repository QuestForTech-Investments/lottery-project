# ============================================================================
# DEPLOYMENT SCRIPT - Azure SQL Database (PRODUCTION)
# ============================================================================

param(
    [switch]$SkipBackup = $false
)

$server = "lottery-sql-1505.database.windows.net"
$database = "lottery-db"
$username = "lotteryAdmin"
$password = "IotSlotsLottery123!"
$scriptPath = "H:\GIT\Lottery-Database\lottery_database_complete.sql"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT A PRODUCCION - AZURE SQL DATABASE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Test de conexion
Write-Host "[1/6] Probando conexion..." -ForegroundColor Yellow

try {
    $result = Invoke-Sqlcmd `
        -ServerInstance $server `
        -Database $database `
        -Username $username `
        -Password $password `
        -Query "SELECT DB_NAME() AS DatabaseName, GETDATE() AS CurrentTime;" `
        -ErrorAction Stop

    Write-Host "  OK - Conectado a: $($result.DatabaseName)" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# PASO 2: Obtener estadisticas actuales
Write-Host ""
Write-Host "[2/6] Obteniendo estadisticas de BD actual..." -ForegroundColor Yellow

try {
    $stats = Invoke-Sqlcmd `
        -ServerInstance $server `
        -Database $database `
        -Username $username `
        -Password $password `
        -Query "SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';" `
        -ErrorAction Stop

    Write-Host "  Tablas actuales: $($stats.cnt)" -ForegroundColor Green
}
catch {
    Write-Host "  Advertencia: No se pudieron obtener estadisticas" -ForegroundColor Yellow
}

# PASO 3: Eliminar objetos existentes
Write-Host ""
Write-Host "[3/6] Eliminando objetos existentes..." -ForegroundColor Yellow

$dropScript = @"
DECLARE @sql NVARCHAR(MAX) = N'';

-- Eliminar Foreign Keys
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

try {
    Invoke-Sqlcmd `
        -ServerInstance $server `
        -Database $database `
        -Username $username `
        -Password $password `
        -Query $dropScript `
        -QueryTimeout 300 `
        -ErrorAction Stop

    Write-Host "  OK - Objetos eliminados" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# PASO 4: Deploy del nuevo esquema
Write-Host ""
Write-Host "[4/6] Desplegando esquema optimizado..." -ForegroundColor Yellow
Write-Host "  Esto puede tomar 5-10 minutos, por favor espere..." -ForegroundColor Cyan

try {
    Invoke-Sqlcmd `
        -ServerInstance $server `
        -Database $database `
        -Username $username `
        -Password $password `
        -InputFile $scriptPath `
        -QueryTimeout 0 `
        -ErrorAction Stop `
        -Verbose

    Write-Host "  OK - Script ejecutado exitosamente" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Detalles: $($_.Exception.ToString())" -ForegroundColor Red
    exit 1
}

# PASO 5: Verificar deployment
Write-Host ""
Write-Host "[5/6] Verificando deployment..." -ForegroundColor Yellow

try {
    $verification = Invoke-Sqlcmd `
        -ServerInstance $server `
        -Database $database `
        -Username $username `
        -Password $password `
        -Query @"
SELECT
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') AS TableCount,
    (SELECT COUNT(*) FROM sys.procedures WHERE is_ms_shipped = 0) AS StoredProcCount,
    (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped = 0) AS ViewCount,
    (SELECT COUNT(*) FROM sys.check_constraints) AS CheckConstraintCount
"@ `
        -ErrorAction Stop

    Write-Host "  Tablas: $($verification.TableCount) (esperado: 37)" -ForegroundColor Green
    Write-Host "  Stored Procedures: $($verification.StoredProcCount) (esperado: 8+)" -ForegroundColor Green
    Write-Host "  Vistas: $($verification.ViewCount) (esperado: 6+)" -ForegroundColor Green
    Write-Host "  CHECK Constraints: $($verification.CheckConstraintCount) (esperado: 33+)" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR en verificacion: $($_.Exception.Message)" -ForegroundColor Red
}

# PASO 6: Verificar tablas criticas
Write-Host ""
Write-Host "[6/6] Verificando tablas criticas..." -ForegroundColor Yellow

$criticalTables = @(
    "tickets", "ticket_lines", "betting_pools", "users", "draws", "results",
    "limit_rules", "limit_consumption", "hot_numbers",
    "error_logs", "audit_log", "financial_transactions"
)

foreach ($table in $criticalTables) {
    try {
        $exists = Invoke-Sqlcmd `
            -ServerInstance $server `
            -Database $database `
            -Username $username `
            -Password $password `
            -Query "SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '$table';" `
            -ErrorAction Stop

        if ($exists.cnt -eq 1) {
            Write-Host "  OK - $table" -ForegroundColor Green
        } else {
            Write-Host "  FALTA - $table" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ERROR - $table : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# RESULTADO FINAL
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Base de datos optimizada desplegada en:" -ForegroundColor Cyan
Write-Host "  Servidor: $server" -ForegroundColor Cyan
Write-Host "  Base de datos: $database" -ForegroundColor Cyan
Write-Host ""
