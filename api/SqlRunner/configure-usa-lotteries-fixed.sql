-- ============================================
-- CONFIGURACIÓN COMPLETA DE TODOS LOS TIPOS DE APUESTA
-- Incluye loterías dominicanas y USA
-- ============================================

PRINT 'Configurando TODOS los tipos de apuesta (DOM + USA)...';
PRINT '';

-- ============================================
-- YA CONFIGURADOS (Loterias Dominicanas):
-- DIRECTO (1), PALE (2), TRIPLETA (3)
-- ============================================

-- ============================================
-- CASH3 STRAIGHT (game_type_id = 4)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 4;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (4, 'CASH3_STRAIGHT_TODOS_SECUENCIA', 'Cash3 Straight - Todos en secuencia', 600.0, 1),
  (4, 'CASH3_STRAIGHT_TRIPLES', 'Cash3 Straight - Triples', 600.0, 2);

-- ============================================
-- CASH3 BOX (game_type_id = 5)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 5;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (5, 'CASH3_BOX_3WAY', 'Cash3 Box - 3-Way: 2 idénticos', 100.0, 1),
  (5, 'CASH3_BOX_6WAY', 'Cash3 Box - 6-Way: 3 únicos', 100.0, 2);

-- ============================================
-- CASH3 FRONT STRAIGHT (game_type_id = 6)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 6;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (6, 'CASH3_FRONT_STRAIGHT_TODOS_SECUENCIA', 'Cash3 Front Straight - Todos en secuencia', 600.0, 1),
  (6, 'CASH3_FRONT_STRAIGHT_TRIPLES', 'Cash3 Front Straight - Triples', 600.0, 2);

-- ============================================
-- CASH3 FRONT BOX (game_type_id = 7)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 7;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (7, 'CASH3_FRONT_BOX_3WAY', 'Cash3 Front Box - 3-Way: 2 idénticos', 100.0, 1),
  (7, 'CASH3_FRONT_BOX_6WAY', 'Cash3 Front Box - 6-Way: 3 únicos', 100.0, 2);

-- ============================================
-- CASH3 BACK STRAIGHT (game_type_id = 8)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 8;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (8, 'CASH3_BACK_STRAIGHT_TODOS_SECUENCIA', 'Cash3 Back Straight - Todos en secuencia', 600.0, 1),
  (8, 'CASH3_BACK_STRAIGHT_TRIPLES', 'Cash3 Back Straight - Triples', 600.0, 2);

-- ============================================
-- CASH3 BACK BOX (game_type_id = 9)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 9;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (9, 'CASH3_BACK_BOX_3WAY', 'Cash3 Back Box - 3-Way: 2 idénticos', 100.0, 1),
  (9, 'CASH3_BACK_BOX_6WAY', 'Cash3 Back Box - 6-Way: 3 únicos', 100.0, 2);

-- ============================================
-- PLAY4 STRAIGHT (game_type_id = 10)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 10;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (10, 'PLAY4_STRAIGHT_TODOS_SECUENCIA', 'Play4 Straight - Todos en secuencia', 5000.0, 1),
  (10, 'PLAY4_STRAIGHT_DOBLES', 'Play4 Straight - Dobles', 5000.0, 2);

-- ============================================
-- PLAY4 BOX (game_type_id = 11)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 11;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (11, 'PLAY4_BOX_24WAY', 'Play4 Box - 24-Way: 4 únicos', 200.0, 1),
  (11, 'PLAY4_BOX_12WAY', 'Play4 Box - 12-Way: 2 idénticos', 200.0, 2),
  (11, 'PLAY4_BOX_6WAY', 'Play4 Box - 6-Way: 2 idénticos', 200.0, 3),
  (11, 'PLAY4_BOX_4WAY', 'Play4 Box - 4-Way: 3 idénticos', 200.0, 4);

-- ============================================
-- PICK5 STRAIGHT (game_type_id = 12)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 12;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (12, 'PICK5_STRAIGHT_TODOS_SECUENCIA', 'Pick5 Straight - Todos en secuencia', 30000.0, 1),
  (12, 'PICK5_STRAIGHT_DOBLES', 'Pick5 Straight - Dobles', 30000.0, 2);

-- ============================================
-- PICK5 BOX (game_type_id = 13)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 13;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (13, 'PICK5_BOX_5WAY', 'Pick5 Box - 5-Way: 4 idénticos', 10000.0, 1),
  (13, 'PICK5_BOX_10WAY', 'Pick5 Box - 10-Way: 3 idénticos', 5000.0, 2),
  (13, 'PICK5_BOX_20WAY', 'Pick5 Box - 20-Way: 3 idénticos', 2500.0, 3),
  (13, 'PICK5_BOX_30WAY', 'Pick5 Box - 30-Way: 2 idénticos', 1660.0, 4),
  (13, 'PICK5_BOX_60WAY', 'Pick5 Box - 60-Way: 2 idénticos', 830.0, 5),
  (13, 'PICK5_BOX_120WAY', 'Pick5 Box - 120-Way: 5 únicos', 416.0, 6);

-- ============================================
-- SUPER PALE (game_type_id = 14)
-- Ya existe en loterías dominicanas, no modificar
-- ============================================

-- ============================================
-- PICK2 (game_type_id = 15)
-- No tiene sub-campos según la configuración proporcionada
-- ============================================

-- ============================================
-- PICK2 FRONT (game_type_id = 16)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 16;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (16, 'PICK2_FRONT_PRIMER_PAGO', 'Pick Two Front - Primer Pago', 75.0, 1),
  (16, 'PICK2_FRONT_DOBLES', 'Pick Two Front - Dobles', 75.0, 2);

-- ============================================
-- PICK2 BACK (game_type_id = 17)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 17;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (17, 'PICK2_BACK_PRIMER_PAGO', 'Pick Two Back - Primer Pago', 75.0, 1),
  (17, 'PICK2_BACK_DOBLES', 'Pick Two Back - Dobles', 75.0, 2);

-- ============================================
-- PICK2 MIDDLE (game_type_id = 18)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 18;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (18, 'PICK2_MIDDLE_PRIMER_PAGO', 'Pick Two Middle - Primer Pago', 75.0, 1),
  (18, 'PICK2_MIDDLE_DOBLES', 'Pick Two Middle - Dobles', 75.0, 2);

-- ============================================
-- BOLITA (game_type_id = 19)
-- Tiene 2 sub-campos: Bolita 1 y Bolita 2
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 19;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (19, 'BOLITA_1_PRIMER_PAGO', 'Bolita 1 - Primer Pago', 75.0, 1),
  (19, 'BOLITA_2_PRIMER_PAGO', 'Bolita 2 - Primer Pago', 75.0, 2);

-- ============================================
-- SINGULACION (game_type_id = 20)
-- Tiene 3 sub-campos: Singulación 1, 2 y 3
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 20;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (20, 'SINGULACION_1_PRIMER_PAGO', 'Singulación 1 - Primer Pago', 9.0, 1),
  (20, 'SINGULACION_2_PRIMER_PAGO', 'Singulación 2 - Primer Pago', 9.0, 2),
  (20, 'SINGULACION_3_PRIMER_PAGO', 'Singulación 3 - Primer Pago', 9.0, 3);

-- ============================================
-- PANAMA (game_type_id = 21)
-- No tiene sub-campos en la configuración proporcionada
-- ============================================

PRINT '';
PRINT 'Configuración completada exitosamente!';
PRINT '';
PRINT 'Resumen de prize_types insertados:';
PRINT '  - Loterías Dominicanas (ya configuradas):';
PRINT '    * DIRECTO: 4 sub-campos';
PRINT '    * PALÉ: 4 sub-campos';
PRINT '    * TRIPLETA: 2 sub-campos';
PRINT '';
PRINT '  - Loterías USA:';
PRINT '    * Cash3 Straight: 2 sub-campos';
PRINT '    * Cash3 Box: 2 sub-campos';
PRINT '    * Cash3 Front Straight: 2 sub-campos';
PRINT '    * Cash3 Front Box: 2 sub-campos';
PRINT '    * Cash3 Back Straight: 2 sub-campos';
PRINT '    * Cash3 Back Box: 2 sub-campos';
PRINT '    * Play4 Straight: 2 sub-campos';
PRINT '    * Play4 Box: 4 sub-campos';
PRINT '    * Pick5 Straight: 2 sub-campos';
PRINT '    * Pick5 Box: 6 sub-campos';
PRINT '    * Pick Two Front: 2 sub-campos';
PRINT '    * Pick Two Back: 2 sub-campos';
PRINT '    * Pick Two Middle: 2 sub-campos';
PRINT '    * Bolita: 2 sub-campos';
PRINT '    * Singulación: 3 sub-campos';
PRINT '';
PRINT 'Total general: 47 sub-campos (10 DOM + 37 USA)';
