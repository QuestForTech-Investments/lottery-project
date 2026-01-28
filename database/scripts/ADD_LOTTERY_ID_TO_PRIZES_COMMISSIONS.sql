-- Migration: Add lottery_id column to betting_pool_prizes_commissions table
-- Date: 2026-01-28
-- Description: The model expects lottery_id for lottery-specific commission configurations

-- Check if column exists before adding
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_prizes_commissions'
    AND COLUMN_NAME = 'lottery_id'
)
BEGIN
    ALTER TABLE betting_pool_prizes_commissions
    ADD lottery_id INT NULL;

    -- Add foreign key constraint
    ALTER TABLE betting_pool_prizes_commissions
    ADD CONSTRAINT FK_BettingPoolPrizesCommissions_Lottery
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id);

    PRINT 'Column lottery_id added to betting_pool_prizes_commissions';
END
ELSE
BEGIN
    PRINT 'Column lottery_id already exists in betting_pool_prizes_commissions';
END
GO
