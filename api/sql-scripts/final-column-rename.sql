USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'FINAL STEP: RENAMING monto_multiplicador COLUMNS';
PRINT '================================================================================';
PRINT '';

-- Step 1: Drop stored procedure if it exists
IF OBJECT_ID('sp_GetEffectiveMultipliers', 'P') IS NOT NULL
BEGIN
    PRINT 'Dropping sp_GetEffectiveMultipliers...';
    DROP PROCEDURE sp_GetEffectiveMultipliers;
    PRINT '✓ Dropped';
    PRINT '';
END

GO

-- Step 2: Rename columns
PRINT 'Renaming columns...';
PRINT '';

EXEC sp_rename 'betting_pool_general_config.monto_multiplicador', 'multiplier_amount', 'COLUMN';
PRINT '✓ betting_pool_general_config.multiplier_amount renamed';

EXEC sp_rename 'betting_pool_draw_config.monto_multiplicador', 'multiplier_amount', 'COLUMN';
PRINT '✓ betting_pool_draw_config.multiplier_amount renamed';

PRINT '';

GO

-- Step 3: Recreate stored procedure with English column names
PRINT 'Recreating sp_GetEffectiveMultipliers with English names...';
PRINT '';

CREATE PROCEDURE sp_GetEffectiveMultipliers
    @BettingPoolId INT,
    @DrawId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pf.prize_field_id AS PrizeFieldId,
        pf.field_code AS FieldCode,
        pf.field_name AS FieldName,
        bt.bet_type_code AS BetTypeCode,

        -- Effective multiplier (precedence: draw override > general config > system default)
        COALESCE(
            pdc.multiplier_amount,  -- Level 3: Draw override
            pgc.multiplier_amount,  -- Level 2: Betting pool general
            pf.default_multiplier   -- Level 1: System default
        ) AS EffectiveMultiplier,

        -- Source values for transparency
        pf.default_multiplier AS SystemDefault,
        pgc.multiplier_amount AS BettingPoolGeneral,
        pdc.multiplier_amount AS DrawOverride,

        -- Source indicator
        CASE
            WHEN pdc.multiplier_amount IS NOT NULL THEN 'DRAW_OVERRIDE'
            WHEN pgc.multiplier_amount IS NOT NULL THEN 'BETTING_POOL_GENERAL'
            ELSE 'SYSTEM_DEFAULT'
        END AS Source,

        -- Validation limits
        pf.min_multiplier AS MinValue,
        pf.max_multiplier AS MaxValue

    FROM prize_fields pf
    INNER JOIN bet_types bt ON pf.bet_type_id = bt.bet_type_id
    LEFT JOIN betting_pool_general_config pgc
        ON pgc.betting_pool_id = @BettingPoolId
        AND pgc.prize_field_id = pf.prize_field_id
        AND pgc.is_active = 1
    LEFT JOIN betting_pool_draw_config pdc
        ON pdc.betting_pool_id = @BettingPoolId
        AND pdc.draw_id = @DrawId
        AND pdc.prize_field_id = pf.prize_field_id
        AND pdc.is_active = 1
    WHERE pf.is_active = 1
    ORDER BY bt.display_order, pf.display_order;
END;

PRINT '✓ Stored procedure recreated';
PRINT '';

GO

PRINT '================================================================================';
PRINT '✓ ALL SPANISH NAMES SUCCESSFULLY RENAMED TO ENGLISH!';
PRINT '================================================================================';
PRINT '';
PRINT 'Summary:';
PRINT '  - sorteos → deleted (draws is the primary table)';
PRINT '  - banca_sorteos → deleted (betting_pool_draws is the primary table)';
PRINT '  - monto_multiplicador → multiplier_amount (2 tables)';
PRINT '  - sp_GetEffectiveMultipliers updated to use English column names';
PRINT '  - All foreign keys point to English table names';
PRINT '';
PRINT 'Database is now 100% in English!';
PRINT '';

GO
