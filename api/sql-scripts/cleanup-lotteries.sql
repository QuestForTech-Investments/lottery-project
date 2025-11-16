USE [lottery-db];
GO

-- =============================================
-- Script para limpiar loterías activadas
-- =============================================

PRINT '================================================================================';
PRINT 'LIMPIEZA DE LOTERÍAS';
PRINT '================================================================================';
PRINT '';

-- 1. Resolver duplicado en orden 9 (mantener solo "La Real", desactivar "Loto Real")
PRINT '1. Resolviendo duplicado en orden 9...';
UPDATE lotteries
SET is_active = 0, display_order = NULL
WHERE lottery_name = 'Loto Real';
PRINT '   ✓ "Loto Real" desactivada (mantuvimos "La Real")';
GO

-- 2. Desactivar loterías extra que no estaban en la lista solicitada (órdenes 70-73)
PRINT '';
PRINT '2. Desactivando loterías extra no solicitadas...';
UPDATE lotteries
SET is_active = 0, display_order = NULL
WHERE lottery_name IN ('Ohio Pick 3', 'Illinois Pick 3', 'Mississippi Pick 3', 'Diaria');
PRINT '   ✓ Ohio Pick 3, Illinois Pick 3, Mississippi Pick 3, Diaria desactivadas';
GO

-- 3. Mostrar resumen actualizado
PRINT '';
PRINT '================================================================================';
PRINT 'LOTERÍAS ACTIVAS DESPUÉS DE LIMPIEZA';
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
ORDER BY display_order, lottery_name;

OPEN lottery_cursor;

FETCH NEXT FROM lottery_cursor INTO @Orden, @ID, @Nombre;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Counter = @Counter + 1;
    DECLARE @Line NVARCHAR(500);
    SET @Line = FORMAT(@Counter, '00') + '. Orden: ' +
                ISNULL(CAST(@Orden AS NVARCHAR(10)), 'NULL') +
                ' | ID: ' + CAST(@ID AS NVARCHAR(10)) +
                ' | ' + @Nombre;
    PRINT @Line;

    FETCH NEXT FROM lottery_cursor INTO @Orden, @ID, @Nombre;
END

CLOSE lottery_cursor;
DEALLOCATE lottery_cursor;

PRINT '';
PRINT '================================================================================';
PRINT 'Total: ' + CAST(@Counter AS VARCHAR) + ' loterías activas';
PRINT '================================================================================';

GO
