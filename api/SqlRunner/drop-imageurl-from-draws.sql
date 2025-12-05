-- Migration: Remove image_url column from draws table
-- Date: 2025-11-29
-- Purpose: Icons belong to lotteries, not individual draws

IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'draws' AND COLUMN_NAME = 'image_url'
)
BEGIN
    ALTER TABLE draws DROP COLUMN image_url;
    PRINT 'Dropped image_url column from draws table';
END
ELSE
BEGIN
    PRINT 'Column image_url does not exist in draws table (already dropped)';
END
