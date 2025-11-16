# Azure SQL Database Schema Extraction - Summary Report

**Generated:** November 1, 2025 17:36:32
**Database:** lottery-db
**Server:** lottery-sql-1505.database.windows.net
**User:** lotteryAdmin

---

## Extraction Results

### ✅ Successfully Extracted

| Object Type | Count | Status |
|------------|-------|--------|
| **Tables** | 47 | ✅ Complete |
| **Stored Procedures** | 11 | ✅ Complete |
| **Views** | 9 | ✅ Complete |
| **Primary Keys** | 44 | ✅ Complete |
| **Foreign Keys** | 62 | ✅ Complete |
| **Indexes** | 85 | ✅ Complete |

**Total Objects:** 258

---

## Output Files

### Main Schema File
- **File:** `/home/jorge/projects/Lottery-Database/lottery_database_azure_v2.sql`
- **Size:** 101 KB
- **Lines:** 2,278
- **Contains:** Complete database schema with all objects

### Supplementary Files
1. **Stored Procedures Only**
   - File: `/home/jorge/projects/Lottery-Database/stored_procedures_final.sql`
   - Size: 31 KB
   - Contains: All 11 stored procedures with full definitions

2. **Views Only**
   - File: `/home/jorge/projects/Lottery-Database/views_final.sql`
   - Size: 7.0 KB
   - Contains: All 9 views with full definitions

---

## Database Objects Detail

### 📋 Tables (47)

#### Core Configuration Tables
1. `countries` - Country definitions
2. `lotteries` - Lottery types and configurations
3. `draws` - Draw schedules and information
4. `game_types` - Game type definitions
5. `game_categories` - Game category classifications
6. `lottery_game_compatibility` - Lottery-game type mappings
7. `bet_types` - Betting type definitions

#### User & Permission Tables
8. `users` - User accounts
9. `roles` - User roles
10. `permissions` - System permissions (61 total)
11. `user_permissions` - Direct user permissions
12. `user_permissions_backup` - Backup table
13. `role_permissions` - Role-based permissions
14. `user_zones` - User-zone mappings (N:M relationship)
15. `user_zones_backup` - Backup table
16. `user_betting_pools` - User-betting pool assignments
17. `user_betting_pools_backup` - Backup table

#### Geographic & Organization Tables
18. `zones` - Geographic zones
19. `banks` - Bank definitions
20. `betting_pools` - Betting pool/banca configurations

#### Betting Pool Configuration Tables
21. `betting_pool_config` - General betting pool configuration
22. `betting_pool_general_config` - Extended general configuration
23. `betting_pool_draw_config` - Draw-specific configuration
24. `betting_pool_discount_config` - Discount rules
25. `betting_pool_print_config` - Print settings
26. `betting_pool_styles` - UI styling configuration
27. `betting_pool_schedules` - Operating schedules
28. `betting_pool_sortitions` - Sortition/lottery configurations
29. `betting_pool_footers` - Receipt footers
30. `betting_pool_draws` - Draw associations
31. `betting_pool_automatic_expenses` - Automatic expense rules
32. `betting_pool_prizes_commissions` - Prize and commission configurations

#### Prize Configuration Tables
33. `prize_fields` - Prize field definitions
34. `banca_prize_configs` - Betting pool prize configurations
35. `draw_prize_configs` - Draw-specific prize configurations
36. `prize_changes_audit` - Prize change audit log

#### Transaction Tables
37. `tickets` - Ticket sales records
38. `ticket_lines` - Individual ticket line items
39. `results` - Draw results
40. `prizes` - Prize payouts
41. `balances` - Account balances
42. `financial_transactions` - Financial transaction log

#### System & Analytics Tables
43. `hot_numbers` - Hot number tracking
44. `limit_rules` - Betting limit rules
45. `limit_consumption` - Limit consumption tracking
46. `audit_log` - General audit log
47. `error_logs` - System error logging

---

### 🔧 Stored Procedures (11)

1. **sp_CheckTicketWinners**
   - Purpose: Verify winning numbers on a ticket
   - Improved: 2025-10-22 with validation and error handling
   - Lines: ~110

2. **sp_CopyBettingPoolConfig**
   - Purpose: Copy complete configuration from one betting pool to another
   - Improved: 2025-10-22 with validation
   - Lines: ~120

3. **sp_CopyBettingPoolSection**
   - Purpose: Copy specific configuration section between betting pools
   - Sections: CONFIGURACION, PIES, PREMIOS, HORARIOS, SORTEOS, ESTILOS, GASTOS
   - Lines: ~150

4. **sp_ExpireOldPermissions**
   - Purpose: Expire old user permissions (scheduled job)
   - Lines: ~15

5. **sp_GetNumberSales**
   - Purpose: Get sales by number (for limit checking)
   - Lines: ~80

6. **sp_GetUserPermissions**
   - Purpose: View all permissions for a user (direct + role-based)
   - Parameters: @user_id, @username, @include_expired
   - Lines: ~60

7. **sp_GetUsersWithPermission**
   - Purpose: Get all users with a specific permission
   - Parameters: @permission_code
   - Lines: ~40

8. **sp_GrantMultiplePermissions**
   - Purpose: Grant multiple permissions to a user
   - Parameters: @user_id, @permission_codes (comma-separated)
   - Lines: ~50

9. **sp_GrantPermissionToUser**
   - Purpose: Grant direct permission to user
   - Parameters: @user_id, @permission_id, @grant_reason, @expires_at
   - Lines: ~40

10. **sp_PayTicketPrize**
    - Purpose: Record prize payment
    - Improved: 2025-10-22 with validation and financial logging
    - Lines: ~100

11. **sp_RevokePermissionFromUser**
    - Purpose: Revoke direct permission from user
    - Parameters: @user_id, @permission_id, @revoke_reason
    - Lines: ~30

**Note:** 2 stored procedures from initial count were not found in current database:
- `sp_CalculateTicketTotals` (referenced but not in sys.procedures)
- `sp_CancelTicket` (referenced but not in sys.procedures)

---

### 👁️ Views (9)

1. **vw_daily_sales_by_betting_pool**
   - Purpose: Daily sales summary by betting pool
   - Columns: betting_pool_id, code, name, zone, tickets, lines, sales, commission, prizes, net_revenue

2. **vw_expiring_permissions**
   - Purpose: Permissions expiring in next 7 days
   - Columns: username, full_name, permission_code, expires_at, days_until_expiration, granted_by

3. **vw_hot_numbers_today**
   - Purpose: Today's number sales statistics
   - Columns: bet_number, lottery_id, times_played, total_bet, avg_bet, max_bet, min_bet

4. **vw_pending_winners**
   - Purpose: Unpaid winning tickets
   - Columns: ticket_id, serial_number, betting_pool, user, total_prize, winning_lines, created_at

5. **vw_tickets_complete**
   - Purpose: Complete ticket information with all related data
   - Columns: Comprehensive ticket, betting pool, zone, user, and payment details

6. **vw_user_permissions_summary**
   - Purpose: User permissions summary (direct + role)
   - Columns: user_id, username, role, direct_permissions_count, role_permissions_count, total_permissions

7. **vw_users_multiple_betting_pools**
   - Purpose: Users assigned to multiple betting pools
   - Columns: user_id, username, betting_pools_count, betting_pools (comma-separated)

8. **vw_users_multiple_zones**
   - Purpose: Users belonging to multiple zones
   - Columns: user_id, username, zones_count, zones (comma-separated)

9. **vw_users_with_direct_permissions**
   - Purpose: Users with direct (non-role) permissions
   - Columns: user_id, username, permission_code, grant_date, expires_at, granted_by

**Note:** 2 views from initial count were not found:
- `database_firewall_rules` (system view, not extracted)
- `vw_betting_pool_complete_config` (not in current database)

---

## Schema Characteristics

### Relationships
- **N:M Relationships:**
  - Users ↔ Zones (via `user_zones`)
  - Users ↔ Betting Pools (via `user_betting_pools`)
  - Lotteries ↔ Game Types (via `lottery_game_compatibility`)

- **1:M Relationships:**
  - Countries → Lotteries
  - Lotteries → Draws
  - Betting Pools → Tickets
  - Tickets → Ticket Lines
  - Users → Roles
  - Zones → Betting Pools

### Key Features
1. **Hybrid Permission System**
   - 61 permissions across 9 categories
   - Direct user permissions + role-based permissions
   - Temporal permissions with expiration dates
   - Permission audit trail

2. **Multi-Tenancy Support**
   - Zone-based organization
   - Betting pool isolation
   - User-zone assignments
   - Bank hierarchies

3. **Comprehensive Configuration**
   - 12 betting pool configuration tables
   - Draw-specific settings
   - Prize configurations
   - Styling and branding options

4. **Audit & Compliance**
   - Audit logs for all major operations
   - Error logging
   - Prize change tracking
   - Financial transaction history

5. **Business Intelligence**
   - Hot numbers tracking
   - Daily sales summaries
   - Permission expiration monitoring
   - Winner detection and payment tracking

---

## Data Types Used

### String Types
- `varchar(n)` - ASCII strings
- `nvarchar(n)` - Unicode strings
- `nvarchar(MAX)` - Large text fields
- `char(n)` - Fixed-length strings

### Numeric Types
- `int` - Standard integers
- `bigint` - Large integers (tickets, IDs)
- `decimal(p,s)` - Precise decimals for money/prizes
- `bit` - Boolean flags

### Date/Time Types
- `datetime2` - High-precision dates
- `date` - Date-only fields
- `time` - Time-only fields

### Special Types
- `varbinary(MAX)` - Binary data
- `uniqueidentifier` - GUIDs (minimal use)

---

## Constraints Summary

### Primary Keys (44)
- All tables except 3 have primary keys
- Most use IDENTITY columns for auto-increment
- Clustered indexes on primary keys

### Foreign Keys (62)
- Comprehensive referential integrity
- CASCADE delete on critical relationships
- NO ACTION on most parent-child relationships
- Self-referencing FKs for audit trails (created_by, updated_by)

### Indexes (85)
- Nonclustered indexes on frequently queried columns
- Composite indexes for complex queries
- Unique indexes for business constraints
- Foreign key columns indexed for join performance

### Default Constraints
- `GETDATE()` for timestamp columns
- `0` for numeric counters
- `1` for boolean active flags
- Empty strings for optional text fields

---

## Extraction Method

### Tools Used
1. **sqlcmd** (Microsoft SQL Server Command-Line Tool)
   - Version: /opt/mssql-tools18/bin/sqlcmd
   - Connection: TLS 1.2 with trusted certificate (-C flag)

2. **Python 3** (Extraction Scripts)
   - `generate_schema.py` - Initial table extraction
   - `extract_final.py` - Stored procedures and views extraction

### System Catalog Queries
- `sys.tables` - Table metadata
- `sys.columns` - Column definitions
- `sys.types` - Data type information
- `sys.key_constraints` - Primary keys
- `sys.foreign_keys` - Foreign key relationships
- `sys.indexes` - Index definitions
- `sys.sql_modules` - Stored procedure/view definitions
- `sys.procedures` - Stored procedure list
- `sys.views` - View list

### Extraction Process
1. Connected to Azure SQL Database
2. Queried system catalog views for schema metadata
3. Generated CREATE TABLE statements with:
   - Column definitions with data types
   - IDENTITY specifications
   - NULL/NOT NULL constraints
   - DEFAULT values
   - Primary key constraints
   - Foreign key constraints with ON DELETE/UPDATE actions
   - Indexes (unique and non-unique)
4. Extracted stored procedure definitions from `sys.sql_modules`
5. Extracted view definitions from `sys.sql_modules`
6. Combined all into single comprehensive script

---

## Script Structure

The generated SQL script follows this structure:

```sql
-- Header with metadata
-- USE database statement

-- ============================================
-- DROP EXISTING OBJECTS
-- ============================================
-- Drop foreign keys first (62 statements)
-- Drop tables (47 statements)
-- Drop stored procedures (11 statements)
-- Drop views (9 statements)

-- ============================================
-- CREATE TABLES (47 tables)
-- ============================================
-- Each table includes:
--   - CREATE TABLE with columns
--   - Primary key constraint
--   - Foreign key constraints
--   - Indexes

-- ============================================
-- CREATE STORED PROCEDURES (11 procedures)
-- ============================================
-- Complete procedure definitions

-- ============================================
-- CREATE VIEWS (9 views)
-- ============================================
-- Complete view definitions
```

---

## Warnings & Notes

### ⚠️ Missing Objects
1. **Stored Procedures (2):**
   - `sp_CalculateTicketTotals` - Referenced in `sp_CheckTicketWinners` but not found in database
   - `sp_CancelTicket` - Expected but not found

2. **Views (2):**
   - `database_firewall_rules` - System view, not extracted
   - `vw_betting_pool_complete_config` - Not found in current database

### ⚠️ Potential Issues
1. Some stored procedures reference objects that weren't found (e.g., `sp_CalculateTicketTotals`)
2. Error logging assumes `error_logs` table exists with specific columns
3. Some foreign keys may have circular dependencies (check execution order)

### ✅ Recommendations
1. **Before Execution:**
   - Review the DROP statements section carefully
   - Ensure you have a backup of the current database
   - Test on a development/staging environment first

2. **Execution Order:**
   - Execute as a single script (dependencies are ordered)
   - Or execute in sections: DROP → CREATE TABLES → CREATE SPs → CREATE VIEWS

3. **Post-Execution:**
   - Verify all foreign keys created successfully
   - Check for any missing stored procedures
   - Validate view definitions
   - Run test queries to ensure data integrity

---

## Version History

### Version 2.0 (2025-11-01)
- Complete extraction of 47 tables with full definitions
- 11 stored procedures with complete code
- 9 views with complete definitions
- All constraints, indexes, and relationships
- Generated using Python scripts and sqlcmd

### Version 1.0 (Previous)
- Initial schema extraction
- Tables with basic structure
- Incomplete stored procedures and views

---

## Contact & Support

**Database:** lottery-db
**Server:** lottery-sql-1505.database.windows.net
**Administrator:** lotteryAdmin

For questions or issues with this schema, refer to the project documentation or database administrator.

---

**End of Summary Report**
