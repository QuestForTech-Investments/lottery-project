USE [lottery-db];
GO

-- =============================================
-- INICIALIZAR CONFIGURACIÓN PARA BANCAS EXISTENTES
-- =============================================

PRINT '================================================================================'
PRINT 'INICIALIZANDO CONFIGURACIÓN DE PREMIOS PARA BANCAS EXISTENTES'
PRINT '================================================================================'
PRINT ''

-- Para cada betting pool existente, crear los 60 registros en configuracion_general_banca
-- copiando los valores por defecto de campos_premio

INSERT INTO configuracion_general_banca (banca_id, campo_premio_id, monto_multiplicador, is_active, created_at, updated_at)
SELECT
    bp.betting_pool_id AS banca_id,
    cp.campo_premio_id,
    cp.default_multiplier,
    1 AS is_active,
    GETDATE() AS created_at,
    GETDATE() AS updated_at
FROM betting_pools bp
CROSS JOIN campos_premio cp
WHERE bp.is_active = 1
  AND cp.is_active = 1
  AND NOT EXISTS (
      SELECT 1 FROM configuracion_general_banca cgb
      WHERE cgb.banca_id = bp.betting_pool_id
        AND cgb.campo_premio_id = cp.campo_premio_id
  );

DECLARE @BancasCount INT, @ConfigsCreated INT;

SELECT @BancasCount = COUNT(DISTINCT betting_pool_id) FROM betting_pools WHERE is_active = 1;
SELECT @ConfigsCreated = COUNT(*) FROM configuracion_general_banca;

PRINT ''
PRINT '✓ Configuración inicializada'
PRINT ''
PRINT 'Bancas activas: ' + CAST(@BancasCount AS VARCHAR)
PRINT 'Registros de configuración creados: ' + CAST(@ConfigsCreated AS VARCHAR)
PRINT 'Configuraciones por banca: ' + CAST(@ConfigsCreated / @BancasCount AS VARCHAR)
PRINT ''
PRINT '================================================================================'
PRINT 'INICIALIZACIÓN COMPLETADA'
PRINT '================================================================================'

GO
