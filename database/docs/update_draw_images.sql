-- Migration: Update draw image URLs
-- Date: 2025-11-29
-- Purpose: Add image URLs to draws table for sorteo icons
-- Images downloaded from original Vue.js app (bancaflottery S3 bucket)

-- Note: These are sample mappings. You need to verify the exact draw_id for each image
-- The images are stored in frontend-v4/public/images/sorteos/

-- Option 1: Use local paths (for development)
-- UPDATE draws SET image_url = '/images/sorteos/anguila.png' WHERE draw_name LIKE '%Anguila%';
-- UPDATE draws SET image_url = '/images/sorteos/texas.png' WHERE draw_name LIKE '%TEXAS%';
-- UPDATE draws SET image_url = '/images/sorteos/real.png' WHERE draw_name = 'REAL';
-- UPDATE draws SET image_url = '/images/sorteos/gana-mas.png' WHERE draw_name = 'GANA MAS';
-- UPDATE draws SET image_url = '/images/sorteos/la-primera.png' WHERE draw_name LIKE '%LA PRIMERA%';
-- UPDATE draws SET image_url = '/images/sorteos/la-suerte.png' WHERE draw_name LIKE '%LA SUERTE%';
-- UPDATE draws SET image_url = '/images/sorteos/lotedom.png' WHERE draw_name = 'LOTEDOM';
-- UPDATE draws SET image_url = '/images/sorteos/king-lottery.png' WHERE draw_name LIKE '%King Lottery%';
-- UPDATE draws SET image_url = '/images/sorteos/new-york.png' WHERE draw_name LIKE '%NEW YORK%' OR draw_name LIKE '%NY %';
-- UPDATE draws SET image_url = '/images/sorteos/florida.png' WHERE draw_name LIKE '%FLORIDA%' OR draw_name LIKE '%FL %';
-- UPDATE draws SET image_url = '/images/sorteos/loteka.png' WHERE draw_name = 'LOTEKA';
-- UPDATE draws SET image_url = '/images/sorteos/nacional.png' WHERE draw_name = 'NACIONAL';
-- UPDATE draws SET image_url = '/images/sorteos/diaria.png' WHERE draw_name LIKE '%DIARIA%';
-- UPDATE draws SET image_url = '/images/sorteos/quiniela.png' WHERE draw_name LIKE '%QUINIELA%';

-- Option 2: Use original S3 URLs directly (requires external access) - DEPRECATED
-- UPDATE draws SET image_url = 'https://s3.amazonaws.com/bancaflottery/6fb94355-89d3-4c83-a972-a672b7c1a424.png' WHERE draw_name LIKE '%Anguila%';
-- ... (see git history for full list)

-- Option 3: Use Azure Blob Storage URLs (RECOMMENDED - Production)
-- Storage Account: lotteryicons
-- Container: sorteos (public blob access)
-- Resource Group: rg-lottery-api
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/anguila.png' WHERE draw_name LIKE '%Anguila%';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/texas.png' WHERE draw_name LIKE '%TEXAS%';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/real.png' WHERE draw_name = 'REAL';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/gana-mas.png' WHERE draw_name = 'GANA MAS';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/la-primera.png' WHERE draw_name LIKE '%LA PRIMERA%';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/la-suerte.png' WHERE draw_name LIKE '%LA SUERTE%';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/lotedom.png' WHERE draw_name = 'LOTEDOM';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/king-lottery.png' WHERE draw_name LIKE '%King Lottery%';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/new-york.png' WHERE draw_name LIKE '%NEW YORK%' OR draw_name LIKE '%NY %';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/florida.png' WHERE draw_name LIKE '%FLORIDA%' OR draw_name LIKE '%FL %';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/loteka.png' WHERE draw_name = 'LOTEKA';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/nacional.png' WHERE draw_name = 'NACIONAL';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/diaria.png' WHERE draw_name LIKE '%DIARIA%';
UPDATE draws SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/quiniela.png' WHERE draw_name LIKE '%QUINIELA%';

-- Verify updated draws
SELECT draw_id, draw_name, image_url FROM draws WHERE image_url IS NOT NULL ORDER BY draw_name;
