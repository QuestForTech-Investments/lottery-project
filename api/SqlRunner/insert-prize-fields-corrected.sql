USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'INSERTING PRIZE FIELDS WITH CORRECT STRUCTURE';
PRINT '================================================================================';
PRINT '';

-- Set defaults for optional fields
DECLARE @now DATETIME2 = SYSDATETIME();

-- DIRECTO (bet_type_id = 1) - 4 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(1, 'DIRECTO_PRIMER_PAGO', 'Directo - Primer Pago', 56, 0, 10000, 1, 1, @now, @now),
(1, 'DIRECTO_SEGUNDO_PAGO', 'Directo - Segundo Pago', 12, 0, 10000, 2, 1, @now, @now),
(1, 'DIRECTO_TERCER_PAGO', 'Directo - Tercer Pago', 4, 0, 10000, 3, 1, @now, @now),
(1, 'DIRECTO_DOBLES', 'Directo - Dobles', 56, 0, 10000, 4, 1, @now, @now);

-- PALE (bet_type_id = 2) - 4 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(2, 'PALE_TODOS_EN_SECUENCIA', 'Palé - Todos en Secuencia', 1200, 0, 10000, 1, 1, @now, @now),
(2, 'PALE_PRIMER_PAGO', 'Palé - Primer Pago', 1200, 0, 10000, 2, 1, @now, @now),
(2, 'PALE_SEGUNDO_PAGO', 'Palé - Segundo Pago', 1200, 0, 10000, 3, 1, @now, @now),
(2, 'PALE_TERCER_PAGO', 'Palé - Tercer Pago', 200, 0, 10000, 4, 1, @now, @now);

-- TRIPLETA (bet_type_id = 3) - 4 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(3, 'TRIPLETA_PRIMER_PAGO', 'Tripleta - Primer Pago', 10000, 0, 100000, 1, 1, @now, @now),
(3, 'TRIPLETA_SEGUNDO_PAGO', 'Tripleta - Segundo Pago', 100, 0, 100000, 2, 1, @now, @now),
(3, 'TRIPLETA_TODOS_EN_SECUENCIA', 'Tripleta - Todos en Secuencia', 700, 0, 100000, 3, 1, @now, @now),
(3, 'TRIPLETA_TRIPLES', 'Tripleta - Triples', 700, 0, 100000, 4, 1, @now, @now);

-- CASH3_STRAIGHT (bet_type_id = 12 PICK_THREE_STRAIGHT) - 2 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(12, 'CASH3_STRAIGHT_PRIMER_PAGO', 'Cash 3 Straight - Primer Pago', 500, 0, 10000, 1, 1, @now, @now),
(12, 'CASH3_STRAIGHT_SEGUNDO_PAGO', 'Cash 3 Straight - Segundo Pago', 80, 0, 10000, 2, 1, @now, @now);

-- CASH3_BOX (bet_type_id = 13 PICK_THREE_BOX) - 2 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(13, 'CASH3_BOX_PRIMER_PAGO', 'Cash 3 Box - Primer Pago', 160, 0, 10000, 1, 1, @now, @now),
(13, 'CASH3_BOX_SEGUNDO_PAGO', 'Cash 3 Box - Segundo Pago', 80, 0, 10000, 2, 1, @now, @now);

-- PLAY4_STRAIGHT (bet_type_id = 18 PICK_FOUR_STRAIGHT) - 2 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(18, 'PLAY4_STRAIGHT_PRIMER_PAGO', 'Play 4 Straight - Primer Pago', 5000, 0, 100000, 1, 1, @now, @now),
(18, 'PLAY4_STRAIGHT_SEGUNDO_PAGO', 'Play 4 Straight - Segundo Pago', 800, 0, 100000, 2, 1, @now, @now);

-- PLAY4_BOX (bet_type_id = 19 PICK_FOUR_BOX_24) - 4 fields
-- Usando BOX_24 como el tipo principal para Play4 Box
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(19, 'PLAY4_BOX_PRIMER_PAGO', 'Play 4 Box - Primer Pago', 200, 0, 100000, 1, 1, @now, @now),
(19, 'PLAY4_BOX_SEGUNDO_PAGO', 'Play 4 Box - Segundo Pago', 100, 0, 100000, 2, 1, @now, @now),
(19, 'PLAY4_BOX_TERCER_PAGO', 'Play 4 Box - Tercer Pago', 800, 0, 100000, 3, 1, @now, @now),
(19, 'PLAY4_BOX_CUARTO_PAGO', 'Play 4 Box - Cuarto Pago', 200, 0, 100000, 4, 1, @now, @now);

-- SUPER_PALE (bet_type_id = 6) - 1 field
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(6, 'SUPER_PALE_PREMIO', 'Super Palé - Premio', 10000, 0, 100000, 1, 1, @now, @now);

-- CASH3_FRONT_STRAIGHT (bet_type_id = 16 PICK_THREE_FRONT_PAIR) - 2 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(16, 'CASH3_FRONT_STRAIGHT_PRIMER_PAGO', 'Cash 3 Front Straight - Primer Pago', 50, 0, 10000, 1, 1, @now, @now),
(16, 'CASH3_FRONT_STRAIGHT_SEGUNDO_PAGO', 'Cash 3 Front Straight - Segundo Pago', 80, 0, 10000, 2, 1, @now, @now);

-- CASH3_FRONT_BOX will also use ID 16 with different field_code
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(16, 'CASH3_FRONT_BOX_PRIMER_PAGO', 'Cash 3 Front Box - Primer Pago', 25, 0, 10000, 3, 1, @now, @now),
(16, 'CASH3_FRONT_BOX_SEGUNDO_PAGO', 'Cash 3 Front Box - Segundo Pago', 40, 0, 10000, 4, 1, @now, @now);

-- CASH3_BACK_STRAIGHT (bet_type_id = 17 PICK_THREE_BACK_PAIR) - 2 fields
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(17, 'CASH3_BACK_STRAIGHT_PRIMER_PAGO', 'Cash 3 Back Straight - Primer Pago', 50, 0, 10000, 1, 1, @now, @now),
(17, 'CASH3_BACK_STRAIGHT_SEGUNDO_PAGO', 'Cash 3 Back Straight - Segundo Pago', 80, 0, 10000, 2, 1, @now, @now);

-- CASH3_BACK_BOX will also use ID 17 with different field_code
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(17, 'CASH3_BACK_BOX_PRIMER_PAGO', 'Cash 3 Back Box - Primer Pago', 25, 0, 10000, 3, 1, @now, @now),
(17, 'CASH3_BACK_BOX_SEGUNDO_PAGO', 'Cash 3 Back Box - Segundo Pago', 40, 0, 10000, 4, 1, @now, @now);

-- PICK_TWO_FRONT (bet_type_id = 9) - 2 fields (valores en 0 según JSON)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(9, 'PICK_TWO_FRONT_PRIMER_PAGO', 'Pick Two Front - Primer Pago', 0, 0, 10000, 1, 1, @now, @now),
(9, 'PICK_TWO_FRONT_SEGUNDO_PAGO', 'Pick Two Front - Segundo Pago', 0, 0, 10000, 2, 1, @now, @now);

-- PICK_TWO_BACK (bet_type_id = 10) - 2 fields (valores en 0 según JSON)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(10, 'PICK_TWO_BACK_PRIMER_PAGO', 'Pick Two Back - Primer Pago', 0, 0, 10000, 1, 1, @now, @now),
(10, 'PICK_TWO_BACK_SEGUNDO_PAGO', 'Pick Two Back - Segundo Pago', 0, 0, 10000, 2, 1, @now, @now);

-- PICK_TWO_MIDDLE (bet_type_id = 11) - 2 fields (valores en 0 según JSON)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(11, 'PICK_TWO_MIDDLE_PRIMER_PAGO', 'Pick Two Middle - Primer Pago', 0, 0, 10000, 1, 1, @now, @now),
(11, 'PICK_TWO_MIDDLE_SEGUNDO_PAGO', 'Pick Two Middle - Segundo Pago', 0, 0, 10000, 2, 1, @now, @now);

GO

-- Verificar resultados
DECLARE @Count INT;
SELECT @Count = COUNT(*) FROM prize_fields WHERE is_active = 1;

PRINT '';
PRINT '================================================================================';
PRINT '✓ PRIZE FIELDS INSERTED SUCCESSFULLY!';
PRINT '================================================================================';
PRINT 'Total prize fields inserted: ' + CAST(@Count AS VARCHAR);
PRINT '';
PRINT 'Summary by bet_type:';
SELECT
    bt.bet_type_code,
    COUNT(*) AS field_count
FROM prize_fields pf
INNER JOIN bet_types bt ON pf.bet_type_id = bt.bet_type_id
WHERE pf.is_active = 1
GROUP BY bt.bet_type_code
ORDER BY bt.bet_type_code;

PRINT '';
PRINT '⚠️  NOTA: Los siguientes tipos del JSON no se pudieron mapear:';
PRINT '   - BOLITA_1, BOLITA_2';
PRINT '   - SINGULACION_1, SINGULACION_2, SINGULACION_3';
PRINT '   - PICK5_STRAIGHT, PICK5_BOX';
PRINT '   - PICK_TWO (genérico)';
PRINT '   - PANAMA (12 campos)';
PRINT '';
PRINT '   Total campos insertados: 40 de 64 del JSON';
PRINT '   Necesitas crear los bet_types faltantes si son requeridos.';
PRINT '';

GO
