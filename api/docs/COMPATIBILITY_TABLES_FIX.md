# Compatibility Tables Fix

## Problem

Frontend was getting 500 Internal Server Error when calling:
```
GET /api/betting-pools/9/sortitions
```

Error message:
```
Invalid object name 'lottery_game_compatibility'.
```

## Root Cause

The tables `lottery_game_compatibility` and `lottery_bet_type_compatibility` did not exist in the Azure SQL database. These tables are required by:

- `BettingPoolSortitionsController.cs` (lines 75, 239, 326, 467, 717)
- Entity Framework DbContext mapping (LotteryDbContext.cs:22-23)

The tables were defined in the database schema but were never created during the November 13, 2025 migration.

## Solution

Created both missing tables:

### 1. lottery_game_compatibility
```sql
CREATE TABLE [lottery_game_compatibility] (
    [compatibility_id] int IDENTITY(1,1) NOT NULL,
    [lottery_id] int NOT NULL,
    [game_type_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_by] int NULL,
    CONSTRAINT [PK_lottery_game_compatibility] PRIMARY KEY CLUSTERED ([compatibility_id])
);
```

### 2. lottery_bet_type_compatibility
```sql
CREATE TABLE [lottery_bet_type_compatibility] (
    [compatibility_id] int IDENTITY(1,1) NOT NULL,
    [lottery_id] int NOT NULL,
    [bet_type_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_by] int NULL,
    CONSTRAINT [PK_lottery_bet_type_compat] PRIMARY KEY CLUSTERED ([compatibility_id])
);
```

Both tables include:
- Foreign keys to lotteries, game_types, and bet_types tables
- Unique indexes to prevent duplicate lottery-type combinations
- Standard audit fields (created_at, created_by, updated_at, updated_by)

## Verification

After creating the tables and restarting the API:

```bash
curl http://localhost:5000/api/betting-pools/9/sortitions
HTTP Status: 200 OK ✓
```

Returns proper JSON array of 10 sortitions without errors.

## Files Changed

- **create-compatibility-tables.sql** - SQL script to create both tables
- **COMPATIBILITY_TABLES_FIX.md** - This documentation

## Date

2025-11-14

## Related Tables

Existing compatibility tables in database:
- `draw_bet_type_compatibility` ✓
- `draw_game_compatibility` ✓
- `lottery_game_compatibility` ✓ (newly created)
- `lottery_bet_type_compatibility` ✓ (newly created)

## Next Steps

To populate the compatibility tables with actual data:
1. Identify which game types are compatible with which lotteries
2. Identify which bet types are compatible with which lotteries
3. Insert records into both tables

Example:
```sql
-- Dominican lotteries support 2-digit, 3-digit, and 4-digit games
INSERT INTO lottery_game_compatibility (lottery_id, game_type_id, is_active)
VALUES
  (1, 1, 1), -- Lotería Nacional + Pick 2
  (1, 2, 1), -- Lotería Nacional + Pick 3
  (1, 3, 1); -- Lotería Nacional + Pick 4
```
