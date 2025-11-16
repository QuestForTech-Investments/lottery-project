USE [lottery-db];
GO

-- Test if prize_fields table exists
PRINT 'Testing prize_fields table...';
SELECT TOP 1 prize_field_id, field_code FROM dbo.prize_fields;
GO

-- Test if campos_premio table exists
PRINT 'Testing campos_premio table...';
SELECT TOP 1 * FROM dbo.campos_premio;
GO
