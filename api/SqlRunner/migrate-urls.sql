-- Migration: Update image URLs to new storage account (lotteryicons)
-- Date: 2025-11-29
-- Purpose: Migrate from lotterysorteoicons to lotteryicons

UPDATE draws
SET image_url = REPLACE(image_url, 'lotterysorteoicons', 'lotteryicons')
WHERE image_url LIKE '%lotterysorteoicons%';

-- Verify updated URLs
SELECT draw_id, draw_name, image_url
FROM draws
WHERE image_url IS NOT NULL
ORDER BY draw_name;
