USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'LOTERÍAS ACTIVAS CON DISPLAY_ORDER';
PRINT '================================================================================';
PRINT '';

DECLARE @Orden INT;
DECLARE @ID INT;
DECLARE @Nombre NVARCHAR(255);
DECLARE @Tipo NVARCHAR(100);
DECLARE @Counter INT = 0;

DECLARE lottery_cursor CURSOR FOR
SELECT display_order, lottery_id, lottery_name, lottery_type
FROM lotteries
WHERE is_active = 1
ORDER BY display_order, lottery_name;

OPEN lottery_cursor;

FETCH NEXT FROM lottery_cursor INTO @Orden, @ID, @Nombre, @Tipo;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Counter = @Counter + 1;
    DECLARE @Line NVARCHAR(500);
    SET @Line = FORMAT(@Counter, '00') + '. Orden: ' +
                ISNULL(CAST(@Orden AS NVARCHAR(10)), 'NULL') +
                ' | ID: ' + CAST(@ID AS NVARCHAR(10)) +
                ' | ' + @Nombre;
    PRINT @Line;

    FETCH NEXT FROM lottery_cursor INTO @Orden, @ID, @Nombre, @Tipo;
END

CLOSE lottery_cursor;
DEALLOCATE lottery_cursor;

PRINT '';
PRINT '================================================================================';
PRINT 'Total: ' + CAST(@Counter AS VARCHAR) + ' loterías activas';
PRINT '================================================================================';

GO
