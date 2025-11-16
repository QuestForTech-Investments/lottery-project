-- =============================================
-- Script: fix-betting-pools-identity.sql
-- Purpose: Add IDENTITY to betting_pool_id column in betting_pools table
-- Date: 2025-10-28
-- =============================================

USE [lottery-db];
GO

-- Check current table structure
PRINT 'Current betting_pools table structure:';
SELECT
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable,
    c.is_identity AS IsIdentity,
    IDENT_SEED('betting_pools') AS IdentitySeed,
    IDENT_INCR('betting_pools') AS IdentityIncrement
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('betting_pools')
ORDER BY c.column_id;
GO

-- Get current max ID
DECLARE @MaxId INT;
SELECT @MaxId = ISNULL(MAX(betting_pool_id), 0) FROM betting_pools;
PRINT 'Current max betting_pool_id: ' + CAST(@MaxId AS VARCHAR(10));
GO

-- Check if betting_pool_id already has IDENTITY
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('betting_pools')
    AND name = 'betting_pool_id'
    AND is_identity = 1
)
BEGIN
    PRINT 'betting_pool_id already has IDENTITY property. No changes needed.';
END
ELSE
BEGIN
    PRINT 'Adding IDENTITY to betting_pool_id column...';

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Step 1: Create new table with IDENTITY
        CREATE TABLE betting_pools_new (
            betting_pool_id INT IDENTITY(1,1) PRIMARY KEY,
            betting_pool_code NVARCHAR(50) NOT NULL UNIQUE,
            betting_pool_name NVARCHAR(255) NOT NULL,
            zone_id INT,
            bank_id INT NULL,
            address NVARCHAR(500) NULL,
            phone NVARCHAR(20) NULL,
            location NVARCHAR(255) NULL,
            reference NVARCHAR(255) NULL,
            comment NVARCHAR(MAX) NULL,
            username NVARCHAR(100) NULL,
            is_active BIT NOT NULL DEFAULT 1,
            created_at DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
            updated_at DATETIME2(7) NULL,
            CONSTRAINT FK_betting_pools_zones FOREIGN KEY (zone_id) REFERENCES zones(zone_id),
            CONSTRAINT FK_betting_pools_banks FOREIGN KEY (bank_id) REFERENCES banks(bank_id)
        );

        -- Step 2: Copy existing data with IDENTITY_INSERT
        IF EXISTS (SELECT 1 FROM betting_pools)
        BEGIN
            SET IDENTITY_INSERT betting_pools_new ON;

            INSERT INTO betting_pools_new (
                betting_pool_id, betting_pool_code, betting_pool_name,
                zone_id, bank_id, address, phone, location, reference,
                comment, username, is_active, created_at, updated_at
            )
            SELECT
                betting_pool_id, betting_pool_code, betting_pool_name,
                zone_id, bank_id, address, phone, location, reference,
                comment, username, is_active, created_at, updated_at
            FROM betting_pools;

            SET IDENTITY_INSERT betting_pools_new OFF;

            -- Get the max ID and reseed
            DECLARE @MaxIdNew INT;
            SELECT @MaxIdNew = MAX(betting_pool_id) FROM betting_pools_new;
            DBCC CHECKIDENT ('betting_pools_new', RESEED, @MaxIdNew);

            PRINT 'Copied ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';
        END

        -- Step 3: Drop foreign key constraints that reference betting_pools
        PRINT 'Dropping foreign key constraints...';

        -- Drop FK from user_betting_pools if exists
        IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_user_betting_pools_betting_pools')
            ALTER TABLE user_betting_pools DROP CONSTRAINT FK_user_betting_pools_betting_pools;

        -- Drop FK from tickets if exists
        IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_tickets_betting_pools')
            ALTER TABLE tickets DROP CONSTRAINT FK_tickets_betting_pools;

        -- Step 4: Drop old table
        PRINT 'Dropping old table...';
        DROP TABLE betting_pools;

        -- Step 5: Rename new table
        PRINT 'Renaming new table...';
        EXEC sp_rename 'betting_pools_new', 'betting_pools';

        -- Step 6: Recreate foreign key constraints
        PRINT 'Recreating foreign key constraints...';

        -- Recreate FK from user_betting_pools
        IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'user_betting_pools')
            ALTER TABLE user_betting_pools
            ADD CONSTRAINT FK_user_betting_pools_betting_pools
            FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id);

        -- Recreate FK from tickets
        IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'tickets')
            ALTER TABLE tickets
            ADD CONSTRAINT FK_tickets_betting_pools
            FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id);

        COMMIT TRANSACTION;
        PRINT 'SUCCESS: IDENTITY added to betting_pool_id column';

        -- Verify the change
        PRINT '';
        PRINT 'Verification - New table structure:';
        SELECT
            c.name AS ColumnName,
            t.name AS DataType,
            c.max_length AS MaxLength,
            c.is_nullable AS IsNullable,
            c.is_identity AS IsIdentity,
            IDENT_SEED('betting_pools') AS IdentitySeed,
            IDENT_INCR('betting_pools') AS IdentityIncrement
        FROM sys.columns c
        INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID('betting_pools')
        ORDER BY c.column_id;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        PRINT 'ERROR: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END
GO
