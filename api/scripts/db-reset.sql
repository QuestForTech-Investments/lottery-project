-- ============================================================================
-- DATABASE RESET SCRIPT - Lottery System
-- ============================================================================
-- Purpose: Clean database and reseed with minimal admin data
--
-- SAFETY: This script is DESTRUCTIVE. Only run in DEV/STAGING environments.
--
-- What gets DELETED:
--   - All tickets and ticket lines
--   - All users (except admin reseed)
--   - All betting pools (except admin reseed)
--   - All zones (except admin reseed)
--   - All banks
--   - Related N:M and child tables
--
-- What gets KEPT:
--   - Countries, Lotteries, Draws
--   - Game types, Bet types, Prize types
--   - Roles, Permissions
--   - Results, Result logs
--   - Draw configurations
--
-- ============================================================================

SET NOCOUNT ON;
BEGIN TRANSACTION;

BEGIN TRY
    PRINT '============================================';
    PRINT 'Starting Database Reset...';
    PRINT 'Timestamp: ' + CONVERT(VARCHAR, GETDATE(), 120);
    PRINT '============================================';

    -- ========================================================================
    -- PHASE 1: Delete transactional data (tickets, prizes)
    -- ========================================================================
    PRINT '';
    PRINT '--- PHASE 1: Deleting transactional data ---';

    -- Delete ticket lines first (FK to tickets)
    DELETE FROM ticket_lines;
    PRINT 'Deleted from ticket_lines: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- Delete tickets
    DELETE FROM tickets;
    PRINT 'Deleted from tickets: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- Delete prizes (if exists)
    IF OBJECT_ID('prizes', 'U') IS NOT NULL
    BEGIN
        DELETE FROM prizes;
        PRINT 'Deleted from prizes: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';
    END

    -- ========================================================================
    -- PHASE 2: Delete audit/session data
    -- ========================================================================
    PRINT '';
    PRINT '--- PHASE 2: Deleting audit data ---';

    -- Delete login sessions
    IF OBJECT_ID('login_sessions', 'U') IS NOT NULL
    BEGIN
        DELETE FROM login_sessions;
        PRINT 'Deleted from login_sessions: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';
    END

    -- ========================================================================
    -- PHASE 3: Delete N:M relationship tables
    -- ========================================================================
    PRINT '';
    PRINT '--- PHASE 3: Deleting N:M relationships ---';

    DELETE FROM user_permissions;
    PRINT 'Deleted from user_permissions: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM user_betting_pools;
    PRINT 'Deleted from user_betting_pools: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM user_zones;
    PRINT 'Deleted from user_zones: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- ========================================================================
    -- PHASE 4: Delete betting pool child tables
    -- ========================================================================
    PRINT '';
    PRINT '--- PHASE 4: Deleting betting pool configs ---';

    DELETE FROM balances;
    PRINT 'Deleted from balances: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- Actual table names (singular form)
    DELETE FROM betting_pool_config;
    PRINT 'Deleted from betting_pool_config: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_print_config;
    PRINT 'Deleted from betting_pool_print_config: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_discount_config;
    PRINT 'Deleted from betting_pool_discount_config: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_general_config;
    PRINT 'Deleted from betting_pool_general_config: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_draw_config;
    PRINT 'Deleted from betting_pool_draw_config: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_footers;
    PRINT 'Deleted from betting_pool_footers: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_styles;
    PRINT 'Deleted from betting_pool_styles: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_schedules;
    PRINT 'Deleted from betting_pool_schedules: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_draw_game_types;
    PRINT 'Deleted from betting_pool_draw_game_types: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_draws;
    PRINT 'Deleted from betting_pool_draws: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_automatic_expenses;
    PRINT 'Deleted from betting_pool_automatic_expenses: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pool_prizes_commissions;
    PRINT 'Deleted from betting_pool_prizes_commissions: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- Banca prize configs
    DELETE FROM banca_prize_configs;
    PRINT 'Deleted from banca_prize_configs: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- Additional transactional tables
    DELETE FROM limit_consumption;
    PRINT 'Deleted from limit_consumption: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM financial_transactions;
    PRINT 'Deleted from financial_transactions: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- ========================================================================
    -- PHASE 5: Delete main entities
    -- ========================================================================
    PRINT '';
    PRINT '--- PHASE 5: Deleting main entities ---';

    DELETE FROM users;
    PRINT 'Deleted from users: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM betting_pools;
    PRINT 'Deleted from betting_pools: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM zones;
    PRINT 'Deleted from zones: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    DELETE FROM banks;
    PRINT 'Deleted from banks: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows';

    -- ========================================================================
    -- PHASE 6: Reseed admin data
    -- ========================================================================
    PRINT '';
    PRINT '--- PHASE 6: Reseeding admin data ---';

    -- First, ensure we have the admin role (roles might be empty)
    -- Note: roles table does NOT have IDENTITY
    IF NOT EXISTS (SELECT 1 FROM roles WHERE role_id = 1)
    BEGIN
        INSERT INTO roles (role_id, role_name, description, is_active, created_at)
        VALUES (1, 'Administrator', 'System administrator with full access', 1, GETDATE());
        PRINT 'Created role: Administrator (ID=1)';
    END
    ELSE
    BEGIN
        PRINT 'Role Administrator (ID=1) already exists';
    END

    -- Insert admin zone (zones table does NOT have IDENTITY)
    INSERT INTO zones (zone_id, zone_name, country_id, is_active, created_at)
    VALUES (1, 'Zona Admin', 1, 1, GETDATE());
    PRINT 'Created zone: Zona Admin (ID=1)';

    -- Insert admin betting pool (ID=9 as per requirements)
    SET IDENTITY_INSERT betting_pools ON;
    INSERT INTO betting_pools (
        betting_pool_id,
        betting_pool_code,
        betting_pool_name,
        zone_id,
        is_active,
        created_at
    )
    VALUES (9, 'ADMIN001', 'admin', 1, 1, GETDATE());
    SET IDENTITY_INSERT betting_pools OFF;
    PRINT 'Created betting pool: admin (ID=9)';

    -- Create balance for admin betting pool
    -- Schema: balance_id, betting_pool_id, current_balance, last_updated, updated_by
    -- NOTE: balance_id is NOT IDENTITY, must provide explicit value
    INSERT INTO balances (balance_id, betting_pool_id, current_balance, last_updated)
    VALUES (1, 9, 0.00, GETDATE());
    PRINT 'Created balance for betting pool ID=9';

    -- Insert admin user
    -- Password: Admin123456 (BCrypt hash generated with cost=11)
    SET IDENTITY_INSERT users ON;
    INSERT INTO users (
        user_id,
        username,
        password_hash,
        email,
        full_name,
        role_id,
        is_active,
        created_at
    )
    VALUES (
        11,
        'admin',
        '$2a$11$bwyhx05wBDQwxx3Ad4qrVe1t3CuSXfzRkcTmLuZecvCHjDkVFqSla', -- Admin123456
        'admin@lottery.com',
        'Administrador',
        1, -- Assuming role_id=1 is admin role
        1,
        GETDATE()
    );
    SET IDENTITY_INSERT users OFF;
    PRINT 'Created user: admin (ID=11)';

    -- Link admin user to admin betting pool
    -- Schema: user_betting_pool_id, user_id, betting_pool_id, is_primary, is_active, created_at, created_by, updated_at, updated_by
    INSERT INTO user_betting_pools (user_id, betting_pool_id, is_primary, is_active, created_at)
    VALUES (11, 9, 1, 1, GETDATE());
    PRINT 'Linked admin user to betting pool ID=9';

    -- Link admin user to admin zone
    -- Schema: user_zone_id, user_id, zone_id, is_active, created_at, created_by, updated_at, updated_by
    INSERT INTO user_zones (user_id, zone_id, is_active, created_at)
    VALUES (11, 1, 1, GETDATE());
    PRINT 'Linked admin user to zone ID=1';

    -- ========================================================================
    -- PHASE 7: Verification
    -- ========================================================================
    PRINT '';
    PRINT '============================================';
    PRINT 'VERIFICATION - Final counts:';
    PRINT '============================================';

    SELECT 'tickets' as [Table], COUNT(*) as [Count] FROM tickets
    UNION ALL
    SELECT 'ticket_lines', COUNT(*) FROM ticket_lines
    UNION ALL
    SELECT 'users', COUNT(*) FROM users
    UNION ALL
    SELECT 'betting_pools', COUNT(*) FROM betting_pools
    UNION ALL
    SELECT 'zones', COUNT(*) FROM zones
    UNION ALL
    SELECT 'banks', COUNT(*) FROM banks
    UNION ALL
    SELECT 'user_betting_pools', COUNT(*) FROM user_betting_pools
    UNION ALL
    SELECT 'user_zones', COUNT(*) FROM user_zones
    UNION ALL
    SELECT 'balances', COUNT(*) FROM balances;

    PRINT '';
    PRINT 'Admin User Details:';
    SELECT user_id, username, email, full_name, is_active
    FROM users WHERE username = 'admin';

    PRINT '';
    PRINT 'Admin Betting Pool Details:';
    SELECT betting_pool_id, betting_pool_code, betting_pool_name, zone_id, is_active
    FROM betting_pools WHERE betting_pool_id = 9;

    COMMIT TRANSACTION;

    PRINT '';
    PRINT '============================================';
    PRINT 'Database reset completed successfully!';
    PRINT '============================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    PRINT '';
    PRINT '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!';
    PRINT 'ERROR: Database reset FAILED!';
    PRINT 'Error: ' + ERROR_MESSAGE();
    PRINT 'Line: ' + CAST(ERROR_LINE() AS VARCHAR);
    PRINT 'Transaction rolled back.';
    PRINT '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!';

    THROW;
END CATCH;
