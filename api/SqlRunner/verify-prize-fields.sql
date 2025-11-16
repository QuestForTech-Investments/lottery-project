USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'PRIZE FIELDS VERIFICATION';
PRINT '================================================================================';
PRINT '';

-- Count total prize fields
DECLARE @TotalFields INT;
SELECT @TotalFields = COUNT(*) FROM prize_fields WHERE is_active = 1;

PRINT 'Total active prize fields: ' + CAST(@TotalFields AS VARCHAR);
PRINT '';

-- Show breakdown by bet type
PRINT 'Prize fields by bet type:';
PRINT '----------------------------------------';
SELECT
    bt.bet_type_code,
    bt.bet_type_name,
    COUNT(*) AS field_count
FROM prize_fields pf
INNER JOIN bet_types bt ON pf.bet_type_id = bt.bet_type_id
WHERE pf.is_active = 1
GROUP BY bt.bet_type_code, bt.bet_type_name
ORDER BY bt.bet_type_code;

PRINT '';
PRINT '================================================================================';
PRINT 'VERIFICATION COMPLETE';
PRINT '================================================================================';
PRINT '';

GO
