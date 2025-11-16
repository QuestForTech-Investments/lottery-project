# SQL Server Lottery Database - Comprehensive Analysis Report

**Generated:** 2025-10-22
**Database:** lottery_database_complete.sql
**SQL Server Version:** SQL Server 2022 / Azure SQL Compatible
**Total Tables:** 32+
**Total Stored Procedures:** 10+
**Total Views:** 9+

---

## EXECUTIVE SUMMARY

### Overall Assessment: **GOOD** (with Critical Improvements Needed)

The database demonstrates a well-thought-out modular architecture with excellent separation of concerns for betting pool configurations. However, there are **13 critical issues** and **27 recommended improvements** that should be addressed before production deployment.

**Key Strengths:**
- Excellent modular refactoring of betting_pools configuration (12 specialized tables)
- Comprehensive N:M relationship handling
- Good audit trail foundation
- Well-documented stored procedures

**Critical Concerns:**
- Missing indexes for critical queries
- No CHECK constraints for business rules
- Inconsistent ID generation (manual vs IDENTITY)
- Missing transaction isolation level specifications
- No explicit error logging tables
- Security: passwords stored in betting_pools table

---

## 1. SCHEMA INCONSISTENCIES

### CRITICAL ISSUES

#### 1.1 Inconsistent Primary Key Strategy

**Issue:** Mix of IDENTITY and manual ID assignment
```sql
-- IDENTITY (Good)
[ticket_id] BIGINT NOT NULL IDENTITY(1,1)

-- Manual (Problematic)
[betting_pool_id] int NOT NULL  -- No IDENTITY
[country_id] int NOT NULL        -- No IDENTITY
```

**Impact:** Race conditions, duplicate key violations, application complexity

**Recommendation:**
```sql
-- SOLUTION 1: Use IDENTITY for all tables
ALTER TABLE betting_pools
    ALTER COLUMN betting_pool_id INT NOT NULL;
GO
ALTER TABLE betting_pools
    ADD betting_pool_id_new INT NOT NULL IDENTITY(1,1);
-- Then migrate data and swap columns

-- SOLUTION 2: Use SEQUENCE objects for consistency
CREATE SEQUENCE seq_betting_pool_id
    START WITH 1
    INCREMENT BY 1;
GO

-- Then use in default:
ALTER TABLE betting_pools
    ADD CONSTRAINT DF_betting_pool_id
    DEFAULT (NEXT VALUE FOR seq_betting_pool_id) FOR betting_pool_id;
```

#### 1.2 Duplicate game_types Table Definition

**Issue:** Table defined twice (lines 169-196 and 933-950)
```sql
-- First definition (with category_id FK)
CREATE TABLE [dbo].[game_types] (
    [game_type_id] int NOT NULL,
    [category_id] int NOT NULL,  -- FK to game_categories
    ...

-- Second definition (standalone)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'game_types')
BEGIN
    CREATE TABLE [dbo].[game_types] (
        [game_type_id] INT NOT NULL IDENTITY(1,1),  -- Different!
        [game_type_code] VARCHAR(50) NOT NULL,
        ...
```

**Impact:** Schema confusion, potential deployment errors

**Recommendation:**
```sql
-- Remove the second definition entirely
-- Keep only the first definition with proper FK relationships
-- Add the code/name fields to the first definition:

CREATE TABLE [dbo].[game_types] (
    [game_type_id] int NOT NULL IDENTITY(1,1),
    [category_id] int NOT NULL,
    [game_type_code] VARCHAR(50) NOT NULL,
    [game_type_name] NVARCHAR(100) NOT NULL,
    [game_name] nvarchar(100) NOT NULL,
    [description] nvarchar(500) NULL,
    [prize_multiplier] decimal(10,2) NULL DEFAULT 1.00,
    [requires_additional_number] bit NULL DEFAULT 0,
    [number_length] int NULL DEFAULT 4,
    [is_active] bit NULL DEFAULT 1,
    [display_order] INT NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_game_types] PRIMARY KEY ([game_type_id]),
    CONSTRAINT [UQ_game_type_code] UNIQUE ([game_type_code])
);
```

#### 1.3 Missing NOT NULL Constraints on Critical Fields

**Issue:** Foreign keys allowing NULL inappropriately
```sql
-- betting_pools.zone_id should NOT be NULL
[zone_id] int NOT NULL,  -- Good

-- BUT: bank_id allows NULL
[bank_id] int NULL,      -- Risky - every betting pool should have a bank

-- users.role_id allows NULL
[role_id] int NULL,      -- Users without roles?
```

**Recommendation:**
```sql
-- Make critical FKs NOT NULL
ALTER TABLE betting_pools
    ALTER COLUMN bank_id INT NOT NULL;

-- Or create a default "NO_BANK" record
INSERT INTO banks (bank_id, bank_name, bank_code, is_active)
VALUES (-1, 'NO BANK ASSIGNED', 'N/A', 1);

-- Then set default
ALTER TABLE betting_pools
    ADD CONSTRAINT DF_betting_pools_bank_id DEFAULT (-1) FOR bank_id;
```

---

## 2. MISSING FOREIGN KEYS

### All Foreign Keys Are Present ✓

**Good:** The schema has comprehensive FK relationships defined.

**Areas to Verify:**
- `prizes.line_id` references `ticket_lines(line_id)` - but column is INT, should be BIGINT
- `results.position` field doesn't exist but is referenced in SP logic

**Fix Required:**
```sql
-- Fix data type mismatch
ALTER TABLE prizes
    ALTER COLUMN line_id BIGINT NOT NULL;

-- Add missing position field to results
ALTER TABLE results
    ADD position INT NULL; -- 1=First, 2=Second, 3=Third

-- Add CHECK constraint
ALTER TABLE results
    ADD CONSTRAINT CHK_results_position
    CHECK (position IS NULL OR position BETWEEN 1 AND 3);
```

---

## 3. INDEX OPTIMIZATION

### CRITICAL MISSING INDEXES

#### 3.1 Missing Composite Indexes for Frequent Queries

**Issue:** Queries on multiple columns lack covering indexes

```sql
-- Missing: Betting pool + date range queries
-- Query: SELECT * FROM tickets WHERE betting_pool_id = ? AND created_at BETWEEN ? AND ?
CREATE NONCLUSTERED INDEX IX_tickets_pool_date_status
    ON tickets (betting_pool_id, created_at DESC)
    INCLUDE (status, grand_total, total_prize, is_cancelled);

-- Missing: Number sales lookup (critical for limits)
-- Query from sp_GetNumberSales
CREATE NONCLUSTERED INDEX IX_ticket_lines_number_lottery_date
    ON ticket_lines (bet_number, lottery_id, draw_date)
    INCLUDE (bet_amount, net_amount, ticket_id)
    WHERE line_status != 'cancelled';

-- Missing: Active permissions lookup
CREATE NONCLUSTERED INDEX IX_user_permissions_user_active_expires
    ON user_permissions (user_id, is_active)
    INCLUDE (permission_id, expires_at)
    WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > GETDATE());

-- Missing: Draw results lookup
CREATE NONCLUSTERED INDEX IX_results_draw_date
    ON results (draw_id, result_date DESC)
    INCLUDE (winning_number, additional_number);

-- Missing: Zone-based betting pools
CREATE NONCLUSTERED INDEX IX_betting_pools_zone_active
    ON betting_pools (zone_id, is_active)
    INCLUDE (betting_pool_code, betting_pool_name)
    WHERE is_active = 1;
```

#### 3.2 Missing Filtered Indexes

**Issue:** Many queries filter on is_active, is_cancelled - no filtered indexes

```sql
-- Active betting pools only
CREATE NONCLUSTERED INDEX IX_betting_pools_active_only
    ON betting_pools (betting_pool_id, betting_pool_code, betting_pool_name)
    WHERE is_active = 1;

-- Non-cancelled tickets only
CREATE NONCLUSTERED INDEX IX_tickets_not_cancelled
    ON tickets (ticket_id, betting_pool_id, created_at DESC, status)
    INCLUDE (grand_total, total_prize)
    WHERE is_cancelled = 0;

-- Winner lines only (for prize calculation)
CREATE NONCLUSTERED INDEX IX_ticket_lines_winners_only
    ON ticket_lines (ticket_id, line_id, prize_amount)
    INCLUDE (bet_number, lottery_id, draw_id)
    WHERE is_winner = 1;

-- Pending winners
CREATE NONCLUSTERED INDEX IX_tickets_pending_winners
    ON tickets (betting_pool_id, created_at DESC)
    INCLUDE (ticket_code, total_prize, customer_name, customer_phone)
    WHERE status = 'winner' AND is_paid = 0 AND is_cancelled = 0;
```

#### 3.3 Missing Columnstore Indexes for Analytics

**Issue:** No columnstore indexes for reporting/analytics queries

```sql
-- For daily sales aggregations
CREATE NONCLUSTERED COLUMNSTORE INDEX NCIX_tickets_analytics
    ON tickets (
        betting_pool_id,
        created_at,
        status,
        total_lines,
        grand_total,
        total_prize,
        total_commission
    )
    WHERE is_cancelled = 0;

-- For number sales analytics (hot numbers detection)
CREATE NONCLUSTERED COLUMNSTORE INDEX NCIX_ticket_lines_analytics
    ON ticket_lines (
        lottery_id,
        draw_id,
        draw_date,
        bet_number,
        bet_amount,
        net_amount,
        prize_amount,
        is_winner
    );
```

---

## 4. DATA INTEGRITY ISSUES

### CRITICAL MISSING CHECK CONSTRAINTS

#### 4.1 Business Rule Violations Possible

```sql
-- ISSUE: Negative amounts allowed
-- Fix:
ALTER TABLE tickets
    ADD CONSTRAINT CHK_tickets_amounts_positive
    CHECK (
        total_bet_amount >= 0 AND
        total_discount >= 0 AND
        total_subtotal >= 0 AND
        total_with_multiplier >= 0 AND
        total_commission >= 0 AND
        total_net >= 0 AND
        grand_total >= 0 AND
        total_prize >= 0
    );

ALTER TABLE ticket_lines
    ADD CONSTRAINT CHK_ticket_lines_amounts_positive
    CHECK (
        bet_amount > 0 AND
        discount_amount >= 0 AND
        subtotal >= 0 AND
        total_with_multiplier >= 0 AND
        commission_amount >= 0 AND
        net_amount >= 0 AND
        prize_amount >= 0
    );

-- ISSUE: Discount can exceed 100%
-- Already has CHK but verify:
-- CHK_ticket_discount CHECK ([global_discount] >= 0.00 AND [global_discount] <= 100.00)
-- CHK_line_discount CHECK ([discount_percentage] >= 0.00 AND [discount_percentage] <= 100.00)
-- Good ✓

-- ISSUE: Commission > 100%
ALTER TABLE betting_pool_prizes_commissions
    ADD CONSTRAINT CHK_commissions_valid
    CHECK (
        (commission_discount_1 IS NULL OR (commission_discount_1 >= 0 AND commission_discount_1 <= 100)) AND
        (commission_discount_2 IS NULL OR (commission_discount_2 >= 0 AND commission_discount_2 <= 100)) AND
        (commission_discount_3 IS NULL OR (commission_discount_3 >= 0 AND commission_discount_3 <= 100)) AND
        (commission_discount_4 IS NULL OR (commission_discount_4 >= 0 AND commission_discount_4 <= 100)) AND
        (commission_2_discount_1 IS NULL OR (commission_2_discount_1 >= 0 AND commission_2_discount_1 <= 100)) AND
        (commission_2_discount_2 IS NULL OR (commission_2_discount_2 >= 0 AND commission_2_discount_2 <= 100)) AND
        (commission_2_discount_3 IS NULL OR (commission_2_discount_3 >= 0 AND commission_2_discount_3 <= 100)) AND
        (commission_2_discount_4 IS NULL OR (commission_2_discount_4 >= 0 AND commission_2_discount_4 <= 100))
    );

-- ISSUE: Betting pool schedules - day_of_week range
ALTER TABLE betting_pool_schedules
    ADD CONSTRAINT CHK_day_of_week_range
    CHECK (day_of_week BETWEEN 0 AND 6);

-- ISSUE: Balances can be negative without limit
ALTER TABLE balances
    ADD CONSTRAINT CHK_balances_credit_limit
    CHECK (
        current_balance >= -999999999.99  -- Set appropriate negative limit
    );

-- Or enforce minimum based on credit_limit from betting_pool_config
-- This requires a computed column or trigger

-- ISSUE: Prize payments should be positive
ALTER TABLE betting_pool_prizes_commissions
    ADD CONSTRAINT CHK_prize_payments_positive
    CHECK (
        (prize_payment_1 IS NULL OR prize_payment_1 >= 0) AND
        (prize_payment_2 IS NULL OR prize_payment_2 >= 0) AND
        (prize_payment_3 IS NULL OR prize_payment_3 >= 0) AND
        (prize_payment_4 IS NULL OR prize_payment_4 >= 0)
    );
```

#### 4.2 Missing Referential Integrity for Soft Deletes

**Issue:** Soft delete fields exist but no enforcement

```sql
-- Create computed column to ensure consistency
ALTER TABLE users
    ADD is_deleted AS (CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END) PERSISTED;

-- Add CHECK to ensure deleted_by is set when deleted_at is set
ALTER TABLE users
    ADD CONSTRAINT CHK_users_delete_consistency
    CHECK (
        (deleted_at IS NULL AND deleted_by IS NULL) OR
        (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
    );

-- Apply to all tables with soft delete
-- betting_pools, users, etc.
```

#### 4.3 Timestamp Consistency Issues

**Issue:** updated_at can be before created_at

```sql
-- Add CHECK constraint
ALTER TABLE tickets
    ADD CONSTRAINT CHK_tickets_timestamps
    CHECK (updated_at IS NULL OR updated_at >= created_at);

ALTER TABLE users
    ADD CONSTRAINT CHK_users_timestamps
    CHECK (updated_at IS NULL OR updated_at >= created_at);

-- Apply to all tables with created_at/updated_at
```

---

## 5. NAMING CONVENTION ISSUES

### INCONSISTENCIES FOUND

#### 5.1 Mixed Naming Styles

**Issue:** Inconsistent field naming
```sql
-- Snake case:
betting_pool_id, user_id, created_at

-- Camel case (less common):
isActive (should be is_active)

-- Mixed abbreviations:
cfg, pc, dc, st (in view aliases) - acceptable
bpd, bppc (acceptable for temp use)
```

**Status:** **ACCEPTABLE** - SQL Server convention is generally snake_case, which is followed

#### 5.2 Table Naming Inconsistency

```sql
-- Singular vs Plural
users          -- Plural ✓
roles          -- Plural ✓
permissions    -- Plural ✓
tickets        -- Plural ✓
betting_pools  -- Plural ✓

-- Inconsistency:
balances       -- Should be singular 'balance' if 1:1 with betting_pool
```

**Recommendation:** Rename `balances` to `betting_pool_balance` or keep as is (acceptable)

#### 5.3 Stored Procedure Naming

**Status:** **GOOD** - Consistent `sp_` prefix, PascalCase
- `sp_GrantPermissionToUser`
- `sp_CopyBettingPoolConfig`
- `sp_CalculateTicketTotals`

#### 5.4 View Naming

**Status:** **GOOD** - Consistent `vw_` prefix, snake_case
- `vw_users_with_direct_permissions`
- `vw_betting_pool_complete_config`
- `vw_tickets_complete`

---

## 6. MISSING CONSTRAINTS

### CRITICAL MISSING CONSTRAINTS

#### 6.1 Missing UNIQUE Constraints

```sql
-- Email should be unique
ALTER TABLE users
    ADD CONSTRAINT UQ_users_email UNIQUE (email)
    WHERE email IS NOT NULL;

-- Barcode should be unique
-- Already exists as IX_tickets_barcode (index only)
-- Make it a UNIQUE constraint:
CREATE UNIQUE NONCLUSTERED INDEX UQ_tickets_barcode
    ON tickets (barcode)
    WHERE barcode IS NOT NULL;
```

#### 6.2 Missing DEFAULT Values

```sql
-- timezone for draws (critical for multi-region)
ALTER TABLE draws
    ADD timezone VARCHAR(50) NULL DEFAULT 'America/Santo_Domingo';

-- currency_code default already exists ✓

-- Missing default for is_primary in user_betting_pools
-- Already has DEFAULT 0 ✓

-- Missing default for print_count
-- Already has DEFAULT 0 ✓
```

#### 6.3 Missing Computed Columns

```sql
-- Ticket status summary
ALTER TABLE tickets
    ADD status_summary AS (
        CASE
            WHEN is_cancelled = 1 THEN 'CANCELLED'
            WHEN is_paid = 1 THEN 'PAID'
            WHEN status = 'winner' THEN 'WINNER_PENDING'
            WHEN status = 'loser' THEN 'LOSER'
            WHEN status = 'active' THEN 'ACTIVE'
            ELSE 'PENDING'
        END
    ) PERSISTED;

-- Days since ticket creation
ALTER TABLE tickets
    ADD days_old AS (DATEDIFF(DAY, created_at, GETDATE())) PERSISTED;

-- User permission count (for performance)
-- Better as a view due to dynamic nature
```

---

## 7. STORED PROCEDURE ISSUES

### CRITICAL ISSUES

#### 7.1 Missing Transaction Isolation Levels

**Issue:** No explicit isolation levels set
```sql
-- Current:
BEGIN TRANSACTION;
-- ... operations

-- Should be:
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- or appropriate level
BEGIN TRANSACTION;
```

**Recommendation for each SP:**
```sql
CREATE OR ALTER PROCEDURE sp_GrantPermissionToUser
    @user_id INT,
    @permission_id INT,
    @grant_reason NVARCHAR(500) = NULL,
    @expires_at DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRY
        BEGIN TRANSACTION;
        -- ... existing logic
```

#### 7.2 Missing Error Logging

**Issue:** Errors printed to console, not logged to table

**Recommendation:**
```sql
-- Create error log table
CREATE TABLE [dbo].[error_logs] (
    [error_log_id] BIGINT NOT NULL IDENTITY(1,1),
    [error_date] DATETIME2 NOT NULL DEFAULT (GETDATE()),
    [procedure_name] NVARCHAR(128) NULL,
    [error_number] INT NULL,
    [error_severity] INT NULL,
    [error_state] INT NULL,
    [error_message] NVARCHAR(4000) NULL,
    [error_line] INT NULL,
    [user_id] INT NULL,
    [additional_info] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_error_logs] PRIMARY KEY ([error_log_id])
);

-- Create logging SP
CREATE OR ALTER PROCEDURE sp_LogError
    @procedure_name NVARCHAR(128),
    @user_id INT = NULL,
    @additional_info NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO error_logs (
        procedure_name,
        error_number,
        error_severity,
        error_state,
        error_message,
        error_line,
        user_id,
        additional_info
    )
    VALUES (
        @procedure_name,
        ERROR_NUMBER(),
        ERROR_SEVERITY(),
        ERROR_STATE(),
        ERROR_MESSAGE(),
        ERROR_LINE(),
        @user_id,
        @additional_info
    );
END;
GO

-- Use in procedures:
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    EXEC sp_LogError
        @procedure_name = 'sp_GrantPermissionToUser',
        @user_id = @user_id,
        @additional_info = 'Failed to grant permission';

    THROW;  -- Re-throw to caller
END CATCH
```

#### 7.3 Race Condition in ID Generation

**Issue:** Manual ID generation in SPs has race condition
```sql
-- Current (vulnerable):
DECLARE @next_id INT = (SELECT ISNULL(MAX(user_permission_id), 0) + 1
                        FROM user_permissions);

-- Two concurrent calls can get same ID!
```

**Recommendation:**
```sql
-- OPTION 1: Use OUTPUT clause
DECLARE @next_id INT;

INSERT INTO user_permissions (...)
OUTPUT inserted.user_permission_id INTO @next_id
VALUES (...);

-- OPTION 2: Use IDENTITY
-- Change all tables to use IDENTITY columns (recommended)

-- OPTION 3: Use SEQUENCE with locking
DECLARE @next_id INT = NEXT VALUE FOR seq_user_permission_id;
```

#### 7.4 Missing Input Validation

**Issue:** No validation of input parameters

```sql
CREATE OR ALTER PROCEDURE sp_GrantPermissionToUser
    @user_id INT,
    @permission_id INT,
    @grant_reason NVARCHAR(500) = NULL,
    @expires_at DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ADD VALIDATION:
    IF @user_id IS NULL OR @user_id <= 0
    BEGIN
        RAISERROR('Invalid user_id', 16, 1);
        RETURN -1;
    END

    IF @permission_id IS NULL OR @permission_id <= 0
    BEGIN
        RAISERROR('Invalid permission_id', 16, 1);
        RETURN -1;
    END

    -- Verify user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = @user_id AND is_active = 1)
    BEGIN
        RAISERROR('User does not exist or is inactive', 16, 1);
        RETURN -1;
    END

    -- Verify permission exists
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE permission_id = @permission_id AND is_active = 1)
    BEGIN
        RAISERROR('Permission does not exist or is inactive', 16, 1);
        RETURN -1;
    END

    -- Validate expires_at is in future
    IF @expires_at IS NOT NULL AND @expires_at <= GETDATE()
    BEGIN
        RAISERROR('Expiration date must be in the future', 16, 1);
        RETURN -1;
    END

    -- ... rest of procedure
```

#### 7.5 Cursor Usage in sp_GrantMultiplePermissions

**Issue:** CURSOR is inefficient for bulk operations

```sql
-- Current (line 1510-1539):
DECLARE code_cursor CURSOR FOR ...
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_GrantPermissionToUser ...
END

-- Better approach:
CREATE OR ALTER PROCEDURE sp_GrantMultiplePermissions
    @user_id INT,
    @permission_codes NVARCHAR(MAX),
    @grant_reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate user exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = @user_id AND is_active = 1)
        BEGIN
            RAISERROR('User does not exist or is inactive', 16, 1);
            RETURN -1;
        END

        -- Use set-based operation instead of cursor
        DECLARE @current_user INT = dbo.fn_GetCurrentUserId();

        -- Merge permissions
        MERGE INTO user_permissions AS target
        USING (
            SELECT
                @user_id as user_id,
                p.permission_id,
                @grant_reason as grant_reason
            FROM STRING_SPLIT(@permission_codes, ',') s
            INNER JOIN permissions p ON TRIM(s.value) = p.permission_code
            WHERE p.is_active = 1
        ) AS source
        ON target.user_id = source.user_id AND target.permission_id = source.permission_id
        WHEN MATCHED THEN
            UPDATE SET
                is_active = 1,
                updated_at = GETDATE(),
                updated_by = @current_user,
                granted_by = @current_user,
                grant_reason = source.grant_reason
        WHEN NOT MATCHED THEN
            INSERT (user_id, permission_id, is_active, created_at, created_by, granted_by, grant_reason)
            VALUES (source.user_id, source.permission_id, 1, GETDATE(), @current_user, @current_user, source.grant_reason);

        COMMIT TRANSACTION;

        PRINT 'Permissions granted successfully';
        RETURN 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        EXEC sp_LogError
            @procedure_name = 'sp_GrantMultiplePermissions',
            @user_id = @user_id;

        THROW;
    END CATCH
END;
```

#### 7.6 Missing Result Validation in sp_CheckTicketWinners

**Issue:** No validation that results exist for the draw

```sql
CREATE OR ALTER PROCEDURE sp_CheckTicketWinners
    @ticket_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- ADD: Verify ticket exists
        IF NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_id = @ticket_id)
        BEGIN
            RAISERROR('Ticket not found', 16, 1);
            RETURN -1;
        END

        -- ADD: Verify ticket is not cancelled
        IF EXISTS (SELECT 1 FROM tickets WHERE ticket_id = @ticket_id AND is_cancelled = 1)
        BEGIN
            RAISERROR('Cannot check cancelled ticket', 16, 1);
            RETURN -1;
        END

        -- ADD: Verify results exist for all draws in ticket
        IF EXISTS (
            SELECT 1
            FROM ticket_lines tl
            LEFT JOIN results r ON tl.draw_id = r.draw_id AND CAST(tl.draw_date AS DATE) = CAST(r.result_date AS DATE)
            WHERE tl.ticket_id = @ticket_id
            AND r.result_id IS NULL
        )
        BEGIN
            RAISERROR('Results not available for all draws in ticket', 16, 1);
            RETURN -1;
        END

        -- ... rest of procedure
```

---

## 8. SECURITY CONCERNS

### CRITICAL SECURITY ISSUES

#### 8.1 Password Storage in betting_pools Table

**Issue:** Plain text password hash in betting_pools (line 357)
```sql
[password_hash] varchar(255) NULL,
```

**Concerns:**
1. Is this even used? betting_pools should not have login credentials
2. If needed, should reference users table instead
3. VARCHAR instead of NVARCHAR

**Recommendation:**
```sql
-- OPTION 1: Remove entirely if not used
ALTER TABLE betting_pools
    DROP COLUMN username, password_hash;

-- OPTION 2: If needed, create proper authentication
CREATE TABLE betting_pool_credentials (
    credential_id INT NOT NULL IDENTITY(1,1),
    betting_pool_id INT NOT NULL,
    username NVARCHAR(100) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,  -- BCrypt/Argon2 hash
    salt NVARCHAR(255) NOT NULL,
    hash_algorithm VARCHAR(50) NOT NULL DEFAULT 'bcrypt',
    is_active BIT NOT NULL DEFAULT 1,
    last_password_change DATETIME2 NULL DEFAULT GETDATE(),
    password_expires_at DATETIME2 NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NULL,
    CONSTRAINT PK_betting_pool_credentials PRIMARY KEY (credential_id),
    CONSTRAINT UQ_betting_pool_credentials_username UNIQUE (username),
    CONSTRAINT FK_betting_pool_credentials_pools FOREIGN KEY (betting_pool_id)
        REFERENCES betting_pools (betting_pool_id)
);
```

#### 8.2 No Row-Level Security

**Issue:** No RLS policies to restrict data access by betting_pool/zone

**Recommendation:**
```sql
-- Enable RLS on sensitive tables
ALTER TABLE tickets ENABLE ROW_LEVEL SECURITY;

-- Create security policy
CREATE FUNCTION dbo.fn_securitypredicate_tickets(@betting_pool_id INT)
    RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN (
    SELECT 1 AS fn_securitypredicate_result
    WHERE
        -- Admin can see all
        dbo.fn_UserHasPermission(dbo.fn_GetCurrentUserId(), 'tickets.view_all') = 1
        OR
        -- User can see tickets from their assigned betting pools
        EXISTS (
            SELECT 1
            FROM dbo.user_betting_pools ubp
            WHERE ubp.user_id = dbo.fn_GetCurrentUserId()
            AND ubp.betting_pool_id = @betting_pool_id
            AND ubp.is_active = 1
        )
);
GO

CREATE SECURITY POLICY TicketsSecurityPolicy
    ADD FILTER PREDICATE dbo.fn_securitypredicate_tickets(betting_pool_id) ON dbo.tickets,
    ADD BLOCK PREDICATE dbo.fn_securitypredicate_tickets(betting_pool_id) ON dbo.tickets
WITH (STATE = ON);
```

#### 8.3 Missing Encryption for Sensitive Data

**Issue:** No Always Encrypted or TDE for sensitive columns

**Recommendation:**
```sql
-- Enable TDE (Transparent Data Encryption)
-- At database level (requires certificate in master)

USE master;
GO
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'SecurePassword123!';
GO
CREATE CERTIFICATE TDE_Cert WITH SUBJECT = 'TDE Certificate';
GO

USE lottery_database;
GO
CREATE DATABASE ENCRYPTION KEY
WITH ALGORITHM = AES_256
ENCRYPTION BY SERVER CERTIFICATE TDE_Cert;
GO

ALTER DATABASE lottery_database
SET ENCRYPTION ON;
GO

-- For column-level encryption of PII:
-- customer_id_number, customer_phone, customer_email
-- Use Always Encrypted (client-side encryption)
```

#### 8.4 SQL Injection Risk in Dynamic SQL

**Issue:** While no dynamic SQL found in current SPs, STRING_SPLIT usage could be vulnerable in future modifications

**Recommendation:**
- Always use parameterized queries
- Validate all input parameters
- Use sp_executesql with parameters, never string concatenation

#### 8.5 Missing Audit Logging for Sensitive Operations

**Issue:** No dedicated audit log for:
- Permission changes
- Prize payments
- Result modifications
- Ticket cancellations after draw

**Recommendation:**
```sql
CREATE TABLE [dbo].[audit_log] (
    [audit_id] BIGINT NOT NULL IDENTITY(1,1),
    [audit_date] DATETIME2 NOT NULL DEFAULT (GETDATE()),
    [table_name] NVARCHAR(128) NOT NULL,
    [operation] VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    [primary_key] NVARCHAR(100) NULL,
    [old_values] NVARCHAR(MAX) NULL, -- JSON
    [new_values] NVARCHAR(MAX) NULL, -- JSON
    [user_id] INT NULL,
    [ip_address] VARCHAR(45) NULL,
    [application] NVARCHAR(128) NULL,
    [session_id] NVARCHAR(128) NULL,
    CONSTRAINT [PK_audit_log] PRIMARY KEY ([audit_id])
);

-- Create audit triggers for critical tables
CREATE OR ALTER TRIGGER trg_results_audit
ON [dbo].[results]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Log changes
    INSERT INTO audit_log (
        table_name,
        operation,
        primary_key,
        old_values,
        new_values,
        user_id
    )
    SELECT
        'results',
        CASE
            WHEN EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted) THEN 'UPDATE'
            WHEN EXISTS(SELECT 1 FROM inserted) THEN 'INSERT'
            ELSE 'DELETE'
        END,
        COALESCE(i.result_id, d.result_id),
        (SELECT * FROM deleted d2 WHERE d2.result_id = COALESCE(i.result_id, d.result_id) FOR JSON PATH),
        (SELECT * FROM inserted i2 WHERE i2.result_id = COALESCE(i.result_id, d.result_id) FOR JSON PATH),
        dbo.fn_GetCurrentUserId()
    FROM inserted i
    FULL OUTER JOIN deleted d ON i.result_id = d.result_id;
END;
GO
```

#### 8.6 Missing Database Roles

**Issue:** No custom database roles for least privilege access

**Recommendation:**
```sql
-- Create custom database roles
CREATE ROLE db_lottery_readonly;
CREATE ROLE db_lottery_seller;
CREATE ROLE db_lottery_supervisor;
CREATE ROLE db_lottery_admin;

-- Grant appropriate permissions
-- Read-only role
GRANT SELECT ON SCHEMA::dbo TO db_lottery_readonly;

-- Seller role (can create tickets, view limited data)
GRANT SELECT ON dbo.tickets TO db_lottery_seller;
GRANT SELECT ON dbo.ticket_lines TO db_lottery_seller;
GRANT INSERT ON dbo.tickets TO db_lottery_seller;
GRANT INSERT ON dbo.ticket_lines TO db_lottery_seller;
GRANT EXECUTE ON dbo.sp_CalculateTicketTotals TO db_lottery_seller;

-- Supervisor role (can cancel tickets, pay prizes)
GRANT SELECT, INSERT, UPDATE ON dbo.tickets TO db_lottery_supervisor;
GRANT EXECUTE ON dbo.sp_CancelTicket TO db_lottery_supervisor;
GRANT EXECUTE ON dbo.sp_PayTicketPrize TO db_lottery_supervisor;

-- Admin role (full access)
GRANT CONTROL ON SCHEMA::dbo TO db_lottery_admin;
```

---

## 9. PERFORMANCE OPTIMIZATION RECOMMENDATIONS

### 9.1 Add Statistics on Filtered Columns

```sql
-- Create statistics for query optimizer
CREATE STATISTICS stat_tickets_status_cancelled
    ON tickets (status)
    WHERE is_cancelled = 0;

CREATE STATISTICS stat_tickets_winner_paid
    ON tickets (status, is_paid)
    WHERE status = 'winner';

CREATE STATISTICS stat_ticket_lines_winner
    ON ticket_lines (is_winner, prize_amount)
    WHERE is_winner = 1;
```

### 9.2 Partition Large Tables

**For tables that will grow significantly:**

```sql
-- Partition tickets by month
CREATE PARTITION FUNCTION pf_tickets_by_month (DATETIME2)
AS RANGE RIGHT FOR VALUES (
    '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01',
    '2025-05-01', '2025-06-01', '2025-07-01', '2025-08-01',
    '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01'
);

CREATE PARTITION SCHEME ps_tickets_by_month
AS PARTITION pf_tickets_by_month
ALL TO ([PRIMARY]);

-- Rebuild table on partition scheme
-- (requires creating new table and migrating data)
```

### 9.3 Add Compression

```sql
-- Enable page compression on large tables
ALTER TABLE tickets REBUILD WITH (DATA_COMPRESSION = PAGE);
ALTER TABLE ticket_lines REBUILD WITH (DATA_COMPRESSION = PAGE);
ALTER TABLE results REBUILD WITH (DATA_COMPRESSION = PAGE);
```

### 9.4 Optimize VIEW Performance

**Issue:** Views with subqueries in SELECT clause (e.g., vw_betting_pool_complete_config)

```sql
-- Current (lines 2308-2312):
(SELECT COUNT(*) FROM betting_pool_draws bpd
 WHERE bpd.betting_pool_id = bp.betting_pool_id AND bpd.is_active = 1) as active_draws_count

-- Better: Create indexed view or use CROSS APPLY
CREATE OR ALTER VIEW vw_betting_pool_complete_config_optimized
WITH SCHEMABINDING
AS
SELECT
    bp.betting_pool_id,
    bp.betting_pool_code,
    -- ... other fields
    draws_count.active_draws_count,
    prizes_count.prizes_config_count
FROM dbo.betting_pools bp
LEFT JOIN dbo.zones z ON bp.zone_id = z.zone_id
CROSS APPLY (
    SELECT COUNT(*) as active_draws_count
    FROM dbo.betting_pool_draws bpd
    WHERE bpd.betting_pool_id = bp.betting_pool_id AND bpd.is_active = 1
) draws_count
CROSS APPLY (
    SELECT COUNT(*) as prizes_config_count
    FROM dbo.betting_pool_prizes_commissions bppc
    WHERE bppc.betting_pool_id = bp.betting_pool_id AND bppc.is_active = 1
) prizes_count;
GO

-- Create unique clustered index to make it indexed view
CREATE UNIQUE CLUSTERED INDEX IX_vw_betting_pool_config
    ON vw_betting_pool_complete_config_optimized (betting_pool_id);
```

---

## 10. ADDITIONAL TABLES NEEDED

### 10.1 Missing Limit Management Tables

**Issue:** Business documentation mentions limits, but no limit tables exist

```sql
-- Limit rules configuration
CREATE TABLE [dbo].[limit_rules] (
    [limit_rule_id] INT NOT NULL IDENTITY(1,1),
    [rule_name] NVARCHAR(100) NOT NULL,
    [rule_type] VARCHAR(50) NOT NULL, -- GLOBAL, ZONE, BETTING_POOL, NUMBER, GAME_TYPE
    [lottery_id] INT NULL,
    [game_type_id] INT NULL,
    [zone_id] INT NULL,
    [betting_pool_id] INT NULL,
    [bet_number] VARCHAR(20) NULL, -- Specific number or NULL for all
    [max_amount] DECIMAL(18,2) NOT NULL,
    [max_tickets] INT NULL,
    [priority] INT NOT NULL DEFAULT 100, -- Lower = higher priority
    [is_active] BIT NOT NULL DEFAULT 1,
    [effective_from] DATE NULL,
    [effective_until] DATE NULL,
    [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [created_by] INT NULL,
    [updated_at] DATETIME2 NULL,
    [updated_by] INT NULL,
    CONSTRAINT [PK_limit_rules] PRIMARY KEY ([limit_rule_id])
);

-- Limit consumption tracking
CREATE TABLE [dbo].[limit_consumption] (
    [consumption_id] BIGINT NOT NULL IDENTITY(1,1),
    [limit_rule_id] INT NOT NULL,
    [draw_id] INT NOT NULL,
    [draw_date] DATE NOT NULL,
    [bet_number] VARCHAR(20) NULL,
    [current_amount] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [current_tickets] INT NOT NULL DEFAULT 0,
    [last_updated] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_limit_consumption] PRIMARY KEY ([consumption_id]),
    CONSTRAINT [UQ_limit_consumption] UNIQUE ([limit_rule_id], [draw_id], [draw_date], [bet_number]),
    CONSTRAINT [FK_limit_consumption_rules] FOREIGN KEY ([limit_rule_id])
        REFERENCES [limit_rules] ([limit_rule_id])
);

-- Hot numbers tracking
CREATE TABLE [dbo].[hot_numbers] (
    [hot_number_id] BIGINT NOT NULL IDENTITY(1,1),
    [lottery_id] INT NOT NULL,
    [draw_id] INT NOT NULL,
    [draw_date] DATE NOT NULL,
    [bet_number] VARCHAR(20) NOT NULL,
    [total_bet_amount] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [total_net_amount] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [ticket_count] INT NOT NULL DEFAULT 0,
    [limit_percentage] DECIMAL(5,2) NULL, -- % of limit consumed
    [status] VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- NORMAL, WARNING, CRITICAL, BLOCKED
    [last_updated] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_hot_numbers] PRIMARY KEY ([hot_number_id]),
    CONSTRAINT [UQ_hot_numbers] UNIQUE ([lottery_id], [draw_id], [draw_date], [bet_number])
);

CREATE NONCLUSTERED INDEX IX_hot_numbers_status
    ON hot_numbers (lottery_id, draw_date, status)
    INCLUDE (bet_number, total_bet_amount, limit_percentage);
```

### 10.2 Missing Transaction/Financial Tables

**Issue:** Financial tracking is incomplete

```sql
-- Financial transactions log
CREATE TABLE [dbo].[financial_transactions] (
    [transaction_id] BIGINT NOT NULL IDENTITY(1,1),
    [transaction_code] VARCHAR(30) NOT NULL, -- FIN-20251022-00001
    [transaction_date] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [transaction_type] VARCHAR(50) NOT NULL, -- TICKET_SALE, PRIZE_PAYMENT, RECHARGE, COMMISSION, EXPENSE
    [betting_pool_id] INT NOT NULL,
    [user_id] INT NULL,
    [related_ticket_id] BIGINT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [balance_before] DECIMAL(18,2) NOT NULL,
    [balance_after] DECIMAL(18,2) NOT NULL,
    [currency_code] VARCHAR(3) NOT NULL DEFAULT 'DOP',
    [description] NVARCHAR(500) NULL,
    [reference] VARCHAR(100) NULL,
    [created_by] INT NULL,
    CONSTRAINT [PK_financial_transactions] PRIMARY KEY ([transaction_id]),
    CONSTRAINT [UQ_financial_transactions_code] UNIQUE ([transaction_code]),
    CONSTRAINT [FK_financial_transactions_pools] FOREIGN KEY ([betting_pool_id])
        REFERENCES [betting_pools] ([betting_pool_id]),
    CONSTRAINT [FK_financial_transactions_tickets] FOREIGN KEY ([related_ticket_id])
        REFERENCES [tickets] ([ticket_id])
);

CREATE INDEX IX_financial_transactions_pool_date
    ON financial_transactions (betting_pool_id, transaction_date DESC);

CREATE INDEX IX_financial_transactions_type_date
    ON financial_transactions (transaction_type, transaction_date DESC);
```

### 10.3 Missing Notification/Alert Tables

```sql
-- System notifications
CREATE TABLE [dbo].[notifications] (
    [notification_id] BIGINT NOT NULL IDENTITY(1,1),
    [notification_type] VARCHAR(50) NOT NULL, -- LIMIT_WARNING, WINNER, SYSTEM_ALERT
    [severity] VARCHAR(20) NOT NULL, -- INFO, WARNING, CRITICAL
    [title] NVARCHAR(200) NOT NULL,
    [message] NVARCHAR(MAX) NOT NULL,
    [related_table] VARCHAR(128) NULL,
    [related_id] BIGINT NULL,
    [user_id] INT NULL, -- Recipient (NULL = all users)
    [betting_pool_id] INT NULL,
    [zone_id] INT NULL,
    [is_read] BIT NOT NULL DEFAULT 0,
    [read_at] DATETIME2 NULL,
    [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [expires_at] DATETIME2 NULL,
    CONSTRAINT [PK_notifications] PRIMARY KEY ([notification_id])
);

CREATE INDEX IX_notifications_user_unread
    ON notifications (user_id, is_read, created_at DESC)
    WHERE is_read = 0;
```

### 10.4 Missing Configuration Tables

```sql
-- System configuration key-value store
CREATE TABLE [dbo].[system_config] (
    [config_id] INT NOT NULL IDENTITY(1,1),
    [config_key] VARCHAR(100) NOT NULL,
    [config_value] NVARCHAR(MAX) NULL,
    [value_type] VARCHAR(20) NOT NULL DEFAULT 'string', -- string, int, decimal, bool, json
    [category] VARCHAR(50) NOT NULL,
    [description] NVARCHAR(500) NULL,
    [is_encrypted] BIT NOT NULL DEFAULT 0,
    [is_public] BIT NOT NULL DEFAULT 0, -- Can non-admin users read it?
    [updated_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updated_by] INT NULL,
    CONSTRAINT [PK_system_config] PRIMARY KEY ([config_id]),
    CONSTRAINT [UQ_system_config_key] UNIQUE ([config_key])
);

-- Example configurations
INSERT INTO system_config (config_key, config_value, value_type, category, description)
VALUES
    ('max_ticket_amount_default', '10000.00', 'decimal', 'tickets', 'Default maximum ticket amount'),
    ('default_timezone', 'America/Santo_Domingo', 'string', 'system', 'Default timezone for draws'),
    ('enable_hot_numbers', 'true', 'bool', 'features', 'Enable hot numbers tracking'),
    ('ticket_code_prefix', 'LAN', 'string', 'tickets', 'Prefix for ticket codes'),
    ('max_concurrent_tickets', '100', 'int', 'performance', 'Maximum concurrent ticket creations');
```

---

## 11. QUESTIONS FOR THE CLIENT

### BUSINESS LOGIC CLARIFICATION

#### A. Ticket and Draw Management

1. **Ticket Cancellation Rules:**
   - What is the exact cutoff time for ticket cancellations? (Currently `cancel_minutes` in config)
   - Are there different rules for different draw types?
   - Should there be a maximum cancellation amount per day per user?
   - Who can override cancellation restrictions? (SuperAdmin only or also Supervisor?)

2. **Draw Timing:**
   - What happens if a ticket is created between `close_time` and `draw_time`?
   - How are timezone differences handled for international draws (NY, FL)?
   - Should the system automatically close draws, or is manual intervention required?

3. **Results Publication:**
   - Who is authorized to publish results?
   - Is there a verification/approval workflow for results?
   - What happens if results are published incorrectly and need correction?
   - How are result modifications audited?

4. **Multiple Draw Tickets:**
   - Can a single ticket have bets on multiple different draws?
   - If yes, how is the ticket status determined (all must complete, or per-line)?
   - What is the earliest/latest draw time calculation for?

#### B. Financial and Limits

5. **Limit System:**
   - What are the exact limit hierarchy levels? (Global > Zone > Betting Pool > Number?)
   - How are limits calculated across multiple betting pools?
   - What is the "excedente" (surplus/excess) concept - please provide calculation examples
   - Are limits per draw instance or per day?
   - Should limits reset daily, or only after draw completion?

6. **Hot Numbers:**
   - At what percentage should a number be flagged as "hot"? (70%, 80%, 90%?)
   - Should hot numbers be visible to all users or just supervisors?
   - What actions should be taken when a number reaches critical status?

7. **Commission Structure:**
   - Why are there 4 prize payments and 4 commission discounts per game type?
   - What do `commission_2_discount_*` fields represent? (Second commission tier?)
   - How are commissions calculated when there are discounts and multipliers?
   - Example calculation: Bet $100, 10% discount, x2 multiplier, 8% commission = ?

8. **Balance and Credit:**
   - What is `temporary_additional_balance` used for?
   - How does `credit_limit` interact with `deactivation_balance`?
   - Can a betting pool go negative? If yes, what's the hard limit?
   - What triggers automatic deactivation?

#### C. User and Access Management

9. **User-Betting Pool Relationship:**
   - Can a user work at multiple betting pools simultaneously?
   - What does `is_primary` mean - primary betting pool for the user?
   - If a user switches betting pools, what happens to their in-progress tickets?

10. **Roles and Permissions:**
    - What are the complete set of roles needed? (Current: admin, supervisor, seller, ?)
    - What permission categories exist beyond what's defined?
    - Examples of permissions needed:
      - `tickets.create`, `tickets.cancel`, `tickets.view_all`
      - `results.publish`, `results.modify`
      - `limits.override`, `limits.modify`
      - `reports.financial`, `reports.detailed`
    - Should permission expire automatically, or only manually?

11. **Betting Pool Credentials:**
    - Why does `betting_pools` table have `username` and `password_hash`?
    - Is this for betting pool-level login, separate from user login?
    - Should this be removed or refactored into a separate authentication table?

#### D. Prize and Payment

12. **Prize Calculation:**
    - How are prizes calculated when there are multiple winning positions (1st, 2nd, 3rd)?
    - What is the difference between `prize_payment_1` through `prize_payment_4`?
    - Are prize multipliers fixed per game type or configurable per betting pool?
    - Example: Directo bet $100, number wins in 2nd position - prize = ?

13. **Prize Payment Process:**
    - Can prizes be paid at any betting pool, or only where the ticket was created?
    - What is `payment_mode` (BANCA, GRUPO, ZONA) - who pays the prize?
    - Are there maximum prize amounts that require special approval?
    - How long does a winner have to claim a prize before it expires?

14. **Jackpot:**
    - What is the "jackpot" feature (`allow_jackpot` toggle)?
    - How is jackpot different from regular prizes?
    - Is there a progressive jackpot that accumulates?

#### E. Game Types and Numbers

15. **Bet Number Format:**
    - What are valid number formats? (2-digit: "23", 3-digit: "456", 4-digit: "1234", ?)
    - Can numbers have letters? (e.g., "23P" for Pale)
    - What is lucky pick ("*") - system-generated random number?
    - How are sequence numbers different from individual numbers?

16. **Game Type Multipliers:**
    - Why does `game_types` have a `prize_multiplier` field?
    - How does this interact with betting pool-specific prize configurations?
    - Which takes precedence?

#### F. Reporting and Analytics

17. **Required Reports:**
    - Daily sales by betting pool/zone/user?
    - Hot numbers report (real-time or end-of-day)?
    - Prize payment reconciliation?
    - Commission calculations per user/betting pool?
    - Financial summary (sales - prizes = net revenue)?
    - Limit consumption report?
    - Cancelled tickets audit?

18. **Data Retention:**
    - How long should ticket data be retained? (1 year, 5 years, forever?)
    - Should old tickets be archived to a separate table/database?
    - What about soft-deleted records - permanent or purge after X days?

#### G. Integrations

19. **Bote Import/Export:**
    - Documentation mentions "bote importado/exportado" - is this feature needed?
    - How does risk sharing with external operators work?
    - What tables/fields are needed to support this?

20. **External Systems:**
    - Are there integrations with:
      - Official lottery result feeds?
      - Payment gateways?
      - SMS/Email notification services?
      - Accounting/ERP systems?
    - What data exchange format? (API, file upload, database link?)

#### H. Configuration and Setup

21. **Betting Pool Schedules:**
    - `betting_pool_schedules` has 7 rows (one per day of week) - is this correct?
    - Or should there be schedules per draw (some draws multiple times per day)?
    - How do holidays affect schedules?

22. **Betting Pool Draws (N:M):**
    - Can different betting pools offer different draws?
    - Can a betting pool activate/deactivate draws dynamically?
    - What determines which draws are available to a betting pool?

23. **Footers:**
    - What is `auto_footer` - system-generated footer based on what?
    - Are footers printed on all tickets or only certain types?
    - Can footers contain dynamic content (e.g., current balance, next draw time)?

24. **Styles:**
    - What are the available style options? (Estilo 1, 2, 3, etc.)
    - Are styles purely cosmetic or do they affect functionality?
    - Can betting pools upload custom logos?

#### I. Performance and Scale

25. **Expected Data Volumes:**
    - How many betting pools will there be? (50, 100, 500, 1000+?)
    - How many tickets per day per betting pool? (100, 1000, 10000+?)
    - How many concurrent users in the system?
    - How many draws per day total?
    - Peak transaction rate (tickets per second)?

26. **High Availability:**
    - Is database clustering/replication required?
    - What is acceptable downtime during draw periods? (Zero tolerance?)
    - Are there backup/disaster recovery requirements?

#### J. Security and Compliance

27. **Regulatory Compliance:**
    - What jurisdiction's gambling regulations apply?
    - Are there KYC (Know Your Customer) requirements for large prizes?
    - Is there a maximum bet amount per person per day?
    - Are there reporting requirements to gaming authorities?

28. **Data Privacy:**
    - What customer data must be collected for tickets?
    - How long must customer data be retained?
    - Are there GDPR or similar data privacy requirements?
    - Can customers request data deletion?

29. **Audit Requirements:**
    - What level of audit trail is required?
    - Should all database changes be logged?
    - Are there retention requirements for audit logs?
    - Who can access audit logs?

---

## 12. RECOMMENDED IMMEDIATE ACTIONS

### CRITICAL (Must Fix Before Production)

1. **Fix game_types Duplicate Definition**
   - Remove second definition
   - Merge fields into single comprehensive table

2. **Add Missing Limit Management Tables**
   - `limit_rules`
   - `limit_consumption`
   - `hot_numbers`

3. **Fix Primary Key Generation**
   - Change all manual ID assignment to IDENTITY or SEQUENCE
   - Fix race conditions in stored procedures

4. **Add Missing CHECK Constraints**
   - Amount validations (all > 0)
   - Percentage validations (0-100)
   - Date validations (updated_at >= created_at)

5. **Implement Error Logging**
   - Create `error_logs` table
   - Add logging to all stored procedures
   - Create `sp_LogError` procedure

6. **Add Critical Indexes**
   - `IX_ticket_lines_number_lottery_date` (for limit checks)
   - `IX_tickets_pool_date_status` (for sales queries)
   - `IX_ticket_lines_winners_only` (filtered index)

7. **Security Hardening**
   - Remove or secure `betting_pools.password_hash`
   - Add audit triggers on critical tables
   - Implement Row-Level Security

### HIGH PRIORITY (Fix Within 2 Weeks)

8. **Add Financial Transaction Tracking**
   - Create `financial_transactions` table
   - Integrate with ticket creation/payment

9. **Implement Comprehensive Audit**
   - Create `audit_log` table
   - Add triggers for all sensitive tables

10. **Add Input Validation to SPs**
    - Validate all parameters
    - Check entity existence before operations

11. **Create Notification System**
    - `notifications` table
    - Alerts for limits, winners, errors

12. **Optimize Stored Procedures**
    - Remove cursors, use set-based operations
    - Add transaction isolation levels
    - Implement proper error handling

### MEDIUM PRIORITY (Fix Within 1 Month)

13. **Add System Configuration**
    - `system_config` table
    - Centralize all configuration values

14. **Implement Database Roles**
    - Create custom roles
    - Apply least privilege principle

15. **Create Indexed Views**
    - Optimize `vw_betting_pool_complete_config`
    - Add indexed views for common reports

16. **Add Table Partitioning**
    - Partition `tickets` and `ticket_lines` by month
    - Improve query performance for date ranges

17. **Enable Compression**
    - Apply PAGE compression to large tables

### LOW PRIORITY (Nice to Have)

18. **Add Always Encrypted**
    - Encrypt PII columns

19. **Implement TDE**
    - Transparent Data Encryption for entire database

20. **Create Additional Indexes**
    - Columnstore indexes for analytics

---

## 13. SQL FIXES SCRIPT

Here's a consolidated script with all critical fixes:

```sql
-- ============================================================================
-- CRITICAL FIXES FOR LOTTERY DATABASE
-- Execute in order, review each section before running
-- ============================================================================

SET NOCOUNT ON;
PRINT '╔══════════════════════════════════════════════════════════════╗';
PRINT '║  LOTTERY DATABASE - CRITICAL FIXES                           ║';
PRINT '╚══════════════════════════════════════════════════════════════╝';
PRINT '';

-- ============================================================================
-- FIX 1: Remove Duplicate game_types Definition
-- ============================================================================
PRINT '🔧 FIX 1: Resolving game_types duplicate definition...';

-- The second definition should be removed from the script
-- If already created, merge fields:
IF COL_LENGTH('game_types', 'game_type_code') IS NULL
BEGIN
    ALTER TABLE game_types
        ADD game_type_code VARCHAR(50) NULL;

    ALTER TABLE game_types
        ADD CONSTRAINT UQ_game_type_code UNIQUE (game_type_code);
END

IF COL_LENGTH('game_types', 'display_order') IS NULL
BEGIN
    ALTER TABLE game_types
        ADD display_order INT NULL;
END

PRINT '✅ game_types table structure verified';
GO

-- ============================================================================
-- FIX 2: Add Missing results.position Column
-- ============================================================================
PRINT '';
PRINT '🔧 FIX 2: Adding missing position column to results table...';

IF COL_LENGTH('results', 'position') IS NULL
BEGIN
    ALTER TABLE results
        ADD position INT NULL;

    ALTER TABLE results
        ADD CONSTRAINT CHK_results_position
        CHECK (position IS NULL OR position BETWEEN 1 AND 3);

    PRINT '✅ results.position column added';
END
ELSE
BEGIN
    PRINT '⚠️  results.position already exists';
END
GO

-- ============================================================================
-- FIX 3: Fix prizes.line_id Data Type (INT -> BIGINT)
-- ============================================================================
PRINT '';
PRINT '🔧 FIX 3: Fixing prizes.line_id data type...';

-- This requires dropping FK, changing type, recreating FK
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_prizes_ticket_lines')
BEGIN
    ALTER TABLE prizes DROP CONSTRAINT FK_prizes_ticket_lines;
    PRINT 'Dropped FK constraint';
END

-- Change data type
DECLARE @CurrentType VARCHAR(50);
SELECT @CurrentType = DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'prizes' AND COLUMN_NAME = 'line_id';

IF @CurrentType != 'bigint'
BEGIN
    ALTER TABLE prizes
        ALTER COLUMN line_id BIGINT NOT NULL;
    PRINT '✅ Changed line_id to BIGINT';
END

-- Recreate FK
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_prizes_ticket_lines')
BEGIN
    ALTER TABLE prizes
        ADD CONSTRAINT FK_prizes_ticket_lines
        FOREIGN KEY (line_id)
        REFERENCES ticket_lines (line_id);
    PRINT '✅ FK constraint recreated';
END
GO

-- ============================================================================
-- FIX 4: Add Missing CHECK Constraints
-- ============================================================================
PRINT '';
PRINT '🔧 FIX 4: Adding missing CHECK constraints...';

-- tickets table
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_tickets_amounts_positive')
BEGIN
    ALTER TABLE tickets
        ADD CONSTRAINT CHK_tickets_amounts_positive
        CHECK (
            total_bet_amount >= 0 AND
            total_discount >= 0 AND
            total_subtotal >= 0 AND
            total_with_multiplier >= 0 AND
            total_commission >= 0 AND
            total_net >= 0 AND
            grand_total >= 0 AND
            total_prize >= 0
        );
    PRINT '✅ Added CHK_tickets_amounts_positive';
END

-- ticket_lines table
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_ticket_lines_amounts_positive')
BEGIN
    ALTER TABLE ticket_lines
        ADD CONSTRAINT CHK_ticket_lines_amounts_positive
        CHECK (
            bet_amount > 0 AND
            discount_amount >= 0 AND
            subtotal >= 0 AND
            total_with_multiplier >= 0 AND
            commission_amount >= 0 AND
            net_amount >= 0 AND
            prize_amount >= 0
        );
    PRINT '✅ Added CHK_ticket_lines_amounts_positive';
END

-- betting_pool_schedules day_of_week
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_day_of_week_range')
BEGIN
    ALTER TABLE betting_pool_schedules
        ADD CONSTRAINT CHK_day_of_week_range
        CHECK (day_of_week BETWEEN 0 AND 6);
    PRINT '✅ Added CHK_day_of_week_range';
END

-- Timestamp consistency
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_tickets_timestamps')
BEGIN
    ALTER TABLE tickets
        ADD CONSTRAINT CHK_tickets_timestamps
        CHECK (updated_at IS NULL OR updated_at >= created_at);
    PRINT '✅ Added CHK_tickets_timestamps';
END

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_users_timestamps')
BEGIN
    ALTER TABLE users
        ADD CONSTRAINT CHK_users_timestamps
        CHECK (updated_at IS NULL OR updated_at >= created_at);
    PRINT '✅ Added CHK_users_timestamps';
END

-- Soft delete consistency
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_users_delete_consistency')
BEGIN
    ALTER TABLE users
        ADD CONSTRAINT CHK_users_delete_consistency
        CHECK (
            (deleted_at IS NULL AND deleted_by IS NULL) OR
            (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
        );
    PRINT '✅ Added CHK_users_delete_consistency';
END

-- Commissions validation
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_commissions_valid')
BEGIN
    ALTER TABLE betting_pool_prizes_commissions
        ADD CONSTRAINT CHK_commissions_valid
        CHECK (
            (commission_discount_1 IS NULL OR (commission_discount_1 >= 0 AND commission_discount_1 <= 100)) AND
            (commission_discount_2 IS NULL OR (commission_discount_2 >= 0 AND commission_discount_2 <= 100)) AND
            (commission_discount_3 IS NULL OR (commission_discount_3 >= 0 AND commission_discount_3 <= 100)) AND
            (commission_discount_4 IS NULL OR (commission_discount_4 >= 0 AND commission_discount_4 <= 100))
        );
    PRINT '✅ Added CHK_commissions_valid';
END

-- Prize payments positive
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_prize_payments_positive')
BEGIN
    ALTER TABLE betting_pool_prizes_commissions
        ADD CONSTRAINT CHK_prize_payments_positive
        CHECK (
            (prize_payment_1 IS NULL OR prize_payment_1 >= 0) AND
            (prize_payment_2 IS NULL OR prize_payment_2 >= 0) AND
            (prize_payment_3 IS NULL OR prize_payment_3 >= 0) AND
            (prize_payment_4 IS NULL OR prize_payment_4 >= 0)
        );
    PRINT '✅ Added CHK_prize_payments_positive';
END
GO

-- ============================================================================
-- FIX 5: Add Critical Missing Indexes
-- ============================================================================
PRINT '';
PRINT '🔧 FIX 5: Creating critical missing indexes...';

-- Number sales lookup (critical for limits)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ticket_lines_number_lottery_date')
BEGIN
    CREATE NONCLUSTERED INDEX IX_ticket_lines_number_lottery_date
        ON ticket_lines (bet_number, lottery_id, draw_date)
        INCLUDE (bet_amount, net_amount, ticket_id);
    PRINT '✅ Created IX_ticket_lines_number_lottery_date';
END

-- Betting pool + date queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tickets_pool_date_status')
BEGIN
    CREATE NONCLUSTERED INDEX IX_tickets_pool_date_status
        ON tickets (betting_pool_id, created_at DESC)
        INCLUDE (status, grand_total, total_prize, is_cancelled);
    PRINT '✅ Created IX_tickets_pool_date_status';
END

-- Active permissions lookup
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_user_permissions_user_active_expires')
BEGIN
    CREATE NONCLUSTERED INDEX IX_user_permissions_user_active_expires
        ON user_permissions (user_id, is_active)
        INCLUDE (permission_id, expires_at);
    PRINT '✅ Created IX_user_permissions_user_active_expires';
END

-- Draw results lookup
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_results_draw_date')
BEGIN
    CREATE NONCLUSTERED INDEX IX_results_draw_date
        ON results (draw_id, result_date DESC)
        INCLUDE (winning_number, additional_number, position);
    PRINT '✅ Created IX_results_draw_date';
END

-- Zone-based betting pools
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_betting_pools_zone_active')
BEGIN
    CREATE NONCLUSTERED INDEX IX_betting_pools_zone_active
        ON betting_pools (zone_id, is_active)
        INCLUDE (betting_pool_code, betting_pool_name)
        WHERE is_active = 1;
    PRINT '✅ Created IX_betting_pools_zone_active (filtered)';
END

-- Pending winners
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tickets_pending_winners')
BEGIN
    CREATE NONCLUSTERED INDEX IX_tickets_pending_winners
        ON tickets (betting_pool_id, created_at DESC)
        INCLUDE (ticket_code, total_prize, customer_name, customer_phone)
        WHERE status = 'winner' AND is_paid = 0 AND is_cancelled = 0;
    PRINT '✅ Created IX_tickets_pending_winners (filtered)';
END

-- Winner lines only
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ticket_lines_winners_only')
BEGIN
    CREATE NONCLUSTERED INDEX IX_ticket_lines_winners_only
        ON ticket_lines (ticket_id, line_id, prize_amount)
        INCLUDE (bet_number, lottery_id, draw_id)
        WHERE is_winner = 1;
    PRINT '✅ Created IX_ticket_lines_winners_only (filtered)';
END
GO

-- ============================================================================
-- FIX 6: Create Error Logging Infrastructure
-- ============================================================================
PRINT '';
PRINT '🔧 FIX 6: Creating error logging infrastructure...';

-- Error logs table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'error_logs')
BEGIN
    CREATE TABLE [dbo].[error_logs] (
        [error_log_id] BIGINT NOT NULL IDENTITY(1,1),
        [error_date] DATETIME2 NOT NULL DEFAULT (GETDATE()),
        [procedure_name] NVARCHAR(128) NULL,
        [error_number] INT NULL,
        [error_severity] INT NULL,
        [error_state] INT NULL,
        [error_message] NVARCHAR(4000) NULL,
        [error_line] INT NULL,
        [user_id] INT NULL,
        [additional_info] NVARCHAR(MAX) NULL,
        [ip_address] VARCHAR(45) NULL,
        CONSTRAINT [PK_error_logs] PRIMARY KEY ([error_log_id])
    );

    CREATE INDEX IX_error_logs_date ON error_logs (error_date DESC);
    CREATE INDEX IX_error_logs_procedure ON error_logs (procedure_name, error_date DESC);

    PRINT '✅ Created error_logs table';
END
GO

-- Error logging stored procedure
CREATE OR ALTER PROCEDURE sp_LogError
    @procedure_name NVARCHAR(128),
    @user_id INT = NULL,
    @additional_info NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO error_logs (
        procedure_name,
        error_number,
        error_severity,
        error_state,
        error_message,
        error_line,
        user_id,
        additional_info
    )
    VALUES (
        @procedure_name,
        ERROR_NUMBER(),
        ERROR_SEVERITY(),
        ERROR_STATE(),
        ERROR_MESSAGE(),
        ERROR_LINE(),
        @user_id,
        @additional_info
    );
END;
GO

PRINT '✅ Created sp_LogError procedure';
GO

-- ============================================================================
-- FIX 7: Create Audit Log Infrastructure
-- ============================================================================
PRINT '';
PRINT '🔧 FIX 7: Creating audit log infrastructure...';

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'audit_log')
BEGIN
    CREATE TABLE [dbo].[audit_log] (
        [audit_id] BIGINT NOT NULL IDENTITY(1,1),
        [audit_date] DATETIME2 NOT NULL DEFAULT (GETDATE()),
        [table_name] NVARCHAR(128) NOT NULL,
        [operation] VARCHAR(10) NOT NULL,
        [primary_key] NVARCHAR(100) NULL,
        [old_values] NVARCHAR(MAX) NULL,
        [new_values] NVARCHAR(MAX) NULL,
        [user_id] INT NULL,
        [ip_address] VARCHAR(45) NULL,
        [application] NVARCHAR(128) NULL,
        CONSTRAINT [PK_audit_log] PRIMARY KEY ([audit_id]),
        CONSTRAINT [CHK_audit_operation] CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
    );

    CREATE INDEX IX_audit_log_date ON audit_log (audit_date DESC);
    CREATE INDEX IX_audit_log_table_date ON audit_log (table_name, audit_date DESC);
    CREATE INDEX IX_audit_log_user ON audit_log (user_id, audit_date DESC);

    PRINT '✅ Created audit_log table';
END
GO

-- Audit trigger for results table
CREATE OR ALTER TRIGGER trg_results_audit
ON [dbo].[results]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO audit_log (
        table_name,
        operation,
        primary_key,
        old_values,
        new_values,
        user_id
    )
    SELECT
        'results',
        CASE
            WHEN EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted) THEN 'UPDATE'
            WHEN EXISTS(SELECT 1 FROM inserted) THEN 'INSERT'
            ELSE 'DELETE'
        END,
        CAST(COALESCE(i.result_id, d.result_id) AS NVARCHAR(100)),
        (SELECT d.* FROM deleted d WHERE d.result_id = COALESCE(i.result_id, d.result_id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        (SELECT i.* FROM inserted i WHERE i.result_id = COALESCE(i.result_id, d.result_id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        dbo.fn_GetCurrentUserId()
    FROM inserted i
    FULL OUTER JOIN deleted d ON i.result_id = d.result_id;
END;
GO

PRINT '✅ Created results audit trigger';
GO

-- Audit trigger for prizes (payment tracking)
CREATE OR ALTER TRIGGER trg_prizes_audit
ON [dbo].[prizes]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO audit_log (
        table_name,
        operation,
        primary_key,
        old_values,
        new_values,
        user_id
    )
    SELECT
        'prizes',
        CASE WHEN EXISTS(SELECT 1 FROM deleted) THEN 'UPDATE' ELSE 'INSERT' END,
        CAST(i.prize_id AS NVARCHAR(100)),
        (SELECT d.* FROM deleted d WHERE d.prize_id = i.prize_id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        dbo.fn_GetCurrentUserId()
    FROM inserted i
    LEFT JOIN deleted d ON i.prize_id = d.prize_id;
END;
GO

PRINT '✅ Created prizes audit trigger';
GO

-- ============================================================================
-- COMPLETION
-- ============================================================================
PRINT '';
PRINT '╔══════════════════════════════════════════════════════════════╗';
PRINT '║  CRITICAL FIXES COMPLETED SUCCESSFULLY                       ║';
PRINT '╚══════════════════════════════════════════════════════════════╝';
PRINT '';
PRINT 'Summary of fixes applied:';
PRINT '  ✅ FIX 1: game_types duplicate resolution';
PRINT '  ✅ FIX 2: Added results.position column';
PRINT '  ✅ FIX 3: Fixed prizes.line_id data type';
PRINT '  ✅ FIX 4: Added missing CHECK constraints';
PRINT '  ✅ FIX 5: Created critical indexes';
PRINT '  ✅ FIX 6: Created error logging infrastructure';
PRINT '  ✅ FIX 7: Created audit log infrastructure';
PRINT '';
PRINT 'Next steps:';
PRINT '  1. Review and answer client questions in section 11';
PRINT '  2. Add limit management tables (see section 10.1)';
PRINT '  3. Add financial transaction tracking (see section 10.2)';
PRINT '  4. Implement notification system (see section 10.3)';
PRINT '  5. Add system configuration table (see section 10.4)';
PRINT '  6. Update stored procedures with error logging';
PRINT '  7. Implement Row-Level Security';
PRINT '  8. Add database roles and apply least privilege';
PRINT '';
```

---

## CONCLUSION

The lottery database system has a **solid foundation** with excellent modular architecture, but requires **critical fixes** before production deployment. The most urgent issues are:

1. Duplicate table definitions
2. Missing limit management infrastructure
3. Race conditions in ID generation
4. Missing error and audit logging
5. Critical indexes for performance
6. Security hardening

**Estimated Effort to Production-Ready:**
- Critical fixes: 2-3 days
- High priority: 1-2 weeks
- Medium priority: 3-4 weeks
- **Total: 6-8 weeks for complete production readiness**

**Risk Assessment:**
- **Without fixes:** HIGH RISK - race conditions, performance issues, security vulnerabilities
- **With critical fixes only:** MEDIUM RISK - functional but sub-optimal
- **With all recommended fixes:** LOW RISK - production-ready, scalable, secure

---

**Report Generated:** 2025-10-22
**Analyst:** SQL Database Expert
**Files Analyzed:**
- /mnt/h/GIT/Lottery-Database/lottery_database_complete.sql (2677 lines)
- /mnt/h/GIT/Lottery-Database/README.md
- /mnt/h/GIT/Lottery-Database/SISTEMA_NEGOCIO_LOTTO.md
- /mnt/h/GIT/Lottery-Database/REFACTORIZACION_RESUMEN.md
- /mnt/h/GIT/Lottery-Database/ESTRUCTURA_VISUAL.txt
