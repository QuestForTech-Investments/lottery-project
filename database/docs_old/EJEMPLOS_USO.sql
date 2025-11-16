-- ============================================================================
-- EJEMPLOS PRÁCTICOS DE USO - SISTEMA DE LOTERÍA
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: CREACIÓN Y COPIA DE CONFIGURACIÓN DE BANCAS
-- ============================================================================

-- Ejemplo 1: Crear una banca nueva copiando configuración completa
-- ============================================================================
BEGIN TRANSACTION;

-- Paso 1: Crear la banca básica
INSERT INTO betting_pools (
    betting_pool_id, branch_code, branch_name, zone_id, 
    username, password_hash, is_active
)
VALUES (
    100, 'LAN-0100', 'LA NUEVA BANCA', 5, 
    'user100', 'hash_password_here', 1
);

-- Paso 2: Copiar toda la configuración de una banca plantilla
EXEC sp_CopyBettingPoolConfig 
    @source_betting_pool_id = 1,
    @target_betting_pool_id = 100,
    @include_configuration = 1,
    @include_footers = 1,
    @include_prizes_commissions = 1,
    @include_schedules = 1,
    @include_draws = 1,
    @include_styles = 1,
    @include_expenses = 0; -- No copiar gastos automáticos

-- Paso 3: Ajustar configuraciones específicas si es necesario
UPDATE betting_pool_config 
SET daily_sale_limit = 50000, 
    credit_limit = 10000
WHERE betting_pool_id = 100;

COMMIT TRANSACTION;

-- ============================================================================
-- Ejemplo 2: Copiar solo una sección específica (Premios y Comisiones)
-- ============================================================================
EXEC sp_CopyBettingPoolSection 
    @source_betting_pool_id = 1,
    @target_betting_pool_id = 100,
    @section = 'PREMIOS';

-- ============================================================================
-- Ejemplo 3: Copiar múltiples secciones individualmente
-- ============================================================================
-- Copiar configuración general
EXEC sp_CopyBettingPoolSection @source = 1, @target = 100, @section = 'CONFIGURACION';

-- Copiar horarios
EXEC sp_CopyBettingPoolSection @source = 1, @target = 100, @section = 'HORARIOS';

-- Copiar sorteos activos
EXEC sp_CopyBettingPoolSection @source = 1, @target = 100, @section = 'SORTEOS';

-- ============================================================================
-- SECCIÓN 2: GESTIÓN DE PERMISOS
-- ============================================================================

-- Ejemplo 4: Otorgar permiso directo a un usuario
-- ============================================================================
EXEC sp_GrantPermissionToUser 
    @user_id = 10,
    @permission_id = 5,
    @grant_reason = 'Necesita cancelar tickets por requerimiento especial',
    @expires_at = '2025-12-31'; -- Permiso temporal

-- ============================================================================
-- Ejemplo 5: Otorgar múltiples permisos a la vez
-- ============================================================================
EXEC sp_GrantMultiplePermissions 
    @user_id = 10,
    @permission_codes = 'tickets.create,tickets.cancel,tickets.view',
    @grant_reason = 'Usuario temporal para evento especial';

-- ============================================================================
-- Ejemplo 6: Ver todos los permisos de un usuario
-- ============================================================================
EXEC sp_GetUserPermissions @user_id = 10, @include_expired = 0;

-- O por nombre de usuario
EXEC sp_GetUserPermissions @username = 'user100', @include_expired = 1;

-- ============================================================================
-- Ejemplo 7: Revocar un permiso
-- ============================================================================
EXEC sp_RevokePermissionFromUser 
    @user_id = 10,
    @permission_id = 5,
    @revoke_reason = 'Ya no necesita esta funcionalidad';

-- ============================================================================
-- Ejemplo 8: Ver qué usuarios tienen un permiso específico
-- ============================================================================
EXEC sp_GetUsersWithPermission @permission_code = 'tickets.cancel';

-- ============================================================================
-- Ejemplo 9: Expirar permisos vencidos (ejecutar periódicamente)
-- ============================================================================
EXEC sp_ExpireOldPermissions;

-- ============================================================================
-- SECCIÓN 3: CONSULTAS ÚTILES CON VISTAS
-- ============================================================================

-- Ejemplo 10: Ver configuración completa de una banca
-- ============================================================================
SELECT 
    betting_pool_id,
    branch_code,
    branch_name,
    zone_name,
    fall_type,
    payment_mode,
    print_mode,
    discount_mode,
    current_balance,
    active_draws_count,
    prizes_config_count
FROM vw_betting_pool_complete_config
WHERE betting_pool_id = 100;

-- ============================================================================
-- Ejemplo 11: Ver todas las bancas activas con sus configuraciones
-- ============================================================================
SELECT 
    branch_code,
    branch_name,
    zone_name,
    fall_type,
    daily_sale_limit,
    credit_limit,
    active_draws_count
FROM vw_betting_pool_complete_config
WHERE is_active = 1
ORDER BY zone_name, branch_name;

-- ============================================================================
-- Ejemplo 12: Ver usuarios con múltiples bancas asignadas
-- ============================================================================
SELECT * FROM vw_users_multiple_betting_pools;

-- ============================================================================
-- Ejemplo 13: Ver permisos que están por expirar (próximos 7 días)
-- ============================================================================
SELECT 
    username,
    permission_code,
    permission_name,
    expires_at,
    days_until_expiration
FROM vw_expiring_permissions
ORDER BY days_until_expiration;

-- ============================================================================
-- Ejemplo 14: Ver resumen de permisos por usuario
-- ============================================================================
SELECT 
    username,
    full_name,
    role_name,
    direct_permissions_count,
    role_permissions_count,
    total_permissions
FROM vw_user_permissions_summary
WHERE username = 'user100';

-- ============================================================================
-- SECCIÓN 4: OPERACIONES COMUNES
-- ============================================================================

-- Ejemplo 15: Actualizar configuración de impresión de múltiples bancas
-- ============================================================================
UPDATE pc
SET pc.print_mode = 'GENERICO',
    pc.print_enabled = 1,
    pc.sms_only = 0,
    pc.updated_by = dbo.fn_GetCurrentUserId()
FROM betting_pool_print_config pc
INNER JOIN betting_pools bp ON pc.betting_pool_id = bp.betting_pool_id
WHERE bp.zone_id = 5; -- Todas las bancas de la zona 5

-- ============================================================================
-- Ejemplo 16: Activar sorteos específicos para una banca
-- ============================================================================
-- Primero, desactivar todos
UPDATE betting_pool_draws
SET is_active = 0
WHERE betting_pool_id = 100;

-- Luego, activar solo los sorteos deseados
UPDATE betting_pool_draws
SET is_active = 1
WHERE betting_pool_id = 100
AND draw_id IN (1, 5, 10, 15); -- IDs de sorteos específicos

-- ============================================================================
-- Ejemplo 17: Cambiar límite diario de todas las bancas de una zona
-- ============================================================================
UPDATE cfg
SET cfg.daily_sale_limit = 100000,
    cfg.updated_by = dbo.fn_GetCurrentUserId()
FROM betting_pool_config cfg
INNER JOIN betting_pools bp ON cfg.betting_pool_id = bp.betting_pool_id
WHERE bp.zone_id = 5;

-- ============================================================================
-- Ejemplo 18: Ver bancas sin configuración completa
-- ============================================================================
SELECT 
    bp.betting_pool_id,
    bp.branch_code,
    bp.branch_name,
    CASE WHEN cfg.config_id IS NULL THEN 'Falta' ELSE 'OK' END as config_status,
    CASE WHEN pc.print_config_id IS NULL THEN 'Falta' ELSE 'OK' END as print_config_status,
    CASE WHEN st.style_id IS NULL THEN 'Falta' ELSE 'OK' END as style_status,
    CASE WHEN ft.footer_id IS NULL THEN 'Falta' ELSE 'OK' END as footer_status
FROM betting_pools bp
LEFT JOIN betting_pool_config cfg ON bp.betting_pool_id = cfg.betting_pool_id
LEFT JOIN betting_pool_print_config pc ON bp.betting_pool_id = pc.betting_pool_id
LEFT JOIN betting_pool_styles st ON bp.betting_pool_id = st.betting_pool_id
LEFT JOIN betting_pool_footers ft ON bp.betting_pool_id = ft.betting_pool_id
WHERE bp.is_active = 1
AND (cfg.config_id IS NULL OR pc.print_config_id IS NULL 
     OR st.style_id IS NULL OR ft.footer_id IS NULL);

-- ============================================================================
-- Ejemplo 19: Reporte de configuración de premios por zona
-- ============================================================================
SELECT 
    z.zone_name,
    bp.branch_name,
    l.lottery_name,
    bpc.game_type,
    bpc.prize_payment_1,
    bpc.commission_discount_1
FROM betting_pool_prizes_commissions bpc
INNER JOIN betting_pools bp ON bpc.betting_pool_id = bp.betting_pool_id
INNER JOIN zones z ON bp.zone_id = z.zone_id
INNER JOIN lotteries l ON bpc.lottery_id = l.lottery_id
WHERE z.zone_id = 5
AND bpc.is_active = 1
ORDER BY bp.branch_name, l.lottery_name, bpc.game_type;

-- ============================================================================
-- Ejemplo 20: Buscar bancas con configuraciones similares
-- ============================================================================
-- Bancas con el mismo modo de pago
SELECT 
    bp1.branch_code as banca1,
    bp2.branch_code as banca2,
    cfg1.payment_mode
FROM betting_pool_config cfg1
INNER JOIN betting_pools bp1 ON cfg1.betting_pool_id = bp1.betting_pool_id
INNER JOIN betting_pool_config cfg2 ON cfg1.payment_mode = cfg2.payment_mode
INNER JOIN betting_pools bp2 ON cfg2.betting_pool_id = bp2.betting_pool_id
WHERE bp1.betting_pool_id < bp2.betting_pool_id
AND bp1.is_active = 1 AND bp2.is_active = 1;

-- ============================================================================
-- SECCIÓN 5: MANTENIMIENTO Y AUDITORÍA
-- ============================================================================

-- Ejemplo 21: Ver histórico de cambios en configuración de una banca
-- ============================================================================
-- (Asumiendo que tienes una tabla de auditoría)
SELECT 
    'betting_pool_config' as tabla,
    updated_at,
    updated_by,
    'Cambio en configuración' as accion
FROM betting_pool_config
WHERE betting_pool_id = 100
AND updated_at IS NOT NULL
UNION ALL
SELECT 
    'betting_pool_print_config' as tabla,
    updated_at,
    updated_by,
    'Cambio en impresión' as accion
FROM betting_pool_print_config
WHERE betting_pool_id = 100
AND updated_at IS NOT NULL
ORDER BY updated_at DESC;

-- ============================================================================
-- Ejemplo 22: Verificar integridad de relaciones
-- ============================================================================
-- Bancas sin configuración básica
SELECT bp.betting_pool_id, bp.branch_code
FROM betting_pools bp
LEFT JOIN betting_pool_config cfg ON bp.betting_pool_id = cfg.betting_pool_id
WHERE bp.is_active = 1 AND cfg.config_id IS NULL;

-- Bancas sin sorteos activos
SELECT bp.betting_pool_id, bp.branch_code
FROM betting_pools bp
LEFT JOIN betting_pool_draws bpd ON bp.betting_pool_id = bpd.betting_pool_id AND bpd.is_active = 1
WHERE bp.is_active = 1
GROUP BY bp.betting_pool_id, bp.branch_code
HAVING COUNT(bpd.betting_pool_draw_id) = 0;

-- ============================================================================
-- Ejemplo 23: Backup de configuración de una banca antes de cambios
-- ============================================================================
-- Crear tabla temporal con la configuración actual
SELECT * INTO #backup_config_100
FROM betting_pool_config
WHERE betting_pool_id = 100;

SELECT * INTO #backup_print_config_100
FROM betting_pool_print_config
WHERE betting_pool_id = 100;

-- Hacer cambios...
UPDATE betting_pool_config SET daily_sale_limit = 75000 WHERE betting_pool_id = 100;

-- Si algo sale mal, restaurar
-- UPDATE betting_pool_config 
-- SET daily_sale_limit = (SELECT daily_sale_limit FROM #backup_config_100)
-- WHERE betting_pool_id = 100;

-- ============================================================================
-- FIN DE EJEMPLOS
-- ============================================================================
