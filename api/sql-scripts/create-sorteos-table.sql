USE [lottery-db];
GO

-- =============================================
-- Create sorteos (draws) table
-- Represents specific drawing times for each lottery
-- Example: LA PRIMERA lottery has 3 sorteos per day (10 AM, 1 PM, 6 PM)
-- =============================================

PRINT '================================================================================'
PRINT 'CREATING SORTEOS TABLE'
PRINT '================================================================================'
PRINT ''

-- Check if table exists
IF OBJECT_ID('sorteos', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: sorteos table already exists. Dropping and recreating...'
    DROP TABLE sorteos;
END

-- Create sorteos table
CREATE TABLE sorteos (
    sorteo_id INT IDENTITY(1,1) PRIMARY KEY,
    lottery_id INT NOT NULL,
    sorteo_name NVARCHAR(255) NOT NULL,
    sorteo_code NVARCHAR(50) NOT NULL,
    sorteo_time TIME NOT NULL,
    sorteo_days NVARCHAR(50) NOT NULL DEFAULT 'DAILY',
    display_order INT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    -- Foreign key constraint
    CONSTRAINT FK_sorteos_lottery FOREIGN KEY (lottery_id)
        REFERENCES lotteries(lottery_id),

    -- Unique constraint: lottery + sorteo code must be unique
    CONSTRAINT UQ_sorteos_lottery_code UNIQUE (lottery_id, sorteo_code),

    -- Unique constraint: lottery + sorteo name must be unique
    CONSTRAINT UQ_sorteos_lottery_name UNIQUE (lottery_id, sorteo_name)
);

PRINT '✓ Sorteos table created successfully'
GO

-- Create indexes for better performance
PRINT ''
PRINT 'Creating indexes...'

CREATE NONCLUSTERED INDEX IX_sorteos_lottery_id
    ON sorteos(lottery_id)
    WHERE is_active = 1;

CREATE NONCLUSTERED INDEX IX_sorteos_active
    ON sorteos(is_active, display_order);

CREATE NONCLUSTERED INDEX IX_sorteos_time
    ON sorteos(sorteo_time);

PRINT '✓ Indexes created successfully'
GO

-- Create trigger for updated_at
PRINT ''
PRINT 'Creating updated_at trigger...'
GO

CREATE TRIGGER trg_sorteos_updated_at
ON sorteos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE sorteos
    SET updated_at = GETDATE()
    FROM sorteos s
    INNER JOIN inserted i ON s.sorteo_id = i.sorteo_id;
END;
GO

PRINT '✓ Trigger created successfully'
PRINT ''
PRINT '================================================================================'
PRINT 'SORTEOS TABLE CREATED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Table Details:'
PRINT '- Primary Key: sorteo_id (IDENTITY)'
PRINT '- Foreign Key: lottery_id -> lotteries(lottery_id)'
PRINT '- Unique Constraints: lottery + code, lottery + name'
PRINT '- Indexes: lottery_id, is_active, sorteo_time'
PRINT '- Trigger: Auto-update updated_at timestamp'
PRINT ''
PRINT 'Sorteo Days Options:'
PRINT '- DAILY: Draws every day'
PRINT '- MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY'
PRINT '- MON-FRI: Monday through Friday'
PRINT '- WED,SUN: Specific days (comma-separated)'
PRINT ''
PRINT '================================================================================'

GO

