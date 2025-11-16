# Lottery Database - Complete Backup Report

**Generated:** November 1, 2025 - 18:31:18

**Database:** lottery-db @ lottery-sql-1505.database.windows.net

---

## Executive Summary

This document summarizes the complete database backup operation including structure and data extraction from the Azure SQL Database.

### Files Generated

| File | Size | Lines | Description |
|------|------|-------|-------------|
| `lottery_database_complete_with_data.sql` | 346 KB | 3,298 | Complete backup with structure and all data |
| `database_schema_documentation.md` | 48 KB | 1,610 | Complete schema documentation with ERD |

---

## Database Statistics

### Overview

- **Total Tables:** 47
- **Total Records:** 794
- **Tables with Data:** 20
- **Empty Tables:** 27
- **Foreign Key Constraints:** 62
- **Stored Procedures:** 11
- **Views:** 9

### Table Record Counts

#### Core Tables (High Priority)

| Table | Records | Purpose |
|-------|--------:|---------|
| `countries` | 9 | Country master data |
| `lotteries` | 69 | Lottery configurations |
| `draws` | 116 | Draw schedules |
| `game_types` | 21 | Game type definitions |
| `game_categories` | 3 | Game category classifications |
| `bet_types` | 33 | Betting type configurations |
| `lottery_game_compatibility` | 275 | Lottery-game relationships |
| `prize_fields` | 64 | Prize field definitions |

**Core Tables Total:** 590 records

#### User Management Tables

| Table | Records | Purpose |
|-------|--------:|---------|
| `users` | 24 | User accounts |
| `permissions` | 61 | Permission definitions |
| `user_permissions` | 37 | Direct user permissions |
| `user_zones` | 25 | User-zone assignments |
| `zones` | 16 | Geographic zones |
| `roles` | 0 | User roles (empty) |
| `role_permissions` | 0 | Role-permission assignments (empty) |

**User Management Total:** 163 records

#### Betting Pool Configuration

| Table | Records | Purpose |
|-------|--------:|---------|
| `betting_pools` | 18 | Betting pool (banca) master |
| `betting_pool_config` | 7 | Pool configurations |
| `betting_pool_discount_config` | 7 | Discount settings |
| `betting_pool_print_config` | 7 | Print configurations |
| `betting_pool_footers` | 1 | Footer templates |
| `banca_prize_configs` | 1 | Custom prize configurations |

**Betting Pool Total:** 41 records

#### Empty Tables (Structure Only)

The following tables have defined structure but no data:

- `audit_log` - Audit trail (logging)
- `balances` - Betting pool balances
- `banks` - Bank master data
- `betting_pool_automatic_expenses` - Automatic expenses
- `betting_pool_draw_config` - Draw-specific configurations
- `betting_pool_draws` - Pool-draw relationships
- `betting_pool_general_config` - General configurations
- `betting_pool_prizes_commissions` - Prize commissions
- `betting_pool_schedules` - Operating schedules
- `betting_pool_sortitions` - Sortition configurations
- `betting_pool_styles` - Styling configurations
- `draw_prize_configs` - Draw prize settings
- `error_logs` - Error logging
- `financial_transactions` - Financial transactions
- `hot_numbers` - Hot number statistics
- `limit_consumption` - Limit consumption tracking
- `limit_rules` - Betting limit rules
- `prize_changes_audit` - Prize change audit
- `prizes` - Prize records
- `results` - Draw results
- `ticket_lines` - Ticket line items
- `tickets` - Ticket master
- `user_betting_pools` - User-pool assignments
- Backup tables: `user_betting_pools_backup`, `user_permissions_backup`, `user_zones_backup`

---

## Backup Script Details

### Structure

The complete SQL script is organized as follows:

1. **Header** (Lines 1-11)
   - Metadata and connection information
   - Generated timestamp

2. **DROP EXISTING OBJECTS** (Lines 12-220)
   - Foreign key constraints (91 constraints)
   - Tables (47 tables)
   - Stored procedures (13 procedures)
   - Views (11 views)

3. **CREATE STRUCTURE** (Lines 221-1212)
   - Table definitions with columns, constraints, indexes
   - Foreign key relationships
   - Primary keys and unique constraints

4. **INSERT DATA** (Lines 1213-3200)
   - Data insertion in dependency order
   - IDENTITY_INSERT handling for auto-increment columns
   - Foreign key constraint management

5. **STORED PROCEDURES & VIEWS** (Lines 3201-3298)
   - Stored procedure definitions
   - View definitions

### Key Features

#### Foreign Key Management

```sql
-- Disable all foreign key constraints before data insertion
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- Data insertion here...

-- Re-enable all foreign key constraints after data insertion
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
```

#### Identity Column Handling

For tables with IDENTITY columns:

```sql
SET IDENTITY_INSERT [table_name] ON;
-- INSERT statements...
SET IDENTITY_INSERT [table_name] OFF;
```

#### Data Dependency Order

Tables are inserted in the following order to respect foreign key dependencies:

1. **Level 0:** No dependencies
   - countries, game_categories, bet_types, permissions, roles

2. **Level 1:** Single-level dependencies
   - zones, lotteries, game_types

3. **Level 2:** Multi-level dependencies
   - users, lottery_game_compatibility, draws, prize_fields

4. **Level 3+:** Complex dependencies
   - betting_pools, user_zones, user_permissions
   - All betting pool configuration tables
   - Transaction tables (tickets, results, prizes)

---

## Documentation

### Entity Relationship Diagrams

The documentation includes Mermaid ERD diagrams for:

1. **Core Entities**
   - Countries, lotteries, draws, game types
   - Prize fields and compatibility

2. **User Management**
   - Users, roles, permissions
   - User-zone many-to-many relationships

3. **Betting Pools**
   - Pool master data
   - All configuration tables
   - Pool-draw relationships

4. **Tickets & Results**
   - Ticket lifecycle
   - Results and prizes
   - Line items

### Table Documentation

Each table includes:
- Column definitions with data types
- Primary key indicators
- Identity column markers
- Nullable/not-null constraints
- Default values
- Foreign key relationships
- Referenced by (reverse relationships)

---

## Usage Instructions

### Restoring the Database

#### Option 1: Complete Restore (Drop & Recreate)

```bash
sqlcmd -C -S lottery-sql-1505.database.windows.net \
  -d lottery-db \
  -U lotteryAdmin \
  -P IotSlotsLottery123 \
  -i lottery_database_complete_with_data.sql
```

#### Option 2: Data-Only Restore

If you only need to restore data to an existing structure:

1. Extract only the INSERT statements (lines 1213-3200)
2. Run with foreign key constraint management

```sql
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
-- Run INSERT statements
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
```

#### Option 3: Selective Table Restore

To restore specific tables:

1. Find the table's INSERT section in the script
2. Extract SET IDENTITY_INSERT (if applicable)
3. Extract INSERT statements
4. Run with proper constraint management

### Verification After Restore

```sql
-- Check table counts
SELECT
    t.name AS TableName,
    p.rows AS RecordCount
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0,1)
ORDER BY t.name;

-- Verify foreign key constraints
SELECT
    OBJECT_NAME(parent_object_id) AS TableName,
    name AS ConstraintName,
    is_disabled
FROM sys.foreign_keys
WHERE is_disabled = 1;  -- Should return 0 rows
```

---

## Important Notes

### Passwords and Security

The backup includes hashed passwords (bcrypt) for users and betting pools:
- User passwords are stored in `users.password_hash`
- Betting pool passwords are stored in `betting_pools.password_hash`
- These are bcrypt hashes and cannot be reversed

### Backup Tables

Three backup tables exist with historical data:
- `user_zones_backup` - Previous user-zone assignments
- `user_permissions_backup` - Previous permission assignments
- `user_betting_pools_backup` - Previous pool assignments

These are currently empty but preserve schema for future use.

### IDENTITY Columns

The following tables use IDENTITY columns (auto-increment):
- `audit_log` (audit_id)
- `banca_prize_configs` (config_id)
- `bet_types` (bet_type_id)
- `betting_pool_config` (config_id)
- `betting_pool_discount_config` (discount_config_id)
- `betting_pool_draw_config` (config_sorteo_id)
- `betting_pool_footers` (footer_id)
- `betting_pool_general_config` (config_id)
- `betting_pool_print_config` (print_config_id)
- `betting_pools` (betting_pool_id)
- `draws` (draw_id)
- `game_types` (game_type_id)
- `lotteries` (lottery_id)
- `permissions` (permission_id)
- `prize_fields` (prize_field_id)
- `roles` (role_id)
- `tickets` (ticket_id)
- `users` (user_id)
- `zones` (zone_id)

### Timestamp Fields

Many tables use `datetime2` for timestamps:
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

Default values use `getdate()` or `getutcdate()`.

---

## Maintenance Recommendations

### Regular Backups

1. **Daily:** Run this backup script to capture daily changes
2. **Weekly:** Archive backup files with versioning
3. **Monthly:** Store off-site backup copies

### Monitoring

Monitor growth of these critical tables:
- `tickets` - Transaction volume
- `ticket_lines` - Line item growth
- `results` - Draw results accumulation
- `prizes` - Prize records
- `audit_log` - Audit trail growth
- `error_logs` - Error tracking

### Cleanup Strategies

Consider periodic cleanup for:
- Old audit logs (retain 90-180 days)
- Paid prizes (archive after 1 year)
- Error logs (retain 30-60 days)
- Cancelled tickets (archive after 30 days)

---

## Support Information

### Files Location

All backup files are stored in:
```
/home/jorge/projects/Lottery-Database/
```

### Key Files

- `lottery_database_complete_with_data.sql` - Complete backup
- `database_schema_documentation.md` - Schema documentation
- `lottery_database_azure_v2.sql` - Structure-only backup (previous)

### Version History

- **v4.0** (2025-11-01) - Complete backup with data (this version)
- **v3.0** (2025-10-31) - Structure-only backup
- **v2.0** (2025-10-22) - Initial Azure migration

---

## Troubleshooting

### Common Issues

#### Issue: Foreign Key Constraint Violations

**Solution:** Ensure foreign key constraints are disabled before bulk INSERT:
```sql
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
```

#### Issue: IDENTITY_INSERT Errors

**Solution:** Verify only one table has IDENTITY_INSERT ON at a time:
```sql
SET IDENTITY_INSERT [table_name] ON;
-- INSERT statements
SET IDENTITY_INSERT [table_name] OFF;
```

#### Issue: Duplicate Primary Key Values

**Solution:** Drop and recreate the database, then run complete script:
```sql
DROP DATABASE [lottery-db];
CREATE DATABASE [lottery-db];
-- Run complete backup script
```

#### Issue: Permission Denied

**Solution:** Verify user has necessary permissions:
```sql
-- User needs:
-- - db_owner role OR
-- - db_ddladmin + db_datawriter roles
```

---

## Changelog

### 2025-11-01 - v4.0 Complete Backup

- Generated complete SQL backup with structure and data
- Created comprehensive schema documentation
- Added ERD diagrams with Mermaid
- Documented all 47 tables with relationships
- Extracted 794 records from 20 tables
- Added foreign key dependency ordering
- Implemented IDENTITY_INSERT handling

---

**End of Report**

*For questions or issues, refer to the main project documentation in `/home/jorge/projects/Lottery-Project/`*
