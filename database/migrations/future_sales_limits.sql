-- =====================================================================
-- Future-sales limits — separate cap + consumption bucket
-- =====================================================================
-- Adds a per-rule `future_max_amount` to limit_rule_amounts and an
-- `is_future_sale` discriminator on limit_consumption so future-day
-- reservations consume against an independent cap.
--
-- Policy: future_max_amount = NULL (default) → future sales prohibited
-- for that rule. Admin must opt-in by configuring a positive number.
--
-- Idempotent: safe to re-run.
-- =====================================================================

SET NOCOUNT ON;

-- 1. Per-rule cap for future sales. NULL = future sales not allowed
-- under this rule. Same-day cap (max_amount) stays as-is.
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('limit_rule_amounts')
      AND name = 'future_max_amount'
)
BEGIN
    ALTER TABLE limit_rule_amounts
        ADD future_max_amount DECIMAL(10,2) NULL;
    PRINT 'Added limit_rule_amounts.future_max_amount';
END
ELSE
    PRINT 'Column future_max_amount already exists on limit_rule_amounts';

-- 2. Discriminator for the consumption bucket. Default 0 → existing rows
-- are treated as same-day consumption (backward compat).
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('limit_consumption')
      AND name = 'is_future_sale'
)
BEGIN
    ALTER TABLE limit_consumption
        ADD is_future_sale BIT NOT NULL
        CONSTRAINT DF_limit_consumption_is_future_sale DEFAULT 0;
    PRINT 'Added limit_consumption.is_future_sale (default 0)';
END
ELSE
    PRINT 'Column is_future_sale already exists on limit_consumption';

-- 3. Rebuild the UNIQUE constraint to include is_future_sale so a
-- same-day and a future row for the same (rule, draw, date, number, banca)
-- can coexist as two distinct buckets.
DECLARE @uq NVARCHAR(200) = (
    SELECT TOP 1 i.name
    FROM sys.indexes i
    WHERE i.object_id = OBJECT_ID('limit_consumption')
      AND i.is_unique = 1
      AND i.is_primary_key = 0
);
IF @uq IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.index_columns ic
       JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
       WHERE ic.object_id = OBJECT_ID('limit_consumption')
         AND ic.index_id = (SELECT index_id FROM sys.indexes WHERE object_id = OBJECT_ID('limit_consumption') AND name = @uq)
         AND c.name = 'is_future_sale'
   )
BEGIN
    EXEC('ALTER TABLE limit_consumption DROP CONSTRAINT [' + @uq + ']');
    PRINT 'Dropped legacy UNIQUE: ' + @uq;

    ALTER TABLE limit_consumption
        ADD CONSTRAINT UQ_limit_consumption UNIQUE
        (limit_rule_id, draw_id, draw_date, bet_number, betting_pool_id, is_future_sale);
    PRINT 'Added UQ_limit_consumption with is_future_sale';
END
ELSE
    PRINT 'UNIQUE on limit_consumption already includes is_future_sale or does not exist';

-- Verification
SELECT 'limit_rule_amounts.future_max_amount' AS column_check,
       COLUMNPROPERTY(OBJECT_ID('limit_rule_amounts'), 'future_max_amount', 'ColumnId') AS exists_flag;

SELECT 'limit_consumption.is_future_sale' AS column_check,
       COLUMNPROPERTY(OBJECT_ID('limit_consumption'), 'is_future_sale', 'ColumnId') AS exists_flag;

SELECT i.name AS unique_constraint, STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS columns
FROM sys.indexes i
JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE i.object_id = OBJECT_ID('limit_consumption') AND i.is_unique = 1 AND i.is_primary_key = 0
GROUP BY i.name;
