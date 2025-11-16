-- =====================================================================
-- Script para agregar IDENTITY a las tablas de configuración de bancas
-- Base de datos: lottery-db (Azure SQL)
-- Fecha: 2025-10-29
-- =====================================================================

-- IMPORTANTE: Este script debe ejecutarse en Azure SQL Database
-- Ejecutar desde Azure Data Studio o sqlcmd conectado a lottery-db

USE [lottery-db];
GO

PRINT '========================================';
PRINT 'Iniciando corrección de tablas de configuración...';
PRINT '========================================';
GO

-- =====================================================================
-- 1. ARREGLAR TABLA betting_pool_config
-- =====================================================================
PRINT '';
PRINT '1. Procesando betting_pool_config...';
GO

BEGIN TRANSACTION;

-- Verificar si la tabla tiene datos
DECLARE @ConfigCount INT;
SELECT @ConfigCount = COUNT(*) FROM betting_pool_config;
PRINT 'Registros existentes en betting_pool_config: ' + CAST(@ConfigCount AS VARCHAR(10));

-- Crear tabla temporal con IDENTITY
CREATE TABLE betting_pool_config_temp (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    betting_pool_id INT NOT NULL,
    fall_type NVARCHAR(50) DEFAULT 'OFF',
    deactivation_balance DECIMAL(10,2),
    daily_sale_limit DECIMAL(10,2),
    daily_balance_limit DECIMAL(10,2),
    temporary_additional_balance DECIMAL(10,2),
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    is_active BIT DEFAULT 1,
    control_winning_tickets BIT DEFAULT 0,
    allow_jackpot BIT DEFAULT 1,
    enable_recharges BIT DEFAULT 1,
    allow_password_change BIT DEFAULT 1,
    cancel_minutes INT DEFAULT 30,
    daily_cancel_tickets INT,
    max_cancel_amount DECIMAL(10,2),
    max_ticket_amount DECIMAL(10,2),
    max_daily_recharge DECIMAL(10,2),
    payment_mode NVARCHAR(50) DEFAULT 'BANCA',
    created_at DATETIME2,
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    CONSTRAINT FK_BettingPoolConfig_BettingPool FOREIGN KEY (betting_pool_id)
        REFERENCES betting_pools(betting_pool_id)
);

-- Copiar datos si existen
IF @ConfigCount > 0
BEGIN
    SET IDENTITY_INSERT betting_pool_config_temp ON;

    INSERT INTO betting_pool_config_temp (
        config_id, betting_pool_id, fall_type, deactivation_balance,
        daily_sale_limit, daily_balance_limit, temporary_additional_balance,
        credit_limit, is_active, control_winning_tickets, allow_jackpot,
        enable_recharges, allow_password_change, cancel_minutes,
        daily_cancel_tickets, max_cancel_amount, max_ticket_amount,
        max_daily_recharge, payment_mode, created_at, created_by,
        updated_at, updated_by
    )
    SELECT
        config_id, betting_pool_id, fall_type, deactivation_balance,
        daily_sale_limit, daily_balance_limit, temporary_additional_balance,
        credit_limit, is_active, control_winning_tickets, allow_jackpot,
        enable_recharges, allow_password_change, cancel_minutes,
        daily_cancel_tickets, max_cancel_amount, max_ticket_amount,
        max_daily_recharge, payment_mode, created_at, created_by,
        updated_at, updated_by
    FROM betting_pool_config;

    SET IDENTITY_INSERT betting_pool_config_temp OFF;

    PRINT 'Datos copiados exitosamente';
END

-- Eliminar tabla vieja
DROP TABLE betting_pool_config;
PRINT 'Tabla antigua eliminada';

-- Renombrar tabla temporal
EXEC sp_rename 'betting_pool_config_temp', 'betting_pool_config';
PRINT 'Tabla renombrada exitosamente';
PRINT '✓ betting_pool_config corregida';

COMMIT TRANSACTION;
GO

-- =====================================================================
-- 2. ARREGLAR TABLA betting_pool_discount_config
-- =====================================================================
PRINT '';
PRINT '2. Procesando betting_pool_discount_config...';
GO

BEGIN TRANSACTION;

DECLARE @DiscountCount INT;
SELECT @DiscountCount = COUNT(*) FROM betting_pool_discount_config;
PRINT 'Registros existentes en betting_pool_discount_config: ' + CAST(@DiscountCount AS VARCHAR(10));

CREATE TABLE betting_pool_discount_config_temp (
    discount_config_id INT IDENTITY(1,1) PRIMARY KEY,
    betting_pool_id INT NOT NULL,
    discount_provider NVARCHAR(50) DEFAULT 'GRUPO',
    discount_mode NVARCHAR(50) DEFAULT 'OFF',
    created_at DATETIME2,
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    CONSTRAINT FK_BettingPoolDiscountConfig_BettingPool FOREIGN KEY (betting_pool_id)
        REFERENCES betting_pools(betting_pool_id)
);

IF @DiscountCount > 0
BEGIN
    SET IDENTITY_INSERT betting_pool_discount_config_temp ON;

    INSERT INTO betting_pool_discount_config_temp (
        discount_config_id, betting_pool_id, discount_provider,
        discount_mode, created_at, created_by, updated_at, updated_by
    )
    SELECT
        discount_config_id, betting_pool_id, discount_provider,
        discount_mode, created_at, created_by, updated_at, updated_by
    FROM betting_pool_discount_config;

    SET IDENTITY_INSERT betting_pool_discount_config_temp OFF;

    PRINT 'Datos copiados exitosamente';
END

DROP TABLE betting_pool_discount_config;
PRINT 'Tabla antigua eliminada';

EXEC sp_rename 'betting_pool_discount_config_temp', 'betting_pool_discount_config';
PRINT 'Tabla renombrada exitosamente';
PRINT '✓ betting_pool_discount_config corregida';

COMMIT TRANSACTION;
GO

-- =====================================================================
-- 3. ARREGLAR TABLA betting_pool_print_config
-- =====================================================================
PRINT '';
PRINT '3. Procesando betting_pool_print_config...';
GO

BEGIN TRANSACTION;

DECLARE @PrintCount INT;
SELECT @PrintCount = COUNT(*) FROM betting_pool_print_config;
PRINT 'Registros existentes en betting_pool_print_config: ' + CAST(@PrintCount AS VARCHAR(10));

CREATE TABLE betting_pool_print_config_temp (
    print_config_id INT IDENTITY(1,1) PRIMARY KEY,
    betting_pool_id INT NOT NULL,
    print_mode NVARCHAR(50) DEFAULT 'DRIVER',
    print_enabled BIT DEFAULT 1,
    print_ticket_copy BIT DEFAULT 1,
    print_recharge_receipt BIT DEFAULT 1,
    sms_only BIT DEFAULT 0,
    created_at DATETIME2,
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    CONSTRAINT FK_BettingPoolPrintConfig_BettingPool FOREIGN KEY (betting_pool_id)
        REFERENCES betting_pools(betting_pool_id)
);

IF @PrintCount > 0
BEGIN
    SET IDENTITY_INSERT betting_pool_print_config_temp ON;

    INSERT INTO betting_pool_print_config_temp (
        print_config_id, betting_pool_id, print_mode, print_enabled,
        print_ticket_copy, print_recharge_receipt, sms_only,
        created_at, created_by, updated_at, updated_by
    )
    SELECT
        print_config_id, betting_pool_id, print_mode, print_enabled,
        print_ticket_copy, print_recharge_receipt, sms_only,
        created_at, created_by, updated_at, updated_by
    FROM betting_pool_print_config;

    SET IDENTITY_INSERT betting_pool_print_config_temp OFF;

    PRINT 'Datos copiados exitosamente';
END

DROP TABLE betting_pool_print_config;
PRINT 'Tabla antigua eliminada';

EXEC sp_rename 'betting_pool_print_config_temp', 'betting_pool_print_config';
PRINT 'Tabla renombrada exitosamente';
PRINT '✓ betting_pool_print_config corregida';

COMMIT TRANSACTION;
GO

-- =====================================================================
-- VERIFICACIÓN FINAL
-- =====================================================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICACIÓN FINAL';
PRINT '========================================';
GO

-- Verificar que las tablas existen y tienen IDENTITY
SELECT
    t.name AS TableName,
    c.name AS ColumnName,
    c.is_identity AS HasIdentity,
    IDENT_CURRENT(t.name) AS CurrentIdentityValue
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
WHERE t.name IN ('betting_pool_config', 'betting_pool_discount_config', 'betting_pool_print_config')
AND c.is_identity = 1
ORDER BY t.name;

PRINT '';
PRINT '========================================';
PRINT '✓ PROCESO COMPLETADO EXITOSAMENTE';
PRINT '========================================';
PRINT '';
PRINT 'Las siguientes tablas ahora tienen IDENTITY configurado:';
PRINT '  - betting_pool_config (config_id)';
PRINT '  - betting_pool_discount_config (discount_config_id)';
PRINT '  - betting_pool_print_config (print_config_id)';
PRINT '';
PRINT 'Próximos pasos:';
PRINT '  1. Reiniciar el API .NET';
PRINT '  2. Probar los endpoints de configuración';
PRINT '========================================';
GO
