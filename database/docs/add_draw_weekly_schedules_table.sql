-- =============================================
-- Add draw_weekly_schedules table
-- Allows different schedules per day of week
-- =============================================
-- Author: Claude Code
-- Date: 2025-11-24
-- Description:
--   - Enables weekly schedules for draws (different times per day)
--   - Supports start_time and end_time (sales cutoff)
--   - Based on analysis of original lottery app
-- =============================================

USE [lottery-db];
GO

-- =============================================
-- 1. Create draw_weekly_schedules table
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'draw_weekly_schedules')
BEGIN
    CREATE TABLE [dbo].[draw_weekly_schedules] (
        -- Primary key
        [schedule_id] INT IDENTITY(1,1) NOT NULL,

        -- Foreign key to draws
        [draw_id] INT NOT NULL,

        -- Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        -- Using SQL Server DATEPART convention
        [day_of_week] TINYINT NOT NULL,

        -- Time range for this day
        [start_time] TIME NOT NULL,      -- When sales open (e.g., 12:00 AM)
        [end_time] TIME NOT NULL,        -- When sales close (e.g., 02:34 PM)

        -- Status
        [is_active] BIT NOT NULL DEFAULT 1,

        -- Audit fields
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [created_by] INT NULL,
        [updated_at] DATETIME2 NULL,
        [updated_by] INT NULL,
        [deleted_at] DATETIME2 NULL,
        [deleted_by] INT NULL,

        -- Constraints
        CONSTRAINT [PK_draw_weekly_schedules] PRIMARY KEY CLUSTERED ([schedule_id]),
        CONSTRAINT [FK_draw_weekly_schedules_draw] FOREIGN KEY ([draw_id])
            REFERENCES [draws] ([draw_id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_draw_day] UNIQUE ([draw_id], [day_of_week]),
        CONSTRAINT [CHK_day_of_week] CHECK ([day_of_week] BETWEEN 0 AND 6),
        CONSTRAINT [CHK_end_after_start] CHECK ([end_time] > [start_time])
    );

    -- Index for performance
    CREATE NONCLUSTERED INDEX [IX_draw_weekly_schedules_draw_active]
        ON [dbo].[draw_weekly_schedules] ([draw_id], [is_active]);

    PRINT '✅ Table draw_weekly_schedules created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ Table draw_weekly_schedules already exists';
END
GO

-- =============================================
-- 2. Add helper columns to draws table (optional)
-- =============================================

-- Add column to indicate if draw uses weekly schedules
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[draws]')
    AND name = 'use_weekly_schedule'
)
BEGIN
    ALTER TABLE [dbo].[draws]
    ADD [use_weekly_schedule] BIT NOT NULL DEFAULT 0;

    PRINT '✅ Column use_weekly_schedule added to draws table';
    PRINT '   - FALSE: Use draw_time (current behavior)';
    PRINT '   - TRUE: Use draw_weekly_schedules table';
END
ELSE
BEGIN
    PRINT '⚠️ Column use_weekly_schedule already exists';
END
GO

-- =============================================
-- 3. Create view for easy querying
-- =============================================

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_draw_schedules')
    DROP VIEW [dbo].[vw_draw_schedules];
GO

CREATE VIEW [dbo].[vw_draw_schedules]
AS
SELECT
    d.draw_id,
    d.draw_name,
    d.abbreviation,
    d.lottery_id,
    l.lottery_name,
    d.draw_time AS default_draw_time,
    d.use_weekly_schedule,
    dws.day_of_week,
    CASE dws.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END AS day_name,
    dws.start_time,
    dws.end_time,
    dws.is_active AS schedule_is_active,
    d.is_active AS draw_is_active
FROM
    draws d
    INNER JOIN lotteries l ON d.lottery_id = l.lottery_id
    LEFT JOIN draw_weekly_schedules dws ON d.draw_id = dws.draw_id AND dws.is_active = 1
WHERE
    d.is_active = 1;
GO

PRINT '✅ View vw_draw_schedules created';
GO

-- =============================================
-- 4. Create stored procedure to get current schedule
-- =============================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetDrawScheduleForDate')
    DROP PROCEDURE [dbo].[sp_GetDrawScheduleForDate];
GO

CREATE PROCEDURE [dbo].[sp_GetDrawScheduleForDate]
    @draw_id INT,
    @check_date DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Default to current date if not provided
    IF @check_date IS NULL
        SET @check_date = GETUTCDATE();

    DECLARE @day_of_week TINYINT = DATEPART(WEEKDAY, @check_date) - 1; -- Convert to 0-6 (Sun-Sat)
    DECLARE @use_weekly BIT;

    -- Check if draw uses weekly schedules
    SELECT @use_weekly = use_weekly_schedule
    FROM draws
    WHERE draw_id = @draw_id;

    IF @use_weekly = 1
    BEGIN
        -- Return weekly schedule for this day
        SELECT
            @draw_id AS draw_id,
            @day_of_week AS day_of_week,
            start_time,
            end_time,
            'weekly' AS schedule_type
        FROM
            draw_weekly_schedules
        WHERE
            draw_id = @draw_id
            AND day_of_week = @day_of_week
            AND is_active = 1;
    END
    ELSE
    BEGIN
        -- Return default draw_time
        SELECT
            draw_id,
            NULL AS day_of_week,
            draw_time AS start_time,
            draw_time AS end_time,
            'fixed' AS schedule_type
        FROM
            draws
        WHERE
            draw_id = @draw_id;
    END
END
GO

PRINT '✅ Stored procedure sp_GetDrawScheduleForDate created';
GO

-- =============================================
-- 5. Example data (commented out)
-- =============================================

/*
-- Example: Set LOTERIA NACIONAL draws to use weekly schedules
UPDATE draws
SET use_weekly_schedule = 1
WHERE draw_name IN ('GANA MAS', 'NACIONAL');

-- Example: Add weekly schedules for GANA MAS (closes at 2:34 PM all days)
INSERT INTO draw_weekly_schedules (draw_id, day_of_week, start_time, end_time)
SELECT
    draw_id,
    day_of_week,
    '00:00:00',
    '14:34:00'
FROM
    draws
CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5), (6)) AS days(day_of_week)
WHERE
    draw_name = 'GANA MAS';

-- Example: Add weekly schedules for NACIONAL (different time on Sunday)
INSERT INTO draw_weekly_schedules (draw_id, day_of_week, start_time, end_time)
SELECT
    d.draw_id,
    days.day_of_week,
    '00:00:00',
    CASE days.day_of_week
        WHEN 0 THEN '17:55:00'  -- Sunday: 5:55 PM
        ELSE '20:55:00'         -- Mon-Sat: 8:55 PM
    END
FROM
    draws d
CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5), (6)) AS days(day_of_week)
WHERE
    d.draw_name = 'NACIONAL';
*/

-- =============================================
-- 6. Summary
-- =============================================

PRINT '';
PRINT '========================================';
PRINT 'Migration complete!';
PRINT '========================================';
PRINT '';
PRINT 'What was added:';
PRINT '1. ✅ Table: draw_weekly_schedules';
PRINT '2. ✅ Column: draws.use_weekly_schedule';
PRINT '3. ✅ View: vw_draw_schedules';
PRINT '4. ✅ Stored Procedure: sp_GetDrawScheduleForDate';
PRINT '';
PRINT 'How it works:';
PRINT '- If use_weekly_schedule = 0: Uses draw_time (current behavior)';
PRINT '- If use_weekly_schedule = 1: Uses draw_weekly_schedules table';
PRINT '';
PRINT 'Day of week values:';
PRINT '0 = Domingo (Sunday)';
PRINT '1 = Lunes (Monday)';
PRINT '2 = Martes (Tuesday)';
PRINT '3 = Miércoles (Wednesday)';
PRINT '4 = Jueves (Thursday)';
PRINT '5 = Viernes (Friday)';
PRINT '6 = Sábado (Saturday)';
PRINT '';
PRINT 'Example queries:';
PRINT '- SELECT * FROM vw_draw_schedules WHERE draw_name = ''NACIONAL'';';
PRINT '- EXEC sp_GetDrawScheduleForDate @draw_id = 1, @check_date = ''2025-11-24'';';
PRINT '';
PRINT '========================================';
GO
