-- ============================================
-- Lottery Database - Complete Schema
-- Generated: 2025-11-01 17:36:32
-- Tables: 47 | Stored Procedures: 11 | Views: 9
-- ============================================
-- Server: lottery-sql-1505.database.windows.net
-- Database: lottery-db
-- ============================================

USE [lottery-db];
GO

-- ============================================
-- DROP EXISTING OBJECTS
-- ============================================

-- Drop foreign keys first
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_balances_betting_pools')
    ALTER TABLE [balances] DROP CONSTRAINT [FK_balances_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_banca_prize_configs_betting_pool')
    ALTER TABLE [banca_prize_configs] DROP CONSTRAINT [FK_banca_prize_configs_betting_pool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_banca_prize_configs_prize_field')
    ALTER TABLE [banca_prize_configs] DROP CONSTRAINT [FK_banca_prize_configs_prize_field];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_expenses_betting_pools')
    ALTER TABLE [betting_pool_automatic_expenses] DROP CONSTRAINT [FK_expenses_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BettingPoolConfig_BettingPool')
    ALTER TABLE [betting_pool_config] DROP CONSTRAINT [FK_BettingPoolConfig_BettingPool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BettingPoolDiscountConfig_BettingPool')
    ALTER TABLE [betting_pool_discount_config] DROP CONSTRAINT [FK_BettingPoolDiscountConfig_BettingPool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_sorteo_created_by')
    ALTER TABLE [betting_pool_draw_config] DROP CONSTRAINT [FK_config_sorteo_created_by];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_sorteo_updated_by')
    ALTER TABLE [betting_pool_draw_config] DROP CONSTRAINT [FK_config_sorteo_updated_by];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_betting_pool')
    ALTER TABLE [betting_pool_draw_config] DROP CONSTRAINT [FK_pool_draw_config_betting_pool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_draw')
    ALTER TABLE [betting_pool_draw_config] DROP CONSTRAINT [FK_pool_draw_config_draw];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_prize_field')
    ALTER TABLE [betting_pool_draw_config] DROP CONSTRAINT [FK_pool_draw_config_prize_field];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draws_betting_pool')
    ALTER TABLE [betting_pool_draws] DROP CONSTRAINT [FK_pool_draws_betting_pool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draws_betting_pools')
    ALTER TABLE [betting_pool_draws] DROP CONSTRAINT [FK_pool_draws_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draws_draw')
    ALTER TABLE [betting_pool_draws] DROP CONSTRAINT [FK_pool_draws_draw];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draws_draws')
    ALTER TABLE [betting_pool_draws] DROP CONSTRAINT [FK_pool_draws_draws];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_general_created_by')
    ALTER TABLE [betting_pool_general_config] DROP CONSTRAINT [FK_config_general_created_by];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_general_updated_by')
    ALTER TABLE [betting_pool_general_config] DROP CONSTRAINT [FK_config_general_updated_by];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_general_config_betting_pool')
    ALTER TABLE [betting_pool_general_config] DROP CONSTRAINT [FK_pool_general_config_betting_pool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_general_config_prize_field')
    ALTER TABLE [betting_pool_general_config] DROP CONSTRAINT [FK_pool_general_config_prize_field];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BettingPoolPrintConfig_BettingPool')
    ALTER TABLE [betting_pool_print_config] DROP CONSTRAINT [FK_BettingPoolPrintConfig_BettingPool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prizes_comm_betting_pools')
    ALTER TABLE [betting_pool_prizes_commissions] DROP CONSTRAINT [FK_prizes_comm_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prizes_comm_lotteries')
    ALTER TABLE [betting_pool_prizes_commissions] DROP CONSTRAINT [FK_prizes_comm_lotteries];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_schedules_betting_pools')
    ALTER TABLE [betting_pool_schedules] DROP CONSTRAINT [FK_schedules_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_sortitions_betting_pools')
    ALTER TABLE [betting_pool_sortitions] DROP CONSTRAINT [FK_sortitions_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_styles_betting_pools')
    ALTER TABLE [betting_pool_styles] DROP CONSTRAINT [FK_styles_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_betting_pools_banks')
    ALTER TABLE [betting_pools] DROP CONSTRAINT [FK_betting_pools_banks];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_betting_pools_zones')
    ALTER TABLE [betting_pools] DROP CONSTRAINT [FK_betting_pools_zones];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_draw_prize_configs_betting_pool')
    ALTER TABLE [draw_prize_configs] DROP CONSTRAINT [FK_draw_prize_configs_betting_pool];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_draw_prize_configs_draw')
    ALTER TABLE [draw_prize_configs] DROP CONSTRAINT [FK_draw_prize_configs_draw];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_draw_prize_configs_prize_field')
    ALTER TABLE [draw_prize_configs] DROP CONSTRAINT [FK_draw_prize_configs_prize_field];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_draws_lotteries')
    ALTER TABLE [draws] DROP CONSTRAINT [FK_draws_lotteries];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_game_types_categories')
    ALTER TABLE [game_types] DROP CONSTRAINT [FK_game_types_categories];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lotteries_countries')
    ALTER TABLE [lotteries] DROP CONSTRAINT [FK_lotteries_countries];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__lottery_g__game___4F2895A9')
    ALTER TABLE [lottery_game_compatibility] DROP CONSTRAINT [FK__lottery_g__game___4F2895A9];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__lottery_g__lotte__4E347170')
    ALTER TABLE [lottery_game_compatibility] DROP CONSTRAINT [FK__lottery_g__lotte__4E347170];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_banca')
    ALTER TABLE [prize_changes_audit] DROP CONSTRAINT [FK_audit_premios_banca];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_campo')
    ALTER TABLE [prize_changes_audit] DROP CONSTRAINT [FK_audit_premios_campo];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_draw')
    ALTER TABLE [prize_changes_audit] DROP CONSTRAINT [FK_audit_premios_draw];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_user')
    ALTER TABLE [prize_changes_audit] DROP CONSTRAINT [FK_audit_premios_user];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prize_fields_bet_types')
    ALTER TABLE [prize_fields] DROP CONSTRAINT [FK_prize_fields_bet_types];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prizes_results')
    ALTER TABLE [prizes] DROP CONSTRAINT [FK_prizes_results];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prizes_ticket_lines')
    ALTER TABLE [prizes] DROP CONSTRAINT [FK_prizes_ticket_lines];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_results_draws')
    ALTER TABLE [results] DROP CONSTRAINT [FK_results_draws];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_role_permissions_permissions')
    ALTER TABLE [role_permissions] DROP CONSTRAINT [FK_role_permissions_permissions];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_role_permissions_roles')
    ALTER TABLE [role_permissions] DROP CONSTRAINT [FK_role_permissions_roles];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ticket_lines_draws')
    ALTER TABLE [ticket_lines] DROP CONSTRAINT [FK_ticket_lines_draws];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ticket_lines_game_types')
    ALTER TABLE [ticket_lines] DROP CONSTRAINT [FK_ticket_lines_game_types];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ticket_lines_lotteries')
    ALTER TABLE [ticket_lines] DROP CONSTRAINT [FK_ticket_lines_lotteries];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ticket_lines_tickets')
    ALTER TABLE [ticket_lines] DROP CONSTRAINT [FK_ticket_lines_tickets];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_tickets_betting_pools')
    ALTER TABLE [tickets] DROP CONSTRAINT [FK_tickets_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_tickets_users')
    ALTER TABLE [tickets] DROP CONSTRAINT [FK_tickets_users];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_betting_pools_betting_pools')
    ALTER TABLE [user_betting_pools] DROP CONSTRAINT [FK_user_betting_pools_betting_pools];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_betting_pools_users')
    ALTER TABLE [user_betting_pools] DROP CONSTRAINT [FK_user_betting_pools_users];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_permissions_permissions')
    ALTER TABLE [user_permissions] DROP CONSTRAINT [FK_user_permissions_permissions];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_permissions_users')
    ALTER TABLE [user_permissions] DROP CONSTRAINT [FK_user_permissions_users];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_zones_users')
    ALTER TABLE [user_zones] DROP CONSTRAINT [FK_user_zones_users];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_zones_zones')
    ALTER TABLE [user_zones] DROP CONSTRAINT [FK_user_zones_zones];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_created_by')
    ALTER TABLE [users] DROP CONSTRAINT [FK_users_created_by];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_deleted_by')
    ALTER TABLE [users] DROP CONSTRAINT [FK_users_deleted_by];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_roles')
    ALTER TABLE [users] DROP CONSTRAINT [FK_users_roles];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_updated_by')
    ALTER TABLE [users] DROP CONSTRAINT [FK_users_updated_by];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_zones_countries')
    ALTER TABLE [zones] DROP CONSTRAINT [FK_zones_countries];

-- Drop tables
IF OBJECT_ID('[zones]', 'U') IS NOT NULL DROP TABLE [zones];
IF OBJECT_ID('[users]', 'U') IS NOT NULL DROP TABLE [users];
IF OBJECT_ID('[user_zones_backup]', 'U') IS NOT NULL DROP TABLE [user_zones_backup];
IF OBJECT_ID('[user_zones]', 'U') IS NOT NULL DROP TABLE [user_zones];
IF OBJECT_ID('[user_permissions_backup]', 'U') IS NOT NULL DROP TABLE [user_permissions_backup];
IF OBJECT_ID('[user_permissions]', 'U') IS NOT NULL DROP TABLE [user_permissions];
IF OBJECT_ID('[user_betting_pools_backup]', 'U') IS NOT NULL DROP TABLE [user_betting_pools_backup];
IF OBJECT_ID('[user_betting_pools]', 'U') IS NOT NULL DROP TABLE [user_betting_pools];
IF OBJECT_ID('[tickets]', 'U') IS NOT NULL DROP TABLE [tickets];
IF OBJECT_ID('[ticket_lines]', 'U') IS NOT NULL DROP TABLE [ticket_lines];
IF OBJECT_ID('[roles]', 'U') IS NOT NULL DROP TABLE [roles];
IF OBJECT_ID('[role_permissions]', 'U') IS NOT NULL DROP TABLE [role_permissions];
IF OBJECT_ID('[results]', 'U') IS NOT NULL DROP TABLE [results];
IF OBJECT_ID('[prizes]', 'U') IS NOT NULL DROP TABLE [prizes];
IF OBJECT_ID('[prize_fields]', 'U') IS NOT NULL DROP TABLE [prize_fields];
IF OBJECT_ID('[prize_changes_audit]', 'U') IS NOT NULL DROP TABLE [prize_changes_audit];
IF OBJECT_ID('[permissions]', 'U') IS NOT NULL DROP TABLE [permissions];
IF OBJECT_ID('[lottery_game_compatibility]', 'U') IS NOT NULL DROP TABLE [lottery_game_compatibility];
IF OBJECT_ID('[lotteries]', 'U') IS NOT NULL DROP TABLE [lotteries];
IF OBJECT_ID('[limit_rules]', 'U') IS NOT NULL DROP TABLE [limit_rules];
IF OBJECT_ID('[limit_consumption]', 'U') IS NOT NULL DROP TABLE [limit_consumption];
IF OBJECT_ID('[hot_numbers]', 'U') IS NOT NULL DROP TABLE [hot_numbers];
IF OBJECT_ID('[game_types]', 'U') IS NOT NULL DROP TABLE [game_types];
IF OBJECT_ID('[game_categories]', 'U') IS NOT NULL DROP TABLE [game_categories];
IF OBJECT_ID('[financial_transactions]', 'U') IS NOT NULL DROP TABLE [financial_transactions];
IF OBJECT_ID('[error_logs]', 'U') IS NOT NULL DROP TABLE [error_logs];
IF OBJECT_ID('[draws]', 'U') IS NOT NULL DROP TABLE [draws];
IF OBJECT_ID('[draw_prize_configs]', 'U') IS NOT NULL DROP TABLE [draw_prize_configs];
IF OBJECT_ID('[countries]', 'U') IS NOT NULL DROP TABLE [countries];
IF OBJECT_ID('[betting_pools]', 'U') IS NOT NULL DROP TABLE [betting_pools];
IF OBJECT_ID('[betting_pool_styles]', 'U') IS NOT NULL DROP TABLE [betting_pool_styles];
IF OBJECT_ID('[betting_pool_sortitions]', 'U') IS NOT NULL DROP TABLE [betting_pool_sortitions];
IF OBJECT_ID('[betting_pool_schedules]', 'U') IS NOT NULL DROP TABLE [betting_pool_schedules];
IF OBJECT_ID('[betting_pool_prizes_commissions]', 'U') IS NOT NULL DROP TABLE [betting_pool_prizes_commissions];
IF OBJECT_ID('[betting_pool_print_config]', 'U') IS NOT NULL DROP TABLE [betting_pool_print_config];
IF OBJECT_ID('[betting_pool_general_config]', 'U') IS NOT NULL DROP TABLE [betting_pool_general_config];
IF OBJECT_ID('[betting_pool_footers]', 'U') IS NOT NULL DROP TABLE [betting_pool_footers];
IF OBJECT_ID('[betting_pool_draws]', 'U') IS NOT NULL DROP TABLE [betting_pool_draws];
IF OBJECT_ID('[betting_pool_draw_config]', 'U') IS NOT NULL DROP TABLE [betting_pool_draw_config];
IF OBJECT_ID('[betting_pool_discount_config]', 'U') IS NOT NULL DROP TABLE [betting_pool_discount_config];
IF OBJECT_ID('[betting_pool_config]', 'U') IS NOT NULL DROP TABLE [betting_pool_config];
IF OBJECT_ID('[betting_pool_automatic_expenses]', 'U') IS NOT NULL DROP TABLE [betting_pool_automatic_expenses];
IF OBJECT_ID('[bet_types]', 'U') IS NOT NULL DROP TABLE [bet_types];
IF OBJECT_ID('[banks]', 'U') IS NOT NULL DROP TABLE [banks];
IF OBJECT_ID('[banca_prize_configs]', 'U') IS NOT NULL DROP TABLE [banca_prize_configs];
IF OBJECT_ID('[balances]', 'U') IS NOT NULL DROP TABLE [balances];
IF OBJECT_ID('[audit_log]', 'U') IS NOT NULL DROP TABLE [audit_log];

-- Drop stored procedures
IF OBJECT_ID('[sp_CalculateTicketTotals]', 'P') IS NOT NULL DROP PROCEDURE [sp_CalculateTicketTotals];
IF OBJECT_ID('[sp_CancelTicket]', 'P') IS NOT NULL DROP PROCEDURE [sp_CancelTicket];
IF OBJECT_ID('[sp_CheckTicketWinners]', 'P') IS NOT NULL DROP PROCEDURE [sp_CheckTicketWinners];
IF OBJECT_ID('[sp_CopyBettingPoolConfig]', 'P') IS NOT NULL DROP PROCEDURE [sp_CopyBettingPoolConfig];
IF OBJECT_ID('[sp_CopyBettingPoolSection]', 'P') IS NOT NULL DROP PROCEDURE [sp_CopyBettingPoolSection];
IF OBJECT_ID('[sp_ExpireOldPermissions]', 'P') IS NOT NULL DROP PROCEDURE [sp_ExpireOldPermissions];
IF OBJECT_ID('[sp_GetNumberSales]', 'P') IS NOT NULL DROP PROCEDURE [sp_GetNumberSales];
IF OBJECT_ID('[sp_GetUserPermissions]', 'P') IS NOT NULL DROP PROCEDURE [sp_GetUserPermissions];
IF OBJECT_ID('[sp_GetUsersWithPermission]', 'P') IS NOT NULL DROP PROCEDURE [sp_GetUsersWithPermission];
IF OBJECT_ID('[sp_GrantMultiplePermissions]', 'P') IS NOT NULL DROP PROCEDURE [sp_GrantMultiplePermissions];
IF OBJECT_ID('[sp_GrantPermissionToUser]', 'P') IS NOT NULL DROP PROCEDURE [sp_GrantPermissionToUser];
IF OBJECT_ID('[sp_PayTicketPrize]', 'P') IS NOT NULL DROP PROCEDURE [sp_PayTicketPrize];
IF OBJECT_ID('[sp_RevokePermissionFromUser]', 'P') IS NOT NULL DROP PROCEDURE [sp_RevokePermissionFromUser];

-- Drop views
IF OBJECT_ID('[database_firewall_rules]', 'V') IS NOT NULL DROP VIEW [database_firewall_rules];
IF OBJECT_ID('[vw_betting_pool_complete_config]', 'V') IS NOT NULL DROP VIEW [vw_betting_pool_complete_config];
IF OBJECT_ID('[vw_daily_sales_by_betting_pool]', 'V') IS NOT NULL DROP VIEW [vw_daily_sales_by_betting_pool];
IF OBJECT_ID('[vw_expiring_permissions]', 'V') IS NOT NULL DROP VIEW [vw_expiring_permissions];
IF OBJECT_ID('[vw_hot_numbers_today]', 'V') IS NOT NULL DROP VIEW [vw_hot_numbers_today];
IF OBJECT_ID('[vw_pending_winners]', 'V') IS NOT NULL DROP VIEW [vw_pending_winners];
IF OBJECT_ID('[vw_tickets_complete]', 'V') IS NOT NULL DROP VIEW [vw_tickets_complete];
IF OBJECT_ID('[vw_user_permissions_summary]', 'V') IS NOT NULL DROP VIEW [vw_user_permissions_summary];
IF OBJECT_ID('[vw_users_multiple_betting_pools]', 'V') IS NOT NULL DROP VIEW [vw_users_multiple_betting_pools];
IF OBJECT_ID('[vw_users_multiple_zones]', 'V') IS NOT NULL DROP VIEW [vw_users_multiple_zones];
IF OBJECT_ID('[vw_users_with_direct_permissions]', 'V') IS NOT NULL DROP VIEW [vw_users_with_direct_permissions];

GO

-- ============================================
-- CREATE TABLES
-- ============================================

-- Table: audit_log
CREATE TABLE [audit_log] (
    [audit_id] bigint IDENTITY(1,1) NOT NULL,
    [table_name] varchar(100) NOT NULL,
    [operation_type] varchar(20) NOT NULL,
    [record_id] varchar(100) NOT NULL,
    [old_values] nvarchar(MAX) NULL,
    [new_values] nvarchar(MAX) NULL,
    [changed_fields] varchar(MAX) NULL,
    [user_id] int NULL,
    [username] varchar(50) NULL,
    [betting_pool_id] int NULL,
    [ip_address] varchar(50) NULL,
    [application] varchar(100) NULL,
    [operation_reason] nvarchar(500) NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_audit_log] PRIMARY KEY CLUSTERED ([audit_id])
);
CREATE NONCLUSTERED INDEX [IX_audit_log_created] ON [audit_log] ([created_at]);
CREATE NONCLUSTERED INDEX [IX_audit_log_record] ON [audit_log] ([table_name], [record_id]);
CREATE NONCLUSTERED INDEX [IX_audit_log_table] ON [audit_log] ([table_name], [created_at]);
CREATE NONCLUSTERED INDEX [IX_audit_log_user] ON [audit_log] ([user_id], [created_at]);

-- Table: balances
CREATE TABLE [balances] (
    [balance_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [current_balance] decimal(12,2) NULL DEFAULT ((0.00)),
    [last_updated] datetime2 NULL DEFAULT (getdate()),
    [updated_by] int NULL,
    CONSTRAINT [PK_balances] PRIMARY KEY CLUSTERED ([balance_id])
);
ALTER TABLE [balances] ADD CONSTRAINT [FK_balances_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;

-- Table: banca_prize_configs
CREATE TABLE [banca_prize_configs] (
    [config_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [prize_field_id] int NOT NULL,
    [custom_value] decimal(10,2) NOT NULL DEFAULT ((0)),
    [created_at] datetime2 NOT NULL DEFAULT (getutcdate()),
    [updated_at] datetime2 NULL,
    CONSTRAINT [PK_banca_prize_configs] PRIMARY KEY CLUSTERED ([config_id])
);
ALTER TABLE [banca_prize_configs] ADD CONSTRAINT [FK_banca_prize_configs_betting_pool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;
ALTER TABLE [banca_prize_configs] ADD CONSTRAINT [FK_banca_prize_configs_prize_field] FOREIGN KEY ([prize_field_id]) REFERENCES [prize_fields] ([prize_field_id]) ON DELETE CASCADE;
CREATE NONCLUSTERED INDEX [IX_banca_prize_configs_betting_pool_id] ON [banca_prize_configs] ([betting_pool_id]);
CREATE NONCLUSTERED INDEX [IX_banca_prize_configs_prize_field_id] ON [banca_prize_configs] ([prize_field_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_banca_prize_field] ON [banca_prize_configs] ([betting_pool_id], [prize_field_id]);

-- Table: banks
CREATE TABLE [banks] (
    [bank_id] int NOT NULL,
    [bank_name] nvarchar(100) NOT NULL,
    [bank_code] nvarchar(10) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_banks] PRIMARY KEY CLUSTERED ([bank_id])
);

-- Table: bet_types
CREATE TABLE [bet_types] (
    [bet_type_id] int IDENTITY(1,1) NOT NULL,
    [bet_type_code] nvarchar(50) NOT NULL,
    [bet_type_name] nvarchar(255) NOT NULL,
    [description] nvarchar(MAX) NULL,
    [display_order] int NOT NULL DEFAULT ((1)),
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK__tipos_ap__CC12BEA31F2153CE] PRIMARY KEY CLUSTERED ([bet_type_id])
);
CREATE NONCLUSTERED INDEX [IX_tipos_apuesta_active] ON [bet_types] ([is_active], [display_order]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ__tipos_ap__401D88F1400815B9] ON [bet_types] ([bet_type_code]);

-- Table: betting_pool_automatic_expenses
CREATE TABLE [betting_pool_automatic_expenses] (
    [expense_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [expense_type] varchar(50) NOT NULL,
    [amount] decimal(10,2) NULL,
    [percentage] decimal(5,2) NULL,
    [frequency] varchar(50) NOT NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_expenses] PRIMARY KEY CLUSTERED ([expense_id])
);
ALTER TABLE [betting_pool_automatic_expenses] ADD CONSTRAINT [FK_expenses_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);

-- Table: betting_pool_config
CREATE TABLE [betting_pool_config] (
    [config_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [fall_type] nvarchar(50) NULL DEFAULT ('OFF'),
    [deactivation_balance] decimal(10,2) NULL,
    [daily_sale_limit] decimal(10,2) NULL,
    [daily_balance_limit] decimal(10,2) NULL,
    [temporary_additional_balance] decimal(10,2) NULL,
    [credit_limit] decimal(12,2) NULL DEFAULT ((0.00)),
    [is_active] bit NULL DEFAULT ((1)),
    [control_winning_tickets] bit NULL DEFAULT ((0)),
    [allow_jackpot] bit NULL DEFAULT ((1)),
    [enable_recharges] bit NULL DEFAULT ((1)),
    [allow_password_change] bit NULL DEFAULT ((1)),
    [cancel_minutes] int NULL DEFAULT ((30)),
    [daily_cancel_tickets] int NULL,
    [max_cancel_amount] decimal(10,2) NULL,
    [max_ticket_amount] decimal(10,2) NULL,
    [max_daily_recharge] decimal(10,2) NULL,
    [payment_mode] nvarchar(50) NULL DEFAULT ('BANCA'),
    [created_at] datetime2 NULL,
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [enable_temporary_balance] bit NOT NULL DEFAULT ((0)),
    CONSTRAINT [PK__betting___4AD1BFF14457B533] PRIMARY KEY CLUSTERED ([config_id])
);
ALTER TABLE [betting_pool_config] ADD CONSTRAINT [FK_BettingPoolConfig_BettingPool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);

-- Table: betting_pool_discount_config
CREATE TABLE [betting_pool_discount_config] (
    [discount_config_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [discount_provider] nvarchar(50) NULL DEFAULT ('GRUPO'),
    [discount_mode] nvarchar(50) NULL DEFAULT ('OFF'),
    [created_at] datetime2 NULL,
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK__betting___49EC901038F76EF5] PRIMARY KEY CLUSTERED ([discount_config_id])
);
ALTER TABLE [betting_pool_discount_config] ADD CONSTRAINT [FK_BettingPoolDiscountConfig_BettingPool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);

-- Table: betting_pool_draw_config
CREATE TABLE [betting_pool_draw_config] (
    [config_sorteo_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [prize_field_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    [multiplier_amount] decimal(10,2) NOT NULL,
    CONSTRAINT [PK__configur__D23E6649103481EF] PRIMARY KEY CLUSTERED ([config_sorteo_id])
);
ALTER TABLE [betting_pool_draw_config] ADD CONSTRAINT [FK_config_sorteo_created_by] FOREIGN KEY ([created_by]) REFERENCES [users] ([user_id]);
ALTER TABLE [betting_pool_draw_config] ADD CONSTRAINT [FK_config_sorteo_updated_by] FOREIGN KEY ([updated_by]) REFERENCES [users] ([user_id]);
ALTER TABLE [betting_pool_draw_config] ADD CONSTRAINT [FK_pool_draw_config_betting_pool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;
ALTER TABLE [betting_pool_draw_config] ADD CONSTRAINT [FK_pool_draw_config_draw] FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
ALTER TABLE [betting_pool_draw_config] ADD CONSTRAINT [FK_pool_draw_config_prize_field] FOREIGN KEY ([prize_field_id]) REFERENCES [prize_fields] ([prize_field_id]);
CREATE NONCLUSTERED INDEX [IX_config_sorteo_banca] ON [betting_pool_draw_config] ([betting_pool_id], [draw_id], [is_active]);
CREATE NONCLUSTERED INDEX [IX_config_sorteo_campo] ON [betting_pool_draw_config] ([prize_field_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_config_sorteo_banca_sorteo_campo] ON [betting_pool_draw_config] ([betting_pool_id], [draw_id], [prize_field_id]);

-- Table: betting_pool_draws
CREATE TABLE [betting_pool_draws] (
    [betting_pool_draw_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_draws] PRIMARY KEY CLUSTERED ([betting_pool_draw_id])
);
ALTER TABLE [betting_pool_draws] ADD CONSTRAINT [FK_pool_draws_betting_pool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;
ALTER TABLE [betting_pool_draws] ADD CONSTRAINT [FK_pool_draws_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);
ALTER TABLE [betting_pool_draws] ADD CONSTRAINT [FK_pool_draws_draw] FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
ALTER TABLE [betting_pool_draws] ADD CONSTRAINT [FK_pool_draws_draws] FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
CREATE NONCLUSTERED INDEX [IX_betting_pool_draws_active] ON [betting_pool_draws] ([draw_id], [betting_pool_id], [is_active]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_betting_pool_draw] ON [betting_pool_draws] ([betting_pool_id], [draw_id]);

-- Table: betting_pool_footers
CREATE TABLE [betting_pool_footers] (
    [footer_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [auto_footer] bit NOT NULL,
    [footer_line_1] nvarchar(500) NULL,
    [footer_line_2] nvarchar(500) NULL,
    [footer_line_3] nvarchar(500) NULL,
    [footer_line_4] nvarchar(500) NULL,
    [created_at] datetime2 NULL,
    [updated_at] datetime2 NULL,
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK__betting___516BC343F7CC06AE] PRIMARY KEY CLUSTERED ([footer_id])
);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_betting_pool_footers_betting_pool_id] ON [betting_pool_footers] ([betting_pool_id]);

-- Table: betting_pool_general_config
CREATE TABLE [betting_pool_general_config] (
    [config_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [prize_field_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    [multiplier_amount] decimal(10,2) NOT NULL,
    CONSTRAINT [PK__configur__4AD1BFF1AE906AEE] PRIMARY KEY CLUSTERED ([config_id])
);
ALTER TABLE [betting_pool_general_config] ADD CONSTRAINT [FK_config_general_created_by] FOREIGN KEY ([created_by]) REFERENCES [users] ([user_id]);
ALTER TABLE [betting_pool_general_config] ADD CONSTRAINT [FK_config_general_updated_by] FOREIGN KEY ([updated_by]) REFERENCES [users] ([user_id]);
ALTER TABLE [betting_pool_general_config] ADD CONSTRAINT [FK_pool_general_config_betting_pool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;
ALTER TABLE [betting_pool_general_config] ADD CONSTRAINT [FK_pool_general_config_prize_field] FOREIGN KEY ([prize_field_id]) REFERENCES [prize_fields] ([prize_field_id]);
CREATE NONCLUSTERED INDEX [IX_config_general_banca] ON [betting_pool_general_config] ([betting_pool_id], [is_active]);
CREATE NONCLUSTERED INDEX [IX_config_general_campo] ON [betting_pool_general_config] ([prize_field_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_config_general_banca_campo] ON [betting_pool_general_config] ([betting_pool_id], [prize_field_id]);

-- Table: betting_pool_print_config
CREATE TABLE [betting_pool_print_config] (
    [print_config_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [print_mode] nvarchar(50) NULL DEFAULT ('DRIVER'),
    [print_enabled] bit NULL DEFAULT ((1)),
    [print_ticket_copy] bit NULL DEFAULT ((1)),
    [print_recharge_receipt] bit NULL DEFAULT ((1)),
    [sms_only] bit NULL DEFAULT ((0)),
    [created_at] datetime2 NULL,
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK__betting___0EB445C58BCB00BC] PRIMARY KEY CLUSTERED ([print_config_id])
);
ALTER TABLE [betting_pool_print_config] ADD CONSTRAINT [FK_BettingPoolPrintConfig_BettingPool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);

-- Table: betting_pool_prizes_commissions
CREATE TABLE [betting_pool_prizes_commissions] (
    [prize_commission_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [lottery_id] int NOT NULL,
    [game_type] varchar(50) NOT NULL,
    [prize_payment_1] decimal(10,2) NULL,
    [prize_payment_2] decimal(10,2) NULL,
    [prize_payment_3] decimal(10,2) NULL,
    [prize_payment_4] decimal(10,2) NULL,
    [commission_discount_1] decimal(5,2) NULL,
    [commission_discount_2] decimal(5,2) NULL,
    [commission_discount_3] decimal(5,2) NULL,
    [commission_discount_4] decimal(5,2) NULL,
    [commission_2_discount_1] decimal(5,2) NULL,
    [commission_2_discount_2] decimal(5,2) NULL,
    [commission_2_discount_3] decimal(5,2) NULL,
    [commission_2_discount_4] decimal(5,2) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_prizes] PRIMARY KEY CLUSTERED ([prize_commission_id])
);
ALTER TABLE [betting_pool_prizes_commissions] ADD CONSTRAINT [FK_prizes_comm_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);
ALTER TABLE [betting_pool_prizes_commissions] ADD CONSTRAINT [FK_prizes_comm_lotteries] FOREIGN KEY ([lottery_id]) REFERENCES [lotteries] ([lottery_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_pool_lottery_game] ON [betting_pool_prizes_commissions] ([betting_pool_id], [lottery_id], [game_type]);

-- Table: betting_pool_schedules
CREATE TABLE [betting_pool_schedules] (
    [schedule_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [day_of_week] int NOT NULL,
    [close_time] time NULL,
    [draw_time] time NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_schedules] PRIMARY KEY CLUSTERED ([schedule_id])
);
ALTER TABLE [betting_pool_schedules] ADD CONSTRAINT [FK_schedules_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_pool_day] ON [betting_pool_schedules] ([betting_pool_id], [day_of_week]);

-- Table: betting_pool_sortitions
CREATE TABLE [betting_pool_sortitions] (
    [sortition_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [sortition_type] varchar(50) NOT NULL,
    [is_enabled] bit NULL DEFAULT ((1)),
    [specific_config] nvarchar(MAX) NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_sortitions] PRIMARY KEY CLUSTERED ([sortition_id])
);
ALTER TABLE [betting_pool_sortitions] ADD CONSTRAINT [FK_sortitions_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_pool_sortition] ON [betting_pool_sortitions] ([betting_pool_id], [sortition_type]);

-- Table: betting_pool_styles
CREATE TABLE [betting_pool_styles] (
    [style_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [sales_point_style] varchar(50) NULL DEFAULT ('Estilo 1'),
    [print_style] varchar(50) NULL DEFAULT ('Original'),
    [ticket_colors] nvarchar(MAX) NULL,
    [custom_logo] varchar(255) NULL,
    [font_settings] nvarchar(MAX) NULL,
    [layout_config] nvarchar(MAX) NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_styles] PRIMARY KEY CLUSTERED ([style_id])
);
ALTER TABLE [betting_pool_styles] ADD CONSTRAINT [FK_styles_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;
CREATE UNIQUE NONCLUSTERED INDEX [UQ_pool_style] ON [betting_pool_styles] ([betting_pool_id]);

-- Table: betting_pools
CREATE TABLE [betting_pools] (
    [betting_pool_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_code] nvarchar(20) NOT NULL,
    [betting_pool_name] nvarchar(100) NOT NULL,
    [zone_id] int NOT NULL,
    [bank_id] int NULL,
    [address] nvarchar(255) NULL,
    [phone] nvarchar(20) NULL,
    [location] varchar(255) NULL,
    [reference] varchar(255) NULL,
    [comment] text NULL,
    [username] nvarchar(100) NULL,
    [password_hash] varchar(255) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [deleted_at] datetime2 NULL,
    [deleted_by] int NULL,
    [deletion_reason] nvarchar(500) NULL,
    CONSTRAINT [PK_betting_pools] PRIMARY KEY CLUSTERED ([betting_pool_id])
);
ALTER TABLE [betting_pools] ADD CONSTRAINT [FK_betting_pools_banks] FOREIGN KEY ([bank_id]) REFERENCES [banks] ([bank_id]) ON DELETE SET NULL;
ALTER TABLE [betting_pools] ADD CONSTRAINT [FK_betting_pools_zones] FOREIGN KEY ([zone_id]) REFERENCES [zones] ([zone_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_betting_pool_code] ON [betting_pools] ([betting_pool_code]);

-- Table: countries
CREATE TABLE [countries] (
    [country_id] int NOT NULL,
    [country_name] nvarchar(100) NOT NULL,
    [country_code] nvarchar(3) NOT NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_countries] PRIMARY KEY CLUSTERED ([country_id])
);

-- Table: draw_prize_configs
CREATE TABLE [draw_prize_configs] (
    [config_id] int IDENTITY(1,1) NOT NULL,
    [betting_pool_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [prize_field_id] int NOT NULL,
    [custom_value] decimal(10,2) NOT NULL DEFAULT ((0)),
    [created_at] datetime2 NOT NULL DEFAULT (getutcdate()),
    [updated_at] datetime2 NULL,
    CONSTRAINT [PK_draw_prize_configs] PRIMARY KEY CLUSTERED ([config_id])
);
ALTER TABLE [draw_prize_configs] ADD CONSTRAINT [FK_draw_prize_configs_betting_pool] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;
ALTER TABLE [draw_prize_configs] ADD CONSTRAINT [FK_draw_prize_configs_draw] FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]) ON DELETE CASCADE;
ALTER TABLE [draw_prize_configs] ADD CONSTRAINT [FK_draw_prize_configs_prize_field] FOREIGN KEY ([prize_field_id]) REFERENCES [prize_fields] ([prize_field_id]) ON DELETE CASCADE;
CREATE NONCLUSTERED INDEX [IX_draw_prize_configs_betting_pool_draw] ON [draw_prize_configs] ([betting_pool_id], [draw_id]);
CREATE NONCLUSTERED INDEX [IX_draw_prize_configs_betting_pool_id] ON [draw_prize_configs] ([betting_pool_id]);
CREATE NONCLUSTERED INDEX [IX_draw_prize_configs_draw_id] ON [draw_prize_configs] ([draw_id]);
CREATE NONCLUSTERED INDEX [IX_draw_prize_configs_prize_field_id] ON [draw_prize_configs] ([prize_field_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_banca_draw_prize_field] ON [draw_prize_configs] ([betting_pool_id], [draw_id], [prize_field_id]);

-- Table: draws
CREATE TABLE [draws] (
    [draw_id] int NOT NULL,
    [lottery_id] int NOT NULL,
    [draw_name] nvarchar(100) NOT NULL,
    [draw_time] time NOT NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [abbreviation] varchar(10) NULL,
    [display_color] varchar(7) NULL,
    CONSTRAINT [PK_draws] PRIMARY KEY CLUSTERED ([draw_id])
);
ALTER TABLE [draws] ADD CONSTRAINT [FK_draws_lotteries] FOREIGN KEY ([lottery_id]) REFERENCES [lotteries] ([lottery_id]);

-- Table: error_logs
CREATE TABLE [error_logs] (
    [error_log_id] bigint IDENTITY(1,1) NOT NULL,
    [error_source] varchar(100) NOT NULL,
    [error_procedure] varchar(200) NULL,
    [error_number] int NULL,
    [error_severity] int NULL,
    [error_state] int NULL,
    [error_message] nvarchar(MAX) NULL,
    [error_line] int NULL,
    [additional_info] nvarchar(MAX) NULL,
    [user_id] int NULL,
    [betting_pool_id] int NULL,
    [ticket_id] bigint NULL,
    [session_id] varchar(100) NULL,
    [ip_address] varchar(50) NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_error_logs] PRIMARY KEY CLUSTERED ([error_log_id])
);
CREATE NONCLUSTERED INDEX [IX_error_logs_created] ON [error_logs] ([created_at]);
CREATE NONCLUSTERED INDEX [IX_error_logs_source] ON [error_logs] ([error_source], [created_at]);
CREATE NONCLUSTERED INDEX [IX_error_logs_user] ON [error_logs] ([user_id], [created_at]);

-- Table: financial_transactions
CREATE TABLE [financial_transactions] (
    [transaction_id] bigint IDENTITY(1,1) NOT NULL,
    [transaction_type] varchar(50) NOT NULL,
    [betting_pool_id] int NULL,
    [user_id] int NULL,
    [ticket_id] bigint NULL,
    [related_transaction_id] bigint NULL,
    [amount] decimal(18,2) NOT NULL,
    [balance_before] decimal(18,2) NULL,
    [balance_after] decimal(18,2) NULL,
    [currency] varchar(10) NOT NULL DEFAULT ('DOP'),
    [payment_method] varchar(50) NULL,
    [reference_number] varchar(100) NULL,
    [description] nvarchar(500) NULL,
    [status] varchar(20) NOT NULL DEFAULT ('completed'),
    [is_reversed] bit NOT NULL DEFAULT ((0)),
    [reversed_by_transaction_id] bigint NULL,
    [reversed_at] datetime2 NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [approved_by] int NULL,
    [approved_at] datetime2 NULL,
    CONSTRAINT [PK_financial_transactions] PRIMARY KEY CLUSTERED ([transaction_id])
);
CREATE NONCLUSTERED INDEX [IX_financial_transactions_created] ON [financial_transactions] ([created_at]);
CREATE NONCLUSTERED INDEX [IX_financial_transactions_pool] ON [financial_transactions] ([betting_pool_id], [created_at]);
CREATE NONCLUSTERED INDEX [IX_financial_transactions_status] ON [financial_transactions] ([status], [created_at]);
CREATE NONCLUSTERED INDEX [IX_financial_transactions_ticket] ON [financial_transactions] ([ticket_id]);
CREATE NONCLUSTERED INDEX [IX_financial_transactions_type] ON [financial_transactions] ([transaction_type], [created_at]);
CREATE NONCLUSTERED INDEX [IX_financial_transactions_user] ON [financial_transactions] ([user_id], [created_at]);

-- Table: game_categories
CREATE TABLE [game_categories] (
    [category_id] int NOT NULL,
    [category_name] nvarchar(100) NOT NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_game_categories] PRIMARY KEY CLUSTERED ([category_id])
);

-- Table: game_types
CREATE TABLE [game_types] (
    [game_type_id] int IDENTITY(1,1) NOT NULL,
    [category_id] int NOT NULL,
    [game_type_code] varchar(50) NOT NULL,
    [game_name] nvarchar(100) NOT NULL,
    [description] nvarchar(500) NULL,
    [prize_multiplier] decimal(10,2) NULL DEFAULT ((1.00)),
    [requires_additional_number] bit NULL DEFAULT ((0)),
    [number_length] int NULL DEFAULT ((4)),
    [display_order] int NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_game_types] PRIMARY KEY CLUSTERED ([game_type_id])
);
ALTER TABLE [game_types] ADD CONSTRAINT [FK_game_types_categories] FOREIGN KEY ([category_id]) REFERENCES [game_categories] ([category_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_game_type_code] ON [game_types] ([game_type_code]);

-- Table: hot_numbers
CREATE TABLE [hot_numbers] (
    [hot_number_id] bigint IDENTITY(1,1) NOT NULL,
    [lottery_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [draw_date] date NOT NULL,
    [bet_number] varchar(20) NOT NULL,
    [total_bet_amount] decimal(18,2) NOT NULL DEFAULT ((0.00)),
    [bet_count] int NOT NULL DEFAULT ((0)),
    [unique_tickets] int NOT NULL DEFAULT ((0)),
    [unique_betting_pools] int NOT NULL DEFAULT ((0)),
    [limit_percentage] decimal(5,2) NULL,
    [is_near_limit] bit NOT NULL DEFAULT ((0)),
    [is_at_limit] bit NOT NULL DEFAULT ((0)),
    [last_updated] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_hot_numbers] PRIMARY KEY CLUSTERED ([hot_number_id])
);
CREATE NONCLUSTERED INDEX [IX_hot_numbers_amount] ON [hot_numbers] ([draw_date], [total_bet_amount]);
CREATE NONCLUSTERED INDEX [IX_hot_numbers_draw_date] ON [hot_numbers] ([draw_id], [draw_date]);
CREATE NONCLUSTERED INDEX [IX_hot_numbers_limits] ON [hot_numbers] ([is_near_limit], [is_at_limit]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_hot_numbers] ON [hot_numbers] ([lottery_id], [draw_id], [draw_date], [bet_number]);

-- Table: limit_consumption
CREATE TABLE [limit_consumption] (
    [consumption_id] bigint IDENTITY(1,1) NOT NULL,
    [limit_rule_id] int NOT NULL,
    [lottery_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [draw_date] date NOT NULL,
    [bet_number] varchar(20) NOT NULL,
    [betting_pool_id] int NULL,
    [current_amount] decimal(18,2) NOT NULL DEFAULT ((0.00)),
    [bet_count] int NOT NULL DEFAULT ((0)),
    [last_bet_at] datetime2 NULL,
    [is_near_limit] bit NOT NULL DEFAULT ((0)),
    [is_at_limit] bit NOT NULL DEFAULT ((0)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_limit_consumption] PRIMARY KEY CLUSTERED ([consumption_id])
);
CREATE NONCLUSTERED INDEX [IX_limit_consumption_draw_number] ON [limit_consumption] ([draw_id], [draw_date], [bet_number]);
CREATE NONCLUSTERED INDEX [IX_limit_consumption_near_limit] ON [limit_consumption] ([is_near_limit], [is_at_limit]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_limit_consumption] ON [limit_consumption] ([limit_rule_id], [lottery_id], [draw_id], [draw_date], [bet_number], [betting_pool_id]);

-- Table: limit_rules
CREATE TABLE [limit_rules] (
    [limit_rule_id] int IDENTITY(1,1) NOT NULL,
    [rule_name] nvarchar(100) NOT NULL,
    [lottery_id] int NULL,
    [draw_id] int NULL,
    [game_type_id] int NULL,
    [bet_number_pattern] varchar(50) NULL,
    [max_bet_per_number] decimal(18,2) NULL,
    [max_bet_per_ticket] decimal(18,2) NULL,
    [max_bet_per_betting_pool] decimal(18,2) NULL,
    [max_bet_global] decimal(18,2) NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [priority] int NULL DEFAULT ((100)),
    [effective_from] datetime2 NULL,
    [effective_to] datetime2 NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_limit_rules] PRIMARY KEY CLUSTERED ([limit_rule_id])
);
CREATE NONCLUSTERED INDEX [IX_limit_rules_active_priority] ON [limit_rules] ([is_active], [priority]);
CREATE NONCLUSTERED INDEX [IX_limit_rules_lottery_draw] ON [limit_rules] ([lottery_id], [draw_id], [is_active]);

-- Table: lotteries
CREATE TABLE [lotteries] (
    [lottery_id] int NOT NULL,
    [country_id] int NOT NULL,
    [lottery_name] nvarchar(100) NOT NULL,
    [lottery_type] nvarchar(50) NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [display_order] int NULL,
    CONSTRAINT [PK_lotteries] PRIMARY KEY CLUSTERED ([lottery_id])
);
ALTER TABLE [lotteries] ADD CONSTRAINT [FK_lotteries_countries] FOREIGN KEY ([country_id]) REFERENCES [countries] ([country_id]);

-- Table: lottery_game_compatibility
CREATE TABLE [lottery_game_compatibility] (
    [compatibility_id] int IDENTITY(1,1) NOT NULL,
    [lottery_id] int NOT NULL,
    [game_type_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK__lottery___AA12AC996D75543A] PRIMARY KEY CLUSTERED ([compatibility_id])
);
ALTER TABLE [lottery_game_compatibility] ADD CONSTRAINT [FK__lottery_g__game___4F2895A9] FOREIGN KEY ([game_type_id]) REFERENCES [game_types] ([game_type_id]);
ALTER TABLE [lottery_game_compatibility] ADD CONSTRAINT [FK__lottery_g__lotte__4E347170] FOREIGN KEY ([lottery_id]) REFERENCES [lotteries] ([lottery_id]);

-- Table: permissions
CREATE TABLE [permissions] (
    [permission_id] int IDENTITY(1,1) NOT NULL,
    [permission_code] nvarchar(100) NOT NULL,
    [permission_name] nvarchar(200) NOT NULL,
    [category] nvarchar(50) NOT NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_permissions] PRIMARY KEY CLUSTERED ([permission_id])
);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_permissions_code] ON [permissions] ([permission_code]);

-- Table: prize_changes_audit
CREATE TABLE [prize_changes_audit] (
    [audit_id] int IDENTITY(1,1) NOT NULL,
    [table_name] nvarchar(100) NOT NULL,
    [record_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [draw_id] int NULL,
    [prize_field_id] int NOT NULL,
    [old_value] decimal(18,2) NULL,
    [new_value] decimal(18,2) NOT NULL,
    [change_type] nvarchar(50) NOT NULL,
    [changed_by] int NOT NULL,
    [changed_at] datetime2 NOT NULL DEFAULT (getdate()),
    [ip_address] nvarchar(50) NULL,
    [user_agent] nvarchar(500) NULL,
    [notes] nvarchar(MAX) NULL,
    CONSTRAINT [PK__auditori__5AF33E33F5E3A9D6] PRIMARY KEY CLUSTERED ([audit_id])
);
ALTER TABLE [prize_changes_audit] ADD CONSTRAINT [FK_audit_premios_banca] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);
ALTER TABLE [prize_changes_audit] ADD CONSTRAINT [FK_audit_premios_campo] FOREIGN KEY ([prize_field_id]) REFERENCES [prize_fields] ([prize_field_id]);
ALTER TABLE [prize_changes_audit] ADD CONSTRAINT [FK_audit_premios_draw] FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
ALTER TABLE [prize_changes_audit] ADD CONSTRAINT [FK_audit_premios_user] FOREIGN KEY ([changed_by]) REFERENCES [users] ([user_id]);
CREATE NONCLUSTERED INDEX [IX_audit_premios_banca] ON [prize_changes_audit] ([betting_pool_id], [changed_at]);
CREATE NONCLUSTERED INDEX [IX_audit_premios_campo] ON [prize_changes_audit] ([prize_field_id], [changed_at]);
CREATE NONCLUSTERED INDEX [IX_audit_premios_date] ON [prize_changes_audit] ([changed_at]);
CREATE NONCLUSTERED INDEX [IX_audit_premios_sorteo] ON [prize_changes_audit] ([draw_id], [changed_at]);
CREATE NONCLUSTERED INDEX [IX_audit_premios_user] ON [prize_changes_audit] ([changed_by], [changed_at]);

-- Table: prize_fields
CREATE TABLE [prize_fields] (
    [prize_field_id] int IDENTITY(1,1) NOT NULL,
    [bet_type_id] int NOT NULL,
    [field_code] nvarchar(100) NOT NULL,
    [field_name] nvarchar(255) NOT NULL,
    [default_multiplier] decimal(18,2) NOT NULL DEFAULT ((0)),
    [min_multiplier] decimal(18,2) NOT NULL DEFAULT ((0)),
    [max_multiplier] decimal(18,2) NOT NULL DEFAULT ((9999999.99)),
    [display_order] int NOT NULL DEFAULT ((1)),
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK__campos_p__CD9256DD606B5E91] PRIMARY KEY CLUSTERED ([prize_field_id])
);
ALTER TABLE [prize_fields] ADD CONSTRAINT [FK_prize_fields_bet_types] FOREIGN KEY ([bet_type_id]) REFERENCES [bet_types] ([bet_type_id]);
CREATE NONCLUSTERED INDEX [IX_campos_premio_active] ON [prize_fields] ([is_active], [display_order]);
CREATE NONCLUSTERED INDEX [IX_campos_premio_tipo] ON [prize_fields] ([bet_type_id], [is_active]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ__campos_p__6844D01DFDC121D0] ON [prize_fields] ([field_code]);

-- Table: prizes
CREATE TABLE [prizes] (
    [prize_id] int NOT NULL,
    [result_id] int NOT NULL,
    [line_id] bigint NOT NULL,
    [prize_amount] decimal(10,2) NULL DEFAULT ((0.00)),
    [prize_type] nvarchar(50) NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [paid_at] datetime2 NULL,
    [paid_by] int NULL,
    [payment_method] varchar(50) NULL,
    [payment_reference] varchar(100) NULL,
    CONSTRAINT [PK_prizes] PRIMARY KEY CLUSTERED ([prize_id])
);
ALTER TABLE [prizes] ADD CONSTRAINT [FK_prizes_results] FOREIGN KEY ([result_id]) REFERENCES [results] ([result_id]);
ALTER TABLE [prizes] ADD CONSTRAINT [FK_prizes_ticket_lines] FOREIGN KEY ([line_id]) REFERENCES [ticket_lines] ([line_id]);

-- Table: results
CREATE TABLE [results] (
    [result_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [winning_number] nvarchar(20) NOT NULL,
    [additional_number] nvarchar(10) NULL,
    [position] int NULL,
    [result_date] datetime2 NOT NULL,
    [user_id] int NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [approved_by] int NULL,
    [approved_at] datetime2 NULL,
    CONSTRAINT [PK_results] PRIMARY KEY CLUSTERED ([result_id])
);
ALTER TABLE [results] ADD CONSTRAINT [FK_results_draws] FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
CREATE NONCLUSTERED INDEX [IX_results_date] ON [results] ([result_date]);
CREATE NONCLUSTERED INDEX [IX_results_draw_date] ON [results] ([winning_number], [position], [additional_number], [draw_id], [result_date]);

-- Table: role_permissions
CREATE TABLE [role_permissions] (
    [role_permission_id] int NOT NULL,
    [role_id] int NOT NULL,
    [permission_id] int NOT NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    CONSTRAINT [PK_role_permissions] PRIMARY KEY CLUSTERED ([role_permission_id])
);
ALTER TABLE [role_permissions] ADD CONSTRAINT [FK_role_permissions_permissions] FOREIGN KEY ([permission_id]) REFERENCES [permissions] ([permission_id]);
ALTER TABLE [role_permissions] ADD CONSTRAINT [FK_role_permissions_roles] FOREIGN KEY ([role_id]) REFERENCES [roles] ([role_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_role_permission] ON [role_permissions] ([role_id], [permission_id]);

-- Table: roles
CREATE TABLE [roles] (
    [role_id] int NOT NULL,
    [role_name] nvarchar(50) NOT NULL,
    [description] nvarchar(255) NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_roles] PRIMARY KEY CLUSTERED ([role_id])
);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_roles_name] ON [roles] ([role_name]);

-- Table: ticket_lines
CREATE TABLE [ticket_lines] (
    [line_id] bigint IDENTITY(1,1) NOT NULL,
    [ticket_id] bigint NOT NULL,
    [line_number] int NOT NULL,
    [lottery_id] int NOT NULL,
    [draw_id] int NOT NULL,
    [draw_date] date NOT NULL,
    [draw_time] time NOT NULL,
    [bet_number] varchar(20) NOT NULL,
    [bet_type_id] int NOT NULL,
    [bet_type_code] varchar(50) NULL,
    [position] int NULL,
    [bet_amount] decimal(18,2) NOT NULL,
    [multiplier] decimal(5,2) NULL DEFAULT ((1.00)),
    [discount_percentage] decimal(5,2) NULL DEFAULT ((0.00)),
    [discount_amount] decimal(18,2) NULL DEFAULT ((0.00)),
    [subtotal] decimal(18,2) NOT NULL,
    [total_with_multiplier] decimal(18,2) NOT NULL,
    [commission_percentage] decimal(5,2) NULL DEFAULT ((0.00)),
    [commission_amount] decimal(18,2) NULL DEFAULT ((0.00)),
    [net_amount] decimal(18,2) NOT NULL,
    [prize_multiplier] decimal(10,2) NULL,
    [prize_amount] decimal(18,2) NULL DEFAULT ((0.00)),
    [is_winner] bit NULL DEFAULT ((0)),
    [winning_position] int NULL,
    [result_number] varchar(20) NULL,
    [result_checked_at] datetime2 NULL,
    [line_status] varchar(20) NOT NULL DEFAULT ('pending'),
    [limit_rule_id] int NULL,
    [exceeds_limit] bit NULL DEFAULT ((0)),
    [limit_override_by] int NULL,
    [limit_override_reason] nvarchar(200) NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [is_lucky_pick] bit NULL DEFAULT ((0)),
    [is_hot_number] bit NULL DEFAULT ((0)),
    [sequence_number] int NULL,
    [notes] nvarchar(500) NULL,
    CONSTRAINT [PK_ticket_lines] PRIMARY KEY CLUSTERED ([line_id])
);
ALTER TABLE [ticket_lines] ADD CONSTRAINT [FK_ticket_lines_draws] FOREIGN KEY ([draw_id]) REFERENCES [draws] ([draw_id]);
ALTER TABLE [ticket_lines] ADD CONSTRAINT [FK_ticket_lines_game_types] FOREIGN KEY ([bet_type_id]) REFERENCES [game_types] ([game_type_id]);
ALTER TABLE [ticket_lines] ADD CONSTRAINT [FK_ticket_lines_lotteries] FOREIGN KEY ([lottery_id]) REFERENCES [lotteries] ([lottery_id]);
ALTER TABLE [ticket_lines] ADD CONSTRAINT [FK_ticket_lines_tickets] FOREIGN KEY ([ticket_id]) REFERENCES [tickets] ([ticket_id]) ON DELETE CASCADE;
CREATE NONCLUSTERED INDEX [IX_ticket_lines_bet_number] ON [ticket_lines] ([bet_number], [lottery_id], [draw_date]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_bet_type] ON [ticket_lines] ([bet_type_id], [bet_number]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_draw] ON [ticket_lines] ([draw_id], [created_at]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_draw_date] ON [ticket_lines] ([draw_date], [draw_time]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_limit_check] ON [ticket_lines] ([bet_amount], [lottery_id], [draw_id], [draw_date], [bet_number]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_lottery_draw] ON [ticket_lines] ([lottery_id], [draw_id], [created_at]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_status] ON [ticket_lines] ([line_status], [created_at]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_ticket] ON [ticket_lines] ([ticket_id], [line_number]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_winner] ON [ticket_lines] ([is_winner], [prize_amount]);
CREATE NONCLUSTERED INDEX [IX_ticket_lines_winners] ON [ticket_lines] ([line_id], [prize_amount], [line_status]);

-- Table: tickets
CREATE TABLE [tickets] (
    [ticket_id] bigint IDENTITY(1,1) NOT NULL,
    [ticket_code] varchar(20) NOT NULL,
    [barcode] varchar(50) NULL,
    [betting_pool_id] int NOT NULL,
    [user_id] int NOT NULL,
    [terminal_id] varchar(20) NULL,
    [ip_address] varchar(45) NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [global_multiplier] decimal(5,2) NULL DEFAULT ((1.00)),
    [global_discount] decimal(5,2) NULL DEFAULT ((0.00)),
    [currency_code] varchar(3) NULL DEFAULT ('DOP'),
    [total_lines] int NULL DEFAULT ((0)),
    [total_bet_amount] decimal(18,2) NULL DEFAULT ((0.00)),
    [total_discount] decimal(18,2) NULL DEFAULT ((0.00)),
    [total_subtotal] decimal(18,2) NULL DEFAULT ((0.00)),
    [total_with_multiplier] decimal(18,2) NULL DEFAULT ((0.00)),
    [total_commission] decimal(18,2) NULL DEFAULT ((0.00)),
    [total_net] decimal(18,2) NULL DEFAULT ((0.00)),
    [grand_total] decimal(18,2) NULL DEFAULT ((0.00)),
    [total_prize] decimal(18,2) NULL DEFAULT ((0.00)),
    [winning_lines] int NULL DEFAULT ((0)),
    [status] varchar(20) NOT NULL DEFAULT ('pending'),
    [is_cancelled] bit NULL DEFAULT ((0)),
    [cancelled_at] datetime2 NULL,
    [cancelled_by] int NULL,
    [cancellation_reason] nvarchar(200) NULL,
    [is_paid] bit NULL DEFAULT ((0)),
    [paid_at] datetime2 NULL,
    [paid_by] int NULL,
    [payment_method] varchar(50) NULL,
    [payment_reference] varchar(100) NULL,
    [customer_id] int NULL,
    [customer_name] nvarchar(100) NULL,
    [customer_phone] varchar(20) NULL,
    [customer_email] varchar(100) NULL,
    [customer_id_number] varchar(50) NULL,
    [lottery_ids] varchar(500) NULL,
    [total_lotteries] int NULL DEFAULT ((0)),
    [earliest_draw_time] datetime2 NULL,
    [latest_draw_time] datetime2 NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [print_count] int NULL DEFAULT ((0)),
    [last_printed_at] datetime2 NULL,
    [notes] nvarchar(500) NULL,
    [special_flags] varchar(200) NULL,
    CONSTRAINT [PK_tickets] PRIMARY KEY CLUSTERED ([ticket_id])
);
ALTER TABLE [tickets] ADD CONSTRAINT [FK_tickets_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]);
ALTER TABLE [tickets] ADD CONSTRAINT [FK_tickets_users] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]);
CREATE NONCLUSTERED INDEX [IX_tickets_barcode] ON [tickets] ([barcode]);
CREATE NONCLUSTERED INDEX [IX_tickets_betting_pool] ON [tickets] ([betting_pool_id], [created_at]);
CREATE NONCLUSTERED INDEX [IX_tickets_betting_pool_created] ON [tickets] ([betting_pool_id], [created_at]);
CREATE NONCLUSTERED INDEX [IX_tickets_created_at] ON [tickets] ([created_at]);
CREATE NONCLUSTERED INDEX [IX_tickets_customer] ON [tickets] ([customer_phone], [customer_name]);
CREATE NONCLUSTERED INDEX [IX_tickets_pool_date_status] ON [tickets] ([grand_total], [betting_pool_id], [created_at], [status]);
CREATE NONCLUSTERED INDEX [IX_tickets_status] ON [tickets] ([status], [created_at]);
CREATE NONCLUSTERED INDEX [IX_tickets_user] ON [tickets] ([user_id], [created_at]);
CREATE NONCLUSTERED INDEX [IX_tickets_user_created] ON [tickets] ([user_id], [created_at]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_ticket_code] ON [tickets] ([ticket_code]);

-- Table: user_betting_pools
CREATE TABLE [user_betting_pools] (
    [user_betting_pool_id] int IDENTITY(1,1) NOT NULL,
    [user_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [is_primary] bit NOT NULL DEFAULT ((0)),
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getutcdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK__user_bet__C1B71AF2E2A827A3] PRIMARY KEY CLUSTERED ([user_betting_pool_id])
);
ALTER TABLE [user_betting_pools] ADD CONSTRAINT [FK_user_betting_pools_betting_pools] FOREIGN KEY ([betting_pool_id]) REFERENCES [betting_pools] ([betting_pool_id]) ON DELETE CASCADE;
ALTER TABLE [user_betting_pools] ADD CONSTRAINT [FK_user_betting_pools_users] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_user_betting_pools_user_betting_pool] ON [user_betting_pools] ([user_id], [betting_pool_id]);

-- Table: user_betting_pools_backup
CREATE TABLE [user_betting_pools_backup] (
    [user_betting_pool_id] int NOT NULL,
    [user_id] int NOT NULL,
    [betting_pool_id] int NOT NULL,
    [is_primary] bit NULL,
    [is_active] bit NULL,
    [created_at] datetime2 NULL,
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL
);

-- Table: user_permissions
CREATE TABLE [user_permissions] (
    [user_permission_id] int IDENTITY(1,1) NOT NULL,
    [user_id] int NOT NULL,
    [permission_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getutcdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [granted_by] int NULL,
    [grant_reason] nvarchar(500) NULL,
    [expires_at] datetime2 NULL,
    CONSTRAINT [PK__user_per__D98F48199A9198AD] PRIMARY KEY CLUSTERED ([user_permission_id])
);
ALTER TABLE [user_permissions] ADD CONSTRAINT [FK_user_permissions_permissions] FOREIGN KEY ([permission_id]) REFERENCES [permissions] ([permission_id]);
ALTER TABLE [user_permissions] ADD CONSTRAINT [FK_user_permissions_users] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_user_permissions_user_permission] ON [user_permissions] ([user_id], [permission_id]);

-- Table: user_permissions_backup
CREATE TABLE [user_permissions_backup] (
    [user_permission_id] int NOT NULL,
    [user_id] int NOT NULL,
    [permission_id] int NOT NULL,
    [is_active] bit NOT NULL,
    [created_at] datetime NOT NULL,
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [granted_by] int NULL,
    [grant_reason] nvarchar(500) NULL,
    [expires_at] datetime2 NULL
);

-- Table: user_zones
CREATE TABLE [user_zones] (
    [user_zone_id] int IDENTITY(1,1) NOT NULL,
    [user_id] int NOT NULL,
    [zone_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getutcdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK__user_zon__BE6403C72B59B225] PRIMARY KEY CLUSTERED ([user_zone_id])
);
ALTER TABLE [user_zones] ADD CONSTRAINT [FK_user_zones_users] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]);
ALTER TABLE [user_zones] ADD CONSTRAINT [FK_user_zones_zones] FOREIGN KEY ([zone_id]) REFERENCES [zones] ([zone_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_user_zones_user_zone] ON [user_zones] ([user_id], [zone_id]);

-- Table: user_zones_backup
CREATE TABLE [user_zones_backup] (
    [user_zone_id] int NOT NULL,
    [user_id] int NOT NULL,
    [zone_id] int NOT NULL,
    [is_active] bit NULL,
    [created_at] datetime2 NULL,
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL
);

-- Table: users
CREATE TABLE [users] (
    [user_id] int IDENTITY(1,1) NOT NULL,
    [username] nvarchar(50) NOT NULL,
    [password_hash] nvarchar(255) NOT NULL,
    [email] nvarchar(100) NULL,
    [full_name] nvarchar(200) NULL,
    [phone] nvarchar(20) NULL,
    [role_id] int NULL,
    [commission_rate] decimal(5,2) NULL DEFAULT ((0.00)),
    [is_active] bit NULL DEFAULT ((1)),
    [last_login_at] datetime2 NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    [deleted_at] datetime2 NULL,
    [deleted_by] int NULL,
    [deletion_reason] nvarchar(500) NULL,
    [last_modified_ip] varchar(45) NULL,
    CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([user_id])
);
ALTER TABLE [users] ADD CONSTRAINT [FK_users_created_by] FOREIGN KEY ([created_by]) REFERENCES [users] ([user_id]);
ALTER TABLE [users] ADD CONSTRAINT [FK_users_deleted_by] FOREIGN KEY ([deleted_by]) REFERENCES [users] ([user_id]);
ALTER TABLE [users] ADD CONSTRAINT [FK_users_roles] FOREIGN KEY ([role_id]) REFERENCES [roles] ([role_id]);
ALTER TABLE [users] ADD CONSTRAINT [FK_users_updated_by] FOREIGN KEY ([updated_by]) REFERENCES [users] ([user_id]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_users_email] ON [users] ([email]);
CREATE UNIQUE NONCLUSTERED INDEX [UQ_users_username] ON [users] ([username]);

-- Table: zones
CREATE TABLE [zones] (
    [zone_id] int NOT NULL,
    [zone_name] nvarchar(100) NOT NULL,
    [country_id] int NULL,
    [is_active] bit NULL DEFAULT ((1)),
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_zones] PRIMARY KEY CLUSTERED ([zone_id])
);
ALTER TABLE [zones] ADD CONSTRAINT [FK_zones_countries] FOREIGN KEY ([country_id]) REFERENCES [countries] ([country_id]);

GO

-- ============================================
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

