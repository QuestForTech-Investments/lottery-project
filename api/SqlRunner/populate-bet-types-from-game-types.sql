-- ============================================
-- POBLAR BET_TYPES CON TODOS LOS GAME_TYPES
-- ============================================

PRINT 'Poblando bet_types con todos los tipos de juego...';
PRINT '';

-- Mostrar estado actual
PRINT 'Estado ANTES:';
SELECT COUNT(*) AS bet_types_count FROM bet_types;
SELECT COUNT(*) AS game_types_count FROM game_types;
PRINT '';

-- Habilitar inserción de IDs específicos
SET IDENTITY_INSERT bet_types ON;

-- Insertar todos los game_types que NO existen en bet_types
INSERT INTO bet_types (bet_type_id, bet_type_code, bet_type_name, description, is_active, created_at)
SELECT
  game_type_id AS bet_type_id,
  game_type_code AS bet_type_code,
  game_name AS bet_type_name,
  description,
  is_active,
  GETDATE() AS created_at
FROM game_types
WHERE game_type_id NOT IN (SELECT bet_type_id FROM bet_types);

-- Deshabilitar inserción de IDs específicos
SET IDENTITY_INSERT bet_types OFF;

PRINT '';
PRINT 'Estado DESPUÉS:';
SELECT COUNT(*) AS bet_types_count FROM bet_types;

PRINT '';
PRINT '✅ bet_types poblado exitosamente con todos los tipos de juego!';
PRINT '';

-- Mostrar todos los bet_types
PRINT 'Tipos de apuesta disponibles:';
SELECT
  bet_type_id,
  bet_type_code,
  bet_type_name,
  is_active
FROM bet_types
ORDER BY bet_type_id;
