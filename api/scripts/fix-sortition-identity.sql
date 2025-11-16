-- =====================================================
-- Fix: Add IDENTITY to sortition_id in betting_pool_sortitions
-- =====================================================

BEGIN TRANSACTION;

-- Check if table has data
DECLARE @RowCount INT;
SELECT @RowCount = COUNT(*) FROM betting_pool_sortitions;
PRINT 'Current rows in betting_pool_sortitions: ' + CAST(@RowCount AS VARCHAR(10));

-- Drop existing table (safe since it was created on Oct 30 and likely has no data)
IF OBJECT_ID('betting_pool_sortitions', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping existing betting_pool_sortitions table...';
    DROP TABLE betting_pool_sortitions;
    PRINT 'Table dropped successfully.';
END

-- Recreate table with IDENTITY on sortition_id
PRINT 'Creating betting_pool_sortitions table with IDENTITY...';

CREATE TABLE betting_pool_sortitions (
    sortition_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    betting_pool_id INT NOT NULL,
    sortition_type NVARCHAR(50) NOT NULL,
    is_enabled BIT NOT NULL DEFAULT 1,
    specific_config NVARCHAR(MAX) NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,
    created_by INT NULL,
    updated_by INT NULL,

    -- Foreign key to betting_pools
    CONSTRAINT FK_betting_pool_sortitions_betting_pools
        FOREIGN KEY (betting_pool_id)
        REFERENCES betting_pools(betting_pool_id)
        ON DELETE CASCADE
);

PRINT 'Table created successfully with IDENTITY.';

-- Create index for performance
CREATE NONCLUSTERED INDEX IX_betting_pool_sortitions_betting_pool_id
    ON betting_pool_sortitions(betting_pool_id);

PRINT 'Index created successfully.';

COMMIT TRANSACTION;

PRINT 'Migration completed successfully!';
GO

-- Verify the change
SELECT
    c.name AS ColumnName,
    t.name AS DataType,
    c.is_identity AS IsIdentity,
    IDENT_SEED('betting_pool_sortitions') AS IdentitySeed,
    IDENT_INCR('betting_pool_sortitions') AS IdentityIncrement
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('betting_pool_sortitions')
    AND c.name = 'sortition_id';

PRINT 'Verification complete.';
