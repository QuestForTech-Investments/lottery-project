USE [lottery-db];
GO

DECLARE @Count INT;
DECLARE @Names NVARCHAR(MAX) = '';

SELECT @Count = COUNT(*) FROM lotteries WHERE is_active = 1;

PRINT '================================================================================';
PRINT 'TOTAL LOTERÍAS ACTIVAS: ' + CAST(@Count AS VARCHAR);
PRINT '================================================================================';
PRINT '';

-- Listar todas las loterías activas
DECLARE @LotteryId INT;
DECLARE @LotteryName NVARCHAR(500);
DECLARE @Counter INT = 0;

DECLARE lottery_cursor CURSOR FOR
    SELECT lottery_id, lottery_name
    FROM lotteries
    WHERE is_active = 1
    ORDER BY lottery_id;

OPEN lottery_cursor;
FETCH NEXT FROM lottery_cursor INTO @LotteryId, @LotteryName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Counter = @Counter + 1;
    PRINT RIGHT('  ' + CAST(@Counter AS VARCHAR), 3) + '. [' + RIGHT('   ' + CAST(@LotteryId AS VARCHAR), 3) + '] ' + @LotteryName;

    FETCH NEXT FROM lottery_cursor INTO @LotteryId, @LotteryName;
END;

CLOSE lottery_cursor;
DEALLOCATE lottery_cursor;

PRINT '';
PRINT '================================================================================';
PRINT 'FIN DE LA LISTA';
PRINT '================================================================================';
GO
