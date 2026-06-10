-- =====================================================================
-- Extend UQ_pool_lottery_game to include DrawId so per-draw commission
-- overrides can coexist with the lottery-wide row.
--
-- Before: UNIQUE (betting_pool_id, lottery_id, game_type)
-- After:  UNIQUE (betting_pool_id, lottery_id, game_type, draw_id)
--
-- Idempotent: safe to re-run.
-- =====================================================================

SET NOCOUNT ON;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UQ_pool_lottery_game'
      AND object_id = OBJECT_ID('dbo.betting_pool_prizes_commissions')
)
BEGIN
    PRINT 'Dropping existing UQ_pool_lottery_game...';
    DROP INDEX [UQ_pool_lottery_game] ON [dbo].[betting_pool_prizes_commissions];
END
ELSE
BEGIN
    PRINT 'UQ_pool_lottery_game not present (already dropped or never existed).';
END

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UQ_pool_lottery_game_draw'
      AND object_id = OBJECT_ID('dbo.betting_pool_prizes_commissions')
)
BEGIN
    PRINT 'Creating UQ_pool_lottery_game_draw with draw_id...';
    CREATE UNIQUE INDEX [UQ_pool_lottery_game_draw]
        ON [dbo].[betting_pool_prizes_commissions]
        ([betting_pool_id], [lottery_id], [game_type], [draw_id]);
END
ELSE
BEGIN
    PRINT 'UQ_pool_lottery_game_draw already exists.';
END

PRINT 'Migration completed.';
