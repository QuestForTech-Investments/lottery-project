-- ============================================================
-- Warnings table — system-wide alerts for suspicious / notable
-- actions on tickets, results, etc.
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'warnings')
BEGIN
    CREATE TABLE warnings (
        warning_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
        warning_type    NVARCHAR(50)  NOT NULL,
        severity        NVARCHAR(20)  NOT NULL DEFAULT 'medium',
        betting_pool_id INT           NULL,
        user_id         INT           NULL,
        reference_id    NVARCHAR(50)  NULL,
        reference_type  NVARCHAR(30)  NULL,
        message         NVARCHAR(500) NULL,
        metadata_json   NVARCHAR(MAX) NULL,
        created_at      DATETIME2     NOT NULL DEFAULT GETUTCDATE()
    );

    CREATE INDEX IX_warnings_created_at      ON warnings(created_at);
    CREATE INDEX IX_warnings_type_created    ON warnings(warning_type, created_at);
    CREATE INDEX IX_warnings_type_reference  ON warnings(warning_type, reference_id, reference_type);
END;
GO
