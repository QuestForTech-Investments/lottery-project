-- ============================================
-- AGREGAR CONFIGURACIÓN A PICK TWO (bet_type_id = 15)
-- ============================================

PRINT 'Configurando Pick Two (bet_type_id 15)...';
PRINT '';

-- Eliminar configuración existente si hay
DELETE FROM prize_types WHERE bet_type_id = 15;

-- Insertar los 2 sub-campos de Pick Two
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (15, 'PICK2_PRIMER_PAGO', 'Pick Two - Primer Pago', 75.0, 1),
  (15, 'PICK2_DOBLES', 'Pick Two - Dobles', 75.0, 2);

PRINT '';
PRINT '✅ Pick Two configurado exitosamente!';
PRINT '  - 2 sub-campos insertados (Primer Pago: 75, Dobles: 75)';
