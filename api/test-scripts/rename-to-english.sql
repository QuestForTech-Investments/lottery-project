USE [lottery-db];
GO

-- =============================================
-- RENAME ALL TABLES AND COLUMNS TO ENGLISH
-- =============================================

PRINT '================================================================================'
PRINT 'RENAMING PREMIO SYSTEM TABLES AND COLUMNS TO ENGLISH'
PRINT '================================================================================'
PRINT ''

-- =============================================
-- STEP 1: DROP DEPENDENT OBJECTS
-- =============================================

PRINT 'Step 1: Dropping dependent objects...'

-- Drop stored procedures
IF OBJECT_ID('sp_GetEffectiveMultipliers', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetEffectiveMultipliers;

-- Drop triggers
IF OBJECT_ID('trg_auto_create_banca_config', 'TR') IS NOT NULL
    DROP TRIGGER trg_auto_create_banca_config;

PRINT '? Dependent objects dropped'
PRINT ''

-- =============================================
-- STEP 2: DROP FOREIGN KEY CONSTRAINTS
-- =============================================

PRINT 'Step 2: Dropping foreign key constraints...'

-- Drop FK constraints from configuracion_sorteo_banca
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_sorteo_banca')
    ALTER TABLE configuracion_sorteo_banca DROP CONSTRAINT FK_config_sorteo_banca;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_sorteo_sorteo')
    ALTER TABLE configuracion_sorteo_banca DROP CONSTRAINT FK_config_sorteo_sorteo;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_sorteo_campo')
    ALTER TABLE configuracion_sorteo_banca DROP CONSTRAINT FK_config_sorteo_campo;

-- Drop FK constraints from configuracion_general_banca
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_general_banca')
    ALTER TABLE configuracion_general_banca DROP CONSTRAINT FK_config_general_banca;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_general_campo')
    ALTER TABLE configuracion_general_banca DROP CONSTRAINT FK_config_general_campo;

-- Drop FK constraints from banca_sorteos
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_banca_sorteos_banca')
    ALTER TABLE banca_sorteos DROP CONSTRAINT FK_banca_sorteos_banca;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_banca_sorteos_sorteo')
    ALTER TABLE banca_sorteos DROP CONSTRAINT FK_banca_sorteos_sorteo;

-- Drop FK constraints from campos_premio
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_campos_premio_tipo_apuesta')
    ALTER TABLE campos_premio DROP CONSTRAINT FK_campos_premio_tipo_apuesta;

PRINT '? Foreign key constraints dropped'
PRINT ''

-- =============================================
-- STEP 3: RENAME TABLES
-- =============================================

PRINT 'Step 3: Renaming tables...'

-- Rename tables to English
EXEC sp_rename 'auditoria_cambios_premios', 'prize_changes_audit';
EXEC sp_rename 'configuracion_sorteo_banca', 'betting_pool_draw_config';
EXEC sp_rename 'banca_sorteos', 'betting_pool_draws';
EXEC sp_rename 'configuracion_general_banca', 'betting_pool_general_config';
EXEC sp_rename 'campos_premio', 'prize_fields';
EXEC sp_rename 'tipos_apuesta', 'bet_types';
EXEC sp_rename 'sorteos', 'draws';

PRINT '? Tables renamed'
PRINT ''

-- =============================================
-- STEP 4: RENAME COLUMNS
-- =============================================

PRINT 'Step 4: Renaming columns...'

-- Rename columns in prize_fields
EXEC sp_rename 'prize_fields.campo_premio_id', 'prize_field_id', 'COLUMN';
EXEC sp_rename 'prize_fields.tipo_apuesta_id', 'bet_type_id', 'COLUMN';

-- Rename columns in bet_types
EXEC sp_rename 'bet_types.tipo_apuesta_id', 'bet_type_id', 'COLUMN';

-- Rename columns in draws
EXEC sp_rename 'draws.sorteo_id', 'draw_id', 'COLUMN';

-- Rename columns in betting_pool_general_config
EXEC sp_rename 'betting_pool_general_config.banca_id', 'betting_pool_id', 'COLUMN';
EXEC sp_rename 'betting_pool_general_config.campo_premio_id', 'prize_field_id', 'COLUMN';
EXEC sp_rename 'betting_pool_general_config.monto_multiplicador', 'multiplier_amount', 'COLUMN';

-- Rename columns in betting_pool_draw_config
EXEC sp_rename 'betting_pool_draw_config.banca_id', 'betting_pool_id', 'COLUMN';
EXEC sp_rename 'betting_pool_draw_config.sorteo_id', 'draw_id', 'COLUMN';
EXEC sp_rename 'betting_pool_draw_config.campo_premio_id', 'prize_field_id', 'COLUMN';
EXEC sp_rename 'betting_pool_draw_config.monto_multiplicador', 'multiplier_amount', 'COLUMN';

-- Rename columns in betting_pool_draws
EXEC sp_rename 'betting_pool_draws.banca_id', 'betting_pool_id', 'COLUMN';
EXEC sp_rename 'betting_pool_draws.sorteo_id', 'draw_id', 'COLUMN';

-- Rename columns in prize_changes_audit
EXEC sp_rename 'prize_changes_audit.banca_id', 'betting_pool_id', 'COLUMN';
EXEC sp_rename 'prize_changes_audit.sorteo_id', 'draw_id', 'COLUMN';
EXEC sp_rename 'prize_changes_audit.campo_premio_id', 'prize_field_id', 'COLUMN';

PRINT '? Columns renamed'
PRINT ''

-- =============================================
-- STEP 5: RECREATE FOREIGN KEY CONSTRAINTS
-- =============================================

PRINT 'Step 5: Recreating foreign key constraints...'

-- FK for prize_fields
ALTER TABLE prize_fields
ADD CONSTRAINT FK_prize_fields_bet_types
FOREIGN KEY (bet_type_id) REFERENCES bet_types(bet_type_id);

-- FK for betting_pool_general_config
ALTER TABLE betting_pool_general_config
ADD CONSTRAINT FK_pool_general_config_betting_pool
FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id) ON DELETE CASCADE;

ALTER TABLE betting_pool_general_config
ADD CONSTRAINT FK_pool_general_config_prize_field
FOREIGN KEY (prize_field_id) REFERENCES prize_fields(prize_field_id);

-- FK for betting_pool_draw_config
ALTER TABLE betting_pool_draw_config
ADD CONSTRAINT FK_pool_draw_config_betting_pool
FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id) ON DELETE CASCADE;

ALTER TABLE betting_pool_draw_config
ADD CONSTRAINT FK_pool_draw_config_draw
FOREIGN KEY (draw_id) REFERENCES draws(draw_id);

ALTER TABLE betting_pool_draw_config
ADD CONSTRAINT FK_pool_draw_config_prize_field
FOREIGN KEY (prize_field_id) REFERENCES prize_fields(prize_field_id);

-- FK for betting_pool_draws
ALTER TABLE betting_pool_draws
ADD CONSTRAINT FK_pool_draws_betting_pool
FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id) ON DELETE CASCADE;

ALTER TABLE betting_pool_draws
ADD CONSTRAINT FK_pool_draws_draw
FOREIGN KEY (draw_id) REFERENCES draws(draw_id);

PRINT '? Foreign key constraints recreated'
PRINT ''

-- =============================================
-- STEP 6: RECREATE STORED PROCEDURE
-- =============================================

PRINT 'Step 6: Recreating stored procedure...'

EXEC('
CREATE PROCEDURE sp_GetEffectiveMultipliers
    @BettingPoolId INT,
    @DrawId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pf.prize_field_id AS PrizeFieldId,
        pf.field_code AS FieldCode,
        pf.field_name AS FieldName,
        bt.bet_type_code AS BetTypeCode,

        -- Effective multiplier (precedence: draw override > general config > system default)
        COALESCE(
            pdc.multiplier_amount,  -- Level 3: Draw override
            pgc.multiplier_amount,   -- Level 2: Betting pool general
            pf.default_multiplier    -- Level 1: System default
        ) AS EffectiveMultiplier,

        -- Source values for transparency
        pf.default_multiplier AS SystemDefault,
        pgc.multiplier_amount AS BettingPoolGeneral,
        pdc.multiplier_amount AS DrawOverride,

        -- Source indicator
        CASE
            WHEN pdc.multiplier_amount IS NOT NULL THEN ''DRAW_OVERRIDE''
            WHEN pgc.multiplier_amount IS NOT NULL THEN ''BETTING_POOL_GENERAL''
            ELSE ''SYSTEM_DEFAULT''
        END AS Source,

        -- Validation limits
        pf.min_multiplier AS MinValue,
        pf.max_multiplier AS MaxValue

    FROM prize_fields pf
    INNER JOIN bet_types bt ON pf.bet_type_id = bt.bet_type_id
    LEFT JOIN betting_pool_general_config pgc
        ON pgc.betting_pool_id = @BettingPoolId
        AND pgc.prize_field_id = pf.prize_field_id
        AND pgc.is_active = 1
    LEFT JOIN betting_pool_draw_config pdc
        ON pdc.betting_pool_id = @BettingPoolId
        AND pdc.draw_id = @DrawId
        AND pdc.prize_field_id = pf.prize_field_id
        AND pdc.is_active = 1
    WHERE pf.is_active = 1
    ORDER BY bt.display_order, pf.display_order;
END
');

PRINT '? Stored procedure recreated'
PRINT ''

-- =============================================
-- STEP 7: RECREATE TRIGGER
-- =============================================

PRINT 'Step 7: Recreating trigger...'

EXEC('
CREATE TRIGGER trg_auto_create_pool_config
ON betting_pools
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO betting_pool_general_config (betting_pool_id, prize_field_id, multiplier_amount, is_active, created_at, updated_at)
    SELECT
        i.betting_pool_id,
        pf.prize_field_id,
        pf.default_multiplier,
        1,
        GETDATE(),
        GETDATE()
    FROM inserted i
    CROSS JOIN prize_fields pf
    WHERE pf.is_active = 1;
END
');

PRINT '? Trigger recreated'
PRINT ''

PRINT '================================================================================'
PRINT 'RENAME COMPLETED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Summary of changes:'
PRINT '- All 7 tables renamed to English'
PRINT '- All columns renamed to English'
PRINT '- Foreign key constraints recreated'
PRINT '- Stored procedure sp_GetEffectiveMultipliers recreated'
PRINT '- Trigger trg_auto_create_pool_config recreated'
PRINT ''
PRINT 'Tables:'
PRINT '  ? auditoria_cambios_premios       -> prize_changes_audit'
PRINT '  ? configuracion_sorteo_banca      -> betting_pool_draw_config'
PRINT '  ? banca_sorteos                   -> betting_pool_draws'
PRINT '  ? configuracion_general_banca     -> betting_pool_general_config'
PRINT '  ? campos_premio                   -> prize_fields'
PRINT '  ? tipos_apuesta                   -> bet_types'
PRINT '  ? sorteos                         -> draws'
PRINT '================================================================================'

GO
