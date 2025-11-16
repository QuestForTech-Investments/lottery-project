USE [lottery-db];
GO

-- =============================================
-- Stored Procedure: sp_GetEffectiveMultipliers
-- Retrieves all effective multipliers for a banca/sorteo
-- with precedence resolution (Default → Banca → Sorteo)
-- Based on SQL Architecture Review 2025-10-30
-- =============================================

PRINT '================================================================================'
PRINT 'CREATING STORED PROCEDURE: sp_GetEffectiveMultipliers'
PRINT '================================================================================'
PRINT ''

-- Drop if exists
IF OBJECT_ID('sp_GetEffectiveMultipliers', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE sp_GetEffectiveMultipliers;
    PRINT '⚠ Existing procedure dropped';
END

GO

CREATE PROCEDURE sp_GetEffectiveMultipliers
    @banca_id INT,
    @sorteo_id INT = NULL,  -- NULL returns general banca config only
    @tipo_apuesta_id INT = NULL  -- Optional filter by bet type
AS
BEGIN
    SET NOCOUNT ON;

    -- =============================================
    -- Returns all 62 prize fields with effective multipliers
    -- applying the 3-level precedence rule:
    -- 1. System Default (campos_premio.default_multiplier)
    -- 2. Banca General (configuracion_general_banca.monto_multiplicador)
    -- 3. Sorteo Override (configuracion_sorteo_banca.monto_multiplicador) ⭐ WINS
    --
    -- Performance: Single query retrieves all 62 fields
    -- Avoids N+1 query problem (62 individual queries)
    -- =============================================

    SELECT
        -- Identifiers
        cp.campo_premio_id,
        cp.field_code,
        cp.field_name,
        ta.tipo_apuesta_id,
        ta.bet_type_code,
        ta.bet_type_name,
        ta.display_order AS bet_type_order,
        cp.display_order AS field_order,

        -- Multiplier values at each level
        cp.default_multiplier AS system_default_multiplier,
        cg.monto_multiplicador AS banca_general_multiplier,
        cs.monto_multiplicador AS sorteo_override_multiplier,

        -- Effective multiplier (applying precedence)
        COALESCE(
            cs.monto_multiplicador,  -- Level 3: Sorteo override (highest priority)
            cg.monto_multiplicador,  -- Level 2: Banca general
            cp.default_multiplier    -- Level 1: System default (fallback)
        ) AS effective_multiplier,

        -- Source indicator (which level is being used)
        CASE
            WHEN cs.monto_multiplicador IS NOT NULL THEN 'SORTEO_OVERRIDE'
            WHEN cg.monto_multiplicador IS NOT NULL THEN 'BANCA_GENERAL'
            ELSE 'SYSTEM_DEFAULT'
        END AS multiplier_source,

        -- Validation ranges
        cp.min_multiplier,
        cp.max_multiplier,

        -- Status flags
        cp.is_active AS campo_is_active,
        ta.is_active AS tipo_apuesta_is_active,
        cg.is_active AS banca_config_is_active,
        cs.is_active AS sorteo_override_is_active

    FROM campos_premio cp

    -- Join to get bet type information
    INNER JOIN tipos_apuesta ta
        ON cp.tipo_apuesta_id = ta.tipo_apuesta_id

    -- Left join to banca general config (may not exist yet)
    LEFT JOIN configuracion_general_banca cg
        ON cp.campo_premio_id = cg.campo_premio_id
        AND cg.banca_id = @banca_id
        AND cg.is_active = 1

    -- Left join to sorteo override (only if sorteo_id provided)
    LEFT JOIN configuracion_sorteo_banca cs
        ON cp.campo_premio_id = cs.campo_premio_id
        AND cs.banca_id = @banca_id
        AND cs.sorteo_id = @sorteo_id
        AND cs.is_active = 1
        AND @sorteo_id IS NOT NULL  -- Only join if sorteo_id provided

    WHERE cp.is_active = 1
        AND ta.is_active = 1
        AND (@tipo_apuesta_id IS NULL OR ta.tipo_apuesta_id = @tipo_apuesta_id)

    ORDER BY ta.display_order, cp.display_order;

    -- Return record count for verification
    DECLARE @RecordCount INT = @@ROWCOUNT;

    -- Print debug info (won't affect result set returned to application)
    IF @RecordCount = 0
        PRINT 'WARNING: No prize fields found matching criteria';
    ELSE IF @sorteo_id IS NOT NULL
        PRINT CONCAT('✓ Retrieved ', @RecordCount, ' prize fields for banca_id=', @banca_id, ', sorteo_id=', @sorteo_id);
    ELSE
        PRINT CONCAT('✓ Retrieved ', @RecordCount, ' prize fields for banca_id=', @banca_id, ' (general config)');
END;
GO

-- =============================================
-- Grant execute permission
-- Adjust role name as needed for your application
-- =============================================
-- GRANT EXECUTE ON sp_GetEffectiveMultipliers TO [LotteryApiUser];

PRINT ''
PRINT '================================================================================'
PRINT 'STORED PROCEDURE CREATED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Usage Examples:'
PRINT ''
PRINT '-- Get general banca configuration (all 62 fields):'
PRINT 'EXEC sp_GetEffectiveMultipliers @banca_id = 1;'
PRINT ''
PRINT '-- Get configuration for specific sorteo (with overrides):'
PRINT 'EXEC sp_GetEffectiveMultipliers @banca_id = 1, @sorteo_id = 5;'
PRINT ''
PRINT '-- Get configuration filtered by bet type:'
PRINT 'EXEC sp_GetEffectiveMultipliers @banca_id = 1, @tipo_apuesta_id = 1;'
PRINT ''
PRINT '-- Get configuration for sorteo + bet type:'
PRINT 'EXEC sp_GetEffectiveMultipliers @banca_id = 1, @sorteo_id = 5, @tipo_apuesta_id = 1;'
PRINT ''
PRINT 'Performance Benefits:'
PRINT '- Single query retrieves all 62 fields (vs 62 individual queries)'
PRINT '- Covering indexes provide fast lookups'
PRINT '- Precedence calculated in database (reduces app logic)'
PRINT '- Expected execution time: < 50ms for all 62 fields'
PRINT ''
PRINT '================================================================================'

GO

-- =============================================
-- Test the procedure (optional, comment out if not needed)
-- =============================================
/*
PRINT ''
PRINT 'Testing stored procedure...'
PRINT ''

-- Test with a valid banca_id (adjust as needed)
IF EXISTS (SELECT 1 FROM betting_pools WHERE betting_pool_id = 1)
BEGIN
    PRINT 'Test 1: General banca configuration'
    EXEC sp_GetEffectiveMultipliers @banca_id = 1;

    IF EXISTS (SELECT 1 FROM sorteos WHERE sorteo_id = 1)
    BEGIN
        PRINT ''
        PRINT 'Test 2: Configuration with sorteo override'
        EXEC sp_GetEffectiveMultipliers @banca_id = 1, @sorteo_id = 1;
    END
END
ELSE
BEGIN
    PRINT 'No test data available (no bancas exist yet)'
    PRINT 'Procedure will be tested after banca creation'
END
*/

GO

