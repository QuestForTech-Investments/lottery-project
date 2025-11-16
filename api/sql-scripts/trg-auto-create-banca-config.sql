USE [lottery-db];
GO

-- =============================================
-- Trigger: trg_auto_create_banca_config
-- Auto-creates 62 prize configuration records when a new banca is created
-- Based on SQL Architecture Review 2025-10-30
-- CRITICAL: This is a core system feature that was documented but not implemented
-- =============================================

PRINT '================================================================================'
PRINT 'CREATING AUTO-CREATION TRIGGER FOR BANCA CONFIGURATION'
PRINT '================================================================================'
PRINT ''

-- Drop trigger if exists
IF OBJECT_ID('trg_auto_create_banca_config', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER trg_auto_create_banca_config;
    PRINT '⚠ Existing trigger dropped';
END

GO

CREATE TRIGGER trg_auto_create_banca_config
ON betting_pools
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- =============================================
    -- Purpose: Automatically create 62 prize configuration records
    --          when a new banca (betting pool) is created
    --
    -- Process:
    -- 1. For each new banca inserted
    -- 2. Create 62 records in configuracion_general_banca
    -- 3. One record for each campo_premio (prize field)
    -- 4. Initialize with default_multiplier from campos_premio
    -- 5. Log auto-creation in audit table
    --
    -- This ensures every banca has complete prize configuration
    -- from day one (no manual initialization needed)
    -- =============================================

    DECLARE @created_config_count INT = 0;
    DECLARE @created_audit_count INT = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- =============================================
        -- Step 1: Insert 62 configuration records per new banca
        -- =============================================
        INSERT INTO configuracion_general_banca (
            banca_id,
            campo_premio_id,
            monto_multiplicador,
            is_active,
            created_by,
            updated_by,
            created_at,
            updated_at
        )
        SELECT
            i.betting_pool_id,           -- New banca ID
            cp.campo_premio_id,          -- Each of the 62 fields
            cp.default_multiplier,       -- Copy default from campo_premio
            1,                           -- Active by default
            COALESCE(i.created_by, 1),  -- Use banca creator or system user (ID=1)
            COALESCE(i.created_by, 1),
            GETDATE(),
            GETDATE()
        FROM inserted i
        CROSS JOIN campos_premio cp
        WHERE cp.is_active = 1;

        SET @created_config_count = @@ROWCOUNT;

        -- =============================================
        -- Step 2: Log auto-creation in audit table
        -- Uses a small time window to find just-created records
        -- =============================================
        INSERT INTO auditoria_cambios_premios (
            table_name,
            record_id,
            banca_id,
            sorteo_id,
            campo_premio_id,
            old_value,
            new_value,
            change_type,
            changed_by,
            changed_at,
            notes
        )
        SELECT
            'configuracion_general_banca',
            cg.config_id,
            cg.banca_id,
            NULL,                                    -- No sorteo for general config
            cg.campo_premio_id,
            NULL,                                    -- No old value for auto-creation
            cg.monto_multiplicador,
            'AUTO_CREATE',
            cg.created_by,
            GETDATE(),
            CONCAT(
                'Auto-created during banca initialization. ',
                'Banca ID: ', cg.banca_id, ', ',
                'Campo: ', cp.field_code, ', ',
                'Default multiplier: ', cg.monto_multiplicador
            )
        FROM configuracion_general_banca cg
        INNER JOIN inserted i ON cg.banca_id = i.betting_pool_id
        INNER JOIN campos_premio cp ON cg.campo_premio_id = cp.campo_premio_id
        WHERE cg.created_at >= DATEADD(SECOND, -2, GETDATE());  -- Just created (within 2 seconds)

        SET @created_audit_count = @@ROWCOUNT;

        COMMIT TRANSACTION;

        -- =============================================
        -- Success message (visible in SSMS, not in application)
        -- =============================================
        IF @created_config_count > 0
        BEGIN
            DECLARE @banca_ids VARCHAR(MAX);
            SELECT @banca_ids = STRING_AGG(CAST(betting_pool_id AS VARCHAR), ', ') FROM inserted;

            PRINT '';
            PRINT '✓ AUTO-CREATION SUCCESSFUL';
            PRINT CONCAT('  - Created ', @created_config_count, ' prize configuration records');
            PRINT CONCAT('  - Created ', @created_audit_count, ' audit log entries');
            PRINT CONCAT('  - For banca_id(s): ', @banca_ids);
            PRINT '';
        END

    END TRY
    BEGIN CATCH
        -- =============================================
        -- Error handling
        -- =============================================
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Log error details
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        PRINT '';
        PRINT '❌ AUTO-CREATION FAILED';
        PRINT CONCAT('  Error: ', @ErrorMessage);
        PRINT CONCAT('  Severity: ', @ErrorSeverity);
        PRINT CONCAT('  State: ', @ErrorState);
        PRINT '';

        -- Re-throw error to caller
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

PRINT ''
PRINT '================================================================================'
PRINT 'TRIGGER CREATED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Trigger Details:'
PRINT '- Name: trg_auto_create_banca_config'
PRINT '- Table: betting_pools'
PRINT '- Event: AFTER INSERT'
PRINT '- Action: Create 62 prize configuration records'
PRINT ''
PRINT 'What Happens When a New Banca is Created:'
PRINT '1. Trigger fires automatically'
PRINT '2. Reads all 62 active campos_premio records'
PRINT '3. Creates 62 configuracion_general_banca records'
PRINT '4. Initializes each with default_multiplier from campos_premio'
PRINT '5. Logs all 62 creations in auditoria_cambios_premios'
PRINT '6. Transaction ensures all-or-nothing (atomic)'
PRINT ''
PRINT 'Testing:'
PRINT ''
PRINT '-- Test by creating a new banca (adjust values as needed):'
PRINT 'INSERT INTO betting_pools (pool_name, created_by)'
PRINT 'VALUES (''Test Banca'', 1);'
PRINT ''
PRINT '-- Verify 62 records were created:'
PRINT 'SELECT COUNT(*)'
PRINT 'FROM configuracion_general_banca'
PRINT 'WHERE banca_id = (SELECT MAX(betting_pool_id) FROM betting_pools);'
PRINT '-- Should return 62'
PRINT ''
PRINT '-- View the created configurations:'
PRINT 'SELECT cg.*, cp.field_code, cp.field_name'
PRINT 'FROM configuracion_general_banca cg'
PRINT 'INNER JOIN campos_premio cp ON cg.campo_premio_id = cp.campo_premio_id'
PRINT 'WHERE cg.banca_id = (SELECT MAX(betting_pool_id) FROM betting_pools)'
PRINT 'ORDER BY cp.display_order;'
PRINT ''
PRINT '-- View audit log:'
PRINT 'SELECT * FROM auditoria_cambios_premios'
PRINT 'WHERE change_type = ''AUTO_CREATE'''
PRINT 'ORDER BY changed_at DESC;'
PRINT ''
PRINT '================================================================================'

GO

-- =============================================
-- Optional: Verify trigger was created successfully
-- =============================================
IF OBJECT_ID('trg_auto_create_banca_config', 'TR') IS NOT NULL
BEGIN
    PRINT ''
    PRINT '✅ VERIFICATION: Trigger exists and is ready to use'
    PRINT ''

    SELECT
        name AS TriggerName,
        OBJECT_NAME(parent_id) AS TableName,
        type_desc AS TriggerType,
        create_date AS CreatedDate,
        modify_date AS ModifiedDate
    FROM sys.triggers
    WHERE name = 'trg_auto_create_banca_config';
END
ELSE
BEGIN
    PRINT ''
    PRINT '❌ VERIFICATION FAILED: Trigger was not created'
    PRINT 'Please review error messages above'
    PRINT ''
END

GO

-- =============================================
-- Optional: Run a test (comment out if not needed)
-- =============================================
/*
PRINT ''
PRINT '================================================================================'
PRINT 'RUNNING TEST'
PRINT '================================================================================'
PRINT ''

-- Save current banca count
DECLARE @InitialBancaCount INT;
SELECT @InitialBancaCount = COUNT(*) FROM betting_pools;

-- Create test banca
INSERT INTO betting_pools (pool_name, created_by)
VALUES ('TEST_AUTO_CREATE_TRIGGER_' + CAST(GETDATE() AS VARCHAR), 1);

DECLARE @NewBancaId INT = SCOPE_IDENTITY();

-- Verify auto-creation
DECLARE @ConfigCount INT;
SELECT @ConfigCount = COUNT(*)
FROM configuracion_general_banca
WHERE banca_id = @NewBancaId;

IF @ConfigCount = 62
    PRINT CONCAT('✅ TEST PASSED: 62 configurations created for banca_id=', @NewBancaId)
ELSE
    PRINT CONCAT('❌ TEST FAILED: Expected 62, got ', @ConfigCount, ' for banca_id=', @NewBancaId);

-- Clean up test data (optional)
-- DELETE FROM configuracion_general_banca WHERE banca_id = @NewBancaId;
-- DELETE FROM betting_pools WHERE betting_pool_id = @NewBancaId;

PRINT ''
PRINT '================================================================================'
*/

GO

