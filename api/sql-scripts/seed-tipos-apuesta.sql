USE [lottery-db];
GO

-- =============================================
-- Seed data for tipos_apuesta (24 Bet Types)
-- Source: premio-fields-specification.json
-- =============================================

PRINT '================================================================================'
PRINT 'SEEDING TIPOS_APUESTA (24 BET TYPES)'
PRINT '================================================================================'
PRINT ''

-- Clear existing data if needed (development only)
-- DELETE FROM tipos_apuesta;
-- DBCC CHECKIDENT ('tipos_apuesta', RESEED, 0);

-- Insert 24 bet types
SET IDENTITY_INSERT tipos_apuesta ON;

INSERT INTO tipos_apuesta (tipo_apuesta_id, bet_type_code, bet_type_name, description, display_order, is_active)
VALUES
(1, 'DIRECTO', 'Directo', 'Straight bet on exact number in exact position', 1, 1),
(2, 'PALE', 'Palé', 'Two digits in any order', 2, 1),
(3, 'TRIPLETA', 'Tripleta', 'Three digits in any order', 3, 1),
(4, 'TERMINAL', 'Terminal', 'Last digit matches', 4, 1),
(5, 'QUINIELA_PALE', 'Quiniela Palé', 'Pale bet in quiniela format', 5, 1),
(6, 'SUPER_PALE', 'Super Palé', 'Enhanced pale bet with higher payout', 6, 1),
(7, 'PATA_CABALLO', 'Pata de Caballo', 'Special combination bet', 7, 1),
(8, 'CENTENA', 'Centena', 'Three digit bet', 8, 1),
(9, 'PICK_TWO_FRONT', 'Pick Two Front', 'First two digits exact order', 9, 1),
(10, 'PICK_TWO_BACK', 'Pick Two Back', 'Last two digits exact order', 10, 1),
(11, 'PICK_TWO_MIDDLE', 'Pick Two Middle', 'Middle two digits exact order', 11, 1),
(12, 'PICK_THREE_STRAIGHT', 'Pick Three Straight', 'Three digits in exact order', 12, 1),
(13, 'PICK_THREE_BOX', 'Pick Three Box', 'Three digits in any order', 13, 1),
(14, 'PICK_THREE_STRAIGHT_BOX', 'Pick Three Straight/Box', 'Combination of straight and box bet', 14, 1),
(15, 'PICK_THREE_COMBO', 'Pick Three Combo', 'Multiple straight bets covering all combinations', 15, 1),
(16, 'PICK_THREE_FRONT_PAIR', 'Pick Three Front Pair', 'First two digits match', 16, 1),
(17, 'PICK_THREE_BACK_PAIR', 'Pick Three Back Pair', 'Last two digits match', 17, 1),
(18, 'PICK_FOUR_STRAIGHT', 'Pick Four Straight', 'Four digits in exact order', 18, 1),
(19, 'PICK_FOUR_BOX_24', 'Pick Four Box (24-way)', 'Four different digits in any order', 19, 1),
(20, 'PICK_FOUR_BOX_12', 'Pick Four Box (12-way)', 'One pair of digits in any order', 20, 1),
(21, 'PICK_FOUR_BOX_6', 'Pick Four Box (6-way)', 'Two pairs of digits in any order', 21, 1),
(22, 'PICK_FOUR_BOX_4', 'Pick Four Box (4-way)', 'Three same digits in any order', 22, 1),
(23, 'PICK_FOUR_STRAIGHT_BOX', 'Pick Four Straight/Box', 'Combination straight and box bet for Pick 4', 23, 1),
(24, 'PICK_FOUR_COMBO', 'Pick Four Combo', 'All straight combinations for Pick 4', 24, 1);

SET IDENTITY_INSERT tipos_apuesta OFF;

PRINT '✓ 24 bet types inserted successfully'
GO

-- Verification
PRINT ''
PRINT '================================================================================'
PRINT 'VERIFICATION: ALL BET TYPES'
PRINT '================================================================================'
PRINT ''

DECLARE @TotalTypes INT;
SELECT @TotalTypes = COUNT(*) FROM tipos_apuesta WHERE is_active = 1;

PRINT 'Total active bet types: ' + CAST(@TotalTypes AS VARCHAR);
PRINT ''

SELECT
    tipo_apuesta_id AS ID,
    bet_type_code AS Code,
    bet_type_name AS Name,
    display_order AS [Order]
FROM tipos_apuesta
WHERE is_active = 1
ORDER BY display_order;

PRINT ''
PRINT '================================================================================'
PRINT 'BET TYPES SEEDED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Next Step: Run seed-campos-premio.sql to insert 62 prize fields'
PRINT '================================================================================'

GO

