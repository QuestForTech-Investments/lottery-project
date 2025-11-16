USE [lottery-db];
GO

-- Check if draw_id is IDENTITY
SELECT 
    COLUMN_NAME,
    COLUMNPROPERTY(OBJECT_ID('draws'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'draws' AND COLUMN_NAME = 'draw_id';

-- If not IDENTITY, we need to recreate the table
