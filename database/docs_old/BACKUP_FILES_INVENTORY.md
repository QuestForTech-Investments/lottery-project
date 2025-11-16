# Lottery Database - Backup Files Inventory

**Generated:** 2025-11-01 18:37:00

**Location:** `/home/jorge/projects/Lottery-Database/`

---

## Generated Files

### Primary Backup File

| File | Size | MD5 Checksum | Lines | Description |
|------|------|--------------|-------|-------------|
| `lottery_database_complete_with_data.sql` | 346 KB | `754b2b7d10b1fe8a759975fadf9ad645` | 3,298 | Complete SQL backup with structure and all data from 47 tables |

**Contents:**
- Database structure (DROP + CREATE statements)
- 794 data records from 20 tables
- Foreign key constraint management
- IDENTITY_INSERT handling
- Stored procedures and views
- Transaction safety controls

**Sections:**
1. Header & metadata (lines 1-11)
2. DROP existing objects (lines 12-220)
3. CREATE structure (lines 221-1212)
4. INSERT data (lines 1213-3200)
5. Stored procedures & views (lines 3201-3298)

---

### Documentation Files

| File | Size | MD5 Checksum | Lines | Description |
|------|------|--------------|-------|-------------|
| `database_schema_documentation.md` | 48 KB | `c9d35ddfe21da67ba6998994e3e77fce` | 1,610 | Complete schema documentation with ERD diagrams |
| `BACKUP_SUMMARY_REPORT.md` | 12 KB | `9f85888109f720a0ab498021fba09c35` | 475 | Detailed backup report and usage guide |

**Schema Documentation Contents:**
- Database overview statistics
- Table-by-table documentation (47 tables)
- Mermaid ERD diagrams (4 diagrams)
- Column definitions with constraints
- Foreign key relationships
- Primary key indicators
- Identity column markers

**Summary Report Contents:**
- Executive summary
- Database statistics
- Record distribution by category
- Restore instructions
- Troubleshooting guide
- Maintenance recommendations

---

## Database Snapshot

### Statistics Summary

```
Total Tables:          47
Total Records:        794
Tables with Data:      20
Empty Tables:          27
Foreign Keys:          62
Stored Procedures:     11
Views:                  9
```

### Record Distribution

#### Core Data (590 records)
- countries: 9
- lotteries: 69
- draws: 116
- game_types: 21
- game_categories: 3
- bet_types: 33
- lottery_game_compatibility: 275
- prize_fields: 64

#### User Management (163 records)
- users: 24
- permissions: 61
- user_permissions: 37
- user_zones: 25
- zones: 16

#### Betting Pools (41 records)
- betting_pools: 18
- betting_pool_config: 7
- betting_pool_discount_config: 7
- betting_pool_print_config: 7
- betting_pool_footers: 1
- banca_prize_configs: 1

---

## Quick Reference

### Restore Commands

#### Full Restore (Structure + Data)
```bash
sqlcmd -C -S lottery-sql-1505.database.windows.net \
  -d lottery-db \
  -U lotteryAdmin \
  -P IotSlotsLottery123 \
  -i lottery_database_complete_with_data.sql
```

#### Data-Only Restore
```sql
-- Disable FK constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- Run INSERT statements (lines 1213-3200)
-- ...

-- Re-enable FK constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
```

### Verification Queries

#### Check Table Counts
```sql
SELECT
    t.name AS TableName,
    p.rows AS RecordCount
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0,1)
ORDER BY t.name;
```

#### Verify FK Constraints
```sql
SELECT
    OBJECT_NAME(parent_object_id) AS TableName,
    name AS ConstraintName,
    is_disabled
FROM sys.foreign_keys
WHERE is_disabled = 1;  -- Should return 0 rows
```

---

## File Integrity

### Checksums

Use these checksums to verify file integrity after transfer:

```bash
md5sum lottery_database_complete_with_data.sql
# Expected: 754b2b7d10b1fe8a759975fadf9ad645

md5sum database_schema_documentation.md
# Expected: c9d35ddfe21da67ba6998994e3e77fce

md5sum BACKUP_SUMMARY_REPORT.md
# Expected: 9f85888109f720a0ab498021fba09c35
```

### File Validation

To validate the SQL script without executing:
```bash
sqlcmd -C -S lottery-sql-1505.database.windows.net \
  -d lottery-db \
  -U lotteryAdmin \
  -P IotSlotsLottery123 \
  -i lottery_database_complete_with_data.sql \
  -n  # Parse only, do not execute
```

---

## Version History

| Version | Date | Description | Records |
|---------|------|-------------|---------|
| 4.0 | 2025-11-01 | Complete backup with data | 794 |
| 3.0 | 2025-10-31 | Structure-only backup | 0 |
| 2.0 | 2025-10-22 | Initial Azure migration | N/A |

---

## Related Files

### In Lottery-Database Directory

- `lottery_database_azure_v2.sql` (101 KB) - Structure-only backup (previous version)
- `stored_procedures_final.sql` (31 KB) - Stored procedures only
- `views_final.sql` (7 KB) - Views only
- `AZURE_SQL_SETUP_GUIDE.md` (45 KB) - Azure setup guide
- `DATABASE_ANALYSIS_REPORT.md` (66 KB) - Database analysis
- `SISTEMA_NEGOCIO_LOTTO.md` (39 KB) - Business logic documentation

### In LottoWebApp Directory

- `/home/jorge/projects/Lottery-Project/LottoWebApp/` - Frontend application
- React 18 + Vite web application
- Connects to this database via API

### In LottoApi Directory

- `/home/jorge/projects/Lottery-Project/LottoApi/` - .NET 8.0 API
- Entity Framework Core 8.0
- JWT authentication
- 70+ API endpoints

---

## Best Practices

### Backup Schedule

- **Daily:** Generate fresh backup after business hours
- **Weekly:** Archive backups with date stamps
- **Monthly:** Store off-site copies

### File Naming Convention

Recommended format for archived backups:
```
lottery_database_YYYYMMDD_HHMM.sql
database_schema_YYYYMMDD.md
```

Example:
```
lottery_database_20251101_1830.sql
database_schema_20251101.md
```

### Storage Recommendations

- Keep minimum 7 daily backups
- Keep minimum 4 weekly backups
- Keep minimum 12 monthly backups
- Total minimum retention: 90 days

### Security

- Store backups in encrypted format
- Limit access to backup files (contains password hashes)
- Use secure transfer protocols (SFTP, SCP)
- Verify checksums after transfer

---

## Support

For questions or issues:

1. Review the documentation files first
2. Check the main project CLAUDE.md files
3. Consult the API documentation in LottoApi/Docs/

---

**End of Inventory**

*This inventory file is automatically updated with each backup generation.*
