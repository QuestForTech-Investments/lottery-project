-- =====================================================
-- PASO 1: Verificar Estructura Actual de la Tabla Branches
-- =====================================================
-- Conectarse a: lottery-sql-1505.database.windows.net
-- Base de datos: LottoTest

-- 1. Ver TODAS las columnas de la tabla branches
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'branches'
ORDER BY ORDINAL_POSITION;

-- 2. Verificar específicamente las columnas de CONFIGURACIÓN que necesitamos
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'branches'
  AND COLUMN_NAME IN (
    -- Columnas que ya sabemos que existen
    'credit_limit',
    'deactivation_balance',
    'daily_sale_limit',
    'daily_balance_limit',
    'temporary_additional_balance',
    'fall_type',
    'print_mode',
    'discount_provider',
    'discount_mode',
    'control_winning_tickets',
    'allow_jackpot',
    'print_enabled',
    'print_ticket_copy',

    -- Columnas que el frontend envía pero pueden no existir
    'sms_only',
    'enable_recharges',
    'print_recharge_receipt',
    'allow_password_change',
    'cancel_minutes',
    'daily_cancel_tickets',
    'max_cancel_amount',
    'max_ticket_amount',
    'max_daily_recharge',
    'payment_mode'
  )
ORDER BY COLUMN_NAME;

-- 3. Ver también si existen las tablas relacionadas
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'branch%'
ORDER BY TABLE_NAME;

-- 4. Contar total de columnas en branches
SELECT COUNT(*) as total_columnas
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'branches';

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Copia estas queries
-- 2. Conéctate a Azure SQL Database usando:
--    - SQL Server Management Studio (SSMS), O
--    - Azure Data Studio, O
--    - Azure Portal Query Editor
-- 3. Ejecuta cada query y guarda los resultados
-- 4. Comparte los resultados para saber qué columnas existen
-- =====================================================
