USE [lottery-db];
GO

-- Verificar valores insertados
PRINT '================================================================================'
PRINT 'VERIFICACIÓN DE VALORES INSERTADOS'
PRINT '================================================================================'
PRINT ''

-- DIRECTO (debería tener 4 campos: 60, 12, 4, 50)
PRINT 'DIRECTO:'
SELECT field_name, default_multiplier
FROM campos_premio
WHERE tipo_apuesta_id = 1
ORDER BY display_order;
PRINT ''

-- PALE (debería tener 4 campos: 1200, 1200, 1200, 200)
PRINT 'PALE:'
SELECT field_name, default_multiplier
FROM campos_premio
WHERE tipo_apuesta_id = 2
ORDER BY display_order;
PRINT ''

-- TRIPLETA (debería tener 2 campos: 10000, 100)
PRINT 'TRIPLETA:'
SELECT field_name, default_multiplier
FROM campos_premio
WHERE tipo_apuesta_id = 3
ORDER BY display_order;
PRINT ''

-- SUPER_PALE (debería tener 2 campos: 8000, 100)
PRINT 'SUPER_PALE:'
SELECT field_name, default_multiplier
FROM campos_premio
WHERE tipo_apuesta_id = 6
ORDER BY display_order;
PRINT ''

-- PICK_FOUR_STRAIGHT (debería ser 5000)
PRINT 'PICK_FOUR_STRAIGHT:'
SELECT field_name, default_multiplier
FROM campos_premio
WHERE tipo_apuesta_id = 18
ORDER BY display_order;
PRINT ''

-- PICK 5 (debería tener: 50000, 10000, 5000, 2500, 1666, 833, 416, 3500)
PRINT 'PICK 5 (dentro del tipo 24):'
SELECT field_name, default_multiplier
FROM campos_premio
WHERE field_code LIKE 'PICK_FIVE%'
ORDER BY display_order;
PRINT ''

-- Total de campos
PRINT 'Total de campos activos:'
SELECT COUNT(*) AS TotalCampos FROM campos_premio WHERE is_active = 1;

GO
