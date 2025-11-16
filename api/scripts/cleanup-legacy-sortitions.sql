-- ============================================================================
-- Script: Cleanup Legacy Sortitions Table
-- Description: Remove deprecated betting_pool_sortitions table after migration
-- Author: Lottery API Team
-- Date: 2025-11-14
-- ============================================================================
--
-- PREREQUISITES:
-- - betting_pool_draws table is active and has all data
-- - Frontend has been migrated to use /draws endpoint
-- - All legacy /sortitions API calls have been replaced
--
-- WHAT THIS SCRIPT DOES:
-- 1. Verifies betting_pool_draws has data
-- 2. Checks for foreign key dependencies
-- 3. Drops betting_pool_sortitions table
-- 4. Verifies cleanup was successful
--
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '============================================================================';
PRINT 'Starting Legacy Sortitions Table Cleanup';
PRINT 'Date: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- STEP 1: Pre-Migration Verification
-- ============================================================================

PRINT 'STEP 1: Verifying migration state...';
PRINT '';

-- Check betting_pool_draws has data
DECLARE @DrawsCount INT;
SELECT @DrawsCount = COUNT(*) FROM betting_pool_draws;

PRINT '  Betting Pool Draws count: ' + CAST(@DrawsCount AS VARCHAR);

IF @DrawsCount = 0
BEGIN
    PRINT '  ❌ ERROR: betting_pool_draws table is empty!';
    PRINT '  Migration may not have completed successfully.';
    PRINT '  Aborting cleanup.';
    RAISERROR('betting_pool_draws is empty - aborting cleanup', 16, 1);
    RETURN;
END
ELSE
BEGIN
    PRINT '  ✅ betting_pool_draws has data';
END

-- Check betting_pool_sortitions exists
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'betting_pool_sortitions')
BEGIN
    PRINT '  ℹ️  betting_pool_sortitions table does not exist - already cleaned up';
    RETURN;
END

-- Show current data counts
DECLARE @SortitionsCount INT;
SELECT @SortitionsCount = COUNT(*) FROM betting_pool_sortitions;

PRINT '  Betting Pool Sortitions count (legacy): ' + CAST(@SortitionsCount AS VARCHAR);
PRINT '';

-- ============================================================================
-- STEP 2: Drop Foreign Key Constraints
-- ============================================================================

PRINT 'STEP 2: Dropping foreign key constraints...';
PRINT '';

-- Find and drop foreign keys on betting_pool_sortitions table
DECLARE @FKName NVARCHAR(256);
DECLARE @DropFKSQL NVARCHAR(MAX);

DECLARE fk_cursor CURSOR FOR
SELECT fk.name
FROM sys.foreign_keys fk
WHERE OBJECT_NAME(fk.parent_object_id) = 'betting_pool_sortitions'
   OR OBJECT_NAME(fk.referenced_object_id) = 'betting_pool_sortitions';

OPEN fk_cursor;
FETCH NEXT FROM fk_cursor INTO @FKName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @DropFKSQL = 'ALTER TABLE ' +
        OBJECT_SCHEMA_NAME(OBJECT_ID('betting_pool_sortitions')) +
        '.betting_pool_sortitions DROP CONSTRAINT ' + @FKName;

    PRINT '  Dropping FK: ' + @FKName;
    EXEC sp_executesql @DropFKSQL;

    FETCH NEXT FROM fk_cursor INTO @FKName;
END

CLOSE fk_cursor;
DEALLOCATE fk_cursor;

PRINT '  ✅ All foreign key constraints dropped';
PRINT '';

-- ============================================================================
-- STEP 3: Backup Legacy Data (for safety)
-- ============================================================================

PRINT 'STEP 3: Creating backup of legacy data...';
PRINT '';

-- Create backup table (just in case we need to rollback)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'betting_pool_sortitions_backup')
BEGIN
    DROP TABLE betting_pool_sortitions_backup;
    PRINT '  Dropped existing backup table';
END

SELECT *
INTO betting_pool_sortitions_backup
FROM betting_pool_sortitions;

DECLARE @BackupCount INT;
SELECT @BackupCount = COUNT(*) FROM betting_pool_sortitions_backup;

PRINT '  ✅ Backed up ' + CAST(@BackupCount AS VARCHAR) + ' records to betting_pool_sortitions_backup';
PRINT '';

-- ============================================================================
-- STEP 4: Drop Legacy Table
-- ============================================================================

PRINT 'STEP 4: Dropping legacy betting_pool_sortitions table...';
PRINT '';

BEGIN TRY
    BEGIN TRANSACTION;

    -- Drop the table
    DROP TABLE betting_pool_sortitions;

    COMMIT TRANSACTION;

    PRINT '  ✅ Successfully dropped betting_pool_sortitions table';
    PRINT '';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    PRINT '  ❌ ERROR dropping table:';
    PRINT '  Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR);
    PRINT '  Error Message: ' + ERROR_MESSAGE();

    RAISERROR('Failed to drop betting_pool_sortitions table', 16, 1);
    RETURN;
END CATCH

-- ============================================================================
-- STEP 5: Verify Cleanup
-- ============================================================================

PRINT 'STEP 5: Verifying cleanup...';
PRINT '';

-- Verify table is gone
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'betting_pool_sortitions')
BEGIN
    PRINT '  ✅ betting_pool_sortitions table successfully removed';
END
ELSE
BEGIN
    PRINT '  ❌ ERROR: betting_pool_sortitions table still exists!';
END

-- Verify backup exists
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'betting_pool_sortitions_backup')
BEGIN
    PRINT '  ✅ Backup table betting_pool_sortitions_backup exists';
    PRINT '     (Can be dropped after verification period)';
END

-- Verify betting_pool_draws still has data
SELECT @DrawsCount = COUNT(*) FROM betting_pool_draws;
PRINT '  ✅ betting_pool_draws still has ' + CAST(@DrawsCount AS VARCHAR) + ' records';

PRINT '';

-- ============================================================================
-- STEP 6: Summary
-- ============================================================================

PRINT '============================================================================';
PRINT 'Cleanup Summary:';
PRINT '============================================================================';
PRINT '';
PRINT '  Legacy Table (betting_pool_sortitions):      REMOVED ✓';
PRINT '  Backup Table (betting_pool_sortitions_backup): CREATED ✓';
PRINT '  Active Table (betting_pool_draws):            INTACT ✓';
PRINT '';
PRINT '  Records in backup: ' + CAST(@BackupCount AS VARCHAR);
PRINT '  Records in active: ' + CAST(@DrawsCount AS VARCHAR);
PRINT '';
PRINT '============================================================================';
PRINT 'Cleanup completed successfully!';
PRINT '============================================================================';
PRINT '';
PRINT 'NEXT STEPS:';
PRINT '  1. Verify API still works correctly';
PRINT '  2. Test /draws and legacy /sortitions endpoints';
PRINT '  3. After 1-2 weeks of stability, you can drop the backup table with:';
PRINT '     DROP TABLE betting_pool_sortitions_backup;';
PRINT '';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '';

GO
