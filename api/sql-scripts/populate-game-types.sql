-- =============================================
-- Poblar Tipos de Juegos (Game Types)
-- Fecha: 2025-10-29
-- Descripción: Agrega los 4 tipos de juegos principales del sistema de loterías
-- =============================================

PRINT '========================================';
PRINT '  Poblando Tipos de Juegos';
PRINT '========================================';
PRINT '';

-- Verificar cuántos game types hay actualmente
DECLARE @CurrentCount INT;
SELECT @CurrentCount = COUNT(*) FROM game_types;
PRINT 'Game types actuales en BD: ' + CAST(@CurrentCount AS VARCHAR(10));
PRINT '';

-- =============================================
-- 1. PALE - Apuesta de 2 dígitos
-- =============================================
PRINT 'Agregando: PALE (2 dígitos)...';
INSERT INTO game_types (
    game_type_id,
    game_type_code,
    game_name,
    prize_multiplier,
    number_length,
    requires_additional_number,
    display_order,
    is_active,
    created_at,
    updated_at
)
VALUES (
    1,
    'PALE',
    'Pale',
    60.00,
    2,
    0,
    1,
    1,
    GETDATE(),
    GETDATE()
);
PRINT '✓ PALE agregado (ID: 1, Multiplicador: 60x)';
PRINT '';

-- =============================================
-- 2. TRIPLETA - Apuesta de 3 dígitos
-- =============================================
PRINT 'Agregando: TRIPLETA (3 dígitos)...';
INSERT INTO game_types (
    game_type_id,
    game_type_code,
    game_name,
    prize_multiplier,
    number_length,
    requires_additional_number,
    display_order,
    is_active,
    created_at,
    updated_at
)
VALUES (
    2,
    'TRIPLETA',
    'Tripleta',
    500.00,
    3,
    0,
    2,
    1,
    GETDATE(),
    GETDATE()
);
PRINT '✓ TRIPLETA agregada (ID: 2, Multiplicador: 500x)';
PRINT '';

-- =============================================
-- 3. QUINIELA - Apuesta de 4 dígitos
-- =============================================
PRINT 'Agregando: QUINIELA (4 dígitos)...';
INSERT INTO game_types (
    game_type_id,
    game_type_code,
    game_name,
    prize_multiplier,
    number_length,
    requires_additional_number,
    display_order,
    is_active,
    created_at,
    updated_at
)
VALUES (
    3,
    'QUINIELA',
    'Quiniela',
    3500.00,
    4,
    0,
    3,
    1,
    GETDATE(),
    GETDATE()
);
PRINT '✓ QUINIELA agregada (ID: 3, Multiplicador: 3500x)';
PRINT '';

-- =============================================
-- 4. SUPER PALE - Variante especial de Pale
-- =============================================
PRINT 'Agregando: SUPER PALE (2 dígitos especial)...';
INSERT INTO game_types (
    game_type_id,
    game_type_code,
    game_name,
    prize_multiplier,
    number_length,
    requires_additional_number,
    display_order,
    is_active,
    created_at,
    updated_at
)
VALUES (
    4,
    'SUPER_PALE',
    'Super Pale',
    75.00,
    2,
    0,
    4,
    1,
    GETDATE(),
    GETDATE()
);
PRINT '✓ SUPER PALE agregado (ID: 4, Multiplicador: 75x)';
PRINT '';

-- =============================================
-- Verificación Final
-- =============================================
PRINT '';
PRINT '========================================';
PRINT '  Verificación Final';
PRINT '========================================';

DECLARE @NewCount INT;
SELECT @NewCount = COUNT(*) FROM game_types;
PRINT 'Game types antes: ' + CAST(@CurrentCount AS VARCHAR(10));
PRINT 'Game types después: ' + CAST(@NewCount AS VARCHAR(10));
PRINT 'Game types agregados: ' + CAST((@NewCount - @CurrentCount) AS VARCHAR(10));
PRINT '';

IF @NewCount >= 4
BEGIN
    PRINT '✅ ÉXITO: Base de datos tiene los 4 tipos de juegos esperados';
END
ELSE
BEGIN
    PRINT '⚠️  Base de datos tiene ' + CAST(@NewCount AS VARCHAR(10)) + ' game types';
    PRINT '   Se esperan 4 tipos de juegos';
END

PRINT '';
PRINT '========================================';
PRINT '  Migración Completada';
PRINT '========================================';
PRINT '';

-- Mostrar todos los game types agregados
PRINT 'Tipos de juegos disponibles:';
PRINT '';
SELECT
    game_type_id as ID,
    game_type_code as Código,
    game_name as Nombre,
    prize_multiplier as Multiplicador,
    number_length as Dígitos,
    display_order as Orden,
    is_active as Activo
FROM game_types
ORDER BY display_order;
