USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'TODAS LAS LOTERÍAS EN LA BASE DE DATOS';
PRINT '================================================================================';
PRINT '';

SELECT
    lottery_id AS ID,
    lottery_name AS Nombre,
    is_active AS Activa,
    display_order AS Orden
FROM lotteries
ORDER BY is_active DESC, display_order, lottery_name;

DECLARE @Total INT;
DECLARE @Active INT;
DECLARE @Inactive INT;

SELECT @Total = COUNT(*) FROM lotteries;
SELECT @Active = COUNT(*) FROM lotteries WHERE is_active = 1;
SELECT @Inactive = COUNT(*) FROM lotteries WHERE is_active = 0;

PRINT '';
PRINT '================================================================================';
PRINT 'Total de loterías: ' + CAST(@Total AS VARCHAR);
PRINT 'Activas: ' + CAST(@Active AS VARCHAR);
PRINT 'Inactivas: ' + CAST(@Inactive AS VARCHAR);
PRINT '================================================================================';

GO
