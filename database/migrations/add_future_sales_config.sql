-- Migration: Add Future Sales Configuration to betting_pool_config
-- Date: 2026-02-06
-- Description: Adds allow_future_sales and max_future_days columns to betting_pool_config table

-- Add allow_future_sales column (default: true - allows future sales)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'betting_pool_config') AND name = 'allow_future_sales')
BEGIN
    ALTER TABLE betting_pool_config
    ADD allow_future_sales BIT NOT NULL DEFAULT 1;
    PRINT 'Added column: allow_future_sales';
END
ELSE
BEGIN
    PRINT 'Column allow_future_sales already exists';
END
GO

-- Add max_future_days column (default: 7 days)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'betting_pool_config') AND name = 'max_future_days')
BEGIN
    ALTER TABLE betting_pool_config
    ADD max_future_days INT NOT NULL DEFAULT 7;
    PRINT 'Added column: max_future_days';
END
ELSE
BEGIN
    PRINT 'Column max_future_days already exists';
END
GO

-- Add check constraint for max_future_days (1-7 range)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_betting_pool_config_max_future_days')
BEGIN
    ALTER TABLE betting_pool_config
    ADD CONSTRAINT CK_betting_pool_config_max_future_days
    CHECK (max_future_days >= 1 AND max_future_days <= 7);
    PRINT 'Added constraint: CK_betting_pool_config_max_future_days';
END
GO

PRINT 'Migration completed: Future Sales Configuration';
