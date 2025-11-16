USE [lottery-db];
GO

-- =============================================
-- Script para configurar EXACTAMENTE las 69 loterías especificadas
-- en el orden exacto solicitado
-- =============================================

PRINT '================================================================================';
PRINT 'CONFIGURANDO LAS 69 LOTERÍAS EXACTAS';
PRINT '================================================================================';
PRINT '';

-- Primero, desactivar TODAS las loterías
UPDATE lotteries SET is_active = 0, display_order = NULL;
PRINT '✓ Todas las loterías desactivadas';
GO

-- Ahora activar y ordenar las 69 loterías específicas

-- 1. LA PRIMERA
UPDATE lotteries SET is_active = 1, display_order = 1, lottery_name = 'LA PRIMERA'
WHERE lottery_name IN ('La Primera', 'LA PRIMERA');

-- 2. NEW YORK DAY
UPDATE lotteries SET is_active = 1, display_order = 2, lottery_name = 'NEW YORK DAY'
WHERE lottery_name IN ('New York Pick 4', 'NEW YORK DAY');

-- 3. NEW YORK NIGHT
UPDATE lotteries SET is_active = 1, display_order = 3, lottery_name = 'NEW YORK NIGHT'
WHERE lottery_name IN ('New York Pick 3', 'NEW YORK NIGHT');

-- 4. FLORIDA AM
UPDATE lotteries SET is_active = 1, display_order = 4, lottery_name = 'FLORIDA AM'
WHERE lottery_name IN ('Florida Pick 4', 'FLORIDA AM');

-- 5. FLORIDA PM
UPDATE lotteries SET is_active = 1, display_order = 5, lottery_name = 'FLORIDA PM'
WHERE lottery_name IN ('Florida Pick 3', 'FLORIDA PM');

-- 6. GANA MAS
UPDATE lotteries SET is_active = 1, display_order = 6, lottery_name = 'GANA MAS'
WHERE lottery_name IN ('Gana Mas', 'GANA MAS');

-- 7. NACIONAL
UPDATE lotteries SET is_active = 1, display_order = 7, lottery_name = 'NACIONAL'
WHERE lottery_name IN ('Nacional', 'NACIONAL');

-- 8. QUINIELA PALE
UPDATE lotteries SET is_active = 1, display_order = 8, lottery_name = 'QUINIELA PALE'
WHERE lottery_name IN ('Quiniela Pale', 'QUINIELA PALE');

-- 9. REAL
UPDATE lotteries SET is_active = 1, display_order = 9, lottery_name = 'REAL'
WHERE lottery_name IN ('La Real', 'Loto Real', 'REAL') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('La Real', 'Loto Real', 'REAL')
);

-- 10. LOTEKA
UPDATE lotteries SET is_active = 1, display_order = 10, lottery_name = 'LOTEKA'
WHERE lottery_name IN ('LOTEKA', 'Loteka');

-- 11. FL PICK2 AM
UPDATE lotteries SET is_active = 1, display_order = 11, lottery_name = 'FL PICK2 AM'
WHERE lottery_name IN ('Florida Pick 2', 'FL PICK2 AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Florida Pick 2', 'FL PICK2 AM')
);

-- 12. FL PICK2 PM - Necesita nueva entrada o usar la existente
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'FL PICK2 PM', 'Pick 2', 1, 12
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'FL PICK2 PM');

UPDATE lotteries SET is_active = 1, display_order = 12
WHERE lottery_name = 'FL PICK2 PM';

-- 13. GEORGIA-MID AM
UPDATE lotteries SET is_active = 1, display_order = 13, lottery_name = 'GEORGIA-MID AM'
WHERE lottery_name IN ('Georgia Pick 4', 'GEORGIA-MID AM');

-- 14. GEORGIA EVENING
UPDATE lotteries SET is_active = 1, display_order = 14, lottery_name = 'GEORGIA EVENING'
WHERE lottery_name IN ('Georgia Pick 3', 'GEORGIA EVENING');

-- 15. GEORGIA NIGHT - Nueva entrada
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'GEORGIA NIGHT', 'Pick 3', 1, 15
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'GEORGIA NIGHT');

UPDATE lotteries SET is_active = 1, display_order = 15
WHERE lottery_name = 'GEORGIA NIGHT';

-- 16. NEW JERSEY AM
UPDATE lotteries SET is_active = 1, display_order = 16, lottery_name = 'NEW JERSEY AM'
WHERE lottery_name IN ('New Jersey Pick 3', 'NEW JERSEY AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('New Jersey Pick 3', 'NEW JERSEY AM')
);

-- 17. NEW JERSEY PM - Nueva entrada
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'NEW JERSEY PM', 'Pick 3', 1, 17
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'NEW JERSEY PM');

UPDATE lotteries SET is_active = 1, display_order = 17
WHERE lottery_name = 'NEW JERSEY PM';

-- 18. CONNECTICUT AM
UPDATE lotteries SET is_active = 1, display_order = 18, lottery_name = 'CONNECTICUT AM'
WHERE lottery_name IN ('Connecticut Pick 3', 'CONNECTICUT AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Connecticut Pick 3', 'CONNECTICUT AM')
);

-- 19. CONNECTICUT PM - Nueva entrada
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'CONNECTICUT PM', 'Pick 3', 1, 19
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'CONNECTICUT PM');

UPDATE lotteries SET is_active = 1, display_order = 19
WHERE lottery_name = 'CONNECTICUT PM';

-- 20. CALIFORNIA AM
UPDATE lotteries SET is_active = 1, display_order = 20, lottery_name = 'CALIFORNIA AM'
WHERE lottery_name IN ('California Pick 4', 'CALIFORNIA AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('California Pick 4', 'CALIFORNIA AM')
);

-- 21. CALIFORNIA PM - Nueva entrada
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'CALIFORNIA PM', 'Pick 4', 1, 21
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'CALIFORNIA PM');

UPDATE lotteries SET is_active = 1, display_order = 21
WHERE lottery_name = 'CALIFORNIA PM';

-- 22. CHICAGO AM
UPDATE lotteries SET is_active = 1, display_order = 22, lottery_name = 'CHICAGO AM'
WHERE lottery_name IN ('Chicago Pick 3', 'CHICAGO AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Chicago Pick 3', 'CHICAGO AM')
);

-- 23. CHICAGO PM - Nueva entrada
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'CHICAGO PM', 'Pick 3', 1, 23
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'CHICAGO PM');

UPDATE lotteries SET is_active = 1, display_order = 23
WHERE lottery_name = 'CHICAGO PM';

-- 24. PENN MIDDAY
UPDATE lotteries SET is_active = 1, display_order = 24, lottery_name = 'PENN MIDDAY'
WHERE lottery_name IN ('Pennsylvania Pick 3', 'PENN MIDDAY') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Pennsylvania Pick 3', 'PENN MIDDAY')
);

-- 25. PENN EVENING - Nueva entrada
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'PENN EVENING', 'Pick 3', 1, 25
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'PENN EVENING');

UPDATE lotteries SET is_active = 1, display_order = 25
WHERE lottery_name = 'PENN EVENING';

-- 26. INDIANA MIDDAY
UPDATE lotteries SET is_active = 1, display_order = 26, lottery_name = 'INDIANA MIDDAY'
WHERE lottery_name IN ('Indiana Pick 3', 'INDIANA MIDDAY') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Indiana Pick 3', 'INDIANA MIDDAY')
);

-- 27. INDIANA EVENING - Nueva entrada
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'INDIANA EVENING', 'Pick 3', 1, 27
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'INDIANA EVENING');

UPDATE lotteries SET is_active = 1, display_order = 27
WHERE lottery_name = 'INDIANA EVENING';

-- 28. DIARIA 11AM
UPDATE lotteries SET is_active = 1, display_order = 28, lottery_name = 'DIARIA 11AM'
WHERE lottery_name IN ('Diaria 11AM', 'DIARIA 11AM');

-- 29. DIARIA 3PM
UPDATE lotteries SET is_active = 1, display_order = 29, lottery_name = 'DIARIA 3PM'
WHERE lottery_name IN ('Diaria 3PM', 'DIARIA 3PM');

-- 30. DIARIA 9PM
UPDATE lotteries SET is_active = 1, display_order = 30, lottery_name = 'DIARIA 9PM'
WHERE lottery_name IN ('Diaria 9PM', 'DIARIA 9PM');

-- 31. SUPER PALE TARDE
UPDATE lotteries SET is_active = 1, display_order = 31, lottery_name = 'SUPER PALE TARDE'
WHERE lottery_name IN ('Super Pale', 'SUPER PALE TARDE') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Super Pale', 'SUPER PALE TARDE')
);

-- 32-34. SUPER PALE variantes - Nuevas entradas
INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'SUPER PALE NOCHE', 'Pale', 1, 32
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'SUPER PALE NOCHE');

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'SUPER PALE NY-FL AM', 'Pale', 1, 33
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'SUPER PALE NY-FL AM');

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'SUPER PALE NY-FL PM', 'Pale', 1, 34
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'SUPER PALE NY-FL PM');

UPDATE lotteries SET is_active = 1, display_order = 32 WHERE lottery_name = 'SUPER PALE NOCHE';
UPDATE lotteries SET is_active = 1, display_order = 33 WHERE lottery_name = 'SUPER PALE NY-FL AM';
UPDATE lotteries SET is_active = 1, display_order = 34 WHERE lottery_name = 'SUPER PALE NY-FL PM';

-- 35-38. TEXAS variantes
UPDATE lotteries SET is_active = 1, display_order = 35, lottery_name = 'TEXAS MORNING'
WHERE lottery_name IN ('Texas Pick 4', 'TEXAS MORNING') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Texas Pick 4', 'TEXAS MORNING')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'TEXAS DAY', 'Pick 4', 1, 36
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'TEXAS DAY');

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'TEXAS EVENING', 'Pick 4', 1, 37
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'TEXAS EVENING');

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'TEXAS NIGHT', 'Pick 4', 1, 38
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'TEXAS NIGHT');

UPDATE lotteries SET is_active = 1, display_order = 36 WHERE lottery_name = 'TEXAS DAY';
UPDATE lotteries SET is_active = 1, display_order = 37 WHERE lottery_name = 'TEXAS EVENING';
UPDATE lotteries SET is_active = 1, display_order = 38 WHERE lottery_name = 'TEXAS NIGHT';

-- 39-40. VIRGINIA variantes
UPDATE lotteries SET is_active = 1, display_order = 39, lottery_name = 'VIRGINIA AM'
WHERE lottery_name IN ('Virginia Pick 3', 'VIRGINIA AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Virginia Pick 3', 'VIRGINIA AM')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'VIRGINIA PM', 'Pick 3', 1, 40
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'VIRGINIA PM');

UPDATE lotteries SET is_active = 1, display_order = 40 WHERE lottery_name = 'VIRGINIA PM';

-- 41-42. SOUTH CAROLINA variantes
UPDATE lotteries SET is_active = 1, display_order = 41, lottery_name = 'SOUTH CAROLINA AM'
WHERE lottery_name IN ('South Carolina Pick 3', 'SOUTH CAROLINA AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('South Carolina Pick 3', 'SOUTH CAROLINA AM')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'SOUTH CAROLINA PM', 'Pick 3', 1, 42
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'SOUTH CAROLINA PM');

UPDATE lotteries SET is_active = 1, display_order = 42 WHERE lottery_name = 'SOUTH CAROLINA PM';

-- 43-44. MARYLAND variantes
UPDATE lotteries SET is_active = 1, display_order = 43, lottery_name = 'MARYLAND MIDDAY'
WHERE lottery_name IN ('Maryland Pick 3', 'MARYLAND MIDDAY') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Maryland Pick 3', 'MARYLAND MIDDAY')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'MARYLAND EVENING', 'Pick 3', 1, 44
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'MARYLAND EVENING');

UPDATE lotteries SET is_active = 1, display_order = 44 WHERE lottery_name = 'MARYLAND EVENING';

-- 45-46. MASS variantes
UPDATE lotteries SET is_active = 1, display_order = 45, lottery_name = 'MASS AM'
WHERE lottery_name IN ('Massachusetts Pick 3', 'MASS AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Massachusetts Pick 3', 'MASS AM')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'MASS PM', 'Pick 3', 1, 46
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'MASS PM');

UPDATE lotteries SET is_active = 1, display_order = 46 WHERE lottery_name = 'MASS PM';

-- 47. LA SUERTE
UPDATE lotteries SET is_active = 1, display_order = 47, lottery_name = 'LA SUERTE'
WHERE lottery_name IN ('La Suerte', 'LA SUERTE') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('La Suerte', 'LA SUERTE')
);

-- 48-49. NORTH CAROLINA variantes
UPDATE lotteries SET is_active = 1, display_order = 48, lottery_name = 'NORTH CAROLINA AM'
WHERE lottery_name IN ('North Carolina Pick 3', 'NORTH CAROLINA AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('North Carolina Pick 3', 'NORTH CAROLINA AM')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'NORTH CAROLINA PM', 'Pick 3', 1, 49
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'NORTH CAROLINA PM');

UPDATE lotteries SET is_active = 1, display_order = 49 WHERE lottery_name = 'NORTH CAROLINA PM';

-- 50. LOTEDOM
UPDATE lotteries SET is_active = 1, display_order = 50, lottery_name = 'LOTEDOM'
WHERE lottery_name IN ('Lotedom', 'LOTEDOM');

-- 51-52. NY 6x1 variantes
UPDATE lotteries SET is_active = 1, display_order = 51, lottery_name = 'NY AM 6x1'
WHERE lottery_name IN ('NY AM 6x1', 'NY AM 6X1');

UPDATE lotteries SET is_active = 1, display_order = 52, lottery_name = 'NY PM 6x1'
WHERE lottery_name IN ('NY PM 6x1', 'NY PM 6X1');

-- 53-54. FL 6X1 variantes
UPDATE lotteries SET is_active = 1, display_order = 53, lottery_name = 'FL AM 6X1'
WHERE lottery_name IN ('FL AM 6x1', 'FL AM 6X1');

UPDATE lotteries SET is_active = 1, display_order = 54, lottery_name = 'FL PM 6X1'
WHERE lottery_name IN ('FL PM 6x1', 'FL PM 6X1');

-- 55-56. King Lottery variantes
UPDATE lotteries SET is_active = 1, display_order = 55, lottery_name = 'King Lottery AM'
WHERE lottery_name IN ('King Lottery', 'King Lottery AM');

UPDATE lotteries SET is_active = 1, display_order = 56, lottery_name = 'King Lottery PM'
WHERE lottery_name IN ('King Lottery PM');

-- 57-58. L.E. PUERTO RICO variantes
UPDATE lotteries SET is_active = 1, display_order = 57, lottery_name = 'L.E. PUERTO RICO 2PM'
WHERE lottery_name IN ('L.E. Puerto Rico', 'L.E. PUERTO RICO 2PM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('L.E. Puerto Rico', 'L.E. PUERTO RICO 2PM')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'L.E. PUERTO RICO 10PM', 'Lottery', 1, 58
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'L.E. PUERTO RICO 10PM');

UPDATE lotteries SET is_active = 1, display_order = 58 WHERE lottery_name = 'L.E. PUERTO RICO 10PM';

-- 59-60. DELAWARE variantes
UPDATE lotteries SET is_active = 1, display_order = 59, lottery_name = 'DELAWARE AM'
WHERE lottery_name IN ('Delaware Pick 3', 'DELAWARE AM') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Delaware Pick 3', 'DELAWARE AM')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'DELAWARE PM', 'Pick 3', 1, 60
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'DELAWARE PM');

UPDATE lotteries SET is_active = 1, display_order = 60 WHERE lottery_name = 'DELAWARE PM';

-- 61-64. Anguila variantes
UPDATE lotteries SET is_active = 1, display_order = 61, lottery_name = 'Anguila 1pm'
WHERE lottery_name IN ('Anguila', 'Anguila 1pm') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Anguila', 'Anguila 1pm')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'Anguila 6PM', 'Lottery', 1, 62
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'Anguila 6PM');

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'Anguila 9pm', 'Lottery', 1, 63
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'Anguila 9pm');

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'Anguila 10am', 'Lottery', 1, 64
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'Anguila 10am');

UPDATE lotteries SET is_active = 1, display_order = 62 WHERE lottery_name = 'Anguila 6PM';
UPDATE lotteries SET is_active = 1, display_order = 63 WHERE lottery_name = 'Anguila 9pm';
UPDATE lotteries SET is_active = 1, display_order = 64 WHERE lottery_name = 'Anguila 10am';

-- 65. LA CHICA
UPDATE lotteries SET is_active = 1, display_order = 65, lottery_name = 'LA CHICA'
WHERE lottery_name IN ('La Chica', 'LA CHICA');

-- 66. LA PRIMERA 8PM
UPDATE lotteries SET is_active = 1, display_order = 66, lottery_name = 'LA PRIMERA 8PM'
WHERE lottery_name IN ('La Primera 8PM', 'LA PRIMERA 8PM');

-- 67-68. PANAMA variantes
UPDATE lotteries SET is_active = 1, display_order = 67, lottery_name = 'PANAMA MIERCOLES'
WHERE lottery_name IN ('Panama Lottery', 'PANAMA MIERCOLES') AND lottery_id = (
    SELECT MIN(lottery_id) FROM lotteries WHERE lottery_name IN ('Panama Lottery', 'PANAMA MIERCOLES')
);

INSERT INTO lotteries (lottery_name, lottery_type, is_active, display_order)
SELECT 'PANAMA DOMINGO', 'Lottery', 1, 68
WHERE NOT EXISTS (SELECT 1 FROM lotteries WHERE lottery_name = 'PANAMA DOMINGO');

UPDATE lotteries SET is_active = 1, display_order = 68 WHERE lottery_name = 'PANAMA DOMINGO';

-- 69. LA SUERTE 6:00pm
UPDATE lotteries SET is_active = 1, display_order = 69, lottery_name = 'LA SUERTE 6:00pm'
WHERE lottery_name IN ('La Suerte 6:00PM', 'LA SUERTE 6:00pm');

GO

PRINT '';
PRINT '✓ Script completado';
PRINT '';

-- Verificar resultados
DECLARE @ActiveCount INT;
SELECT @ActiveCount = COUNT(*) FROM lotteries WHERE is_active = 1;

PRINT '================================================================================';
PRINT 'Total de loterías activas: ' + CAST(@ActiveCount AS VARCHAR);
PRINT '================================================================================';

GO
