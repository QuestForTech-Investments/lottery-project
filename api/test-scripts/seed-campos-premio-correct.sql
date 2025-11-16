USE [lottery-db];
GO

-- =============================================
-- SEED CAMPOS_PREMIO - VALORES CORRECTOS
-- Basado en valores por defecto del sistema original
-- =============================================

PRINT '================================================================================'
PRINT 'LIMPIANDO Y RE-INSERTANDO CAMPOS_PREMIO CON VALORES CORRECTOS'
PRINT '================================================================================'
PRINT ''

-- Limpiar datos existentes
DELETE FROM configuracion_sorteo_banca;
DELETE FROM configuracion_general_banca;
DELETE FROM campos_premio;
DBCC CHECKIDENT ('campos_premio', RESEED, 0);

PRINT '✓ Tablas limpiadas'
PRINT ''

-- =============================================
-- INSERTAR CAMPOS CON VALORES CORRECTOS
-- =============================================

SET IDENTITY_INSERT campos_premio ON;

-- =============================================
-- DIRECTO (tipo_apuesta_id = 1) - 4 campos
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(1, 1, 'DIRECTO_PRIMER_PAGO', 'Primer Pago', 60.00, 0, 9999.99, 1, 1),
(2, 1, 'DIRECTO_SEGUNDO_PAGO', 'Segundo Pago', 12.00, 0, 9999.99, 2, 1),
(3, 1, 'DIRECTO_TERCER_PAGO', 'Tercer Pago', 4.00, 0, 9999.99, 3, 1),
(4, 1, 'DIRECTO_DOBLES', 'Dobles', 50.00, 0, 9999.99, 4, 1);

-- =============================================
-- PALE (tipo_apuesta_id = 2) - 4 campos
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(5, 2, 'PALE_TODOS_SECUENCIA', 'Todos en secuencia', 1200.00, 0, 9999.99, 1, 1),
(6, 2, 'PALE_PRIMER_PAGO', 'Primer Pago', 1200.00, 0, 9999.99, 2, 1),
(7, 2, 'PALE_SEGUNDO_PAGO', 'Segundo Pago', 1200.00, 0, 9999.99, 3, 1),
(8, 2, 'PALE_TERCER_PAGO', 'Tercer Pago', 200.00, 0, 9999.99, 4, 1);

-- =============================================
-- TRIPLETA (tipo_apuesta_id = 3) - 2 campos
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(9, 3, 'TRIPLETA_PRIMER_PAGO', 'Primer Pago', 10000.00, 0, 99999.99, 1, 1),
(10, 3, 'TRIPLETA_SEGUNDO_PAGO', 'Segundo Pago', 100.00, 0, 99999.99, 2, 1);

-- =============================================
-- TERMINAL (tipo_apuesta_id = 4) - Sin valores por defecto
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(11, 4, 'TERMINAL_MONTO', 'Monto', 0.00, 0, 9999.99, 1, 1);

-- =============================================
-- QUINIELA_PALE (tipo_apuesta_id = 5) - Sin valores por defecto
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(12, 5, 'QUINIELA_PALE_MONTO', 'Monto', 0.00, 0, 9999.99, 1, 1);

-- =============================================
-- SUPER_PALE (tipo_apuesta_id = 6) - 2 campos
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(13, 6, 'SUPER_PALE_TODOS_SECUENCIA', 'Todos en secuencia', 8000.00, 0, 99999.99, 1, 1),
(14, 6, 'SUPER_PALE_CUALQUIER_LUGAR', 'Primer, segundo y tercer premio, en cualquier lugar', 100.00, 0, 99999.99, 2, 1);

-- =============================================
-- PATA_CABALLO (tipo_apuesta_id = 7) - Sin valores por defecto
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(15, 7, 'PATA_CABALLO_MONTO', 'Monto', 0.00, 0, 9999.99, 1, 1);

-- =============================================
-- CENTENA (tipo_apuesta_id = 8) - Sin valores por defecto
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(16, 8, 'CENTENA_MONTO', 'Monto', 0.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_TWO_FRONT (tipo_apuesta_id = 9)
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(17, 9, 'PICK_TWO_FRONT_STRAIGHT', 'Straight', 50.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_TWO_BACK (tipo_apuesta_id = 10)
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(18, 10, 'PICK_TWO_BACK_STRAIGHT', 'Straight', 50.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_TWO_MIDDLE (tipo_apuesta_id = 11)
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(19, 11, 'PICK_TWO_MIDDLE_STRAIGHT', 'Straight', 50.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_THREE_STRAIGHT (tipo_apuesta_id = 12) - CASH3 STRAIGHT
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(20, 12, 'PICK_THREE_STRAIGHT', 'Straight', 500.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_THREE_BOX (tipo_apuesta_id = 13) - CASH3 BOX
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(21, 13, 'PICK_THREE_BOX_3_WAY', '3-Way', 167.00, 0, 9999.99, 1, 1),
(22, 13, 'PICK_THREE_BOX_6_WAY', '6-Way', 83.00, 0, 9999.99, 2, 1);

-- =============================================
-- PICK_THREE_STRAIGHT_BOX (tipo_apuesta_id = 14)
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(23, 14, 'PICK_THREE_STRAIGHT_BOX_STRAIGHT', 'Straight', 500.00, 0, 9999.99, 1, 1),
(24, 14, 'PICK_THREE_STRAIGHT_BOX_BOX', 'Box', 83.00, 0, 9999.99, 2, 1);

-- =============================================
-- PICK_THREE_COMBO (tipo_apuesta_id = 15)
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(25, 15, 'PICK_THREE_COMBO', 'Combo', 500.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_THREE_FRONT_PAIR (tipo_apuesta_id = 16) - CASH3 FRONT STRAIGHT
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(26, 16, 'PICK_THREE_FRONT_PAIR_STRAIGHT', 'Straight', 50.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_THREE_BACK_PAIR (tipo_apuesta_id = 17) - CASH3 BACK STRAIGHT
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(27, 17, 'PICK_THREE_BACK_PAIR_STRAIGHT', 'Straight', 50.00, 0, 9999.99, 1, 1);

-- =============================================
-- PICK_FOUR_STRAIGHT (tipo_apuesta_id = 18) - PLAY4 STRAIGHT
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(28, 18, 'PICK_FOUR_STRAIGHT', 'Straight', 5000.00, 0, 99999.99, 1, 1);

-- =============================================
-- PICK_FOUR_BOX_24 (tipo_apuesta_id = 19) - PLAY4 BOX 24-Way
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(29, 19, 'PICK_FOUR_BOX_24_WAY', '24-Way', 208.00, 0, 99999.99, 1, 1);

-- =============================================
-- PICK_FOUR_BOX_12 (tipo_apuesta_id = 20) - PLAY4 BOX 12-Way
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(30, 20, 'PICK_FOUR_BOX_12_WAY', '12-Way', 416.00, 0, 99999.99, 1, 1);

-- =============================================
-- PICK_FOUR_BOX_6 (tipo_apuesta_id = 21) - PLAY4 BOX 6-Way
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(31, 21, 'PICK_FOUR_BOX_6_WAY', '6-Way', 833.00, 0, 99999.99, 1, 1);

-- =============================================
-- PICK_FOUR_BOX_4 (tipo_apuesta_id = 22) - PLAY4 BOX 4-Way
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(32, 22, 'PICK_FOUR_BOX_4_WAY', '4-Way', 1250.00, 0, 99999.99, 1, 1);

-- =============================================
-- PICK_FOUR_STRAIGHT_BOX (tipo_apuesta_id = 23) - Múltiples campos
-- =============================================
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(33, 23, 'PICK_FOUR_STRAIGHT_BOX_STRAIGHT', 'Straight', 5000.00, 0, 99999.99, 1, 1),
(34, 23, 'PICK_FOUR_STRAIGHT_BOX_24_WAY', '24-Way Box', 208.00, 0, 99999.99, 2, 1),
(35, 23, 'PICK_FOUR_STRAIGHT_BOX_12_WAY', '12-Way Box', 416.00, 0, 99999.99, 3, 1),
(36, 23, 'PICK_FOUR_STRAIGHT_BOX_6_WAY', '6-Way Box', 833.00, 0, 99999.99, 4, 1),
(37, 23, 'PICK_FOUR_STRAIGHT_BOX_4_WAY', '4-Way Box', 1250.00, 0, 99999.99, 5, 1);

-- =============================================
-- PICK_FOUR_COMBO (tipo_apuesta_id = 24) - Contiene Pick 5 y otros
-- =============================================

-- PLAY4 BOX 1 OFF
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(38, 24, 'PICK_FOUR_BOX_1_OFF', '1 OFF', 350.00, 0, 99999.99, 1, 1);

-- PLAY4 FRONT/BACK STRAIGHT
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(39, 24, 'PICK_FOUR_FRONT_STRAIGHT', 'Front Straight', 500.00, 0, 99999.99, 2, 1),
(40, 24, 'PICK_FOUR_BACK_STRAIGHT', 'Back Straight', 500.00, 0, 99999.99, 3, 1);

-- PLAY4 FRONT/BACK BOX
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(41, 24, 'PICK_FOUR_FRONT_BOX_3_WAY', 'Front Box 3-Way', 167.00, 0, 99999.99, 4, 1),
(42, 24, 'PICK_FOUR_FRONT_BOX_6_WAY', 'Front Box 6-Way', 83.00, 0, 99999.99, 5, 1),
(43, 24, 'PICK_FOUR_BACK_BOX_3_WAY', 'Back Box 3-Way', 167.00, 0, 99999.99, 6, 1),
(44, 24, 'PICK_FOUR_BACK_BOX_6_WAY', 'Back Box 6-Way', 83.00, 0, 99999.99, 7, 1);

-- PICK5 STRAIGHT
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(45, 24, 'PICK_FIVE_STRAIGHT', 'Pick 5 Straight', 50000.00, 0, 999999.99, 8, 1);

-- PICK5 BOX
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(46, 24, 'PICK_FIVE_BOX_5_WAY', 'Pick 5 Box 5-Way', 10000.00, 0, 999999.99, 9, 1),
(47, 24, 'PICK_FIVE_BOX_10_WAY', 'Pick 5 Box 10-Way', 5000.00, 0, 999999.99, 10, 1),
(48, 24, 'PICK_FIVE_BOX_20_WAY', 'Pick 5 Box 20-Way', 2500.00, 0, 999999.99, 11, 1),
(49, 24, 'PICK_FIVE_BOX_30_WAY', 'Pick 5 Box 30-Way', 1666.00, 0, 999999.99, 12, 1),
(50, 24, 'PICK_FIVE_BOX_60_WAY', 'Pick 5 Box 60-Way', 833.00, 0, 999999.99, 13, 1),
(51, 24, 'PICK_FIVE_BOX_120_WAY', 'Pick 5 Box 120-Way', 416.00, 0, 999999.99, 14, 1),
(52, 24, 'PICK_FIVE_BOX_1_OFF', 'Pick 5 1 OFF', 3500.00, 0, 999999.99, 15, 1);

-- BOLITA 1 (como parte del tipo 24, o crear tipos separados si existen)
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(53, 24, 'BOLITA_1_PRIMER_PAGO', 'Bolita 1 - Primer Pago', 60.00, 0, 9999.99, 16, 1),
(54, 24, 'BOLITA_1_SEGUNDO_PAGO', 'Bolita 1 - Segundo Pago', 12.00, 0, 9999.99, 17, 1),
(55, 24, 'BOLITA_1_TERCER_PAGO', 'Bolita 1 - Tercer Pago', 4.00, 0, 9999.99, 18, 1),
(56, 24, 'BOLITA_1_DOBLES', 'Bolita 1 - Dobles', 50.00, 0, 9999.99, 19, 1);

-- BOLITA 2
INSERT INTO campos_premio (campo_premio_id, tipo_apuesta_id, field_code, field_name, default_multiplier, min_multiplier, max_multiplier, display_order, is_active)
VALUES
(57, 24, 'BOLITA_2_PRIMER_PAGO', 'Bolita 2 - Primer Pago', 60.00, 0, 9999.99, 20, 1),
(58, 24, 'BOLITA_2_SEGUNDO_PAGO', 'Bolita 2 - Segundo Pago', 12.00, 0, 9999.99, 21, 1),
(59, 24, 'BOLITA_2_TERCER_PAGO', 'Bolita 2 - Tercer Pago', 4.00, 0, 9999.99, 22, 1),
(60, 24, 'BOLITA_2_DOBLES', 'Bolita 2 - Dobles', 50.00, 0, 9999.99, 23, 1);

SET IDENTITY_INSERT campos_premio OFF;

PRINT ''
PRINT '✓ 60 campos de premio insertados correctamente'
PRINT ''

-- =============================================
-- VERIFICACIÓN
-- =============================================

DECLARE @TotalCampos INT;
SELECT @TotalCampos = COUNT(*) FROM campos_premio WHERE is_active = 1;

PRINT '================================================================================'
PRINT 'VERIFICACIÓN DE DATOS'
PRINT '================================================================================'
PRINT 'Total de campos activos: ' + CAST(@TotalCampos AS VARCHAR)
PRINT ''

-- Mostrar resumen por tipo de apuesta
SELECT
    ta.bet_type_name AS [Tipo de Apuesta],
    ta.bet_type_code AS [Código],
    COUNT(cp.campo_premio_id) AS [Campos],
    STRING_AGG(CAST(cp.default_multiplier AS VARCHAR) + ' (' + cp.field_name + ')', ', ') AS [Multiplicadores]
FROM tipos_apuesta ta
LEFT JOIN campos_premio cp ON ta.tipo_apuesta_id = cp.tipo_apuesta_id AND cp.is_active = 1
WHERE ta.is_active = 1
GROUP BY ta.bet_type_name, ta.bet_type_code, ta.display_order
ORDER BY ta.display_order;

PRINT ''
PRINT '================================================================================'
PRINT 'VALORES CORRECTOS INSERTADOS EXITOSAMENTE'
PRINT '================================================================================'
PRINT ''
PRINT 'Próximos pasos:'
PRINT '1. El trigger trg_auto_create_banca_config creará automáticamente'
PRINT '   estos 60 campos en configuracion_general_banca para cada nueva banca'
PRINT '2. Los valores pueden ser modificados por banca en configuracion_general_banca'
PRINT '3. Los valores pueden tener overrides por sorteo en configuracion_sorteo_banca'
PRINT '================================================================================'

GO
