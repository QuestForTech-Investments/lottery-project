-- ==================================================
-- MIGRATION SIMPLIFIED: Deprecate lotteries, use draws
-- ==================================================
USE [lottery-db];
GO

SET NOCOUNT ON;

-- STEP 1: CREATE BACKUPS
SELECT * INTO betting_pool_prizes_commissions_backup_20251113 FROM betting_pool_prizes_commissions WHERE 1=0;
SELECT * INTO ticket_lines_backup_20251113 FROM ticket_lines WHERE 1=0;
SELECT * INTO lottery_game_compatibility_backup_20251113 FROM lottery_game_compatibility WHERE 1=0;
SELECT * INTO lottery_bet_type_compatibility_backup_20251113 FROM lottery_bet_type_compatibility WHERE 1=0;
SELECT * INTO draws_backup_20251113 FROM draws;
SELECT * INTO lotteries_backup_20251113 FROM lotteries;

-- STEP 2: DROP FOREIGN KEYS
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prizes_comm_lotteries')
    ALTER TABLE [betting_pool_prizes_commissions] DROP CONSTRAINT [FK_prizes_comm_lotteries];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ticket_lines_lotteries')
    ALTER TABLE [ticket_lines] DROP CONSTRAINT [FK_ticket_lines_lotteries];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__lottery_g__lotte__4E347170')
    ALTER TABLE [lottery_game_compatibility] DROP CONSTRAINT [FK__lottery_g__lotte__4E347170];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_comp_lottery')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_comp_lottery];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_lottery')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_lottery];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_draws_lotteries')
    ALTER TABLE [draws] DROP CONSTRAINT [FK_draws_lotteries];

-- STEP 3: DROP lottery_id COLUMNS
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'lottery_id')
    ALTER TABLE [betting_pool_prizes_commissions] DROP COLUMN [lottery_id];

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ticket_lines') AND name = 'lottery_id')
    ALTER TABLE [ticket_lines] DROP COLUMN [lottery_id];

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('draws') AND name = 'lottery_id')
    ALTER TABLE [draws] DROP COLUMN [lottery_id];

-- STEP 4: RENAME TABLES AND UPDATE COLUMNS
-- lottery_game_compatibility → draw_game_compatibility
IF OBJECT_ID('lottery_game_compatibility', 'U') IS NOT NULL
BEGIN
    -- Drop old FK to game_types if exists
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__lottery_g__game___4F2895A9')
        ALTER TABLE [lottery_game_compatibility] DROP CONSTRAINT [FK__lottery_g__game___4F2895A9];

    -- Rename lottery_id to draw_id
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('lottery_game_compatibility') AND name = 'lottery_id')
        EXEC sp_rename 'lottery_game_compatibility.lottery_id', 'draw_id', 'COLUMN';

    -- Rename table
    EXEC sp_rename 'lottery_game_compatibility', 'draw_game_compatibility';

    -- Recreate FK to game_types
    ALTER TABLE [draw_game_compatibility]
        ADD CONSTRAINT [FK_draw_game_compat_game_types]
        FOREIGN KEY ([game_type_id]) REFERENCES [game_types] ([game_type_id]);

    -- Create FK to draws
    ALTER TABLE [draw_game_compatibility]
        ADD CONSTRAINT [FK_draw_game_compat_draws]
        FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
END

-- lottery_bet_type_compatibility → draw_bet_type_compatibility
IF OBJECT_ID('lottery_bet_type_compatibility', 'U') IS NOT NULL
BEGIN
    -- Drop old FK to bet_types if exists
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_bet_type')
        ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_bet_type];

    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_comp_bet_type')
        ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_comp_bet_type];

    -- Rename lottery_id to draw_id
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('lottery_bet_type_compatibility') AND name = 'lottery_id')
        EXEC sp_rename 'lottery_bet_type_compatibility.lottery_id', 'draw_id', 'COLUMN';

    -- Rename table
    EXEC sp_rename 'lottery_bet_type_compatibility', 'draw_bet_type_compatibility';

    -- Recreate FK to bet_types
    ALTER TABLE [draw_bet_type_compatibility]
        ADD CONSTRAINT [FK_draw_bet_type_compat_bet_types]
        FOREIGN KEY ([bet_type_id]) REFERENCES [bet_types] ([bet_type_id]);

    -- Create FK to draws
    ALTER TABLE [draw_bet_type_compatibility]
        ADD CONSTRAINT [FK_draw_bet_type_compat_draws]
        FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
END

-- STEP 5: DEPRECATE LOTTERIES TABLE
IF OBJECT_ID('lotteries', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('lotteries') AND name = 'is_deprecated')
        ALTER TABLE [lotteries] ADD [is_deprecated] BIT NOT NULL DEFAULT(1);

    UPDATE [lotteries] SET [is_deprecated] = 1, [is_active] = 0;
END

PRINT 'Migration completed successfully!';
PRINT 'Check tables: lotteries (deprecated), draws, draw_game_compatibility, draw_bet_type_compatibility';

GO
