-- ============================================
-- CREATE VIEWS
-- ============================================

-- View: database_firewall_rules
NULL
GO

-- View: vw_betting_pool_complete_config
-- Vista: Configuración completa de una banca
CREATE   VIEW vw_betting_pool_complete_config AS
SELECT 
    bp.betting_pool_id,
    bp.betting_pool_code,
    bp.betting_pool_name,
    z.zone_name,
    b.bank_name,
    bp.address,
    bp.phone,
    bp.locat
GO

-- View: vw_daily_sales_by_betting_pool
-- Vista: Resumen de ventas del día por banca
CREATE   VIEW vw_daily_sales_by_betting_pool AS
SELECT 
    bp.betting_pool_id,
    bp.betting_pool_code,
    bp.betting_pool_name,
    z.zone_name,
    COUNT(DISTINCT t.ticket_id) as total_tickets,
    SUM(t.
GO

-- View: vw_expiring_permissions
-- Vista: Permisos que están por expirar
CREATE   VIEW vw_expiring_permissions AS
SELECT 
    u.username,
    u.full_name,
    p.permission_code,
    p.permission_name,
    up.expires_at,
    DATEDIFF(DAY, GETDATE(), up.expires_at) as days_until_expiratio
GO

-- View: vw_hot_numbers_today
-- Vista: Ventas por número (Hot Numbers)
CREATE   VIEW vw_hot_numbers_today AS
SELECT 
    tl.bet_number,
    tl.lottery_id,
    l.lottery_name,
    COUNT(*) as times_played,
    SUM(tl.bet_amount) as total_bet,
    SUM(tl.net_amount) as total_net,
    C
GO

-- View: vw_pending_winners
-- Vista: Tickets ganadores pendientes de pago
CREATE   VIEW vw_pending_winners AS
SELECT 
    t.ticket_id,
    t.ticket_code,
    t.created_at,
    bp.betting_pool_code,
    bp.betting_pool_name,
    t.total_prize,
    t.winning_lines,
    DATEDIFF(DAY,
GO

-- View: vw_tickets_complete
-- Vista: Tickets con información completa
CREATE   VIEW vw_tickets_complete AS
SELECT 
    t.ticket_id,
    t.ticket_code,
    t.barcode,
    t.created_at,
    -- Banca y usuario
    bp.betting_pool_code,
    bp.betting_pool_name,
    z.zone_name,
    u.
GO

-- View: vw_user_permissions_summary
-- Vista: Resumen de permisos por usuario
CREATE   VIEW vw_user_permissions_summary AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    u.email,
    r.role_name,
    -- Permisos directos
    COUNT(DISTINCT up.permission_id) as direct_permission
GO

-- View: vw_users_multiple_betting_pools
-- Vista: Usuarios con múltiples bancas
CREATE   VIEW vw_users_multiple_betting_pools AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    COUNT(ubp.betting_pool_id) as betting_pools_count,
    STRING_AGG(bp.betting_pool_name, ', ') WITHIN GROUP
GO

-- View: vw_users_multiple_zones
-- Vista: Usuarios con múltiples zonas
CREATE   VIEW vw_users_multiple_zones AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    COUNT(uz.zone_id) as zones_count,
    STRING_AGG(z.zone_name, ', ') WITHIN GROUP (ORDER BY z.zone_name) as zones
FR
GO

-- View: vw_users_with_direct_permissions
-- Vista: Usuarios con sus permisos directos
CREATE   VIEW vw_users_with_direct_permissions AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    r.role_name,
    p.permission_id,
    p.permission_code,
    p.permission_name,
    p.category,
GO

