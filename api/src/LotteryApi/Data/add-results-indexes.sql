-- =============================================
-- Results Module Performance Optimization
-- Add indexes to improve query performance
-- Created: 2025-12-13
-- =============================================

USE [lottery-db];
GO

-- Index for Draw filtering by active status and time
-- Supports: WHERE d.IsActive = true ORDER BY d.DrawTime, d.DrawName
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_draws_IsActive_DrawTime_DrawName' AND object_id = OBJECT_ID('dbo.draws'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_draws_IsActive_DrawTime_DrawName
    ON dbo.draws (is_active, draw_time, draw_name)
    INCLUDE (draw_id, abbreviation, display_color);
    PRINT 'Created index: IX_draws_IsActive_DrawTime_DrawName';
END
ELSE
BEGIN
    PRINT 'Index already exists: IX_draws_IsActive_DrawTime_DrawName';
END
GO

-- Index for Draw filtering by weekly schedule usage
-- Supports: WHERE d.IsActive = true AND d.UseWeeklySchedule
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_draws_IsActive_UseWeeklySchedule' AND object_id = OBJECT_ID('dbo.draws'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_draws_IsActive_UseWeeklySchedule
    ON dbo.draws (is_active, use_weekly_schedule)
    INCLUDE (draw_id, draw_time, draw_name, abbreviation, display_color);
    PRINT 'Created index: IX_draws_IsActive_UseWeeklySchedule';
END
ELSE
BEGIN
    PRINT 'Index already exists: IX_draws_IsActive_UseWeeklySchedule';
END
GO

-- Index for DrawWeeklySchedule filtering by day of week
-- Supports: WHERE s.DayOfWeek = @dayOfWeek AND s.IsActive
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive' AND object_id = OBJECT_ID('dbo.draw_weekly_schedules'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive
    ON dbo.draw_weekly_schedules (draw_id, day_of_week, is_active)
    INCLUDE (schedule_id);
    PRINT 'Created index: IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive';
END
ELSE
BEGIN
    PRINT 'Index already exists: IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive';
END
GO

-- Index for Results filtering by date
-- Supports: WHERE r.ResultDate.Date = @date
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_results_ResultDate_DrawId' AND object_id = OBJECT_ID('dbo.results'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_results_ResultDate_DrawId
    ON dbo.results (result_date, draw_id)
    INCLUDE (result_id, winning_number, additional_number, position, created_at, created_by, updated_at, approved_at, approved_by);
    PRINT 'Created index: IX_results_ResultDate_DrawId';
END
ELSE
BEGIN
    PRINT 'Index already exists: IX_results_ResultDate_DrawId';
END
GO

-- Index for Results filtering by draw (if not already exists)
-- Supports: WHERE r.DrawId = @drawId
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_results_DrawId' AND object_id = OBJECT_ID('dbo.results'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_results_DrawId
    ON dbo.results (draw_id)
    INCLUDE (result_id, result_date, winning_number, additional_number, position, created_at);
    PRINT 'Created index: IX_results_DrawId';
END
ELSE
BEGIN
    PRINT 'Index already exists: IX_results_DrawId';
END
GO

-- Display statistics
PRINT '';
PRINT '=== Index Statistics ===';
SELECT
    i.name AS IndexName,
    t.name AS TableName,
    i.type_desc AS IndexType,
    STATS_DATE(i.object_id, i.index_id) AS LastUpdated
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('draws', 'draw_weekly_schedules', 'results')
    AND i.name LIKE 'IX_%'
ORDER BY t.name, i.name;
GO

PRINT '';
PRINT 'Results optimization indexes created/verified successfully!';
GO
