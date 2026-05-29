-- Email Receivers — recipients of automated lottery reports/notifications.
-- Each receiver subscribes to one notification_type (currently only
-- "MONITOREO_JUGADAS") and is linked to one or more zones via
-- email_receiver_zones. The automated job filters betting pools by those
-- zones when building the report body.
--
-- Idempotent: guarded with IF NOT EXISTS so it can be re-run safely.

IF OBJECT_ID('dbo.email_receivers', 'U') IS NULL
BEGIN
  CREATE TABLE email_receivers (
    email_receiver_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    notification_type NVARCHAR(50) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by INT NULL,
    updated_at DATETIME2 NULL,
    updated_by INT NULL
  );

  CREATE INDEX IX_email_receivers_active ON email_receivers(is_active);
  CREATE INDEX IX_email_receivers_type ON email_receivers(notification_type);
END;

-- Junction table: which zones a receiver subscribes to.
IF OBJECT_ID('dbo.email_receiver_zones', 'U') IS NULL
BEGIN
  CREATE TABLE email_receiver_zones (
    email_receiver_zone_id INT IDENTITY(1,1) PRIMARY KEY,
    email_receiver_id INT NOT NULL,
    zone_id INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_email_receiver_zones_receiver
      FOREIGN KEY (email_receiver_id) REFERENCES email_receivers(email_receiver_id) ON DELETE CASCADE,
    CONSTRAINT FK_email_receiver_zones_zone
      FOREIGN KEY (zone_id) REFERENCES zones(zone_id)
  );

  -- Prevent the same zone being attached twice to the same receiver.
  CREATE UNIQUE INDEX UX_email_receiver_zones_receiver_zone
    ON email_receiver_zones(email_receiver_id, zone_id);

  CREATE INDEX IX_email_receiver_zones_zone ON email_receiver_zones(zone_id);
END;
