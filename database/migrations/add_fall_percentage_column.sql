-- Add fall_percentage column to betting_pool_config
-- This stores the percentage used for caída calculation (e.g., 10 means 10%)

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_config' AND COLUMN_NAME = 'fall_percentage'
)
BEGIN
    ALTER TABLE betting_pool_config
    ADD fall_percentage DECIMAL(5,2) NOT NULL DEFAULT 0;
END
GO
