# Quick Reference: Database Expansion for Branches Table

**Generated:** 2025-10-19
**Status:** Ready for Implementation

---

## At a Glance

```
BEFORE:  37 fields (24% coverage)
AFTER:  154+ fields (100% coverage)

NEW TABLES:     5
NEW COLUMNS:   26 (in branches table)
NEW INDEXES:   11
NEW TRIGGERS:   5
FOREIGN KEYS:   5
```

---

## What Was Created

### 1. SQL Migration Script
**File:** `/docs/SQL_MIGRATION_BRANCHES_EXPANSION.sql`
**Size:** 18 KB
**Contains:**
- ALTER TABLE branches (26 new columns)
- CREATE TABLE branch_footers
- CREATE TABLE branch_schedules
- CREATE TABLE branch_lotteries
- CREATE TABLE branch_prize_configurations
- CREATE TABLE branch_expenses
- 5 update triggers
- 11 indexes
- Default data insertion for existing branches

### 2. Field Mapping Documentation
**File:** `/docs/FIELD_MAPPING_FRONTEND_TO_DATABASE.md`
**Size:** 17 KB
**Contains:**
- Complete mapping of all 154+ fields
- Organized by 8 frontend tabs
- Data type specifications
- API implications
- Migration checklist

### 3. This Quick Reference
**File:** `/docs/QUICK_REFERENCE_DATABASE_EXPANSION.md`
**Contains:** This summary

---

## New Database Tables

### branches (ALTERED)
```sql
-- Added 26 new columns for configuration
sell_screen_style, ticket_print_style, deactivation_balance,
daily_sale_limit, daily_balance_limit, enable_temporary_balance,
temporary_additional_balance, control_winning_tickets,
allow_jackpot, print_enabled, print_ticket_copy, sms_only,
cancel_minutes, daily_cancel_tickets, max_cancel_amount,
max_ticket_amount, max_daily_recharge, enable_recharges,
print_recharge_receipt, allow_password_change, fall_type,
print_mode, discount_provider, discount_mode, payment_mode
```

### branch_footers (NEW)
```sql
footer_id, branch_id, auto_footer, footer_text1, footer_text2,
footer_text3, footer_text4, show_branch_info, show_date_time
```
**Relationship:** 1:1 with branches
**Purpose:** Footer configuration for tickets

### branch_schedules (NEW)
```sql
schedule_id, branch_id, day_of_week (1-7), day_name,
start_time, end_time, is_active
```
**Relationship:** 1:7 with branches (one row per day)
**Purpose:** Operating hours per day of week

### branch_lotteries (NEW)
```sql
branch_lottery_id, branch_id, lottery_id,
anticipated_closing, anticipated_closing_minutes, is_active
```
**Relationship:** 1:Many with branches
**Purpose:** Track which lotteries are active per branch

### branch_prize_configurations (NEW)
```sql
prize_config_id, branch_id,
90+ prize fields (pick3_first_payment, pick4_doubles, etc.)
```
**Relationship:** 1:1 with branches
**Purpose:** Prize amounts for all lottery types

### branch_expenses (NEW)
```sql
expense_id, branch_id, expense_name, expense_description,
expense_amount, is_recurring, recurrence_type,
recurrence_day, is_active
```
**Relationship:** 1:Many with branches
**Purpose:** Automatic/recurring expenses per branch

---

## Field Coverage by Tab

| Tab | Fields | Before | After | Status |
|-----|--------|--------|-------|--------|
| **1. General** | 8 | 8 (100%) | 8 (100%) | ✓ Complete |
| **2. Configuración** | 28 | 1 (4%) | 28 (100%) | ✓ Complete |
| **3. Pies de página** | 7 | 0 (0%) | 7 (100%) | ✓ Complete |
| **4. Premios & Comisiones** | 90+ | 0 (0%) | 90+ (100%) | ✓ Complete |
| **5. Horarios** | 14 | 0 (0%) | 14 (100%) | ✓ Complete |
| **6. Sorteos** | 2+ | 0 (0%) | 2+ (100%) | ✓ Complete |
| **7. Estilos** | 2 | 0 (0%) | 2 (100%) | ✓ Complete |
| **8. Gastos** | Dynamic | 0 (0%) | All (100%) | ✓ Complete |
| **TOTALS** | **154+** | **37 (24%)** | **154+ (100%)** | **✓ Complete** |

---

## Key Enum Values

### fall_type
```
OFF, COBRO, DIARIA, MENSUAL,
SEMANAL CON ACUMULADO, SEMANAL SIN ACUMULADO
```

### print_mode
```
DRIVER, GENERICO
```

### discount_provider
```
GRUPO, RIFERO
```

### discount_mode
```
OFF, EFECTIVO, TICKET_GRATIS
```

### payment_mode
```
BANCA, ZONA, GRUPO, USAR_PREFERENCIA_GRUPO
```

### anticipated_closing
```
5min, 10min, 15min, 20min, 30min, 1hour
```

### recurrence_type (expenses)
```
DAILY, WEEKLY, MONTHLY, YEARLY
```

---

## Execution Checklist

### 1. Database Migration
```bash
□ Backup production database
□ Test script on development database
□ Verify all tables created successfully
□ Verify all indexes created
□ Verify triggers are working
□ Check foreign key constraints
□ Verify default data inserted for existing branches
□ Run integration tests
```

### 2. API Updates
```bash
□ Update DTOs/Models to include new fields
□ Create new endpoints for child tables
□ Update existing endpoints (POST/PUT/GET)
□ Update API documentation
□ Add validation for new fields
□ Test API with Postman/Swagger
```

### 3. Frontend Updates
```bash
□ Update form submission to include all fields
□ Update field mapping in CreateBanca component
□ Update EditBanca component
□ Test all 8 tabs
□ Verify data persistence
□ Test validation
```

### 4. Testing
```bash
□ Unit tests for new endpoints
□ Integration tests for complete flow
□ Manual QA testing
□ Performance testing with large datasets
□ Rollback procedure tested
```

---

## Example API Request (After Migration)

```json
POST /api/branches
{
  "branchName": "Test Branch",
  "branchCode": "LAN-0520",
  "username": "testuser",
  "password": "****",
  "location": "123 Main St",
  "reference": "Test Reference",
  "zoneId": 1,

  // NEW FIELDS (Configuration)
  "deactivationBalance": 1000.00,
  "dailySaleLimit": 5000.00,
  "fallType": "DIARIA",
  "printMode": "DRIVER",

  // NEW TABLES (sent as nested objects)
  "footers": {
    "autoFooter": false,
    "footerText1": "Thank you!",
    "footerText2": "Good luck!",
    "showBranchInfo": true,
    "showDateTime": true
  },

  "schedules": [
    { "dayOfWeek": 1, "startTime": "08:00:00", "endTime": "20:00:00" },
    { "dayOfWeek": 2, "startTime": "08:00:00", "endTime": "20:00:00" }
    // ... 7 days total
  ],

  "selectedLotteries": [1, 2, 3, 4, 5],
  "anticipatedClosing": "15min",

  "prizeConfiguration": {
    "pick3FirstPayment": 500.00,
    "pick3SecondPayment": 70.00,
    "pick4FirstPayment": 5000.00
    // ... 90+ more fields
  },

  "expenses": [
    {
      "expenseName": "Rent",
      "expenseAmount": 500.00,
      "isRecurring": true,
      "recurrenceType": "MONTHLY"
    }
  ]
}
```

---

## Performance Considerations

### Indexes Created
- `IX_branches_zone_id` - Fast zone lookups
- `IX_branches_is_active` - Fast active branch queries
- `IX_branches_branch_code` - Fast code lookups
- `IX_branch_footers_branch_id` - 1:1 relationship
- `IX_branch_schedules_branch_day` - Fast schedule lookups
- `IX_branch_lotteries_branch_id` - Fast lottery lookups
- `IX_branch_lotteries_lottery_id` - Reverse lookups
- `IX_branch_lotteries_is_active` - Active lottery filter
- `IX_branch_prize_configurations_branch_id` - 1:1 relationship
- `IX_branch_expenses_branch_id` - Fast expense lookups
- `IX_branch_expenses_is_active` - Active expense filter

### Cascading Deletes
All child tables have `ON DELETE CASCADE`:
- Deleting a branch automatically deletes related records
- No orphaned data
- Maintains referential integrity

---

## Data Migration Safety

### All New Columns
- Are `NULL` or have `DEFAULT` values
- Won't break existing data
- Backward compatible

### Default Data
- Schedules: 7 rows per branch (Mon-Sun, 00:00-23:59)
- Footers: 1 row per branch (auto_footer=false)
- Prize Config: 1 row per branch (all nulls)

### Rollback Plan
```sql
-- If needed, rollback in reverse order:
DROP TABLE branch_expenses;
DROP TABLE branch_prize_configurations;
DROP TABLE branch_lotteries;
DROP TABLE branch_schedules;
DROP TABLE branch_footers;

-- Then remove columns from branches (if needed)
ALTER TABLE branches DROP COLUMN sell_screen_style;
-- ... etc
```

---

## File Locations

```
/mnt/h/GIT/LottoWebApp/docs/
├── SQL_MIGRATION_BRANCHES_EXPANSION.sql      (18 KB)
├── FIELD_MAPPING_FRONTEND_TO_DATABASE.md     (17 KB)
└── QUICK_REFERENCE_DATABASE_EXPANSION.md     (This file)
```

---

## Support & Documentation

- **SQL Script:** Complete executable migration
- **Field Mapping:** Frontend ↔ Database mappings
- **API Analysis:** Already documented separately
- **Quick Reference:** This document

---

**Ready to execute? Start with Step 1 in the Execution Checklist above.**

---

**Author:** Claude Code
**Date:** 2025-10-19
**Version:** 1.0
