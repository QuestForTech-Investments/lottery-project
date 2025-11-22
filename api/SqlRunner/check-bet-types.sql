-- Check what bet_types exist
SELECT
  bet_type_id,
  bet_type_code,
  bet_type_name,
  is_active
FROM bet_types
ORDER BY bet_type_id;

-- Check if game_types and bet_types are related
PRINT '';
PRINT 'Checking relationship between game_types and bet_types...';
