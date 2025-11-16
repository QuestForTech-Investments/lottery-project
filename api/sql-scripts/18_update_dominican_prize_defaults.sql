-- ============================================================================
-- Script: Update Dominican Lottery Prize Field Defaults
-- Description: Updates default prize values for Dominican lottery types
--              (DIRECTO, PALE, TRIPLETA) based on standard Dominican configuration
-- Date: 2025-10-31
-- ============================================================================

USE [lottery-db];
GO

PRINT 'Starting Dominican prize field defaults update...';
GO

-- ============================================================================
-- DIRECTO - Dominican Configuration
-- ============================================================================

-- Primer Pago: 56
UPDATE dbo.prize_fields
SET default_multiplier = 56.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'DIRECTO_PRIMER_PAGO';

-- Segundo Pago: 12
UPDATE dbo.prize_fields
SET default_multiplier = 12.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'DIRECTO_SEGUNDO_PAGO';

-- Tercer Pago: 4
UPDATE dbo.prize_fields
SET default_multiplier = 4.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'DIRECTO_TERCER_PAGO';

-- Dobles: 56
UPDATE dbo.prize_fields
SET default_multiplier = 56.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'DIRECTO_DOBLES';

PRINT 'DIRECTO values updated';
GO

-- ============================================================================
-- PALE - Dominican Configuration
-- ============================================================================

-- Todos en secuencia: 1200
UPDATE dbo.prize_fields
SET default_multiplier = 1200.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'PALE_TODOS_SECUENCIA';

-- Primer Pago: 1200
UPDATE dbo.prize_fields
SET default_multiplier = 1200.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'PALE_PRIMER_PAGO';

-- Segundo Pago: 1200
UPDATE dbo.prize_fields
SET default_multiplier = 1200.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'PALE_SEGUNDO_PAGO';

-- Tercer Pago: 200
UPDATE dbo.prize_fields
SET default_multiplier = 200.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'PALE_TERCER_PAGO';

PRINT 'PALE values updated';
GO

-- ============================================================================
-- TRIPLETA - Dominican Configuration
-- ============================================================================

-- Primer Pago: 10000
UPDATE dbo.prize_fields
SET default_multiplier = 10000.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'TRIPLETA_PRIMER_PAGO';

-- Segundo Pago: 100
UPDATE dbo.prize_fields
SET default_multiplier = 100.00,
    updated_at = GETUTCDATE()
WHERE field_code = 'TRIPLETA_SEGUNDO_PAGO';

PRINT 'TRIPLETA values updated';
GO

-- ============================================================================
-- Verification Query
-- ============================================================================

PRINT 'Verification of updated values:';
GO

SELECT
    bt.bet_type_name,
    pf.field_code,
    pf.field_name,
    pf.default_multiplier,
    pf.updated_at
FROM dbo.prize_fields pf
INNER JOIN dbo.bet_types bt ON pf.bet_type_id = bt.bet_type_id
WHERE bt.bet_type_name IN ('DIRECTO', 'PALE', 'TRIPLETA')
ORDER BY bt.bet_type_name, pf.field_code;
GO

PRINT 'Dominican prize field defaults update completed successfully!';
GO
