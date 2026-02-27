-- Migration: Add is_out_of_schedule column to ticket_lines table
-- Date: 2026-02-27
-- Purpose: Track per-line out-of-schedule sales instead of only ticket-level

-- Add column (defaults to 0/false for existing rows)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'ticket_lines' AND COLUMN_NAME = 'is_out_of_schedule'
)
BEGIN
    ALTER TABLE ticket_lines
    ADD is_out_of_schedule BIT NOT NULL DEFAULT 0;

    PRINT 'Added is_out_of_schedule column to ticket_lines table';
END
ELSE
BEGIN
    PRINT 'Column is_out_of_schedule already exists on ticket_lines';
END
GO

-- Backfill: Set is_out_of_schedule = 1 for all lines in tickets that have OUT_OF_SCHEDULE flag
-- This preserves existing data by copying the ticket-level flag to all lines
UPDATE tl
SET tl.is_out_of_schedule = 1
FROM ticket_lines tl
INNER JOIN tickets t ON tl.ticket_id = t.ticket_id
WHERE t.special_flags LIKE '%OUT_OF_SCHEDULE%'
  AND tl.is_out_of_schedule = 0;

PRINT 'Backfilled is_out_of_schedule from ticket-level special_flags';
GO
