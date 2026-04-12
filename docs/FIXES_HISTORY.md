# Historial de Fixes

## 2026-04-12

### Feature: Per-Number Limits (Límites por Número)
Adds the ability to set bet limits for specific number combinations (e.g., Directo "10" max 5, Palé "10-10" max 2) within the existing limit hierarchy. Per-number limits are always tighter than the parent general limit and cannot exceed it.

**Limit types added to UI (already existed in backend enum):**
- `ByNumberForGroup` (2) — Limite Global por Número
- `ByNumberForZone` (7) — Limite Zona por Número
- `ByNumberForBettingPool` (4) — Limite Banca por Número

**Backend changes:**
- `LimitsController.cs` — Added ByNumber types to `ResolveTargetEntities`, upsert lookup (matches `BetNumberPattern`), entity assignment, parent validation (`GetParentAmountsByGameTypeId`), parent type names, prerequisite checks, `BetNumberPattern` required validation. Supports `BetNumberPatterns` (list) for creating multiple number rules in one request. Auto-cleans rules with no amounts (game type not supported by draw).
- `TicketsController.cs` — `CheckIfPlayIsOnLimits` and `UpdateLimitConsumption` now query ByNumber rules (Banca/Zona/Global) by matching `BetNumberPattern == betNumber`. Per-number rules are checked alongside general rules — both must pass.
- `LimitReservationsController.cs` — `Reserve` endpoint now checks for ByNumber limits matching the exact `BetNumber`, uses the most restrictive rule (per-number > general).
- `LotteryHub.cs` — `CheckPlayLimit` SignalR method now queries ByNumber rules and includes them in `rulesToCheck`. Returns the minimum available across general + per-number limits.
- `CreateLimitDto.cs` — Added `BetNumberPatterns: List<string>` field for multi-number creation.

**Frontend changes:**
- `CreateLimit/index.tsx` — Added 3 ByNumber types to the type dropdown (with divider). When a ByNumber type is selected: shows game type chip selector (single-select), number input with auto-dash formatting based on game type (e.g., `##-##` for Palé), multiple numbers as tagged chips showing game type (e.g., "10 (Directo)"), "Agregar dobles" button for Directo/Cash3 types. On submit, groups numbers by game type and sends separate requests with matching amounts.
- `LimitsList/index.tsx` — Added ByNumber types to type order, filter dropdown, and entity grouping logic. Added "Numero" column to the amounts table showing `betNumberPattern`.
- `types/limits.ts` — Added `CreateByNumberLimitTypeLabels` constant and `betNumberPatterns` to `CreateLimitRequest`.

**Number format per game type:**
| Game Type | Format | Example |
|-----------|--------|---------|
| Directo | ## | 25 |
| Palé | ##-## | 01-02 |
| Tripleta | ##-##-## | 01-02-03 |
| Cash3 | ### | 123 |
| Play4 | #### | 1234 |
| Pick5 | ##### | 12345 |

**Enforcement flow:**
1. User types a number on ticket creation → SignalR `CheckPlayLimit` checks general + per-number limits → returns lowest available
2. Ticket saved → `CheckIfPlayIsOnLimits` verifies both general and per-number rules → blocks if either exceeded
3. `UpdateLimitConsumption` records consumption for all applicable rules (general + per-number)

## 2026-04-07

### Fix: Daily sales balance not accounting for transactions (PAGOs/COBROs)
- **Problem:** The `/reports/sales/by-betting-pool` endpoint calculated balance as `snapshot + netSales` but ignored approved transactions (payments, collections). This caused balances on `/sales/day` to show incorrect negative values even after PAGOs were made.
- **Root cause:** `SalesReportsController.GetSalesByBettingPool()` was missing the transaction adjustment logic that `BalancesController` already had.
- **Fix:** Added transaction adjustment queries (entity1/entity2 from `TransactionGroupLines`) to the daily sales balance calculation, matching the same pattern used in `BalancesController.GetBettingPoolBalances()`.
- **Files:** `api/src/LotteryApi/Controllers/SalesReportsController.cs`

### Fix: Betting pools list balance using raw CurrentBalance instead of snapshot-based balance
- **Problem:** The betting pools list page (`/betting-pools/list`) showed balance from `balances.CurrentBalance` (raw running total) instead of the snapshot-based balance used by the balances page (`/balances/betting-pools`), causing inconsistent values.
- **Fix:** Added a parallel fetch to `/balances/betting-pools` in `useBettingPoolsList` hook and used those values (with fallback to raw balance).
- **Files:** `frontend-v4/src/components/features/betting-pools/BettingPoolsList/hooks/useBettingPoolsList.ts`

### Fix: Commission save failing for Dominican lotteries (PALÉ/PALE accent mismatch)
- **Problem:** Saving commissions for Dominican lotteries (LA SUERTE, NACIONAL, etc.) failed silently or with duplicate key errors. The DB had both `PALÉ` and `PALE` records for the same lottery+pool, and similarly `SINGULACIÓN`/`SINGULACION`. The frontend mapped accented names to non-accented on save, causing mismatches.
- **Root cause:** The batch save endpoint used exact string matching (`r.GameType == item.GameType`) which didn't match `PALÉ` with `PALE`. Attempting to create a new `PALE` record violated the unique index `UQ_pool_lottery_game`.
- **Fix:** Added `NormalizeGameType()` function that strips diacritics and normalizes spacing/casing. Before processing batch items, the endpoint now deduplicates existing records (merges accented variants, keeps the one with most data, deletes duplicates). All new/updated records use the normalized gameType.
- **Files:** `api/src/LotteryApi/Controllers/BettingPoolPrizesCommissionsController.cs`

### Enhancement: Add search filter to lottery draw selector in Premios & Comisiones
- **Problem:** With 60+ lottery draws, finding a specific lottery in the chip selector required scrolling through all chips.
- **Fix:** Added an inline search input to the `DrawTabSelector` component. Filters chips as you type (case-insensitive), always keeps "General" visible, shows a match count badge when filtering.
- **Files:** `frontend-v4/src/components/features/betting-pools/CreateBettingPool/tabs/PrizesTab/components/DrawTabSelector.tsx`

## 2025-12-19
- Added release summary and minimal behavior checklist for migrated features.
- Documented next incremental cycle preparation steps.
- Recorded lint/build status for frontend-v4.
