# Historial de Fixes

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
