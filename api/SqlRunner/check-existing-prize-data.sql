USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'CHECKING EXISTING PRIZE FIELDS DATA';
PRINT '================================================================================';
PRINT '';

-- First, let's see the actual structure
PRINT '1. Table Structure:';
EXEC sp_help 'prize_fields';

PRINT '';
PRINT '2. Count of Prize Fields:';
SELECT COUNT(*) AS TotalPrizeFields FROM prize_fields WHERE is_active = 1;

PRINT '';
PRINT '3. Sample Prize Fields (First 20):';
SELECT TOP 20 * FROM prize_fields ORDER BY 1;

PRINT '';
PRINT '4. Check if we have betting_pool_general_config data:';
SELECT COUNT(*) AS TotalConfigs FROM betting_pool_general_config WHERE is_active = 1;

GO
