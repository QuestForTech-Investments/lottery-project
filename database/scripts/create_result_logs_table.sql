-- =============================================
-- Create Result Logs Table
-- Tracks all result publication, modification, and deletion actions
-- Provides complete audit trail for lottery result changes
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'result_logs')
BEGIN
    CREATE TABLE result_logs (
        log_id INT IDENTITY(1,1) PRIMARY KEY,

        -- Link to the result being logged
        result_id INT NOT NULL,

        -- User who performed the action
        user_id INT NOT NULL,

        -- Action type: 'CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED'
        action VARCHAR(20) NOT NULL,

        -- Timestamp of the action
        created_at DATETIME NOT NULL DEFAULT GETDATE(),

        -- IP address of the user who performed the action
        ip_address VARCHAR(45) NULL,

        -- Additional details stored as JSON or text
        -- Example: {"field": "winning_number", "old_value": "123", "new_value": "456"}
        -- Or: {"reason": "Correction requested by lottery operator"}
        details NVARCHAR(MAX) NULL,

        -- Optional: Store old and new values for key fields
        old_winning_number VARCHAR(20) NULL,
        new_winning_number VARCHAR(20) NULL,
        old_additional_number VARCHAR(10) NULL,
        new_additional_number VARCHAR(10) NULL,

        -- Draw context (duplicated for quick access without join)
        draw_id INT NULL,
        result_date DATETIME NULL,

        -- Foreign keys
        CONSTRAINT FK_result_logs_result FOREIGN KEY (result_id)
            REFERENCES results(result_id) ON DELETE NO ACTION,
        CONSTRAINT FK_result_logs_user FOREIGN KEY (user_id)
            REFERENCES users(user_id) ON DELETE NO ACTION
    );

    -- Indexes for common queries
    CREATE INDEX IX_result_logs_result_id ON result_logs(result_id);
    CREATE INDEX IX_result_logs_user_id ON result_logs(user_id);
    CREATE INDEX IX_result_logs_created_at ON result_logs(created_at);
    CREATE INDEX IX_result_logs_action ON result_logs(action);
    CREATE INDEX IX_result_logs_draw_id ON result_logs(draw_id);

    -- Composite index for user activity reports
    CREATE INDEX IX_result_logs_user_date ON result_logs(user_id, created_at);

    -- Composite index for result history
    CREATE INDEX IX_result_logs_result_date ON result_logs(result_id, created_at);

    -- Index for IP-based security queries
    CREATE INDEX IX_result_logs_ip_address ON result_logs(ip_address)
        WHERE ip_address IS NOT NULL;

    PRINT 'Table result_logs created successfully';
END
ELSE
BEGIN
    PRINT 'Table result_logs already exists';
END
GO

-- Add helpful comments
EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Audit log for all lottery result operations (create, update, delete, approve)',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'result_logs';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Type of action: CREATED, UPDATED, DELETED, APPROVED, REJECTED',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'result_logs',
    @level2type = N'COLUMN', @level2name = N'action';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Additional context stored as JSON (e.g., reason, field changes, metadata)',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'result_logs',
    @level2type = N'COLUMN', @level2name = N'details';
GO

PRINT '✅ Result logs table and indexes created successfully';
PRINT 'ℹ️  Use this table to track all result publication and modification history';
GO
