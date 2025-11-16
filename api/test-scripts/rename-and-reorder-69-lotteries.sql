USE [lottery-db];
GO

-- =============================================
-- Script para renombrar y reordenar las 69 loterías existentes
-- según la lista específica del usuario
-- =============================================

PRINT '==================================================================================================';
PRINT 'RENOMBRANDO Y REORDENANDO LAS 69 LOTERÍAS';
PRINT '================================================================================';
PRINT '';

-- Activar todas las 69 loterías existentes y asignarles los nuevos nombres y órdenes
UPDATE lotteries SET is_active = 1, lottery_name = 'LA PRIMERA', display_order = 1 WHERE lottery_id = 43;
UPDATE lotteries SET is_active = 1, lottery_name = 'NEW YORK DAY', display_order = 2 WHERE lottery_id = 5;
UPDATE lotteries SET is_active = 1, lottery_name = 'NEW YORK NIGHT', display_order = 3 WHERE lottery_id = 6;
UPDATE lotteries SET is_active = 1, lottery_name = 'FLORIDA AM', display_order = 4 WHERE lottery_id = 1;
UPDATE lotteries SET is_active = 1, lottery_name = 'FLORIDA PM', display_order = 5 WHERE lottery_id = 2;
UPDATE lotteries SET is_active = 1, lottery_name = 'GANA MAS', display_order = 6 WHERE lottery_id = 45;
UPDATE lotteries SET is_active = 1, lottery_name = 'NACIONAL', display_order = 7 WHERE lottery_id = 47;
UPDATE lotteries SET is_active = 1, lottery_name = 'QUINIELA PALE', display_order = 8 WHERE lottery_id = 61;
UPDATE lotteries SET is_active = 1, lottery_name = 'REAL', display_order = 9 WHERE lottery_id = 49;
UPDATE lotteries SET is_active = 1, lottery_name = 'LOTEKA', display_order = 10 WHERE lottery_id = 9;
UPDATE lotteries SET is_active = 1, lottery_name = 'FL PICK2 AM', display_order = 11 WHERE lottery_id = 51;
UPDATE lotteries SET is_active = 1, lottery_name = 'FL PICK2 PM', display_order = 12 WHERE lottery_id = 52;
UPDATE lotteries SET is_active = 1, lottery_name = 'GEORGIA-MID AM', display_order = 13 WHERE lottery_id = 3;
UPDATE lotteries SET is_active = 1, lottery_name = 'GEORGIA EVENING', display_order = 14 WHERE lottery_id = 4;
UPDATE lotteries SET is_active = 1, lottery_name = 'GEORGIA NIGHT', display_order = 15 WHERE lottery_id = 29;
UPDATE lotteries SET is_active = 1, lottery_name = 'NEW JERSEY AM', display_order = 16 WHERE lottery_id = 31;
UPDATE lotteries SET is_active = 1, lottery_name = 'NEW JERSEY PM', display_order = 17 WHERE lottery_id = 12;
UPDATE lotteries SET is_active = 1, lottery_name = 'CONNECTICUT AM', display_order = 18 WHERE lottery_id = 38;
UPDATE lotteries SET is_active = 1, lottery_name = 'CONNECTICUT PM', display_order = 19 WHERE lottery_id = 13;
UPDATE lotteries SET is_active = 1, lottery_name = 'CALIFORNIA AM', display_order = 20 WHERE lottery_id = 7;
UPDATE lotteries SET is_active = 1, lottery_name = 'CALIFORNIA PM', display_order = 21 WHERE lottery_id = 14;
UPDATE lotteries SET is_active = 1, lottery_name = 'CHICAGO AM', display_order = 22 WHERE lottery_id = 37;
UPDATE lotteries SET is_active = 1, lottery_name = 'CHICAGO PM', display_order = 23 WHERE lottery_id = 15;
UPDATE lotteries SET is_active = 1, lottery_name = 'PENN MIDDAY', display_order = 24 WHERE lottery_id = 32;
UPDATE lotteries SET is_active = 1, lottery_name = 'PENN EVENING', display_order = 25 WHERE lottery_id = 16;
UPDATE lotteries SET is_active = 1, lottery_name = 'INDIANA MIDDAY', display_order = 26 WHERE lottery_id = 30;
UPDATE lotteries SET is_active = 1, lottery_name = 'INDIANA EVENING', display_order = 27 WHERE lottery_id = 17;
UPDATE lotteries SET is_active = 1, lottery_name = 'DIARIA 11AM', display_order = 28 WHERE lottery_id = 64;
UPDATE lotteries SET is_active = 1, lottery_name = 'DIARIA 3PM', display_order = 29 WHERE lottery_id = 65;
UPDATE lotteries SET is_active = 1, lottery_name = 'DIARIA 9PM', display_order = 30 WHERE lottery_id = 66;
UPDATE lotteries SET is_active = 1, lottery_name = 'SUPER PALE TARDE', display_order = 31 WHERE lottery_id = 50;
UPDATE lotteries SET is_active = 1, lottery_name = 'SUPER PALE NOCHE', display_order = 32 WHERE lottery_id = 18;
UPDATE lotteries SET is_active = 1, lottery_name = 'SUPER PALE NY-FL AM', display_order = 33 WHERE lottery_id = 19;
UPDATE lotteries SET is_active = 1, lottery_name = 'SUPER PALE NY-FL PM', display_order = 34 WHERE lottery_id = 20;
UPDATE lotteries SET is_active = 1, lottery_name = 'TEXAS MORNING', display_order = 35 WHERE lottery_id = 27;
UPDATE lotteries SET is_active = 1, lottery_name = 'TEXAS DAY', display_order = 36 WHERE lottery_id = 21;
UPDATE lotteries SET is_active = 1, lottery_name = 'TEXAS EVENING', display_order = 37 WHERE lottery_id = 22;
UPDATE lotteries SET is_active = 1, lottery_name = 'TEXAS NIGHT', display_order = 38 WHERE lottery_id = 23;
UPDATE lotteries SET is_active = 1, lottery_name = 'VIRGINIA AM', display_order = 39 WHERE lottery_id = 33;
UPDATE lotteries SET is_active = 1, lottery_name = 'VIRGINIA PM', display_order = 40 WHERE lottery_id = 24;
UPDATE lotteries SET is_active = 1, lottery_name = 'SOUTH CAROLINA AM', display_order = 41 WHERE lottery_id = 40;
UPDATE lotteries SET is_active = 1, lottery_name = 'SOUTH CAROLINA PM', display_order = 42 WHERE lottery_id = 25;
UPDATE lotteries SET is_active = 1, lottery_name = 'MARYLAND MIDDAY', display_order = 43 WHERE lottery_id = 39;
UPDATE lotteries SET is_active = 1, lottery_name = 'MARYLAND EVENING', display_order = 44 WHERE lottery_id = 26;
UPDATE lotteries SET is_active = 1, lottery_name = 'MASS AM', display_order = 45 WHERE lottery_id = 57;
UPDATE lotteries SET is_active = 1, lottery_name = 'MASS PM', display_order = 46 WHERE lottery_id = 10;
UPDATE lotteries SET is_active = 1, lottery_name = 'LA SUERTE', display_order = 47 WHERE lottery_id = 44;
UPDATE lotteries SET is_active = 1, lottery_name = 'NORTH CAROLINA AM', display_order = 48 WHERE lottery_id = 35;
UPDATE lotteries SET is_active = 1, lottery_name = 'NORTH CAROLINA PM', display_order = 49 WHERE lottery_id = 48;
UPDATE lotteries SET is_active = 1, lottery_name = 'LOTEDOM', display_order = 50 WHERE lottery_id = 46;
UPDATE lotteries SET is_active = 1, lottery_name = 'NY AM 6x1', display_order = 51 WHERE lottery_id = 58;
UPDATE lotteries SET is_active = 1, lottery_name = 'NY PM 6x1', display_order = 52 WHERE lottery_id = 67;
UPDATE lotteries SET is_active = 1, lottery_name = 'FL AM 6X1', display_order = 53 WHERE lottery_id = 59;
UPDATE lotteries SET is_active = 1, lottery_name = 'FL PM 6X1', display_order = 54 WHERE lottery_id = 68;
UPDATE lotteries SET is_active = 1, lottery_name = 'King Lottery AM', display_order = 55 WHERE lottery_id = 8;
UPDATE lotteries SET is_active = 1, lottery_name = 'King Lottery PM', display_order = 56 WHERE lottery_id = 69;
UPDATE lotteries SET is_active = 1, lottery_name = 'L.E. PUERTO RICO 2PM', display_order = 57 WHERE lottery_id = 54;
UPDATE lotteries SET is_active = 1, lottery_name = 'L.E. PUERTO RICO 10PM', display_order = 58 WHERE lottery_id = 60;
UPDATE lotteries SET is_active = 1, lottery_name = 'DELAWARE AM', display_order = 59 WHERE lottery_id = 34;
UPDATE lotteries SET is_active = 1, lottery_name = 'DELAWARE PM', display_order = 60 WHERE lottery_id = 11;
UPDATE lotteries SET is_active = 1, lottery_name = 'Anguila 1pm', display_order = 61 WHERE lottery_id = 42;
UPDATE lotteries SET is_active = 1, lottery_name = 'Anguila 6PM', display_order = 62 WHERE lottery_id = 28;
UPDATE lotteries SET is_active = 1, lottery_name = 'Anguila 9pm', display_order = 63 WHERE lottery_id = 36;
UPDATE lotteries SET is_active = 1, lottery_name = 'Anguila 10am', display_order = 64 WHERE lottery_id = 41;
UPDATE lotteries SET is_active = 1, lottery_name = 'LA CHICA', display_order = 65 WHERE lottery_id = 56;
UPDATE lotteries SET is_active = 1, lottery_name = 'LA PRIMERA 8PM', display_order = 66 WHERE lottery_id = 62;
UPDATE lotteries SET is_active = 1, lottery_name = 'PANAMA MIERCOLES', display_order = 67 WHERE lottery_id = 53;
UPDATE lotteries SET is_active = 1, lottery_name = 'PANAMA DOMINGO', display_order = 68 WHERE lottery_id = 55;
UPDATE lotteries SET is_active = 1, lottery_name = 'LA SUERTE 6:00pm', display_order = 69 WHERE lottery_id = 63;

PRINT '✓ Todas las 69 loterías renombradas y reordenadas';
GO

-- Verificar resultados
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
