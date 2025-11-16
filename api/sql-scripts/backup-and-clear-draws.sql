-- =============================================
-- Script: Backup and Clear Draws Table
-- Purpose: Safely backup and clear draws table data
-- Date: 2025-11-11
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
PRINT '================================================================================'
PRINT 'BACKUP AND CLEAR DRAWS TABLE'
PRINT '================================================================================'
PRINT ''

-- =============================================
-- STEP 1: Check dependencies and count records
-- =============================================
PRINT '1. Checking dependencies and record counts...'
PRINT ''

DECLARE @DrawsCount INT;
DECLARE @ResultsCount INT;
DECLARE @BettingPoolDrawsCount INT;
DECLARE @TicketLinesCount INT;
DECLARE @DrawPrizeConfigsCount INT;

SELECT @DrawsCount = COUNT(*) FROM draws;
SELECT @ResultsCount = COUNT(*) FROM results WHERE draw_id IS NOT NULL;
SELECT @BettingPoolDrawsCount = COUNT(*) FROM betting_pool_draws;
SELECT @TicketLinesCount = COUNT(*) FROM ticket_lines WHERE draw_id IS NOT NULL;
SELECT @DrawPrizeConfigsCount = COUNT(*) FROM draw_prize_configs WHERE draw_id IS NOT NULL;

PRINT '   Records in draws table: ' + CAST(@DrawsCount AS VARCHAR(10));
PRINT '   Records in results (with draw_id): ' + CAST(@ResultsCount AS VARCHAR(10));
PRINT '   Records in betting_pool_draws: ' + CAST(@BettingPoolDrawsCount AS VARCHAR(10));
PRINT '   Records in ticket_lines (with draw_id): ' + CAST(@TicketLinesCount AS VARCHAR(10));
PRINT '   Records in draw_prize_configs: ' + CAST(@DrawPrizeConfigsCount AS VARCHAR(10));
PRINT ''

-- =============================================
-- STEP 2: Check foreign key constraints
-- =============================================
PRINT '2. Checking foreign key constraints...'
PRINT ''

SELECT
    OBJECT_NAME(fk.parent_object_id) AS 'Referencing_Table',
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS 'Referencing_Column',
    OBJECT_NAME(fk.referenced_object_id) AS 'Referenced_Table',
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS 'Referenced_Column',
    fk.name AS 'Foreign_Key_Name',
    CASE fk.delete_referential_action
        WHEN 0 THEN 'NO ACTION'
        WHEN 1 THEN 'CASCADE'
        WHEN 2 THEN 'SET NULL'
        WHEN 3 THEN 'SET DEFAULT'
    END AS 'Delete_Action'
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc
    ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fk.referenced_object_id) = 'draws'
ORDER BY OBJECT_NAME(fk.parent_object_id);
PRINT ''

-- =============================================
-- STEP 3: Create backup table
-- =============================================
PRINT '3. Creating backup table...'
PRINT ''

-- Drop backup table if exists
IF OBJECT_ID('draws_backup_20251111', 'U') IS NOT NULL
BEGIN
    PRINT '   WARNING: Backup table already exists. Dropping it...'
    DROP TABLE draws_backup_20251111;
END

-- Create backup with same structure
SELECT *
INTO draws_backup_20251111
FROM draws;

DECLARE @BackupCount INT;
SELECT @BackupCount = COUNT(*) FROM draws_backup_20251111;

PRINT '   ✓ Backup created: draws_backup_20251111'
PRINT '   ✓ Records backed up: ' + CAST(@BackupCount AS VARCHAR(10));
PRINT ''

-- =============================================
-- STEP 4: Verify backup
-- =============================================
PRINT '4. Verifying backup integrity...'
PRINT ''

IF @BackupCount = @DrawsCount
BEGIN
    PRINT '   ✓ Backup verification PASSED'
    PRINT '   ✓ All ' + CAST(@DrawsCount AS VARCHAR(10)) + ' records backed up successfully'
    PRINT ''
END
ELSE
BEGIN
    PRINT '   ✗ ERROR: Backup verification FAILED!'
    PRINT '   ✗ Original: ' + CAST(@DrawsCount AS VARCHAR(10)) + ' records'
    PRINT '   ✗ Backup: ' + CAST(@BackupCount AS VARCHAR(10)) + ' records'
    PRINT '   ✗ ABORTING - DO NOT DELETE!'
    PRINT ''
    RAISERROR('Backup verification failed. Aborting operation.', 16, 1);
    RETURN;
END

-- =============================================
-- STEP 5: Show sample data from backup
-- =============================================
PRINT '5. Sample data from backup (first 10 records)...'
PRINT ''

SELECT TOP 10
    draw_id,
    lottery_id,
    draw_name,
    draw_time,
    is_active
FROM draws_backup_20251111
ORDER BY draw_id;
PRINT ''

-- =============================================
-- STEP 6: Decision point - uncomment to DELETE
-- =============================================
PRINT '================================================================================'
PRINT 'BACKUP COMPLETED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'To DELETE the data from draws table, you must:'
PRINT '1. Review the foreign key constraints above'
PRINT '2. Decide if you need to delete related data first'
PRINT '3. Uncomment the DELETE section below'
PRINT ''
PRINT 'WARNING: The following tables reference draws:'
IF @ResultsCount > 0 PRINT '   - results (' + CAST(@ResultsCount AS VARCHAR(10)) + ' records)'
IF @BettingPoolDrawsCount > 0 PRINT '   - betting_pool_draws (' + CAST(@BettingPoolDrawsCount AS VARCHAR(10)) + ' records)'
IF @TicketLinesCount > 0 PRINT '   - ticket_lines (' + CAST(@TicketLinesCount AS VARCHAR(10)) + ' records)'
IF @DrawPrizeConfigsCount > 0 PRINT '   - draw_prize_configs (' + CAST(@DrawPrizeConfigsCount AS VARCHAR(10)) + ' records)'
PRINT ''
PRINT 'These must be handled before deleting draws!'
PRINT '================================================================================'
PRINT ''

-- =============================================
-- STEP 7: DELETE DATA (COMMENTED OUT FOR SAFETY)
-- =============================================
/*
PRINT '7. Deleting related data...'
PRINT ''

BEGIN TRANSACTION;
BEGIN TRY

    -- Delete in correct order (child tables first)

    -- 1. Delete draw_prize_configs
    DELETE FROM draw_prize_configs;
    PRINT '   ✓ Deleted draw_prize_configs'

    -- 2. Delete betting_pool_draws
    DELETE FROM betting_pool_draws;
    PRINT '   ✓ Deleted betting_pool_draws'

    -- 3. Delete ticket_lines (only draw references, not the entire record)
    UPDATE ticket_lines SET draw_id = NULL WHERE draw_id IS NOT NULL;
    PRINT '   ✓ Cleared draw_id from ticket_lines'

    -- 4. Delete results (only draw references, not the entire record)
    UPDATE results SET draw_id = NULL WHERE draw_id IS NOT NULL;
    PRINT '   ✓ Cleared draw_id from results'

    -- 5. Finally delete draws
    DELETE FROM draws;
    PRINT '   ✓ Deleted all records from draws'
    PRINT ''

    COMMIT TRANSACTION;
    PRINT '✓ All deletions completed successfully'

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ''
    PRINT '✗ ERROR: ' + ERROR_MESSAGE()
    PRINT '✗ Transaction rolled back - no data was deleted'
END CATCH
*/

-- =============================================
-- RESTORATION SCRIPT (if needed)
-- =============================================
PRINT ''
PRINT 'To RESTORE the backup, run:'
PRINT 'INSERT INTO draws SELECT * FROM draws_backup_20251111;'
PRINT ''
PRINT 'To PERMANENTLY DELETE the backup (after verification):'
PRINT 'DROP TABLE draws_backup_20251111;'
PRINT ''

GO
