-- Add opening_time and closing_time columns to betting_pool_schedules table
-- These columns represent the operating hours of the betting pool (banca)
-- while close_time and draw_time represent when sales close and the lottery draw occurs

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

PRINT '';
PRINT 'Migration complete!';
PRINT '';
PRINT 'Column definitions:';
PRINT '- opening_time: Business opening hours (e.g., 08:00 AM)';
PRINT '- closing_time: Business closing hours (e.g., 10:00 PM)';
PRINT '- close_time: When ticket sales close for draws';
PRINT '- draw_time: When the lottery draw occurs';
GO
