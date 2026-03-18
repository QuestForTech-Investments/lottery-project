-- Caída (Cashback) system tables
-- accumulated_fall on betting_pool_config + caida_history for audit trail

-- 1. Add accumulated_fall to betting_pool_config
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_config' AND COLUMN_NAME = 'accumulated_fall'
)
BEGIN
    ALTER TABLE betting_pool_config
    ADD accumulated_fall DECIMAL(18,2) NOT NULL DEFAULT 0;
END
GO

-- 2. Create caida_history table for audit trail
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'caida_history')
BEGIN
    CREATE TABLE caida_history (
        caida_id INT PRIMARY KEY IDENTITY(1,1),
        betting_pool_id INT NOT NULL,
        calculation_date DATE NOT NULL,
        period_type VARCHAR(30) NOT NULL, -- 'DAILY','WEEKLY','MONTHLY','ANNUAL','COLLECTION'
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_sales DECIMAL(18,2) NOT NULL DEFAULT 0,
        total_prizes DECIMAL(18,2) NOT NULL DEFAULT 0,
        total_commissions DECIMAL(18,2) NOT NULL DEFAULT 0,
        total_discounts DECIMAL(18,2) NOT NULL DEFAULT 0,
        net_amount DECIMAL(18,2) NOT NULL DEFAULT 0, -- the "final" field
        fall_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        accumulated_fall_before DECIMAL(18,2) NOT NULL DEFAULT 0,
        accumulated_fall_after DECIMAL(18,2) NOT NULL DEFAULT 0,
        caida_amount DECIMAL(18,2) NOT NULL DEFAULT 0, -- actual cashback credited
        cobro_amount DECIMAL(18,2) NULL, -- only for COLLECTION type
        notes NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        created_by INT NULL,
        CONSTRAINT FK_caida_history_betting_pool FOREIGN KEY (betting_pool_id)
            REFERENCES betting_pools(betting_pool_id),
        CONSTRAINT FK_caida_history_created_by FOREIGN KEY (created_by)
            REFERENCES users(user_id)
    );

    CREATE INDEX IX_caida_history_pool_date ON caida_history (betting_pool_id, calculation_date);
    CREATE INDEX IX_caida_history_period_type ON caida_history (period_type, calculation_date);
END
GO
