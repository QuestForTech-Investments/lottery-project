USE [lottery-db];
GO

-- Check if lottery_id is IDENTITY
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('lotteries_copy'), COLUMN_NAME, 'IsIdentity') AS Is_Identity,
    IDENT_SEED('lotteries_copy') AS Identity_Seed,
    IDENT_INCR('lotteries_copy') AS Identity_Increment,
    IDENT_CURRENT('lotteries_copy') AS Current_Identity_Value
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'lotteries_copy'
AND COLUMN_NAME = 'lottery_id';

-- Check current max ID
SELECT 
    MIN(lottery_id) AS Min_ID,
    MAX(lottery_id) AS Max_ID,
    COUNT(*) AS Total_Records
FROM lotteries_copy;
