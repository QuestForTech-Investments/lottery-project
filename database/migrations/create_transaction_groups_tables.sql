-- Transaction Groups (header)
CREATE TABLE transaction_groups (
  group_id INT IDENTITY(1,1) PRIMARY KEY,
  group_number VARCHAR(20) NOT NULL,
  zone_id INT NULL,
  notes NVARCHAR(500) NULL,
  is_automatic BIT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  created_by INT NULL,
  FOREIGN KEY (zone_id) REFERENCES zones(zone_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE INDEX IX_transaction_groups_created ON transaction_groups(created_at);
CREATE INDEX IX_transaction_groups_status ON transaction_groups(status);

-- Transaction Group Lines (detail)
CREATE TABLE transaction_group_lines (
  line_id INT IDENTITY(1,1) PRIMARY KEY,
  group_id INT NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  -- Entity 1
  entity1_type VARCHAR(20) NOT NULL,
  entity1_id INT NOT NULL,
  entity1_name NVARCHAR(150) NOT NULL,
  entity1_code VARCHAR(50) NOT NULL,
  entity1_initial_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  entity1_final_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- Entity 2 (nullable for Gasto where consumidor is optional text)
  entity2_type VARCHAR(20) NULL,
  entity2_id INT NULL,
  entity2_name NVARCHAR(150) NULL,
  entity2_code VARCHAR(50) NULL,
  entity2_initial_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  entity2_final_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- Amounts
  debit DECIMAL(12,2) NOT NULL DEFAULT 0,
  credit DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- Extra
  expense_category NVARCHAR(150) NULL,
  notes NVARCHAR(500) NULL,
  show_in_banca BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  FOREIGN KEY (group_id) REFERENCES transaction_groups(group_id)
);

CREATE INDEX IX_tgl_group ON transaction_group_lines(group_id);
CREATE INDEX IX_tgl_entity1 ON transaction_group_lines(entity1_type, entity1_id);
