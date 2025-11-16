-- =============================================
-- Script: Delete Draws Data (with backup verified)
-- Purpose: Delete all data from draws and related tables
-- Date: 2025-11-11
-- Prerequisite: backup-and-clear-draws.sql already executed
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
PRINT '================================================================================'
PRINT 'DELETING DRAWS DATA'
PRINT '================================================================================'
PRINT ''

-- Verify backup exists
IF OBJECT_ID('draws_backup_20251111', 'U') IS NULL
BEGIN
    PRINT '✗ ERROR: Backup table draws_backup_20251111 does not exist!'
    PRINT '✗ Run backup-and-clear-draws.sql first'
    RAISERROR('Backup not found. Aborting.', 16, 1);
    RETURN;
END
PRINT '✓ Backup table verified: draws_backup_20251111'
PRINT ''

-- Count records before deletion
DECLARE @DrawsCount INT;
DECLARE @DrawPrizeConfigsCount INT;
DECLARE @BettingPoolDrawConfigCount INT;
DECLARE @PrizeChangesAuditCount INT;

SELECT @DrawsCount = COUNT(*) FROM draws;
SELECT @DrawPrizeConfigsCount = COUNT(*) FROM draw_prize_configs;
SELECT @BettingPoolDrawConfigCount = ISNULL((SELECT COUNT(*) FROM betting_pool_draw_config WHERE draw_id IS NOT NULL), 0);
SELECT @PrizeChangesAuditCount = ISNULL((SELECT COUNT(*) FROM prize_changes_audit WHERE draw_id IS NOT NULL), 0);

PRINT 'Records to be deleted:'
PRINT '   - draws: ' + CAST(@DrawsCount AS VARCHAR(10));
PRINT '   - draw_prize_configs: ' + CAST(@DrawPrizeConfigsCount AS VARCHAR(10));
PRINT '   - betting_pool_draw_config: ' + CAST(@BettingPoolDrawConfigCount AS VARCHAR(10));
PRINT '   - prize_changes_audit: ' + CAST(@PrizeChangesAuditCount AS VARCHAR(10));
PRINT ''

-- Execute deletion in transaction
BEGIN TRANSACTION;
BEGIN TRY

    PRINT 'Starting deletion...'
    PRINT ''

    -- 1. Delete draw_prize_configs (CASCADE will handle this, but being explicit)
    IF @DrawPrizeConfigsCount > 0
    BEGIN
        DELETE FROM draw_prize_configs;
        PRINT '   ✓ Deleted ' + CAST(@DrawPrizeConfigsCount AS VARCHAR(10)) + ' records from draw_prize_configs';
    END

    -- 2. Delete betting_pool_draw_config references
    IF @BettingPoolDrawConfigCount > 0
    BEGIN
        UPDATE betting_pool_draw_config SET draw_id = NULL WHERE draw_id IS NOT NULL;
        PRINT '   ✓ Cleared ' + CAST(@BettingPoolDrawConfigCount AS VARCHAR(10)) + ' draw_id references from betting_pool_draw_config';
    END

    -- 3. Delete prize_changes_audit references
    IF @PrizeChangesAuditCount > 0
    BEGIN
        UPDATE prize_changes_audit SET draw_id = NULL WHERE draw_id IS NOT NULL;
        PRINT '   ✓ Cleared ' + CAST(@PrizeChangesAuditCount AS VARCHAR(10)) + ' draw_id references from prize_changes_audit';
    END

    -- 4. Delete betting_pool_draws (should be 0 already)
    DELETE FROM betting_pool_draws;
    PRINT '   ✓ Cleared betting_pool_draws';

    -- 5. Clear draw_id from results (should be 0 already)
    UPDATE results SET draw_id = NULL WHERE draw_id IS NOT NULL;
    PRINT '   ✓ Cleared draw_id from results';

    -- 6. Clear draw_id from ticket_lines (should be 0 already)
    UPDATE ticket_lines SET draw_id = NULL WHERE draw_id IS NOT NULL;
    PRINT '   ✓ Cleared draw_id from ticket_lines';

    -- 7. Finally delete all draws
    DELETE FROM draws;
    PRINT '   ✓ Deleted ' + CAST(@DrawsCount AS VARCHAR(10)) + ' records from draws';
    PRINT ''

    -- Verify deletion
    DECLARE @RemainingDraws INT;
    SELECT @RemainingDraws = COUNT(*) FROM draws;

    IF @RemainingDraws = 0
    BEGIN
        COMMIT TRANSACTION;
        PRINT '================================================================================'
        PRINT '✓ DELETION COMPLETED SUCCESSFULLY'
        PRINT '================================================================================'
        PRINT ''
        PRINT 'Summary:'
        PRINT '   - All ' + CAST(@DrawsCount AS VARCHAR(10)) + ' draws deleted'
        PRINT '   - All related data cleared'
        PRINT '   - Backup preserved in: draws_backup_20251111'
        PRINT ''
        PRINT 'To RESTORE the data, run:'
        PRINT '   SET IDENTITY_INSERT draws ON;'
        PRINT '   INSERT INTO draws SELECT * FROM draws_backup_20251111;'
        PRINT '   SET IDENTITY_INSERT draws OFF;'
        PRINT ''
    END
    ELSE
    BEGIN
        ROLLBACK TRANSACTION;
        PRINT '✗ ERROR: ' + CAST(@RemainingDraws AS VARCHAR(10)) + ' draws still remain!'
        PRINT '✗ Transaction rolled back'
    END

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ''
    PRINT '================================================================================'
    PRINT '✗ ERROR OCCURRED'
    PRINT '================================================================================'
    PRINT 'Error Message: ' + ERROR_MESSAGE()
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10))
    PRINT ''
    PRINT '✓ Transaction rolled back - NO data was deleted'
    PRINT '✓ Your data is safe in: draws_backup_20251111'
    PRINT ''
END CATCH

GO
