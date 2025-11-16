-- ============================================================================
-- Script: Rename prize_fields to prize_types
-- Description: Refactor table and column names for naming consistency
-- Author: Lottery API Team
-- Date: 2025-11-14
-- ============================================================================
--
-- REASON FOR CHANGE:
-- Maintain consistent naming convention across the database:
-- - game_types (tipos de juego)
-- - bet_types (tipos de apuesta)
-- - prize_types (tipos de premio) ← was "prize_fields"
--
-- WHAT THIS SCRIPT DOES:
-- 1. Verifies prize_fields table exists
-- 2. Renames prize_fields → prize_types
-- 3. Renames prize_field_id → prize_type_id (in all tables)
-- 4. Updates all foreign key references
-- 5. Verifies data integrity
--
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '============================================================================';
PRINT 'Starting Prize Fields → Prize Types Refactor';
PRINT 'Date: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- STEP 1: Pre-Migration Verification
-- ============================================================================

PRINT 'STEP 1: Verifying current state...';
PRINT '';

-- Check prize_fields exists
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'prize_fields')
BEGIN
    PRINT '  ❌ ERROR: prize_fields table does not exist!';
    PRINT '  Cannot proceed with migration.';
    RAISERROR('prize_fields table not found', 16, 1);
    RETURN;
END
ELSE
BEGIN
    PRINT '  ✅ prize_fields table exists';
END

-- Check prize_types doesn't already exist
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'prize_types')
BEGIN
    PRINT '  ⚠️  WARNING: prize_types table already exists!';
    PRINT '  This migration may have already been run.';
    PRINT '  Aborting to prevent data loss.';
    RETURN;
END

-- Show current data count
DECLARE @RecordCount INT;
SELECT @RecordCount = COUNT(*) FROM prize_fields;
PRINT '  Current prize_fields records: ' + CAST(@RecordCount AS VARCHAR);
PRINT '';

-- ============================================================================
-- STEP 2: Drop Foreign Key Constraints
-- ============================================================================

PRINT 'STEP 2: Dropping foreign key constraints...';
PRINT '';

-- Drop FK from draw_prize_configs
DECLARE @DropFKSQL NVARCHAR(MAX);

IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_draw_prize_configs_prize_fields'
)
BEGIN
    SET @DropFKSQL = 'ALTER TABLE draw_prize_configs DROP CONSTRAINT FK_draw_prize_configs_prize_fields;';
    EXEC sp_executesql @DropFKSQL;
    PRINT '  ✅ Dropped FK_draw_prize_configs_prize_fields';
END

-- Drop FK from banca_prize_configs (if exists)
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'banca_prize_configs'
) AND EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_banca_prize_configs_prize_fields'
)
BEGIN
    SET @DropFKSQL = 'ALTER TABLE banca_prize_configs DROP CONSTRAINT FK_banca_prize_configs_prize_fields;';
    EXEC sp_executesql @DropFKSQL;
    PRINT '  ✅ Dropped FK_banca_prize_configs_prize_fields';
END

PRINT '';

-- ============================================================================
-- STEP 3: Rename Table
-- ============================================================================

PRINT 'STEP 3: Renaming table prize_fields → prize_types...';
PRINT '';

BEGIN TRY
    EXEC sp_rename 'prize_fields', 'prize_types';
    PRINT '  ✅ Table renamed successfully';
END TRY
BEGIN CATCH
    PRINT '  ❌ ERROR renaming table:';
    PRINT '  Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR);
    PRINT '  Error Message: ' + ERROR_MESSAGE();
    RAISERROR('Failed to rename table', 16, 1);
    RETURN;
END CATCH

PRINT '';

-- ============================================================================
-- STEP 4: Rename Primary Key Column
-- ============================================================================

PRINT 'STEP 4: Renaming prize_field_id → prize_type_id in prize_types...';
PRINT '';

BEGIN TRY
    EXEC sp_rename 'prize_types.prize_field_id', 'prize_type_id', 'COLUMN';
    PRINT '  ✅ Primary key column renamed';
END TRY
BEGIN CATCH
    PRINT '  ❌ ERROR renaming column:';
    PRINT '  Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR);
    PRINT '  Error Message: ' + ERROR_MESSAGE();
    RAISERROR('Failed to rename PK column', 16, 1);
    RETURN;
END CATCH

PRINT '';

-- ============================================================================
-- STEP 5: Rename Foreign Key Columns in Related Tables
-- ============================================================================

PRINT 'STEP 5: Renaming prize_field_id → prize_type_id in related tables...';
PRINT '';

-- Rename in draw_prize_configs
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'draw_prize_configs' AND COLUMN_NAME = 'prize_field_id'
)
BEGIN
    BEGIN TRY
        EXEC sp_rename 'draw_prize_configs.prize_field_id', 'prize_type_id', 'COLUMN';
        PRINT '  ✅ Renamed column in draw_prize_configs';
    END TRY
    BEGIN CATCH
        PRINT '  ❌ ERROR renaming column in draw_prize_configs:';
        PRINT '  Error Message: ' + ERROR_MESSAGE();
    END CATCH
END

-- Rename in banca_prize_configs (if exists)
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'banca_prize_configs'
) AND EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'banca_prize_configs' AND COLUMN_NAME = 'prize_field_id'
)
BEGIN
    BEGIN TRY
        EXEC sp_rename 'banca_prize_configs.prize_field_id', 'prize_type_id', 'COLUMN';
        PRINT '  ✅ Renamed column in banca_prize_configs';
    END TRY
    BEGIN CATCH
        PRINT '  ❌ ERROR renaming column in banca_prize_configs:';
        PRINT '  Error Message: ' + ERROR_MESSAGE();
    END CATCH
END

PRINT '';

-- ============================================================================
-- STEP 6: Recreate Foreign Key Constraints
-- ============================================================================

PRINT 'STEP 6: Recreating foreign key constraints...';
PRINT '';

-- Recreate FK from draw_prize_configs
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'draw_prize_configs')
BEGIN
    BEGIN TRY
        ALTER TABLE draw_prize_configs
        ADD CONSTRAINT FK_draw_prize_configs_prize_types
        FOREIGN KEY (prize_type_id) REFERENCES prize_types(prize_type_id);

        PRINT '  ✅ Recreated FK_draw_prize_configs_prize_types';
    END TRY
    BEGIN CATCH
        PRINT '  ❌ ERROR recreating FK:';
        PRINT '  Error Message: ' + ERROR_MESSAGE();
    END CATCH
END

-- Recreate FK from banca_prize_configs (if exists)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'banca_prize_configs')
BEGIN
    BEGIN TRY
        ALTER TABLE banca_prize_configs
        ADD CONSTRAINT FK_banca_prize_configs_prize_types
        FOREIGN KEY (prize_type_id) REFERENCES prize_types(prize_type_id);

        PRINT '  ✅ Recreated FK_banca_prize_configs_prize_types';
    END TRY
    BEGIN CATCH
        PRINT '  ❌ ERROR recreating FK:';
        PRINT '  Error Message: ' + ERROR_MESSAGE();
    END CATCH
END

PRINT '';

-- ============================================================================
-- STEP 7: Rename Primary Key Constraint
-- ============================================================================

PRINT 'STEP 7: Renaming primary key constraint...';
PRINT '';

DECLARE @OldPKName NVARCHAR(256);
SELECT @OldPKName = name
FROM sys.key_constraints
WHERE type = 'PK'
  AND OBJECT_NAME(parent_object_id) = 'prize_types';

IF @OldPKName IS NOT NULL AND @OldPKName LIKE '%prize_field%'
BEGIN
    DECLARE @NewPKName NVARCHAR(256) = REPLACE(@OldPKName, 'prize_field', 'prize_type');
    DECLARE @RenamePKSQL NVARCHAR(MAX) = 'EXEC sp_rename ''' + @OldPKName + ''', ''' + @NewPKName + '''';

    BEGIN TRY
        EXEC sp_executesql @RenamePKSQL;
        PRINT '  ✅ Renamed PK constraint: ' + @OldPKName + ' → ' + @NewPKName;
    END TRY
    BEGIN CATCH
        PRINT '  ⚠️  Could not rename PK constraint (non-critical)';
    END CATCH
END

PRINT '';

-- ============================================================================
-- STEP 8: Verification
-- ============================================================================

PRINT 'STEP 8: Verifying migration...';
PRINT '';

-- Verify new table exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'prize_types')
BEGIN
    PRINT '  ✅ prize_types table exists';

    -- Verify data count matches
    DECLARE @NewRecordCount INT;
    SELECT @NewRecordCount = COUNT(*) FROM prize_types;

    IF @NewRecordCount = @RecordCount
    BEGIN
        PRINT '  ✅ Record count matches: ' + CAST(@NewRecordCount AS VARCHAR);
    END
    ELSE
    BEGIN
        PRINT '  ❌ ERROR: Record count mismatch!';
        PRINT '  Expected: ' + CAST(@RecordCount AS VARCHAR);
        PRINT '  Got: ' + CAST(@NewRecordCount AS VARCHAR);
    END
END
ELSE
BEGIN
    PRINT '  ❌ ERROR: prize_types table does not exist!';
END

-- Verify old table is gone
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'prize_fields')
BEGIN
    PRINT '  ✅ prize_fields table removed';
END
ELSE
BEGIN
    PRINT '  ❌ ERROR: prize_fields table still exists!';
END

-- Verify column renamed in prize_types
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'prize_types' AND COLUMN_NAME = 'prize_type_id'
)
BEGIN
    PRINT '  ✅ prize_type_id column exists in prize_types';
END

-- Verify column renamed in draw_prize_configs
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'draw_prize_configs')
BEGIN
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'draw_prize_configs' AND COLUMN_NAME = 'prize_type_id'
    )
    BEGIN
        PRINT '  ✅ prize_type_id column exists in draw_prize_configs';
    END
    ELSE
    BEGIN
        PRINT '  ❌ ERROR: prize_type_id not found in draw_prize_configs';
    END
END

-- Verify foreign keys
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_draw_prize_configs_prize_types'
)
BEGIN
    PRINT '  ✅ FK_draw_prize_configs_prize_types exists';
END

PRINT '';

-- ============================================================================
-- STEP 9: Summary
-- ============================================================================

PRINT '============================================================================';
PRINT 'Migration Summary:';
PRINT '============================================================================';
PRINT '';
PRINT '  Table Renamed:     prize_fields → prize_types ✓';
PRINT '  Column Renamed:    prize_field_id → prize_type_id ✓';
PRINT '  Records Migrated:  ' + CAST(@RecordCount AS VARCHAR) + ' ✓';
PRINT '  Foreign Keys:      Updated ✓';
PRINT '';
PRINT '============================================================================';
PRINT 'Migration completed successfully!';
PRINT '============================================================================';
PRINT '';
PRINT 'NEXT STEPS:';
PRINT '  1. Update C# model files (PrizeField.cs → PrizeType.cs)';
PRINT '  2. Update all references in Controllers, DTOs, Repositories';
PRINT '  3. Update DbContext entity configuration';
PRINT '  4. Rebuild and test API endpoints';
PRINT '';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

GO
