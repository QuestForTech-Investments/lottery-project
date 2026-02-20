-- Add permissions for previous-day and future ticket date features
-- Run this against the lottery database to enable the new buttons
-- Safe to run multiple times (idempotent)

IF NOT EXISTS (SELECT 1 FROM permissions WHERE permission_code = 'TICKET_PREVIOUS_DAY_SALE')
  INSERT INTO permissions (permission_code, permission_name, category, description, is_active, created_at)
  VALUES ('TICKET_PREVIOUS_DAY_SALE', 'Venta Dia Anterior', 'Tickets', 'Permite crear tickets con fecha del dia anterior', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM permissions WHERE permission_code = 'TICKET_FUTURE_SALE')
  INSERT INTO permissions (permission_code, permission_name, category, description, is_active, created_at)
  VALUES ('TICKET_FUTURE_SALE', 'Venta Futura', 'Tickets', 'Permite crear tickets con fecha futura (hasta 7 dias)', 1, GETUTCDATE());

-- NOTE: SELL_OUT_OF_HOURS (permission_id=26) already exists in the database.
-- It is used by the "Vender Fuera de Horario" button to bypass draw closing time validation.
