-- Migration: Rename container from sorteos to lotteries
-- Date: 2025-11-29
-- Purpose: Keep consistent English naming convention

UPDATE lotteries
SET image_url = REPLACE(image_url, '/sorteos/', '/lotteries/')
WHERE image_url LIKE '%/sorteos/%';

PRINT 'Updated lottery image URLs from /sorteos/ to /lotteries/';

-- Verify updated URLs
SELECT lottery_id, lottery_name, image_url
FROM lotteries
WHERE image_url IS NOT NULL
ORDER BY lottery_name;
