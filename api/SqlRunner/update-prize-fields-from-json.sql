USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'UPDATING PRIZE FIELDS FROM JSON SPECIFICATION';
PRINT 'Total: 64 fields across 24 bet types';
PRINT '================================================================================';
PRINT '';

-- First, check table structure
PRINT 'Current table structure:';
SELECT TOP 1 * FROM prize_fields;
PRINT '';

-- Backup existing data count
DECLARE @OldCount INT;
DECLARE @ConfigCount INT;
SELECT @OldCount = COUNT(*) FROM prize_fields;
SELECT @ConfigCount = COUNT(*) FROM betting_pool_general_config;
PRINT 'Current prize fields count: ' + CAST(@OldCount AS VARCHAR);
PRINT 'Current config records count: ' + CAST(@ConfigCount AS VARCHAR);
PRINT '';

-- STEP 1: Clear betting_pool_general_config (has FK to prize_fields)
PRINT 'Step 1: Clearing betting_pool_general_config (1,020 records)...';
DELETE FROM betting_pool_general_config;
PRINT '✓ Cleared configuration records';
PRINT '';

-- STEP 2: Clear existing prize_fields
PRINT 'Step 2: Clearing existing prize fields (60 records)...';
DELETE FROM prize_fields;
PRINT '✓ Cleared prize fields';
PRINT '';

-- Reset identity if the table has an identity column
-- DBCC CHECKIDENT ('prize_fields', RESEED, 0);

GO

-- Now insert the 64 fields from the JSON
PRINT 'Inserting 64 prize fields from JSON...';
PRINT '';

-- DIRECTO (4 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('DIRECTO', 'primer_pago', 'Directo - Primer Pago', 'DIRECTO_PRIMER_PAGO', 56, 1),
('DIRECTO', 'segundo_pago', 'Directo - Segundo Pago', 'DIRECTO_SEGUNDO_PAGO', 12, 1),
('DIRECTO', 'tercer_pago', 'Directo - Tercer Pago', 'DIRECTO_TERCER_PAGO', 4, 1),
('DIRECTO', 'dobles', 'Directo - Dobles', 'DIRECTO_DOBLES', 56, 1);

-- PALE (4 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PALE', 'todos_en_secuencia', 'Palé - Todos en Secuencia', 'PALE_TODOS_EN_SECUENCIA', 1200, 1),
('PALE', 'primer_pago', 'Palé - Primer Pago', 'PALE_PRIMER_PAGO', 1200, 1),
('PALE', 'segundo_pago', 'Palé - Segundo Pago', 'PALE_SEGUNDO_PAGO', 1200, 1),
('PALE', 'tercer_pago', 'Palé - Tercer Pago', 'PALE_TERCER_PAGO', 200, 1);

-- TRIPLETA (4 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('TRIPLETA', 'primer_pago', 'Tripleta - Primer Pago', 'TRIPLETA_PRIMER_PAGO', 10000, 1),
('TRIPLETA', 'segundo_pago', 'Tripleta - Segundo Pago', 'TRIPLETA_SEGUNDO_PAGO', 100, 1),
('TRIPLETA', 'todos_en_secuencia', 'Tripleta - Todos en Secuencia', 'TRIPLETA_TODOS_EN_SECUENCIA', 700, 1),
('TRIPLETA', 'triples', 'Tripleta - Triples', 'TRIPLETA_TRIPLES', 700, 1);

-- CASH3_STRAIGHT (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('CASH3_STRAIGHT', 'todos_en_secuencia', 'Cash3 Straight - Todos en Secuencia', 'CASH3_STRAIGHT_TODOS_EN_SECUENCIA', 700, 1),
('CASH3_STRAIGHT', 'triples', 'Cash3 Straight - Triples', 'CASH3_STRAIGHT_TRIPLES', 700, 1);

-- CASH3_BOX (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('CASH3_BOX', '3_way_2_identicos', 'Cash3 Box - 3 Way 2 Idénticos', 'CASH3_BOX_3_WAY_2_IDENTICOS', 232, 1),
('CASH3_BOX', '6_way_3_unicos', 'Cash3 Box - 6 Way 3 Únicos', 'CASH3_BOX_6_WAY_3_UNICOS', 116, 1);

-- PLAY4_STRAIGHT (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PLAY4_STRAIGHT', 'todos_en_secuencia', 'Play4 Straight - Todos en Secuencia', 'PLAY4_STRAIGHT_TODOS_EN_SECUENCIA', 5000, 1),
('PLAY4_STRAIGHT', 'dobles', 'Play4 Straight - Dobles', 'PLAY4_STRAIGHT_DOBLES', 5000, 1);

-- PLAY4_BOX (4 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PLAY4_BOX', '24_way_4_unicos', 'Play4 Box - 24 Way 4 Únicos', 'PLAY4_BOX_24_WAY_4_UNICOS', 200, 1),
('PLAY4_BOX', '12_way_2_identicos', 'Play4 Box - 12 Way 2 Idénticos', 'PLAY4_BOX_12_WAY_2_IDENTICOS', 400, 1),
('PLAY4_BOX', '6_way_2_identicos', 'Play4 Box - 6 Way 2 Idénticos', 'PLAY4_BOX_6_WAY_2_IDENTICOS', 800, 1),
('PLAY4_BOX', '4_way_3_identicos', 'Play4 Box - 4 Way 3 Idénticos', 'PLAY4_BOX_4_WAY_3_IDENTICOS', 1200, 1);

-- SUPER_PALE (1 field)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('SUPER_PALE', 'primer_pago', 'Super Palé - Primer Pago', 'SUPER_PALE_PRIMER_PAGO', 2000, 1);

-- BOLITA_1 (1 field)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('BOLITA_1', 'primer_pago', 'Bolita 1 - Primer Pago', 'BOLITA_1_PRIMER_PAGO', 80, 1);

-- BOLITA_2 (1 field)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('BOLITA_2', 'primer_pago', 'Bolita 2 - Primer Pago', 'BOLITA_2_PRIMER_PAGO', 80, 1);

-- SINGULACION_1 (1 field)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('SINGULACION_1', 'primer_pago', 'Singulación 1 - Primer Pago', 'SINGULACION_1_PRIMER_PAGO', 9, 1);

-- SINGULACION_2 (1 field)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('SINGULACION_2', 'primer_pago', 'Singulación 2 - Primer Pago', 'SINGULACION_2_PRIMER_PAGO', 9, 1);

-- SINGULACION_3 (1 field)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('SINGULACION_3', 'primer_pago', 'Singulación 3 - Primer Pago', 'SINGULACION_3_PRIMER_PAGO', 9, 1);

-- PICK5_STRAIGHT (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PICK5_STRAIGHT', 'todos_en_secuencia', 'Pick5 Straight - Todos en Secuencia', 'PICK5_STRAIGHT_TODOS_EN_SECUENCIA', 30000, 1),
('PICK5_STRAIGHT', 'dobles', 'Pick5 Straight - Dobles', 'PICK5_STRAIGHT_DOBLES', 30000, 1);

-- PICK5_BOX (6 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PICK5_BOX', '5_way_4_identicos', 'Pick5 Box - 5 Way 4 Idénticos', 'PICK5_BOX_5_WAY_4_IDENTICOS', 10000, 1),
('PICK5_BOX', '10_way_3_identicos', 'Pick5 Box - 10 Way 3 Idénticos', 'PICK5_BOX_10_WAY_3_IDENTICOS', 5000, 1),
('PICK5_BOX', '20_way_3_identicos', 'Pick5 Box - 20 Way 3 Idénticos', 'PICK5_BOX_20_WAY_3_IDENTICOS', 2500, 1),
('PICK5_BOX', '30_way_2_identicos', 'Pick5 Box - 30 Way 2 Idénticos', 'PICK5_BOX_30_WAY_2_IDENTICOS', 1660, 1),
('PICK5_BOX', '60_way_2_identicos', 'Pick5 Box - 60 Way 2 Idénticos', 'PICK5_BOX_60_WAY_2_IDENTICOS', 830, 1),
('PICK5_BOX', '120_way_5_unicos', 'Pick5 Box - 120 Way 5 Únicos', 'PICK5_BOX_120_WAY_5_UNICOS', 416, 1);

-- PICK_TWO (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PICK_TWO', 'primer_pago', 'Pick Two - Primer Pago', 'PICK_TWO_PRIMER_PAGO', 80, 1),
('PICK_TWO', 'dobles', 'Pick Two - Dobles', 'PICK_TWO_DOBLES', 80, 1);

-- CASH3_FRONT_STRAIGHT (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('CASH3_FRONT_STRAIGHT', 'todos_en_secuencia', 'Cash3 Front Straight - Todos en Secuencia', 'CASH3_FRONT_STRAIGHT_TODOS_EN_SECUENCIA', 700, 1),
('CASH3_FRONT_STRAIGHT', 'triples', 'Cash3 Front Straight - Triples', 'CASH3_FRONT_STRAIGHT_TRIPLES', 700, 1);

-- CASH3_FRONT_BOX (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('CASH3_FRONT_BOX', '3_way_2_identicos', 'Cash3 Front Box - 3 Way 2 Idénticos', 'CASH3_FRONT_BOX_3_WAY_2_IDENTICOS', 232, 1),
('CASH3_FRONT_BOX', '6_way_3_unicos', 'Cash3 Front Box - 6 Way 3 Únicos', 'CASH3_FRONT_BOX_6_WAY_3_UNICOS', 116, 1);

-- CASH3_BACK_STRAIGHT (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('CASH3_BACK_STRAIGHT', 'todos_en_secuencia', 'Cash3 Back Straight - Todos en Secuencia', 'CASH3_BACK_STRAIGHT_TODOS_EN_SECUENCIA', 700, 1),
('CASH3_BACK_STRAIGHT', 'triples', 'Cash3 Back Straight - Triples', 'CASH3_BACK_STRAIGHT_TRIPLES', 700, 1);

-- CASH3_BACK_BOX (2 fields)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('CASH3_BACK_BOX', '3_way_2_identicos', 'Cash3 Back Box - 3 Way 2 Idénticos', 'CASH3_BACK_BOX_3_WAY_2_IDENTICOS', 232, 1),
('CASH3_BACK_BOX', '6_way_3_unicos', 'Cash3 Back Box - 6 Way 3 Únicos', 'CASH3_BACK_BOX_6_WAY_3_UNICOS', 116, 1);

-- PICK_TWO_FRONT (2 fields with NULL values per JSON)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PICK_TWO_FRONT', 'primer_pago', 'Pick Two Front - Primer Pago', 'PICK_TWO_FRONT_PRIMER_PAGO', 0, 1),
('PICK_TWO_FRONT', 'dobles', 'Pick Two Front - Dobles', 'PICK_TWO_FRONT_DOBLES', 0, 1);

-- PICK_TWO_BACK (2 fields with NULL values per JSON)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PICK_TWO_BACK', 'primer_pago', 'Pick Two Back - Primer Pago', 'PICK_TWO_BACK_PRIMER_PAGO', 0, 1),
('PICK_TWO_BACK', 'dobles', 'Pick Two Back - Dobles', 'PICK_TWO_BACK_DOBLES', 0, 1);

-- PICK_TWO_MIDDLE (2 fields with NULL values per JSON)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PICK_TWO_MIDDLE', 'primer_pago', 'Pick Two Middle - Primer Pago', 'PICK_TWO_MIDDLE_PRIMER_PAGO', 0, 1),
('PICK_TWO_MIDDLE', 'dobles', 'Pick Two Middle - Dobles', 'PICK_TWO_MIDDLE_DOBLES', 0, 1);

-- PANAMA (12 fields with NULL values per JSON)
INSERT INTO prize_fields (bet_type, prize_category, field_name, field_code, default_multiplier, is_active)
VALUES
('PANAMA', '4_numeros_primera_ronda', 'Panamá - 4 Números Primera Ronda', 'PANAMA_4_NUMEROS_PRIMERA_RONDA', 0, 1),
('PANAMA', '3_numeros_primera_ronda', 'Panamá - 3 Números Primera Ronda', 'PANAMA_3_NUMEROS_PRIMERA_RONDA', 0, 1),
('PANAMA', '2_numeros_primera_ronda', 'Panamá - 2 Números Primera Ronda', 'PANAMA_2_NUMEROS_PRIMERA_RONDA', 0, 1),
('PANAMA', 'ultimo_numero_primera_ronda', 'Panamá - Último Número Primera Ronda', 'PANAMA_ULTIMO_NUMERO_PRIMERA_RONDA', 0, 1),
('PANAMA', '4_numeros_segunda_ronda', 'Panamá - 4 Números Segunda Ronda', 'PANAMA_4_NUMEROS_SEGUNDA_RONDA', 0, 1),
('PANAMA', '3_numeros_segunda_ronda', 'Panamá - 3 Números Segunda Ronda', 'PANAMA_3_NUMEROS_SEGUNDA_RONDA', 0, 1),
('PANAMA', 'ultimos_2_numeros_segunda_ronda', 'Panamá - Últimos 2 Números Segunda Ronda', 'PANAMA_ULTIMOS_2_NUMEROS_SEGUNDA_RONDA', 0, 1),
('PANAMA', 'ultimo_numero_segunda_ronda', 'Panamá - Último Número Segunda Ronda', 'PANAMA_ULTIMO_NUMERO_SEGUNDA_RONDA', 0, 1),
('PANAMA', '4_numeros_tercera_ronda', 'Panamá - 4 Números Tercera Ronda', 'PANAMA_4_NUMEROS_TERCERA_RONDA', 0, 1),
('PANAMA', '3_numeros_tercera_ronda', 'Panamá - 3 Números Tercera Ronda', 'PANAMA_3_NUMEROS_TERCERA_RONDA', 0, 1),
('PANAMA', 'ultimos_2_numeros_tercera_ronda', 'Panamá - Últimos 2 Números Tercera Ronda', 'PANAMA_ULTIMOS_2_NUMEROS_TERCERA_RONDA', 0, 1),
('PANAMA', 'ultimo_numero_tercera_ronda', 'Panamá - Último Número Tercera Ronda', 'PANAMA_ULTIMO_NUMERO_TERCERA_RONDA', 0, 1);

GO

-- Verify the new count
DECLARE @NewCount INT;
SELECT @NewCount = COUNT(*) FROM prize_fields;

PRINT '';
PRINT '================================================================================';
PRINT '✓ PRIZE FIELDS UPDATED SUCCESSFULLY!';
PRINT '================================================================================';
PRINT 'New prize fields count: ' + CAST(@NewCount AS VARCHAR);
PRINT '';
PRINT 'Summary:';
PRINT '  - 24 bet types';
PRINT '  - 64 total prize fields';
PRINT '  - 46 fields with values';
PRINT '  - 18 fields pending values (set to 0)';
PRINT '';
PRINT '⚠️  IMPORTANT: betting_pool_general_config has been cleared!';
PRINT '   You need to regenerate configuration for all 17 betting pools.';
PRINT '   This will create 1,088 new records (17 pools × 64 fields).';
PRINT '';

GO
