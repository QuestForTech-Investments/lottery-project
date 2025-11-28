-- Migration: Add timezone column to lotteries table
-- Date: 2025-11-28
-- Description: Adds timezone support per lottery for international deployments

-- Step 1: Add timezone column with default value for Dominican Republic
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'lotteries' AND COLUMN_NAME = 'timezone'
)
BEGIN
    ALTER TABLE lotteries ADD timezone NVARCHAR(50) NOT NULL DEFAULT 'America/Santo_Domingo';
    PRINT 'Column timezone added to lotteries table';
END
ELSE
BEGIN
    PRINT 'Column timezone already exists in lotteries table';
END
GO

-- Step 2: Update existing lotteries based on their country (optional)
-- Dominican Republic lotteries
UPDATE lotteries SET timezone = 'America/Santo_Domingo' WHERE country_id = 1 AND timezone = 'America/Santo_Domingo';

-- USA lotteries (if any)
-- UPDATE lotteries SET timezone = 'America/New_York' WHERE country_id = 2;

-- Verify the change
SELECT lottery_id, lottery_name, timezone FROM lotteries;
GO
