-- Idempotent: grants VIEW_EXTERNAL_TENANTS / MANAGE_EXTERNAL_TENANTS /
-- VIEW_RESULT_SYNC to the 'admin' user if they don't already have them.
-- Safe to run on lottery-db (Lottobook) and lottery-db-lacentral.

DECLARE @adminId INT = (SELECT TOP 1 user_id FROM dbo.users WHERE username = 'admin' ORDER BY user_id);
IF @adminId IS NULL
BEGIN
    PRINT 'No admin user found — skipping.';
    RETURN;
END;

INSERT INTO dbo.user_permissions (user_id, permission_id, is_active, created_at)
SELECT @adminId, p.permission_id, 1, SYSUTCDATETIME()
FROM dbo.permissions p
WHERE p.is_active = 1
  AND p.permission_code IN ('VIEW_EXTERNAL_TENANTS', 'MANAGE_EXTERNAL_TENANTS', 'VIEW_RESULT_SYNC')
  AND NOT EXISTS (
    SELECT 1 FROM dbo.user_permissions up
    WHERE up.user_id = @adminId AND up.permission_id = p.permission_id
  );

PRINT 'External tenant permissions granted to admin (if any were missing).';
