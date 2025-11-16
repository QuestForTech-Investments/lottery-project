-- CREATE STORED PROCEDURES
-- ============================================

-- Stored Procedure: sp_CheckTicketWinners
-- ============================================================================
-- SP: Verificar números ganadores en un ticket
-- IMPROVED: 2025-10-22 - Added comprehensive validation and error handling
-- ============================================================================
CREATE   PROCEDURE sp_CheckTicketWinners
    @ticket_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- ADDED: 2025-10-22 - Validate ticket exists
        IF NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_id = @ticket_id)
        BEGIN
            RAISERROR('Ticket ID %I64d does not exist', 16, 1, @ticket_id);
            RETURN -1;
        END

        -- ADDED: 2025-10-22 - Validate ticket is not cancelled
        IF EXISTS (SELECT 1 FROM tickets WHERE ticket_id = @ticket_id AND is_cancelled = 1)
        BEGIN
            RAISERROR('Ticket ID %I64d is cancelled and cannot be checked', 16, 1, @ticket_id);
            RETURN -1;
        END

        -- ADDED: 2025-10-22 - Validate results exist for this ticket's draws
        IF NOT EXISTS (
            SELECT 1
            FROM ticket_lines tl
            INNER JOIN results r ON tl.draw_id = r.draw_id
            WHERE tl.ticket_id = @ticket_id
        )
        BEGIN
            RAISERROR('No results found for ticket ID %I64d draws yet', 16, 1, @ticket_id);
            RETURN -1;
        END

        BEGIN TRANSACTION;

        -- Actualizar líneas ganadoras basado en resultados
        UPDATE tl
        SET
            tl.is_winner = 1,
            tl.result_number = r.winning_number,
            tl.winning_position = r.position,
            tl.result_checked_at = GETDATE(),
            tl.line_status = 'winner',
            tl.prize_amount = tl.bet_amount * ISNULL(tl.prize_multiplier, 0),
            tl.updated_at = GETDATE()
        FROM ticket_lines tl
        INNER JOIN results r ON
            tl.draw_id = r.draw_id
            AND tl.bet_number = r.winning_number
            AND (tl.position IS NULL OR tl.position = r.position)
        WHERE tl.ticket_id = @ticket_id
        AND tl.line_status = 'pending';

        -- Marcar perdedoras
        UPDATE ticket_lines
        SET
            line_status = 'loser',
            result_checked_at = GETDATE(),
            updated_at = GETDATE()
        WHERE ticket_id = @ticket_id
        AND line_status = 'pending';

        -- Recalcular totales
        EXEC sp_CalculateTicketTotals @ticket_id;

        -- Actualizar estado del ticket
        UPDATE tickets
        SET
            status = CASE
                WHEN winning_lines > 0 THEN 'winner'
                ELSE 'loser'
            END,
            updated_at = GETDATE()
        WHERE ticket_id = @ticket_id;

        COMMIT TRANSACTION;

        DECLARE @winners INT;
        SELECT @winners = winning_lines FROM tickets WHERE ticket_id = @ticket_id;

        PRINT '✅ Ticket verificado: ' + CAST(@winners AS VARCHAR) + ' líneas ganadoras';
        RETURN 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- ADDED: 2025-10-22 - Log error to error_logs table
        INSERT INTO error_logs (error_source, error_procedure, error_number, error_severity, error_state,
                                error_message, error_line, ticket_id, user_id)
        VALUES ('SP', 'sp_CheckTicketWinners', ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(),
                ERROR_MESSAGE(), ERROR_LINE(), @ticket_id, dbo.fn_GetCurrentUserId());

        PRINT '❌ Error verificando ganadores: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO

-- Stored Procedure: sp_CopyBettingPoolConfig
-- SP: Copiar toda la configuración de una banca a otra
-- IMPROVED: 2025-10-22 - Added validation to prevent source = target and comprehensive error handling
CREATE   PROCEDURE sp_CopyBettingPoolConfig
    @source_betting_pool_id INT,
    @target_betting_pool_id INT,
    @include_general BIT = 0, -- No copiar datos básicos por defecto
    @include_configuration BIT = 1,
    @include_footers BIT = 1,
    @include_prizes_commissions BIT = 1,
    @include_schedules BIT = 1,
    @include_draws BIT = 1,
    @include_styles BIT = 1,
    @include_expenses BIT = 0 -- No copiar gastos automáticos por defecto
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- ADDED: 2025-10-22 - Validate source != target
        IF @source_betting_pool_id = @target_betting_pool_id
        BEGIN
            RAISERROR('Source and target betting pool cannot be the same (ID: %d)', 16, 1, @source_betting_pool_id);
            RETURN -1;
        END

        -- Verificar que ambas bancas existan
        IF NOT EXISTS (SELECT 1 FROM betting_pools WHERE betting_pool_id = @source_betting_pool_id)
        BEGIN
            RAISERROR('Source betting pool ID %d does not exist', 16, 1, @source_betting_pool_id);
            RETURN -1;
        END

        IF NOT EXISTS (SELECT 1 FROM betting_pools WHERE betting_pool_id = @target_betting_pool_id)
        BEGIN
            RAISERROR('Target betting pool ID %d does not exist', 16, 1, @target_betting_pool_id);
            RETURN -1;
        END

        BEGIN TRANSACTION;

        DECLARE @current_user INT = dbo.fn_GetCurrentUserId();
        
        PRINT '📋 Copiando configuraciones...';
        
        -- 1. CONFIGURACIÓN GENERAL
        IF @include_configuration = 1
        BEGIN
            -- Eliminar configuración existente
            DELETE FROM betting_pool_config WHERE betting_pool_id = @target_betting_pool_id;
            DELETE FROM betting_pool_print_config WHERE betting_pool_id = @target_betting_pool_id;
            DELETE FROM betting_pool_discount_config WHERE betting_pool_id = @target_betting_pool_id;
            
            -- Copiar betting_pool_config
            INSERT INTO betting_pool_config (
                config_id, betting_pool_id, fall_type, deactivation_balance,
                daily_sale_limit, daily_balance_limit, temporary_additional_balance,
                credit_limit, is_active, control_winning_tickets, allow_jackpot,
                enable_recharges, allow_password_change, cancel_minutes,
                daily_cancel_tickets, max_cancel_amount, max_ticket_amount,
                max_daily_recharge, payment_mode, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(config_id), 0) + 1 FROM betting_pool_config),
                @target_betting_pool_id, fall_type, deactivation_balance,
                daily_sale_limit, daily_balance_limit, temporary_additional_balance,
                credit_limit, is_active, control_winning_tickets, allow_jackpot,
                enable_recharges, allow_password_change, cancel_minutes,
                daily_cancel_tickets, max_cancel_amount, max_ticket_amount,
                max_daily_recharge, payment_mode, @current_user
            FROM betting_pool_config
            WHERE betting_pool_id = @source_betting_pool_id;
            
            -- Copiar betting_pool_print_config
            INSERT INTO betting_pool_print_config (
                print_config_id, betting_pool_id, print_mode, print_enabled,
                print_ticket_copy, print_recharge_receipt, sms_only, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(print_config_id), 0) + 1 FROM betting_pool_print_config),
                @target_betting_pool_id, print_mode, print_enabled,
                print_ticket_copy, print_recharge_receipt, sms_only, @current_user
            FROM betting_pool_print_config
            WHERE betting_pool_id = @source_betting_pool_id;
            
            -- Copiar betting_pool_discount_config
            INSERT INTO betting_pool_discount_config (
                discount_config_id, betting_pool_id, discount_provider,
                discount_mode, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(discount_config_id), 0) + 1 FROM betting_pool_discount_config),
                @target_betting_pool_id, discount_provider, discount_mode, @current_user
            FROM betting_pool_discount_config
            WHERE betting_pool_id = @source_betting_pool_id;
            
            PRINT '✅ Configuración general copiada';
        END
        
        -- 2. PIES DE PÁGINA
        IF @include_footers = 1
        BEGIN
            DELETE FROM betting_pool_footers WHERE betting_pool_id = @target_betting_pool_id;
            
            INSERT INTO betting_pool_footers (
                footer_id, betting_pool_id, auto_footer, footer_line_1,
                footer_line_2, footer_line_3, footer_line_4, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(footer_id), 0) + 1 FROM betting_pool_footers),
                @target_betting_pool_id, auto_footer, footer_line_1,
                footer_line_2, footer_line_3, footer_line_4, @current_user
            FROM betting_pool_footers
            WHERE betting_pool_id = @source_betting_pool_id;
            
            PRINT '✅ Pies de página copiados';
        END
        
        -- 3. PREMIOS Y COMISIONES
        IF @include_prizes_commissions = 1
        BEGIN
            DELETE FROM betting_pool_prizes_commissions WHERE betting_pool_id = @target_betting_pool_id;
            
            INSERT INTO betting_pool_prizes_commissions (
                prize_commission_id, betting_pool_id, lottery_id, game_type,
                prize_payment_1, prize_payment_2, prize_payment_3, prize_payment_4,
                commission_discount_1, commission_discount_2, commission_discount_3, commission_discount_4,
                commission_2_discount_1, commission_2_discount_2, commission_2_discount_3, commission_2_discount_4,
                is_active, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(prize_commission_id), 0) FROM betting_pool_prizes_commissions) + ROW_NUMBER() OVER (ORDER BY lottery_id, game_type),
                @target_betting_pool_id, lottery_id, game_type,
                prize_payment_1, prize_payment_2, prize_payment_3, prize_payment_4,
                commission_discount_1, commission_discount_2, commission_discount_3, commission_discount_4,
                commission_2_discount_1, commission_2_discount_2, commission_2_discount_3, commission_2_discount_4,
                is_active, @current_user
            FROM betting_pool_prizes_commissions
            WHERE betting_pool_id = @source_betting_pool_id;
            
            PRINT '✅ Premios y comisiones copiados';
        END
        
        -- 4. HORARIOS DE SORTEOS
        IF @include_schedules = 1
        BEGIN
            DELETE FROM betting_pool_schedules WHERE betting_pool_id = @target_betting_pool_id;
            
            INSERT INTO betting_pool_schedules (
                schedule_id, betting_pool_id, day_of_week, close_time,
                draw_time, is_active, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(schedule_id), 0) FROM betting_pool_schedules) + ROW_NUMBER() OVER (ORDER BY day_of_week),
                @target_betting_pool_id, day_of_week, close_time,
                draw_time, is_active, @current_user
            FROM betting_pool_schedules
            WHERE betting_pool_id = @source_betting_pool_id;
            
            PRINT '✅ Horarios copiados';
        END
        
        -- 5. SORTEOS ACTIVOS
        IF @include_draws = 1
        BEGIN
            DELETE FROM betting_pool_draws WHERE betting_pool_id = @target_betting_pool_id;
            
            INSERT INTO betting_pool_draws (
                betting_pool_draw_id, betting_pool_id, draw_id, is_active, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(betting_pool_draw_id), 0) FROM betting_pool_draws) + ROW_NUMBER() OVER (ORDER BY draw_id),
                @target_betting_pool_id, draw_id, is_active, @current_user
            FROM betting_pool_draws
            WHERE betting_pool_id = @source_betting_pool_id;
            
            PRINT '✅ Sorteos activos copiados';
        END
        
        -- 6. ESTILOS
        IF @include_styles = 1
        BEGIN
            DELETE FROM betting_pool_styles WHERE betting_pool_id = @target_betting_pool_id;
            
            INSERT INTO betting_pool_styles (
                style_id, betting_pool_id, sales_point_style, print_style,
                ticket_colors, custom_logo, font_settings, layout_config, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(style_id), 0) + 1 FROM betting_pool_styles),
                @target_betting_pool_id, sales_point_style, print_style,
                ticket_colors, custom_logo, font_settings, layout_config, @current_user
            FROM betting_pool_styles
            WHERE betting_pool_id = @source_betting_pool_id;
            
            PRINT '✅ Estilos copiados';
        END
        
        -- 7. GASTOS AUTOMÁTICOS (Opcional)
        IF @include_expenses = 1
        BEGIN
            DELETE FROM betting_pool_automatic_expenses WHERE betting_pool_id = @target_betting_pool_id;
            
            INSERT INTO betting_pool_automatic_expenses (
                expense_id, betting_pool_id, expense_type, amount,
                percentage, frequency, is_active, created_by
            )
            SELECT 
                (SELECT ISNULL(MAX(expense_id), 0) FROM betting_pool_automatic_expenses) + ROW_NUMBER() OVER (ORDER BY expense_id),
                @target_betting_pool_id, expense_type, amount,
                percentage, frequency, is_active, @current_user
            FROM betting_pool_automatic_expenses
            WHERE betting_pool_id = @source_betting_pool_id;
            
            PRINT '✅ Gastos automáticos copiados';
        END
        
        COMMIT TRANSACTION;
        
        PRINT '';
        PRINT '🎉 Configuración copiada exitosamente';
        PRINT 'Origen: ' + CAST(@source_betting_pool_id AS VARCHAR);
        PRINT 'Destino: ' + CAST(@target_betting_pool_id AS VARCHAR);
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- ADDED: 2025-10-22 - Log error to error_logs table
        INSERT INTO error_logs (error_source, error_procedure, error_number, error_severity, error_state,
                                error_message, error_line, betting_pool_id, user_id, additional_info)
        VALUES ('SP', 'sp_CopyBettingPoolConfig', ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(),
                ERROR_MESSAGE(), ERROR_LINE(), @target_betting_pool_id, dbo.fn_GetCurrentUserId(),
                'Source: ' + CAST(@source_betting_pool_id AS VARCHAR) + ', Target: ' + CAST(@target_betting_pool_id AS VARCHAR));

        PRINT '❌ Error al copiar configuración: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO

-- Stored Procedure: sp_CopyBettingPoolSection
-- SP: Copiar solo una sección específica
CREATE   PROCEDURE sp_CopyBettingPoolSection
    @source_betting_pool_id INT,
    @target_betting_pool_id INT,
    @section VARCHAR(50) -- 'CONFIGURACION', 'PIES', 'PREMIOS', 'HORARIOS', 'SORTEOS', 'ESTILOS', 'GASTOS'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @include_configuration BIT = 0;
    DECLARE @include_footers BIT = 0;
    DECLARE @include_prizes_commissions BIT = 0;
    DECLARE @include_schedules BIT = 0;
    DECLARE @include_draws BIT = 0;
    DECLARE @include_styles BIT = 0;
    DECLARE @include_expenses BIT = 0;
    
    -- Determinar qué sección copiar
    IF @section = 'CONFIGURACION'
        SET @include_configuration = 1;
    ELSE IF @section = 'PIES'
        SET @include_footers = 1;
    ELSE IF @section = 'PREMIOS'
        SET @include_prizes_commissions = 1;
    ELSE IF @section = 'HORARIOS'
        SET @include_schedules = 1;
    ELSE IF @section = 'SORTEOS'
        SET @include_draws = 1;
    ELSE IF @section = 'ESTILOS'
        SET @include_styles = 1;
    ELSE IF @section = 'GASTOS'
        SET @include_expenses = 1;
    ELSE
    BEGIN
        PRINT 'Sección inválida. Use: CONFIGURACION, PIES, PREMIOS, HORARIOS, SORTEOS, ESTILOS, GASTOS';
        RETURN -1;
    END
    
    -- Llamar al procedimiento principal
    EXEC sp_CopyBettingPoolConfig 
        @source_betting_pool_id = @source_betting_pool_id,
        @target_betting_pool_id = @target_betting_pool_id,
        @include_general = 0,
        @include_configuration = @include_configuration,
        @include_footers = @include_footers,
        @include_prizes_commissions = @include_prizes_commissions,
        @include_schedules = @include_schedules,
        @include_draws = @include_draws,
        @include_styles = @include_styles,
        @include_expenses = @include_expenses;
END;
GO

-- Stored Procedure: sp_ExpireOldPermissions
-- SP: Expirar permisos vencidos (ejecutar periódicamente)
CREATE   PROCEDURE sp_ExpireOldPermissions
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE user_permissions
    SET is_active = 0,
        updated_at = GETDATE(),
        updated_by = -1, -- Sistema
        grant_reason = 'Expirado automáticamente'
    WHERE expires_at IS NOT NULL
    AND expires_at < GETDATE()
    AND is_active = 1;
    
    PRINT CAST(@@ROWCOUNT AS VARCHAR) + ' permisos expirados';
END;
GO

-- Stored Procedure: sp_GetNumberSales
-- ============================================================================
-- SP: Obtener ventas por número (para límites)
-- ============================================================================
CREATE   PROCEDURE sp_GetNumberSales
    @bet_number VARCHAR(20),
    @lottery_id INT,
    @draw_date DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT
        tl.bet_number,
        tl.lottery_id,
        tl.draw_date,
        COUNT(*) as times_played,
        SUM(tl.bet_amount) as total_bet,
        SUM(tl.net_amount) as total_net,
        COUNT(DISTINCT tl.ticket_id) as unique_tickets,
        COUNT(DISTINCT t.betting_pool_id) as unique_betting_pools
    FROM ticket_lines tl
    INNER JOIN tickets t ON tl.ticket_id = t.ticket_id
    WHERE tl.bet_number = @bet_number
    AND tl.lottery_id = @lottery_id
    AND tl.draw_date = @draw_date
    AND t.is_cancelled = 0
    GROUP BY tl.bet_number, tl.lottery_id, tl.draw_date;
END;
GO

-- Stored Procedure: sp_GetUserPermissions
-- SP: Ver todos los permisos de un usuario (directos + por rol)
CREATE   PROCEDURE sp_GetUserPermissions
    @user_id INT = NULL,
    @username NVARCHAR(50) = NULL,
    @include_expired BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @username IS NOT NULL
        SET @user_id = (SELECT user_id FROM users WHERE username = @username);
    
    IF @user_id IS NULL
    BEGIN
        PRINT 'Error: Usuario no encontrado';
        RETURN;
    END
    
    -- Permisos DIRECTOS del usuario
    SELECT 
        'DIRECTO' as source,
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
    INNER JOIN permissions p ON up.permission_id = p.permission_id
    LEFT JOIN users u_granted ON up.granted_by = u_granted.user_id
    WHERE up.user_id = @user_id
    AND (up.is_active = 1 OR @include_expired = 1)
    AND (up.expires_at IS NULL OR up.expires_at > GETDATE() OR @include_expired = 1)
    
    UNION ALL
    
    -- Permisos por ROL
    SELECT 
        'POR ROL: ' + r.role_name as source,
        p.permission_id,
        p.permission_code,
        p.permission_name,
        p.category,
        rp.is_active,
        rp.created_at as granted_at,
        NULL as granted_by,
        NULL as grant_reason,
        NULL as expires_at,
        CASE 
            WHEN rp.is_active = 0 THEN 'REVOCADO'
            ELSE 'ACTIVO'
        END as status
    FROM users u
    INNER JOIN roles r ON u.role_id = r.role_id
    INNER JOIN role_permissions rp ON r.role_id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.user_id = @user_id
    AND rp.is_active = 1
    
    ORDER BY category, permission_name;
END;
GO

-- Stored Procedure: sp_GetUsersWithPermission
-- SP: Obtener usuarios con un permiso específico
CREATE   PROCEDURE sp_GetUsersWithPermission
    @permission_code NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @permission_id INT;
    SET @permission_id = (SELECT permission_id FROM permissions WHERE permission_code = @permission_code);
    
    IF @permission_id IS NULL
    BEGIN
        PRINT 'Error: Permiso no encontrado';
        RETURN;
    END
    
    -- Usuarios con permiso DIRECTO
    SELECT DISTINCT
        'DIRECTO' as permission_source,
        u.user_id,
        u.username,
        u.full_name,
        u.email,
        r.role_name,
        up.created_at as granted_at,
        u_granted.username as granted_by
    FROM user_permissions up
    INNER JOIN users u ON up.user_id = u.user_id
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN users u_granted ON up.granted_by = u_granted.user_id
    WHERE up.permission_id = @permission_id
    AND up.is_active = 1
    AND (up.expires_at IS NULL OR up.expires_at > GETDATE())
    
    UNION
    
    -- Usuarios con permiso POR ROL
    SELECT DISTINCT
        'POR ROL' as permission_source,
        u.user_id,
        u.username,
        u.full_name,
        u.email,
        r.role_name,
        NULL as granted_at,
        NULL as granted_by
    FROM users u
    INNER JOIN roles r ON u.role_id = r.role_id
    INNER JOIN role_permissions rp ON r.role_id = rp.role_id
    WHERE rp.permission_id = @permission_id
    AND rp.is_active = 1
    
    ORDER BY username;
END;
GO

-- Stored Procedure: sp_GrantMultiplePermissions
-- SP: Otorgar múltiples permisos a usuario
CREATE   PROCEDURE sp_GrantMultiplePermissions
    @user_id INT,
    @permission_codes NVARCHAR(MAX), -- Separados por comas: "tickets.create,tickets.cancel"
    @grant_reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @permission_code NVARCHAR(100);
    DECLARE @permission_id INT;
    
    -- Crear tabla temporal con los códigos
    DECLARE @codes TABLE (permission_code NVARCHAR(100));
    
    INSERT INTO @codes (permission_code)
    SELECT TRIM(value) 
    FROM STRING_SPLIT(@permission_codes, ',');
    
    -- Otorgar cada permiso
    DECLARE code_cursor CURSOR FOR 
        SELECT permission_code FROM @codes;
    
    OPEN code_cursor;
    FETCH NEXT FROM code_cursor INTO @permission_code;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Obtener ID del permiso
        SELECT @permission_id = permission_id 
        FROM permissions 
        WHERE permission_code = @permission_code;
        
        IF @permission_id IS NOT NULL
        BEGIN
            EXEC sp_GrantPermissionToUser 
                @user_id = @user_id, 
                @permission_id = @permission_id,
                @grant_reason = @grant_reason;
        END
        ELSE
        BEGIN
            PRINT 'Advertencia: Permiso no encontrado: ' + @permission_code;
        END
        
        FETCH NEXT FROM code_cursor INTO @permission_code;
    END
    
    CLOSE code_cursor;
    DEALLOCATE code_cursor;
    
    PRINT 'Permisos otorgados exitosamente';
END;
GO

-- Stored Procedure: sp_GrantPermissionToUser
-- SP: Otorgar permiso directo a usuario
CREATE   PROCEDURE sp_GrantPermissionToUser
    @user_id INT,
    @permission_id INT,
    @grant_reason NVARCHAR(500) = NULL,
    @expires_at DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verificar si ya existe
        IF EXISTS (SELECT 1 FROM user_permissions 
                   WHERE user_id = @user_id AND permission_id = @permission_id)
        BEGIN
            -- Actualizar existente (reactivar si estaba inactivo)
            UPDATE user_permissions
            SET is_active = 1,
                updated_at = GETDATE(),
                updated_by = dbo.fn_GetCurrentUserId(),
                granted_by = dbo.fn_GetCurrentUserId(),
                grant_reason = @grant_reason,
                expires_at = @expires_at
            WHERE user_id = @user_id AND permission_id = @permission_id;
            
            PRINT 'Permiso reactivado/actualizado exitosamente';
        END
        ELSE
        BEGIN
            -- Crear nuevo permiso
            DECLARE @next_id INT = (SELECT ISNULL(MAX(user_permission_id), 0) + 1 
                                    FROM user_permissions);
            
            INSERT INTO user_permissions 
                (user_permission_id, user_id, permission_id, is_active, 
                 created_at, created_by, granted_by, grant_reason, expires_at)
            VALUES 
                (@next_id, @user_id, @permission_id, 1, 
                 GETDATE(), dbo.fn_GetCurrentUserId(), dbo.fn_GetCurrentUserId(), 
                 @grant_reason, @expires_at);
            
            PRINT 'Permiso otorgado exitosamente';
        END
        
        -- Mostrar información
        SELECT 
            u.username,
            p.permission_name,
            up.is_active,
            up.created_at as granted_at,
            u_granted.username as granted_by,
            up.grant_reason,
            up.expires_at
        FROM user_permissions up
        INNER JOIN users u ON up.user_id = u.user_id
        INNER JOIN permissions p ON up.permission_id = p.permission_id
        LEFT JOIN users u_granted ON up.granted_by = u_granted.user_id
        WHERE up.user_id = @user_id AND up.permission_id = @permission_id;
        
    END TRY
    BEGIN CATCH
        PRINT 'Error: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO

-- Stored Procedure: sp_PayTicketPrize
-- ============================================================================
-- SP: Registrar pago de premio
-- IMPROVED: 2025-10-22 - Added comprehensive validation and financial transaction logging
-- ============================================================================
CREATE   PROCEDURE sp_PayTicketPrize
    @ticket_id BIGINT,
    @paid_by INT,
    @payment_method VARCHAR(50),
    @payment_reference VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- ADDED: 2025-10-22 - Validate ticket exists
        IF NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_id = @ticket_id)
        BEGIN
            RAISERROR('Ticket ID %I64d does not exist', 16, 1, @ticket_id);
            RETURN -1;
        END

        -- ADDED: 2025-10-22 - Validate ticket is winner status
        IF NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_id = @ticket_id AND status = 'winner')
        BEGIN
            RAISERROR('Ticket ID %I64d is not a winner', 16, 1, @ticket_id);
            RETURN -1;
        END

        -- ADDED: 2025-10-22 - Validate not already paid
        IF EXISTS (SELECT 1 FROM tickets WHERE ticket_id = @ticket_id AND is_paid = 1)
        BEGIN
            RAISERROR('Ticket ID %I64d has already been paid', 16, 1, @ticket_id);
            RETURN -1;
        END

        -- ADDED: 2025-10-22 - Validate prize amount > 0
        DECLARE @prize DECIMAL(18,2);
        SELECT @prize = total_prize FROM tickets WHERE ticket_id = @ticket_id;

        IF @prize IS NULL OR @prize <= 0
        BEGIN
            RAISERROR('Ticket ID %I64d has no prize to pay', 16, 1, @ticket_id);
            RETURN -1;
        END

        -- ADDED: 2025-10-22 - Get betting pool and balance info for financial transaction
        DECLARE @betting_pool_id INT;
        DECLARE @balance_before DECIMAL(18,2);
        SELECT @betting_pool_id = betting_pool_id FROM tickets WHERE ticket_id = @ticket_id;
        SELECT @balance_before = current_balance FROM balances WHERE betting_pool_id = @betting_pool_id;

        BEGIN TRANSACTION;

        -- Registrar pago
        UPDATE tickets
        SET
            is_paid = 1,
            paid_at = GETDATE(),
            paid_by = @paid_by,
            payment_method = @payment_method,
            payment_reference = @payment_reference,
            status = 'paid',
            updated_at = GETDATE()
        WHERE ticket_id = @ticket_id;

        -- Actualizar líneas ganadoras
        UPDATE ticket_lines
        SET
            line_status = 'paid',
            updated_at = GETDATE()
        WHERE ticket_id = @ticket_id
        AND is_winner = 1;

        -- ADDED: 2025-10-22 - Register financial transaction
        INSERT INTO financial_transactions (
            transaction_type, betting_pool_id, user_id, ticket_id,
            amount, balance_before, balance_after,
            payment_method, reference_number, description, status, created_by
        )
        VALUES (
            'PRIZE_PAYMENT', @betting_pool_id, @paid_by, @ticket_id,
            -@prize, @balance_before, @balance_before - @prize,
            @payment_method, @payment_reference,
            'Prize payment for ticket ' + CAST(@ticket_id AS VARCHAR),
            'completed', @paid_by
        );

        -- ADDED: 2025-10-22 - Update balance
        UPDATE balances
        SET current_balance = current_balance - @prize,
            last_updated = GETDATE(),
            updated_by = @paid_by
        WHERE betting_pool_id = @betting_pool_id;

        COMMIT TRANSACTION;

        PRINT '✅ Premio pagado: $' + CAST(@prize AS VARCHAR);
        RETURN 0;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- ADDED: 2025-10-22 - Log error to error_logs table
        INSERT INTO error_logs (error_source, error_procedure, error_number, error_severity, error_state,
                                error_message, error_line, ticket_id, user_id)
        VALUES ('SP', 'sp_PayTicketPrize', ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(),
                ERROR_MESSAGE(), ERROR_LINE(), @ticket_id, @paid_by);

        PRINT '❌ Error pagando premio: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO

-- Stored Procedure: sp_RevokePermissionFromUser
-- SP: Revocar permiso directo de usuario
CREATE   PROCEDURE sp_RevokePermissionFromUser
    @user_id INT,
    @permission_id INT,
    @revoke_reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE user_permissions
    SET is_active = 0,
        updated_at = GETDATE(),
        updated_by = dbo.fn_GetCurrentUserId(),
        grant_reason = COALESCE(@revoke_reason, grant_reason)
    WHERE user_id = @user_id 
    AND permission_id = @permission_id;
    
    IF @@ROWCOUNT > 0
        PRINT 'Permiso revocado exitosamente';
    ELSE
        PRINT 'No se encontró el permiso especificado';
END;
GO

