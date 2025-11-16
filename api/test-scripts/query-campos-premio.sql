USE [lottery-db];
GO

-- =============================================
-- Query to get all 62 campos_premio with details
-- =============================================

PRINT '================================================================================';
PRINT 'LISTING ALL 62 CAMPOS PREMIO';
PRINT '================================================================================';
PRINT '';

SELECT
    cp.campo_premio_id AS [ID],
    ta.bet_type_code AS [Tipo_Apuesta],
    ta.bet_type_name AS [Tipo_Nombre],
    cp.field_code AS [Field_Code],
    cp.field_name AS [Field_Name],
    cp.default_multiplier AS [Default_Multiplier],
    cp.min_multiplier AS [Min],
    cp.max_multiplier AS [Max],
    cp.display_order AS [Display_Order],
    cp.is_active AS [Active]
FROM campos_premio cp
INNER JOIN tipos_apuesta ta ON cp.tipo_apuesta_id = ta.tipo_apuesta_id
WHERE cp.is_active = 1
ORDER BY ta.display_order, cp.display_order;

PRINT '';
PRINT '================================================================================';
PRINT 'SUMMARY BY BET TYPE';
PRINT '================================================================================';
PRINT '';

SELECT
    ta.bet_type_code AS [Tipo_Apuesta],
    ta.bet_type_name AS [Tipo_Nombre],
    COUNT(cp.campo_premio_id) AS [Cantidad_Campos]
FROM tipos_apuesta ta
LEFT JOIN campos_premio cp ON ta.tipo_apuesta_id = cp.tipo_apuesta_id AND cp.is_active = 1
WHERE ta.is_active = 1
GROUP BY ta.bet_type_code, ta.bet_type_name, ta.display_order
ORDER BY ta.display_order;

PRINT '';
PRINT 'Total active campos_premio:';
SELECT COUNT(*) AS [Total] FROM campos_premio WHERE is_active = 1;
