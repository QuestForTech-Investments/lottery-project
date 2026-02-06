-- ============================================================================
-- Hot Numbers Tables Creation Script
-- Creates tables for managing hot numbers (numeros calientes) and their limits
-- ============================================================================

-- Hot Numbers Table
-- Stores the selected hot numbers (0-99)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hot_numbers')
BEGIN
    CREATE TABLE hot_numbers (
        hot_number_id INT IDENTITY(1,1) PRIMARY KEY,
        number INT NOT NULL CHECK (number >= 0 AND number <= 99),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        created_by INT NULL,
        updated_at DATETIME2 NULL,
        updated_by INT NULL
    );

    -- Unique constraint on number (only one entry per number)
    CREATE UNIQUE INDEX IX_hot_numbers_number ON hot_numbers(number);

    -- Index for efficient active number lookups
    CREATE INDEX IX_hot_numbers_number_active ON hot_numbers(number, is_active);

    PRINT 'Table hot_numbers created successfully.';
END
ELSE
BEGIN
    PRINT 'Table hot_numbers already exists.';
END
GO

-- Hot Number Limits Table
-- Stores limit configurations for hot numbers by draw
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hot_number_limits')
BEGIN
    CREATE TABLE hot_number_limits (
        hot_number_limit_id INT IDENTITY(1,1) PRIMARY KEY,
        draw_ids NVARCHAR(500) NULL,  -- Comma-separated list of draw IDs
        directo DECIMAL(18,2) NOT NULL DEFAULT 0,
        pale_1_caliente DECIMAL(18,2) NOT NULL DEFAULT 0,
        pale_2_caliente DECIMAL(18,2) NOT NULL DEFAULT 0,
        tripleta_1_caliente DECIMAL(18,2) NOT NULL DEFAULT 0,
        tripleta_2_caliente DECIMAL(18,2) NOT NULL DEFAULT 0,
        tripleta_3_caliente DECIMAL(18,2) NOT NULL DEFAULT 0,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        created_by INT NULL,
        updated_at DATETIME2 NULL,
        updated_by INT NULL
    );

    -- Index for efficient active limit lookups
    CREATE INDEX IX_hot_number_limits_active ON hot_number_limits(is_active);

    PRINT 'Table hot_number_limits created successfully.';
END
ELSE
BEGIN
    PRINT 'Table hot_number_limits already exists.';
END
GO

-- ============================================================================
-- Sample Data (Optional - uncomment if needed for testing)
-- ============================================================================

/*
-- Insert some sample hot numbers
INSERT INTO hot_numbers (number, is_active) VALUES
(7, 1),   -- Lucky 7
(13, 1),  -- Lucky 13
(21, 1),
(77, 1),
(88, 1);

-- Insert a sample hot number limit for all draws
INSERT INTO hot_number_limits (draw_ids, directo, pale_1_caliente, pale_2_caliente, tripleta_1_caliente, tripleta_2_caliente, tripleta_3_caliente)
VALUES ('1,2,3,4', 500.00, 100.00, 50.00, 100.00, 50.00, 25.00);
*/

PRINT 'Hot Numbers tables migration completed.';
GO
