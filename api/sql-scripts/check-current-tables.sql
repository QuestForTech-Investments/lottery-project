USE [lottery-db];
GO

PRINT '================================================================================'
PRINT 'CHECKING CURRENT TABLE AND COLUMN NAMES'
PRINT '================================================================================'
PRINT ''

-- Check which tables exist
SELECT
    TABLE_NAME AS [Table Name],
    TABLE_TYPE AS [Type]
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN (
    'campos_premio', 'prize_fields',
    'tipos_apuesta', 'bet_types',
    'sorteos', 'draws',
    'configuracion_general_banca', 'betting_pool_general_config',
    'configuracion_sorteo_banca', 'betting_pool_draw_config',
    'banca_sorteos', 'betting_pool_draws',
    'auditoria_cambios_premios', 'prize_changes_audit'
)
ORDER BY TABLE_NAME;

GO
