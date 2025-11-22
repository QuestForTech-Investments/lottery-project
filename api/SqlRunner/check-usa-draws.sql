-- Identificar sorteos USA
PRINT 'Buscando sorteos de USA...';
PRINT '';

-- Buscar por nombres conocidos de USA
SELECT
  d.draw_id,
  d.draw_code,
  d.draw_name,
  l.lottery_name,
  l.country
FROM draws d
JOIN lotteries l ON d.lottery_id = l.lottery_id
WHERE
  l.country LIKE '%USA%'
  OR l.country LIKE '%United States%'
  OR l.country LIKE '%Estados Unidos%'
  OR d.draw_name LIKE '%Florida%'
  OR d.draw_name LIKE '%New York%'
  OR d.draw_name LIKE '%Georgia%'
  OR d.draw_name LIKE '%Texas%'
  OR d.draw_name LIKE '%NY%'
  OR d.draw_name LIKE '%FL%'
  OR d.draw_name LIKE '%GA%'
  OR d.draw_name LIKE '%TX%'
  OR d.draw_code LIKE '%FL%'
  OR d.draw_code LIKE '%NY%'
  OR d.draw_code LIKE '%GA%'
  OR d.draw_code LIKE '%TX%'
ORDER BY d.draw_id;

PRINT '';
PRINT 'Total de sorteos encontrados:';
SELECT COUNT(*) AS total_usa_draws
FROM draws d
JOIN lotteries l ON d.lottery_id = l.lottery_id
WHERE
  l.country LIKE '%USA%'
  OR l.country LIKE '%United States%'
  OR l.country LIKE '%Estados Unidos%'
  OR d.draw_name LIKE '%Florida%'
  OR d.draw_name LIKE '%New York%'
  OR d.draw_name LIKE '%Georgia%'
  OR d.draw_name LIKE '%Texas%'
  OR d.draw_name LIKE '%NY%'
  OR d.draw_name LIKE '%FL%'
  OR d.draw_name LIKE '%GA%'
  OR d.draw_name LIKE '%TX%';
