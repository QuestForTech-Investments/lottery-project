-- Migration: Add discount_mode column to tickets table
-- Tracks whether a ticket's discount is GRUPO (group absorbs) or RIFERO (seller absorbs)
-- Values: OFF (no discount), GRUPO, RIFERO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('tickets')
    AND name = 'discount_mode'
)
BEGIN
    ALTER TABLE tickets ADD discount_mode NVARCHAR(10) NULL DEFAULT 'OFF';
END
GO
