-- Transaction Approval System: Add approval columns to transaction_groups
-- Run this migration after create_transaction_groups_tables.sql

-- Widen status column for longer status names (e.g. PendienteAprobacion, PendienteEliminacion)
ALTER TABLE transaction_groups ALTER COLUMN status VARCHAR(30) NOT NULL;

-- Add approval tracking columns
ALTER TABLE transaction_groups ADD approved_by INT NULL;
ALTER TABLE transaction_groups ADD approved_at DATETIME2 NULL;
ALTER TABLE transaction_groups ADD rejection_reason NVARCHAR(500) NULL;

ALTER TABLE transaction_groups ADD CONSTRAINT FK_tg_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id);

-- Migrate existing "Pendiente" rows to "Aprobado" since their balances are already applied
UPDATE transaction_groups SET status = 'Aprobado' WHERE status = 'Pendiente';

-- Add approval permissions
INSERT INTO permissions (permission_code, permission_name, category, description, is_active)
VALUES ('TRANSACTION_APPROVE', 'Aprobar transacciones', 'Transacciones', 'Permite aprobar o rechazar transacciones pendientes', 1);

INSERT INTO permissions (permission_code, permission_name, category, description, is_active)
VALUES ('TRANSACTION_AUTO_APPROVE', 'Auto-aprobar transacciones', 'Transacciones', 'Permite crear y eliminar transacciones sin requerir aprobacion', 1);
