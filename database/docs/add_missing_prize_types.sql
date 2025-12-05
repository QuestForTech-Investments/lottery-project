-- Script para agregar los prize_types faltantes
-- Basado en la configuración de la aplicación Vue.js original (la-numbers.apk.lol)
-- Fecha: 2025-12-03

-- Bet Types sin prize_types actualmente:
-- 14: Super Palé
-- 21: Panamá
-- 25: Bolita 1
-- 26: Bolita 2
-- 27: Singulación 1
-- 28: Singulación 2
-- 29: Singulación 3
-- 30: Pick5 Straight
-- 31: Pick5 Box
-- 32: Pick Two
-- 34: Cash3 Back Box

-- El último prize_type_id existente es 239, comenzamos desde 240

-- Super Palé (bet_type_id = 14)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES (240, 14, 'SUPER_PALE_PRIMER_PAGO', 'Super Palé - Primer Pago', 2000.00, 0.00, 9999999.99, 1);

-- Bolita 1 (bet_type_id = 25)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES (241, 25, 'BOLITA1_PRIMER_PAGO', 'Bolita 1 - Primer Pago', 75.00, 0.00, 9999999.99, 1);

-- Bolita 2 (bet_type_id = 26)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES (242, 26, 'BOLITA2_PRIMER_PAGO', 'Bolita 2 - Primer Pago', 75.00, 0.00, 9999999.99, 1);

-- Singulación 1 (bet_type_id = 27)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES (243, 27, 'SINGULACION1_PRIMER_PAGO', 'Singulación 1 - Primer Pago', 9.00, 0.00, 9999999.99, 1);

-- Singulación 2 (bet_type_id = 28)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES (244, 28, 'SINGULACION2_PRIMER_PAGO', 'Singulación 2 - Primer Pago', 9.00, 0.00, 9999999.99, 1);

-- Singulación 3 (bet_type_id = 29)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES (245, 29, 'SINGULACION3_PRIMER_PAGO', 'Singulación 3 - Primer Pago', 9.00, 0.00, 9999999.99, 1);

-- Pick5 Straight (bet_type_id = 30)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES
(246, 30, 'PICK5_STRAIGHT_TODOS_SECUENCIA', 'Pick5 Straight - Todos en secuencia', 30000.00, 0.00, 9999999.99, 1),
(247, 30, 'PICK5_STRAIGHT_DOBLES', 'Pick5 Straight - Dobles', 30000.00, 0.00, 9999999.99, 2);

-- Pick5 Box (bet_type_id = 31)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES
(248, 31, 'PICK5_BOX_5WAY', 'Pick5 Box - 5-Way: 4 idénticos', 10000.00, 0.00, 9999999.99, 1),
(249, 31, 'PICK5_BOX_10WAY', 'Pick5 Box - 10-Way: 3 idénticos', 5000.00, 0.00, 9999999.99, 2),
(250, 31, 'PICK5_BOX_20WAY', 'Pick5 Box - 20-Way: 3 idénticos', 2500.00, 0.00, 9999999.99, 3),
(251, 31, 'PICK5_BOX_30WAY', 'Pick5 Box - 30-Way: 2 idénticos', 1660.00, 0.00, 9999999.99, 4),
(252, 31, 'PICK5_BOX_60WAY', 'Pick5 Box - 60-Way: 2 idénticos', 830.00, 0.00, 9999999.99, 5),
(253, 31, 'PICK5_BOX_120WAY', 'Pick5 Box - 120-Way: 5 únicos', 416.00, 0.00, 9999999.99, 6);

-- Pick Two (bet_type_id = 32)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES
(254, 32, 'PICK_TWO_PRIMER_PAGO', 'Pick Two - Primer Pago', 75.00, 0.00, 9999999.99, 1),
(255, 32, 'PICK_TWO_DOBLES', 'Pick Two - Dobles', 75.00, 0.00, 9999999.99, 2);

-- Cash3 Back Box (bet_type_id = 34)
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES
(256, 34, 'CASH3_BACK_BOX_3WAY', 'Cash3 Back Box - 3-Way: 2 idénticos', 100.00, 0.00, 9999999.99, 1),
(257, 34, 'CASH3_BACK_BOX_6WAY', 'Cash3 Back Box - 6-Way: 3 únicos', 100.00, 0.00, 9999999.99, 2);

-- Panamá (bet_type_id = 21) - 12 campos
INSERT INTO prize_types (prize_type_id, bet_type_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order)
VALUES
(258, 21, 'PANAMA_4NUM_R1', 'Panamá - 4 números primera ronda', 0.00, 0.00, 9999999.99, 1),
(259, 21, 'PANAMA_3NUM_R1', 'Panamá - 3 números primera ronda', 0.00, 0.00, 9999999.99, 2),
(260, 21, 'PANAMA_2NUM_R1', 'Panamá - 2 números primera ronda', 0.00, 0.00, 9999999.99, 3),
(261, 21, 'PANAMA_1NUM_R1', 'Panamá - Último número primera ronda', 0.00, 0.00, 9999999.99, 4),
(262, 21, 'PANAMA_4NUM_R2', 'Panamá - 4 números segunda ronda', 0.00, 0.00, 9999999.99, 5),
(263, 21, 'PANAMA_3NUM_R2', 'Panamá - 3 números segunda ronda', 0.00, 0.00, 9999999.99, 6),
(264, 21, 'PANAMA_2NUM_R2', 'Panamá - Últimos 2 números segunda ronda', 0.00, 0.00, 9999999.99, 7),
(265, 21, 'PANAMA_1NUM_R2', 'Panamá - Último número segunda ronda', 0.00, 0.00, 9999999.99, 8),
(266, 21, 'PANAMA_4NUM_R3', 'Panamá - 4 números tercera ronda', 0.00, 0.00, 9999999.99, 9),
(267, 21, 'PANAMA_3NUM_R3', 'Panamá - 3 números tercera ronda', 0.00, 0.00, 9999999.99, 10),
(268, 21, 'PANAMA_2NUM_R3', 'Panamá - Últimos 2 números tercera ronda', 0.00, 0.00, 9999999.99, 11),
(269, 21, 'PANAMA_1NUM_R3', 'Panamá - Último número tercera ronda', 0.00, 0.00, 9999999.99, 12);

-- Verificación: Contar los registros insertados
-- SELECT COUNT(*) as total_inserted FROM prize_types WHERE prize_type_id >= 240;
-- Deberían ser 30 registros nuevos
