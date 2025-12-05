-- =============================================
-- Create Login Sessions Table
-- Tracks user login history across different device types
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'login_sessions')
BEGIN
    CREATE TABLE login_sessions (
        session_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        betting_pool_id INT NULL,
        zone_id INT NULL,

        -- Device type: 1=Web, 2=Mobile Browser, 3=App
        device_type TINYINT NOT NULL DEFAULT 1,

        -- IP and user agent for security/collision detection
        ip_address VARCHAR(45) NULL,
        user_agent VARCHAR(500) NULL,

        -- Session timestamps
        login_at DATETIME NOT NULL DEFAULT GETDATE(),
        logout_at DATETIME NULL,

        -- Additional metadata
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),

        -- Foreign keys
        CONSTRAINT FK_login_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id),
        CONSTRAINT FK_login_sessions_betting_pool FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id),
        CONSTRAINT FK_login_sessions_zone FOREIGN KEY (zone_id) REFERENCES zones(zone_id)
    );

    -- Indexes for common queries
    CREATE INDEX IX_login_sessions_user_id ON login_sessions(user_id);
    CREATE INDEX IX_login_sessions_betting_pool_id ON login_sessions(betting_pool_id);
    CREATE INDEX IX_login_sessions_zone_id ON login_sessions(zone_id);
    CREATE INDEX IX_login_sessions_login_at ON login_sessions(login_at);
    CREATE INDEX IX_login_sessions_ip_address ON login_sessions(ip_address);
    CREATE INDEX IX_login_sessions_device_type ON login_sessions(device_type);

    -- Composite index for date + zone queries (common filter)
    CREATE INDEX IX_login_sessions_date_zone ON login_sessions(login_at, zone_id);

    PRINT 'Table login_sessions created successfully';
END
ELSE
BEGIN
    PRINT 'Table login_sessions already exists';
END
GO

-- Create trigger for updated_at (optional, for future use)
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_update_login_sessions')
BEGIN
    EXEC('
    CREATE TRIGGER trg_update_login_sessions
    ON login_sessions
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        -- No updated_at column currently, but trigger exists for consistency
    END
    ');
    PRINT 'Trigger trg_update_login_sessions created';
END
GO
