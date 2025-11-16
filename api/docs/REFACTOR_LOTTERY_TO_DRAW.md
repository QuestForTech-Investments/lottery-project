# Refactor: lottery_id → draw_id Architecture

## Problem

Current architecture incorrectly uses `lottery_id` in many tables. According to the correct design:
- **lottery** = metadata only (logo, country, organization name)
- **draw** = actual sorteo where bets happen (Quiniela Pale Día, Loteka Noche, etc.)

## Principle

**lottery_id should ONLY exist in the `draws` table (1:N relationship)**

All other business logic tables must use `draw_id`, not `lottery_id`.

## Tables to Migrate

### 1. Tables with REDUNDANT lottery_id (already have draw_id)

These tables have both lottery_id and draw_id. The lottery_id is redundant since it can be obtained via `draws.lottery_id`.

#### hot_numbers
- ❌ Has: lottery_id, draw_id
- ✅ Should: draw_id only
- Action: DROP lottery_id column
- Rationale: Can get lottery via `JOIN draws ON hot_numbers.draw_id = draws.draw_id`

#### limit_consumption
- ❌ Has: lottery_id, draw_id
- ✅ Should: draw_id only
- Action: DROP lottery_id column
- Rationale: Can get lottery via JOIN with draws

#### limit_rules
- ❌ Has: lottery_id, draw_id
- ✅ Should: draw_id only
- Action: DROP lottery_id column
- Rationale: Can get lottery via JOIN with draws

### 2. Tables with INCORRECT lottery_id (should be draw_id)

#### betting_pool_prizes_commissions
- ❌ Has: lottery_id
- ✅ Should: draw_id
- Action: RENAME lottery_id → draw_id, migrate data
- Impact: Prize commissions are per draw, not per lottery
- Example: "Quiniela Pale Día" might have different commissions than "Quiniela Pale Noche"

### 3. Tables to DELETE (replaced by draw_* versions)

#### lottery_game_compatibility
- ❌ Incorrect table
- ✅ Use: draw_game_compatibility instead
- Action: DROP table
- Rationale: Game types are per draw, not per lottery

#### lottery_bet_type_compatibility
- ❌ Incorrect table
- ✅ Use: draw_bet_type_compatibility instead
- Action: DROP table
- Rationale: Bet types are per draw, not per lottery

## Migration Steps

### Step 1: Drop redundant lottery_id columns
```sql
-- These columns are redundant (can get from draws.lottery_id)
ALTER TABLE hot_numbers DROP COLUMN lottery_id;
ALTER TABLE limit_consumption DROP COLUMN lottery_id;
ALTER TABLE limit_rules DROP COLUMN lottery_id;
```

### Step 2: Migrate betting_pool_prizes_commissions
```sql
-- Add draw_id column
ALTER TABLE betting_pool_prizes_commissions
ADD draw_id INT NULL;

-- Migrate data (map lottery_id to first active draw of that lottery)
UPDATE bppc
SET bppc.draw_id = (
    SELECT TOP 1 d.draw_id
    FROM draws d
    WHERE d.lottery_id = bppc.lottery_id
      AND d.is_active = 1
    ORDER BY d.draw_id
)
FROM betting_pool_prizes_commissions bppc;

-- Drop old lottery_id column
ALTER TABLE betting_pool_prizes_commissions DROP COLUMN lottery_id;

-- Make draw_id NOT NULL
ALTER TABLE betting_pool_prizes_commissions
ALTER COLUMN draw_id INT NOT NULL;

-- Add FK constraint
ALTER TABLE betting_pool_prizes_commissions
ADD CONSTRAINT FK_betting_pool_prizes_commissions_draw
FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
```

### Step 3: Drop incorrect compatibility tables
```sql
-- These were created by mistake, we use draw_* versions
DROP TABLE IF EXISTS lottery_game_compatibility;
DROP TABLE IF EXISTS lottery_bet_type_compatibility;
```

## API Changes Required

### Models to Update

1. **BettingPoolPrizesCommission.cs**
   - Change: `LotteryId` → `DrawId`
   - Change: `Lottery` navigation → `Draw` navigation

2. **BettingPoolSortition.cs**
   - SpecificConfig JSON should contain `drawId` not `lotteryId`

### Controllers to Update

1. **BettingPoolSortitionsController.cs**
   - Use `DrawGameCompatibilities` instead of `LotteryGameCompatibilities`
   - Parse `drawId` from SpecificConfig instead of `lotteryId`
   - Return draw information with lottery metadata embedded

2. **BettingPoolPrizesCommissionsController.cs** (if exists)
   - Query by draw_id instead of lottery_id

## Frontend Impact

Frontend currently expects:
```json
{
  "lotteryId": 1,
  "lotteryName": "Lotería Nacional",
  "availableGameTypes": []
}
```

Should change to:
```json
{
  "drawId": 5,
  "drawName": "Quiniela Pale Día",
  "lottery": {
    "lotteryId": 1,
    "lotteryName": "Lotería Nacional",
    "logoUrl": "/logos/loteria-nacional.png"
  },
  "availableGameTypes": []
}
```

## Verification

After migration, verify:
```sql
-- Only draws table should have lottery_id (besides lotteries itself)
SELECT
    t.TABLE_NAME,
    c.COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS c
JOIN INFORMATION_SCHEMA.TABLES t ON c.TABLE_NAME = t.TABLE_NAME
WHERE c.COLUMN_NAME = 'lottery_id'
  AND t.TABLE_TYPE = 'BASE TABLE'
  AND t.TABLE_NAME NOT IN ('lotteries', 'draws')
  AND t.TABLE_NAME NOT LIKE '%backup%'
ORDER BY t.TABLE_NAME;

-- Should return 0 rows
```

## Benefits

1. ✅ Correct domain model (lottery = organization, draw = actual sorteo)
2. ✅ No data redundancy (lottery_id only in draws table)
3. ✅ Proper granularity (prizes, limits, games per draw, not per lottery)
4. ✅ Frontend can show correct draw names ("Quiniela Pale Día") not just lottery names
5. ✅ Easier to handle draws with different rules under same lottery

## Date

2025-11-14
