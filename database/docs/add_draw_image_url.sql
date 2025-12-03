-- Migration: Add image_url column to draws table
-- Date: 2025-11-29
-- Purpose: Support draw/sorteo icons like in the original Vue.js app

-- Add the image_url column to the draws table
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'draws' AND COLUMN_NAME = 'image_url'
)
BEGIN
    ALTER TABLE draws
    ADD image_url NVARCHAR(500) NULL;

    PRINT 'Column image_url added to draws table successfully.';
END
ELSE
BEGIN
    PRINT 'Column image_url already exists in draws table.';
END
GO

-- Sample data: Update some draws with image URLs from the original app
-- These URLs are examples - replace with actual S3 URLs from bancaflottery bucket

-- Example UPDATE statement (uncomment and modify as needed):
-- UPDATE draws SET image_url = 'https://s3.amazonaws.com/bancaflottery/your-image-uuid.png' WHERE draw_id = 1;

-- To verify the column was added:
-- SELECT draw_id, draw_name, display_color, image_url FROM draws WHERE is_active = 1;
