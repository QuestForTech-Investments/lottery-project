-- Migration: Add IDENTITY to prize_commission_id column
-- Date: 2026-01-28
-- Description: The prize_commission_id column needs IDENTITY(1,1) so EF Core can auto-generate IDs on INSERT.
--              Without IDENTITY, EF Core INSERT fails with "An error occurred while saving the entity changes."
-- Issue: The column was created as `int NOT NULL` without IDENTITY. Existing records were inserted by stored procedures
--        that manually calculated MAX(prize_commission_id) + ROW_NUMBER().

-- Step 1: Check current max ID for IDENTITY seed
DECLARE @maxId INT;
SELECT @maxId = ISNULL(MAX(prize_commission_id), 0) FROM betting_pool_prizes_commissions;
PRINT 'Current max prize_commission_id: ' + CAST(@maxId AS VARCHAR);

-- Step 2: Drop foreign key constraints referencing this table (if any child tables reference it)
-- Note: No child tables reference prize_commission_id as FK, so no FKs to drop from other tables

-- Step 3: Drop existing constraints on this table
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_prizes_comm_betting_pools' AND parent_object_id = OBJECT_ID('betting_pool_prizes_commissions'))
    ALTER TABLE betting_pool_prizes_commissions DROP CONSTRAINT FK_prizes_comm_betting_pools;

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_prizes_comm_lotteries' AND parent_object_id = OBJECT_ID('betting_pool_prizes_commissions'))
    ALTER TABLE betting_pool_prizes_commissions DROP CONSTRAINT FK_prizes_comm_lotteries;

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_BettingPoolPrizesCommissions_Lottery' AND parent_object_id = OBJECT_ID('betting_pool_prizes_commissions'))
    ALTER TABLE betting_pool_prizes_commissions DROP CONSTRAINT FK_BettingPoolPrizesCommissions_Lottery;

-- Drop unique index
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_pool_lottery_game' AND object_id = OBJECT_ID('betting_pool_prizes_commissions'))
    DROP INDEX UQ_pool_lottery_game ON betting_pool_prizes_commissions;

-- Also drop EF Core generated unique index (if exists)
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_betting_pool_prizes_commissions_betting_pool_id_lottery_id_game_type' AND object_id = OBJECT_ID('betting_pool_prizes_commissions'))
    DROP INDEX IX_betting_pool_prizes_commissions_betting_pool_id_lottery_id_game_type ON betting_pool_prizes_commissions;

-- Step 4: Create temp table with IDENTITY
CREATE TABLE betting_pool_prizes_commissions_new (
    [prize_commission_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [lottery_id] int NULL,
    [game_type] varchar(50) NOT NULL,
    [prize_payment_1] decimal(10,2) NULL,
    [prize_payment_2] decimal(10,2) NULL,
    [prize_payment_3] decimal(10,2) NULL,
    [prize_payment_4] decimal(10,2) NULL,
    [commission_discount_1] decimal(5,2) NULL,
    [commission_discount_2] decimal(5,2) NULL,
    [commission_discount_3] decimal(5,2) NULL,
    [commission_discount_4] decimal(5,2) NULL,
    [commission_2_discount_1] decimal(5,2) NULL,
    [commission_2_discount_2] decimal(5,2) NULL,
    [commission_2_discount_3] decimal(5,2) NULL,
    [commission_2_discount_4] decimal(5,2) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_prizes_new] PRIMARY KEY CLUSTERED ([prize_commission_id])
);

-- Step 5: Copy existing data (preserving original IDs)
SET IDENTITY_INSERT betting_pool_prizes_commissions_new ON;

INSERT INTO betting_pool_prizes_commissions_new (
    prize_commission_id, betting_pool_id, lottery_id, game_type,
    prize_payment_1, prize_payment_2, prize_payment_3, prize_payment_4,
    commission_discount_1, commission_discount_2, commission_discount_3, commission_discount_4,
    commission_2_discount_1, commission_2_discount_2, commission_2_discount_3, commission_2_discount_4,
    is_active, created_at, updated_at, created_by, updated_by
)
SELECT
    prize_commission_id, betting_pool_id, lottery_id, game_type,
    prize_payment_1, prize_payment_2, prize_payment_3, prize_payment_4,
    commission_discount_1, commission_discount_2, commission_discount_3, commission_discount_4,
    commission_2_discount_1, commission_2_discount_2, commission_2_discount_3, commission_2_discount_4,
    is_active, created_at, updated_at, created_by, updated_by
FROM betting_pool_prizes_commissions;

SET IDENTITY_INSERT betting_pool_prizes_commissions_new OFF;

DECLARE @rowsCopied INT = @@ROWCOUNT;
PRINT 'Rows copied: ' + CAST(@rowsCopied AS VARCHAR);

-- Step 6: Drop old table and rename new one
DROP TABLE betting_pool_prizes_commissions;
EXEC sp_rename 'betting_pool_prizes_commissions_new', 'betting_pool_prizes_commissions';
EXEC sp_rename 'PK_betting_pool_prizes_new', 'PK_betting_pool_prizes', 'OBJECT';

-- Step 7: Recreate foreign keys
ALTER TABLE betting_pool_prizes_commissions
ADD CONSTRAINT FK_prizes_comm_betting_pools FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id);

ALTER TABLE betting_pool_prizes_commissions
ADD CONSTRAINT FK_prizes_comm_lotteries FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id);

-- Step 8: Recreate unique index
CREATE UNIQUE NONCLUSTERED INDEX [UQ_pool_lottery_game]
ON betting_pool_prizes_commissions (betting_pool_id, lottery_id, game_type);

-- Step 9: Reseed IDENTITY to continue from max existing ID
DBCC CHECKIDENT ('betting_pool_prizes_commissions', RESEED);

PRINT 'Migration complete: prize_commission_id now has IDENTITY(1,1)';

-- Verify
SELECT
    c.name AS column_name,
    c.is_identity,
    IDENT_SEED('betting_pool_prizes_commissions') AS seed,
    IDENT_CURRENT('betting_pool_prizes_commissions') AS current_value
FROM sys.columns c
WHERE c.object_id = OBJECT_ID('betting_pool_prizes_commissions')
AND c.name = 'prize_commission_id';
GO
