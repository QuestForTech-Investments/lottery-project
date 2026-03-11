-- Create loans tables
-- Run against: lottery-db (Azure SQL)

CREATE TABLE loans (
    loan_id INT PRIMARY KEY IDENTITY(1,1),
    loan_number VARCHAR(20) NOT NULL,
    entity_type VARCHAR(20) NOT NULL DEFAULT 'bettingPool',
    entity_id INT NOT NULL,
    entity_name NVARCHAR(200) NOT NULL,
    entity_code VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(18,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 0.00,
    installment_amount DECIMAL(18,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'annual'
    payment_day INT NULL, -- 0-6 for weekly (Mon-Sun), 1-31 for monthly
    start_date DATE NOT NULL,
    total_paid DECIMAL(18,2) DEFAULT 0.00,
    remaining_balance DECIMAL(18,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    notes NVARCHAR(500) NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    created_by INT NULL,
    updated_at DATETIME2 NULL,
    updated_by INT NULL,
    CONSTRAINT FK_loans_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE loan_payments (
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    loan_id INT NOT NULL,
    payment_date DATETIME2 NOT NULL,
    amount_paid DECIMAL(18,2) NOT NULL,
    notes NVARCHAR(500) NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    created_by INT NULL,
    CONSTRAINT FK_loan_payments_loan FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
    CONSTRAINT FK_loan_payments_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
);
