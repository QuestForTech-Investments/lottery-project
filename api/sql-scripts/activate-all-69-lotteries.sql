USE [lottery-db];
GO

-- =============================================
-- Script para activar TODAS las 69 loterías
-- Numeradas secuencialmente del 1 al 69
-- =============================================

PRINT '================================================================================';
PRINT 'ACTIVANDO TODAS LAS 69 LOTERÍAS';
PRINT '================================================================================';
PRINT '';

-- Activar todas las loterías y asignarles display_order secuencial
WITH OrderedLotteries AS (
    SELECT
        lottery_id,
        lottery_name,
        ROW_NUMBER() OVER (ORDER BY lottery_id) AS new_order
    FROM lotteries
)
UPDATE l
SET
    l.is_active = 1,
    l.display_order = ol.new_order
FROM lotteries l
INNER JOIN OrderedLotteries ol ON l.lottery_id = ol.lottery_id;

PRINT '✓ Todas las 69 loterías activadas con display_order secuencial';
GO

-- Mostrar resumen
PRINT '';
PRINT '================================================================================';
PRINT 'LOTERÍAS ACTIVAS (TODAS LAS 69)';
PRINT '================================================================================';
PRINT '';

DECLARE @Orden INT;
DECLARE @ID INT;
DECLARE @Nombre NVARCHAR(255);
DECLARE @Counter INT = 0;

DECLARE lottery_cursor CURSOR FOR
SELECT display_order, lottery_id, lottery_name
FROM lotteries
WHERE is_active = 1
ORDER BY display_order;

OPEN lottery_cursor;

FETCH NEXT FROM lottery_cursor INTO @Orden, @ID, @Nombre;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Counter = @Counter + 1;
    DECLARE @Line NVARCHAR(500);
    SET @Line = FORMAT(@Counter, '00') + '. Orden: ' +
                CAST(@Orden AS NVARCHAR(10)) +
                ' | ID: ' + CAST(@ID AS NVARCHAR(10)) +
                ' | ' + @Nombre;
    PRINT @Line;

    FETCH NEXT FROM lottery_cursor INTO @Orden, @ID, @Nombre;
END

CLOSE lottery_cursor;
DEALLOCATE lottery_cursor;

PRINT '';
PRINT '================================================================================';
PRINT 'Total de loterías activas: ' + CAST(@Counter AS VARCHAR);
PRINT '================================================================================';

GO

