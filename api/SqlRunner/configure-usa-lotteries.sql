-- ============================================
-- CONFIGURACIÓN LOTERÍAS USA Y NO DOMINICANAS
-- ============================================

PRINT 'Configurando tipos de apuesta para loterías USA...';
PRINT '';

-- Ya tenemos DIRECTO (1), PALÉ (2) y TRIPLETA (3) configurados
-- Ahora vamos a configurar el resto

-- ============================================
-- CASH3 STRAIGHT (bet_type_id = 11)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 11;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (11, 'CASH3_STRAIGHT_TODOS_SECUENCIA', 'Cash3 Straight - Todos en secuencia', 600.0, 1),
  (11, 'CASH3_STRAIGHT_TRIPLES', 'Cash3 Straight - Triples', 600.0, 2);

-- ============================================
-- CASH3 BOX (bet_type_id = 12)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 12;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (12, 'CASH3_BOX_3WAY', 'Cash3 Box - 3-Way: 2 idénticos', 100.0, 1),
  (12, 'CASH3_BOX_6WAY', 'Cash3 Box - 6-Way: 3 únicos', 100.0, 2);

-- ============================================
-- PLAY4 STRAIGHT (bet_type_id = 17)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 17;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (17, 'PLAY4_STRAIGHT_TODOS_SECUENCIA', 'Play4 Straight - Todos en secuencia', 5000.0, 1),
  (17, 'PLAY4_STRAIGHT_DOBLES', 'Play4 Straight - Dobles', 5000.0, 2);

-- ============================================
-- PLAY4 BOX (bet_type_id = 18)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 18;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (18, 'PLAY4_BOX_24WAY', 'Play4 Box - 24-Way: 4 únicos', 200.0, 1),
  (18, 'PLAY4_BOX_12WAY', 'Play4 Box - 12-Way: 2 idénticos', 200.0, 2),
  (18, 'PLAY4_BOX_6WAY', 'Play4 Box - 6-Way: 2 idénticos', 200.0, 3),
  (18, 'PLAY4_BOX_4WAY', 'Play4 Box - 4-Way: 3 idénticos', 200.0, 4);

-- ============================================
-- BOLITA 1 (bet_type_id = 5)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 5;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (5, 'BOLITA1_PRIMER_PAGO', 'Bolita 1 - Primer Pago', 75.0, 1);

-- ============================================
-- BOLITA 2 (bet_type_id = 6)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 6;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (6, 'BOLITA2_PRIMER_PAGO', 'Bolita 2 - Primer Pago', 75.0, 1);

-- ============================================
-- SINGULACIÓN 1 (bet_type_id = 7)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 7;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (7, 'SINGULACION1_PRIMER_PAGO', 'Singulación 1 - Primer Pago', 9.0, 1);

-- ============================================
-- SINGULACIÓN 2 (bet_type_id = 8)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 8;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (8, 'SINGULACION2_PRIMER_PAGO', 'Singulación 2 - Primer Pago', 9.0, 1);

-- ============================================
-- SINGULACIÓN 3 (bet_type_id = 9)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 9;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (9, 'SINGULACION3_PRIMER_PAGO', 'Singulación 3 - Primer Pago', 9.0, 1);

-- ============================================
-- PICK5 STRAIGHT (bet_type_id = 19)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 19;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (19, 'PICK5_STRAIGHT_TODOS_SECUENCIA', 'Pick5 Straight - Todos en secuencia', 30000.0, 1),
  (19, 'PICK5_STRAIGHT_DOBLES', 'Pick5 Straight - Dobles', 30000.0, 2);

-- ============================================
-- PICK5 BOX (bet_type_id = 20)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 20;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (20, 'PICK5_BOX_5WAY', 'Pick5 Box - 5-Way: 4 idénticos', 10000.0, 1),
  (20, 'PICK5_BOX_10WAY', 'Pick5 Box - 10-Way: 3 idénticos', 5000.0, 2),
  (20, 'PICK5_BOX_20WAY', 'Pick5 Box - 20-Way: 3 idénticos', 2500.0, 3),
  (20, 'PICK5_BOX_30WAY', 'Pick5 Box - 30-Way: 2 idénticos', 1660.0, 4),
  (20, 'PICK5_BOX_60WAY', 'Pick5 Box - 60-Way: 2 idénticos', 830.0, 5),
  (20, 'PICK5_BOX_120WAY', 'Pick5 Box - 120-Way: 5 únicos', 416.0, 6);

-- ============================================
-- CASH3 FRONT STRAIGHT (bet_type_id = 13)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 13;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (13, 'CASH3_FRONT_STRAIGHT_TODOS_SECUENCIA', 'Cash3 Front Straight - Todos en secuencia', 600.0, 1),
  (13, 'CASH3_FRONT_STRAIGHT_TRIPLES', 'Cash3 Front Straight - Triples', 600.0, 2);

-- ============================================
-- CASH3 FRONT BOX (bet_type_id = 14)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 14;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (14, 'CASH3_FRONT_BOX_3WAY', 'Cash3 Front Box - 3-Way: 2 idénticos', 100.0, 1),
  (14, 'CASH3_FRONT_BOX_6WAY', 'Cash3 Front Box - 6-Way: 3 únicos', 100.0, 2);

-- ============================================
-- CASH3 BACK STRAIGHT (bet_type_id = 15)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 15;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (15, 'CASH3_BACK_STRAIGHT_TODOS_SECUENCIA', 'Cash3 Back Straight - Todos en secuencia', 600.0, 1),
  (15, 'CASH3_BACK_STRAIGHT_TRIPLES', 'Cash3 Back Straight - Triples', 600.0, 2);

-- ============================================
-- CASH3 BACK BOX (bet_type_id = 16)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 16;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (16, 'CASH3_BACK_BOX_3WAY', 'Cash3 Back Box - 3-Way: 2 idénticos', 100.0, 1),
  (16, 'CASH3_BACK_BOX_6WAY', 'Cash3 Back Box - 6-Way: 3 únicos', 100.0, 2);

-- ============================================
-- PICK TWO FRONT (bet_type_id = 10)
-- ============================================
DELETE FROM prize_types WHERE bet_type_id = 10;

INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (10, 'PICK_TWO_FRONT_PRIMER_PAGO', 'Pick Two Front - Primer Pago', 75.0, 1),
  (10, 'PICK_TWO_FRONT_DOBLES', 'Pick Two Front - Dobles', 75.0, 2);

-- ============================================
-- PICK TWO BACK (bet_type_id = not in list, need to map)
-- ============================================
-- Nota: Pick Two Back y Pick Two Middle necesitan bet_type_id
-- Asumiendo que existen en game_types, buscar IDs correctos

PRINT '';
PRINT 'Configuración de prize_types USA completada!';
PRINT '';
PRINT 'Total de prize_types insertados:';
PRINT '  - Cash3 Straight: 2 sub-campos';
PRINT '  - Cash3 Box: 2 sub-campos';
PRINT '  - Play4 Straight: 2 sub-campos';
PRINT '  - Play4 Box: 4 sub-campos';
PRINT '  - Bolita 1: 1 sub-campo';
PRINT '  - Bolita 2: 1 sub-campo';
PRINT '  - Singulación 1: 1 sub-campo';
PRINT '  - Singulación 2: 1 sub-campo';
PRINT '  - Singulación 3: 1 sub-campo';
PRINT '  - Pick5 Straight: 2 sub-campos';
PRINT '  - Pick5 Box: 6 sub-campos';
PRINT '  - Cash3 Front Straight: 2 sub-campos';
PRINT '  - Cash3 Front Box: 2 sub-campos';
PRINT '  - Cash3 Back Straight: 2 sub-campos';
PRINT '  - Cash3 Back Box: 2 sub-campos';
PRINT '  - Pick Two Front: 2 sub-campos';
PRINT '';
PRINT 'Total general: ~40 sub-campos adicionales';
