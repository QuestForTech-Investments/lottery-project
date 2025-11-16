-- =============================================
-- Script: Recreate draws table with IDENTITY
-- Purpose: Drop and recreate draws table with draw_id as IDENTITY
-- Date: 2025-11-11
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

PRINT '================================================================================'
PRINT 'RECREATING DRAWS TABLE WITH IDENTITY'
PRINT '================================================================================'
PRINT ''

BEGIN TRANSACTION;
BEGIN TRY

-- =============================================
-- STEP 1: Drop all FK constraints referencing draws
-- =============================================
PRINT '1. Dropping FK constraints referencing draws...'
PRINT ''

-- Drop FKs one by one
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_pool_draws_draws')
BEGIN
    ALTER TABLE betting_pool_draws DROP CONSTRAINT FK_pool_draws_draws;
    PRINT '   ✓ Dropped FK_pool_draws_draws'
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_pool_draws_draw')
BEGIN
    ALTER TABLE betting_pool_draws DROP CONSTRAINT FK_pool_draws_draw;
    PRINT '   ✓ Dropped FK_pool_draws_draw'
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ticket_lines_draws')
BEGIN
    ALTER TABLE ticket_lines DROP CONSTRAINT FK_ticket_lines_draws;
    PRINT '   ✓ Dropped FK_ticket_lines_draws'
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_draw')
BEGIN
    ALTER TABLE betting_pool_draw_config DROP CONSTRAINT FK_pool_draw_config_draw;
    PRINT '   ✓ Dropped FK_pool_draw_config_draw'
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_audit_premios_draw')
BEGIN
    ALTER TABLE prize_changes_audit DROP CONSTRAINT FK_audit_premios_draw;
    PRINT '   ✓ Dropped FK_audit_premios_draw'
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_draw_prize_configs_draw')
BEGIN
    ALTER TABLE draw_prize_configs DROP CONSTRAINT FK_draw_prize_configs_draw;
    PRINT '   ✓ Dropped FK_draw_prize_configs_draw'
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_results_draws')
BEGIN
    ALTER TABLE results DROP CONSTRAINT FK_results_draws;
    PRINT '   ✓ Dropped FK_results_draws'
END

PRINT ''

-- =============================================
-- STEP 2: Drop existing draws table
-- =============================================
PRINT '2. Dropping existing draws table...'
PRINT ''

IF OBJECT_ID('draws', 'U') IS NOT NULL
BEGIN
    DROP TABLE draws;
    PRINT '   ✓ Dropped draws table'
END
PRINT ''

-- =============================================
-- STEP 3: Recreate table with IDENTITY
-- =============================================
PRINT '3. Creating draws table with IDENTITY...'
PRINT ''

CREATE TABLE draws (
    draw_id INT IDENTITY(1,1) NOT NULL,
    lottery_id INT NOT NULL,
    draw_name NVARCHAR(100) NOT NULL,
    draw_time TIME NOT NULL,
    description NVARCHAR(500) NULL,
    abbreviation VARCHAR(10) NULL,
    display_color VARCHAR(7) NULL,
    is_active BIT NULL DEFAULT (1),
    created_at DATETIME2(7) NULL DEFAULT (GETDATE()),
    created_by INT NULL,
    updated_at DATETIME2(7) NULL,
    updated_by INT NULL,

    CONSTRAINT PK_draws PRIMARY KEY CLUSTERED (draw_id)
);

PRINT '   ✓ Created draws table with IDENTITY(1,1)'
PRINT ''

-- =============================================
-- STEP 4: Create FK to lotteries_copy
-- =============================================
PRINT '4. Creating FK to lotteries_copy...'
PRINT ''

ALTER TABLE draws
ADD CONSTRAINT FK_draws_lotteries_copy
FOREIGN KEY (lottery_id)
REFERENCES lotteries_copy(lottery_id);

PRINT '   ✓ Created FK: draws.lottery_id → lotteries_copy.lottery_id'
PRINT ''

-- =============================================
-- STEP 5: Verify table structure
-- =============================================
PRINT '5. Verifying table structure...'
PRINT ''

SELECT
    COLUMN_NAME AS Column_Name,
    DATA_TYPE AS Data_Type,
    CHARACTER_MAXIMUM_LENGTH AS Max_Length,
    IS_NULLABLE AS Nullable,
    COLUMNPROPERTY(OBJECT_ID('draws'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'draws'
ORDER BY ORDINAL_POSITION;

PRINT ''
PRINT '   ✓ Table structure verified'
PRINT ''

-- =============================================
-- Commit
-- =============================================
COMMIT TRANSACTION;

PRINT '================================================================================'
PRINT '✓ DRAWS TABLE RECREATED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Summary:'
PRINT '  - Table: draws'
PRINT '  - Primary Key: draw_id (IDENTITY 1,1)'
PRINT '  - Foreign Key: lottery_id → lotteries_copy.lottery_id'
PRINT '  - Status: Empty and ready for data'
PRINT ''
PRINT 'Next step: Run migrate-draws-with-mapping.sql to populate'
PRINT '================================================================================'

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ''
    PRINT '================================================================================'
    PRINT '✗ ERROR OCCURRED'
    PRINT '================================================================================'
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));
    PRINT ''
    PRINT '✓ Transaction rolled back - NO changes made'
    PRINT '================================================================================'
END CATCH

GO
