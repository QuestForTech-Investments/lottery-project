-- ============================================
-- LOTTERY DATABASE - COMPLETE BACKUP
-- Generated: 2025-11-07 11:22:07
-- Structure + Data
-- ============================================
-- Server: lottery-sql-1505.database.windows.net
-- Database: lottery-db
-- ============================================

USE [lottery-db];
GO

-- ============================================
-- Lottery Database - Complete Schema
-- Generated: 2025-11-07 11:22:07
-- Tables: 48 | Stored Procedures: 11 | Views: 9
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
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_lottery')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_lottery];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_bet_type')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_bet_type];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_lottery')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_lottery];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_bet_type')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_bet_type];
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
IF OBJECT_ID('[lottery_bet_type_compatibility]', 'U') IS NOT NULL DROP TABLE [lottery_bet_type_compatibility];
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

-- Table: lottery_bet_type_compatibility
CREATE TABLE [lottery_bet_type_compatibility] (
    [compatibility_id] int IDENTITY(1,1) NOT NULL,
    [lottery_id] int NOT NULL,
    [bet_type_id] int NOT NULL,
    [is_active] bit NOT NULL DEFAULT ((1)),
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_lottery_bet_type_compatibility] PRIMARY KEY CLUSTERED ([compatibility_id])
);
ALTER TABLE [lottery_bet_type_compatibility] ADD CONSTRAINT [FK_lottery_bet_type_compatibility_lottery] FOREIGN KEY ([lottery_id]) REFERENCES [lotteries] ([lottery_id]);
ALTER TABLE [lottery_bet_type_compatibility] ADD CONSTRAINT [FK_lottery_bet_type_compatibility_bet_type] FOREIGN KEY ([bet_type_id]) REFERENCES [bet_types] ([bet_type_id]);
CREATE NONCLUSTERED INDEX [IX_lottery_bet_type_compatibility_lottery] ON [lottery_bet_type_compatibility] ([lottery_id]);
CREATE NONCLUSTERED INDEX [IX_lottery_bet_type_compatibility_bet_type] ON [lottery_bet_type_compatibility] ([bet_type_id]);
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_lottery')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_lottery];
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_lottery_bet_type_compatibility_bet_type')
    ALTER TABLE [lottery_bet_type_compatibility] DROP CONSTRAINT [FK_lottery_bet_type_compatibility_bet_type];

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
-- INSERT DATA
-- ============================================

-- Disable foreign key constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- Table: countries (10 records)
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', 'United States', 'UN', '1', '2025-10-22 21:57:28.8633333', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', 'Dominican Republic', 'DO', '1', '2025-10-22 21:57:28.8800000', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', 'Cuba', 'CU', '1', '2025-10-22 21:57:28.8866667', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('4', 'Jamaica', 'JA', '1', '2025-10-22 21:57:28.8933333', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('5', 'Puerto Rico', 'PU', '1', '2025-10-22 21:57:28.9000000', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('6', 'Bahamas', 'BA', '1', '2025-10-22 21:57:28.9033333', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('7', 'Trinidad', 'TR', '1', '2025-10-22 21:57:28.9100000', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('8', 'Barbados', 'BA', '1', '2025-10-22 21:57:28.9133333', NULL, NULL, NULL);
INSERT INTO [countries] ([country_id], [country_name], [country_code], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('9', 'Panama', 'PA', '1', '2025-10-22 22:48:03.6100000', NULL, NULL, NULL);
GO

-- Table: game_categories (4 records)
INSERT INTO [game_categories] ([category_id], [category_name], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', 'Juegos Tradicionales', 'Juegos clásicos de lotería: Directo, Palé, Tripleta', '1', '2025-10-22 22:11:07.0533333', NULL, NULL, NULL);
INSERT INTO [game_categories] ([category_id], [category_name], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', 'Juegos Especiales', 'Juegos especiales con formatos únicos: Cash3, Play4, Pick5', '1', '2025-10-22 22:11:07.0800000', NULL, NULL, NULL);
INSERT INTO [game_categories] ([category_id], [category_name], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', 'Juegos Combinados', 'Juegos con combinaciones especiales: Super Palé, 6x1, etc.', '1', '2025-10-22 22:11:07.0866667', NULL, NULL, NULL);
GO

-- Table: bet_types (34 records)
SET IDENTITY_INSERT [bet_types] ON;
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('1', 'DIRECTO', 'Directo', 'Straight bet on exact number in exact position', '1', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('2', 'PALE', 'Palé', 'Two digits in any order', '2', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('3', 'TRIPLETA', 'Tripleta', 'Three digits in any order', '3', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('4', 'TERMINAL', 'Terminal', 'Last digit matches', '4', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('5', 'QUINIELA_PALE', 'Quiniela Palé', 'Pale bet in quiniela format', '5', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('6', 'SUPER_PALE', 'Super Palé', 'Enhanced pale bet with higher payout', '6', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('7', 'PATA_CABALLO', 'Pata de Caballo', 'Special combination bet', '7', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('8', 'CENTENA', 'Centena', 'Three digit bet', '8', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('9', 'PICK_TWO_FRONT', 'Pick Two Front', 'First two digits exact order', '9', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('10', 'PICK_TWO_BACK', 'Pick Two Back', 'Last two digits exact order', '10', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('11', 'PICK_TWO_MIDDLE', 'Pick Two Middle', 'Middle two digits exact order', '11', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('12', 'PICK_THREE_STRAIGHT', 'Pick Three Straight', 'Three digits in exact order', '12', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('13', 'PICK_THREE_BOX', 'Pick Three Box', 'Three digits in any order', '13', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('14', 'PICK_THREE_STRAIGHT_BOX', 'Pick Three Straight/Box', 'Combination of straight and box bet', '14', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('15', 'PICK_THREE_COMBO', 'Pick Three Combo', 'Multiple straight bets covering all combinations', '15', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('16', 'PICK_THREE_FRONT_PAIR', 'Pick Three Front Pair', 'First two digits match', '16', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('17', 'PICK_THREE_BACK_PAIR', 'Pick Three Back Pair', 'Last two digits match', '17', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('18', 'PICK_FOUR_STRAIGHT', 'Pick Four Straight', 'Four digits in exact order', '18', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('19', 'PICK_FOUR_BOX_24', 'Pick Four Box (24-way)', 'Four different digits in any order', '19', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('20', 'PICK_FOUR_BOX_12', 'Pick Four Box (12-way)', 'One pair of digits in any order', '20', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('21', 'PICK_FOUR_BOX_6', 'Pick Four Box (6-way)', 'Two pairs of digits in any order', '21', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('22', 'PICK_FOUR_BOX_4', 'Pick Four Box (4-way)', 'Three same digits in any order', '22', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('23', 'PICK_FOUR_STRAIGHT_BOX', 'Pick Four Straight/Box', 'Combination straight and box bet for Pick 4', '23', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('24', 'PICK_FOUR_COMBO', 'Pick Four Combo', 'All straight combinations for Pick 4', '24', '1', '2025-10-30 22:02:56.1666667', '2025-10-30 22:02:56.1666667');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('25', 'BOLITA_1', 'Bolita 1', 'Apuesta tipo Bolita posición 1', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('26', 'BOLITA_2', 'Bolita 2', 'Apuesta tipo Bolita posición 2', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('27', 'SINGULACION_1', 'Singulación 1', 'Apuesta tipo Singulación posición 1', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('28', 'SINGULACION_2', 'Singulación 2', 'Apuesta tipo Singulación posición 2', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('29', 'SINGULACION_3', 'Singulación 3', 'Apuesta tipo Singulación posición 3', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('30', 'PICK5_STRAIGHT', 'Pick 5 Straight', 'Pick 5 en orden exacto', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('31', 'PICK5_BOX', 'Pick 5 Box', 'Pick 5 en cualquier orden', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('32', 'PICK_TWO', 'Pick Two', 'Pick 2 genérico', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
INSERT INTO [bet_types] ([bet_type_id], [bet_type_code], [bet_type_name], [description], [display_order], [is_active], [created_at], [updated_at]) VALUES ('33', 'PANAMA', 'Panamá', 'Lotería de Panamá', '1', '1', '2025-10-31 11:23:33.3842558', '2025-10-31 11:23:33.3842558');
SET IDENTITY_INSERT [bet_types] OFF;
GO

-- Table: permissions (62 records)
SET IDENTITY_INSERT [permissions] ON;
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', 'ACCESS_SYSTEM', 'Acceso al sistema', 'Acceso al sistema', 'Permite el acceso básico al sistema', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', 'ADMIN_DASHBOARD', 'Dashboard administrativo', 'Acceso al sistema', 'Acceso al panel administrativo', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', 'OPERATIVE_DASHBOARD', 'Ver dashboard operativo', 'Acceso al sistema', 'Acceso al panel operativo', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('4', 'CHANGE_ADMIN_PASSWORDS', 'Cambiar contraseñas de administradores', 'Usuarios', 'Cambiar contraseñas de usuarios administradores', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('5', 'CHANGE_BANK_PASSWORDS', 'Cambiar contraseñas de bancas', 'Usuarios', 'Cambiar contraseñas de bancas', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('6', 'MANAGE_COLLECTORS', 'Cobradores', 'Usuarios', 'Gestionar cobradores del sistema', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('7', 'SEND_NOTIFICATIONS', 'Enviar notificaciones', 'Usuarios', 'Enviar notificaciones a usuarios', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('8', 'MANAGE_COLLECTORS_DETAIL', 'Manejar cobradores', 'Usuarios', 'Gestión detallada de cobradores', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('9', 'MANAGE_GROUP_SECURITY', 'Manejar seguridad del grupo', 'Usuarios', 'Gestionar seguridad y permisos del grupo', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('10', 'MANAGE_USERS', 'Manejar usuarios', 'Usuarios', 'Gestión completa de usuarios', '1', '2025-10-13 10:33:48.4300000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('11', 'VIEW_LOGIN_SESSIONS', 'Ver inicios de sesión', 'Usuarios', 'Ver historial de inicios de sesión', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('12', 'BALANCE_BANKS', 'Bancas', 'Balances', 'Ver balances de bancas', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('13', 'BALANCE_FINANCIAL_BANKS', 'Bancos', 'Balances', 'Ver balances de bancos', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('14', 'BALANCE_GROUPS', 'Grupos', 'Balances', 'Ver balances de grupos', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('15', 'VIEW_BANK_REPORT', 'Ver reporte de banca', 'Balances', 'Ver reportes detallados de bancas', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('16', 'BALANCE_ZONES', 'Zonas', 'Balances', 'Ver balances por zonas', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('17', 'CHANGE_GAME_PRIZES', 'Cambiar premios de jugadas', 'Tickets', 'Modificar premios de jugadas', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('18', 'CANCEL_TICKET', 'Cancelar ticket', 'Tickets', 'Cancelar tickets individuales', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('19', 'CANCEL_TICKETS_ANYTIME', 'Cancelar tickets en cualquier momento', 'Tickets', 'Cancelar tickets sin restricciones de tiempo', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('20', 'GAMES_BY_DRAW_QUICK', 'Jugadas por sorteo (acceso rápido)', 'Tickets', 'Acceso rápido a jugadas por sorteo', '1', '2025-10-13 10:33:48.5666667', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('21', 'PLAY_WITHOUT_AVAILABILITY', 'Jugar sin disponibilidad', 'Tickets', 'Permitir jugar sin fondos disponibles', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('22', 'CLEAR_PENDING_PAYMENTS', 'Limpiar pendientes de pago', 'Tickets', 'Limpiar pagos pendientes', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('23', 'MARK_TICKET_AS_PAID', 'Marcar cualquier ticket como pago', 'Tickets', 'Marcar tickets como pagados', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('24', 'TICKET_MONITORING', 'Monitoreo de tickets', 'Tickets', 'Monitorear actividad de tickets', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('25', 'SELL_AS_ANY_BANK', 'Vender como cualquier banca', 'Tickets', 'Vender tickets desde cualquier banca', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('26', 'SELL_OUT_OF_HOURS', 'Vender fuera de horario', 'Tickets', 'Vender tickets fuera del horario normal', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('27', 'SELL_TICKETS', 'Vender tickets', 'Tickets', 'Vender tickets normalmente', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('28', 'VIEW_ANOMALIES', 'Ver anomalías', 'Tickets', 'Ver anomalías en tickets', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('29', 'BLOCK_NUMBERS_QUICK', 'Bloqueo de números (acceso rápido)', 'Sorteos', 'Bloqueo rápido de números', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('30', 'MANAGE_EXCEEDANCES', 'Manejar excedentes', 'Sorteos', 'Gestionar excedentes de sorteos', '1', '2025-10-13 10:33:48.7000000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('31', 'MANAGE_DRAW_SCHEDULES', 'Manejar horario de sorteos', 'Sorteos', 'Gestionar horarios de sorteos', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('32', 'MANAGE_LIMITS', 'Manejar límites', 'Sorteos', 'Gestionar límites de apuestas', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('33', 'MANAGE_DRAWS', 'Manejar sorteos', 'Sorteos', 'Gestión completa de sorteos', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('34', 'PUBLISH_RESULTS_QUICK', 'Publicación de resultado (acceso rápido)', 'Sorteos', 'Publicación rápida de resultados', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('35', 'PUBLISH_PAST_RESULTS', 'Publicar resultados de días pasados', 'Sorteos', 'Publicar resultados históricos', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('36', 'PUBLISH_TODAY_RESULTS', 'Publicar resultados de hoy', 'Sorteos', 'Publicar resultados del día actual', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('37', 'CREATE_ADJUSTMENTS', 'Crear ajustes', 'Transacciones', 'Crear ajustes contables', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('38', 'CREATE_EXPENSE_CATEGORIES', 'Crear categorías de gastos', 'Transacciones', 'Crear categorías de gastos', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('39', 'CREATE_COLLECTIONS', 'Crear cobros', 'Transacciones', 'Crear transacciones de cobro', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('40', 'CREATE_PAYMENTS', 'Crear pagos', 'Transacciones', 'Crear transacciones de pago', '1', '2025-10-13 10:33:48.8433333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('41', 'CREATE_WITHDRAWALS', 'Crear retiros', 'Transacciones', 'Crear transacciones de retiro', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('42', 'MANAGE_ACCOUNTING_ENTITIES', 'Manejar entidades contables', 'Transacciones', 'Gestionar entidades contables', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('43', 'MANAGE_TRANSACTIONS', 'Manejar transacciones', 'Transacciones', 'Gestión completa de transacciones', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('44', 'PAYMENTS_COLLECTIONS_QUICK', 'Pagos y cobros (acceso rápido)', 'Transacciones', 'Acceso rápido a pagos y cobros', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('45', 'SIMPLIFIED_TRANSACTIONS', 'Transacciones simplificadas', 'Transacciones', 'Interface simplificada de transacciones', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('46', 'VIEW_ALL_TRANSACTION_GROUPS', 'Ver todos los grupos de transacciones', 'Transacciones', 'Ver todos los grupos de transacciones', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('47', 'BANK_ACCESS', 'Acceso de bancas', 'Bancas', 'Acceso a funciones de bancas', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('48', 'CREATE_BANKS', 'Crear bancas', 'Bancas', 'Crear nuevas bancas', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('49', 'EDIT_ACCUMULATED_FALL', 'Editar caída acumulada', 'Bancas', 'Editar caída acumulada de bancas', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('50', 'MANAGE_BANKS', 'Manejar bancas', 'Bancas', 'Gestión completa de bancas', '1', '2025-10-13 10:33:48.9800000', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('51', 'VIEW_BANKS_NO_SALES', 'Ver bancas sin ventas', 'Bancas', 'Ver bancas que no han tenido ventas', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('52', 'PROCESS_TODAY_TICKETS', 'Procesar tickets de hoy', 'Ventas', 'Procesar tickets del día actual', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('53', 'PROCESS_YESTERDAY_SALES', 'Procesar ventas de ayer', 'Ventas', 'Procesar ventas del día anterior', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('54', 'VIEW_IMPORTED_EXPORTED_JACKPOT', 'Ver bote importado / exportado', 'Ventas', 'Ver movimientos de bote', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('55', 'VIEW_SALES', 'Ver ventas', 'Ventas', 'Ver información de ventas', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('56', 'VIEW_GROUP_SALES', 'Ver ventas de grupos', 'Ventas', 'Ver ventas por grupos', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('57', 'VIEW_ASSOCIATED_GROUP_SALES', 'Ver ventas de grupos asociados', 'Ventas', 'Ver ventas de grupos asociados', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('58', 'MANAGE_EXTERNAL_AGENTS', 'Manejar agentes externos', 'Otros', 'Gestionar agentes externos', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('59', 'MANAGE_MY_GROUP', 'Manejar mi grupo', 'Otros', 'Gestionar el grupo propio', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('60', 'MANAGE_LOANS', 'Manejar préstamos', 'Otros', 'Gestionar préstamos del sistema', '1', '2025-10-13 10:33:49.1133333', NULL, NULL, NULL);
INSERT INTO [permissions] ([permission_id], [permission_code], [permission_name], [category], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('61', 'MANAGE_EMAIL_RECIPIENTS', 'Manejar receptores de correos', 'Otros', 'Gestionar receptores de correos electrónicos', '1', '2025-10-13 10:33:49.2533333', NULL, NULL, NULL);
SET IDENTITY_INSERT [permissions] OFF;
GO

-- Table: roles (1 records)
GO

-- Table: zones (17 records)
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', 'GRUPO JM MA ***', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', 'GRUPO LUIS !', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', 'GRUPO HOUSTON TX', '1', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('4', 'GRUPO ALEX $', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('5', 'GRUPO JONATHAN #', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('6', 'GRUPO JM AME ***', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('7', 'GRUPO LOVERA ***', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('8', 'GRUPO KENDRICK TL', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('9', 'GRUPO QUESTFORTECH —', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('10', 'GRUPO PARACHE ^^', '2', '1', '2025-10-24 10:12:07.2333333', '11', '2025-10-24 10:12:07.2333333', '11');
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('11', 'GRUPO TEST UPDATED', '2', '0', '2025-10-24 11:28:59.6276473', NULL, '2025-10-24 11:29:05.1872542', NULL);
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('12', 'Test Zone Without Country', NULL, '1', '2025-10-27 17:23:46.0595596', NULL, '2025-10-27 17:23:46.0595741', NULL);
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('13', 'Test Zone With Country', '1', '1', '2025-10-27 17:24:20.9914576', NULL, '2025-10-27 17:24:20.9914588', NULL);
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('14', 'ZONA PRUEBA', NULL, '1', '2025-10-27 17:27:55.2785796', NULL, '2025-10-27 17:27:55.2785807', NULL);
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('15', 'ZONA PRUEBA 1', NULL, '1', '2025-10-27 17:28:44.6455517', NULL, '2025-10-27 18:11:23.7243597', NULL);
INSERT INTO [zones] ([zone_id], [zone_name], [country_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('16', 'ZONA PRUEBA 3', NULL, '0', '2025-10-27 17:32:06.0839100', NULL, '2025-10-27 18:11:09.1664625', NULL);
GO

-- Table: lotteries (70 records)
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('1', '1', 'FLORIDA AM', 'State', 'Florida state Pick 4 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '4');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('2', '1', 'FLORIDA PM', 'State', 'Florida state Pick 3 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '5');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('3', '1', 'GEORGIA-MID AM', 'State', 'Georgia state Pick 4 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '13');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('4', '1', 'GEORGIA EVENING', 'State', 'Georgia state Pick 3 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '14');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('5', '1', 'NEW YORK DAY', 'State', 'New York state Pick 4 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '2');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('6', '1', 'NEW YORK NIGHT', 'State', 'New York state Pick 3 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '3');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('7', '1', 'CALIFORNIA AM', 'State', 'California state Pick 4 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '20');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('8', '2', 'King Lottery AM', 'Local', 'Dominican Republic King Lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '55');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('9', '2', 'LOTEKA', 'Local', 'Dominican Republic LOTEKA', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '10');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('10', '2', 'MASS PM', 'Local', 'Dominican Republic Loto Pool', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '46');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('11', '2', 'DELAWARE PM', 'Local', 'Dominican Republic Loto Real', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '60');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('12', '2', 'NEW JERSEY PM', 'Local', 'Dominican Republic New York Stock', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '17');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('13', '2', 'CONNECTICUT PM', 'Local', 'Dominican Republic Florida Stock', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '19');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('14', '2', 'CALIFORNIA PM', 'Local', 'Dominican Republic Mega Chance', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '21');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('15', '3', 'CHICAGO PM', 'Local', 'Cuba Havana Pick 4', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '23');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('16', '3', 'PENN EVENING', 'Local', 'Cuba Santiago Pick 3', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '25');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('17', '4', 'INDIANA EVENING', 'Local', 'Jamaica Kingston Lucky', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '27');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('18', '4', 'SUPER PALE NOCHE', 'Local', 'Jamaica Montego Bay Pick', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '32');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('19', '5', 'SUPER PALE NY-FL AM', 'Local', 'Puerto Rico San Juan Lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '33');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('20', '5', 'SUPER PALE NY-FL PM', 'Local', 'Puerto Rico Bayamon Pick', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '34');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('21', '6', 'TEXAS DAY', 'Local', 'Bahamas Nassau Numbers', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '36');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('22', '6', 'TEXAS EVENING', 'Local', 'Bahamas Freeport Pick', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '37');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('23', '7', 'TEXAS NIGHT', 'Local', 'Trinidad Port of Spain Pick', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '38');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('24', '7', 'VIRGINIA PM', 'Local', 'Trinidad San Fernando Lucky', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '40');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('25', '8', 'SOUTH CAROLINA PM', 'Local', 'Barbados Bridgetown Numbers', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '42');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('26', '8', 'MARYLAND EVENING', 'Local', 'Barbados Speightstown Pick', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '44');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('27', '1', 'TEXAS MORNING', 'State', 'Texas state Pick 4 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '35');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('28', '1', 'Anguila 6PM', 'State', 'Illinois state Pick 3 lottery', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '62');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('29', '2', 'GEORGIA NIGHT', 'National', 'Dominican Republic Super Lotto', '1', '2025-10-13 01:02:16.2066667', NULL, NULL, NULL, '15');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('30', '1', 'INDIANA MIDDAY', 'State', 'Indiana state Pick 3 lottery', '1', '2025-10-22 22:49:06.3400000', NULL, NULL, NULL, '26');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('31', '1', 'NEW JERSEY AM', 'State', 'New Jersey state Pick 3 lottery', '1', '2025-10-22 22:49:06.3500000', NULL, NULL, NULL, '16');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('32', '1', 'PENN MIDDAY', 'State', 'Pennsylvania state Pick 3 lottery', '1', '2025-10-22 22:49:06.3566667', NULL, NULL, NULL, '24');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('33', '1', 'VIRGINIA AM', 'State', 'Virginia state Pick 3 lottery', '1', '2025-10-22 22:49:06.3600000', NULL, NULL, NULL, '39');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('34', '1', 'DELAWARE AM', 'State', 'Delaware state Pick 3 lottery', '1', '2025-10-22 22:49:32.7600000', NULL, NULL, NULL, '59');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('35', '1', 'NORTH CAROLINA AM', 'State', 'North Carolina state Pick 3 lottery', '1', '2025-10-22 22:49:32.7666667', NULL, NULL, NULL, '48');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('36', '1', 'Anguila 9pm', 'State', 'Ohio state Pick 3 lottery', '1', '2025-10-22 22:49:32.7700000', NULL, NULL, NULL, '63');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('37', '1', 'CHICAGO AM', 'State', 'Chicago/Illinois Pick 3 lottery', '1', '2025-10-22 22:49:32.7733333', NULL, NULL, NULL, '22');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('38', '1', 'CONNECTICUT AM', 'State', 'Connecticut state Pick 3 lottery', '1', '2025-10-22 22:49:57.2600000', NULL, NULL, NULL, '18');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('39', '1', 'MARYLAND MIDDAY', 'State', 'Maryland state Pick 3 lottery', '1', '2025-10-22 22:49:57.2733333', NULL, NULL, NULL, '43');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('40', '1', 'SOUTH CAROLINA AM', 'State', 'South Carolina state Pick 3 lottery', '1', '2025-10-22 22:49:57.2800000', NULL, NULL, NULL, '41');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('41', '1', 'Anguila 10am', 'State', 'Mississippi state Pick 3 lottery', '1', '2025-10-22 22:49:57.2866667', NULL, NULL, NULL, '64');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('42', '2', 'Anguila 1pm', 'Local', 'Dominican Republic Anguila lottery', '1', '2025-10-22 22:50:27.6866667', NULL, NULL, NULL, '61');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('43', '2', 'LA PRIMERA', 'Local', 'Dominican Republic La Primera lottery', '1', '2025-10-22 22:50:27.6966667', NULL, NULL, NULL, '1');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('44', '2', 'LA SUERTE', 'Local', 'Dominican Republic La Suerte lottery', '1', '2025-10-22 22:50:27.7066667', NULL, NULL, NULL, '47');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('45', '2', 'GANA MAS', 'Local', 'Dominican Republic Gana Mas lottery', '1', '2025-10-22 22:50:27.7100000', NULL, NULL, NULL, '6');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('46', '2', 'LOTEDOM', 'Local', 'Dominican Republic Lotedom lottery', '1', '2025-10-22 22:50:51.8433333', NULL, NULL, NULL, '50');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('47', '2', 'NACIONAL', 'National', 'Dominican Republic Nacional (official national lottery)', '1', '2025-10-22 22:50:51.8500000', NULL, NULL, NULL, '7');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('48', '2', 'NORTH CAROLINA PM', 'Local', 'Dominican Republic La Fortuna lottery', '1', '2025-10-22 22:50:51.8533333', NULL, NULL, NULL, '49');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('49', '2', 'REAL', 'Local', 'Dominican Republic La Real lottery', '1', '2025-10-22 22:50:51.8600000', NULL, NULL, NULL, '9');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('50', '2', 'SUPER PALE TARDE', 'Local', 'Dominican Republic Super Pale lottery', '1', '2025-10-22 22:51:19.2800000', NULL, NULL, NULL, '31');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('51', '2', 'FL PICK2 AM', 'Local', 'Florida Pick 2 lottery (DR market)', '1', '2025-10-22 22:51:19.2866667', NULL, NULL, NULL, '11');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('52', '2', 'FL PICK2 PM', 'Local', 'New York - Florida 6x1 combination lottery', '1', '2025-10-22 22:51:19.2933333', NULL, NULL, NULL, '12');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('53', '9', 'PANAMA MIERCOLES', 'National', 'Panama national lottery', '1', '2025-10-22 22:51:40.7100000', NULL, NULL, NULL, '67');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('54', '5', 'L.E. PUERTO RICO 2PM', 'Local', 'Loteria Electronica Puerto Rico', '1', '2025-10-22 22:51:56.3766667', NULL, NULL, NULL, '57');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('55', '2', 'PANAMA DOMINGO', 'Local', 'Dominican Republic Diaria lottery', '1', '2025-10-22 23:03:42.4000000', NULL, NULL, NULL, '68');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('56', '2', 'LA CHICA', 'Local', 'Dominican Republic La Chica lottery', '1', '2025-10-22 23:03:42.4333333', NULL, NULL, NULL, '65');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('57', '1', 'MASS AM', 'State', 'Massachusetts state Pick 3 lottery', '1', '2025-10-22 23:03:42.4400000', NULL, NULL, NULL, '45');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('58', '2', 'NY AM 6x1', 'Local', 'New York AM 6x1 combination lottery', '1', '2025-10-22 23:03:42.4433333', NULL, NULL, NULL, '51');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('59', '2', 'FL AM 6X1', 'Local', 'Florida AM 6x1 combination lottery', '1', '2025-10-22 23:03:42.4500000', NULL, NULL, NULL, '53');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('60', '1', 'L.E. PUERTO RICO 10PM', 'State', 'Play 4 lottery', '1', '2025-10-22 23:04:13.9600000', NULL, NULL, NULL, '58');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('61', '2', 'QUINIELA PALE', 'Local', NULL, '1', '2025-10-29 19:49:47.5300000', NULL, '2025-10-29 19:49:47.5300000', NULL, '8');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('62', '2', 'LA PRIMERA 8PM', 'Local', NULL, '1', '2025-10-29 19:49:47.5600000', NULL, '2025-10-29 19:49:47.5600000', NULL, '66');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('63', '2', 'LA SUERTE 6:00pm', 'Local', NULL, '1', '2025-10-29 19:49:47.5700000', NULL, '2025-10-29 19:49:47.5700000', NULL, '69');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('64', '2', 'DIARIA 11AM', 'Local', NULL, '1', '2025-10-29 19:49:47.5733333', NULL, '2025-10-29 19:49:47.5733333', NULL, '28');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('65', '2', 'DIARIA 3PM', 'Local', NULL, '1', '2025-10-29 19:49:47.5900000', NULL, '2025-10-29 19:49:47.5900000', NULL, '29');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('66', '2', 'DIARIA 9PM', 'Local', NULL, '1', '2025-10-29 19:49:47.5966667', NULL, '2025-10-29 19:49:47.5966667', NULL, '30');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('67', '2', 'NY PM 6x1', 'Local', NULL, '1', '2025-10-29 19:49:47.6033333', NULL, '2025-10-29 19:49:47.6033333', NULL, '52');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('68', '2', 'FL PM 6X1', 'Local', NULL, '1', '2025-10-29 19:49:47.6166667', NULL, '2025-10-29 19:49:47.6166667', NULL, '54');
INSERT INTO [lotteries] ([lottery_id], [country_id], [lottery_name], [lottery_type], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [display_order]) VALUES ('69', '2', 'King Lottery PM', 'Local', NULL, '1', '2025-10-29 19:49:47.6233333', NULL, '2025-10-29 19:49:47.6233333', NULL, '56');
GO

-- Table: game_types (22 records)
SET IDENTITY_INSERT [game_types] ON;
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', '1', 'DIRECTO', 'Directo', 'Juego de 2 dígitos - Premio x80', '80.00', '0', '2', '1', '1', '2025-10-22 22:12:46.8000000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', '1', 'PALE', 'Palé', 'Juego de 4 dígitos - Premio x600', '600.00', '0', '4', '2', '1', '2025-10-22 22:12:46.8100000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', '1', 'TRIPLETA', 'Tripleta', 'Juego de 6 dígitos - Premio x8000', '8000.00', '0', '6', '3', '1', '2025-10-22 22:12:46.8166667', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('4', '2', 'CASH3_STRAIGHT', 'Cash3 Straight', 'Cash3 de 3 dígitos - Premio x500', '500.00', '0', '3', '4', '1', '2025-10-22 22:12:46.8233333', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('5', '2', 'CASH3_BOX', 'Cash3 Box', 'Cash3 de 3 dígitos + signo - Premio x80', '80.00', '1', '3', '5', '1', '2025-10-22 22:12:46.8300000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('6', '2', 'CASH3_FRONT_STRAIGHT', 'Cash3 Front Straight', 'Cash3 de 3 dígitos + F', '250.00', '1', '3', '6', '1', '2025-10-22 22:12:46.8333333', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('7', '2', 'CASH3_FRONT_BOX', 'Cash3 Front Box', 'Cash3 de 3 dígitos + F+', '80.00', '1', '3', '7', '1', '2025-10-22 22:12:46.8400000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('8', '2', 'CASH3_BACK_STRAIGHT', 'Cash3 Back Straight', 'Cash3 de 3 dígitos + B', '250.00', '1', '3', '8', '1', '2025-10-22 22:12:46.8566667', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('9', '2', 'CASH3_BACK_BOX', 'Cash3 Back Box', 'Cash3 de 3 dígitos + B+', '80.00', '1', '3', '9', '1', '2025-10-22 22:12:46.8633333', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('10', '2', 'PLAY4_STRAIGHT', 'Play4 Straight', 'Play4 de 4 dígitos + -', '5000.00', '1', '4', '10', '1', '2025-10-22 22:12:46.8766667', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('11', '2', 'PLAY4_BOX', 'Play4 Box', 'Play4 de 4 dígitos + +', '200.00', '1', '4', '11', '1', '2025-10-22 22:12:46.8800000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('12', '2', 'PICK5_STRAIGHT', 'Pick5 Straight', 'Pick5 de 5 dígitos + -', '50000.00', '1', '5', '12', '1', '2025-10-22 22:13:06.3900000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('13', '2', 'PICK5_BOX', 'Pick5 Box', 'Pick5 de 5 dígitos + +', '1000.00', '1', '5', '13', '1', '2025-10-22 22:13:06.3966667', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('14', '3', 'SUPER_PALE', 'Super Palé', 'Super Palé de 4 dígitos', '1200.00', '0', '4', '14', '1', '2025-10-22 22:13:06.4033333', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('15', '3', 'PICK2', 'Pick2', 'Pick2 de 2 dígitos', '90.00', '0', '2', '15', '1', '2025-10-22 22:13:06.4100000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('16', '3', 'PICK2_FRONT', 'Pick2 Front', 'Pick2 de 2 dígitos + F', '90.00', '1', '2', '16', '1', '2025-10-22 22:13:06.4166667', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('17', '3', 'PICK2_BACK', 'Pick2 Back', 'Pick2 de 2 dígitos + B', '90.00', '1', '2', '17', '1', '2025-10-22 22:13:06.4233333', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('18', '3', 'PICK2_MIDDLE', 'Pick2 Middle', 'Pick2 de 2 dígitos + -3', '90.00', '1', '2', '18', '1', '2025-10-22 22:13:06.4300000', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('19', '3', 'BOLITA', 'Bolita', 'Bolita de 2 dígitos + rango', '70.00', '1', '2', '19', '1', '2025-10-22 22:13:06.4366667', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('20', '3', 'SINGULACION', 'Singulación', 'Singulación de 1 dígito + rango', '8.00', '1', '1', '20', '1', '2025-10-22 22:13:06.4433333', NULL, NULL, NULL);
INSERT INTO [game_types] ([game_type_id], [category_id], [game_type_code], [game_name], [description], [prize_multiplier], [requires_additional_number], [number_length], [display_order], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('21', '3', 'PANAMA', 'Panamá', 'Panamá de 4 dígitos + -', '5000.00', '1', '4', '21', '1', '2025-10-22 22:13:06.4500000', NULL, NULL, NULL);
SET IDENTITY_INSERT [game_types] OFF;
GO

-- Table: users (25 records)
SET IDENTITY_INSERT [users] ON;
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('1', 'testuser1', '$2a$11$nNFYQrhbOZW.vnmqDwYGueAQs3TUUPitM7khNVF7aWNRfKlR2OXoy', 'test1@example.com', 'Test User 1', NULL, NULL, '.00', '1', '2025-10-23 07:03:06.3518211', '2025-10-23 06:37:17.2305500', '2025-10-27 14:04:53.7300439', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('2', 'testuser', '$2a$11$VjK2eug0tlrT4MX8Wbgm.O8sQPLyMRcltawhX9nyFLWpvCBKmrZPi', 'test@example.com', 'Test User', NULL, NULL, '.00', '1', '2025-10-23 10:04:00.5687019', '2025-10-23 08:39:38.7536406', '2025-10-23 08:39:38.1274651', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('3', 'usuario_prueba_1', '$2a$11$6qYUWGMUnTfkPOz5pKA97ehu6Q.lMLuBSwQGlM/AdWfaCzOlxV0Kq', 'usuario1@test.com', 'Usuario Prueba Uno', '809-555-0001', NULL, '5.50', '1', NULL, '2025-10-23 13:49:55.3429895', '2025-10-23 13:49:55.3430667', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('4', 'test_user_1761227738_1', '$2a$11$ubsIq55Y3TaMCl8/Q/J11umqltFXfWOmqKrvAmkoefX9smAqfflO6', 'user1_1761227738@test.com', 'Test User One', '809-555-0001', NULL, '5.50', '1', NULL, '2025-10-23 13:55:38.6328425', '2025-10-23 13:55:38.6329095', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('5', 'demo_user_1761227999_1', '$2a$11$GrxqDS8.9kCG7crOsOiCy.SA.7BC.FG375IOrYnSoQll7mHhSk4WO', 'demo1_1761227999@test.com', 'Demo User One', '809-555-0001', NULL, '5.50', '1', NULL, '2025-10-23 14:00:09.6561369', '2025-10-23 14:00:09.6562126', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('6', 'demo_user_1761228240_1', '$2a$11$GfwEZdlYz8oQlOTKr86iyerIIM9nkmX8z/ttWaqEqCBUuYvb0z/ly', 'demo1_1761228240@test.com', 'Demo User One', '809-555-0001', NULL, '5.50', '1', NULL, '2025-10-23 14:04:00.9949672', '2025-10-23 14:04:00.9949682', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('7', 'demo_user_1761228240_2', '$2a$11$6sUJ7umBiNuvApcSzYFQSOBzu/DZRSaxqi8h0W94KTrUi6LZF5eya', 'demo2_1761228240@test.com', 'Demo User Two', '809-555-0002', NULL, '7.50', '0', NULL, '2025-10-23 14:04:02.6143557', '2025-10-23 14:04:05.1401534', NULL, NULL, '2025-10-23 14:04:05.1401536', NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('8', 'frontend_test', '$2a$11$mXZfshz08Ls8nagzaaszW.jeDn65F46P2IBvzVqMRmG8VIe9ftfCy', 'frontend@test.com', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-23 10:50:48.0543950', '2025-10-23 10:50:47.7023881', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('9', 'frontendv2_test', '$2a$11$dS6edY65q6K1CMrGVnNMqeigrPctsrlw00qhNmAv/EsgiczE6RBFK', 'frontendv2@test.com', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-23 16:27:45.3327325', '2025-10-23 16:27:44.7081806', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('10', 'logintest', '$2a$11$.m0y.hYCSMFUTWaQiVICRu4TxPXm8FdEDeu6cyaKSxZgOJ0vqjWim', 'logintest@test.com', NULL, NULL, NULL, '.00', '1', '2025-10-23 17:06:06.0899268', '2025-10-23 17:05:46.0284634', '2025-10-23 17:05:45.7768389', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('11', 'admin', '$2a$11$gqaxD25xj8xpel19WapbgO2kbfZeBW6nYnJTrIoXR49SdYUCHLlg6', 'admin@lottery.com', 'Admin User', NULL, NULL, '.00', '1', '2025-11-01 18:23:56.3843347', '2025-10-23 23:18:16.3320881', '2025-10-23 23:18:16.0982305', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('12', 'testuser_1761365031088', '$2a$11$QunTP.dkPI2QnHnXrXblNe.907ZqQ6T2D2mzKzEp4LtWMuQqZGy7.', NULL, NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 04:03:51.9669015', '2025-10-25 04:03:51.9669820', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('14', 'testuser_1761365547595', '$2a$11$YLyE6dOaNad.R.K2MJyT4eJgUdshYscTgbggKF0mYTEzvVI3miORi', 'testuser_1761365547595@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 04:12:28.7407027', '2025-10-25 04:12:28.7407983', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('15', 'testuser_1761366136429', '$2a$11$XX.d9ynWubooiwqdlmrm3ef0t4Sq4cSZEJsvzOrE/fvyRmcjqlKIy', 'testuser_1761366136429@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 04:22:17.4716018', '2025-10-25 04:22:17.4716546', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('16', 'testuser_1761366466433', '$2a$11$JLxwbhT5Q.pK645TJRHlIeaK0tLAwFZ9zVMcqjiUkcnAqhFuhk.1O', 'testuser_1761366466433@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 04:27:46.7754504', '2025-10-25 04:27:46.7754510', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('17', 'testuser_1761367057096', '$2a$11$ndgQBt5bP/Cfbxm81FeDw.O3VHkM0cqoVQTdKhO/LIV27ZD6PiJK.', 'testuser_1761367057096@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 04:37:37.4415577', '2025-10-25 04:37:37.4415583', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('18', 'testuser_1761367168388', '$2a$11$P60cUAtLqYqOCjRR7Nnb9eYRJm6LUAdOZV81AgA7pjoSNVfIDAVrC', 'testuser_1761367168388@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 04:39:28.7273822', '2025-10-25 04:39:28.7273833', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('19', 'TestUser2', '$2a$11$L44UWx/1mxSCM/MJ2Yb6bO4.etIrksQ0fBHawcxaOrwk0a7.7ILPC', 'TestUser2@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 11:04:32.9029708', '2025-10-25 11:04:32.9030329', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('20', 'TestUser3', '$2a$11$RljoviaaDtKpnvPG1g5muuX.gXnOgRQQ09KK67/WnAXzFqLjMKTvm', 'TestUser3@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 11:14:35.2574423', '2025-10-25 11:14:35.2574429', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('21', 'usuario2', '$2a$11$SInLVkroIixXSvgascSg.OFk7j8qkG7IGbI.OPQlJj7fJQ50wHLm6', 'usuario2@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 11:19:07.7160640', '2025-10-25 11:19:07.7160647', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('22', 'sdd', '$2a$11$aVfED/qRwlIm4Wc5DfN84ex22rz1TF6.VSLBJijvf5Glq2bldwIaG', 'sdd@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 11:32:12.7017228', '2025-10-25 11:32:12.7017234', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('23', 'jorge@disercoin.com', '$2a$11$t.pCOWh9mV6kZEBD1vqXreeChZmzaI/KfLuCnFmNmT2nmU.KPuwj6', 'jorge@disercoin.com@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 11:49:49.5636066', '2025-10-25 11:49:49.5636078', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('24', 'aaaa', '$2a$11$vl3gE5uDGmRMx4uXd1/xOuxkDeInvR.rZI8rrQFu4rbLKFXd4.0GK', 'aaaa@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 11:53:42.7419539', '2025-10-26 19:34:04.8277154', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [users] ([user_id], [username], [password_hash], [email], [full_name], [phone], [role_id], [commission_rate], [is_active], [last_login_at], [created_at], [updated_at], [created_by], [updated_by], [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]) VALUES ('25', 'fff', '$2a$11$7Hmpwob9gZoWp8Q.6wX3yu5FWfM0fV1GdvQkDHSRc6gk8xDuBbS3q', 'fff@lottery.local', NULL, NULL, NULL, '.00', '1', NULL, '2025-10-25 17:02:58.3109503', '2025-10-25 17:02:58.3109509', NULL, NULL, NULL, NULL, NULL, NULL);
SET IDENTITY_INSERT [users] OFF;
GO

-- Table: lottery_game_compatibility (276 records)
SET IDENTITY_INSERT [lottery_game_compatibility] ON;
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('1', '9', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('2', '9', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('3', '9', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('4', '9', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('5', '10', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('6', '10', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('7', '10', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('8', '10', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('9', '11', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('10', '11', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('11', '11', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('12', '11', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('13', '29', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('14', '29', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('15', '29', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('16', '29', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('17', '42', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('18', '42', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('19', '42', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('20', '42', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('21', '43', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('22', '43', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('23', '43', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('24', '43', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('25', '44', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('26', '44', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('27', '44', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('28', '44', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('29', '45', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('30', '45', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('31', '45', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('32', '45', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('33', '46', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('34', '46', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('35', '46', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('36', '46', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('37', '47', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('38', '47', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('39', '47', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('40', '47', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('41', '48', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('42', '48', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('43', '48', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('44', '48', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('45', '49', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('46', '49', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('47', '49', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('48', '49', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('49', '50', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('50', '50', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('51', '50', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('52', '50', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('53', '55', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('54', '55', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('55', '55', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('56', '55', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('57', '56', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('58', '56', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('59', '56', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('60', '56', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('61', '61', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('62', '61', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('63', '61', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('64', '61', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('65', '62', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('66', '62', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('67', '62', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('68', '62', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('69', '63', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('70', '63', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('71', '63', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('72', '63', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('73', '64', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('74', '64', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('75', '64', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('76', '64', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('77', '65', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('78', '65', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('79', '65', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('80', '65', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('81', '66', '1', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('82', '66', '2', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('83', '66', '14', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('84', '66', '3', '1', '2025-10-29 21:18:53.0700000', '2025-10-29 21:18:53.0700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('85', '51', '15', '1', '2025-10-29 21:18:53.0900000', '2025-10-29 21:18:53.0900000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('86', '51', '17', '1', '2025-10-29 21:18:53.0900000', '2025-10-29 21:18:53.0900000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('87', '51', '16', '1', '2025-10-29 21:18:53.0900000', '2025-10-29 21:18:53.0900000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('88', '51', '18', '1', '2025-10-29 21:18:53.0900000', '2025-10-29 21:18:53.0900000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('89', '2', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('90', '4', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('91', '6', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('92', '16', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('93', '28', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('94', '30', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('95', '31', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('96', '32', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('97', '33', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('98', '34', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('99', '35', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('100', '36', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('101', '37', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('102', '38', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('103', '39', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('104', '40', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('105', '41', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('106', '57', '4', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('107', '2', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('108', '4', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('109', '6', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('110', '16', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('111', '28', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('112', '30', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('113', '31', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('114', '32', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('115', '33', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('116', '34', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('117', '35', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('118', '36', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('119', '37', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('120', '38', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('121', '39', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('122', '40', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('123', '41', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('124', '57', '5', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('125', '2', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('126', '4', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('127', '6', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('128', '16', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('129', '28', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('130', '30', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('131', '31', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('132', '32', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('133', '33', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('134', '34', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('135', '35', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('136', '36', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('137', '37', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('138', '38', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('139', '39', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('140', '40', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('141', '41', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('142', '57', '6', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('143', '2', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('144', '4', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('145', '6', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('146', '16', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('147', '28', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('148', '30', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('149', '31', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('150', '32', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('151', '33', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('152', '34', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('153', '35', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('154', '36', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('155', '37', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('156', '38', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('157', '39', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('158', '40', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('159', '41', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('160', '57', '7', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('161', '2', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('162', '4', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('163', '6', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('164', '16', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('165', '28', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('166', '30', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('167', '31', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('168', '32', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('169', '33', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('170', '34', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('171', '35', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('172', '36', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('173', '37', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('174', '38', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('175', '39', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('176', '40', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('177', '41', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('178', '57', '8', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('179', '2', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('180', '4', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('181', '6', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('182', '16', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('183', '28', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('184', '30', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('185', '31', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('186', '32', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('187', '33', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('188', '34', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('189', '35', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('190', '36', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('191', '37', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('192', '38', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('193', '39', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('194', '40', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('195', '41', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('196', '57', '9', '1', '2025-10-29 21:18:53.1000000', '2025-10-29 21:18:53.1000000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('197', '1', '11', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('198', '3', '11', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('199', '5', '11', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('200', '7', '11', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('201', '15', '11', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('202', '27', '11', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('203', '60', '11', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('204', '1', '10', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('205', '3', '10', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('206', '5', '10', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('207', '7', '10', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('208', '15', '10', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('209', '27', '10', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('210', '60', '10', '1', '2025-10-29 21:18:53.1133333', '2025-10-29 21:18:53.1133333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('211', '8', '1', '1', '2025-10-29 21:18:53.1233333', '2025-10-29 21:18:53.1233333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('212', '69', '1', '1', '2025-10-29 21:18:53.1233333', '2025-10-29 21:18:53.1233333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('213', '8', '2', '1', '2025-10-29 21:18:53.1233333', '2025-10-29 21:18:53.1233333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('214', '69', '2', '1', '2025-10-29 21:18:53.1233333', '2025-10-29 21:18:53.1233333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('215', '8', '3', '1', '2025-10-29 21:18:53.1233333', '2025-10-29 21:18:53.1233333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('216', '69', '3', '1', '2025-10-29 21:18:53.1233333', '2025-10-29 21:18:53.1233333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('217', '52', '1', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('218', '52', '2', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('219', '58', '1', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('220', '58', '2', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('221', '59', '1', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('222', '59', '2', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('223', '67', '1', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('224', '67', '2', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('225', '68', '1', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('226', '68', '2', '1', '2025-10-29 21:18:53.1366667', '2025-10-29 21:18:53.1366667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('227', '12', '1', '1', '2025-10-29 21:18:53.1433333', '2025-10-29 21:18:53.1433333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('228', '12', '2', '1', '2025-10-29 21:18:53.1433333', '2025-10-29 21:18:53.1433333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('229', '12', '3', '1', '2025-10-29 21:18:53.1433333', '2025-10-29 21:18:53.1433333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('230', '13', '1', '1', '2025-10-29 21:18:53.1433333', '2025-10-29 21:18:53.1433333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('231', '13', '2', '1', '2025-10-29 21:18:53.1433333', '2025-10-29 21:18:53.1433333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('232', '13', '3', '1', '2025-10-29 21:18:53.1433333', '2025-10-29 21:18:53.1433333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('233', '53', '21', '1', '2025-10-29 21:18:53.1833333', '2025-10-29 21:18:53.1833333');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('234', '15', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('235', '16', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('236', '17', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('237', '18', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('238', '19', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('239', '20', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('240', '21', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('241', '22', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('242', '23', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('243', '24', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('244', '25', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('245', '26', '1', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('246', '15', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('247', '16', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('248', '17', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('249', '18', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('250', '19', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('251', '20', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('252', '21', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('253', '22', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('254', '23', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('255', '24', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('256', '25', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('257', '26', '2', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('258', '15', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('259', '16', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('260', '17', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('261', '18', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('262', '19', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('263', '20', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('264', '21', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('265', '22', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('266', '23', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('267', '24', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('268', '25', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('269', '26', '3', '1', '2025-10-29 21:18:53.2766667', '2025-10-29 21:18:53.2766667');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('270', '54', '9', '1', '2025-10-29 21:18:53.3700000', '2025-10-29 21:18:53.3700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('271', '54', '8', '1', '2025-10-29 21:18:53.3700000', '2025-10-29 21:18:53.3700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('272', '54', '5', '1', '2025-10-29 21:18:53.3700000', '2025-10-29 21:18:53.3700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('273', '54', '7', '1', '2025-10-29 21:18:53.3700000', '2025-10-29 21:18:53.3700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('274', '54', '6', '1', '2025-10-29 21:18:53.3700000', '2025-10-29 21:18:53.3700000');
INSERT INTO [lottery_game_compatibility] ([compatibility_id], [lottery_id], [game_type_id], [is_active], [created_at], [updated_at]) VALUES ('275', '54', '4', '1', '2025-10-29 21:18:53.3700000', '2025-10-29 21:18:53.3700000');
SET IDENTITY_INSERT [lottery_game_compatibility] OFF;
GO

-- Table: draws (117 records)
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('1', '1', 'Florida Pick 4 Morning', '12:30:00.0000000', 'Morning draw at 12:30 PM', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FL AM', '#219EBC');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('2', '1', 'Florida Pick 4 Evening', '19:30:00.0000000', 'Evening draw at 7:30 PM', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FL PM', '#219EBC');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('3', '2', 'Florida Pick 3 Midday', '13:00:00.0000000', 'Midday draw at 1:00 PM', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FL MD', '#00B4D8');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('4', '2', 'Florida Pick 3 Evening', '19:00:00.0000000', 'Evening draw at 7:00 PM', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FL PM', '#219EBC');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('5', '8', 'King Lottery Morning', '11:00:00.0000000', 'King Lottery morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SMA', '#7209B7');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('6', '8', 'King Lottery Afternoon', '15:00:00.0000000', 'King Lottery afternoon draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'KL AF', '#9B59B6');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('7', '8', 'King Lottery Evening', '20:00:00.0000000', 'King Lottery evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SGP', '#560BAD');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('8', '9', 'LOTEKA Midday', '12:00:00.0000000', 'LOTEKA midday draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'LTK', '#2B50AA');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('9', '9', 'LOTEKA Evening', '18:00:00.0000000', 'LOTEKA evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'LTK', '#2B50AA');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('10', '10', 'Loto Pool Morning', '10:30:00.0000000', 'Loto Pool morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'LP AM', '#16A085');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('11', '10', 'Loto Pool Night', '21:00:00.0000000', 'Loto Pool night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'LP PM', '#1ABC9C');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('12', '11', 'Loto Real Noon', '12:15:00.0000000', 'Loto Real noon draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'LRL N', '#E74C3C');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('13', '11', 'Loto Real Evening', '19:15:00.0000000', 'Loto Real evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'LRL E', '#C0392B');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('14', '12', 'New York Stock Morning', '11:30:00.0000000', 'New York Stock morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'NYS AM', '#2C3E50');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('15', '12', 'New York Stock Evening', '20:30:00.0000000', 'New York Stock evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'NYS PM', '#34495E');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('16', '13', 'Florida Stock Midday', '13:30:00.0000000', 'Florida Stock midday draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FLS MD', '#3498DB');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('17', '13', 'Florida Stock Night', '22:00:00.0000000', 'Florida Stock night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FLS NT', '#2980B9');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('18', '14', 'Mega Chance Afternoon', '16:00:00.0000000', 'Mega Chance afternoon draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'MC AF', '#E67E22');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('19', '14', 'Mega Chance Night', '23:00:00.0000000', 'Mega Chance night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'MC NT', '#D35400');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('20', '15', 'Havana Pick 4 Morning', '09:00:00.0000000', 'Havana Pick 4 morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'HAV AM', '#FF6B6B');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('21', '15', 'Havana Pick 4 Evening', '18:30:00.0000000', 'Havana Pick 4 evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'HAV PM', '#EE5A6F');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('22', '16', 'Santiago Pick 3 Noon', '12:45:00.0000000', 'Santiago Pick 3 noon draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'STG N', '#C44569');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('23', '16', 'Santiago Pick 3 Night', '21:30:00.0000000', 'Santiago Pick 3 night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'STG NT', '#A83F5F');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('24', '17', 'Kingston Lucky Morning', '10:00:00.0000000', 'Kingston Lucky morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'KNG AM', '#26de81');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('25', '17', 'Kingston Lucky Evening', '19:45:00.0000000', 'Kingston Lucky evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'KNG PM', '#20bf6b');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('26', '18', 'Montego Bay Pick Midday', '14:00:00.0000000', 'Montego Bay Pick midday draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'MTG MD', '#4bcffa');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('27', '18', 'Montego Bay Pick Night', '22:30:00.0000000', 'Montego Bay Pick night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'MTG NT', '#0fb9b1');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('28', '19', 'San Juan Lottery Morning', '11:15:00.0000000', 'San Juan Lottery morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SJ AM', '#a55eea');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('29', '19', 'San Juan Lottery Evening', '20:15:00.0000000', 'San Juan Lottery evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SJ PM', '#8854d0');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('30', '20', 'Bayamon Pick Afternoon', '15:30:00.0000000', 'Bayamon Pick afternoon draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'BAY AF', '#fd79a8');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('31', '20', 'Bayamon Pick Night', '23:30:00.0000000', 'Bayamon Pick night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'BAY NT', '#e056fd');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('32', '21', 'Nassau Numbers Morning', '09:30:00.0000000', 'Nassau Numbers morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'NAS AM', '#ffb142');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('33', '21', 'Nassau Numbers Evening', '18:00:00.0000000', 'Nassau Numbers evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'NAS PM', '#ff9f1a');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('34', '22', 'Freeport Pick Midday', '13:15:00.0000000', 'Freeport Pick midday draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FRP MD', '#5f27cd');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('35', '22', 'Freeport Pick Night', '21:15:00.0000000', 'Freeport Pick night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'FRP NT', '#341f97');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('36', '23', 'Port of Spain Pick Morning', '10:15:00.0000000', 'Port of Spain Pick morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'POS AM', '#ff6348');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('37', '23', 'Port of Spain Pick Evening', '19:00:00.0000000', 'Port of Spain Pick evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'POS PM', '#ff4757');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('38', '24', 'San Fernando Lucky Noon', '12:30:00.0000000', 'San Fernando Lucky noon draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SF N', '#ffa502');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('39', '24', 'San Fernando Lucky Night', '22:15:00.0000000', 'San Fernando Lucky night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SF NT', '#ff7f50');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('40', '25', 'Bridgetown Numbers Morning', '09:45:00.0000000', 'Bridgetown Numbers morning draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'BDG AM', '#1e90ff');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('41', '25', 'Bridgetown Numbers Evening', '18:45:00.0000000', 'Bridgetown Numbers evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'BDG PM', '#3742fa');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('42', '26', 'Speightstown Pick Midday', '14:30:00.0000000', 'Speightstown Pick midday draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SPT MD', '#2ed573');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('43', '26', 'Speightstown Pick Night', '23:15:00.0000000', 'Speightstown Pick night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SPT NT', '#7bed9f');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('44', '27', 'Texas Pick 4 Day', '12:27:00.0000000', 'Texas Pick 4 day draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'TD AM', '#52B788');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('45', '27', 'Texas Pick 4 Night', '22:12:00.0000000', 'Texas Pick 4 night draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'TN PM', '#0077B6');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('46', '28', 'Illinois Pick 3 Midday', '12:40:00.0000000', 'Illinois Pick 3 midday draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'IL MD', '#8E44AD');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('47', '28', 'Illinois Pick 3 Evening', '21:22:00.0000000', 'Illinois Pick 3 evening draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'IL PM', '#6A040F');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('48', '29', 'Super Lotto DR Weekly', '20:00:00.0000000', 'Super Lotto DR weekly draw', '1', '2025-10-13 01:02:16.3900000', NULL, NULL, NULL, 'SL DR', '#F39C12');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('49', '3', 'Georgia Pick 4 Mid AM', '12:29:00.0000000', 'Georgia Pick 4 midday draw', '1', '2025-10-22 22:48:38.8200000', NULL, NULL, NULL, 'GM AM', '#2B9348');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('50', '3', 'Georgia Pick 4 Evening', '18:59:00.0000000', 'Georgia Pick 4 evening draw', '1', '2025-10-22 22:48:38.8266667', NULL, NULL, NULL, 'GE PM', '#80B918');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('51', '3', 'Georgia Pick 4 Night', '22:34:00.0000000', 'Georgia Pick 4 night draw', '1', '2025-10-22 22:48:38.8366667', NULL, NULL, NULL, 'GN PM', '#2B9348');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('52', '4', 'Georgia Pick 3 Evening', '18:59:00.0000000', 'Georgia Pick 3 evening draw', '1', '2025-10-22 22:48:38.8433333', NULL, NULL, NULL, 'GE PM', '#80B918');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('53', '5', 'New York Pick 4 Day', '14:30:00.0000000', 'New York Pick 4 day draw', '1', '2025-10-22 22:48:38.8466667', NULL, NULL, NULL, 'NYAM', '#3A0CA3');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('54', '5', 'New York Pick 4 Night', '22:30:00.0000000', 'New York Pick 4 night draw', '1', '2025-10-22 22:48:38.8533333', NULL, NULL, NULL, 'NY PM', '#3A0CA3');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('55', '6', 'New York Pick 3 Day', '14:30:00.0000000', 'New York Pick 3 day draw', '1', '2025-10-22 22:48:38.8600000', NULL, NULL, NULL, 'NYAM', '#3A0CA3');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('56', '7', 'California Pick 4 AM', '10:00:00.0000000', 'California Pick 4 morning draw', '1', '2025-10-22 22:48:38.8666667', NULL, NULL, NULL, 'CA AM', '#FFB703');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('57', '7', 'California Pick 4 PM', '18:30:00.0000000', 'California Pick 4 evening draw', '1', '2025-10-22 22:48:38.8700000', NULL, NULL, NULL, 'CA PM', '#FB8500');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('58', '30', 'Indiana Mid', '13:00:00.0000000', 'Indiana midday draw', '1', '2025-10-22 22:49:06.3733333', NULL, NULL, NULL, 'IN AM', '#457B9D');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('59', '30', 'Indiana Day', '14:30:00.0000000', 'Indiana day draw', '1', '2025-10-22 22:49:06.3800000', NULL, NULL, NULL, 'IN AM', '#457B9D');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('60', '30', 'Indiana Evening', '18:30:00.0000000', 'Indiana evening draw', '1', '2025-10-22 22:49:06.3833333', NULL, NULL, NULL, 'IN PM', '#1D3557');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('61', '31', 'New Jersey AM', '12:59:00.0000000', 'New Jersey morning draw', '1', '2025-10-22 22:49:06.3900000', NULL, NULL, NULL, 'NJ AM', '#8338EC');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('62', '32', 'Pennsylvania Midday', '13:00:00.0000000', 'Pennsylvania midday draw', '1', '2025-10-22 22:49:06.3966667', NULL, NULL, NULL, 'PA AM', '#FFB703');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('63', '32', 'Pennsylvania Evening', '18:59:00.0000000', 'Pennsylvania evening draw', '1', '2025-10-22 22:49:06.4000000', NULL, NULL, NULL, 'PE PM', '#FB8500');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('64', '33', 'Virginia AM', '13:00:00.0000000', 'Virginia morning draw', '1', '2025-10-22 22:49:06.4066667', NULL, NULL, NULL, 'VA AM', '#06FFA5');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('65', '33', 'Virginia PM', '18:00:00.0000000', 'Virginia evening draw', '1', '2025-10-22 22:49:06.4133333', NULL, NULL, NULL, 'VG PM', '#028090');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('66', '34', 'Delaware AM', '13:20:00.0000000', 'Delaware morning draw', '1', '2025-10-22 22:49:32.7800000', NULL, NULL, NULL, 'DE AM', '#F4ACB7');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('67', '34', 'Delaware PM', '19:18:00.0000000', 'Delaware evening draw', '1', '2025-10-22 22:49:32.7833333', NULL, NULL, NULL, 'DPM', '#9D4EDD');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('68', '35', 'North Carolina AM', '15:00:00.0000000', 'North Carolina morning draw', '1', '2025-10-22 22:49:32.7900000', NULL, NULL, NULL, 'NC AM', '#55A630');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('69', '35', 'North Carolina PM', '22:22:00.0000000', 'North Carolina evening draw', '1', '2025-10-22 22:49:32.7966667', NULL, NULL, NULL, 'NC PM', '#2B9348');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('70', '36', 'Ohio AM', '12:29:00.0000000', 'Ohio morning draw', '1', '2025-10-22 22:49:32.8000000', NULL, NULL, NULL, 'OH AM', '#BC4749');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('71', '37', 'Chicago Day', '13:20:00.0000000', 'Chicago day draw', '1', '2025-10-22 22:49:32.8066667', NULL, NULL, NULL, 'CH D', '#370617');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('72', '37', 'Chicago PM', '21:22:00.0000000', 'Chicago evening draw', '1', '2025-10-22 22:49:32.8100000', NULL, NULL, NULL, 'IL PM', '#6A040F');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('73', '38', 'Connecticut AM', '10:29:00.0000000', 'Connecticut morning draw', '1', '2025-10-22 22:49:57.2933333', NULL, NULL, NULL, 'CT AM', '#90E0EF');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('74', '38', 'Connecticut PM', '18:29:00.0000000', 'Connecticut evening draw', '1', '2025-10-22 22:49:57.3000000', NULL, NULL, NULL, 'CT PM', '#0077B6');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('75', '39', 'Maryland Evening', '19:56:00.0000000', 'Maryland evening draw', '1', '2025-10-22 22:49:57.3033333', NULL, NULL, NULL, 'ME PM', '#3C096C');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('76', '40', 'South Carolina AM', '12:59:00.0000000', 'South Carolina morning draw', '1', '2025-10-22 22:49:57.3100000', NULL, NULL, NULL, 'SC AM', '#2B9348');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('77', '40', 'South Carolina PM', '18:59:00.0000000', 'South Carolina evening draw', '1', '2025-10-22 22:49:57.3133333', NULL, NULL, NULL, 'SC PM', '#2B9348');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('78', '41', 'Mississippi PM', '21:00:00.0000000', 'Mississippi evening draw', '1', '2025-10-22 22:49:57.3200000', NULL, NULL, NULL, 'MS PM', '#4361EE');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('79', '42', 'Anguila 10AM', '10:00:00.0000000', 'Anguila 10am draw', '1', '2025-10-22 22:50:27.7166667', NULL, NULL, NULL, 'AG AM', '#FFD700');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('80', '42', 'Anguila 1PM', '13:00:00.0000000', 'Anguila 1pm draw', '1', '2025-10-22 22:50:27.7200000', NULL, NULL, NULL, 'AN AM', '#FFB703');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('81', '42', 'Anguila 6PM', '18:00:00.0000000', 'Anguila 6pm draw', '1', '2025-10-22 22:50:27.7566667', NULL, NULL, NULL, 'AG PM', '#FFD700');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('82', '42', 'Anguila 9PM', '21:00:00.0000000', 'Anguila 9pm draw', '1', '2025-10-22 22:50:27.7600000', NULL, NULL, NULL, 'AN PM', '#FFD700');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('83', '43', 'La Primera', '10:00:00.0000000', 'La Primera regular draw', '1', '2025-10-22 22:50:27.7666667', NULL, NULL, NULL, 'LP', '#F77F00');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('84', '43', 'La Primera 12PM', '12:00:00.0000000', 'La Primera 12pm draw', '1', '2025-10-22 22:50:27.7700000', NULL, NULL, NULL, 'LP 12', '#F8961E');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('85', '43', 'La Primera 6PM', '18:00:00.0000000', 'La Primera 6pm draw', '1', '2025-10-22 22:50:27.7766667', NULL, NULL, NULL, 'LP 6PM', '#F77F00');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('86', '44', 'La Suerte', '11:00:00.0000000', 'La Suerte regular draw', '1', '2025-10-22 22:50:27.7800000', NULL, NULL, NULL, 'LS', '#2A9D8F');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('87', '44', 'La Suerte 12PM', '12:00:00.0000000', 'La Suerte 12pm draw', '1', '2025-10-22 22:50:27.7866667', NULL, NULL, NULL, 'LS 12', '#2A9D8F');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('88', '45', 'Gana Mas AM', '11:30:00.0000000', 'Gana Mas morning draw', '1', '2025-10-22 22:50:27.7900000', NULL, NULL, NULL, 'GM', '#1D3557');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('89', '45', 'Gana Mas PM', '18:30:00.0000000', 'Gana Mas evening draw', '1', '2025-10-22 22:50:27.7966667', NULL, NULL, NULL, 'GM PM', '#1D3557');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('90', '46', 'Lotedom', '12:30:00.0000000', 'Lotedom regular draw', '1', '2025-10-22 22:50:51.8633333', NULL, NULL, NULL, 'LTD', '#9B2226');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('91', '46', 'Lotedom PM', '18:30:00.0000000', 'Lotedom evening draw', '1', '2025-10-22 22:50:51.8700000', NULL, NULL, NULL, 'LTD PM', '#9B2226');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('92', '47', 'Nacional', '20:00:00.0000000', 'Nacional regular draw', '1', '2025-10-22 22:50:51.8766667', NULL, NULL, NULL, 'LN', '#F72585');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('93', '48', 'La Fortuna', '19:00:00.0000000', 'La Fortuna regular draw', '1', '2025-10-22 22:50:51.8866667', NULL, NULL, NULL, 'LF', '#7209B7');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('94', '49', 'La Real', '12:00:00.0000000', 'La Real regular draw', '1', '2025-10-22 22:50:51.8933333', NULL, NULL, NULL, 'LR', '#E63946');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('95', '50', 'Super Pale Tarde', '15:00:00.0000000', 'Super Pale afternoon draw', '1', '2025-10-22 22:51:19.3000000', NULL, NULL, NULL, 'SPR', '#FB5607');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('96', '50', 'Super Pale Noche', '20:00:00.0000000', 'Super Pale night draw', '1', '2025-10-22 22:51:19.3066667', NULL, NULL, NULL, 'SPQN', '#FF006E');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('97', '50', 'Super Pale NY-FL AM', '14:30:00.0000000', 'Super Pale NY-FL morning draw', '1', '2025-10-22 22:51:19.3100000', NULL, NULL, NULL, 'SPFN', '#8338EC');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('98', '50', 'Super Pale NY-FL PM', '22:30:00.0000000', 'Super Pale NY-FL evening draw', '1', '2025-10-22 22:51:19.3166667', NULL, NULL, NULL, 'SFNP', '#3A86FF');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('99', '51', 'FL Pick2 AM', '12:30:00.0000000', 'Florida Pick 2 morning draw', '1', '2025-10-22 22:51:19.3233333', NULL, NULL, NULL, 'FL2AM', '#00B4D8');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('100', '51', 'FL Pick2 PM', '19:30:00.0000000', 'Florida Pick 2 evening draw', '1', '2025-10-22 22:51:19.3300000', NULL, NULL, NULL, 'FL2PM', '#0077B6');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('101', '52', 'NY PM 6x1', '22:30:00.0000000', 'New York PM 6x1 draw', '1', '2025-10-22 22:51:19.3333333', NULL, NULL, NULL, 'NYE6', '#3A0CA3');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('102', '52', 'FL PM 6x1', '19:30:00.0000000', 'Florida PM 6x1 draw', '1', '2025-10-22 22:51:19.3400000', NULL, NULL, NULL, 'FLP6', '#219EBC');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('103', '53', 'Panama Miercoles', '20:00:00.0000000', 'Panama Wednesday draw', '1', '2025-10-22 22:51:40.7166667', NULL, NULL, NULL, 'PLNB', '#E63946');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('104', '53', 'Panama Domingo', '20:00:00.0000000', 'Panama Sunday draw', '1', '2025-10-22 22:51:40.7200000', NULL, NULL, NULL, 'DLNB', '#9B2226');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('105', '54', 'L.E. Puerto Rico 10PM', '22:00:00.0000000', 'L.E. Puerto Rico 10pm draw', '1', '2025-10-22 22:51:56.3833333', NULL, NULL, NULL, 'LE 10', '#7209B7');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('106', '55', 'DIARIA 11AM', '11:00:00.0000000', 'Diaria 11am draw', '1', '2025-10-22 23:04:00.7633333', NULL, NULL, NULL, 'DR 11', '#F4A261');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('107', '55', 'DIARIA 3PM', '15:00:00.0000000', 'Diaria 3pm draw', '1', '2025-10-22 23:04:00.7733333', NULL, NULL, NULL, 'DR 3', '#E9C46A');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('108', '55', 'DIARIA 9PM', '21:00:00.0000000', 'Diaria 9pm draw', '1', '2025-10-22 23:04:00.7800000', NULL, NULL, NULL, 'DR 9', '#E76F51');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('109', '56', 'LA CHICA', '13:00:00.0000000', 'La Chica draw', '1', '2025-10-22 23:04:00.7866667', NULL, NULL, NULL, 'CHC', '#C1121F');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('110', '54', 'L.E. PUERTO RICO 2PM', '14:00:00.0000000', 'L.E. Puerto Rico 2pm draw', '1', '2025-10-22 23:04:00.7933333', NULL, NULL, NULL, 'LE 2', '#4CC9F0');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('111', '58', 'NY AM 6X1', '14:30:00.0000000', 'New York AM 6x1 draw', '1', '2025-10-22 23:04:00.8000000', NULL, NULL, NULL, 'NYA6', '#3A0CA3');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('112', '59', 'FL AM 6X1', '12:30:00.0000000', 'Florida AM 6x1 draw', '1', '2025-10-22 23:04:00.8066667', NULL, NULL, NULL, 'FLA6', '#219EBC');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('113', '57', 'MASS AM', '12:50:00.0000000', 'Massachusetts AM draw', '1', '2025-10-22 23:04:00.8100000', NULL, NULL, NULL, 'MA AM', '#1B9AAA');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('114', '39', 'MARYLAND MIDDAY', '12:27:00.0000000', 'Maryland midday draw', '1', '2025-10-22 23:04:00.8166667', NULL, NULL, NULL, 'MD MD', '#5E60CE');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('115', '44', 'LA SUERTE 6:30PM', '18:30:00.0000000', 'La Suerte 6:30pm draw', '1', '2025-10-22 23:04:00.8233333', NULL, NULL, NULL, 'LS 6:30', '#06A77D');
INSERT INTO [draws] ([draw_id], [lottery_id], [draw_name], [draw_time], [description], [is_active], [created_at], [created_by], [updated_at], [updated_by], [abbreviation], [display_color]) VALUES ('116', '60', 'PLAY 4 PM', '19:30:00.0000000', 'Play 4 PM draw', '1', '2025-10-22 23:04:13.9700000', NULL, NULL, NULL, 'P4 PM', '#DC2F02');
GO

-- Table: prize_fields (65 records)
SET IDENTITY_INSERT [prize_fields] ON;
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('61', '1', 'DIRECTO_PRIMER_PAGO', 'Directo - Primer Pago', '56.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('62', '1', 'DIRECTO_SEGUNDO_PAGO', 'Directo - Segundo Pago', '12.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('63', '1', 'DIRECTO_TERCER_PAGO', 'Directo - Tercer Pago', '4.00', '.00', '10000.00', '3', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('64', '1', 'DIRECTO_DOBLES', 'Directo - Dobles', '56.00', '.00', '10000.00', '4', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('65', '2', 'PALE_TODOS_EN_SECUENCIA', 'Pale - Todos en secuencia', '1100.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('66', '2', 'PALE_PRIMER_PAGO', 'Pale - Primer Pago', '1100.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('67', '2', 'PALE_SEGUNDO_PAGO', 'Pale - Segundo Pago', '1100.00', '.00', '10000.00', '3', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('68', '2', 'PALE_TERCER_PAGO', 'Pale - Tercer Pago', '100.00', '.00', '10000.00', '4', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('69', '3', 'TRIPLETA_PRIMER_PAGO', 'Tripleta - Primer Pago', '10000.00', '.00', '100000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('70', '3', 'TRIPLETA_SEGUNDO_PAGO', 'Tripleta - Segundo Pago', '100.00', '.00', '100000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('71', '3', 'TRIPLETA_TODOS_EN_SECUENCIA', 'Tripleta - Todos en secuencia', '700.00', '.00', '100000.00', '3', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('72', '3', 'TRIPLETA_TRIPLES', 'Tripleta - Como venga', '700.00', '.00', '100000.00', '4', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('73', '12', 'CASH3_STRAIGHT_PRIMER_PAGO', 'Cash3 Straight - Todos en secuencia', '600.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('74', '12', 'CASH3_STRAIGHT_SEGUNDO_PAGO', 'Cash 3 Straight - Segundo Pago', '80.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('75', '13', 'CASH3_BOX_PRIMER_PAGO', 'Cash 3 Box - Primer Pago', '160.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('76', '13', 'CASH3_BOX_SEGUNDO_PAGO', 'Cash 3 Box - Segundo Pago', '80.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('77', '18', 'PLAY4_STRAIGHT_PRIMER_PAGO', 'Play 4 Straight - Primer Pago', '5000.00', '.00', '100000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('78', '18', 'PLAY4_STRAIGHT_SEGUNDO_PAGO', 'Play 4 Straight - Segundo Pago', '800.00', '.00', '100000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('79', '19', 'PLAY4_BOX_PRIMER_PAGO', 'Play 4 Box - Primer Pago', '200.00', '.00', '100000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('80', '19', 'PLAY4_BOX_SEGUNDO_PAGO', 'Play 4 Box - Segundo Pago', '100.00', '.00', '100000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('81', '19', 'PLAY4_BOX_TERCER_PAGO', 'Play 4 Box - Tercer Pago', '800.00', '.00', '100000.00', '3', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('82', '19', 'PLAY4_BOX_CUARTO_PAGO', 'Play 4 Box - Cuarto Pago', '200.00', '.00', '100000.00', '4', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('83', '6', 'SUPER_PALE_PREMIO', 'Super Pale - Primer Pago', '2000.00', '.00', '100000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('84', '16', 'CASH3_FRONT_STRAIGHT_PRIMER_PAGO', 'Cash 3 Front Straight - Primer Pago', '50.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('85', '16', 'CASH3_FRONT_STRAIGHT_SEGUNDO_PAGO', 'Cash 3 Front Straight - Segundo Pago', '80.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('86', '16', 'CASH3_FRONT_BOX_PRIMER_PAGO', 'Cash 3 Front Box - Primer Pago', '25.00', '.00', '10000.00', '3', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('87', '16', 'CASH3_FRONT_BOX_SEGUNDO_PAGO', 'Cash 3 Front Box - Segundo Pago', '40.00', '.00', '10000.00', '4', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('88', '17', 'CASH3_BACK_STRAIGHT_PRIMER_PAGO', 'Cash 3 Back Straight - Primer Pago', '50.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('89', '17', 'CASH3_BACK_STRAIGHT_SEGUNDO_PAGO', 'Cash 3 Back Straight - Segundo Pago', '80.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('90', '17', 'CASH3_BACK_BOX_PRIMER_PAGO', 'Cash 3 Back Box - Primer Pago', '25.00', '.00', '10000.00', '3', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('91', '17', 'CASH3_BACK_BOX_SEGUNDO_PAGO', 'Cash 3 Back Box - Segundo Pago', '40.00', '.00', '10000.00', '4', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('92', '9', 'PICK_TWO_FRONT_PRIMER_PAGO', 'Pick Two Front - Primer Pago', '75.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('93', '9', 'PICK_TWO_FRONT_SEGUNDO_PAGO', 'Pick Two Front - Dobles', '75.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('94', '10', 'PICK_TWO_BACK_PRIMER_PAGO', 'Pick Two Back - Primer Pago', '75.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('95', '10', 'PICK_TWO_BACK_SEGUNDO_PAGO', 'Pick Two Back - Dobles', '75.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('96', '11', 'PICK_TWO_MIDDLE_PRIMER_PAGO', 'Pick Two Middle - Primer Pago', '75.00', '.00', '10000.00', '1', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('97', '11', 'PICK_TWO_MIDDLE_SEGUNDO_PAGO', 'Pick Two Middle - Dobles', '75.00', '.00', '10000.00', '2', '1', '2025-10-31 11:08:02.5492514', '2025-10-31 11:08:02.5492514');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('98', '25', 'BOLITA_1_PREMIO', 'Bolita 1 - Primer Pago', '75.00', '.00', '10000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('99', '26', 'BOLITA_2_PREMIO', 'Bolita 2 - Primer Pago', '75.00', '.00', '10000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('100', '27', 'SINGULACION_1_PREMIO', 'Singulación 1 - Primer Pago', '9.00', '.00', '10000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('101', '28', 'SINGULACION_2_PREMIO', 'Singulación 2 - Primer Pago', '9.00', '.00', '10000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('102', '29', 'SINGULACION_3_PREMIO', 'Singulación 3 - Primer Pago', '9.00', '.00', '10000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('103', '30', 'PICK5_STRAIGHT_PRIMER_PAGO', 'Pick5 Straight - Todos en secuencia', '30000.00', '.00', '1000000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('104', '30', 'PICK5_STRAIGHT_SEGUNDO_PAGO', 'Pick5 Straight - Dobles', '5000.00', '.00', '1000000.00', '2', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('105', '31', 'PICK5_BOX_PRIMER_PAGO', 'Pick5 Box - 5-Way: 4 idénticos', '10000.00', '.00', '1000000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('106', '31', 'PICK5_BOX_SEGUNDO_PAGO', 'Pick5 Box - 10-Way: 3 idénticos', '5000.00', '.00', '1000000.00', '2', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('107', '31', 'PICK5_BOX_TERCER_PAGO', 'Pick5 Box - 20-Way: 3 idénticos', '2500.00', '.00', '1000000.00', '3', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('108', '31', 'PICK5_BOX_CUARTO_PAGO', 'Pick5 Box - 30-Way: 2 idénticos', '1660.00', '.00', '1000000.00', '4', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('109', '31', 'PICK5_BOX_QUINTO_PAGO', 'Pick5 Box - 60-Way: 2 idénticos', '830.00', '.00', '1000000.00', '5', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('110', '31', 'PICK5_BOX_SEXTO_PAGO', 'Pick5 Box - 120-Way: 5 únicos', '416.00', '.00', '1000000.00', '6', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('111', '32', 'PICK_TWO_PRIMER_PAGO', 'Pick Two - Primer Pago', '75.00', '.00', '10000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('112', '32', 'PICK_TWO_SEGUNDO_PAGO', 'Pick Two - Dobles', '75.00', '.00', '10000.00', '2', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('113', '33', 'PANAMA_4_NUMEROS_PRIMERA_RONDA', 'Panamá - 4 Números Primera Ronda', '.00', '.00', '100000.00', '1', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('114', '33', 'PANAMA_3_NUMEROS_PRIMERA_RONDA', 'Panamá - 3 Números Primera Ronda', '.00', '.00', '100000.00', '2', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('115', '33', 'PANAMA_ULTIMOS_2_NUMEROS_PRIMERA_RONDA', 'Panamá - Últimos 2 Números Primera Ronda', '.00', '.00', '100000.00', '3', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('116', '33', 'PANAMA_ULTIMO_NUMERO_PRIMERA_RONDA', 'Panamá - Último Número Primera Ronda', '.00', '.00', '100000.00', '4', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('117', '33', 'PANAMA_4_NUMEROS_SEGUNDA_RONDA', 'Panamá - 4 Números Segunda Ronda', '.00', '.00', '100000.00', '5', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('118', '33', 'PANAMA_3_NUMEROS_SEGUNDA_RONDA', 'Panamá - 3 Números Segunda Ronda', '.00', '.00', '100000.00', '6', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('119', '33', 'PANAMA_ULTIMOS_2_NUMEROS_SEGUNDA_RONDA', 'Panamá - Últimos 2 Números Segunda Ronda', '.00', '.00', '100000.00', '7', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('120', '33', 'PANAMA_ULTIMO_NUMERO_SEGUNDA_RONDA', 'Panamá - Último Número Segunda Ronda', '.00', '.00', '100000.00', '8', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('121', '33', 'PANAMA_4_NUMEROS_TERCERA_RONDA', 'Panamá - 4 Números Tercera Ronda', '.00', '.00', '100000.00', '9', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('122', '33', 'PANAMA_3_NUMEROS_TERCERA_RONDA', 'Panamá - 3 Números Tercera Ronda', '.00', '.00', '100000.00', '10', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('123', '33', 'PANAMA_ULTIMOS_2_NUMEROS_TERCERA_RONDA', 'Panamá - Últimos 2 Números Tercera Ronda', '.00', '.00', '100000.00', '11', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
INSERT INTO [prize_fields] ([prize_field_id], [bet_type_id], [field_code], [field_name], [default_multiplier], [min_multiplier], [max_multiplier], [display_order], [is_active], [created_at], [updated_at]) VALUES ('124', '33', 'PANAMA_ULTIMO_NUMERO_TERCERA_RONDA', 'Panamá - Último Número Tercera Ronda', '.00', '.00', '100000.00', '12', '1', '2025-10-31 11:23:33.7592278', '2025-10-31 11:23:33.7592278');
SET IDENTITY_INSERT [prize_fields] OFF;
GO

-- Table: banks (1 records)
GO

-- Table: betting_pools (19 records)
SET IDENTITY_INSERT [betting_pools] ON;
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('1', 'LAN-0001', 'BANCA PRUEBA 1', '1', NULL, NULL, NULL, '00001', NULL, NULL, NULL, NULL, '1', '2025-10-28 07:49:11.9488741', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('2', 'LAN-0002', 'Banca Prueba1', '4', NULL, NULL, NULL, 'Santiago', 'RB003', 'Un comentario', '0001', '$2a$11$wLko6f.ZFpFRPhLrMHOPGuCBUD863sUuzHGAkht00cl.mgB.MiMuK', '1', '2025-10-28 07:57:21.7180257', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('3', 'LAN-0003', 'TEST BANCA 3', '1', NULL, NULL, NULL, 'TEST', NULL, NULL, NULL, NULL, '1', '2025-10-28 08:00:49.1440131', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('4', 'LAN-0004', 'BancaPrueba2', '6', NULL, NULL, NULL, 'Santiago', 'RB003', 'jjhgg', 'admin', '$2a$11$IRlP3OsRaKdn1lB38/95pu0cae463pe0YSnEfWK7HcpwU/bKfsqGy', '1', '2025-10-28 08:11:35.6264654', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('5', 'LAN-0005', 'BancaPrueba 5', '6', NULL, NULL, NULL, 'Santiago', 'xxxxosssl', 'jjjj', 'admin', '$2a$11$wAOaqANzpQOrIOk0jp6mbOR9So8nKcZoe./PUuHH/j.KVNnRFp.BK', '1', '2025-10-28 09:00:50.3773578', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('6', 'LAN-0006', 'Banca Test 1761644873949', '4', NULL, NULL, NULL, 'Test Location Playwright', 'Test Reference', NULL, 'testuser1761644873949', '$2a$11$jkVhuk2b.mCvUehIMGYP0.9Z2hBmAzUYO1a40HiCUGSu.0ejsSuTq', '1', '2025-10-28 09:47:56.0162769', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('7', 'LAN-0007', 'Banca Test 1761644931511', '4', NULL, NULL, NULL, 'Test Location Playwright', 'Test Reference', NULL, 'testuser1761644931511', '$2a$11$kp9pe1jF.vD/jWqxNY2FF.Am9oYij0tmff94XCgl5izWY9R8qhTKS', '1', '2025-10-28 09:48:52.5557826', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('8', 'LAN-0008', 'CENTRAL-0008', '7', NULL, NULL, NULL, 'Santiago', 'xxxxosssl', 'lllll', '0008', '$2a$11$016LGVcbqGRHux/0VyPAneA.VYubuAYlLLTsd4.EwJSQjjjZwNDlu', '1', '2025-10-28 10:15:29.9017494', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('9', 'LAN-0009', 'admin', '4', NULL, NULL, NULL, 'Santiago 4', 'RB003', 'un comentario mas', '0009', '$2a$11$Tcb.wtVK9gHuV5I/CaTkPulz3otG07b8/RPZR26XP3bChDNJ2j8f.', '1', '2025-10-28 11:02:12.8441280', NULL, '2025-11-01 16:43:19.2722161', NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('10', 'LAN-0010', 'CENTRAL-0010', '4', NULL, NULL, NULL, 'Santiago', 'RB003', 'Un comentario 10', '0010', '$2a$11$OfdhkdqIeFXRTi7EHLdIY.jhfEaezqxjQQMEXHpCrp/2ocj9ARoZW', '1', '2025-10-28 11:04:15.7285629', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('11', 'LAN-0011', 'LAN-00011', '6', NULL, NULL, NULL, 'Santiago', 'RB003', 'ssss', '00011', '$2a$11$6Z9VS4/5pyaLWkBWH908bONRz4lLcFemjqBHgoEz5J1qiWzpBuJ/e', '1', '2025-10-28 11:13:53.2064039', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('12', 'LAN-0012', 'BANCA PRUEBA 1', '4', NULL, NULL, NULL, 'Santiago', 'jlljooi', 'jgjggg', 'admin', '$2a$11$xJp5FQr5vtSUgDrxxu/9De3XS.ek/c0kN5xpOb3y6efUQvfibD3rK', '1', '2025-10-28 12:56:23.1096269', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('13', 'LAN-0013', 'Test Banca Config', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', '2025-10-29 06:59:26.4355740', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('14', 'LAN-TEST-001', 'TEST BANCA CON CONFIG', '1', NULL, NULL, NULL, 'Test Location', NULL, NULL, NULL, NULL, '1', '2025-10-29 07:18:28.5819520', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('15', 'LAN-0015', 'BANCA TEST CONFIG 1761725279960', '4', NULL, NULL, NULL, 'Test Location 1761725279995', 'REF-1761725280015', NULL, NULL, NULL, '1', '2025-10-29 08:08:02.1978548', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('16', 'LAN-0016', 'CENTRAL-0016', '4', NULL, NULL, NULL, 'Santiago', 'RB003', 'bbbbb', '0016', '$2a$11$FiWbGxEhiKasQSKteCCOq.mcH.zxFPoXKMJSENRpPyocCXDGsqFae', '1', '2025-10-30 06:14:44.0252276', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('17', 'LAN-0017', 'LAN.0017', '1', NULL, NULL, NULL, 'Santiago', 'RB003', 'hhhhh', '0017', '$2a$11$Ob85F/3xAjyDU5hvhDvaw.z8Lx70OI9qaR1nvZex.2MA9.QZuNzoy', '1', '2025-10-30 06:17:59.0345583', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [betting_pools] ([betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id], [address], [phone], [location], [reference], [comment], [username], [password_hash], [is_active], [created_at], [created_by], [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]) VALUES ('18', 'LAN-0018', 'LAN.0018', '4', NULL, NULL, NULL, '00001', 'RB003', 'lo', '07877916W', '$2a$11$xe5KV9iLW3Y4WrENvf5KL.oUfwbP7eYl9zZvkjHNywZFzFOXUv4Dy', '0', '2025-10-30 09:29:46.3186778', NULL, '2025-10-30 09:30:38.6656423', NULL, NULL, NULL, NULL);
SET IDENTITY_INSERT [betting_pools] OFF;
GO

-- Table: user_zones (26 records)
SET IDENTITY_INSERT [user_zones] ON;
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', '11', '1', '0', '2025-10-24 11:26:09.1892765', NULL, '2025-10-24 11:29:07.6292690', NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', '12', '4', '1', '2025-10-25 04:03:52.8801555', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', '12', '5', '1', '2025-10-25 04:03:52.9007133', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('4', '14', '4', '1', '2025-10-25 04:12:29.5471375', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('5', '14', '5', '1', '2025-10-25 04:12:29.5975907', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('6', '15', '4', '1', '2025-10-25 04:22:18.2325110', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('7', '15', '5', '1', '2025-10-25 04:22:18.2549759', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('8', '16', '4', '1', '2025-10-25 04:27:47.3760365', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('9', '16', '5', '1', '2025-10-25 04:27:47.3766038', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('10', '18', '4', '1', '2025-10-25 04:39:29.3208437', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('11', '18', '3', '1', '2025-10-25 04:39:29.3211002', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('12', '19', '4', '1', '2025-10-25 11:04:34.1970105', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('13', '19', '3', '1', '2025-10-25 11:04:34.2374121', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('14', '20', '4', '1', '2025-10-25 11:14:35.9039182', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('15', '20', '6', '1', '2025-10-25 11:14:35.9041017', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('16', '21', '4', '1', '2025-10-25 11:19:08.3221423', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('17', '21', '6', '1', '2025-10-25 11:19:08.3229948', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('18', '22', '4', '1', '2025-10-25 11:32:13.3296305', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('19', '22', '6', '1', '2025-10-25 11:32:13.3299714', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('20', '23', '3', '1', '2025-10-25 11:49:50.2063454', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('21', '23', '8', '1', '2025-10-25 11:49:50.2067170', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('22', '23', '10', '1', '2025-10-25 11:49:50.2068169', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('24', '25', '4', '1', '2025-10-25 17:02:58.9770889', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('25', '25', '6', '1', '2025-10-25 17:02:58.9805552', NULL, NULL, NULL);
INSERT INTO [user_zones] ([user_zone_id], [user_id], [zone_id], [is_active], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('26', '24', '1', '1', '2025-10-26 16:46:38.7766667', NULL, NULL, NULL);
SET IDENTITY_INSERT [user_zones] OFF;
GO

-- Table: user_permissions (38 records)
SET IDENTITY_INSERT [user_permissions] ON;
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('6', '7', '1', '1', '2025-10-23 14:04:02.9126695', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('7', '7', '3', '1', '2025-10-23 14:04:02.9129817', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('8', '7', '12', '1', '2025-10-23 14:04:02.9130931', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('9', '7', '18', '1', '2025-10-23 14:04:02.9132306', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('10', '7', '27', '1', '2025-10-23 14:04:02.9133559', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('11', '7', '40', '1', '2025-10-23 14:04:02.9135362', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('12', '7', '50', '1', '2025-10-23 14:04:02.9137738', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('13', '6', '5', '1', '2025-10-23 14:04:04.1645558', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('14', '6', '15', '1', '2025-10-23 14:04:04.1647472', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('15', '6', '25', '1', '2025-10-23 14:04:04.1647954', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('16', '6', '35', '1', '2025-10-23 14:04:04.1648311', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('17', '12', '1', '1', '2025-10-25 04:03:52.5278168', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('18', '12', '2', '1', '2025-10-25 04:03:52.5621912', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('19', '12', '3', '1', '2025-10-25 04:03:52.5631514', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('20', '14', '1', '1', '2025-10-25 04:12:29.1728918', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('21', '14', '2', '1', '2025-10-25 04:12:29.2210787', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('22', '14', '3', '1', '2025-10-25 04:12:29.2219811', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('23', '15', '1', '1', '2025-10-25 04:22:17.8743410', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('24', '15', '2', '1', '2025-10-25 04:22:17.9149993', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('25', '15', '3', '1', '2025-10-25 04:22:17.9159012', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('26', '16', '1', '1', '2025-10-25 04:27:47.0705190', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('27', '16', '2', '1', '2025-10-25 04:27:47.0713909', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('28', '16', '3', '1', '2025-10-25 04:27:47.0717179', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('29', '18', '1', '1', '2025-10-25 04:39:29.0215391', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('30', '18', '2', '1', '2025-10-25 04:39:29.0218214', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('31', '18', '3', '1', '2025-10-25 04:39:29.0219323', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('32', '19', '1', '1', '2025-10-25 11:04:33.7655228', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('33', '20', '1', '1', '2025-10-25 11:14:35.5928730', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('34', '20', '12', '1', '2025-10-25 11:14:35.5932764', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('35', '21', '30', '1', '2025-10-25 11:19:08.0200074', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('36', '21', '60', '1', '2025-10-25 11:19:08.0201911', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('37', '22', '1', '1', '2025-10-25 11:32:13.0189019', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('38', '23', '1', '1', '2025-10-25 11:49:49.8980966', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('49', '24', '1', '1', '2025-10-25 15:53:54.6120173', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('50', '24', '2', '1', '2025-10-25 15:53:54.6126373', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('51', '25', '3', '1', '2025-10-25 17:02:58.6685374', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [user_permissions] ([user_permission_id], [user_id], [permission_id], [is_active], [created_at], [created_by], [updated_at], [updated_by], [granted_by], [grant_reason], [expires_at]) VALUES ('52', '25', '2', '1', '2025-10-25 17:02:58.6698488', NULL, NULL, NULL, NULL, NULL, NULL);
SET IDENTITY_INSERT [user_permissions] OFF;
GO

-- Table: role_permissions (1 records)
GO

-- Table: betting_pool_config (8 records)
SET IDENTITY_INSERT [betting_pool_config] ON;
INSERT INTO [betting_pool_config] ([config_id], [betting_pool_id], [fall_type], [deactivation_balance], [daily_sale_limit], [daily_balance_limit], [temporary_additional_balance], [credit_limit], [is_active], [control_winning_tickets], [allow_jackpot], [enable_recharges], [allow_password_change], [cancel_minutes], [daily_cancel_tickets], [max_cancel_amount], [max_ticket_amount], [max_daily_recharge], [payment_mode], [created_at], [created_by], [updated_at], [updated_by], [enable_temporary_balance]) VALUES ('1', '1', 'OFF', '1000.00', '5000.00', '10000.00', NULL, '500.00', '1', '0', '1', '1', '1', '30', NULL, NULL, NULL, NULL, 'POOL', '2025-10-29 07:15:38.6950615', NULL, '2025-10-29 07:17:28.7432061', NULL, '0');
INSERT INTO [betting_pool_config] ([config_id], [betting_pool_id], [fall_type], [deactivation_balance], [daily_sale_limit], [daily_balance_limit], [temporary_additional_balance], [credit_limit], [is_active], [control_winning_tickets], [allow_jackpot], [enable_recharges], [allow_password_change], [cancel_minutes], [daily_cancel_tickets], [max_cancel_amount], [max_ticket_amount], [max_daily_recharge], [payment_mode], [created_at], [created_by], [updated_at], [updated_by], [enable_temporary_balance]) VALUES ('2', '14', 'DAILY', '2000.00', '8000.00', '15000.00', NULL, '1000.00', '1', '1', '1', '1', '0', '45', NULL, NULL, NULL, NULL, 'POOL', '2025-10-29 07:18:28.7574339', NULL, NULL, NULL, '0');
INSERT INTO [betting_pool_config] ([config_id], [betting_pool_id], [fall_type], [deactivation_balance], [daily_sale_limit], [daily_balance_limit], [temporary_additional_balance], [credit_limit], [is_active], [control_winning_tickets], [allow_jackpot], [enable_recharges], [allow_password_change], [cancel_minutes], [daily_cancel_tickets], [max_cancel_amount], [max_ticket_amount], [max_daily_recharge], [payment_mode], [created_at], [created_by], [updated_at], [updated_by], [enable_temporary_balance]) VALUES ('3', '15', 'OFF', '2000.00', '8000.00', '15000.00', NULL, '.00', '1', '0', '1', '1', '1', '45', NULL, NULL, NULL, NULL, 'POOL', '2025-10-29 08:08:02.3701773', NULL, NULL, NULL, '0');
INSERT INTO [betting_pool_config] ([config_id], [betting_pool_id], [fall_type], [deactivation_balance], [daily_sale_limit], [daily_balance_limit], [temporary_additional_balance], [credit_limit], [is_active], [control_winning_tickets], [allow_jackpot], [enable_recharges], [allow_password_change], [cancel_minutes], [daily_cancel_tickets], [max_cancel_amount], [max_ticket_amount], [max_daily_recharge], [payment_mode], [created_at], [created_by], [updated_at], [updated_by], [enable_temporary_balance]) VALUES ('4', '9', 'COLLECTION', '4995.00', '11000.00', '17888.00', NULL, '.00', '1', '1', '1', '1', '1', '2', '2', '12.00', '12.00', '12.00', 'GROUP', '2025-10-29 08:11:53.8931130', NULL, '2025-11-01 16:43:19.7865225', NULL, '1');
INSERT INTO [betting_pool_config] ([config_id], [betting_pool_id], [fall_type], [deactivation_balance], [daily_sale_limit], [daily_balance_limit], [temporary_additional_balance], [credit_limit], [is_active], [control_winning_tickets], [allow_jackpot], [enable_recharges], [allow_password_change], [cancel_minutes], [daily_cancel_tickets], [max_cancel_amount], [max_ticket_amount], [max_daily_recharge], [payment_mode], [created_at], [created_by], [updated_at], [updated_by], [enable_temporary_balance]) VALUES ('5', '16', 'OFF', NULL, NULL, NULL, NULL, '.00', '1', '0', '1', '1', '1', '30', NULL, NULL, NULL, NULL, 'BANCA', '2025-10-30 06:14:44.3034648', NULL, NULL, NULL, '0');
INSERT INTO [betting_pool_config] ([config_id], [betting_pool_id], [fall_type], [deactivation_balance], [daily_sale_limit], [daily_balance_limit], [temporary_additional_balance], [credit_limit], [is_active], [control_winning_tickets], [allow_jackpot], [enable_recharges], [allow_password_change], [cancel_minutes], [daily_cancel_tickets], [max_cancel_amount], [max_ticket_amount], [max_daily_recharge], [payment_mode], [created_at], [created_by], [updated_at], [updated_by], [enable_temporary_balance]) VALUES ('6', '17', 'OFF', NULL, NULL, NULL, NULL, '.00', '1', '0', '1', '1', '1', '30', NULL, NULL, NULL, NULL, 'USE_GROUP_PREFERENCE', '2025-10-30 06:17:59.2417445', NULL, '2025-10-30 07:53:06.8034909', NULL, '0');
INSERT INTO [betting_pool_config] ([config_id], [betting_pool_id], [fall_type], [deactivation_balance], [daily_sale_limit], [daily_balance_limit], [temporary_additional_balance], [credit_limit], [is_active], [control_winning_tickets], [allow_jackpot], [enable_recharges], [allow_password_change], [cancel_minutes], [daily_cancel_tickets], [max_cancel_amount], [max_ticket_amount], [max_daily_recharge], [payment_mode], [created_at], [created_by], [updated_at], [updated_by], [enable_temporary_balance]) VALUES ('7', '18', 'OFF', '1.00', '1.00', '1.00', NULL, '.00', '0', '0', '0', '0', '0', '30', '6', '1.00', '2.00', '3.00', 'GROUP', '2025-10-30 09:29:46.5067426', NULL, '2025-10-30 09:30:39.1572075', NULL, '0');
SET IDENTITY_INSERT [betting_pool_config] OFF;
GO

-- Table: betting_pool_discount_config (8 records)
SET IDENTITY_INSERT [betting_pool_discount_config] ON;
INSERT INTO [betting_pool_discount_config] ([discount_config_id], [betting_pool_id], [discount_provider], [discount_mode], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', '1', 'GROUP', 'OFF', '2025-10-29 07:15:38.7368895', NULL, '2025-10-29 07:17:28.7432074', NULL);
INSERT INTO [betting_pool_discount_config] ([discount_config_id], [betting_pool_id], [discount_provider], [discount_mode], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', '14', 'SELLER', 'CASH', '2025-10-29 07:18:28.7583090', NULL, NULL, NULL);
INSERT INTO [betting_pool_discount_config] ([discount_config_id], [betting_pool_id], [discount_provider], [discount_mode], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', '15', 'SELLER', 'OFF', '2025-10-29 08:08:02.3713297', NULL, NULL, NULL);
INSERT INTO [betting_pool_discount_config] ([discount_config_id], [betting_pool_id], [discount_provider], [discount_mode], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('4', '9', 'SELLER', 'CASH', '2025-10-29 08:11:53.8934267', NULL, '2025-11-01 16:43:19.7865234', NULL);
INSERT INTO [betting_pool_discount_config] ([discount_config_id], [betting_pool_id], [discount_provider], [discount_mode], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('5', '16', 'RIFERO', 'OFF', '2025-10-30 06:14:44.3744769', NULL, NULL, NULL);
INSERT INTO [betting_pool_discount_config] ([discount_config_id], [betting_pool_id], [discount_provider], [discount_mode], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('6', '17', 'GROUP', 'OFF', '2025-10-30 06:17:59.2426661', NULL, '2025-10-30 07:53:06.8035680', NULL);
INSERT INTO [betting_pool_discount_config] ([discount_config_id], [betting_pool_id], [discount_provider], [discount_mode], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('7', '18', 'SELLER', 'CASH', '2025-10-30 09:29:46.5086157', NULL, '2025-10-30 09:30:39.1572080', NULL);
SET IDENTITY_INSERT [betting_pool_discount_config] OFF;
GO

-- Table: betting_pool_print_config (8 records)
SET IDENTITY_INSERT [betting_pool_print_config] ON;
INSERT INTO [betting_pool_print_config] ([print_config_id], [betting_pool_id], [print_mode], [print_enabled], [print_ticket_copy], [print_recharge_receipt], [sms_only], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('1', '1', 'DRIVER', '1', '1', '1', '0', '2025-10-29 07:15:38.7450766', NULL, '2025-10-29 07:17:28.7432083', NULL);
INSERT INTO [betting_pool_print_config] ([print_config_id], [betting_pool_id], [print_mode], [print_enabled], [print_ticket_copy], [print_recharge_receipt], [sms_only], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('2', '14', 'GENERIC', '1', '0', '1', '0', '2025-10-29 07:18:28.7586625', NULL, NULL, NULL);
INSERT INTO [betting_pool_print_config] ([print_config_id], [betting_pool_id], [print_mode], [print_enabled], [print_ticket_copy], [print_recharge_receipt], [sms_only], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('3', '15', 'DRIVER', '1', '1', '1', '0', '2025-10-29 08:08:02.3716868', NULL, NULL, NULL);
INSERT INTO [betting_pool_print_config] ([print_config_id], [betting_pool_id], [print_mode], [print_enabled], [print_ticket_copy], [print_recharge_receipt], [sms_only], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('4', '9', 'GENERIC', '1', '1', '1', '1', '2025-10-29 08:11:53.8934892', NULL, '2025-11-01 16:43:19.7865251', NULL);
INSERT INTO [betting_pool_print_config] ([print_config_id], [betting_pool_id], [print_mode], [print_enabled], [print_ticket_copy], [print_recharge_receipt], [sms_only], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('5', '16', 'DRIVER', '1', '1', '1', '0', '2025-10-30 06:14:44.4006687', NULL, NULL, NULL);
INSERT INTO [betting_pool_print_config] ([print_config_id], [betting_pool_id], [print_mode], [print_enabled], [print_ticket_copy], [print_recharge_receipt], [sms_only], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('6', '17', 'DRIVER', '1', '1', '1', '0', '2025-10-30 06:17:59.2433853', NULL, '2025-10-30 07:53:06.8036549', NULL);
INSERT INTO [betting_pool_print_config] ([print_config_id], [betting_pool_id], [print_mode], [print_enabled], [print_ticket_copy], [print_recharge_receipt], [sms_only], [created_at], [created_by], [updated_at], [updated_by]) VALUES ('7', '18', 'GENERIC', '0', '0', '0', '0', '2025-10-30 09:29:46.5093898', NULL, '2025-10-30 09:30:39.1572087', NULL);
SET IDENTITY_INSERT [betting_pool_print_config] OFF;
GO

-- Table: betting_pool_footers (2 records)
SET IDENTITY_INSERT [betting_pool_footers] ON;
INSERT INTO [betting_pool_footers] ([footer_id], [betting_pool_id], [auto_footer], [footer_line_1], [footer_line_2], [footer_line_3], [footer_line_4], [created_at], [updated_at], [created_by], [updated_by]) VALUES ('1', '9', '0', '1', '3', '2', '4', '2025-10-30 10:49:59.6974931', '2025-11-01 16:43:19.7865273', NULL, NULL);
SET IDENTITY_INSERT [betting_pool_footers] OFF;
GO

-- Table: banca_prize_configs (2 records)
SET IDENTITY_INSERT [banca_prize_configs] ON;
INSERT INTO [banca_prize_configs] ([config_id], [betting_pool_id], [prize_field_id], [custom_value], [created_at], [updated_at]) VALUES ('1', '9', '61', '54.00', '2025-11-01 10:34:40.9821960', '2025-11-01 12:43:37.4285663');
SET IDENTITY_INSERT [banca_prize_configs] OFF;
GO

-- Table: betting_pool_draws (1 records)
GO

-- Table: betting_pool_draw_config (1 records)
SET IDENTITY_INSERT [betting_pool_draw_config] ON;
SET IDENTITY_INSERT [betting_pool_draw_config] OFF;
GO

-- Table: betting_pool_general_config (1 records)
SET IDENTITY_INSERT [betting_pool_general_config] ON;
SET IDENTITY_INSERT [betting_pool_general_config] OFF;
GO

-- Table: betting_pool_automatic_expenses (1 records)
GO

-- Table: betting_pool_schedules (1 records)
GO

-- Table: betting_pool_sortitions (1 records)
GO

-- Table: betting_pool_styles (1 records)
GO

-- Table: betting_pool_prizes_commissions (1 records)
GO

-- Table: draw_prize_configs (1 records)
SET IDENTITY_INSERT [draw_prize_configs] ON;
SET IDENTITY_INSERT [draw_prize_configs] OFF;
GO

-- Table: tickets (1 records)
SET IDENTITY_INSERT [tickets] ON;
SET IDENTITY_INSERT [tickets] OFF;
GO

-- Table: ticket_lines (1 records)
SET IDENTITY_INSERT [ticket_lines] ON;
SET IDENTITY_INSERT [ticket_lines] OFF;
GO

-- Table: results (1 records)
GO

-- Table: user_betting_pools (1 records)
SET IDENTITY_INSERT [user_betting_pools] ON;
SET IDENTITY_INSERT [user_betting_pools] OFF;
GO

-- Table: balances (1 records)
GO

-- Table: prizes (1 records)
GO

-- Table: hot_numbers (1 records)
SET IDENTITY_INSERT [hot_numbers] ON;
SET IDENTITY_INSERT [hot_numbers] OFF;
GO

-- Table: limit_rules (1 records)
SET IDENTITY_INSERT [limit_rules] ON;
SET IDENTITY_INSERT [limit_rules] OFF;
GO

-- Table: limit_consumption (1 records)
SET IDENTITY_INSERT [limit_consumption] ON;
SET IDENTITY_INSERT [limit_consumption] OFF;
GO

-- Table: financial_transactions (1 records)
SET IDENTITY_INSERT [financial_transactions] ON;
SET IDENTITY_INSERT [financial_transactions] OFF;
GO

-- Table: prize_changes_audit (1 records)
SET IDENTITY_INSERT [prize_changes_audit] ON;
SET IDENTITY_INSERT [prize_changes_audit] OFF;
GO

-- Table: audit_log (1 records)
SET IDENTITY_INSERT [audit_log] ON;
SET IDENTITY_INSERT [audit_log] OFF;
GO

-- Table: error_logs (1 records)
SET IDENTITY_INSERT [error_logs] ON;
SET IDENTITY_INSERT [error_logs] OFF;
GO

-- Table: user_zones_backup (1 records)
GO

-- Table: user_permissions_backup (1 records)
GO

-- Table: user_betting_pools_backup (1 records)
GO

-- Re-enable foreign key constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
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


-- ============================================
-- BACKUP COMPLETE
-- Total records: 841
-- Total tables: 47/47
-- ============================================
