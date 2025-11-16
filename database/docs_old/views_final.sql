-- CREATE VIEWS
-- ============================================

-- View: vw_daily_sales_by_betting_pool
-- Vista: Resumen de ventas del día por banca
CREATE   VIEW vw_daily_sales_by_betting_pool AS
SELECT 
    bp.betting_pool_id,
    bp.betting_pool_code,
    bp.betting_pool_name,
    z.zone_name,
    COUNT(DISTINCT t.ticket_id) as total_tickets,
    SUM(t.total_lines) as total_lines,
    SUM(t.grand_total) as total_sales,
    SUM(t.total_commission) as total_commission,
    SUM(t.total_prize) as total_prizes,
    SUM(t.grand_total) - SUM(t.total_prize) as net_revenue
FROM betting_pools bp
INNER JOIN zones z ON bp.zone_id = z.zone_id
LEFT JOIN tickets t ON bp.betting_pool_id = t.betting_pool_id
    AND CAST(t.created_at AS DATE) = CAST(GETDATE() AS DATE)
    AND t.is_cancelled = 0
WHERE bp.is_active = 1
GROUP BY bp.betting_pool_id, bp.betting_pool_code, bp.betting_pool_name, z.zone_name;
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
    DATEDIFF(DAY, GETDATE(), up.expires_at) as days_until_expiration,
    u_granted.username as granted_by
FROM user_permissions up
INNER JOIN users u ON up.user_id = u.user_id
INNER JOIN permissions p ON up.permission_id = p.permission_id
LEFT JOIN users u_granted ON up.granted_by = u_granted.user_id
WHERE up.expires_at IS NOT NULL
AND up.expires_at > GETDATE()
AND up.expires_at <= DATEADD(DAY, 7, GETDATE()) -- Próximos 7 días
AND up.is_active = 1;
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
    COUNT(DISTINCT tl.ticket_id) as unique_tickets,
    AVG(tl.bet_amount) as avg_bet,
    MAX(tl.bet_amount) as max_bet
FROM ticket_lines tl
INNER JOIN tickets t ON tl.ticket_id = t.ticket_id
INNER JOIN lotteries l ON tl.lottery_id = l.lottery_id
WHERE CAST(tl.created_at AS DATE) = CAST(GETDATE() AS DATE)
AND t.is_cancelled = 0
GROUP BY tl.bet_number, tl.lottery_id, l.lottery_name;
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
    DATEDIFF(DAY, t.created_at, GETDATE()) as days_pending,
    t.customer_name,
    t.customer_phone
FROM tickets t
INNER JOIN betting_pools bp ON t.betting_pool_id = bp.betting_pool_id
WHERE t.status = 'winner'
AND t.is_paid = 0
AND t.is_cancelled = 0;
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
    u.username,
    u.full_name as user_full_name,
    -- Totales
    t.total_lines,
    t.grand_total,
    t.total_prize,
    t.winning_lines,
    -- Estado
    t.status,
    t.is_cancelled,
    t.is_paid,
    -- Cliente
    t.customer_name,
    t.customer_phone,
    -- Metadata
    t.total_lotteries,
    t.earliest_draw_time,
    t.latest_draw_time,
    -- Cancelación
    t.cancelled_at,
    cancelled_user.username as cancelled_by_username,
    t.cancellation_reason,
    -- Pago
    t.paid_at,
    paid_user.username as paid_by_username,
    t.payment_method
FROM tickets t
INNER JOIN betting_pools bp ON t.betting_pool_id = bp.betting_pool_id
INNER JOIN zones z ON bp.zone_id = z.zone_id
INNER JOIN users u ON t.user_id = u.user_id
LEFT JOIN users cancelled_user ON t.cancelled_by = cancelled_user.user_id
LEFT JOIN users paid_user ON t.paid_by = paid_user.user_id;
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
    COUNT(DISTINCT up.permission_id) as direct_permissions_count,
    -- Permisos por rol
    (SELECT COUNT(DISTINCT rp.permission_id) 
     FROM role_permissions rp 
     WHERE rp.role_id = u.role_id AND rp.is_active = 1) as role_permissions_count,
    -- Total de permisos únicos
    COUNT(DISTINCT up.permission_id) + 
    (SELECT COUNT(DISTINCT rp.permission_id) 
     FROM role_permissions rp 
     WHERE rp.role_id = u.role_id AND rp.is_active = 1) as total_permissions,
    -- Lista de permisos directos
    STRING_AGG(p.permission_code, ', ') WITHIN GROUP (ORDER BY p.permission_code) as direct_permissions
FROM users u
LEFT JOIN roles r ON u.role_id = r.role_id
LEFT JOIN user_permissions up ON u.user_id = up.user_id AND up.is_active = 1
    AND (up.expires_at IS NULL OR up.expires_at > GETDATE())
LEFT JOIN permissions p ON up.permission_id = p.permission_id
GROUP BY u.user_id, u.username, u.full_name, u.email, u.role_id, r.role_name, r.role_id;
GO

-- View: vw_users_multiple_betting_pools
-- Vista: Usuarios con múltiples bancas
CREATE   VIEW vw_users_multiple_betting_pools AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    COUNT(ubp.betting_pool_id) as betting_pools_count,
    STRING_AGG(bp.betting_pool_name, ', ') WITHIN GROUP (ORDER BY bp.betting_pool_name) as betting_pools
FROM users u
INNER JOIN user_betting_pools ubp ON u.user_id = ubp.user_id
INNER JOIN betting_pools bp ON ubp.betting_pool_id = bp.betting_pool_id
WHERE ubp.is_active = 1
GROUP BY u.user_id, u.username, u.full_name
HAVING COUNT(ubp.betting_pool_id) > 1;
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
FROM users u
INNER JOIN user_zones uz ON u.user_id = uz.user_id
INNER JOIN zones z ON uz.zone_id = z.zone_id
WHERE uz.is_active = 1
GROUP BY u.user_id, u.username, u.full_name
HAVING COUNT(uz.zone_id) > 1;
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
    up.is_active,
    up.created_at as granted_at,
    u_granted.username as granted_by,
    up.grant_reason,
    up.expires_at,
    CASE 
        WHEN up.expires_at IS NOT NULL AND up.expires_at < GETDATE() THEN 'EXPIRADO'
        WHEN up.is_active = 0 THEN 'REVOCADO'
        ELSE 'ACTIVO'
    END as status
FROM user_permissions up
INNER JOIN users u ON up.user_id = u.user_id
INNER JOIN permissions p ON up.permission_id = p.permission_id
LEFT JOIN roles r ON u.role_id = r.role_id
LEFT JOIN users u_granted ON up.granted_by = u_granted.user_id;
GO

