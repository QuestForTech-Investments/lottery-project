-- =============================================
-- Script: verify-betting-pools.sql
-- Purpose: Verify betting pools and their zones
-- Date: 2025-10-28
-- =============================================

USE [lottery-db];
GO

-- Check betting pools with zones
SELECT
    bp.betting_pool_id,
    bp.betting_pool_code,
    bp.betting_pool_name,
    bp.zone_id,
    z.zone_name,
    bp.location,
    bp.reference,
    bp.is_active,
    bp.created_at
FROM betting_pools bp
LEFT JOIN zones z ON bp.zone_id = z.zone_id
ORDER BY bp.created_at DESC;
GO

-- Check if there are betting pools without zones
SELECT
    COUNT(*) as TotalBettingPools,
    SUM(CASE WHEN zone_id IS NULL THEN 1 ELSE 0 END) as WithoutZone,
    SUM(CASE WHEN zone_id IS NOT NULL THEN 1 ELSE 0 END) as WithZone
FROM betting_pools;
GO
