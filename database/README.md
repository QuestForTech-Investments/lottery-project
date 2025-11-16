# Lottery Database

Complete database schema, documentation, and scripts for the Lottery Management System.

**Server:** lottery-sql-1505.database.windows.net
**Database:** lottery-db
**Last Updated:** November 13, 2025

---

## 📂 Project Structure

```
Lottery-Database/
├── docs/              # Current documentation and scripts (10 files)
├── docs_old/          # Archived documentation (38 files)
├── .git/              # Git repository
└── README.md          # This file
```

---

## 📚 Documentation (docs/)

### Quick Start
- **[docs/README.md](docs/README.md)** - Documentation index
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Quick start guide
- **[docs/CLAUDE.md](docs/CLAUDE.md)** - Instructions for Claude Code

### Database Reference ⭐
- **[docs/database_schema_documentation.md](docs/database_schema_documentation.md)** (48 KB)
  - Complete schema with all 48 tables
  - Entity relationship diagrams
  - Foreign key mappings
  - 258 database objects documented

- **[docs/BET_TYPES_AND_PRIZE_FIELDS_REFERENCE.md](docs/BET_TYPES_AND_PRIZE_FIELDS_REFERENCE.md)** (12 KB)
  - 23 bet types reference
  - 50 prize fields documentation
  - Quick lookup tables
  - Field naming conventions

### Latest Updates ⭐ NEW
- **[docs/DATABASE_UPDATE_SUMMARY_2025-11-02.md](docs/DATABASE_UPDATE_SUMMARY_2025-11-02.md)** (9 KB)
  - November 2025 updates summary
  - Bet types and prize fields corrections
  - Performance improvements (35-58% faster)
  - Testing checklist

### Business Logic
- **[docs/SISTEMA_NEGOCIO_LOTTO.md](docs/SISTEMA_NEGOCIO_LOTTO.md)** (39 KB)
  - Complete business rules documentation
  - Lottery operations workflows
  - Prize calculation logic

---

## 💾 Database Scripts (docs/)

### Current Production Script ⭐
**[docs/lottery_database_complete_with_data.sql](docs/lottery_database_complete_with_data.sql)** (346 KB)
- Complete database schema with updated prize values (Nov 2, 2025)
- All 48 tables with structure
- Stored procedures and views
- Sample data included
- **Contains all corrected bet types and prize field values**

### Latest Migration ⭐ NEW
**[docs/MIGRATION_PRIZE_FIELDS_UPDATE_2025-11-02.sql](docs/MIGRATION_PRIZE_FIELDS_UPDATE_2025-11-02.sql)** (21 KB)
- Updates bet types (23 total)
- Updates prize fields (50 total)
- Corrects all default multiplier values
- Safe to run multiple times (idempotent)

---

## 🚀 Quick Usage

### Full Database Recreation (Recommended - Already Includes Nov 2025 Updates)
```bash
cd /home/jorge/projects/Lottery-Database/docs
sqlcmd -S your-server.database.windows.net \
       -d your-database \
       -U username \
       -P password \
       -C \
       -i lottery_database_complete_with_data.sql
```

**Note:** The complete script now includes all November 2025 updates. No need to run the migration separately.

### Update Existing Database (If you have an older version)
```bash
cd /home/jorge/projects/Lottery-Database/docs
sqlcmd -S lottery-sql-1505.database.windows.net \
       -d lottery-db \
       -U lotteryAdmin \
       -P YourPassword \
       -C \
       -i MIGRATION_PRIZE_FIELDS_UPDATE_2025-11-02.sql
```

### Deploy to Azure
```bash
cd /home/jorge/projects/Lottery-Database/docs
pwsh deploy-to-azure-production.ps1
```

---

## 📊 Database Summary

| Object Type | Count |
|------------|-------|
| Tables | 48 |
| Lotteries | 31 |
| Draws (Sorteos) | 69 |
| Bet Types | 23 |
| Prize Fields | 50 |
| Stored Procedures | 11 |
| Views | 9 |
| Primary Keys | 44 |
| Foreign Keys | 62 |
| Indexes | 85 |
| **Total Objects** | **372** |

---

## 🔧 Key Features

1. **Hybrid Permission System**
   - 61 permissions across 9 categories
   - Role-based + direct user permissions

2. **Multi-Tenancy**
   - Zone-based organization
   - N:M user-zone relationships

3. **Data-Driven Prize System** ⭐ NEW
   - 23 bet types with descriptive names
   - 50 prize fields with database-driven configuration
   - No hardcoded mappings in frontend

4. **Comprehensive Audit**
   - Audit logs for all operations
   - Error logging
   - Prize change tracking

5. **Business Intelligence**
   - Hot numbers tracking
   - Sales summaries
   - Winner tracking

---

## 🎯 Key Tables

### Core System
- `users`, `roles`, `permissions` - User management
- `betting_pools`, `zones`, `banks` - Organization
- `lotteries` (31 records) - Lottery games (Florida Lottery, Loteka, etc.)
- `draws` (69 records) - Lottery draws/sorteos (each belongs to a lottery)
- `game_types` - Game type definitions

### Prize System ⭐
- `bet_types` - 23 bet types
- `prize_fields` - 50 prize fields with descriptive names
- `banca_prize_configs` - Betting pool custom prizes
- `draw_prize_configs` - Draw-specific prizes

### Transactions
- `tickets`, `ticket_lines` - Sales
- `results`, `prizes` - Winners & payouts
- `balances`, `financial_transactions` - Accounting

### Configuration
- 12 `betting_pool_*` tables - Betting pool settings
- `limit_rules`, `limit_consumption` - Betting limits
- `draw_game_compatibility` - Draw-game compatibility matrix (renamed from lottery_game_compatibility)
- `draw_bet_type_compatibility` - Draw-bet type compatibility (renamed from lottery_bet_type_compatibility)

---

## 📦 Archived Documentation (docs_old/)

38 archived files including:
- Old database schema versions
- Extraction scripts (Python)
- Previous migration scripts
- Historical documentation
- Backup analysis reports

**Note:** Archived files are kept for reference but are no longer actively maintained.

---

## 🔄 Recent Changes

### November 13, 2025 (Database Migration)
- ✅ Restructured lotteries and draws relationship (1:N)
- ✅ Updated lotteries table: 69 → 31 real lottery games
- ✅ Created draws table: 69 sorteos/draws, each with lottery_id FK
- ✅ Renamed tables: lottery_bet_type_compatibility → draw_bet_type_compatibility
- ✅ Renamed tables: lottery_game_compatibility → draw_game_compatibility
- ✅ Deleted lottery-db-dev database (no longer needed)
- ✅ Updated all API endpoints to return lottery information with draws

### November 2, 2025 (Updated)
- ✅ Updated all 23 bet types with correct names
- ✅ Updated all 50 prize fields with descriptive names
- ✅ Corrected default multiplier values
- ✅ Created migration script
- ✅ Reorganized documentation structure
- ✅ **Updated complete database script with corrected values**

### November 1, 2025
- Extracted complete database schema
- Generated comprehensive documentation
- Created backup with data

---

## 📝 Notes

### For Developers
- Frontend now uses `field_code` directly (no conversion layer)
- Adding new bet types/fields requires only database updates
- See `docs/DATABASE_UPDATE_SUMMARY_2025-11-02.md` for details

### For DBAs
- Always backup before running migration scripts
- Test migrations on dev/staging first
- Migration scripts are idempotent (safe to re-run)

### For Business Analysts
- See `docs/SISTEMA_NEGOCIO_LOTTO.md` for business rules
- See `docs/BET_TYPES_AND_PRIZE_FIELDS_REFERENCE.md` for prize lookup

---

## 🤝 Contributing

When adding new documentation:
1. Place current/active files in `docs/`
2. Move outdated files to `docs_old/`
3. Update this README
4. Update `docs/README.md`

---

## 📞 Support

**Database:** Contact DBA team
**Frontend:** See `/home/jorge/projects/LottoWebApp`
**Backend API:** See `/home/jorge/projects/Lottery-Project`

---

**Last Updated:** November 13, 2025
**Maintained By:** Lottery Management System Team
