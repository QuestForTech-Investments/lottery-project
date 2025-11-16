USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'LOTERÍAS ACTIVAS ORDENADAS POR display_order';
PRINT '================================================================================';
PRINT '';

SELECT
    display_order AS 'Orden',
    lottery_id AS 'ID',
    lottery_name AS 'Nombre',
    lottery_type AS 'Tipo'
FROM lotteries
WHERE is_active = 1
ORDER BY display_order, lottery_name;

DECLARE @Count INT;
SELECT @Count = COUNT(*) FROM lotteries WHERE is_active = 1;

PRINT '';
PRINT '================================================================================';
PRINT 'Total de loterías activas: ' + CAST(@Count AS VARCHAR);
PRINT '================================================================================';
GO
