-- Adds preferred_language column to users so admin/banca clients can persist
-- their chosen UI language across sessions and devices. NULL = use default (es).
-- Allowed values: 'es' | 'en' | 'fr' | 'ht'

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.users') AND name = 'preferred_language'
)
BEGIN
    ALTER TABLE dbo.users
    ADD preferred_language NVARCHAR(5) NULL;
END
GO
