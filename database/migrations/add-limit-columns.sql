-- Migration: Add new columns to limit_rules table for Limits Module (Phase 4)
-- Date: 2026-02-06

-- Check if columns exist before adding them
-- 1. Add limit_type column (enum stored as int, default 1 = GeneralForGroup)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'limit_type')
BEGIN
    ALTER TABLE limit_rules ADD limit_type INT NOT NULL DEFAULT 1;
    PRINT 'Added column: limit_type';
END
ELSE
    PRINT 'Column limit_type already exists';

-- 2. Add lottery_id column (FK to lotteries)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'lottery_id')
BEGIN
    ALTER TABLE limit_rules ADD lottery_id INT NULL;
    PRINT 'Added column: lottery_id';
END
ELSE
    PRINT 'Column lottery_id already exists';

-- 3. Add zone_id column (FK to zones)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'zone_id')
BEGIN
    ALTER TABLE limit_rules ADD zone_id INT NULL;
    PRINT 'Added column: zone_id';
END
ELSE
    PRINT 'Column zone_id already exists';

-- 4. Add group_id column (for future group support)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'group_id')
BEGIN
    ALTER TABLE limit_rules ADD group_id INT NULL;
    PRINT 'Added column: group_id';
END
ELSE
    PRINT 'Column group_id already exists';

-- 5. Add betting_pool_id column (FK to betting_pools)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'betting_pool_id')
BEGIN
    ALTER TABLE limit_rules ADD betting_pool_id INT NULL;
    PRINT 'Added column: betting_pool_id';
END
ELSE
    PRINT 'Column betting_pool_id already exists';

-- 6. Add days_of_week column (bitmask: 1=Mon, 2=Tue, 4=Wed, 8=Thu, 16=Fri, 32=Sat, 64=Sun)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'days_of_week')
BEGIN
    ALTER TABLE limit_rules ADD days_of_week INT NULL;
    PRINT 'Added column: days_of_week';
END
ELSE
    PRINT 'Column days_of_week already exists';

-- Add foreign key constraints (if they don't exist)
-- FK to lotteries
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_limit_rules_lottery')
BEGIN
    ALTER TABLE limit_rules
    ADD CONSTRAINT FK_limit_rules_lottery
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id);
    PRINT 'Added FK: FK_limit_rules_lottery';
END

-- FK to zones
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_limit_rules_zone')
BEGIN
    ALTER TABLE limit_rules
    ADD CONSTRAINT FK_limit_rules_zone
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id);
    PRINT 'Added FK: FK_limit_rules_zone';
END

-- FK to betting_pools
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_limit_rules_betting_pool')
BEGIN
    ALTER TABLE limit_rules
    ADD CONSTRAINT FK_limit_rules_betting_pool
    FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id);
    PRINT 'Added FK: FK_limit_rules_betting_pool';
END

-- Create index for common queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_limit_rules_limit_type')
BEGIN
    CREATE INDEX IX_limit_rules_limit_type ON limit_rules(limit_type);
    PRINT 'Created index: IX_limit_rules_limit_type';
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_limit_rules_betting_pool')
BEGIN
    CREATE INDEX IX_limit_rules_betting_pool ON limit_rules(betting_pool_id);
    PRINT 'Created index: IX_limit_rules_betting_pool';
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_limit_rules_zone')
BEGIN
    CREATE INDEX IX_limit_rules_zone ON limit_rules(zone_id);
    PRINT 'Created index: IX_limit_rules_zone';
END

PRINT '';
PRINT 'Migration completed successfully!';
GO
