USE [lottery-db];
GO

-- =============================================
-- Script para actualizar loterías con orden de visualización
-- Solo mantendrá activas las 69 loterías especificadas
-- =============================================

-- Primero, verificar si existe la columna display_order
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('lotteries') AND name = 'display_order')
BEGIN
    ALTER TABLE lotteries ADD display_order INT NULL;
    PRINT '✓ Columna display_order agregada';
END
ELSE
BEGIN
    PRINT '✓ Columna display_order ya existe';
END
GO

-- Desactivar todas las loterías primero
UPDATE lotteries SET is_active = 0, display_order = NULL;
PRINT '✓ Todas las loterías desactivadas';
GO

-- Ahora activar y ordenar solo las 69 loterías especificadas
-- Mapeo basado en los nombres existentes en la base de datos

-- 1. LA PRIMERA
UPDATE lotteries SET is_active = 1, display_order = 1
WHERE lottery_name = 'La Primera';

-- 2. NEW YORK DAY
UPDATE lotteries SET is_active = 1, display_order = 2
WHERE lottery_name = 'New York Pick 4';

-- 3. NEW YORK NIGHT
UPDATE lotteries SET is_active = 1, display_order = 3
WHERE lottery_name = 'New York Pick 3';

-- 4. FLORIDA AM
UPDATE lotteries SET is_active = 1, display_order = 4
WHERE lottery_name = 'Florida Pick 4';

-- 5. FLORIDA PM
UPDATE lotteries SET is_active = 1, display_order = 5
WHERE lottery_name = 'Florida Pick 3';

-- 6. GANA MAS
UPDATE lotteries SET is_active = 1, display_order = 6
WHERE lottery_name = 'Gana Mas';

-- 7. NACIONAL
UPDATE lotteries SET is_active = 1, display_order = 7
WHERE lottery_name = 'Nacional';

-- 8. QUINIELA PALE
UPDATE lotteries SET is_active = 1, display_order = 8
WHERE lottery_name = 'Quiniela Pale';

-- 9. REAL (puede ser "La Real" o "Loto Real")
UPDATE lotteries SET is_active = 1, display_order = 9
WHERE lottery_name IN ('La Real', 'Loto Real');

-- 10. LOTEKA
UPDATE lotteries SET is_active = 1, display_order = 10
WHERE lottery_name = 'LOTEKA';

-- 11. FL PICK2 AM
UPDATE lotteries SET is_active = 1, display_order = 11
WHERE lottery_name = 'Florida Pick 2';

-- 13. GEORGIA-MID AM
UPDATE lotteries SET is_active = 1, display_order = 13
WHERE lottery_name = 'Georgia Pick 4';

-- 14. GEORGIA EVENING
UPDATE lotteries SET is_active = 1, display_order = 14
WHERE lottery_name = 'Georgia Pick 3';

-- 16. NEW JERSEY AM/PM
UPDATE lotteries SET is_active = 1, display_order = 16
WHERE lottery_name = 'New Jersey Pick 3';

-- 18. CONNECTICUT AM/PM
UPDATE lotteries SET is_active = 1, display_order = 18
WHERE lottery_name = 'Connecticut Pick 3';

-- 20. CALIFORNIA AM/PM
UPDATE lotteries SET is_active = 1, display_order = 20
WHERE lottery_name = 'California Pick 4';

-- 22. CHICAGO AM/PM
UPDATE lotteries SET is_active = 1, display_order = 22
WHERE lottery_name = 'Chicago Pick 3';

-- 24. PENN MIDDAY/EVENING
UPDATE lotteries SET is_active = 1, display_order = 24
WHERE lottery_name = 'Pennsylvania Pick 3';

-- 26. INDIANA MIDDAY/EVENING
UPDATE lotteries SET is_active = 1, display_order = 26
WHERE lottery_name = 'Indiana Pick 3';

-- 28. DIARIA 11AM
UPDATE lotteries SET is_active = 1, display_order = 28
WHERE lottery_name = 'Diaria 11AM';

-- 29. DIARIA 3PM
UPDATE lotteries SET is_active = 1, display_order = 29
WHERE lottery_name = 'Diaria 3PM';

-- 30. DIARIA 9PM
UPDATE lotteries SET is_active = 1, display_order = 30
WHERE lottery_name = 'Diaria 9PM';

-- 31. SUPER PALE TARDE/NOCHE/NY-FL AM/PM
UPDATE lotteries SET is_active = 1, display_order = 31
WHERE lottery_name = 'Super Pale';

-- 35. TEXAS MORNING/DAY/EVENING/NIGHT
UPDATE lotteries SET is_active = 1, display_order = 35
WHERE lottery_name = 'Texas Pick 4';

-- 39. VIRGINIA AM/PM
UPDATE lotteries SET is_active = 1, display_order = 39
WHERE lottery_name = 'Virginia Pick 3';

-- 41. SOUTH CAROLINA AM/PM
UPDATE lotteries SET is_active = 1, display_order = 41
WHERE lottery_name = 'South Carolina Pick 3';

-- 43. MARYLAND MIDDAY/EVENING
UPDATE lotteries SET is_active = 1, display_order = 43
WHERE lottery_name = 'Maryland Pick 3';

-- 45. MASS AM/PM
UPDATE lotteries SET is_active = 1, display_order = 45
WHERE lottery_name = 'Massachusetts Pick 3';

-- 47. LA SUERTE
UPDATE lotteries SET is_active = 1, display_order = 47
WHERE lottery_name = 'La Suerte';

-- 48. NORTH CAROLINA AM/PM
UPDATE lotteries SET is_active = 1, display_order = 48
WHERE lottery_name = 'North Carolina Pick 3';

-- 50. LOTEDOM
UPDATE lotteries SET is_active = 1, display_order = 50
WHERE lottery_name = 'Lotedom';

-- 51. NY AM 6x1
UPDATE lotteries SET is_active = 1, display_order = 51
WHERE lottery_name = 'NY AM 6x1';

-- 52. NY PM 6x1
UPDATE lotteries SET is_active = 1, display_order = 52
WHERE lottery_name = 'NY PM 6x1';

-- 53. FL AM 6X1
UPDATE lotteries SET is_active = 1, display_order = 53
WHERE lottery_name = 'FL AM 6x1';

-- 54. FL PM 6X1
UPDATE lotteries SET is_active = 1, display_order = 54
WHERE lottery_name = 'FL PM 6x1';

-- 55. King Lottery AM
UPDATE lotteries SET is_active = 1, display_order = 55
WHERE lottery_name = 'King Lottery';

-- 56. King Lottery PM
UPDATE lotteries SET is_active = 1, display_order = 56
WHERE lottery_name = 'King Lottery PM';

-- 57. L.E. PUERTO RICO 2PM/10PM
UPDATE lotteries SET is_active = 1, display_order = 57
WHERE lottery_name = 'L.E. Puerto Rico';

-- 59. DELAWARE AM/PM
UPDATE lotteries SET is_active = 1, display_order = 59
WHERE lottery_name = 'Delaware Pick 3';

-- 61. Anguila 1pm/6PM/9pm/10am
UPDATE lotteries SET is_active = 1, display_order = 61
WHERE lottery_name = 'Anguila';

-- 65. LA CHICA
UPDATE lotteries SET is_active = 1, display_order = 65
WHERE lottery_name = 'La Chica';

-- 66. LA PRIMERA 8PM
UPDATE lotteries SET is_active = 1, display_order = 66
WHERE lottery_name = 'La Primera 8PM';

-- 67. PANAMA MIERCOLES/DOMINGO
UPDATE lotteries SET is_active = 1, display_order = 67
WHERE lottery_name = 'Panama Lottery';

-- 69. LA SUERTE 6:00pm
UPDATE lotteries SET is_active = 1, display_order = 69
WHERE lottery_name = 'La Suerte 6:00PM';

-- Otras loterías de la lista original (Ohio, Illinois, etc.) si existen
UPDATE lotteries SET is_active = 1, display_order = 70
WHERE lottery_name = 'Ohio Pick 3';

UPDATE lotteries SET is_active = 1, display_order = 71
WHERE lottery_name = 'Illinois Pick 3';

UPDATE lotteries SET is_active = 1, display_order = 72
WHERE lottery_name = 'Mississippi Pick 3';

UPDATE lotteries SET is_active = 1, display_order = 73
WHERE lottery_name = 'Diaria';

GO

-- Mostrar resumen
PRINT '';
PRINT '================================================================================';
PRINT 'RESUMEN DE LOTERÍAS ACTUALIZADAS';
PRINT '================================================================================';

SELECT
    display_order AS 'Orden',
    lottery_id AS 'ID',
    lottery_name AS 'Nombre',
    is_active AS 'Activa'
FROM lotteries
WHERE is_active = 1
ORDER BY display_order, lottery_name;

DECLARE @ActiveCount INT;
SELECT @ActiveCount = COUNT(*) FROM lotteries WHERE is_active = 1;

PRINT '';
PRINT '================================================================================';
PRINT 'Total de loterías activas: ' + CAST(@ActiveCount AS VARCHAR);
PRINT '================================================================================';

GO
