-- Script to fix betting_pool_footers table by adding IDENTITY to footer_id column
-- This ensures Entity Framework can auto-generate IDs when inserting new footer records

USE [lottery-db];
GO

-- Step 1: Check if IDENTITY already exists on footer_id
IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.tables t ON c.object_id = t.object_id
    WHERE t.name = 'betting_pool_footers'
    AND c.name = 'footer_id'
    AND c.is_identity = 1
)
BEGIN
    PRINT 'IDENTITY already exists on footer_id column. No changes needed.';
END
ELSE
BEGIN
    PRINT 'Adding IDENTITY to footer_id column...';

    -- Step 2: Create temporary table with IDENTITY column
    CREATE TABLE betting_pool_footers_temp (
        footer_id INT IDENTITY(1,1) PRIMARY KEY,
        betting_pool_id INT NOT NULL,
        auto_footer BIT NOT NULL,
        footer_line_1 NVARCHAR(500),
        footer_line_2 NVARCHAR(500),
        footer_line_3 NVARCHAR(500),
        footer_line_4 NVARCHAR(500),
        created_at DATETIME2,
        updated_at DATETIME2,
        created_by INT,
        updated_by INT
    );

    -- Step 3: Copy existing data if any
    IF EXISTS (SELECT 1 FROM betting_pool_footers)
    BEGIN
        SET IDENTITY_INSERT betting_pool_footers_temp ON;

        INSERT INTO betting_pool_footers_temp (
            footer_id,
            betting_pool_id,
            auto_footer,
            footer_line_1,
            footer_line_2,
            footer_line_3,
            footer_line_4,
            created_at,
            updated_at,
            created_by,
            updated_by
        )
        SELECT
            footer_id,
            betting_pool_id,
            auto_footer,
            footer_line_1,
            footer_line_2,
            footer_line_3,
            footer_line_4,
            created_at,
            updated_at,
            created_by,
            updated_by
        FROM betting_pool_footers;

        SET IDENTITY_INSERT betting_pool_footers_temp OFF;

        PRINT 'Copied ' + CAST(@@ROWCOUNT AS VARCHAR) + ' existing footer records.';
    END
    ELSE
    BEGIN
        PRINT 'No existing footer records to copy.';
    END

    -- Step 4: Drop foreign key constraint from betting_pools if it exists
    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = 'FK_betting_pools_betting_pool_footers'
    )
    BEGIN
        ALTER TABLE betting_pools DROP CONSTRAINT FK_betting_pools_betting_pool_footers;
        PRINT 'Dropped foreign key constraint FK_betting_pools_betting_pool_footers.';
    END

    -- Step 5: Drop old table
    DROP TABLE betting_pool_footers;
    PRINT 'Dropped old betting_pool_footers table.';

    -- Step 6: Rename temp table to original name
    EXEC sp_rename 'betting_pool_footers_temp', 'betting_pool_footers';
    PRINT 'Renamed temp table to betting_pool_footers.';

    -- Step 7: Recreate foreign key constraint on betting_pools table
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'betting_pools')
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM sys.columns c
            INNER JOIN sys.tables t ON c.object_id = t.object_id
            WHERE t.name = 'betting_pools'
            AND c.name = 'footer_id'
        )
        BEGIN
            ALTER TABLE betting_pools
            ADD CONSTRAINT FK_betting_pools_betting_pool_footers
            FOREIGN KEY (footer_id) REFERENCES betting_pool_footers(footer_id);
            PRINT 'Recreated foreign key constraint FK_betting_pools_betting_pool_footers.';
        END
    END

    -- Step 8: Create unique constraint on betting_pool_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE name = 'UQ_betting_pool_footers_betting_pool_id'
        AND object_id = OBJECT_ID('betting_pool_footers')
    )
    BEGIN
        ALTER TABLE betting_pool_footers
        ADD CONSTRAINT UQ_betting_pool_footers_betting_pool_id UNIQUE (betting_pool_id);
        PRINT 'Added unique constraint on betting_pool_id.';
    END

    PRINT 'SUCCESS: betting_pool_footers table fixed with IDENTITY column.';
END
GO
