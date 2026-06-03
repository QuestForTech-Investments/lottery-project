-- ============================================================================
-- Migration: Add immutable code columns to lotteries and draws.
--
-- Why: cross-tenant result sync (Fase 3 of multi-tenant rollout) needs a
-- stable identifier shared across tenants. `lottery_id` / `draw_id` are local
-- (each tenant has its own sequence). `lottery_name` / `draw_name` can be
-- edited by an admin and aren't safe to use as a sync key. We introduce
-- `lottery_code` and `draw_code` — uppercase slugs derived from the name at
-- migration time, then locked as the canonical cross-system identifier.
--
-- Operators must keep these codes identical between tenants for partners to
-- match each other's draws. Adding a tenant later means manually aligning
-- codes — there's no auto-discovery.
--
-- Idempotent: re-running this script against a DB where the columns already
-- exist is a no-op.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- LOTTERIES
-- ----------------------------------------------------------------------------
IF COL_LENGTH('dbo.lotteries', 'lottery_code') IS NULL
BEGIN
    ALTER TABLE dbo.lotteries ADD lottery_code NVARCHAR(50) NULL;
END;
GO

-- Backfill from lottery_name where still NULL.
UPDATE dbo.lotteries
SET lottery_code = UPPER(REPLACE(REPLACE(REPLACE(lottery_name, ' ', '_'), '-', '_'), '.', ''))
WHERE lottery_code IS NULL
  AND lottery_name IS NOT NULL;
GO

-- Disambiguate any duplicates the backfill produced by suffixing the lottery_id.
WITH dupes AS (
    SELECT lottery_id, lottery_code,
           ROW_NUMBER() OVER (PARTITION BY lottery_code ORDER BY lottery_id) AS rn
    FROM dbo.lotteries
    WHERE lottery_code IS NOT NULL
)
UPDATE l
SET lottery_code = l.lottery_code + '_' + CAST(l.lottery_id AS NVARCHAR(20))
FROM dbo.lotteries l
INNER JOIN dupes d ON d.lottery_id = l.lottery_id
WHERE d.rn > 1;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_lotteries_lottery_code' AND object_id = OBJECT_ID('dbo.lotteries')
)
BEGIN
    CREATE UNIQUE INDEX UX_lotteries_lottery_code
        ON dbo.lotteries(lottery_code)
        WHERE lottery_code IS NOT NULL;
END;
GO

-- ----------------------------------------------------------------------------
-- DRAWS
-- ----------------------------------------------------------------------------
IF COL_LENGTH('dbo.draws', 'draw_code') IS NULL
BEGIN
    ALTER TABLE dbo.draws ADD draw_code NVARCHAR(50) NULL;
END;
GO

UPDATE dbo.draws
SET draw_code = UPPER(REPLACE(REPLACE(REPLACE(draw_name, ' ', '_'), '-', '_'), '.', ''))
WHERE draw_code IS NULL
  AND draw_name IS NOT NULL;
GO

WITH dupes AS (
    SELECT draw_id, draw_code,
           ROW_NUMBER() OVER (PARTITION BY draw_code ORDER BY draw_id) AS rn
    FROM dbo.draws
    WHERE draw_code IS NOT NULL
)
UPDATE d
SET draw_code = d.draw_code + '_' + CAST(d.draw_id AS NVARCHAR(20))
FROM dbo.draws d
INNER JOIN dupes x ON x.draw_id = d.draw_id
WHERE x.rn > 1;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_draws_draw_code' AND object_id = OBJECT_ID('dbo.draws')
)
BEGIN
    CREATE UNIQUE INDEX UX_draws_draw_code
        ON dbo.draws(draw_code)
        WHERE draw_code IS NOT NULL;
END;
GO
