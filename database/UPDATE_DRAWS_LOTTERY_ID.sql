-- ============================================
-- UPDATE DRAWS WITH LOTTERY_ID
-- ============================================
-- Basado en las relaciones de lottery-db-dev
-- ============================================
USE [lottery-db];
GO

SET NOCOUNT ON;

PRINT 'Actualizando lottery_id en tabla draws...';
PRINT '';

-- República Dominicana
UPDATE draws SET lottery_id = 1 WHERE draw_name LIKE '%NACIONAL%'; -- Lotería Nacional Dominicana
UPDATE draws SET lottery_id = 2 WHERE draw_name LIKE '%LOTEKA%'; -- Loteka
UPDATE draws SET lottery_id = 3 WHERE draw_name LIKE '%QUINIELA PALE%'; -- Quiniela Pale
UPDATE draws SET lottery_id = 4 WHERE draw_name LIKE '%GANA MAS%' OR draw_name LIKE '%GANA M_S%'; -- Gana Más
UPDATE draws SET lottery_id = 5 WHERE draw_name LIKE '%LA PRIMERA%'; -- La Primera
UPDATE draws SET lottery_id = 6 WHERE draw_name LIKE '%LA SUERTE%'; -- La Suerte
UPDATE draws SET lottery_id = 7 WHERE draw_name LIKE '%LOTEDOM%'; -- Lotedom
UPDATE draws SET lottery_id = 8 WHERE draw_name LIKE '%SUPER PALE%'; -- Super Pale
UPDATE draws SET lottery_id = 9 WHERE draw_name LIKE '%LA CHICA%'; -- La Chica
UPDATE draws SET lottery_id = 31 WHERE draw_name LIKE '%REAL%' OR draw_id = 167; -- Loto Real

-- Estados Unidos
UPDATE draws SET lottery_id = 10 WHERE draw_name LIKE '%NEW YORK%' OR draw_name LIKE '%NY%'; -- New York Lottery
UPDATE draws SET lottery_id = 11 WHERE draw_name LIKE '%FLORIDA%' OR draw_name LIKE '%FL%'; -- Florida Lottery
UPDATE draws SET lottery_id = 12 WHERE draw_name LIKE '%GEORGIA%'; -- Georgia Lottery
UPDATE draws SET lottery_id = 13 WHERE draw_name LIKE '%NEW JERSEY%'; -- New Jersey Lottery
UPDATE draws SET lottery_id = 14 WHERE draw_name LIKE '%CONNECTICUT%'; -- Connecticut Lottery
UPDATE draws SET lottery_id = 15 WHERE draw_name LIKE '%CALIFORNIA%' AND draw_name NOT LIKE '%FL%' AND draw_name NOT LIKE '%NY%'; -- California Lottery
UPDATE draws SET lottery_id = 16 WHERE draw_name LIKE '%CHICAGO%' OR draw_name LIKE '%ILLINOIS%'; -- Illinois Lottery
UPDATE draws SET lottery_id = 17 WHERE draw_name LIKE '%PENN%' OR draw_name LIKE '%PENNSYLVANIA%'; -- Pennsylvania Lottery
UPDATE draws SET lottery_id = 18 WHERE draw_name LIKE '%INDIANA%'; -- Indiana Lottery
UPDATE draws SET lottery_id = 19 WHERE draw_name LIKE '%TEXAS%'; -- Texas Lottery
UPDATE draws SET lottery_id = 20 WHERE draw_name LIKE '%VIRGINIA%'; -- Virginia Lottery
UPDATE draws SET lottery_id = 21 WHERE draw_name LIKE '%SOUTH CAROLINA%'; -- South Carolina Lottery
UPDATE draws SET lottery_id = 22 WHERE draw_name LIKE '%MARYLAND%'; -- Maryland Lottery
UPDATE draws SET lottery_id = 23 WHERE draw_name LIKE '%MASS%' OR draw_name LIKE '%MASSACHUSETTS%'; -- Massachusetts Lottery
UPDATE draws SET lottery_id = 24 WHERE draw_name LIKE '%NORTH CAROLINA%'; -- North Carolina Lottery
UPDATE draws SET lottery_id = 25 WHERE draw_name LIKE '%DELAWARE%'; -- Delaware Lottery

-- Otros países
UPDATE draws SET lottery_id = 26 WHERE draw_name LIKE '%PUERTO RICO%' OR draw_name LIKE '%L.E.%'; -- Lotería Electrónica de Puerto Rico
UPDATE draws SET lottery_id = 27 WHERE draw_name LIKE '%PANAMA%'; -- Lotería Nacional de Panamá
UPDATE draws SET lottery_id = 28 WHERE draw_name LIKE '%King Lottery%'; -- King Lottery (Sint Maarten)
UPDATE draws SET lottery_id = 29 WHERE draw_name LIKE '%Anguila%' OR draw_name LIKE '%ANGUILLA%'; -- Anguilla Lottery
UPDATE draws SET lottery_id = 30 WHERE draw_name LIKE '%DIARIA%'; -- La Diaria (Nicaragua)

PRINT '';
PRINT 'Resumen de actualización:';
SELECT
    l.lottery_id,
    l.lottery_name,
    COUNT(d.draw_id) AS total_draws
FROM lotteries l
LEFT JOIN draws d ON l.lottery_id = d.lottery_id
GROUP BY l.lottery_id, l.lottery_name
ORDER BY l.lottery_id;

PRINT '';
PRINT 'Draws sin lottery_id asignado:';
SELECT draw_id, draw_name, abbreviation
FROM draws
WHERE lottery_id IS NULL
ORDER BY draw_id;

GO
