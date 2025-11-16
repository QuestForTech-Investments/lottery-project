-- ============================================
-- RENAME: lotteries_copy → lotteries
-- ============================================
-- Description: Safely rename lotteries_copy to lotteries
--              Backing up old lotteries table first
--
-- Author: Lottery Database Team
-- Date: 2025-11-13
-- Database: lottery-db (Production)
-- ============================================

USE [lottery-db];
GO

SET NOCOUNT ON;

PRINT '============================================';
PRINT 'RENAME: lotteries_copy → lotteries';
PRINT '============================================';
PRINT '';
PRINT 'Start time: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
PRINT '';

-- ============================================
-- STEP 0: VERIFICATION
-- ============================================

PRINT '============================================';
PRINT 'STEP 0: Pre-migration verification';
PRINT '============================================';

-- Check if lotteries_copy exists
IF OBJECT_ID('lotteries_copy', 'U') IS NULL
BEGIN
    PRINT '❌ ERROR: lotteries_copy table does NOT exist!';
    PRINT 'Cannot proceed with renaming.';
    RAISERROR('Table lotteries_copy not found', 16, 1);
    RETURN;
END
ELSE
BEGIN
    DECLARE @lotteries_copy_count INT;
    SELECT @lotteries_copy_count = COUNT(*) FROM lotteries_copy;
    PRINT '✓ lotteries_copy exists with ' + CAST(@lotteries_copy_count AS VARCHAR(10)) + ' rows';
END

-- Check if old lotteries exists
DECLARE @old_lotteries_exists BIT = 0;
DECLARE @old_lotteries_count INT = 0;

IF OBJECT_ID('lotteries', 'U') IS NOT NULL
BEGIN
    SET @old_lotteries_exists = 1;
    SELECT @old_lotteries_count = COUNT(*) FROM lotteries;
    PRINT '⚠ Old lotteries table exists with ' + CAST(@old_lotteries_count AS VARCHAR(10)) + ' rows';
    PRINT '  Will be backed up and replaced';
END
ELSE
BEGIN
    PRINT '✓ No old lotteries table found (clean rename)';
END

PRINT '';

-- Show structure of lotteries_copy
PRINT 'Structure of lotteries_copy:';
SELECT
    c.name AS column_name,
    t.name AS data_type,
    c.max_length,
    c.is_nullable,
    c.is_identity
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('lotteries_copy')
ORDER BY c.column_id;

PRINT '';

-- ============================================
-- STEP 1: DROP FOREIGN KEYS TO OLD LOTTERIES
-- ============================================

PRINT '============================================';
PRINT 'STEP 1: Dropping foreign keys to old lotteries';
PRINT '============================================';

IF @old_lotteries_exists = 1
BEGIN
    -- Drop FK from draws (if exists)
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_draws_lotteries')
    BEGIN
        ALTER TABLE [draws] DROP CONSTRAINT [FK_draws_lotteries];
        PRINT '✓ Dropped: FK_draws_lotteries';
    END

    -- Drop FK from betting_pool_prizes_commissions (if exists)
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prizes_comm_lotteries')
    BEGIN
        ALTER TABLE [betting_pool_prizes_commissions] DROP CONSTRAINT [FK_prizes_comm_lotteries];
        PRINT '✓ Dropped: FK_prizes_comm_lotteries';
    END

    -- Drop FK from ticket_lines (if exists)
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ticket_lines_lotteries')
    BEGIN
        ALTER TABLE [ticket_lines] DROP CONSTRAINT [FK_ticket_lines_lotteries];
        PRINT '✓ Dropped: FK_ticket_lines_lotteries';
    END

    -- Drop FK from lottery_game_compatibility (if exists)
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__lottery_g__lotte__4E347170')
    BEGIN
        ALTER TABLE [lottery_game_compatibility] DROP CONSTRAINT [FK__lottery_g__lotte__4E347170];
        PRINT '✓ Dropped: FK__lottery_g__lotte__4E347170';
    END

    -- Drop FK from lottery_bet_type_compatibility (if exists)
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_lottery')
    BEGIN
        ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_lottery];
        PRINT '✓ Dropped: FK_lottery_bet_type_compatibility_lottery';
    END

    -- Drop FK from lotteries to countries (if exists)
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lotteries_countries')
    BEGIN
        ALTER TABLE [lotteries] DROP CONSTRAINT [FK_lotteries_countries];
        PRINT '✓ Dropped: FK_lotteries_countries';
    END

    PRINT '✓ All foreign keys to old lotteries dropped';
END
ELSE
BEGIN
    PRINT '  (No old lotteries table, skipping FK drops)';
END

PRINT '';

-- ============================================
-- STEP 2: BACKUP OLD LOTTERIES TABLE
-- ============================================

PRINT '============================================';
PRINT 'STEP 2: Backing up old lotteries table';
PRINT '============================================';

IF @old_lotteries_exists = 1
BEGIN
    -- Drop old backup if exists
    IF OBJECT_ID('lotteries_old_backup_20251113', 'U') IS NOT NULL
    BEGIN
        DROP TABLE lotteries_old_backup_20251113;
        PRINT '  Dropped old backup table';
    END

    -- Create backup
    SELECT * INTO lotteries_old_backup_20251113
    FROM lotteries;

    PRINT '✓ Backup created: lotteries_old_backup_20251113 (' +
          CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows)';
END
ELSE
BEGIN
    PRINT '  (No old lotteries table to backup)';
END

PRINT '';

-- ============================================
-- STEP 3: DROP OLD LOTTERIES TABLE
-- ============================================

PRINT '============================================';
PRINT 'STEP 3: Dropping old lotteries table';
PRINT '============================================';

IF @old_lotteries_exists = 1
BEGIN
    DROP TABLE [lotteries];
    PRINT '✓ Dropped: old lotteries table';
END
ELSE
BEGIN
    PRINT '  (No old lotteries table to drop)';
END

PRINT '';

-- ============================================
-- STEP 4: RENAME lotteries_copy TO lotteries
-- ============================================

PRINT '============================================';
PRINT 'STEP 4: Renaming lotteries_copy to lotteries';
PRINT '============================================';

EXEC sp_rename 'lotteries_copy', 'lotteries';
PRINT '✓ Renamed: lotteries_copy → lotteries';

PRINT '';

-- ============================================
-- STEP 5: RECREATE FOREIGN KEY TO COUNTRIES
-- ============================================

PRINT '============================================';
PRINT 'STEP 5: Recreating foreign keys';
PRINT '============================================';

-- Check if lotteries has country_id column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('lotteries') AND name = 'country_id')
BEGIN
    -- Recreate FK to countries
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lotteries_countries')
    BEGIN
        ALTER TABLE [lotteries]
            ADD CONSTRAINT [FK_lotteries_countries]
            FOREIGN KEY ([country_id]) REFERENCES [countries] ([country_id]);
        PRINT '✓ Created: FK_lotteries_countries';
    END
    ELSE
    BEGIN
        PRINT '  FK_lotteries_countries already exists';
    END
END
ELSE
BEGIN
    PRINT '  (lotteries does not have country_id column, skipping FK creation)';
END

PRINT '';

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

PRINT '============================================';
PRINT 'STEP 6: Post-rename verification';
PRINT '============================================';

-- Verify lotteries exists
IF OBJECT_ID('lotteries', 'U') IS NOT NULL
BEGIN
    DECLARE @final_count INT;
    SELECT @final_count = COUNT(*) FROM lotteries;
    PRINT '✓ lotteries table exists with ' + CAST(@final_count AS VARCHAR(10)) + ' rows';
END
ELSE
BEGIN
    PRINT '❌ ERROR: lotteries table does NOT exist after rename!';
END

-- Verify lotteries_copy no longer exists
IF OBJECT_ID('lotteries_copy', 'U') IS NULL
BEGIN
    PRINT '✓ lotteries_copy no longer exists (successfully renamed)';
END
ELSE
BEGIN
    PRINT '⚠ WARNING: lotteries_copy still exists!';
END

PRINT '';

-- Show final structure
PRINT 'Final structure of lotteries:';
SELECT
    c.name AS column_name,
    t.name AS data_type,
    c.max_length,
    c.is_nullable,
    c.is_identity,
    CASE WHEN ic.column_id IS NOT NULL THEN 'PK' ELSE '' END AS is_primary_key
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
LEFT JOIN sys.indexes i ON i.object_id = ic.object_id AND i.index_id = ic.index_id AND i.is_primary_key = 1
WHERE c.object_id = OBJECT_ID('lotteries')
ORDER BY c.column_id;

PRINT '';

-- Show foreign keys on lotteries
PRINT 'Foreign keys on lotteries table:';
SELECT
    fk.name AS foreign_key_name,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS column_name,
    OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS referenced_column
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE fk.parent_object_id = OBJECT_ID('lotteries');

PRINT '';

-- ============================================
-- STEP 7: CHECK DRAWS TABLE
-- ============================================

PRINT '============================================';
PRINT 'STEP 7: Checking draws table status';
PRINT '============================================';

-- Check if draws still has lottery_id
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('draws') AND name = 'lottery_id')
BEGIN
    PRINT '⚠ WARNING: draws table still has lottery_id column';
    PRINT '  If you want draws to reference lotteries, you need to recreate the FK';
    PRINT '  If you want to remove lottery_id, run MIGRATION_SIMPLE_LOTTERIES_TO_DRAWS.sql';
END
ELSE
BEGIN
    PRINT '✓ draws table does NOT have lottery_id (migrated to draws-only architecture)';
END

PRINT '';

-- ============================================
-- MIGRATION COMPLETED
-- ============================================

PRINT '============================================';
PRINT 'RENAME COMPLETED SUCCESSFULLY';
PRINT '============================================';
PRINT '';
PRINT 'End time: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
PRINT '';
PRINT 'Summary:';
PRINT '  ✓ lotteries_copy renamed to lotteries';
IF @old_lotteries_exists = 1
    PRINT '  ✓ Old lotteries backed up to lotteries_old_backup_20251113';
PRINT '  ✓ Foreign keys recreated';
PRINT '';
DECLARE @final_lotteries_count INT;
SELECT @final_lotteries_count = COUNT(*) FROM lotteries;

PRINT 'Record counts:';
PRINT '  lotteries: ' + CAST(@final_lotteries_count AS VARCHAR(10));
IF @old_lotteries_exists = 1
    PRINT '  lotteries_old_backup_20251113: ' + CAST(@old_lotteries_count AS VARCHAR(10));
PRINT '';
PRINT 'Next steps:';
PRINT '  1. Verify data integrity in lotteries table';
PRINT '  2. Test application functionality';
PRINT '  3. Drop backup table after verification (30 days recommended)';
PRINT '';

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

PRINT '============================================';
PRINT 'ROLLBACK INSTRUCTIONS (if needed)';
PRINT '============================================';
PRINT '';
PRINT 'If you need to rollback to the old lotteries table:';
PRINT '';
PRINT '/*';
PRINT '-- Restore old lotteries from backup';
PRINT 'DROP TABLE IF EXISTS lotteries;';
PRINT 'SELECT * INTO lotteries FROM lotteries_old_backup_20251113;';
PRINT '';
PRINT '-- Rename current lotteries back to lotteries_copy';
PRINT 'EXEC sp_rename ''lotteries'', ''lotteries_copy'';';
PRINT '';
PRINT '-- Recreate foreign keys (see original schema)';
PRINT '*/';
PRINT '';

GO
