USE [lottery-db];
GO

DECLARE @result VARCHAR(MAX) = '';

SELECT @result = @result + 'ID: ' + CAST(bet_type_id AS VARCHAR) + ' = ' + bet_type_code + ', '
FROM bet_types
WHERE is_active = 1
ORDER BY bet_type_id;

PRINT 'Bet Types: ' + @result;

GO
