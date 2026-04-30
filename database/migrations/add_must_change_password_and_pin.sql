-- ============================================================
-- Add columns for forced password change and admin PIN
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='must_change_password' AND object_id=OBJECT_ID('users'))
BEGIN
    ALTER TABLE users ADD must_change_password BIT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='must_set_pin' AND object_id=OBJECT_ID('users'))
BEGIN
    ALTER TABLE users ADD must_set_pin BIT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='pin_hash' AND object_id=OBJECT_ID('users'))
BEGIN
    ALTER TABLE users ADD pin_hash NVARCHAR(255) NULL;
END
GO
