-- Migration: Update betting_pool_discount_config table
-- Adds discount_amount and discount_per_every columns
-- Removes discount_provider column (merged into discount_mode as GRUPO/RIFERO)

-- Add new columns
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('betting_pool_discount_config')
    AND name = 'discount_amount'
)
BEGIN
    ALTER TABLE betting_pool_discount_config
    ADD discount_amount DECIMAL(18,2) NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('betting_pool_discount_config')
    AND name = 'discount_per_every'
)
BEGIN
    ALTER TABLE betting_pool_discount_config
    ADD discount_per_every INT NULL;
END
GO

-- Drop discount_provider column (no longer needed)
-- Must drop the default constraint first, otherwise DROP COLUMN fails
IF EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('betting_pool_discount_config')
    AND name = 'discount_provider'
)
BEGIN
    DECLARE @constraintName NVARCHAR(200);
    SELECT @constraintName = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('betting_pool_discount_config') AND c.name = 'discount_provider';

    IF @constraintName IS NOT NULL
        EXEC('ALTER TABLE betting_pool_discount_config DROP CONSTRAINT ' + @constraintName);

    ALTER TABLE betting_pool_discount_config
    DROP COLUMN discount_provider;
END
GO
