-- =============================================
-- Agregar IDENTITY a lottery_game_compatibility
-- Fecha: 2025-10-29
-- Descripción: Convierte compatibility_id en campo IDENTITY auto-incremental
-- =============================================

PRINT '========================================';
PRINT '  Agregando IDENTITY a lottery_game_compatibility';
PRINT '========================================';
PRINT '';

-- Verificar si ya tiene IDENTITY
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('lottery_game_compatibility')
    AND name = 'compatibility_id'
    AND is_identity = 1
)
BEGIN
    PRINT '✓ La tabla lottery_game_compatibility ya tiene IDENTITY en compatibility_id';
    PRINT 'No se requieren cambios.';
END
ELSE
BEGIN
    PRINT 'Iniciando migración...';
    PRINT '';

    -- 1. Crear tabla temporal con la estructura correcta (con IDENTITY)
    PRINT 'Paso 1: Creando tabla temporal...';
    CREATE TABLE lottery_game_compatibility_temp (
        compatibility_id INT IDENTITY(1,1) PRIMARY KEY,
        lottery_id INT NOT NULL,
        game_type_id INT NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
        FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id)
    );
    PRINT '✓ Tabla temporal creada';
    PRINT '';

    -- 2. Copiar datos existentes (si los hay)
    PRINT 'Paso 2: Copiando datos existentes...';
    IF EXISTS (SELECT 1 FROM lottery_game_compatibility)
    BEGIN
        SET IDENTITY_INSERT lottery_game_compatibility_temp ON;

        INSERT INTO lottery_game_compatibility_temp (
            compatibility_id, lottery_id, game_type_id, is_active, created_at, updated_at
        )
        SELECT
            compatibility_id, lottery_id, game_type_id, is_active, created_at, updated_at
        FROM lottery_game_compatibility;

        SET IDENTITY_INSERT lottery_game_compatibility_temp OFF;

        DECLARE @RowCount INT = @@ROWCOUNT;
        PRINT '✓ Copiados ' + CAST(@RowCount AS VARCHAR(10)) + ' registros';
    END
    ELSE
    BEGIN
        PRINT '✓ No hay datos para copiar (tabla vacía)';
    END
    PRINT '';

    -- 3. Eliminar tabla original
    PRINT 'Paso 3: Eliminando tabla original...';
    DROP TABLE lottery_game_compatibility;
    PRINT '✓ Tabla original eliminada';
    PRINT '';

    -- 4. Renombrar tabla temporal
    PRINT 'Paso 4: Renombrando tabla temporal...';
    EXEC sp_rename 'lottery_game_compatibility_temp', 'lottery_game_compatibility';
    PRINT '✓ Tabla renombrada correctamente';
    PRINT '';

    PRINT '========================================';
    PRINT '  ✅ Migración Completada Exitosamente';
    PRINT '========================================';
    PRINT '';
    PRINT 'lottery_game_compatibility ahora tiene IDENTITY(1,1) en compatibility_id';
    PRINT '';
END

-- Verificación final
SELECT
    c.name AS ColumnName,
    c.is_identity AS HasIdentity,
    IDENT_SEED('lottery_game_compatibility') AS IdentitySeed,
    IDENT_INCR('lottery_game_compatibility') AS IdentityIncrement
FROM sys.columns c
WHERE c.object_id = OBJECT_ID('lottery_game_compatibility')
AND c.name = 'compatibility_id';
