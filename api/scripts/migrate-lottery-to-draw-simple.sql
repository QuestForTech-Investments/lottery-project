-- ============================================================================
-- MIGRACIÓN SIMPLIFICADA: Lottery → Draw (Desarrollo)
-- ============================================================================
-- Ejecutar en lottery-db (desarrollo)
-- Tiempo estimado: 15-20 minutos
-- ============================================================================

USE [lottery-db];
GO

PRINT '=== INICIO MIGRACIÓN LOTTERY → DRAW ===';
PRINT 'Fecha: ' + CONVERT(VARCHAR, GETDATE(), 120);
GO

-- ============================================================================
-- PASO 1: DESHABILITAR CONSTRAINTS
-- ============================================================================
PRINT '';
PRINT 'PASO 1: Deshabilitando constraints...';

EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
PRINT '✓ Constraints deshabilitadas';
GO

-- ============================================================================
-- PASO 2: RENOMBRAR COLUMNAS lottery_id → draw_id
-- ============================================================================
PRINT '';
PRINT 'PASO 2: Renombrando columnas lottery_id → draw_id...';

-- betting_pool_prizes_commissions
IF COL_LENGTH('betting_pool_prizes_commissions', 'lottery_id') IS NOT NULL
BEGIN
    EXEC sp_rename 'betting_pool_prizes_commissions.lottery_id', 'draw_id', 'COLUMN';
    PRINT '✓ betting_pool_prizes_commissions.lottery_id → draw_id';
END

-- lottery_bet_type_compatibilities
IF COL_LENGTH('lottery_bet_type_compatibilities', 'lottery_id') IS NOT NULL
BEGIN
    EXEC sp_rename 'lottery_bet_type_compatibilities.lottery_id', 'draw_id', 'COLUMN';
    PRINT '✓ lottery_bet_type_compatibilities.lottery_id → draw_id';
END

-- banca_prize_config
IF COL_LENGTH('banca_prize_config', 'lottery_id') IS NOT NULL
BEGIN
    EXEC sp_rename 'banca_prize_config.lottery_id', 'draw_id', 'COLUMN';
    PRINT '✓ banca_prize_config.lottery_id → draw_id';
END

-- tickets (si existe)
IF COL_LENGTH('tickets', 'lottery_id') IS NOT NULL
BEGIN
    EXEC sp_rename 'tickets.lottery_id', 'draw_id', 'COLUMN';
    PRINT '✓ tickets.lottery_id → draw_id';
END

-- ticket_lines (si existe)
IF COL_LENGTH('ticket_lines', 'lottery_id') IS NOT NULL
BEGIN
    EXEC sp_rename 'ticket_lines.lottery_id', 'draw_id', 'COLUMN';
    PRINT '✓ ticket_lines.lottery_id → draw_id';
END
GO

-- ============================================================================
-- PASO 3: RENOMBRAR TABLAS
-- ============================================================================
PRINT '';
PRINT 'PASO 3: Renombrando tablas...';

-- Renombrar tabla actual lotteries → lotteries_old (backup)
IF OBJECT_ID('lotteries', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'lotteries', 'lotteries_old';
    PRINT '✓ lotteries → lotteries_old (backup)';
END

-- Renombrar lotteries_copy → lotteries (tipos correctos)
IF OBJECT_ID('lotteries_copy', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'lotteries_copy', 'lotteries';
    PRINT '✓ lotteries_copy → lotteries (tipos de lotería)';
END
ELSE
BEGIN
    PRINT '⚠ lotteries_copy no existe, creando tabla lotteries vacía...';
    -- Crear tabla lotteries desde lotteries_old (mantener solo estructura de tipos)
    SELECT TOP 0 * INTO lotteries FROM lotteries_old;
END
GO

-- ============================================================================
-- PASO 4: HABILITAR CONSTRAINTS Y RECREAR FKs
-- ============================================================================
PRINT '';
PRINT 'PASO 4: Recreando Foreign Keys...';

-- Eliminar FKs viejas que apuntan a lotteries_old
DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql += 'ALTER TABLE ' + OBJECT_NAME(parent_object_id) +
               ' DROP CONSTRAINT ' + name + ';' + CHAR(13)
FROM sys.foreign_keys
WHERE referenced_object_id = OBJECT_ID('lotteries_old');

IF LEN(@sql) > 0
BEGIN
    EXEC sp_executesql @sql;
    PRINT '✓ FKs antiguas eliminadas';
END

-- Crear nuevas FKs apuntando a draws
IF OBJECT_ID('betting_pool_prizes_commissions', 'U') IS NOT NULL
BEGIN
    ALTER TABLE betting_pool_prizes_commissions
    ADD CONSTRAINT FK_betting_pool_prizes_commissions_draws
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '✓ FK: betting_pool_prizes_commissions → draws';
END

IF OBJECT_ID('lottery_bet_type_compatibilities', 'U') IS NOT NULL
BEGIN
    ALTER TABLE lottery_bet_type_compatibilities
    ADD CONSTRAINT FK_lottery_bet_type_compatibilities_draws
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '✓ FK: lottery_bet_type_compatibilities → draws';
END

IF OBJECT_ID('banca_prize_config', 'U') IS NOT NULL
BEGIN
    ALTER TABLE banca_prize_config
    ADD CONSTRAINT FK_banca_prize_config_draws
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '✓ FK: banca_prize_config → draws';
END

IF OBJECT_ID('tickets', 'U') IS NOT NULL AND COL_LENGTH('tickets', 'draw_id') IS NOT NULL
BEGIN
    ALTER TABLE tickets
    ADD CONSTRAINT FK_tickets_draws
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '✓ FK: tickets → draws';
END

IF OBJECT_ID('ticket_lines', 'U') IS NOT NULL AND COL_LENGTH('ticket_lines', 'draw_id') IS NOT NULL
BEGIN
    ALTER TABLE ticket_lines
    ADD CONSTRAINT FK_ticket_lines_draws
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '✓ FK: ticket_lines → draws';
END
GO

-- ============================================================================
-- PASO 5: HABILITAR TODAS LAS CONSTRAINTS
-- ============================================================================
PRINT '';
PRINT 'PASO 5: Habilitando constraints...';

EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
PRINT '✓ Constraints habilitadas';
GO

-- ============================================================================
-- PASO 6: VALIDACIÓN
-- ============================================================================
PRINT '';
PRINT '=== VALIDACIÓN DE MIGRACIÓN ===';
PRINT '';

-- Contar registros
PRINT 'Tablas:';
SELECT 'lotteries (tipos)' AS Tabla, COUNT(*) AS Registros FROM lotteries
UNION ALL
SELECT 'draws (sorteos)', COUNT(*) FROM draws
UNION ALL
SELECT 'lotteries_old (backup)', COUNT(*) FROM lotteries_old;

-- Verificar FKs
PRINT '';
PRINT 'Foreign Keys apuntando a draws:';
SELECT
    OBJECT_NAME(parent_object_id) AS TablaOrigen,
    COL_NAME(parent_object_id, parent_column_id) AS ColumnaOrigen,
    'draws' AS TablaDestino,
    'draw_id' AS ColumnaDestino
FROM sys.foreign_key_columns
WHERE referenced_object_id = OBJECT_ID('draws')
ORDER BY OBJECT_NAME(parent_object_id);

-- Verificar integridad
PRINT '';
PRINT 'Integridad Referencial:';
SELECT
    'betting_pool_prizes_commissions' AS Tabla,
    COUNT(*) AS TotalRegistros,
    COUNT(draw_id) AS ConDrawId,
    COUNT(*) - COUNT(draw_id) AS NulosDrawId
FROM betting_pool_prizes_commissions
UNION ALL
SELECT
    'banca_prize_config',
    COUNT(*),
    COUNT(draw_id),
    COUNT(*) - COUNT(draw_id)
FROM banca_prize_config;

PRINT '';
PRINT '=== MIGRACIÓN COMPLETADA ===';
PRINT 'Fecha: ' + CONVERT(VARCHAR, GETDATE(), 120);
GO

-- ============================================================================
-- NOTAS POST-MIGRACIÓN
-- ============================================================================
/*
SIGUIENTE PASO: Actualizar código C#

1. Modelos a cambiar:
   - BettingPoolPrizesCommission.cs: LotteryId → DrawId
   - LotteryBetTypeCompatibility.cs: LotteryId → DrawId
   - BancaPrizeConfig.cs: LotteryId → DrawId
   - Ticket.cs: LotteryId → DrawId (si aplica)
   - TicketLine.cs: LotteryId → DrawId (si aplica)

2. Repositorios:
   - Actualizar queries que usan lottery_id

3. Controllers:
   - Mantener rutas /api/lotteries
   - Internamente trabajan con draws

4. Frontend:
   - Cambiar lottery.id → draw.id en componentes
   - Cambiar lotteryId → drawId en payloads
*/
