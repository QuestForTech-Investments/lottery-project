CREATE TABLE accountable_entities (
  entity_id INT IDENTITY(1,1) PRIMARY KEY,
  entity_name NVARCHAR(150) NOT NULL,
  entity_code VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL DEFAULT 'Banco',
  zone_id INT NULL,
  current_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  created_by INT NULL,
  updated_at DATETIME2 NULL,
  updated_by INT NULL,
  CONSTRAINT UQ_accountable_entity_code UNIQUE (entity_code),
  FOREIGN KEY (zone_id) REFERENCES zones(zone_id)
);
CREATE INDEX IX_accountable_entities_type ON accountable_entities(entity_type);
CREATE INDEX IX_accountable_entities_zone ON accountable_entities(zone_id);
