-- Check existing betting pools
SELECT TOP 5
  betting_pool_id,
  betting_pool_name,
  betting_pool_code,
  is_active
FROM betting_pools
ORDER BY betting_pool_id;
