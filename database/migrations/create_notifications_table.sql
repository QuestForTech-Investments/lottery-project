-- ============================================================
-- Notifications — messages sent from admins to bancas (POS) and
-- other admins. Recipients stored as CSV ids to keep the schema
-- simple; deletion of a recipient just orphans the reference.
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'notifications')
BEGIN
    CREATE TABLE notifications (
        notification_id   BIGINT IDENTITY(1,1) PRIMARY KEY,
        audience          NVARCHAR(50)   NOT NULL,                -- CSV: "banca", "admin", "banca,admin"
        banca_ids         NVARCHAR(MAX)  NULL,                    -- CSV of betting_pool_id
        zone_ids          NVARCHAR(MAX)  NULL,                    -- CSV of zone_id
        admin_user_ids    NVARCHAR(MAX)  NULL,                    -- CSV of user_id
        priority          NVARCHAR(20)   NOT NULL DEFAULT 'medium', -- low/medium/high
        notification_type NVARCHAR(50)   NOT NULL DEFAULT 'mark_as_read', -- mark_as_read/expiration_date
        expires_at        DATETIME2      NULL,
        message           NVARCHAR(500)  NOT NULL,
        created_by        INT            NULL,
        created_at        DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    );

    CREATE INDEX IX_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX IX_notifications_created_by ON notifications(created_by);
END;
GO

-- Per-recipient delivery state (read/dismissed). Each notification
-- can have many rows here — one per banca or per admin recipient.
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'notification_reads')
BEGIN
    CREATE TABLE notification_reads (
        notification_read_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        notification_id      BIGINT     NOT NULL,
        recipient_type       NVARCHAR(20) NOT NULL,   -- "banca" | "admin"
        recipient_id         INT          NOT NULL,    -- betting_pool_id or user_id
        is_read              BIT          NOT NULL DEFAULT 0,
        read_at              DATETIME2    NULL,
        created_at           DATETIME2    NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_notification_reads_notification
            FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX UX_notification_reads_recipient
        ON notification_reads(notification_id, recipient_type, recipient_id);
    CREATE INDEX IX_notification_reads_recipient_lookup
        ON notification_reads(recipient_type, recipient_id, is_read);
END;
GO
