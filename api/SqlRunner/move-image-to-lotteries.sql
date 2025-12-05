-- Migration: Move image_url from draws to lotteries table
-- Date: 2025-11-29
-- Purpose: Icons belong to lotteries, not individual draws (e.g., florida.png is used by Florida Lottery, not FLORIDA AM/PM separately)

-- Step 1: Add image_url column to lotteries table if it doesn't exist
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'lotteries' AND COLUMN_NAME = 'image_url'
)
BEGIN
    ALTER TABLE lotteries ADD image_url NVARCHAR(500) NULL;
    PRINT 'Added image_url column to lotteries table';
END
ELSE
BEGIN
    PRINT 'image_url column already exists in lotteries table';
END
GO

-- Step 2: Populate lottery image URLs
-- Azure Blob Storage: https://lotteryicons.blob.core.windows.net/sorteos/
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/anguila.png' WHERE lottery_name LIKE '%Anguilla%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/florida.png' WHERE lottery_name LIKE '%Florida%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/gana-mas.png' WHERE lottery_name LIKE '%Gana M%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/king-lottery.png' WHERE lottery_name LIKE '%King%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/diaria.png' WHERE lottery_name LIKE '%Diaria%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/la-primera.png' WHERE lottery_name LIKE '%Primera%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/la-suerte.png' WHERE lottery_name LIKE '%Suerte%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/lotedom.png' WHERE lottery_name LIKE '%Lotedom%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/loteka.png' WHERE lottery_name LIKE '%Loteka%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/nacional.png' WHERE lottery_name LIKE '%Nacional Dominicana%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/real.png' WHERE lottery_name LIKE '%Loto Real%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/new-york.png' WHERE lottery_name LIKE '%New York%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/quiniela.png' WHERE lottery_name LIKE '%Quiniela%';
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/texas.png' WHERE lottery_name LIKE '%Texas%';

-- Also update the Super Pale lottery (uses combined NY-FL icon or florida)
UPDATE lotteries SET image_url = 'https://lotteryicons.blob.core.windows.net/sorteos/florida.png' WHERE lottery_name LIKE '%Super Pale%';

PRINT 'Updated lottery image URLs';

-- Step 3: Verify updated lotteries
SELECT lottery_id, lottery_name, image_url
FROM lotteries
WHERE image_url IS NOT NULL
ORDER BY lottery_name;

-- Step 4: Clear image_url from draws table (since it now belongs to lotteries)
UPDATE draws SET image_url = NULL WHERE image_url IS NOT NULL;
PRINT 'Cleared image_url from draws table';

-- Step 5: Verify draws no longer have image_url values
SELECT COUNT(*) AS draws_with_images FROM draws WHERE image_url IS NOT NULL;
