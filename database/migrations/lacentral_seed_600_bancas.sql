-- =====================================================================
-- La Central — seed 600 bancas + 600 users + user_betting_pool links
-- =====================================================================
-- One-shot batch creation. Mirrors the BettingPoolsController.CreateBettingPool
-- flow (betting_pool row + users row with POS role + user_betting_pools link).
--
-- Bancas: LC-0001..LC-0600, name "LA CENTRAL 1..600", reference "001..600",
--         zone = DEFAUL (id 1), bank = NULL.
-- Users:  username "001..600", same bcrypt hash for password "n12345",
--         role POS (id 2), email "<username>@pos.local".
-- Prize/commission config is intentionally left empty — to be configured
-- later via mass edit.
--
-- Safe to re-run: per-row idempotent — codes that already exist are
-- skipped, missing ones are filled in. All inserts run in a single
-- transaction; rollback on any failure.
-- =====================================================================

SET NOCOUNT ON;

DECLARE @zoneId INT = 1;            -- DEFAUL (sole real zone in La Central)
DECLARE @roleId INT = 2;            -- POS (system role used for banca-as-user)
-- bcrypt('n12345', cost=11). $2b$ prefix is verified the same as $2a$ by BCrypt.Net.
DECLARE @passwordHash NVARCHAR(255) = '$2b$11$ooq76xdkXcIejY307OnY1eeWzYXIp63/djD5kk8Sx086ya3ZmEyhS';
DECLARE @now DATETIME2 = SYSUTCDATETIME();

BEGIN TRY
    BEGIN TRANSACTION;

    -- Sanity guards: fail fast if state is unexpected
    IF NOT EXISTS (SELECT 1 FROM zones WHERE zone_id = @zoneId)
        THROW 50001, 'Zone id 1 (DEFAUL) not found', 1;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE role_id = @roleId AND role_name = 'POS')
        THROW 50002, 'Role id 2 (POS) not found', 1;

    DECLARE @i INT = 1;
    DECLARE @code NVARCHAR(20), @name NVARCHAR(100), @ref VARCHAR(20), @username NVARCHAR(50);
    DECLARE @bpId INT, @userId INT;
    DECLARE @skipped INT = 0, @inserted INT = 0;

    WHILE @i <= 600
    BEGIN
        SET @code     = 'LC-' + RIGHT('0000' + CAST(@i AS NVARCHAR(4)), 4);
        SET @name     = 'LA CENTRAL ' + CAST(@i AS NVARCHAR(10));
        SET @ref      = RIGHT('000' + CAST(@i AS VARCHAR(3)), 3);
        SET @username = RIGHT('000' + CAST(@i AS NVARCHAR(3)), 3);

        -- Skip if the banca code or its companion username already exists.
        -- Lets us re-run the script after partial progress (e.g. test row
        -- LC-0001) without raising duplicate-key errors.
        IF EXISTS (SELECT 1 FROM betting_pools WHERE betting_pool_code = @code)
           OR EXISTS (SELECT 1 FROM users WHERE username = @username)
        BEGIN
            SET @skipped = @skipped + 1;
            SET @i = @i + 1;
            CONTINUE;
        END

        INSERT INTO betting_pools (
            betting_pool_code, betting_pool_name, zone_id,
            reference, username, password_hash, is_active, created_at
        ) VALUES (
            @code, @name, @zoneId,
            @ref, @username, @passwordHash, 1, @now
        );
        SET @bpId = SCOPE_IDENTITY();

        INSERT INTO users (
            username, password_hash, full_name, email,
            role_id, is_active, created_at, updated_at,
            must_change_password, must_set_pin,
            is_password_locked, is_pin_locked
        ) VALUES (
            @username, @passwordHash, @name, @username + N'@pos.local',
            @roleId, 1, @now, @now,
            0, 0, 0, 0
        );
        SET @userId = SCOPE_IDENTITY();

        INSERT INTO user_betting_pools (
            user_id, betting_pool_id, is_primary, is_active, created_at
        ) VALUES (
            @userId, @bpId, 1, 1, @now
        );

        SET @inserted = @inserted + 1;
        SET @i = @i + 1;
    END

    COMMIT TRANSACTION;
    DECLARE @msg NVARCHAR(200) = CONCAT(
        'Done. Inserted=', @inserted,
        ', Skipped (already existed)=', @skipped,
        '. Target range: LC-0001..LC-0600.'
    );
    PRINT @msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH
