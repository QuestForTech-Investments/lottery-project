-- Check all game_types to map bet_type_id correctly
SELECT
  game_type_id,
  game_type_code,
  game_name,
  number_length
FROM game_types
ORDER BY game_type_id;
