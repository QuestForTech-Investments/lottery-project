-- ============================================================
-- Adds IDENTITY(1,1) to betting_pool_automatic_expenses.expense_id.
-- The table is shipped without IDENTITY, so EF Core inserts (which
-- don't provide an expense_id) fail with "Cannot insert NULL".
--
-- Safe pre-conditions assumed: tables are empty (no data to migrate).
-- Idempotent: re-running is a no-op once expense_id is IDENTITY.
-- ============================================================

SET NOCOUNT ON;

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.betting_pool_automatic_expenses')
      AND name = 'expense_id'
      AND is_identity = 1
)
BEGIN
    PRINT 'expense_id already IDENTITY — nothing to do.';
    RETURN;
END

-- Sanity check: bail if we'd lose data.
IF (SELECT COUNT(*) FROM dbo.betting_pool_automatic_expenses) > 0
   OR (SELECT COUNT(*) FROM dbo.auto_expense_history) > 0
BEGIN
    RAISERROR('Refusing to recreate table — auto-expense data present. Manual migration required.', 16, 1);
    RETURN;
END

PRINT 'Dropping dependent FK on auto_expense_history...';
DECLARE @fk_history_name sysname = (
    SELECT name FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID('dbo.auto_expense_history')
      AND referenced_object_id = OBJECT_ID('dbo.betting_pool_automatic_expenses')
);
IF @fk_history_name IS NOT NULL
BEGIN
    DECLARE @sql nvarchar(max) = N'ALTER TABLE dbo.auto_expense_history DROP CONSTRAINT [' + @fk_history_name + N']';
    EXEC sp_executesql @sql;
END

PRINT 'Dropping old table...';
DROP TABLE dbo.betting_pool_automatic_expenses;

PRINT 'Recreating with IDENTITY...';
CREATE TABLE dbo.betting_pool_automatic_expenses (
    expense_id        int IDENTITY(1,1) NOT NULL,
    betting_pool_id   int NOT NULL,
    expense_type      varchar(50) NOT NULL,
    amount            decimal(10,2) NULL,
    percentage        decimal(5,2) NULL,
    frequency         varchar(50) NOT NULL,
    is_active         bit NULL,
    created_at        datetime2(7) NULL,
    updated_at        datetime2(7) NULL,
    created_by        int NULL,
    updated_by        int NULL,
    day_of_week       int NULL,
    day_of_month      int NULL,
    CONSTRAINT PK_betting_pool_expenses PRIMARY KEY CLUSTERED (expense_id),
    CONSTRAINT FK_expenses_betting_pools FOREIGN KEY (betting_pool_id)
        REFERENCES dbo.betting_pools (betting_pool_id)
);

PRINT 'Restoring FK from auto_expense_history...';
ALTER TABLE dbo.auto_expense_history
    ADD CONSTRAINT FK_auto_expense_history_expense
        FOREIGN KEY (expense_id) REFERENCES dbo.betting_pool_automatic_expenses (expense_id);

PRINT 'Done.';
