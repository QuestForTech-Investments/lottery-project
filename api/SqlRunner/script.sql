-- Add opening_time and closing_time columns to betting_pool_schedules table
USE [lottery-db];
GO

-- Add opening_time column (business opening time)
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[betting_pool_schedules]')
    AND name = 'opening_time'
)
BEGIN
    ALTER TABLE [dbo].[betting_pool_schedules]
    ADD [opening_time] TIME NULL;
    PRINT 'Column opening_time added successfully';
END
ELSE
BEGIN
    PRINT 'Column opening_time already exists';
END
GO

-- Add closing_time column (business closing time)
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[betting_pool_schedules]')
    AND name = 'closing_time'
)
BEGIN
    ALTER TABLE [dbo].[betting_pool_schedules]
    ADD [closing_time] TIME NULL;
    PRINT 'Column closing_time added successfully';
END
ELSE
BEGIN
    PRINT 'Column closing_time already exists';
END
GO

SELECT 'Migration complete!' AS Result;
