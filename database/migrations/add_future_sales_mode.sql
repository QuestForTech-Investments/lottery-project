-- Migration: Add future_sales_mode to betting_pool_config
-- Date: 2026-02-11
-- Description: Replaces allow_future_sales (bool) + max_future_days (int) with
--              a unified future_sales_mode column: 'OFF', 'WEEK', or 'DAYS'.
--              Old columns kept for backward compatibility.

-- Add the new column
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('betting_pool_config')
    AND name = 'future_sales_mode'
)
BEGIN
    ALTER TABLE betting_pool_config
    ADD future_sales_mode NVARCHAR(10) NOT NULL DEFAULT 'OFF';

    -- Backfill based on existing allow_future_sales flag
    UPDATE betting_pool_config
    SET future_sales_mode = CASE
        WHEN allow_future_sales = 1 THEN 'DAYS'
        ELSE 'OFF'
    END;

    PRINT 'Column future_sales_mode added and backfilled successfully.';
END
ELSE
BEGIN
    PRINT 'Column future_sales_mode already exists. Skipping.';
END
