USE [lottery-db];
GO

DECLARE @cols VARCHAR(MAX) = '';

SELECT @cols = @cols + COLUMN_NAME + ' (' + DATA_TYPE + '), '
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'prize_fields'
ORDER BY ORDINAL_POSITION;

PRINT 'Prize_fields columns: ' + @cols;

GO
