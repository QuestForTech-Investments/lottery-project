USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'ADDING MISSING BET TYPES AND PRIZE FIELDS';
PRINT '================================================================================';
PRINT '';

DECLARE @now DATETIME2 = SYSDATETIME();

-- STEP 1: Add missing bet_types
PRINT 'STEP 1: Adding missing bet types...';
PRINT '';

-- Check if bet_types exist, if not insert them
-- BOLITA_1
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'BOLITA_1')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('BOLITA_1', 'Bolita 1', 'Apuesta tipo Bolita posición 1', 1, @now, @now);
    PRINT '  ✓ Added: BOLITA_1';
END

-- BOLITA_2
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'BOLITA_2')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('BOLITA_2', 'Bolita 2', 'Apuesta tipo Bolita posición 2', 1, @now, @now);
    PRINT '  ✓ Added: BOLITA_2';
END

-- SINGULACION_1
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'SINGULACION_1')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('SINGULACION_1', 'Singulación 1', 'Apuesta tipo Singulación posición 1', 1, @now, @now);
    PRINT '  ✓ Added: SINGULACION_1';
END

-- SINGULACION_2
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'SINGULACION_2')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('SINGULACION_2', 'Singulación 2', 'Apuesta tipo Singulación posición 2', 1, @now, @now);
    PRINT '  ✓ Added: SINGULACION_2';
END

-- SINGULACION_3
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'SINGULACION_3')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('SINGULACION_3', 'Singulación 3', 'Apuesta tipo Singulación posición 3', 1, @now, @now);
    PRINT '  ✓ Added: SINGULACION_3';
END

-- PICK5_STRAIGHT
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'PICK5_STRAIGHT')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('PICK5_STRAIGHT', 'Pick 5 Straight', 'Pick 5 en orden exacto', 1, @now, @now);
    PRINT '  ✓ Added: PICK5_STRAIGHT';
END

-- PICK5_BOX
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'PICK5_BOX')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('PICK5_BOX', 'Pick 5 Box', 'Pick 5 en cualquier orden', 1, @now, @now);
    PRINT '  ✓ Added: PICK5_BOX';
END

-- PICK_TWO (genérico)
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'PICK_TWO')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('PICK_TWO', 'Pick Two', 'Pick 2 genérico', 1, @now, @now);
    PRINT '  ✓ Added: PICK_TWO';
END

-- PANAMA
IF NOT EXISTS (SELECT 1 FROM bet_types WHERE bet_type_code = 'PANAMA')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, is_active, created_at, updated_at)
    VALUES ('PANAMA', 'Panamá', 'Lotería de Panamá', 1, @now, @now);
    PRINT '  ✓ Added: PANAMA';
END

PRINT '';
PRINT 'Bet types added successfully!';
PRINT '';

GO

-- STEP 2: Insert prize fields for the new bet types
PRINT 'STEP 2: Inserting prize fields for new bet types...';
PRINT '';

DECLARE @now DATETIME2 = SYSDATETIME();

-- Get bet_type_ids for the new types
DECLARE @bolita1_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'BOLITA_1');
DECLARE @bolita2_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'BOLITA_2');
DECLARE @singulacion1_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'SINGULACION_1');
DECLARE @singulacion2_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'SINGULACION_2');
DECLARE @singulacion3_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'SINGULACION_3');
DECLARE @pick5_straight_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'PICK5_STRAIGHT');
DECLARE @pick5_box_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'PICK5_BOX');
DECLARE @pick_two_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'PICK_TWO');
DECLARE @panama_id INT = (SELECT bet_type_id FROM bet_types WHERE bet_type_code = 'PANAMA');

-- BOLITA_1 (1 field)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@bolita1_id, 'BOLITA_1_PREMIO', 'Bolita 1 - Premio', 70, 0, 10000, 1, 1, @now, @now);

-- BOLITA_2 (1 field)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@bolita2_id, 'BOLITA_2_PREMIO', 'Bolita 2 - Premio', 70, 0, 10000, 1, 1, @now, @now);

-- SINGULACION_1 (1 field)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@singulacion1_id, 'SINGULACION_1_PREMIO', 'Singulación 1 - Premio', 70, 0, 10000, 1, 1, @now, @now);

-- SINGULACION_2 (1 field)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@singulacion2_id, 'SINGULACION_2_PREMIO', 'Singulación 2 - Premio', 70, 0, 10000, 1, 1, @now, @now);

-- SINGULACION_3 (1 field)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@singulacion3_id, 'SINGULACION_3_PREMIO', 'Singulación 3 - Premio', 70, 0, 10000, 1, 1, @now, @now);

-- PICK5_STRAIGHT (2 fields)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@pick5_straight_id, 'PICK5_STRAIGHT_PRIMER_PAGO', 'Pick 5 Straight - Primer Pago', 50000, 0, 1000000, 1, 1, @now, @now),
(@pick5_straight_id, 'PICK5_STRAIGHT_SEGUNDO_PAGO', 'Pick 5 Straight - Segundo Pago', 5000, 0, 1000000, 2, 1, @now, @now);

-- PICK5_BOX (6 fields)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@pick5_box_id, 'PICK5_BOX_PRIMER_PAGO', 'Pick 5 Box - Primer Pago', 2500, 0, 1000000, 1, 1, @now, @now),
(@pick5_box_id, 'PICK5_BOX_SEGUNDO_PAGO', 'Pick 5 Box - Segundo Pago', 1000, 0, 1000000, 2, 1, @now, @now),
(@pick5_box_id, 'PICK5_BOX_TERCER_PAGO', 'Pick 5 Box - Tercer Pago', 500, 0, 1000000, 3, 1, @now, @now),
(@pick5_box_id, 'PICK5_BOX_CUARTO_PAGO', 'Pick 5 Box - Cuarto Pago', 200, 0, 1000000, 4, 1, @now, @now),
(@pick5_box_id, 'PICK5_BOX_QUINTO_PAGO', 'Pick 5 Box - Quinto Pago', 100, 0, 1000000, 5, 1, @now, @now),
(@pick5_box_id, 'PICK5_BOX_SEXTO_PAGO', 'Pick 5 Box - Sexto Pago', 50, 0, 1000000, 6, 1, @now, @now);

-- PICK_TWO genérico (2 fields)
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@pick_two_id, 'PICK_TWO_PRIMER_PAGO', 'Pick Two - Primer Pago', 50, 0, 10000, 1, 1, @now, @now),
(@pick_two_id, 'PICK_TWO_SEGUNDO_PAGO', 'Pick Two - Segundo Pago', 80, 0, 10000, 2, 1, @now, @now);

-- PANAMA (12 fields) - valores en 0 según JSON
INSERT INTO prize_fields (bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active, created_at, updated_at)
VALUES
(@panama_id, 'PANAMA_4_NUMEROS_PRIMERA_RONDA', 'Panamá - 4 Números Primera Ronda', 0, 0, 100000, 1, 1, @now, @now),
(@panama_id, 'PANAMA_3_NUMEROS_PRIMERA_RONDA', 'Panamá - 3 Números Primera Ronda', 0, 0, 100000, 2, 1, @now, @now),
(@panama_id, 'PANAMA_ULTIMOS_2_NUMEROS_PRIMERA_RONDA', 'Panamá - Últimos 2 Números Primera Ronda', 0, 0, 100000, 3, 1, @now, @now),
(@panama_id, 'PANAMA_ULTIMO_NUMERO_PRIMERA_RONDA', 'Panamá - Último Número Primera Ronda', 0, 0, 100000, 4, 1, @now, @now),
(@panama_id, 'PANAMA_4_NUMEROS_SEGUNDA_RONDA', 'Panamá - 4 Números Segunda Ronda', 0, 0, 100000, 5, 1, @now, @now),
(@panama_id, 'PANAMA_3_NUMEROS_SEGUNDA_RONDA', 'Panamá - 3 Números Segunda Ronda', 0, 0, 100000, 6, 1, @now, @now),
(@panama_id, 'PANAMA_ULTIMOS_2_NUMEROS_SEGUNDA_RONDA', 'Panamá - Últimos 2 Números Segunda Ronda', 0, 0, 100000, 7, 1, @now, @now),
(@panama_id, 'PANAMA_ULTIMO_NUMERO_SEGUNDA_RONDA', 'Panamá - Último Número Segunda Ronda', 0, 0, 100000, 8, 1, @now, @now),
(@panama_id, 'PANAMA_4_NUMEROS_TERCERA_RONDA', 'Panamá - 4 Números Tercera Ronda', 0, 0, 100000, 9, 1, @now, @now),
(@panama_id, 'PANAMA_3_NUMEROS_TERCERA_RONDA', 'Panamá - 3 Números Tercera Ronda', 0, 0, 100000, 10, 1, @now, @now),
(@panama_id, 'PANAMA_ULTIMOS_2_NUMEROS_TERCERA_RONDA', 'Panamá - Últimos 2 Números Tercera Ronda', 0, 0, 100000, 11, 1, @now, @now),
(@panama_id, 'PANAMA_ULTIMO_NUMERO_TERCERA_RONDA', 'Panamá - Último Número Tercera Ronda', 0, 0, 100000, 12, 1, @now, @now);

PRINT '✓ Prize fields inserted for new bet types!';
PRINT '';

GO

-- STEP 3: Verify final results
PRINT '================================================================================';
PRINT 'VERIFICATION - FINAL RESULTS';
PRINT '================================================================================';
PRINT '';

-- Count total prize fields
DECLARE @TotalFields INT;
SELECT @TotalFields = COUNT(*) FROM prize_fields WHERE is_active = 1;

PRINT 'Total prize fields in database: ' + CAST(@TotalFields AS VARCHAR);
PRINT '';

-- Show breakdown by bet type
PRINT 'Prize fields by bet type:';
SELECT
    bt.bet_type_code,
    bt.bet_type_name,
    COUNT(*) AS field_count
FROM prize_fields pf
INNER JOIN bet_types bt ON pf.bet_type_id = bt.bet_type_id
WHERE pf.is_active = 1
GROUP BY bt.bet_type_code, bt.bet_type_name
ORDER BY bt.bet_type_code;

PRINT '';
PRINT '================================================================================';
PRINT '✓ ALL PRIZE FIELDS COMPLETED!';
PRINT '================================================================================';
PRINT '';
PRINT 'Summary:';
PRINT '  - New bet types added: 9';
PRINT '  - New prize fields added: 27';
PRINT '  - Total prize fields: ' + CAST(@TotalFields AS VARCHAR) + ' (should be 64)';
PRINT '';

GO
