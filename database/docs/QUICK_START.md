# Lottery Database Backup - Quick Start Guide

**Version:** 4.0 | **Date:** 2025-11-01

---

## What You Have

Three files have been generated:

1. **lottery_database_complete_with_data.sql** (346 KB)
   - Complete database backup with structure and data

2. **database_schema_documentation.md** (48 KB)
   - Full schema documentation with diagrams

3. **BACKUP_SUMMARY_REPORT.md** (12 KB)
   - Detailed report and instructions

---

## Quick Restore

### Option 1: Full Database Restore (Recommended)

This will DROP and recreate everything:

```bash
sqlcmd -C \
  -S lottery-sql-1505.database.windows.net \
  -d lottery-db \
  -U lotteryAdmin \
  -P NewLottery2025 \
  -i lottery_database_complete_with_data.sql
```

**Time:** ~2-3 minutes
**Result:** Complete database with 794 records

---

### Option 2: Data-Only Restore

If you already have the structure and only need data:

1. Open the SQL file
2. Find line 1213 (`-- INSERT DATA`)
3. Copy everything from line 1213 to line 3200
4. Run in SQL client

**OR** use this command:

```bash
# Extract data section only
sed -n '1213,3200p' lottery_database_complete_with_data.sql > data_only.sql

# Run it
sqlcmd -C -S lottery-sql-1505.database.windows.net \
  -d lottery-db -U lotteryAdmin -P NewLottery2025 \
  -i data_only.sql
```

---

## What's Inside

### 794 Records Across 20 Tables

**Core Data (590 records):**
- 69 lotteries
- 116 scheduled draws
- 275 lottery-game combinations
- 64 prize field configurations
- 33 bet types
- 21 game types
- 9 countries
- 3 game categories

**User Data (163 records):**
- 24 users
- 61 permissions
- 37 user-permission assignments
- 25 user-zone assignments
- 16 geographic zones

**Betting Pool Data (41 records):**
- 18 betting pools (bancas)
- 21 configuration records
- 1 footer template
- 1 prize configuration

---

## Verify After Restore

```sql
-- Check total records
SELECT COUNT(*) FROM countries;     -- Should be 9
SELECT COUNT(*) FROM lotteries;     -- Should be 69
SELECT COUNT(*) FROM draws;         -- Should be 116
SELECT COUNT(*) FROM users;         -- Should be 24
SELECT COUNT(*) FROM betting_pools; -- Should be 18

-- Check all tables
SELECT
    t.name AS TableName,
    SUM(p.rows) AS RecordCount
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0,1)
GROUP BY t.name
ORDER BY t.name;
```

---

## Common Tasks

### View Schema Documentation

```bash
# Open in default markdown viewer
xdg-open database_schema_documentation.md

# Or use a markdown viewer
mdless database_schema_documentation.md
```

### Extract Specific Table Data

To get INSERT statements for a specific table:

```bash
# Example: Extract only users table
grep -A 100 "-- Table: users" lottery_database_complete_with_data.sql | \
  grep "INSERT INTO"
```

### Check File Integrity

```bash
# Verify checksums
md5sum lottery_database_complete_with_data.sql
# Expected: 754b2b7d10b1fe8a759975fadf9ad645

md5sum database_schema_documentation.md
# Expected: c9d35ddfe21da67ba6998994e3e77fce
```

---

## Troubleshooting

### Error: "Cannot drop database because it is currently in use"

**Solution:** Kill all connections first:
```sql
USE master;
GO

ALTER DATABASE [lottery-db] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [lottery-db];
CREATE DATABASE [lottery-db];
```

### Error: "IDENTITY_INSERT is already ON for table X"

**Solution:** Turn it OFF first:
```sql
SET IDENTITY_INSERT [table_name] OFF;
```

### Error: "Foreign key constraint violation"

**Solution:** Disable constraints first:
```sql
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
-- Run your inserts
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
```

---

## Next Steps

1. **Read Full Documentation**
   - Open `BACKUP_SUMMARY_REPORT.md` for complete details
   - Review `database_schema_documentation.md` for ERD diagrams

2. **Test Restore**
   - Restore to a test database first
   - Verify all record counts
   - Check application connectivity

3. **Archive Backup**
   - Copy files to secure location
   - Add date stamp to filename
   - Store checksums separately

4. **Schedule Regular Backups**
   - Run daily after business hours
   - Keep 7 daily + 4 weekly + 12 monthly backups
   - Monitor file sizes for growth

---

## Important Notes

- **Passwords:** User and betting pool passwords are bcrypt hashes
- **Empty Tables:** 27 tables have structure but no data (by design)
- **Timestamps:** All timestamps are in UTC (datetime2)
- **Identity Columns:** 19 tables use auto-increment IDs

---

## Files Location

All files are in:
```
/home/jorge/projects/Lottery-Database/
```

Main files:
- `lottery_database_complete_with_data.sql` - Backup script
- `database_schema_documentation.md` - Documentation
- `BACKUP_SUMMARY_REPORT.md` - Full report
- `BACKUP_FILES_INVENTORY.md` - File inventory
- `QUICK_START.md` - This file

---

## Database Connection

**Server:** lottery-sql-1505.database.windows.net
**Database:** lottery-db
**User:** lotteryAdmin
**Password:** NewLottery2025

**sqlcmd:** `/opt/mssql-tools18/bin/sqlcmd -C`

---

## One-Line Commands

```bash
# Full restore
sqlcmd -C -S lottery-sql-1505.database.windows.net -d lottery-db -U lotteryAdmin -P NewLottery2025 -i lottery_database_complete_with_data.sql

# View schema
mdless database_schema_documentation.md

# Check file size
ls -lh lottery_database_complete_with_data.sql

# Verify checksum
md5sum lottery_database_complete_with_data.sql

# Archive with date
cp lottery_database_complete_with_data.sql lottery_database_$(date +%Y%m%d_%H%M).sql
```

---

## Support

For detailed information, see:
- `BACKUP_SUMMARY_REPORT.md` - Complete report
- `database_schema_documentation.md` - Full schema
- `BACKUP_FILES_INVENTORY.md` - File inventory

For project documentation:
- `/home/jorge/projects/Lottery-Project/LottoApi/CLAUDE.md`
- `/home/jorge/projects/Lottery-Database/CLAUDE.md`

---

**Quick Start Complete!**

*For best results, read the BACKUP_SUMMARY_REPORT.md for complete instructions.*
