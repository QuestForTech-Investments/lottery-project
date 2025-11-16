-- =============================================
-- SISTEMA COMPLETO DE LOTERÍA - SQL SERVER
-- Base de Datos Integral con Permisos N:M
-- Fecha: Octubre 2025
-- Versión: 1.0
-- =============================================

/*
CONTENIDO:
1. Tablas Maestras (Catálogos Base)
2. Sistema de Juegos
3. Sistema de Sorteos y Resultados
4. Sistema de Usuarios y Permisos
5. Betting Pools (Bancas/Puntos de Venta) - REFACTORIZADO ✓
6. Tablas de Relación N:M
7. Sistema de Tickets y Apuestas
8. Sistema de Premios
9. Foreign Keys
10. Stored Procedures de Permisos
11. Stored Procedures de Copia de Configuración ✓
12. Vistas Útiles
13. Triggers de Auditoría
14. Índices de Optimización

ESTRUCTURA MODULAR DE BETTING POOLS:
═══════════════════════════════════════════════════════════════
📋 TAB GENERAL (betting_pools)
   • Datos básicos: código, nombre, zona, banco, ubicación, referencia

📋 TAB CONFIGURACIÓN (3 tablas)
   • betting_pool_config: Tipo caída, límites, balances, toggles
   • betting_pool_print_config: Modo impresión, toggles de impresión
   • betting_pool_discount_config: Proveedor y modo de descuento

📋 TAB PIES DE PÁGINA (betting_pool_footers)
   • 4 líneas de pie de página + toggle automático

📋 TAB PREMIOS & COMISIONES (betting_pool_prizes_commissions)
   • Por lotería y tipo de juego
   • 3 pestañas: Premios, Comisiones, Comisiones 2

📋 TAB HORARIOS (betting_pool_schedules)
   • 7 días de la semana con horarios de apertura/cierre

📋 TAB SORTEOS (betting_pool_draws) - N:M
   • Relación con tabla draws para activar/desactivar sorteos

📋 TAB ESTILOS (betting_pool_styles)
   • Estilo punto de venta + Estilo de impresión

📋 TAB GASTOS AUTOMÁTICOS (betting_pool_automatic_expenses)
   • Tipo, monto, porcentaje, frecuencia

VENTAJAS DE LA REFACTORIZACIÓN:
✓ Sin duplicidad de datos
✓ Fácil mantenimiento
✓ Copia de configuraciones por sección
✓ Auditoría granular
✓ Mejor performance en consultas
✓ Escalabilidad
═══════════════════════════════════════════════════════════════
*/

PRINT '╔════════════════════════════════════════════════╗';
PRINT '║   SISTEMA DE LOTERÍA - INSTALACIÓN COMPLETA   ║';
PRINT '╚════════════════════════════════════════════════╝';
PRINT '';
GO

-- =============================================
-- FUNCIÓN AUXILIAR PARA OBTENER USUARIO ACTUAL
-- =============================================

-- Función para obtener el ID del usuario actual (necesaria para auditoría)
CREATE OR ALTER FUNCTION dbo.fn_GetCurrentUserId()
RETURNS INT
AS
BEGIN
    DECLARE @current_user_id INT;
    
    -- Intentar obtener de SESSION_CONTEXT (se debe establecer al iniciar sesión)
    SET @current_user_id = CAST(SESSION_CONTEXT(N'current_user_id') AS INT);
    
    -- Si no está definido, retornar -1 (sistema)
    IF @current_user_id IS NULL
        SET @current_user_id = -1;
    
    RETURN @current_user_id;
END;
GO

PRINT '✅ Función fn_GetCurrentUserId creada';
GO

-- =============================================
-- SECCIÓN 1: TABLAS MAESTRAS (CATÁLOGOS BASE)
-- =============================================

PRINT '';
PRINT '📦 Creando tablas maestras...';
GO

-- Tabla: countries
CREATE TABLE [dbo].[countries] (
    [country_id] int NOT NULL,
    [country_name] nvarchar(100) NOT NULL,
    [country_code] nvarchar(3) NOT NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_countries] PRIMARY KEY ([country_id])
);

-- Tabla: zones
CREATE TABLE [dbo].[zones] (
    [zone_id] int NOT NULL,
    [zone_name] nvarchar(100) NOT NULL,
    [country_id] int NOT NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_zones] PRIMARY KEY ([zone_id])
);

-- Tabla: banks
CREATE TABLE [dbo].[banks] (
    [bank_id] int NOT NULL,
    [bank_name] nvarchar(100) NOT NULL,
    [bank_code] nvarchar(10) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_banks] PRIMARY KEY ([bank_id])
);

-- Tabla: lotteries
CREATE TABLE [dbo].[lotteries] (
    [lottery_id] int NOT NULL,
    [country_id] int NOT NULL,
    [lottery_name] nvarchar(100) NOT NULL,
    [lottery_type] nvarchar(50) NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_lotteries] PRIMARY KEY ([lottery_id])
);

PRINT '✅ Tablas maestras creadas: countries, zones, banks, lotteries';
GO

-- =============================================
-- SECCIÓN 2: SISTEMA DE JUEGOS
-- =============================================

PRINT '';
PRINT '🎮 Creando sistema de juegos...';
GO

-- Tabla: game_categories
CREATE TABLE [dbo].[game_categories] (
    [category_id] int NOT NULL,
    [category_name] nvarchar(100) NOT NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_game_categories] PRIMARY KEY ([category_id])
);

-- Tabla: game_types
-- ADDED: 2025-10-22 - Merged duplicate definition, added IDENTITY and game_type_code
CREATE TABLE [dbo].[game_types] (
    [game_type_id] int NOT NULL IDENTITY(1,1),
    [category_id] int NOT NULL,
    [game_type_code] varchar(50) NOT NULL,
    [game_name] nvarchar(100) NOT NULL,
    [description] nvarchar(500) NULL,
    [prize_multiplier] decimal(10,2) NULL DEFAULT 1.00,
    [requires_additional_number] bit NULL DEFAULT 0,
    [number_length] int NULL DEFAULT 4,
    [display_order] int NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_game_types] PRIMARY KEY ([game_type_id]),
    CONSTRAINT [UQ_game_type_code] UNIQUE ([game_type_code])
);

-- Tabla: lottery_game_compatibility
CREATE TABLE [dbo].[lottery_game_compatibility] (
    [compatibility_id] int NOT NULL,
    [lottery_id] int NOT NULL,
    [game_type_id] int NOT NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_lottery_game_compatibility] PRIMARY KEY ([compatibility_id]),
    CONSTRAINT [UQ_lottery_game] UNIQUE ([lottery_id],[game_type_id])
);

PRINT '✅ Sistema de juegos creado: game_categories, game_types, lottery_game_compatibility';
GO

-- =============================================
-- SECCIÓN 3: SISTEMA DE SORTEOS Y RESULTADOS
-- =============================================

PRINT '';
PRINT '🎯 Creando sistema de sorteos...';
GO

-- Tabla: draws
-- UPDATED: 2025-10-22 - Added abbreviation and display_color columns for UI display
CREATE TABLE [dbo].[draws] (
    [draw_id] int NOT NULL,
    [lottery_id] int NOT NULL,
    [draw_name] nvarchar(100) NOT NULL,
    [draw_time] time NOT NULL,
    [description] nvarchar(500) NULL,
    [abbreviation] varchar(10) NULL,
    [display_color] varchar(7) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_draws] PRIMARY KEY ([draw_id])
);

-- Tabla: results (CRÍTICO - Auditoría completa)
-- ADDED: 2025-10-22 - Added position column for 1st, 2nd, 3rd place results
CREATE TABLE [dbo].[results] (
    [result_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [winning_number] nvarchar(20) NOT NULL,
    [additional_number] nvarchar(10) NULL,
    [position] int NULL, -- 1=First, 2=Second, 3=Third position
    [result_date] datetime2 NOT NULL,
    [user_id] int NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [approved_by] int NULL,
    [approved_at] datetime2 NULL,
    CONSTRAINT [PK_results] PRIMARY KEY ([result_id])
);

PRINT '✅ Sistema de sorteos creado: draws, results';
GO

-- =============================================
-- SECCIÓN 4: SISTEMA DE USUARIOS Y PERMISOS
-- =============================================

PRINT '';
PRINT '🔐 Creando sistema de usuarios y permisos...';
GO

-- Tabla: roles
CREATE TABLE [dbo].[roles] (
    [role_id] int NOT NULL,
    [role_name] nvarchar(50) NOT NULL,
    [description] nvarchar(255) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_roles] PRIMARY KEY ([role_id]),
    CONSTRAINT [UQ_roles_name] UNIQUE ([role_name])
);

-- Tabla: permissions
CREATE TABLE [dbo].[permissions] (
    [permission_id] int NOT NULL,
    [permission_code] nvarchar(100) NOT NULL,
    [permission_name] nvarchar(200) NOT NULL,
    [category] nvarchar(50) NOT NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_permissions] PRIMARY KEY ([permission_id]),
    CONSTRAINT [UQ_permissions_code] UNIQUE ([permission_code])
);

-- Tabla: role_permissions
CREATE TABLE [dbo].[role_permissions] (
    [role_permission_id] int NOT NULL,
    [role_id] int NOT NULL,
    [permission_id] int NOT NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    CONSTRAINT [PK_role_permissions] PRIMARY KEY ([role_permission_id]),
    CONSTRAINT [UQ_role_permission] UNIQUE ([role_id],[permission_id])
);

-- Tabla: users (CRÍTICO - Sin betting_pool_id, relación N:M)
CREATE TABLE [dbo].[users] (
    [user_id] int NOT NULL,
    [username] nvarchar(50) NOT NULL,
    [password_hash] nvarchar(255) NOT NULL,
    [email] nvarchar(100) NULL,
    [full_name] nvarchar(200) NULL,
    [phone] nvarchar(20) NULL,
    [role_id] int NULL,
    [commission_rate] decimal(5,2) NULL DEFAULT 0.00,
    [is_active] bit NULL DEFAULT 1,
    [last_login_at] datetime2 NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    -- Campos de auditoría
    [created_by] int NULL,
    [updated_by] int NULL,
    [deleted_at] datetime2 NULL,
    [deleted_by] int NULL,
    [deletion_reason] nvarchar(500) NULL,
    [last_modified_ip] varchar(45) NULL,
    CONSTRAINT [PK_users] PRIMARY KEY ([user_id]),
    CONSTRAINT [UQ_users_username] UNIQUE ([username])
);

PRINT '✅ Sistema de usuarios creado: roles, permissions, role_permissions, users';
GO

-- =============================================
-- SECCIÓN 5: BETTING POOLS (BANCAS)
-- =============================================

PRINT '';
PRINT '🏪 Creando sistema de bancas...';
GO

-- Tabla: betting_pools (SOLO DATOS BÁSICOS)
CREATE TABLE [dbo].[betting_pools] (
    [betting_pool_id] int NOT NULL,
    [betting_pool_code] nvarchar(20) NOT NULL, -- Número/código de la banca (ej: LAN-0519)
    [betting_pool_name] nvarchar(100) NOT NULL,
    [zone_id] int NOT NULL,
    [bank_id] int NULL,
    [address] nvarchar(255) NULL,
    [phone] nvarchar(20) NULL,
    [location] varchar(255) NULL, -- Ubicación geográfica
    [reference] varchar(255) NULL, -- Referencia/propietario
    [comment] text NULL,
    [username] nvarchar(100) NULL, -- Usuario asociado a la banca
    [password_hash] varchar(255) NULL,
    [is_active] bit NULL DEFAULT 1,
    -- Campos de auditoría
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [deleted_at] datetime2 NULL,
    [deleted_by] int NULL,
    [deletion_reason] nvarchar(500) NULL,
    CONSTRAINT [PK_betting_pools] PRIMARY KEY ([betting_pool_id]),
    CONSTRAINT [UQ_betting_pool_code] UNIQUE ([betting_pool_code])
);

-- Tabla: balances
CREATE TABLE [dbo].[balances] (
    [balance_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [current_balance] decimal(12,2) NULL DEFAULT 0.00,
    [last_updated] datetime2 NULL DEFAULT (getdate()),
    [updated_by] int NULL,
    CONSTRAINT [PK_balances] PRIMARY KEY ([balance_id])
);

-- Tabla: betting_pool_config (Tab "Configuración")
CREATE TABLE [dbo].[betting_pool_config] (
    [config_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    -- Tipo de caída
    [fall_type] varchar(50) NULL DEFAULT ('OFF'), -- OFF, COBRO, DIARIA, MENSUAL, SEMANAL CON ACUMULADO, SEMANAL SIN ACUMULADO
    -- Balances y límites
    [deactivation_balance] decimal(10,2) NULL,
    [daily_sale_limit] decimal(10,2) NULL,
    [daily_balance_limit] decimal(10,2) NULL,
    [temporary_additional_balance] decimal(10,2) NULL,
    [credit_limit] decimal(12,2) NULL DEFAULT 0.00,
    -- Toggles de funcionalidad
    [is_active] bit NULL DEFAULT 1,
    [control_winning_tickets] bit NULL DEFAULT 0,
    [allow_jackpot] bit NULL DEFAULT 1,
    [enable_recharges] bit NULL DEFAULT 1,
    [allow_password_change] bit NULL DEFAULT 1,
    -- Configuración de cancelaciones
    [cancel_minutes] int NULL DEFAULT 30,
    [daily_cancel_tickets] int NULL,
    [max_cancel_amount] decimal(10,2) NULL,
    -- Límites de montos
    [max_ticket_amount] decimal(10,2) NULL,
    [max_daily_recharge] decimal(10,2) NULL,
    -- Modo de pago
    [payment_mode] varchar(50) NULL DEFAULT ('BANCA'), -- BANCA, GRUPO, ZONA, USAR PREFERENCIA DE GRUPO
    -- Auditoría
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_config] PRIMARY KEY ([config_id]),
    CONSTRAINT [UQ_betting_pool_config] UNIQUE ([betting_pool_id]),
    -- ADDED: 2025-10-22 - Ensure all amount fields are non-negative
    CONSTRAINT [CHK_config_deactivation_balance] CHECK ([deactivation_balance] IS NULL OR [deactivation_balance] >= 0),
    CONSTRAINT [CHK_config_daily_sale_limit] CHECK ([daily_sale_limit] IS NULL OR [daily_sale_limit] >= 0),
    CONSTRAINT [CHK_config_daily_balance_limit] CHECK ([daily_balance_limit] IS NULL OR [daily_balance_limit] >= 0),
    CONSTRAINT [CHK_config_temp_balance] CHECK ([temporary_additional_balance] IS NULL OR [temporary_additional_balance] >= 0),
    CONSTRAINT [CHK_config_credit_limit] CHECK ([credit_limit] >= 0),
    CONSTRAINT [CHK_config_max_cancel_amount] CHECK ([max_cancel_amount] IS NULL OR [max_cancel_amount] >= 0),
    CONSTRAINT [CHK_config_max_ticket_amount] CHECK ([max_ticket_amount] IS NULL OR [max_ticket_amount] >= 0),
    CONSTRAINT [CHK_config_max_daily_recharge] CHECK ([max_daily_recharge] IS NULL OR [max_daily_recharge] >= 0)
);

-- Tabla: betting_pool_print_config (Configuración de impresión)
CREATE TABLE [dbo].[betting_pool_print_config] (
    [print_config_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [print_mode] varchar(50) NULL DEFAULT ('DRIVER'), -- DRIVER, GENERICO
    [print_enabled] bit NULL DEFAULT 1,
    [print_ticket_copy] bit NULL DEFAULT 1,
    [print_recharge_receipt] bit NULL DEFAULT 1,
    [sms_only] bit NULL DEFAULT 0,
    -- Auditoría
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_print_config] PRIMARY KEY ([print_config_id]),
    CONSTRAINT [UQ_betting_pool_print] UNIQUE ([betting_pool_id])
);

-- Tabla: betting_pool_discount_config (Configuración de descuentos)
CREATE TABLE [dbo].[betting_pool_discount_config] (
    [discount_config_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [discount_provider] varchar(50) NULL DEFAULT ('GRUPO'), -- GRUPO, RIFERO
    [discount_mode] varchar(50) NULL DEFAULT ('OFF'), -- OFF, EFECTIVO, TICKET GRATIS
    -- Auditoría
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_discount_config] PRIMARY KEY ([discount_config_id]),
    CONSTRAINT [UQ_betting_pool_discount] UNIQUE ([betting_pool_id])
);

-- Tabla: balances (movida antes, pero incluida en el flujo correcto)

-- Tabla: betting_pool_automatic_expenses
CREATE TABLE [dbo].[betting_pool_automatic_expenses] (
    [expense_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [expense_type] varchar(50) NOT NULL,
    [amount] decimal(10,2) NULL,
    [percentage] decimal(5,2) NULL,
    [frequency] varchar(50) NOT NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_expenses] PRIMARY KEY ([expense_id])
);

-- Tabla: betting_pool_footers (Tab "Pies de página")
CREATE TABLE [dbo].[betting_pool_footers] (
    [footer_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [auto_footer] bit NULL DEFAULT 0, -- Pie de página automático
    [footer_line_1] nvarchar(500) NULL, -- Primer pie de página
    [footer_line_2] nvarchar(500) NULL, -- Segundo pie de página
    [footer_line_3] nvarchar(500) NULL, -- Tercer pie de página
    [footer_line_4] nvarchar(500) NULL, -- Cuarto pie de página
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_footers] PRIMARY KEY ([footer_id]),
    CONSTRAINT [UQ_betting_pool_footer] UNIQUE ([betting_pool_id])
);

-- Tabla: betting_pool_prizes_commissions (Tab "Premios & Comisiones")
-- Cada banca puede tener configuraciones diferentes por lotería y tipo de juego
CREATE TABLE [dbo].[betting_pool_prizes_commissions] (
    [prize_commission_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [lottery_id] int NOT NULL,
    [game_type] varchar(50) NOT NULL, -- DIRECTO, PALE, TRIPLETA, etc.
    -- Premios (múltiples pagos)
    [prize_payment_1] decimal(10,2) NULL, -- Primer Pago
    [prize_payment_2] decimal(10,2) NULL, -- Segundo Pago
    [prize_payment_3] decimal(10,2) NULL, -- Tercer Pago (si aplica)
    [prize_payment_4] decimal(10,2) NULL, -- Cuarto Pago (si aplica)
    -- Comisiones (Tab "Comisiones")
    [commission_discount_1] decimal(5,2) NULL, -- Primer descuento/comisión
    [commission_discount_2] decimal(5,2) NULL, -- Segundo descuento/comisión
    [commission_discount_3] decimal(5,2) NULL, -- Tercer descuento (si aplica)
    [commission_discount_4] decimal(5,2) NULL, -- Cuarto descuento (si aplica)
    -- Comisiones 2 (Tab "Comisiones 2")
    [commission_2_discount_1] decimal(5,2) NULL,
    [commission_2_discount_2] decimal(5,2) NULL,
    [commission_2_discount_3] decimal(5,2) NULL,
    [commission_2_discount_4] decimal(5,2) NULL,
    -- Control
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_prizes] PRIMARY KEY ([prize_commission_id]),
    CONSTRAINT [UQ_pool_lottery_game] UNIQUE ([betting_pool_id],[lottery_id],[game_type])
);

-- Tabla: betting_pool_schedules
CREATE TABLE [dbo].[betting_pool_schedules] (
    [schedule_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [day_of_week] int NOT NULL,
    [close_time] time NULL,
    [draw_time] time NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_schedules] PRIMARY KEY ([schedule_id]),
    CONSTRAINT [UQ_pool_day] UNIQUE ([betting_pool_id],[day_of_week])
);

-- Tabla: betting_pool_sortitions
CREATE TABLE [dbo].[betting_pool_sortitions] (
    [sortition_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [sortition_type] varchar(50) NOT NULL,
    [is_enabled] bit NULL DEFAULT 1,
    [specific_config] nvarchar(MAX) NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_sortitions] PRIMARY KEY ([sortition_id]),
    CONSTRAINT [UQ_pool_sortition] UNIQUE ([betting_pool_id],[sortition_type])
);

-- Tabla: betting_pool_styles (Tab "Estilos")
CREATE TABLE [dbo].[betting_pool_styles] (
    [style_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [sales_point_style] varchar(50) NULL DEFAULT ('Estilo 1'), -- Estilo punto de venta
    [print_style] varchar(50) NULL DEFAULT ('Original'), -- Estilo de impresión
    [ticket_colors] nvarchar(MAX) NULL, -- Configuración de colores (JSON)
    [custom_logo] varchar(255) NULL,
    [font_settings] nvarchar(MAX) NULL,
    [layout_config] nvarchar(MAX) NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_styles] PRIMARY KEY ([style_id]),
    CONSTRAINT [UQ_pool_style] UNIQUE ([betting_pool_id])
);

-- Tabla: betting_pool_draws (N:M entre betting_pools y draws)
CREATE TABLE [dbo].[betting_pool_draws] (
    [betting_pool_draw_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_draws] PRIMARY KEY ([betting_pool_draw_id]),
    CONSTRAINT [UQ_betting_pool_draw] UNIQUE ([betting_pool_id],[draw_id])
);

PRINT '✅ Sistema de bancas creado: betting_pools + 11 tablas de configuración';
GO

-- =============================================
-- SECCIÓN 6: TABLAS DE RELACIÓN N:M
-- =============================================

PRINT '';
PRINT '🔗 Creando tablas de relación muchos-a-muchos...';
GO

-- Tabla: user_betting_pools (N:M entre users y betting_pools)
CREATE TABLE [dbo].[user_betting_pools] (
    [user_betting_pool_id] int NOT NULL,
    [user_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [is_primary] bit NULL DEFAULT 0, -- Indica si es la banca principal del usuario
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_user_betting_pools] PRIMARY KEY ([user_betting_pool_id]),
    CONSTRAINT [UQ_user_betting_pool] UNIQUE ([user_id],[betting_pool_id])
);

-- Tabla: user_zones (N:M entre users y zones)
CREATE TABLE [dbo].[user_zones] (
    [user_zone_id] int NOT NULL,
    [user_id] int NOT NULL,
    [zone_id] int NOT NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_user_zones] PRIMARY KEY ([user_zone_id]),
    CONSTRAINT [UQ_user_zone] UNIQUE ([user_id],[zone_id])
);

-- Tabla: user_permissions (N:M entre users y permissions - PERMISOS DIRECTOS)
CREATE TABLE [dbo].[user_permissions] (
    [user_permission_id] int NOT NULL,
    [user_id] int NOT NULL,
    [permission_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT 1,
    [created_at] datetime NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    -- Campos adicionales para permisos temporales y auditoría
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [granted_by] int NULL,
    [grant_reason] nvarchar(500) NULL,
    [expires_at] datetime2 NULL,
    CONSTRAINT [PK_user_permissions] PRIMARY KEY ([user_permission_id]),
    CONSTRAINT [UQ_user_permission] UNIQUE ([user_id],[permission_id])
);

PRINT '✅ Tablas N:M creadas: user_betting_pools, user_zones, user_permissions';
GO

-- =============================================
-- SECCIÓN 7: SISTEMA DE TICKETS Y APUESTAS (REFACTORIZADO)
-- =============================================

PRINT '';
PRINT '🎫 Creando sistema de tickets REFACTORIZADO...';
PRINT '   Estrategia: EVOLUCIÓN con COEXISTENCIA';
GO

-- ============================================================================
-- PASO 1: RENOMBRAR TABLAS ANTIGUAS (Si existen)
-- ============================================================================
IF OBJECT_ID('tickets', 'U') IS NOT NULL
BEGIN
    PRINT '📦 Renombrando tabla tickets antigua a tickets_legacy...';
    EXEC sp_rename 'tickets', 'tickets_legacy';
END

IF OBJECT_ID('ticket_lines', 'U') IS NOT NULL
BEGIN
    PRINT '📦 Renombrando tabla ticket_lines antigua a ticket_lines_legacy...';
    EXEC sp_rename 'ticket_lines', 'ticket_lines_legacy';
END
GO

-- ============================================================================
-- TABLA PRINCIPAL: tickets (Cabecera del Ticket)
-- ============================================================================
CREATE TABLE [dbo].[tickets] (
    -- ============================================================
    -- IDENTIFICACIÓN
    -- ============================================================
    [ticket_id] BIGINT NOT NULL IDENTITY(1,1),
    [ticket_code] VARCHAR(20) NOT NULL, -- LAN-20251007-0001
    [barcode] VARCHAR(50) NULL, -- Código de barras para scanner
    
    -- ============================================================
    -- ORIGEN DEL TICKET
    -- ============================================================
    [betting_pool_id] INT NOT NULL, -- Banca donde se hizo
    [user_id] INT NOT NULL, -- Usuario que creó el ticket
    [terminal_id] VARCHAR(20) NULL, -- ID de la terminal/caja
    [ip_address] VARCHAR(45) NULL, -- IP desde donde se creó
    
    -- ============================================================
    -- FECHA Y HORA
    -- ============================================================
    [created_at] DATETIME2 NOT NULL DEFAULT (GETDATE()),
    
    -- ============================================================
    -- CONFIGURACIÓN GLOBAL DEL TICKET
    -- ============================================================
    [global_multiplier] DECIMAL(5,2) NULL DEFAULT 1.00, -- Multiplicador x2, x5, x10
    [global_discount] DECIMAL(5,2) NULL DEFAULT 0.00, -- Descuento % aplicado
    [currency_code] VARCHAR(3) NULL DEFAULT 'DOP', -- Moneda
    
    -- ============================================================
    -- TOTALES CALCULADOS (Se calculan al crear/actualizar)
    -- ============================================================
    [total_lines] INT NULL DEFAULT 0, -- Cantidad de líneas/jugadas
    [total_bet_amount] DECIMAL(18,2) NULL DEFAULT 0.00, -- Suma de todas las apuestas
    [total_discount] DECIMAL(18,2) NULL DEFAULT 0.00, -- Total de descuentos
    [total_subtotal] DECIMAL(18,2) NULL DEFAULT 0.00, -- Después de descuentos
    [total_with_multiplier] DECIMAL(18,2) NULL DEFAULT 0.00, -- Después de multiplicador
    [total_commission] DECIMAL(18,2) NULL DEFAULT 0.00, -- Comisiones calculadas
    [total_net] DECIMAL(18,2) NULL DEFAULT 0.00, -- Neto después de comisiones
    [grand_total] DECIMAL(18,2) NULL DEFAULT 0.00, -- TOTAL FINAL DEL TICKET
    
    -- ============================================================
    -- INFORMACIÓN DE PREMIO
    -- ============================================================
    [total_prize] DECIMAL(18,2) NULL DEFAULT 0.00, -- Premio total ganado
    [winning_lines] INT NULL DEFAULT 0, -- Cuántas líneas ganaron
    
    -- ============================================================
    -- ESTADO DEL TICKET
    -- ============================================================
    [status] VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Valores posibles:
    --   pending   = Creado pero sorteo aún no ocurre
    --   active    = Sorteo en progreso
    --   winner    = Tiene premios ganadores
    --   loser     = No ganó nada
    --   paid      = Premio ya fue pagado
    --   cancelled = Ticket cancelado
    
    -- ============================================================
    -- CANCELACIÓN (Auditoría completa)
    -- ============================================================
    [is_cancelled] BIT NULL DEFAULT 0,
    [cancelled_at] DATETIME2 NULL,
    [cancelled_by] INT NULL, -- FK a users
    [cancellation_reason] NVARCHAR(200) NULL,
    
    -- ============================================================
    -- PAGO (Auditoría completa)
    -- ============================================================
    [is_paid] BIT NULL DEFAULT 0,
    [paid_at] DATETIME2 NULL,
    [paid_by] INT NULL, -- FK a users
    [payment_method] VARCHAR(50) NULL, -- efectivo, transferencia, cheque
    [payment_reference] VARCHAR(100) NULL, -- Número de transacción
    
    -- ============================================================
    -- CLIENTE (Opcional - para tickets grandes)
    -- ============================================================
    [customer_id] INT NULL, -- Si hay tabla de clientes
    [customer_name] NVARCHAR(100) NULL,
    [customer_phone] VARCHAR(20) NULL,
    [customer_email] VARCHAR(100) NULL,
    [customer_id_number] VARCHAR(50) NULL, -- Cédula/DNI
    
    -- ============================================================
    -- METADATA DEL TICKET (Información agregada)
    -- ============================================================
    [lottery_ids] VARCHAR(500) NULL, -- "1,5,10,15" - IDs de loterías jugadas
    [total_lotteries] INT NULL DEFAULT 0, -- Cantidad de loterías diferentes
    [earliest_draw_time] DATETIME2 NULL, -- Primer sorteo
    [latest_draw_time] DATETIME2 NULL, -- Último sorteo
    
    -- ============================================================
    -- AUDITORÍA ADICIONAL
    -- ============================================================
    [updated_at] DATETIME2 NULL,
    [updated_by] INT NULL,
    [print_count] INT NULL DEFAULT 0, -- Cuántas veces se imprimió
    [last_printed_at] DATETIME2 NULL,
    
    -- ============================================================
    -- NOTAS Y OBSERVACIONES
    -- ============================================================
    [notes] NVARCHAR(500) NULL, -- Notas internas
    [special_flags] VARCHAR(200) NULL, -- Flags especiales: VIP, ALERTA, etc.
    
    -- ============================================================
    -- CONSTRAINTS
    -- ============================================================
    CONSTRAINT [PK_tickets] PRIMARY KEY ([ticket_id]),
    CONSTRAINT [UQ_ticket_code] UNIQUE ([ticket_code]),
    CONSTRAINT [CHK_ticket_status] CHECK (
        [status] IN ('pending','active','winner','loser','paid','cancelled')
    ),
    CONSTRAINT [CHK_ticket_multiplier] CHECK ([global_multiplier] >= 1.00),
    CONSTRAINT [CHK_ticket_discount] CHECK ([global_discount] >= 0.00 AND [global_discount] <= 100.00),
    -- ADDED: 2025-10-22 - Ensure total amounts are non-negative
    CONSTRAINT [CHK_ticket_total_bet_amount] CHECK ([total_bet_amount] >= 0),
    CONSTRAINT [CHK_ticket_grand_total] CHECK ([grand_total] >= 0)
);
GO

-- Índices para tickets
CREATE INDEX [IX_tickets_betting_pool] ON [dbo].[tickets] ([betting_pool_id], [created_at] DESC);
CREATE INDEX [IX_tickets_user] ON [dbo].[tickets] ([user_id], [created_at] DESC);
CREATE INDEX [IX_tickets_status] ON [dbo].[tickets] ([status], [created_at] DESC);
CREATE INDEX [IX_tickets_created_at] ON [dbo].[tickets] ([created_at] DESC);
CREATE INDEX [IX_tickets_barcode] ON [dbo].[tickets] ([barcode]) WHERE [barcode] IS NOT NULL;
CREATE INDEX [IX_tickets_customer] ON [dbo].[tickets] ([customer_phone], [customer_name]) 
    WHERE [customer_phone] IS NOT NULL;
GO

PRINT '✅ Tabla tickets (cabecera) creada';
GO

-- ============================================================================
-- TABLA SECUNDARIA: ticket_lines (Líneas/Jugadas del Ticket)
-- ============================================================================
CREATE TABLE [dbo].[ticket_lines] (
    -- ============================================================
    -- IDENTIFICACIÓN
    -- ============================================================
    [line_id] BIGINT NOT NULL IDENTITY(1,1),
    [ticket_id] BIGINT NOT NULL, -- FK a tickets
    [line_number] INT NOT NULL, -- Número de línea dentro del ticket (1, 2, 3...)
    
    -- ============================================================
    -- SORTEO Y LOTERÍA
    -- ============================================================
    [lottery_id] INT NOT NULL, -- FK a lotteries (REAL, LEIDSA, etc.)
    [draw_id] INT NOT NULL, -- FK a draws (sorteo específico)
    [draw_date] DATE NOT NULL, -- Fecha del sorteo
    [draw_time] TIME NOT NULL, -- Hora del sorteo
    
    -- ============================================================
    -- APUESTA
    -- ============================================================
    [bet_number] VARCHAR(20) NOT NULL, -- Número apostado: "23", "45", "123", etc.
    [bet_type_id] INT NOT NULL, -- FK a game_types (DIRECTO, PALE, TRIPLETA, etc.)
    [bet_type_code] VARCHAR(50) NULL, -- Código del tipo para consultas rápidas
    [position] INT NULL, -- Para Directo: 1=Primera, 2=Segunda, 3=Tercera
    
    -- ============================================================
    -- MONTOS BASE
    -- ============================================================
    [bet_amount] DECIMAL(18,2) NOT NULL, -- Monto apostado original
    [multiplier] DECIMAL(5,2) NULL DEFAULT 1.00, -- Multiplicador aplicado (x2, x5, x10)
    
    -- ============================================================
    -- DESCUENTO
    -- ============================================================
    [discount_percentage] DECIMAL(5,2) NULL DEFAULT 0.00, -- % de descuento
    [discount_amount] DECIMAL(18,2) NULL DEFAULT 0.00, -- Monto descontado
    [subtotal] DECIMAL(18,2) NOT NULL, -- bet_amount - discount_amount
    
    -- ============================================================
    -- TOTAL CON MULTIPLICADOR
    -- ============================================================
    [total_with_multiplier] DECIMAL(18,2) NOT NULL, -- subtotal * multiplier
    
    -- ============================================================
    -- COMISIÓN
    -- ============================================================
    [commission_percentage] DECIMAL(5,2) NULL DEFAULT 0.00, -- % de comisión
    [commission_amount] DECIMAL(18,2) NULL DEFAULT 0.00, -- Monto de comisión
    [net_amount] DECIMAL(18,2) NOT NULL, -- Total después de comisión
    
    -- ============================================================
    -- PREMIO (Se llena cuando se publican resultados)
    -- ============================================================
    [prize_multiplier] DECIMAL(10,2) NULL, -- Multiplicador de premio (ej: x75 para Directo)
    [prize_amount] DECIMAL(18,2) NULL DEFAULT 0.00, -- Premio ganado
    [is_winner] BIT NULL DEFAULT 0, -- ¿Esta línea ganó?
    [winning_position] INT NULL, -- Posición en la que salió (1=Primera, 2=Segunda, 3=Tercera)
    [result_number] VARCHAR(20) NULL, -- Número que salió en el sorteo
    [result_checked_at] DATETIME2 NULL, -- Cuándo se verificó el resultado
    
    -- ============================================================
    -- ESTADO DE LA LÍNEA
    -- ============================================================
    [line_status] VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Valores posibles:
    --   pending   = Esperando sorteo
    --   active    = Sorteo en progreso
    --   winner    = Línea ganadora
    --   loser     = No ganó
    --   paid      = Premio pagado
    --   cancelled = Cancelada
    
    -- ============================================================
    -- LÍMITES Y VALIDACIÓN
    -- ============================================================
    [limit_rule_id] INT NULL, -- FK a limit_rules aplicada
    [exceeds_limit] BIT NULL DEFAULT 0, -- ¿Excedió algún límite?
    [limit_override_by] INT NULL, -- Usuario que autorizó exceder límite
    [limit_override_reason] NVARCHAR(200) NULL,
    
    -- ============================================================
    -- AUDITORÍA
    -- ============================================================
    [created_at] DATETIME2 NOT NULL DEFAULT (GETDATE()),
    [created_by] INT NULL,
    [updated_at] DATETIME2 NULL,
    [updated_by] INT NULL,
    
    -- ============================================================
    -- METADATA
    -- ============================================================
    [is_lucky_pick] BIT NULL DEFAULT 0, -- ¿Número aleatorio generado por sistema?
    [is_hot_number] BIT NULL DEFAULT 0, -- ¿Era número caliente al momento de jugar?
    [sequence_number] INT NULL, -- Para jugadas secuenciales (ej: 01,02,03...)
    
    -- ============================================================
    -- NOTAS
    -- ============================================================
    [notes] NVARCHAR(500) NULL, -- Notas específicas de esta línea
    
    -- ============================================================
    -- CONSTRAINTS
    -- ============================================================
    CONSTRAINT [PK_ticket_lines] PRIMARY KEY ([line_id]),
    CONSTRAINT [CHK_line_status] CHECK (
        [line_status] IN ('pending','active','winner','loser','paid','cancelled')
    ),
    CONSTRAINT [CHK_line_bet_amount] CHECK ([bet_amount] > 0),
    CONSTRAINT [CHK_line_multiplier] CHECK ([multiplier] >= 1.00),
    CONSTRAINT [CHK_line_discount] CHECK ([discount_percentage] >= 0.00 AND [discount_percentage] <= 100.00),
    CONSTRAINT [CHK_line_commission] CHECK ([commission_percentage] >= 0.00 AND [commission_percentage] <= 100.00),
    -- ADDED: 2025-10-22 - Ensure subtotal is non-negative
    CONSTRAINT [CHK_line_subtotal] CHECK ([subtotal] >= 0)
);
GO

-- Índices para ticket_lines
CREATE INDEX [IX_ticket_lines_ticket] ON [dbo].[ticket_lines] ([ticket_id], [line_number]);
CREATE INDEX [IX_ticket_lines_lottery_draw] ON [dbo].[ticket_lines] ([lottery_id], [draw_id], [created_at] DESC);
CREATE INDEX [IX_ticket_lines_bet_number] ON [dbo].[ticket_lines] ([bet_number], [lottery_id], [draw_date]);
CREATE INDEX [IX_ticket_lines_status] ON [dbo].[ticket_lines] ([line_status], [created_at] DESC);
CREATE INDEX [IX_ticket_lines_winner] ON [dbo].[ticket_lines] ([is_winner], [prize_amount] DESC) 
    WHERE [is_winner] = 1;
CREATE INDEX [IX_ticket_lines_draw_date] ON [dbo].[ticket_lines] ([draw_date], [draw_time]);
CREATE INDEX [IX_ticket_lines_bet_type] ON [dbo].[ticket_lines] ([bet_type_id], [bet_number]);
GO

PRINT '✅ Tabla ticket_lines (líneas/jugadas) creada';
GO

-- ============================================================================
-- NOTA: TABLA game_types YA DEFINIDA EN SECCIÓN 2
-- ============================================================================
-- REMOVED: 2025-10-22 - Duplicate game_types definition removed
-- The comprehensive game_types table is now defined at line ~182 with IDENTITY
-- and includes fields from both previous definitions (merged)

PRINT '✅ Sistema de tickets REFACTORIZADO creado exitosamente';
PRINT '   • tickets (cabecera con 40+ campos)';
PRINT '   • ticket_lines (líneas con 35+ campos)';
PRINT '   • game_types (tipos de jugadas)';
GO

-- =============================================
-- SECCIÓN 8: SISTEMA DE PREMIOS
-- =============================================

PRINT '';
PRINT '🏆 Creando sistema de premios...';
GO

-- Tabla: prizes (MUY CRÍTICO - Auditoría de pagos)
-- ADDED: 2025-10-22 - Changed line_id to BIGINT to match ticket_lines.line_id
-- ADDED: 2025-10-22 - Added CHECK constraint for prize_amount >= 0
CREATE TABLE [dbo].[prizes] (
    [prize_id] int NOT NULL,
    [result_id] int NOT NULL,
    [line_id] bigint NOT NULL, -- Changed from INT to BIGINT
    [prize_amount] decimal(10,2) NULL DEFAULT 0.00,
    [prize_type] nvarchar(50) NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    -- Campos de auditoría de pago
    [created_by] int NULL,
    [paid_at] datetime2 NULL,
    [paid_by] int NULL,
    [payment_method] varchar(50) NULL,
    [payment_reference] varchar(100) NULL,
    CONSTRAINT [PK_prizes] PRIMARY KEY ([prize_id]),
    CONSTRAINT [CHK_prizes_amount] CHECK ([prize_amount] >= 0)
);

PRINT '✅ Sistema de premios creado: prizes';
GO

-- =============================================
-- SECCIÓN 9: FOREIGN KEYS (RELACIONES)
-- =============================================

PRINT '';
PRINT '🔗 Creando foreign keys...';
GO

-- Relaciones de tablas maestras
ALTER TABLE [dbo].[zones] 
    ADD CONSTRAINT [FK_zones_countries] 
    FOREIGN KEY ([country_id]) 
    REFERENCES [dbo].[countries] ([country_id]);

ALTER TABLE [dbo].[lotteries] 
    ADD CONSTRAINT [FK_lotteries_countries] 
    FOREIGN KEY ([country_id]) 
    REFERENCES [dbo].[countries] ([country_id]);

-- Relaciones de juegos
ALTER TABLE [dbo].[game_types] 
    ADD CONSTRAINT [FK_game_types_categories] 
    FOREIGN KEY ([category_id]) 
    REFERENCES [dbo].[game_categories] ([category_id]);

ALTER TABLE [dbo].[lottery_game_compatibility] 
    ADD CONSTRAINT [FK_compatibility_lotteries] 
    FOREIGN KEY ([lottery_id]) 
    REFERENCES [dbo].[lotteries] ([lottery_id]);

ALTER TABLE [dbo].[lottery_game_compatibility] 
    ADD CONSTRAINT [FK_compatibility_games] 
    FOREIGN KEY ([game_type_id]) 
    REFERENCES [dbo].[game_types] ([game_type_id]);

-- Relaciones de sorteos
ALTER TABLE [dbo].[draws] 
    ADD CONSTRAINT [FK_draws_lotteries] 
    FOREIGN KEY ([lottery_id]) 
    REFERENCES [dbo].[lotteries] ([lottery_id]);

ALTER TABLE [dbo].[results] 
    ADD CONSTRAINT [FK_results_draws] 
    FOREIGN KEY ([draw_id]) 
    REFERENCES [dbo].[draws] ([draw_id]);

ALTER TABLE [dbo].[results] 
    ADD CONSTRAINT [FK_results_users] 
    FOREIGN KEY ([user_id]) 
    REFERENCES [dbo].[users] ([user_id]);

-- Relaciones de permisos
ALTER TABLE [dbo].[role_permissions] 
    ADD CONSTRAINT [FK_role_permissions_roles] 
    FOREIGN KEY ([role_id]) 
    REFERENCES [dbo].[roles] ([role_id]);

ALTER TABLE [dbo].[role_permissions] 
    ADD CONSTRAINT [FK_role_permissions_permissions] 
    FOREIGN KEY ([permission_id]) 
    REFERENCES [dbo].[permissions] ([permission_id]);

-- Relaciones de usuarios
ALTER TABLE [dbo].[users] 
    ADD CONSTRAINT [FK_users_roles] 
    FOREIGN KEY ([role_id]) 
    REFERENCES [dbo].[roles] ([role_id]);

-- Relaciones de betting_pools
ALTER TABLE [dbo].[betting_pools] 
    ADD CONSTRAINT [FK_betting_pools_zones] 
    FOREIGN KEY ([zone_id]) 
    REFERENCES [dbo].[zones] ([zone_id]);

ALTER TABLE [dbo].[betting_pools] 
    ADD CONSTRAINT [FK_betting_pools_banks] 
    FOREIGN KEY ([bank_id]) 
    REFERENCES [dbo].[banks] ([bank_id]);

ALTER TABLE [dbo].[balances]
    ADD CONSTRAINT [FK_balances_betting_pools]
    FOREIGN KEY ([betting_pool_id])
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_config] 
    ADD CONSTRAINT [FK_config_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_print_config] 
    ADD CONSTRAINT [FK_print_config_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_discount_config] 
    ADD CONSTRAINT [FK_discount_config_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_automatic_expenses] 
    ADD CONSTRAINT [FK_expenses_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_footers] 
    ADD CONSTRAINT [FK_footers_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_prizes_commissions] 
    ADD CONSTRAINT [FK_prizes_comm_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_prizes_commissions] 
    ADD CONSTRAINT [FK_prizes_comm_lotteries] 
    FOREIGN KEY ([lottery_id]) 
    REFERENCES [dbo].[lotteries] ([lottery_id]);

ALTER TABLE [dbo].[betting_pool_schedules] 
    ADD CONSTRAINT [FK_schedules_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_sortitions] 
    ADD CONSTRAINT [FK_sortitions_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_styles] 
    ADD CONSTRAINT [FK_styles_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_draws] 
    ADD CONSTRAINT [FK_pool_draws_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[betting_pool_draws] 
    ADD CONSTRAINT [FK_pool_draws_draws] 
    FOREIGN KEY ([draw_id]) 
    REFERENCES [dbo].[draws] ([draw_id]);

-- Relaciones N:M
ALTER TABLE [dbo].[user_betting_pools] 
    ADD CONSTRAINT [FK_user_pools_users] 
    FOREIGN KEY ([user_id]) 
    REFERENCES [dbo].[users] ([user_id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[user_betting_pools] 
    ADD CONSTRAINT [FK_user_pools_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[user_zones] 
    ADD CONSTRAINT [FK_user_zones_users] 
    FOREIGN KEY ([user_id]) 
    REFERENCES [dbo].[users] ([user_id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[user_zones] 
    ADD CONSTRAINT [FK_user_zones_zones] 
    FOREIGN KEY ([zone_id]) 
    REFERENCES [dbo].[zones] ([zone_id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[user_permissions] 
    ADD CONSTRAINT [FK_user_permissions_users] 
    FOREIGN KEY ([user_id]) 
    REFERENCES [dbo].[users] ([user_id]);

ALTER TABLE [dbo].[user_permissions] 
    ADD CONSTRAINT [FK_user_permissions_permissions] 
    FOREIGN KEY ([permission_id]) 
    REFERENCES [dbo].[permissions] ([permission_id]);

-- Relaciones de tickets (REFACTORIZADO)
ALTER TABLE [dbo].[tickets] 
    ADD CONSTRAINT [FK_tickets_users] 
    FOREIGN KEY ([user_id]) 
    REFERENCES [dbo].[users] ([user_id]);

ALTER TABLE [dbo].[tickets] 
    ADD CONSTRAINT [FK_tickets_betting_pools] 
    FOREIGN KEY ([betting_pool_id]) 
    REFERENCES [dbo].[betting_pools] ([betting_pool_id]);

ALTER TABLE [dbo].[tickets] 
    ADD CONSTRAINT [FK_tickets_cancelled_by] 
    FOREIGN KEY ([cancelled_by]) 
    REFERENCES [dbo].[users] ([user_id]);

ALTER TABLE [dbo].[tickets] 
    ADD CONSTRAINT [FK_tickets_paid_by] 
    FOREIGN KEY ([paid_by]) 
    REFERENCES [dbo].[users] ([user_id]);

-- Relaciones de ticket_lines (REFACTORIZADO)
ALTER TABLE [dbo].[ticket_lines] 
    ADD CONSTRAINT [FK_ticket_lines_tickets] 
    FOREIGN KEY ([ticket_id]) 
    REFERENCES [dbo].[tickets] ([ticket_id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[ticket_lines] 
    ADD CONSTRAINT [FK_ticket_lines_lotteries] 
    FOREIGN KEY ([lottery_id]) 
    REFERENCES [dbo].[lotteries] ([lottery_id]);

ALTER TABLE [dbo].[ticket_lines] 
    ADD CONSTRAINT [FK_ticket_lines_draws] 
    FOREIGN KEY ([draw_id]) 
    REFERENCES [dbo].[draws] ([draw_id]);

ALTER TABLE [dbo].[ticket_lines] 
    ADD CONSTRAINT [FK_ticket_lines_game_types] 
    FOREIGN KEY ([bet_type_id]) 
    REFERENCES [dbo].[game_types] ([game_type_id]);

-- Relaciones de premios
ALTER TABLE [dbo].[prizes] 
    ADD CONSTRAINT [FK_prizes_results] 
    FOREIGN KEY ([result_id]) 
    REFERENCES [dbo].[results] ([result_id]);

ALTER TABLE [dbo].[prizes] 
    ADD CONSTRAINT [FK_prizes_ticket_lines] 
    FOREIGN KEY ([line_id]) 
    REFERENCES [dbo].[ticket_lines] ([line_id]);

PRINT '✅ Todas las foreign keys creadas exitosamente';
GO

-- =============================================
-- SECCIÓN 9B: CRITICAL NEW TABLES (Added 2025-10-22)
-- =============================================

PRINT '';
PRINT '🔥 Creando tablas críticas adicionales...';
GO

-- A. limit_rules: Define betting limits per lottery/draw/number
CREATE TABLE [dbo].[limit_rules] (
    [limit_rule_id] int NOT NULL IDENTITY(1,1),
    [rule_name] nvarchar(100) NOT NULL,
    [lottery_id] int NULL, -- NULL = applies to all lotteries
    [draw_id] int NULL, -- NULL = applies to all draws
    [game_type_id] int NULL, -- NULL = applies to all game types
    [bet_number_pattern] varchar(50) NULL, -- NULL or pattern like '00' for all numbers ending in 00
    [max_bet_per_number] decimal(18,2) NULL, -- Maximum bet amount for a single number
    [max_bet_per_ticket] decimal(18,2) NULL, -- Maximum bet per ticket
    [max_bet_per_betting_pool] decimal(18,2) NULL, -- Maximum per betting pool per draw
    [max_bet_global] decimal(18,2) NULL, -- Global limit across all betting pools
    [is_active] bit NOT NULL DEFAULT 1,
    [priority] int NULL DEFAULT 100, -- Lower number = higher priority
    [effective_from] datetime2 NULL,
    [effective_to] datetime2 NULL,
    -- Auditoría
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_limit_rules] PRIMARY KEY ([limit_rule_id]),
    -- ADDED: 2025-10-22 - Ensure all limit amounts are non-negative
    CONSTRAINT [CHK_limit_max_bet_per_number] CHECK ([max_bet_per_number] IS NULL OR [max_bet_per_number] >= 0),
    CONSTRAINT [CHK_limit_max_bet_per_ticket] CHECK ([max_bet_per_ticket] IS NULL OR [max_bet_per_ticket] >= 0),
    CONSTRAINT [CHK_limit_max_bet_per_pool] CHECK ([max_bet_per_betting_pool] IS NULL OR [max_bet_per_betting_pool] >= 0),
    CONSTRAINT [CHK_limit_max_bet_global] CHECK ([max_bet_global] IS NULL OR [max_bet_global] >= 0)
);

CREATE INDEX [IX_limit_rules_lottery_draw] ON [dbo].[limit_rules] ([lottery_id], [draw_id], [is_active]);
CREATE INDEX [IX_limit_rules_active_priority] ON [dbo].[limit_rules] ([is_active], [priority]);
GO

-- B. limit_consumption: Track limit usage in real-time
CREATE TABLE [dbo].[limit_consumption] (
    [consumption_id] bigint NOT NULL IDENTITY(1,1),
    [limit_rule_id] int NOT NULL,
    [lottery_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [draw_date] date NOT NULL,
    [bet_number] varchar(20) NOT NULL,
    [betting_pool_id] int NULL, -- NULL for global tracking
    [current_amount] decimal(18,2) NOT NULL DEFAULT 0.00,
    [bet_count] int NOT NULL DEFAULT 0,
    [last_bet_at] datetime2 NULL,
    [is_near_limit] bit NOT NULL DEFAULT 0, -- Auto-calculated: > 80% of limit
    [is_at_limit] bit NOT NULL DEFAULT 0, -- Auto-calculated: >= 100% of limit
    -- Auditoría
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_limit_consumption] PRIMARY KEY ([consumption_id]),
    CONSTRAINT [UQ_limit_consumption] UNIQUE ([limit_rule_id], [lottery_id], [draw_id], [draw_date], [bet_number], [betting_pool_id]),
    -- ADDED: 2025-10-22 - Ensure amounts are non-negative
    CONSTRAINT [CHK_consumption_current_amount] CHECK ([current_amount] >= 0),
    CONSTRAINT [CHK_consumption_bet_count] CHECK ([bet_count] >= 0)
);

CREATE INDEX [IX_limit_consumption_draw_number] ON [dbo].[limit_consumption] ([draw_id], [draw_date], [bet_number]);
CREATE INDEX [IX_limit_consumption_near_limit] ON [dbo].[limit_consumption] ([is_near_limit], [is_at_limit]);
GO

-- C. hot_numbers: Track numbers approaching limits (denormalized for performance)
CREATE TABLE [dbo].[hot_numbers] (
    [hot_number_id] bigint NOT NULL IDENTITY(1,1),
    [lottery_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [draw_date] date NOT NULL,
    [bet_number] varchar(20) NOT NULL,
    [total_bet_amount] decimal(18,2) NOT NULL DEFAULT 0.00,
    [bet_count] int NOT NULL DEFAULT 0,
    [unique_tickets] int NOT NULL DEFAULT 0,
    [unique_betting_pools] int NOT NULL DEFAULT 0,
    [limit_percentage] decimal(5,2) NULL, -- % of limit consumed (if limit exists)
    [is_near_limit] bit NOT NULL DEFAULT 0,
    [is_at_limit] bit NOT NULL DEFAULT 0,
    [last_updated] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_hot_numbers] PRIMARY KEY ([hot_number_id]),
    CONSTRAINT [UQ_hot_numbers] UNIQUE ([lottery_id], [draw_id], [draw_date], [bet_number]),
    -- ADDED: 2025-10-22 - Ensure values are non-negative
    CONSTRAINT [CHK_hot_total_bet] CHECK ([total_bet_amount] >= 0),
    CONSTRAINT [CHK_hot_bet_count] CHECK ([bet_count] >= 0),
    CONSTRAINT [CHK_hot_unique_tickets] CHECK ([unique_tickets] >= 0),
    CONSTRAINT [CHK_hot_limit_percentage] CHECK ([limit_percentage] IS NULL OR ([limit_percentage] >= 0 AND [limit_percentage] <= 200))
);

CREATE INDEX [IX_hot_numbers_draw_date] ON [dbo].[hot_numbers] ([draw_id], [draw_date]);
CREATE INDEX [IX_hot_numbers_limits] ON [dbo].[hot_numbers] ([is_near_limit], [is_at_limit]);
CREATE INDEX [IX_hot_numbers_amount] ON [dbo].[hot_numbers] ([draw_date], [total_bet_amount] DESC);
GO

-- D. error_logs: System error logging
CREATE TABLE [dbo].[error_logs] (
    [error_log_id] bigint NOT NULL IDENTITY(1,1),
    [error_source] varchar(100) NOT NULL, -- 'SP', 'TRIGGER', 'APPLICATION', 'API'
    [error_procedure] varchar(200) NULL, -- Stored procedure or function name
    [error_number] int NULL,
    [error_severity] int NULL,
    [error_state] int NULL,
    [error_message] nvarchar(max) NULL,
    [error_line] int NULL,
    [additional_info] nvarchar(max) NULL, -- JSON with context
    [user_id] int NULL,
    [betting_pool_id] int NULL,
    [ticket_id] bigint NULL,
    [session_id] varchar(100) NULL,
    [ip_address] varchar(50) NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_error_logs] PRIMARY KEY ([error_log_id])
);

CREATE INDEX [IX_error_logs_created] ON [dbo].[error_logs] ([created_at] DESC);
CREATE INDEX [IX_error_logs_source] ON [dbo].[error_logs] ([error_source], [created_at] DESC);
CREATE INDEX [IX_error_logs_user] ON [dbo].[error_logs] ([user_id], [created_at] DESC) WHERE [user_id] IS NOT NULL;
GO

-- E. audit_log: Comprehensive audit trail for all critical operations
CREATE TABLE [dbo].[audit_log] (
    [audit_id] bigint NOT NULL IDENTITY(1,1),
    [table_name] varchar(100) NOT NULL,
    [operation_type] varchar(20) NOT NULL, -- INSERT, UPDATE, DELETE
    [record_id] varchar(100) NOT NULL, -- Primary key value
    [old_values] nvarchar(max) NULL, -- JSON before change
    [new_values] nvarchar(max) NULL, -- JSON after change
    [changed_fields] varchar(max) NULL, -- Comma-separated list
    [user_id] int NULL,
    [username] varchar(50) NULL,
    [betting_pool_id] int NULL,
    [ip_address] varchar(50) NULL,
    [application] varchar(100) NULL,
    [operation_reason] nvarchar(500) NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_audit_log] PRIMARY KEY ([audit_id]),
    CONSTRAINT [CHK_audit_operation] CHECK ([operation_type] IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX [IX_audit_log_created] ON [dbo].[audit_log] ([created_at] DESC);
CREATE INDEX [IX_audit_log_table] ON [dbo].[audit_log] ([table_name], [created_at] DESC);
CREATE INDEX [IX_audit_log_user] ON [dbo].[audit_log] ([user_id], [created_at] DESC) WHERE [user_id] IS NOT NULL;
CREATE INDEX [IX_audit_log_record] ON [dbo].[audit_log] ([table_name], [record_id]);
GO

-- F. financial_transactions: All money movements (balance changes, payments, etc.)
CREATE TABLE [dbo].[financial_transactions] (
    [transaction_id] bigint NOT NULL IDENTITY(1,1),
    [transaction_type] varchar(50) NOT NULL, -- SALE, PRIZE_PAYMENT, RECHARGE, COMMISSION, ADJUSTMENT, TRANSFER
    [betting_pool_id] int NULL,
    [user_id] int NULL,
    [ticket_id] bigint NULL,
    [related_transaction_id] bigint NULL, -- For reversals or linked transactions
    [amount] decimal(18,2) NOT NULL,
    [balance_before] decimal(18,2) NULL,
    [balance_after] decimal(18,2) NULL,
    [currency] varchar(10) NOT NULL DEFAULT 'DOP',
    [payment_method] varchar(50) NULL, -- CASH, TRANSFER, CHECK, CARD
    [reference_number] varchar(100) NULL,
    [description] nvarchar(500) NULL,
    [status] varchar(20) NOT NULL DEFAULT 'completed', -- pending, completed, failed, reversed
    [is_reversed] bit NOT NULL DEFAULT 0,
    [reversed_by_transaction_id] bigint NULL,
    [reversed_at] datetime2 NULL,
    -- Auditoría
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [approved_by] int NULL,
    [approved_at] datetime2 NULL,
    CONSTRAINT [PK_financial_transactions] PRIMARY KEY ([transaction_id]),
    CONSTRAINT [CHK_transaction_status] CHECK ([status] IN ('pending', 'completed', 'failed', 'reversed')),
    CONSTRAINT [CHK_transaction_type] CHECK ([transaction_type] IN ('SALE', 'PRIZE_PAYMENT', 'RECHARGE', 'COMMISSION', 'ADJUSTMENT', 'TRANSFER', 'REVERSAL'))
);

CREATE INDEX [IX_financial_transactions_created] ON [dbo].[financial_transactions] ([created_at] DESC);
CREATE INDEX [IX_financial_transactions_pool] ON [dbo].[financial_transactions] ([betting_pool_id], [created_at] DESC) WHERE [betting_pool_id] IS NOT NULL;
CREATE INDEX [IX_financial_transactions_user] ON [dbo].[financial_transactions] ([user_id], [created_at] DESC) WHERE [user_id] IS NOT NULL;
CREATE INDEX [IX_financial_transactions_ticket] ON [dbo].[financial_transactions] ([ticket_id]) WHERE [ticket_id] IS NOT NULL;
CREATE INDEX [IX_financial_transactions_type] ON [dbo].[financial_transactions] ([transaction_type], [created_at] DESC);
CREATE INDEX [IX_financial_transactions_status] ON [dbo].[financial_transactions] ([status], [created_at] DESC) WHERE [status] <> 'completed';
GO

PRINT '✅ Tablas críticas adicionales creadas:';
PRINT '   • limit_rules (Reglas de límites de apuestas)';
PRINT '   • limit_consumption (Consumo de límites en tiempo real)';
PRINT '   • hot_numbers (Números cerca del límite)';
PRINT '   • error_logs (Registro de errores del sistema)';
PRINT '   • audit_log (Auditoría completa de operaciones)';
PRINT '   • financial_transactions (Movimientos financieros)';
GO

-- =============================================
-- SECCIÓN 10: STORED PROCEDURES DE PERMISOS
-- =============================================

PRINT '';
PRINT '📋 Creando stored procedures de gestión de permisos...';
GO

-- SP: Otorgar permiso directo a usuario
CREATE OR ALTER PROCEDURE sp_GrantPermissionToUser
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

-- SP: Revocar permiso directo de usuario
CREATE OR ALTER PROCEDURE sp_RevokePermissionFromUser
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

-- SP: Ver todos los permisos de un usuario (directos + por rol)
CREATE OR ALTER PROCEDURE sp_GetUserPermissions
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

-- SP: Obtener usuarios con un permiso específico
CREATE OR ALTER PROCEDURE sp_GetUsersWithPermission
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

-- Función: Verificar si un usuario tiene un permiso
CREATE OR ALTER FUNCTION fn_UserHasPermission
(
    @user_id INT,
    @permission_code NVARCHAR(100)
)
RETURNS BIT
AS
BEGIN
    DECLARE @has_permission BIT = 0;
    
    -- Verificar permiso DIRECTO
    IF EXISTS (
        SELECT 1 
        FROM user_permissions up
        INNER JOIN permissions p ON up.permission_id = p.permission_id
        WHERE up.user_id = @user_id
        AND p.permission_code = @permission_code
        AND up.is_active = 1
        AND (up.expires_at IS NULL OR up.expires_at > GETDATE())
    )
    BEGIN
        SET @has_permission = 1;
    END
    ELSE
    BEGIN
        -- Verificar permiso POR ROL
        IF EXISTS (
            SELECT 1 
            FROM users u
            INNER JOIN roles r ON u.role_id = r.role_id
            INNER JOIN role_permissions rp ON r.role_id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE u.user_id = @user_id
            AND p.permission_code = @permission_code
            AND rp.is_active = 1
        )
        BEGIN
            SET @has_permission = 1;
        END
    END
    
    RETURN @has_permission;
END;
GO

-- SP: Otorgar múltiples permisos a usuario
CREATE OR ALTER PROCEDURE sp_GrantMultiplePermissions
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

-- SP: Expirar permisos vencidos (ejecutar periódicamente)
CREATE OR ALTER PROCEDURE sp_ExpireOldPermissions
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

PRINT '✅ Stored procedures de permisos creados exitosamente';
GO

-- =============================================
-- STORED PROCEDURES PARA COPIAR CONFIGURACIONES DE BANCAS
-- =============================================

PRINT '';
PRINT '📋 Creando stored procedures para copiar configuraciones de bancas...';
GO

-- SP: Copiar toda la configuración de una banca a otra
-- IMPROVED: 2025-10-22 - Added validation to prevent source = target and comprehensive error handling
CREATE OR ALTER PROCEDURE sp_CopyBettingPoolConfig
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

-- SP: Copiar solo una sección específica
CREATE OR ALTER PROCEDURE sp_CopyBettingPoolSection
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

PRINT '✅ Stored procedures de copia de configuración creados';
GO

-- =============================================
-- STORED PROCEDURES PARA SISTEMA DE TICKETS
-- =============================================

PRINT '';
PRINT '🎫 Creando stored procedures para sistema de tickets...';
GO

-- ============================================================================
-- SP: Calcular totales de un ticket
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_CalculateTicketTotals
    @ticket_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Calcular totales desde las líneas
        UPDATE t
        SET 
            t.total_lines = line_totals.line_count,
            t.total_bet_amount = line_totals.bet_total,
            t.total_discount = line_totals.discount_total,
            t.total_subtotal = line_totals.subtotal_total,
            t.total_with_multiplier = line_totals.multiplier_total,
            t.total_commission = line_totals.commission_total,
            t.total_net = line_totals.net_total,
            t.grand_total = line_totals.net_total,
            t.total_prize = line_totals.prize_total,
            t.winning_lines = line_totals.winner_count,
            t.updated_at = GETDATE()
        FROM tickets t
        CROSS APPLY (
            SELECT 
                COUNT(*) as line_count,
                SUM(bet_amount) as bet_total,
                SUM(discount_amount) as discount_total,
                SUM(subtotal) as subtotal_total,
                SUM(total_with_multiplier) as multiplier_total,
                SUM(commission_amount) as commission_total,
                SUM(net_amount) as net_total,
                SUM(prize_amount) as prize_total,
                SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as winner_count
            FROM ticket_lines
            WHERE ticket_id = @ticket_id
        ) line_totals
        WHERE t.ticket_id = @ticket_id;
        
        PRINT '✅ Totales calculados para ticket ' + CAST(@ticket_id AS VARCHAR);
        RETURN 0;
        
    END TRY
    BEGIN CATCH
        PRINT '❌ Error calculando totales: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO

-- ============================================================================
-- SP: Cancelar un ticket
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_CancelTicket
    @ticket_id BIGINT,
    @cancelled_by INT,
    @cancellation_reason NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar que el ticket existe y no está cancelado
        IF NOT EXISTS (
            SELECT 1 FROM tickets 
            WHERE ticket_id = @ticket_id 
            AND is_cancelled = 0
            AND status NOT IN ('paid', 'cancelled')
        )
        BEGIN
            RAISERROR('Ticket no válido para cancelación', 16, 1);
            RETURN -1;
        END
        
        -- Cancelar ticket
        UPDATE tickets
        SET 
            is_cancelled = 1,
            cancelled_at = GETDATE(),
            cancelled_by = @cancelled_by,
            cancellation_reason = @cancellation_reason,
            status = 'cancelled',
            updated_at = GETDATE()
        WHERE ticket_id = @ticket_id;
        
        -- Cancelar todas las líneas
        UPDATE ticket_lines
        SET 
            line_status = 'cancelled',
            updated_at = GETDATE()
        WHERE ticket_id = @ticket_id;
        
        COMMIT TRANSACTION;
        
        PRINT '✅ Ticket ' + CAST(@ticket_id AS VARCHAR) + ' cancelado exitosamente';
        RETURN 0;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        PRINT '❌ Error cancelando ticket: ' + ERROR_MESSAGE();
        RETURN -1;
    END CATCH
END;
GO

-- ============================================================================
-- SP: Verificar números ganadores en un ticket
-- IMPROVED: 2025-10-22 - Added comprehensive validation and error handling
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_CheckTicketWinners
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

-- ============================================================================
-- SP: Registrar pago de premio
-- IMPROVED: 2025-10-22 - Added comprehensive validation and financial transaction logging
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_PayTicketPrize
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

-- ============================================================================
-- SP: Obtener ventas por número (para límites)
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_GetNumberSales
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

PRINT '✅ Stored procedures de tickets creados';
PRINT '   • sp_CalculateTicketTotals';
PRINT '   • sp_CancelTicket';
PRINT '   • sp_CheckTicketWinners';
PRINT '   • sp_PayTicketPrize';
PRINT '   • sp_GetNumberSales';
GO

-- =============================================
-- SECCIÓN 11: VISTAS ÚTILES
-- =============================================

PRINT '';
PRINT '👁️ Creando vistas útiles...';
GO

-- Vista: Usuarios con sus permisos directos
CREATE OR ALTER VIEW vw_users_with_direct_permissions AS
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

-- Vista: Resumen de permisos por usuario
CREATE OR ALTER VIEW vw_user_permissions_summary AS
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

-- Vista: Permisos que están por expirar
CREATE OR ALTER VIEW vw_expiring_permissions AS
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

-- Vista: Usuarios con múltiples bancas
CREATE OR ALTER VIEW vw_users_multiple_betting_pools AS
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

-- Vista: Usuarios con múltiples zonas
CREATE OR ALTER VIEW vw_users_multiple_zones AS
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

-- Vista: Configuración completa de una banca
CREATE OR ALTER VIEW vw_betting_pool_complete_config AS
SELECT 
    bp.betting_pool_id,
    bp.betting_pool_code,
    bp.betting_pool_name,
    z.zone_name,
    b.bank_name,
    bp.address,
    bp.phone,
    bp.location,
    bp.reference,
    bp.is_active,
    -- Configuración general
    cfg.fall_type,
    cfg.deactivation_balance,
    cfg.daily_sale_limit,
    cfg.daily_balance_limit,
    cfg.credit_limit,
    cfg.control_winning_tickets,
    cfg.allow_jackpot,
    cfg.enable_recharges,
    cfg.cancel_minutes,
    cfg.payment_mode,
    -- Configuración de impresión
    pc.print_mode,
    pc.print_enabled,
    pc.print_ticket_copy,
    pc.sms_only,
    -- Configuración de descuentos
    dc.discount_provider,
    dc.discount_mode,
    -- Estilos
    st.sales_point_style,
    st.print_style,
    -- Balance actual
    bal.current_balance,
    -- Cantidad de sorteos activos
    (SELECT COUNT(*) FROM betting_pool_draws bpd 
     WHERE bpd.betting_pool_id = bp.betting_pool_id AND bpd.is_active = 1) as active_draws_count,
    -- Cantidad de configuraciones de premios
    (SELECT COUNT(*) FROM betting_pool_prizes_commissions bppc 
     WHERE bppc.betting_pool_id = bp.betting_pool_id AND bppc.is_active = 1) as prizes_config_count
FROM betting_pools bp
LEFT JOIN zones z ON bp.zone_id = z.zone_id
LEFT JOIN banks b ON bp.bank_id = b.bank_id
LEFT JOIN betting_pool_config cfg ON bp.betting_pool_id = cfg.betting_pool_id
LEFT JOIN betting_pool_print_config pc ON bp.betting_pool_id = pc.betting_pool_id
LEFT JOIN betting_pool_discount_config dc ON bp.betting_pool_id = dc.betting_pool_id
LEFT JOIN betting_pool_styles st ON bp.betting_pool_id = st.betting_pool_id
LEFT JOIN balances bal ON bp.betting_pool_id = bal.betting_pool_id;
GO

-- Vista: Tickets con información completa
CREATE OR ALTER VIEW vw_tickets_complete AS
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

-- Vista: Ventas por número (Hot Numbers)
CREATE OR ALTER VIEW vw_hot_numbers_today AS
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

-- Vista: Tickets ganadores pendientes de pago
CREATE OR ALTER VIEW vw_pending_winners AS
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

-- Vista: Resumen de ventas del día por banca
CREATE OR ALTER VIEW vw_daily_sales_by_betting_pool AS
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

PRINT '✅ Vistas de tickets creadas';
PRINT '   • vw_tickets_complete';
PRINT '   • vw_hot_numbers_today';
PRINT '   • vw_pending_winners';
PRINT '   • vw_daily_sales_by_betting_pool';
GO

PRINT '✅ Vistas creadas exitosamente';
GO

-- =============================================
-- SECCIÓN 12: TRIGGERS DE AUDITORÍA
-- =============================================

PRINT '';
PRINT '⚡ Creando triggers de auditoría...';
GO

-- Trigger: Auditoría de INSERT en user_permissions
CREATE OR ALTER TRIGGER trg_user_permissions_insert
ON [dbo].[user_permissions]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE up 
    SET created_by = COALESCE(up.created_by, dbo.fn_GetCurrentUserId()),
        created_at = COALESCE(up.created_at, GETDATE()),
        granted_by = COALESCE(up.granted_by, dbo.fn_GetCurrentUserId())
    FROM [dbo].[user_permissions] up 
    INNER JOIN inserted i ON up.user_permission_id = i.user_permission_id;
END;
GO

-- Trigger: Auditoría de UPDATE en user_permissions
CREATE OR ALTER TRIGGER trg_user_permissions_update
ON [dbo].[user_permissions]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE up 
    SET updated_at = GETDATE(),
        updated_by = dbo.fn_GetCurrentUserId()
    FROM [dbo].[user_permissions] up 
    INNER JOIN inserted i ON up.user_permission_id = i.user_permission_id;
END;
GO

-- Trigger: Auditoría de usuarios
CREATE OR ALTER TRIGGER trg_users_update
ON [dbo].[users]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u
    SET updated_at = GETDATE(),
        updated_by = dbo.fn_GetCurrentUserId()
    FROM [dbo].[users] u
    INNER JOIN inserted i ON u.user_id = i.user_id;
END;
GO

PRINT '✅ Triggers de auditoría creados';
GO

-- =============================================
-- SECCIÓN 13: ÍNDICES ADICIONALES
-- =============================================

PRINT '';
PRINT '🔍 Creando índices para optimización...';
GO

-- Índices en tablas de búsqueda frecuente
CREATE NONCLUSTERED INDEX IX_tickets_betting_pool_created 
    ON [dbo].[tickets] ([betting_pool_id], [created_at] DESC);

CREATE NONCLUSTERED INDEX IX_tickets_user_created 
    ON [dbo].[tickets] ([user_id], [created_at] DESC);

CREATE NONCLUSTERED INDEX IX_ticket_lines_draw 
    ON [dbo].[ticket_lines] ([draw_id], [created_at] DESC);

CREATE NONCLUSTERED INDEX IX_results_date 
    ON [dbo].[results] ([result_date] DESC);

CREATE NONCLUSTERED INDEX IX_user_permissions_active 
    ON [dbo].[user_permissions] ([user_id], [is_active]) 
    INCLUDE ([permission_id], [expires_at]);

CREATE NONCLUSTERED INDEX IX_user_betting_pools_active 
    ON [dbo].[user_betting_pools] ([user_id], [is_active]) 
    INCLUDE ([betting_pool_id], [is_primary]);

CREATE NONCLUSTERED INDEX IX_betting_pool_draws_active
    ON [dbo].[betting_pool_draws] ([betting_pool_id], [is_active])
    INCLUDE ([draw_id]);

-- ADDED: 2025-10-22 - Critical indexes for limit checking and winner queries
CREATE NONCLUSTERED INDEX IX_ticket_lines_limit_check
    ON [dbo].[ticket_lines] ([lottery_id], [draw_id], [draw_date], [bet_number])
    INCLUDE ([bet_amount]);

CREATE NONCLUSTERED INDEX IX_tickets_pool_date_status
    ON [dbo].[tickets] ([betting_pool_id], [created_at], [status])
    INCLUDE ([grand_total]);

CREATE NONCLUSTERED INDEX IX_ticket_lines_winners
    ON [dbo].[ticket_lines] ([line_status])
    INCLUDE ([line_id], [prize_amount])
    WHERE [line_status] IN ('winner', 'pending_payment');

CREATE NONCLUSTERED INDEX IX_results_draw_date
    ON [dbo].[results] ([draw_id], [result_date])
    INCLUDE ([winning_number], [position], [additional_number]);

PRINT '✅ Índices creados exitosamente';
PRINT '   • Índices básicos de búsqueda';
PRINT '   • Índices críticos para límites (IX_ticket_lines_limit_check)';
PRINT '   • Índices para ganadores (IX_ticket_lines_winners)';
PRINT '   • Índices para resultados (IX_results_draw_date)';
GO

-- =============================================
-- RESUMEN FINAL
-- =============================================

PRINT '';
PRINT '╔════════════════════════════════════════════════╗';
PRINT '║         INSTALACIÓN COMPLETADA                 ║';
PRINT '╚════════════════════════════════════════════════╝';
PRINT '';
PRINT '✅ TABLAS CREADAS:';
PRINT '   • 11 Tablas maestras y de sistema';
PRINT '   • 12 Tablas de betting pools y configuraciones';
PRINT '   • 3 Tablas de relación N:M (users)';
PRINT '   • 1 Tabla de relación N:M (betting_pools ↔ draws)';
PRINT '   • 3 Tablas de tickets REFACTORIZADAS (tickets, ticket_lines, game_types)';
PRINT '   • 1 Tabla de premios';
PRINT '   • Total: 31+ tablas';
PRINT '';
PRINT '✅ SISTEMA DE TICKETS REFACTORIZADO:';
PRINT '   • tickets (Cabecera con 45+ campos detallados)';
PRINT '   • ticket_lines (Líneas con 40+ campos por jugada)';
PRINT '   • game_types (Tipos de jugadas: Directo, Pale, Tripleta, etc.)';
PRINT '   • Estrategia: EVOLUCIÓN con COEXISTENCIA';
PRINT '   • Tablas legacy renombradas automáticamente';
PRINT '';
PRINT '✅ TABLAS DE CONFIGURACIÓN DE BANCAS (Refactorizadas):';
PRINT '   • betting_pools (Datos básicos - Tab General)';
PRINT '   • betting_pool_config (Configuración - Tab Configuración)';
PRINT '   • betting_pool_print_config (Configuración de impresión)';
PRINT '   • betting_pool_discount_config (Configuración de descuentos)';
PRINT '   • betting_pool_footers (Pies de página)';
PRINT '   • betting_pool_prizes_commissions (Premios & Comisiones)';
PRINT '   • betting_pool_schedules (Horarios de sorteos)';
PRINT '   • betting_pool_draws (Sorteos activos N:M)';
PRINT '   • betting_pool_styles (Estilos)';
PRINT '   • betting_pool_automatic_expenses (Gastos automáticos)';
PRINT '   • betting_pool_sortitions (Configuración adicional)';
PRINT '   • balances (Saldos)';
PRINT '';
PRINT '✅ RELACIONES:';
PRINT '   • users ↔ betting_pools: MUCHOS A MUCHOS ✓';
PRINT '   • users ↔ zones: MUCHOS A MUCHOS ✓';
PRINT '   • users ↔ permissions: MUCHOS A MUCHOS ✓';
PRINT '   • roles ↔ permissions: MUCHOS A MUCHOS ✓';
PRINT '   • betting_pools ↔ draws: MUCHOS A MUCHOS ✓';
PRINT '   • tickets → ticket_lines: UNO A MUCHOS (CASCADE DELETE) ✓';
PRINT '   • ticket_lines → lotteries, draws, game_types: MUCHOS A UNO ✓';
PRINT '   • betting_pools → config (1:1) ✓';
PRINT '   • betting_pools → print_config (1:1) ✓';
PRINT '   • betting_pools → discount_config (1:1) ✓';
PRINT '   • betting_pools → footers (1:1) ✓';
PRINT '   • betting_pools → styles (1:1) ✓';
PRINT '   • betting_pools → prizes_commissions (1:N por lotería/juego) ✓';
PRINT '';
PRINT '✅ STORED PROCEDURES:';
PRINT '   -- Gestión de Permisos:';
PRINT '   • sp_GrantPermissionToUser';
PRINT '   • sp_RevokePermissionFromUser';
PRINT '   • sp_GetUserPermissions';
PRINT '   • sp_GetUsersWithPermission';
PRINT '   • sp_GrantMultiplePermissions';
PRINT '   • sp_ExpireOldPermissions';
PRINT '   -- Copia de Configuraciones de Bancas:';
PRINT '   • sp_CopyBettingPoolConfig (Copiar toda la configuración)';
PRINT '   • sp_CopyBettingPoolSection (Copiar sección específica)';
PRINT '   -- Sistema de Tickets:';
PRINT '   • sp_CalculateTicketTotals (Recalcular totales)';
PRINT '   • sp_CancelTicket (Cancelar ticket con auditoría)';
PRINT '   • sp_CheckTicketWinners (Verificar ganadores)';
PRINT '   • sp_PayTicketPrize (Registrar pago de premio)';
PRINT '   • sp_GetNumberSales (Consultar ventas por número)';
PRINT '';
PRINT '✅ FUNCIONES:';
PRINT '   • fn_GetCurrentUserId()';
PRINT '   • fn_UserHasPermission()';
PRINT '';
PRINT '✅ VISTAS:';
PRINT '   -- Permisos:';
PRINT '   • vw_users_with_direct_permissions';
PRINT '   • vw_user_permissions_summary';
PRINT '   • vw_expiring_permissions';
PRINT '   -- Relaciones:';
PRINT '   • vw_users_multiple_betting_pools';
PRINT '   • vw_users_multiple_zones';
PRINT '   -- Configuración:';
PRINT '   • vw_betting_pool_complete_config';
PRINT '   -- Tickets y Ventas:';
PRINT '   • vw_tickets_complete';
PRINT '   • vw_hot_numbers_today';
PRINT '   • vw_pending_winners';
PRINT '   • vw_daily_sales_by_betting_pool';
PRINT '';
PRINT '✅ CARACTERÍSTICAS:';
PRINT '   • Permisos directos + por rol';
PRINT '   • Permisos temporales con expiración';
PRINT '   • Auditoría completa en todas las tablas';
PRINT '   • Soft delete en tablas críticas';
PRINT '   • Triggers automáticos';
PRINT '   • Configuración de bancas MODULAR (12 tablas separadas)';
PRINT '   • Sistema de tickets REFACTORIZADO con COEXISTENCIA';
PRINT '   • Copia de configuraciones por sección';
PRINT '   • Cálculo automático de totales, comisiones y premios';
PRINT '   • Validación de límites integrada';
PRINT '   • Sin duplicidad de datos';
PRINT '   • Relaciones N:M correctamente implementadas';
PRINT '';
PRINT '🎯 FUNCIONALIDAD DE COPIA DE CONFIGURACIÓN:';
PRINT '   -- Copiar toda la configuración:';
PRINT '   EXEC sp_CopyBettingPoolConfig @source=1, @target=2';
PRINT '';
PRINT '   -- Copiar solo una sección:';
PRINT '   EXEC sp_CopyBettingPoolSection @source=1, @target=2, @section=''PREMIOS''';
PRINT '';
PRINT '   -- Secciones disponibles:';
PRINT '   • CONFIGURACION (Config general, impresión, descuentos)';
PRINT '   • PIES (Pies de página)';
PRINT '   • PREMIOS (Premios y comisiones)';
PRINT '   • HORARIOS (Horarios de sorteos)';
PRINT '   • SORTEOS (Sorteos activos)';
PRINT '   • ESTILOS (Estilos visuales)';
PRINT '   • GASTOS (Gastos automáticos)';
PRINT '';
PRINT '🎫 FUNCIONALIDAD DE TICKETS:';
PRINT '   -- Calcular totales de un ticket:';
PRINT '   EXEC sp_CalculateTicketTotals @ticket_id=1';
PRINT '';
PRINT '   -- Cancelar un ticket:';
PRINT '   EXEC sp_CancelTicket @ticket_id=1, @cancelled_by=10, @reason=''Error''';
PRINT '';
PRINT '   -- Verificar ganadores:';
PRINT '   EXEC sp_CheckTicketWinners @ticket_id=1';
PRINT '';
PRINT '   -- Pagar premio:';
PRINT '   EXEC sp_PayTicketPrize @ticket_id=1, @paid_by=10, @method=''efectivo''';
PRINT '';
PRINT '📚 PRÓXIMOS PASOS:';
PRINT '   1. Insertar datos maestros (countries, zones, banks)';
PRINT '   2. Crear roles base (Admin, Supervisor, Vendedor)';
PRINT '   3. Definir permisos del sistema';
PRINT '   4. Asignar permisos a roles';
PRINT '   5. Crear usuarios iniciales';
PRINT '';
PRINT '🎉 ¡Sistema listo para usar!';
PRINT '';
GO
