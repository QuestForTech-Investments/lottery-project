-- ============================================================================
-- ONE-TIME script: scrubs lottery-db-lacentral after cloning from lottery-db.
-- Deletes transactional/customer-specific data; KEEPS reference data so that
-- lottery_code / draw_code match Lottobook (required for cross-tenant
-- result sync to identify matching draws).
--
-- KEEPS:
--   lotteries, draws, draw_weekly_schedules
--   game_categories, game_types, bet_types
--   lottery_bet_type_compatibility, draw_bet_type_compatibility,
--   draw_game_compatibility, lottery_game_compatibility
--   permissions, roles, role_permissions
--   prize defaults / configs (system-level only)
--
-- DELETES (cleans down to empty tables, preserves schema):
--   ALL ticket_lines, tickets
--   ALL results, result_logs
--   ALL email_send_log, betting_pool_audit_log
--   ALL balance / balance history / transactions / transaction groups
--   ALL caida / limit consumption history
--   ALL users + user_permissions + user_zones + user_betting_pools
--   ALL betting_pools + betting_pool_configs + betting_pool_drawss + etc.
--   ALL zones, banks, accountable_entities, debt_collectors
--   ALL warnings, anomalies
--   ALL external_tenants (will be configured per-tenant)
--
-- Then inserts a single bootstrap admin user.
-- ============================================================================

SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- ─────────────────────────────────────────────────────────────────────
-- Tables to KEEP intact (system reference data). Anything not in this
-- list gets emptied. This makes the script robust to schema changes:
-- new tenant-specific tables get cleaned automatically. The keep list
-- is hand-curated for what's needed by sync + lookups.
-- ─────────────────────────────────────────────────────────────────────
DECLARE @keepTables TABLE (name SYSNAME PRIMARY KEY);
INSERT INTO @keepTables VALUES
    ('countries'),
    ('lotteries'),
    ('draws'),
    ('draw_weekly_schedules'),
    ('game_categories'),
    ('game_types'),
    ('bet_types'),
    ('lottery_bet_type_compatibility'),
    ('draw_bet_type_compatibility'),
    ('draw_game_compatibility'),
    ('lottery_game_compatibility'),
    ('permissions'),
    ('roles'),
    ('role_permissions'),
    ('prize_categories'),
    ('prize_fields'),
    ('prize_types'),
    -- The users table is handled specially below (keep one admin only).
    ('users'),
    ('user_permissions');

-- ─────────────────────────────────────────────────────────────────────
-- Disable all FK constraints so the order of deletes doesn't matter.
-- Re-enabled at the end with WITH CHECK — if the post-state violates
-- any FK, the validation fails and the transaction rolls back.
-- ─────────────────────────────────────────────────────────────────────
DECLARE @disableFks NVARCHAR(MAX) = N'';
SELECT @disableFks += 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + '] NOCHECK CONSTRAINT [' + name + '];' + CHAR(10)
FROM sys.foreign_keys;
EXEC sp_executesql @disableFks;

-- ─────────────────────────────────────────────────────────────────────
-- DELETE all rows from every dbo table NOT in the keep list. The users +
-- user_permissions tables are kept here so the admin-preservation logic
-- below can run; we then DELETE the non-admin rows.
-- ─────────────────────────────────────────────────────────────────────
DECLARE @wipe NVARCHAR(MAX) = N'';
SELECT @wipe += 'DELETE FROM [' + s.name + '].[' + t.name + '];' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name = 'dbo'
  AND t.name NOT IN (SELECT name FROM @keepTables);
EXEC sp_executesql @wipe;

-- ─────────────────────────────────────────────────────────────────────
-- Users — keep ONLY the 'admin' user from Lottobook (same credentials).
-- The operator changes the password / email from the UI on first login.
-- ─────────────────────────────────────────────────────────────────────
DECLARE @keepUserId INT = (
    SELECT TOP 1 user_id FROM dbo.users
    WHERE username = 'admin'
    ORDER BY user_id
);

-- Drop perms for everyone we're about to delete (FK cleanup).
DELETE FROM dbo.user_permissions WHERE user_id <> ISNULL(@keepUserId, -1);

-- Drop everyone except the admin we're keeping.
DELETE FROM dbo.users WHERE user_id <> ISNULL(@keepUserId, -1);

-- Update the kept admin's metadata for La Central + ensure it's active.
IF @keepUserId IS NOT NULL
BEGIN
    UPDATE dbo.users
    SET email = 'admin@lacentralnumbers.com',
        is_active = 1,
        full_name = 'Admin La Central',
        updated_at = SYSUTCDATETIME()
    WHERE user_id = @keepUserId;

    -- Make sure the admin has every active permission for the bootstrap.
    INSERT INTO dbo.user_permissions (user_id, permission_id, is_active, created_at)
    SELECT @keepUserId, p.permission_id, 1, SYSUTCDATETIME()
    FROM dbo.permissions p
    WHERE p.is_active = 1
      AND NOT EXISTS (
        SELECT 1 FROM dbo.user_permissions up
        WHERE up.user_id = @keepUserId AND up.permission_id = p.permission_id
      );
END;

-- ─────────────────────────────────────────────────────────────────────
-- Tier 4: reset identity seeds on every empty table that actually has
-- one. Tables without an identity column (e.g. zones with a manual PK)
-- are silently skipped.
-- ─────────────────────────────────────────────────────────────────────
DECLARE @reseed NVARCHAR(MAX) = N'';
SELECT @reseed += 'DBCC CHECKIDENT(''' + s.name + '.' + t.name + ''', RESEED, 0) WITH NO_INFOMSGS;' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.identity_columns ic ON ic.object_id = t.object_id
WHERE s.name = 'dbo';
EXEC sp_executesql @reseed;

-- ─────────────────────────────────────────────────────────────────────
-- Re-enable all FK constraints WITH CHECK. If anything is inconsistent,
-- this will fail and trigger the rollback.
-- ─────────────────────────────────────────────────────────────────────
DECLARE @enableFks NVARCHAR(MAX) = N'';
SELECT @enableFks += 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + '] WITH CHECK CHECK CONSTRAINT [' + name + '];' + CHAR(10)
FROM sys.foreign_keys;
EXEC sp_executesql @enableFks;

COMMIT TRANSACTION;
GO

PRINT 'SCRUB COMPLETE — La Central DB ready.';
PRINT 'Admin user kept from Lottobook with same password — change on first login.';
