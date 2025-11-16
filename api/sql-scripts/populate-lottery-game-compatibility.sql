-- =============================================
-- Poblar Lottery-Game Compatibility
-- Fecha: 2025-10-29
-- Descripción: Asocia loterías con sus game types correspondientes
-- =============================================

PRINT '========================================';
PRINT '  Poblando Lottery-Game Compatibility';
PRINT '========================================';
PRINT '';

-- Verificar cuántas relaciones hay actualmente
DECLARE @CurrentCount INT;
SELECT @CurrentCount = COUNT(*) FROM lottery_game_compatibility;
PRINT 'Relaciones actuales en BD: ' + CAST(@CurrentCount AS VARCHAR(10));
PRINT '';

-- =============================================
-- 1. LOTERÍAS DOMINICANAS → Game Types Dominicanos
-- =============================================
PRINT 'Asociando loterías dominicanas con game types dominicanos...';

-- Loterías dominicanas obtienen: DIRECTO, PALE, TRIPLETA, SUPER_PALE
INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE l.lottery_name IN (
    'La Primera', 'LOTEKA', 'Nacional', 'Gana Mas', 'Lotedom', 'La Suerte',
    'La Chica', 'Diaria', 'Quiniela Pale', 'La Primera 8PM', 'La Suerte 6:00PM',
    'Diaria 11AM', 'Diaria 3PM', 'Diaria 9PM', 'La Real', 'Super Pale',
    'La Fortuna', 'Loto Pool', 'Loto Real', 'Anguila', 'Super Lotto DR'
)
AND gt.game_type_code IN ('DIRECTO', 'PALE', 'TRIPLETA', 'SUPER_PALE');

PRINT '✓ Loterías dominicanas asociadas con DIRECTO, PALE, TRIPLETA, SUPER_PALE';
PRINT '';

-- =============================================
-- 2. LOTERÍAS PICK 2 (Florida, etc) → PICK2 Variants
-- =============================================
PRINT 'Asociando loterías Pick 2 con PICK2 variants...';

INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE l.lottery_name LIKE '%Pick 2%'
AND gt.game_type_code IN ('PICK2', 'PICK2_FRONT', 'PICK2_BACK', 'PICK2_MIDDLE');

PRINT '✓ Loterías Pick 2 asociadas con PICK2 variants';
PRINT '';

-- =============================================
-- 3. LOTERÍAS PICK 3 (Florida, New York, Georgia, etc) → CASH3 Variants
-- =============================================
PRINT 'Asociando loterías Pick 3 con CASH3 variants...';

INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE l.lottery_name LIKE '%Pick 3%'
AND gt.game_type_code IN (
    'CASH3_STRAIGHT',
    'CASH3_BOX',
    'CASH3_FRONT_STRAIGHT',
    'CASH3_FRONT_BOX',
    'CASH3_BACK_STRAIGHT',
    'CASH3_BACK_BOX'
);

PRINT '✓ Loterías Pick 3 asociadas con CASH3 variants';
PRINT '';

-- =============================================
-- 4. LOTERÍAS PICK 4 (Florida, New York, Georgia, etc) → PLAY4 Variants
-- =============================================
PRINT 'Asociando loterías Pick 4 con PLAY4 variants...';

INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE (l.lottery_name LIKE '%Pick 4%' OR l.lottery_name LIKE '%Play 4%')
AND gt.game_type_code IN ('PLAY4_STRAIGHT', 'PLAY4_BOX');

PRINT '✓ Loterías Pick 4 asociadas con PLAY4 variants';
PRINT '';

-- =============================================
-- 5. LOTERÍAS ESPECIALES (King Lottery, Stock, etc)
-- =============================================
PRINT 'Asociando loterías especiales...';

-- King Lottery → DIRECTO, PALE, TRIPLETA
INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE l.lottery_name LIKE '%King Lottery%'
AND gt.game_type_code IN ('DIRECTO', 'PALE', 'TRIPLETA');

-- NY-FL 6x1 → DIRECTO, PALE
INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE l.lottery_name LIKE '%6x1%'
AND gt.game_type_code IN ('DIRECTO', 'PALE');

-- Stock Lotteries → DIRECTO, PALE, TRIPLETA
INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE l.lottery_name LIKE '%Stock%'
AND gt.game_type_code IN ('DIRECTO', 'PALE', 'TRIPLETA');

-- Panama Lottery → PANAMA game type
INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE l.lottery_name LIKE '%Panama%'
AND gt.game_type_code = 'PANAMA';

PRINT '✓ Loterías especiales asociadas';
PRINT '';

-- =============================================
-- 6. LOTERÍAS DEL CARIBE (Jamaica, Trinidad, Barbados, etc)
-- =============================================
PRINT 'Asociando loterías del Caribe...';

INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE (
    l.lottery_name LIKE '%Kingston%' OR
    l.lottery_name LIKE '%Montego%' OR
    l.lottery_name LIKE '%San Juan%' OR
    l.lottery_name LIKE '%Bayamon%' OR
    l.lottery_name LIKE '%Nassau%' OR
    l.lottery_name LIKE '%Freeport%' OR
    l.lottery_name LIKE '%Trinidad%' OR
    l.lottery_name LIKE '%Port of Spain%' OR
    l.lottery_name LIKE '%San Fernando%' OR
    l.lottery_name LIKE '%Bridgetown%' OR
    l.lottery_name LIKE '%Speightstown%' OR
    l.lottery_name LIKE '%Havana%' OR
    l.lottery_name LIKE '%Santiago%'
)
AND gt.game_type_code IN ('DIRECTO', 'PALE', 'TRIPLETA');

PRINT '✓ Loterías del Caribe asociadas con DIRECTO, PALE, TRIPLETA';
PRINT '';

-- =============================================
-- 7. OTROS ESTADOS USA (Texas, Illinois, etc)
-- =============================================
PRINT 'Asociando loterías de otros estados USA...';

INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    gt.game_type_id,
    1 as is_active,
    GETDATE() as created_at,
    GETDATE() as updated_at
FROM lotteries l
CROSS JOIN game_types gt
WHERE (
    l.lottery_name LIKE '%Texas%' OR
    l.lottery_name LIKE '%Illinois%' OR
    l.lottery_name LIKE '%Indiana%' OR
    l.lottery_name LIKE '%New Jersey%' OR
    l.lottery_name LIKE '%Pennsylvania%' OR
    l.lottery_name LIKE '%Virginia%' OR
    l.lottery_name LIKE '%Delaware%' OR
    l.lottery_name LIKE '%North Carolina%' OR
    l.lottery_name LIKE '%Ohio%' OR
    l.lottery_name LIKE '%Chicago%' OR
    l.lottery_name LIKE '%Connecticut%' OR
    l.lottery_name LIKE '%Maryland%' OR
    l.lottery_name LIKE '%South Carolina%' OR
    l.lottery_name LIKE '%Mississippi%' OR
    l.lottery_name LIKE '%Massachusetts%' OR
    l.lottery_name LIKE '%Puerto Rico%'
)
AND l.lottery_name NOT LIKE '%Pick 2%'
AND l.lottery_name NOT LIKE '%Pick 3%'
AND l.lottery_name NOT LIKE '%Pick 4%'
AND gt.game_type_code IN (
    'CASH3_STRAIGHT',
    'CASH3_BOX',
    'CASH3_FRONT_STRAIGHT',
    'CASH3_FRONT_BOX',
    'CASH3_BACK_STRAIGHT',
    'CASH3_BACK_BOX'
);

PRINT '✓ Loterías de otros estados USA asociadas con CASH3 variants';
PRINT '';

-- =============================================
-- 8. Verificación Final
-- =============================================
PRINT '';
PRINT '========================================';
PRINT '  Verificación Final';
PRINT '========================================';

DECLARE @NewCount INT;
SELECT @NewCount = COUNT(*) FROM lottery_game_compatibility;
PRINT 'Relaciones antes: ' + CAST(@CurrentCount AS VARCHAR(10));
PRINT 'Relaciones después: ' + CAST(@NewCount AS VARCHAR(10));
PRINT 'Relaciones agregadas: ' + CAST((@NewCount - @CurrentCount) AS VARCHAR(10));
PRINT '';

-- Mostrar resumen por tipo de lotería
PRINT 'Resumen por tipo de lotería:';
PRINT '';

SELECT
    CASE
        WHEN l.lottery_name IN ('La Primera', 'LOTEKA', 'Nacional', 'Gana Mas', 'Lotedom', 'La Suerte', 'La Chica', 'Diaria')
            THEN 'Dominicanas'
        WHEN l.lottery_name LIKE '%Pick 2%' THEN 'Pick 2'
        WHEN l.lottery_name LIKE '%Pick 3%' THEN 'Pick 3'
        WHEN l.lottery_name LIKE '%Pick 4%' OR l.lottery_name LIKE '%Play 4%' THEN 'Pick 4'
        WHEN l.lottery_name LIKE '%6x1%' THEN '6x1 Especiales'
        WHEN l.lottery_name LIKE '%Stock%' THEN 'Stock'
        WHEN l.lottery_name LIKE '%King%' THEN 'King Lottery'
        ELSE 'Otras'
    END as TipoLoteria,
    COUNT(DISTINCT l.lottery_id) as NumLoterias,
    COUNT(lgc.compatibility_id) as TotalRelaciones,
    AVG(CAST(GameTypesPerLottery.GameTypeCount as FLOAT)) as PromedioGameTypesPorLoteria
FROM lottery_game_compatibility lgc
INNER JOIN lotteries l ON lgc.lottery_id = l.lottery_id
CROSS APPLY (
    SELECT COUNT(*) as GameTypeCount
    FROM lottery_game_compatibility lgc2
    WHERE lgc2.lottery_id = l.lottery_id
) as GameTypesPerLottery
GROUP BY
    CASE
        WHEN l.lottery_name IN ('La Primera', 'LOTEKA', 'Nacional', 'Gana Mas', 'Lotedom', 'La Suerte', 'La Chica', 'Diaria')
            THEN 'Dominicanas'
        WHEN l.lottery_name LIKE '%Pick 2%' THEN 'Pick 2'
        WHEN l.lottery_name LIKE '%Pick 3%' THEN 'Pick 3'
        WHEN l.lottery_name LIKE '%Pick 4%' OR l.lottery_name LIKE '%Play 4%' THEN 'Pick 4'
        WHEN l.lottery_name LIKE '%6x1%' THEN '6x1 Especiales'
        WHEN l.lottery_name LIKE '%Stock%' THEN 'Stock'
        WHEN l.lottery_name LIKE '%King%' THEN 'King Lottery'
        ELSE 'Otras'
    END
ORDER BY NumLoterias DESC;

PRINT '';
PRINT '========================================';
PRINT '  Migración Completada';
PRINT '========================================';
PRINT '';

-- Verificar loterías sin game types asignados
DECLARE @LotteriesWithoutGames INT;
SELECT @LotteriesWithoutGames = COUNT(*)
FROM lotteries l
WHERE NOT EXISTS (
    SELECT 1
    FROM lottery_game_compatibility lgc
    WHERE lgc.lottery_id = l.lottery_id
);

IF @LotteriesWithoutGames > 0
BEGIN
    PRINT '⚠️  Hay ' + CAST(@LotteriesWithoutGames AS VARCHAR(10)) + ' loterías sin game types asignados:';
    PRINT '';

    SELECT
        lottery_id,
        lottery_name,
        lottery_type
    FROM lotteries l
    WHERE NOT EXISTS (
        SELECT 1
        FROM lottery_game_compatibility lgc
        WHERE lgc.lottery_id = l.lottery_id
    )
    ORDER BY lottery_id;
END
ELSE
BEGIN
    PRINT '✅ Todas las loterías tienen game types asignados';
END

PRINT '';
