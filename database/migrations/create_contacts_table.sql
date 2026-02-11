IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'contacts')
BEGIN
    CREATE TABLE contacts (
        contact_id INT IDENTITY(1,1) PRIMARY KEY,
        betting_pool_id INT NOT NULL,
        contact_name NVARCHAR(100) NOT NULL,
        phone NVARCHAR(20) NULL,
        telegram_chat_id NVARCHAR(50) NULL,
        created_at DATETIME2 NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NULL,
        CONSTRAINT FK_contacts_betting_pools FOREIGN KEY (betting_pool_id)
            REFERENCES betting_pools(betting_pool_id)
    );

    CREATE INDEX IX_contacts_betting_pool_id ON contacts(betting_pool_id);
END
