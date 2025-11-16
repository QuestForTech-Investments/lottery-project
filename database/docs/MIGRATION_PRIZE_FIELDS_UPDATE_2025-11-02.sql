-- ============================================
-- LOTTERY DATABASE - PRIZE FIELDS UPDATE MIGRATION
-- Generated: 2025-11-02
-- Purpose: Update bet types and prize fields with correct values
-- ============================================
-- Server: lottery-sql-1505.database.windows.net
-- Database: lottery-db
-- ============================================

USE [lottery-db];
GO

PRINT '========================================';
PRINT 'Starting Prize Fields Update Migration';
PRINT '========================================';
GO

-- ============================================
-- STEP 1: Temporarily disable triggers
-- ============================================
PRINT 'Step 1: Disabling triggers...';

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_tipos_apuesta_updated_at')
BEGIN
    DISABLE TRIGGER trg_tipos_apuesta_updated_at ON bet_types;
    PRINT '  ✓ Disabled bet_types trigger';
END

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_campos_premio_updated_at')
BEGIN
    DISABLE TRIGGER trg_campos_premio_updated_at ON prize_fields;
    PRINT '  ✓ Disabled prize_fields trigger';
END
GO

-- ============================================
-- STEP 2: Update Bet Types
-- ============================================
PRINT 'Step 2: Updating bet types...';

-- Fix naming: PALÉ uses accent (Pal**é**)
UPDATE bet_types SET bet_type_code = 'PALÉ', bet_type_name = 'Palé' WHERE bet_type_code = 'PALE';
PRINT '  ✓ Updated PALE → PALÉ';

-- Add missing bet types if they don't exist
IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'CASH3 STRAIGHT')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('CASH3 STRAIGHT', 'Cash3 Straight', 'Three digits in exact order (Cash3)', 20, 1);
    PRINT '  ✓ Added CASH3 STRAIGHT';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'CASH3 BOX')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('CASH3 BOX', 'Cash3 Box', 'Three digits in any order (Cash3)', 21, 1);
    PRINT '  ✓ Added CASH3 BOX';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'CASH3 FRONT STRAIGHT')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('CASH3 FRONT STRAIGHT', 'Cash3 Front Straight', 'First three digits in exact order (Cash3)', 22, 1);
    PRINT '  ✓ Added CASH3 FRONT STRAIGHT';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'CASH3 BACK STRAIGHT')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('CASH3 BACK STRAIGHT', 'Cash3 Back Straight', 'Last three digits in exact order (Cash3)', 23, 1);
    PRINT '  ✓ Added CASH3 BACK STRAIGHT';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'CASH3 FRONT BOX')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('CASH3 FRONT BOX', 'Cash3 Front Box', 'First three digits in any order (Cash3)', 24, 1);
    PRINT '  ✓ Added CASH3 FRONT BOX';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'CASH3 BACK BOX')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('CASH3 BACK BOX', 'Cash3 Back Box', 'Last three digits in any order (Cash3)', 25, 1);
    PRINT '  ✓ Added CASH3 BACK BOX';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'PLAY4 STRAIGHT')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('PLAY4 STRAIGHT', 'Play4 Straight', 'Four digits in exact order (Play4)', 26, 1);
    PRINT '  ✓ Added PLAY4 STRAIGHT';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'PLAY4 BOX')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('PLAY4 BOX', 'Play4 Box', 'Four digits in any order (Play4)', 27, 1);
    PRINT '  ✓ Added PLAY4 BOX';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'BOLITA 1')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('BOLITA 1', 'Bolita 1', 'Bolita game type 1', 28, 1);
    PRINT '  ✓ Added BOLITA 1';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'BOLITA 2')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('BOLITA 2', 'Bolita 2', 'Bolita game type 2', 29, 1);
    PRINT '  ✓ Added BOLITA 2';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'SINGULACIÓN 1')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('SINGULACIÓN 1', 'Singulación 1', 'Singulation game type 1', 30, 1);
    PRINT '  ✓ Added SINGULACIÓN 1';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'SINGULACIÓN 2')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('SINGULACIÓN 2', 'Singulación 2', 'Singulation game type 2', 31, 1);
    PRINT '  ✓ Added SINGULACIÓN 2';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'SINGULACIÓN 3')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('SINGULACIÓN 3', 'Singulación 3', 'Singulation game type 3', 32, 1);
    PRINT '  ✓ Added SINGULACIÓN 3';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'PICK5 STRAIGHT')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('PICK5 STRAIGHT', 'Pick5 Straight', 'Five digits in exact order', 33, 1);
    PRINT '  ✓ Added PICK5 STRAIGHT';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'PICK5 BOX')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('PICK5 BOX', 'Pick5 Box', 'Five digits in any order', 34, 1);
    PRINT '  ✓ Added PICK5 BOX';
END

IF NOT EXISTS (SELECT * FROM bet_types WHERE bet_type_code = 'PICK TWO')
BEGIN
    INSERT INTO bet_types (bet_type_code, bet_type_name, description, display_order, is_active)
    VALUES ('PICK TWO', 'Pick Two', 'Two digits exact order (generic)', 35, 1);
    PRINT '  ✓ Added PICK TWO';
END
GO

-- ============================================
-- STEP 3: Update Prize Fields with Correct Values
-- ============================================
PRINT 'Step 3: Updating prize fields...';
PRINT 'Step 3a: DIRECTO fields...';

-- DIRECTO (bet_type_id will be determined dynamically)
DECLARE @BetTypeId INT;

-- DIRECTO
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'DIRECTO';
UPDATE prize_fields SET field_name = 'Directo - Primer Pago', default_multiplier = 56.00 WHERE bet_type_id = @BetTypeId AND field_code = 'DIRECTO_PRIMER_PAGO';
UPDATE prize_fields SET field_name = 'Directo - Segundo Pago', default_multiplier = 12.00 WHERE bet_type_id = @BetTypeId AND field_code = 'DIRECTO_SEGUNDO_PAGO';
UPDATE prize_fields SET field_name = 'Directo - Tercer Pago', default_multiplier = 4.00 WHERE bet_type_id = @BetTypeId AND field_code = 'DIRECTO_TERCER_PAGO';
UPDATE prize_fields SET field_name = 'Directo - Dobles', default_multiplier = 56.00 WHERE bet_type_id = @BetTypeId AND field_code = 'DIRECTO_DOBLES';
PRINT '  ✓ Updated 4 DIRECTO fields';

-- PALÉ
PRINT 'Step 3b: PALÉ fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PALÉ';
UPDATE prize_fields SET field_name = 'Pale - Todos en secuencia', default_multiplier = 1100.00 WHERE bet_type_id = @BetTypeId AND field_code = 'PALE_TODOS_EN_SECUENCIA';
UPDATE prize_fields SET field_name = 'Pale - Primer Pago', default_multiplier = 1100.00 WHERE bet_type_id = @BetTypeId AND field_code = 'PALE_PRIMER_PAGO';
UPDATE prize_fields SET field_name = 'Pale - Segundo Pago', default_multiplier = 1100.00 WHERE bet_type_id = @BetTypeId AND field_code = 'PALE_SEGUNDO_PAGO';
UPDATE prize_fields SET field_name = 'Pale - Tercer Pago', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code = 'PALE_TERCER_PAGO';
PRINT '  ✓ Updated 4 PALÉ fields';

-- TRIPLETA
PRINT 'Step 3c: TRIPLETA fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'TRIPLETA';
UPDATE prize_fields SET field_name = 'Tripleta - Primer Pago', default_multiplier = 10000.00 WHERE bet_type_id = @BetTypeId AND field_code = 'TRIPLETA_PRIMER_PAGO';
UPDATE prize_fields SET field_name = 'Tripleta - Segundo Pago', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code = 'TRIPLETA_SEGUNDO_PAGO';
PRINT '  ✓ Updated 2 TRIPLETA fields';

-- SUPER PALÉ
PRINT 'Step 3d: SUPER PALÉ fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'SUPER_PALE' OR bet_type_code = 'SUPER PALÉ';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Super Pale - Primer Pago', default_multiplier = 2000.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%SUPER%PAGO%';
    PRINT '  ✓ Updated SUPER PALÉ field';
END

-- PICK TWO FRONT
PRINT 'Step 3e: PICK TWO FRONT fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PICK TWO FRONT' OR bet_type_code = 'PICK_TWO_FRONT';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Pick Two Front - Primer Pago', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO';
    UPDATE prize_fields SET field_name = 'Pick Two Front - Dobles', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%DOBLES';
    PRINT '  ✓ Updated 2 PICK TWO FRONT fields';
END

-- PICK TWO BACK
PRINT 'Step 3f: PICK TWO BACK fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PICK TWO BACK' OR bet_type_code = 'PICK_TWO_BACK';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Pick Two Back - Primer Pago', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO';
    UPDATE prize_fields SET field_name = 'Pick Two Back - Dobles', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%DOBLES';
    PRINT '  ✓ Updated 2 PICK TWO BACK fields';
END

-- PICK TWO MIDDLE
PRINT 'Step 3g: PICK TWO MIDDLE fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PICK TWO MIDDLE' OR bet_type_code = 'PICK_TWO_MIDDLE';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Pick Two Middle - Primer Pago', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO';
    UPDATE prize_fields SET field_name = 'Pick Two Middle - Dobles', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%DOBLES';
    PRINT '  ✓ Updated 2 PICK TWO MIDDLE fields';
END

-- CASH3 STRAIGHT
PRINT 'Step 3h: CASH3 STRAIGHT fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'CASH3 STRAIGHT';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Cash3 Straight - Todos en secuencia', default_multiplier = 600.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%SECUENCIA%';
    UPDATE prize_fields SET field_name = 'Cash3 Straight - Triples', default_multiplier = 600.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%TRIPLES%';
    PRINT '  ✓ Updated CASH3 STRAIGHT fields';
END

-- CASH3 BOX
PRINT 'Step 3i: CASH3 BOX fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'CASH3 BOX';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Cash3 Box - 3-Way: 2 idénticos', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%3WAY%';
    UPDATE prize_fields SET field_name = 'Cash3 Box - 6-Way: 3 únicos', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%6WAY%';
    PRINT '  ✓ Updated CASH3 BOX fields';
END

-- CASH3 FRONT STRAIGHT
PRINT 'Step 3j: CASH3 FRONT STRAIGHT fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'CASH3 FRONT STRAIGHT';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Cash3 Front Straight - Todos en secuencia', default_multiplier = 600.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%SECUENCIA%';
    UPDATE prize_fields SET field_name = 'Cash3 Front Straight - Triples', default_multiplier = 600.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%TRIPLES%';
    PRINT '  ✓ Updated CASH3 FRONT STRAIGHT fields';
END

-- CASH3 BACK STRAIGHT
PRINT 'Step 3k: CASH3 BACK STRAIGHT fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'CASH3 BACK STRAIGHT';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Cash3 Back Straight - Todos en secuencia', default_multiplier = 600.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%SECUENCIA%';
    UPDATE prize_fields SET field_name = 'Cash3 Back Straight - Triples', default_multiplier = 600.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%TRIPLES%';
    PRINT '  ✓ Updated CASH3 BACK STRAIGHT fields';
END

-- PLAY4 STRAIGHT
PRINT 'Step 3l: PLAY4 STRAIGHT fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PLAY4 STRAIGHT';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Play4 Straight - Todos en secuencia', default_multiplier = 5000.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%SECUENCIA%';
    UPDATE prize_fields SET field_name = 'Play4 Straight - Dobles', default_multiplier = 5000.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%DOBLES%';
    PRINT '  ✓ Updated PLAY4 STRAIGHT fields';
END

-- PLAY4 BOX
PRINT 'Step 3m: PLAY4 BOX fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PLAY4 BOX';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Play4 Box - 24-Way: 4 únicos', default_multiplier = 200.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%24WAY%';
    UPDATE prize_fields SET field_name = 'Play4 Box - 12-Way: 2 idénticos', default_multiplier = 200.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%12WAY%';
    UPDATE prize_fields SET field_name = 'Play4 Box - 6-Way: 2 idénticos', default_multiplier = 200.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%6WAY%';
    UPDATE prize_fields SET field_name = 'Play4 Box - 4-Way: 3 idénticos', default_multiplier = 200.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%4WAY%';
    PRINT '  ✓ Updated PLAY4 BOX fields';
END

-- BOLITA 1
PRINT 'Step 3n: BOLITA fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'BOLITA 1';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Bolita 1 - Primer Pago', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO%';
    PRINT '  ✓ Updated BOLITA 1 field';
END

-- BOLITA 2
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'BOLITA 2';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Bolita 2 - Primer Pago', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO%';
    PRINT '  ✓ Updated BOLITA 2 field';
END

-- SINGULACIÓN 1, 2, 3
PRINT 'Step 3o: SINGULACIÓN fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'SINGULACIÓN 1';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Singulación 1 - Primer Pago', default_multiplier = 9.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO%';
    PRINT '  ✓ Updated SINGULACIÓN 1 field';
END

SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'SINGULACIÓN 2';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Singulación 2 - Primer Pago', default_multiplier = 9.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO%';
    PRINT '  ✓ Updated SINGULACIÓN 2 field';
END

SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'SINGULACIÓN 3';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Singulación 3 - Primer Pago', default_multiplier = 9.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO%';
    PRINT '  ✓ Updated SINGULACIÓN 3 field';
END

-- PICK5 STRAIGHT
PRINT 'Step 3p: PICK5 STRAIGHT fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PICK5 STRAIGHT';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Pick5 Straight - Todos en secuencia', default_multiplier = 30000.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%SECUENCIA%';
    UPDATE prize_fields SET field_name = 'Pick5 Straight - Dobles', default_multiplier = 30000.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%DOBLES%';
    PRINT '  ✓ Updated PICK5 STRAIGHT fields';
END

-- PICK5 BOX
PRINT 'Step 3q: PICK5 BOX fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PICK5 BOX';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Pick5 Box - 5-Way: 4 idénticos', default_multiplier = 10000.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%5WAY%';
    UPDATE prize_fields SET field_name = 'Pick5 Box - 10-Way: 3 idénticos', default_multiplier = 5000.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%10WAY%';
    UPDATE prize_fields SET field_name = 'Pick5 Box - 20-Way: 3 idénticos', default_multiplier = 2500.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%20WAY%';
    UPDATE prize_fields SET field_name = 'Pick5 Box - 30-Way: 2 idénticos', default_multiplier = 1660.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%30WAY%';
    UPDATE prize_fields SET field_name = 'Pick5 Box - 60-Way: 2 idénticos', default_multiplier = 830.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%60WAY%';
    UPDATE prize_fields SET field_name = 'Pick5 Box - 120-Way: 5 únicos', default_multiplier = 416.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%120WAY%';
    PRINT '  ✓ Updated PICK5 BOX fields';
END

-- PICK TWO (generic)
PRINT 'Step 3r: PICK TWO fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'PICK TWO';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Pick Two - Primer Pago', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%PRIMER_PAGO%';
    UPDATE prize_fields SET field_name = 'Pick Two - Dobles', default_multiplier = 75.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%DOBLES%';
    PRINT '  ✓ Updated PICK TWO fields';
END

-- CASH3 FRONT BOX
PRINT 'Step 3s: CASH3 FRONT BOX fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'CASH3 FRONT BOX';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Cash3 Front Box - 3-Way: 2 idénticos', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%3WAY%';
    UPDATE prize_fields SET field_name = 'Cash3 Front Box - 6-Way: 3 únicos', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%6WAY%';
    PRINT '  ✓ Updated CASH3 FRONT BOX fields';
END

-- CASH3 BACK BOX
PRINT 'Step 3t: CASH3 BACK BOX fields...';
SELECT @BetTypeId = bet_type_id FROM bet_types WHERE bet_type_code = 'CASH3 BACK BOX';
IF @BetTypeId IS NOT NULL
BEGIN
    UPDATE prize_fields SET field_name = 'Cash3 Back Box - 3-Way: 2 idénticos', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%3WAY%';
    UPDATE prize_fields SET field_name = 'Cash3 Back Box - 6-Way: 3 únicos', default_multiplier = 100.00 WHERE bet_type_id = @BetTypeId AND field_code LIKE '%6WAY%';
    PRINT '  ✓ Updated CASH3 BACK BOX fields';
END

PRINT '  ✓ All prize fields updated successfully';
GO

-- ============================================
-- STEP 4: Re-enable triggers
-- ============================================
PRINT 'Step 4: Re-enabling triggers...';

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_tipos_apuesta_updated_at')
BEGIN
    ENABLE TRIGGER trg_tipos_apuesta_updated_at ON bet_types;
    PRINT '  ✓ Enabled bet_types trigger';
END

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_campos_premio_updated_at')
BEGIN
    ENABLE TRIGGER trg_campos_premio_updated_at ON prize_fields;
    PRINT '  ✓ Enabled prize_fields trigger';
END
GO

-- ============================================
-- STEP 5: Verification
-- ============================================
PRINT 'Step 5: Verification...';

SELECT
    'Bet Types' AS TableName,
    COUNT(*) AS TotalRecords,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS ActiveRecords
FROM bet_types

UNION ALL

SELECT
    'Prize Fields' AS TableName,
    COUNT(*) AS TotalRecords,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS ActiveRecords
FROM prize_fields;

PRINT '';
PRINT '========================================';
PRINT 'Migration completed successfully!';
PRINT '========================================';
GO
