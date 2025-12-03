-- ============================================
-- Script para poblar draw_game_compatibility
-- Basado en análisis de la aplicación original Vue.js
-- ============================================
-- Game Types Reference:
-- 1: DIRECTO (2 dígitos)
-- 2: PALE (4 dígitos)
-- 3: TRIPLETA (6 dígitos)
-- 4: CASH3_STRAIGHT
-- 5: CASH3_BOX
-- 6: CASH3_FRONT_STRAIGHT
-- 7: CASH3_FRONT_BOX
-- 8: CASH3_BACK_STRAIGHT
-- 9: CASH3_BACK_BOX
-- 10: PLAY4_STRAIGHT
-- 11: PLAY4_BOX
-- 12: PICK5_STRAIGHT
-- 13: PICK5_BOX
-- 14: SUPER_PALE
-- 15: PICK2
-- 16: PICK2_FRONT
-- 17: PICK2_BACK
-- 18: PICK2_MIDDLE
-- 19: BOLITA
-- 20: SINGULACION
-- 21: PANAMA
-- ============================================

-- Limpiar tabla antes de poblar
DELETE FROM draw_game_compatibility;
DBCC CHECKIDENT ('draw_game_compatibility', RESEED, 0);

-- ============================================
-- CATEGORÍA: DOMINICANOS (BASIC: 1, 2, 3)
-- ============================================

-- Lotería Nacional Dominicana
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('NACIONAL')
  AND gt.game_type_id IN (1, 2, 3);

-- La Primera
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('LA PRIMERA', 'LA PRIMERA 8PM')
  AND gt.game_type_id IN (1, 2, 3);

-- Gana Más
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('GANA MAS')
  AND gt.game_type_id IN (1, 2, 3);

-- La Suerte
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('LA SUERTE', 'LA SUERTE 6:00pm')
  AND gt.game_type_id IN (1, 2, 3);

-- Loteka
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('LOTEKA')
  AND gt.game_type_id IN (1, 2, 3);

-- Lotedom
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('LOTEDOM')
  AND gt.game_type_id IN (1, 2, 3);

-- La Chica
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('LA CHICA')
  AND gt.game_type_id IN (1, 2, 3);

-- Real
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('REAL')
  AND gt.game_type_id IN (1, 2, 3);

-- Quiniela Pale
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('QUINIELA PALE')
  AND gt.game_type_id IN (1, 2, 3);

-- Puerto Rico
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('L.E. PUERTO RICO 2PM', 'L.E. PUERTO RICO 10PM')
  AND gt.game_type_id IN (1, 2, 3);

-- ============================================
-- CATEGORÍA: NICARAGUA (BASIC: 1, 2, 3)
-- ============================================
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('DIARIA 11AM', 'DIARIA 3PM', 'DIARIA 9PM')
  AND gt.game_type_id IN (1, 2, 3);

-- ============================================
-- CATEGORÍA: ANGUILA (BASIC: 1, 2, 3)
-- ============================================
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('Anguila 10am', 'Anguila 1pm', 'Anguila 6PM', 'Anguila 9pm')
  AND gt.game_type_id IN (1, 2, 3);

-- ============================================
-- CATEGORÍA: KING LOTTERY (BASIC: 1, 2, 3)
-- ============================================
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('King Lottery AM', 'King Lottery PM')
  AND gt.game_type_id IN (1, 2, 3);

-- ============================================
-- CATEGORÍA: USA (BASIC + USA: 1-13, 15-20)
-- Todos los tipos excepto SUPER_PALE (14) y PANAMA (21)
-- ============================================

-- New York
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('NEW YORK DAY', 'NEW YORK NIGHT')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Florida
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('FLORIDA AM', 'FLORIDA PM', 'FL PICK2 AM', 'FL PICK2 PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Georgia
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('GEORGIA-MID AM', 'GEORGIA EVENING', 'GEORGIA NIGHT')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- New Jersey
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('NEW JERSEY AM', 'NEW JERSEY PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Connecticut
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('CONNECTICUT AM', 'CONNECTICUT PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- California
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('CALIFORNIA AM', 'CALIFORNIA PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Chicago
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('CHICAGO AM', 'CHICAGO PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Pennsylvania
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('PENN MIDDAY', 'PENN EVENING')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Indiana
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('INDIANA MIDDAY', 'INDIANA EVENING')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Texas
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('TEXAS MORNING', 'TEXAS DAY', 'TEXAS EVENING', 'TEXAS NIGHT')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Virginia
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('VIRGINIA AM', 'VIRGINIA PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- South Carolina
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('SOUTH CAROLINA AM', 'SOUTH CAROLINA PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Maryland
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('MARYLAND MIDDAY', 'MARYLAND EVENING')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Massachusetts
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('MASS AM', 'MASS PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- North Carolina
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('NORTH CAROLINA AM', 'NORTH CAROLINA PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- Delaware
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('DELAWARE AM', 'DELAWARE PM')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- NY/FL 6x1 (USA lotteries)
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('NY AM 6x1', 'NY PM 6x1', 'FL AM 6X1', 'FL PM 6X1')
  AND gt.game_type_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20);

-- ============================================
-- CATEGORÍA: SUPER PALE (solo 14)
-- ============================================
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('SUPER PALE TARDE', 'SUPER PALE NOCHE', 'SUPER PALE NY-FL AM', 'SUPER PALE NY-FL PM')
  AND gt.game_type_id IN (14);

-- ============================================
-- CATEGORÍA: PANAMA (BASIC + PANAMA: 1, 2, 3, 21)
-- ============================================
INSERT INTO draw_game_compatibility (draw_id, game_type_id, is_active)
SELECT d.draw_id, gt.game_type_id, 1
FROM draws d
CROSS JOIN game_types gt
WHERE d.draw_name IN ('PANAMA MIERCOLES', 'PANAMA DOMINGO')
  AND gt.game_type_id IN (1, 2, 3, 21);

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT
    d.draw_name,
    COUNT(dgc.game_type_id) as game_type_count,
    STRING_AGG(gt.game_type_code, ', ') WITHIN GROUP (ORDER BY gt.game_type_id) as game_types
FROM draws d
LEFT JOIN draw_game_compatibility dgc ON d.draw_id = dgc.draw_id
LEFT JOIN game_types gt ON dgc.game_type_id = gt.game_type_id
GROUP BY d.draw_id, d.draw_name
ORDER BY d.draw_name;
