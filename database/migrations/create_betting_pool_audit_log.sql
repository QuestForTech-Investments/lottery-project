-- Betting Pool Audit Log — records every change to a betting pool so admins
-- can see who edited what and when. Mirrors the existing `result_logs` audit
-- pattern (action + JSON details + IP + user).
--
-- Idempotent: guarded with IF NOT EXISTS so it can be re-run safely.

IF OBJECT_ID('dbo.betting_pool_audit_log', 'U') IS NULL
BEGIN
  CREATE TABLE betting_pool_audit_log (
    audit_log_id INT IDENTITY(1,1) PRIMARY KEY,
    betting_pool_id INT NOT NULL,
    user_id INT NULL,
    action NVARCHAR(20) NOT NULL,        -- 'CREATED' | 'UPDATED' | 'DELETED'
    details NVARCHAR(MAX) NULL,          -- JSON array of {field, oldValue, newValue}
    ip_address NVARCHAR(45) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_bp_audit_pool
      FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id),
    CONSTRAINT FK_bp_audit_user
      FOREIGN KEY (user_id) REFERENCES users(user_id)
  );

  -- Per-banca history is the primary read pattern, ordered by most recent first.
  CREATE INDEX IX_bp_audit_pool_created
    ON betting_pool_audit_log(betting_pool_id, created_at DESC);
END;

-- New permission gating the audit log view. Lives alongside MANAGE_BANKS so
-- ops/admins can grant read-only audit access without giving full edit rights.
-- Category matches the existing "Bancas" group (see MANAGE_BANKS / BANK_ACCESS)
-- so it shows up under the same section in the permissions admin UI.
IF NOT EXISTS (SELECT 1 FROM permissions WHERE permission_code = 'VIEW_BANCA_AUDIT_LOG')
BEGIN
  INSERT INTO permissions (permission_code, permission_name, category, description, is_active, created_at)
  VALUES (
    'VIEW_BANCA_AUDIT_LOG',
    'Ver auditoría de bancas',
    'Bancas',
    'Permite ver el historial de cambios de una banca',
    1,
    GETUTCDATE()
  );
END
ELSE
BEGIN
  -- Idempotent fix: the first run used the wrong category casing ('BANCAS'),
  -- which created a separate section in the admin UI. Realign it to the
  -- existing "Bancas" group.
  UPDATE permissions
  SET category = 'Bancas'
  WHERE permission_code = 'VIEW_BANCA_AUDIT_LOG'
    AND category <> 'Bancas';
END;
