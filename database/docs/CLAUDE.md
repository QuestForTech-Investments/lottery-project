# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a comprehensive SQL Server lottery database system for managing multi-draw lottery operations in the Dominican Republic. It implements a B2B2C model: Casa Matriz (central operator) → Bancas (betting shops) → End customers.

**IMPORTANT:** When working with this database, always use the **SQL specialist agent** (`sql-pro`) for:
- Query optimization and execution plan analysis
- Complex SQL queries and stored procedure development
- Schema design and normalization review
- Index optimization
- Database performance tuning

This agent has specialized knowledge for SQL Server and should be your primary tool for database operations.

**Key Stats:**
- 48 tables with modular architecture
- 31 lottery games with 69 draws supported
- 23 bet types
- 12 specialized betting pool configuration tables
- 11 stored procedures
- 9 views
- Full audit trail with soft delete

## 🔗 Related Projects

**Lottery API Project:** This database is consumed by the ASP.NET Core Web API project.
- **Location (WSL):** `/mnt/h/GIT/Lottery-Apis`
- **Location (Windows):** `H:\GIT\Lottery-Apis`
- **GitHub:** https://github.com/jorge-vsoftware-solutions/Lottery-Apis
- **API Base URL:** http://localhost:5000
- **Swagger UI:** http://localhost:5000/swagger
- **Documentation:** See `Lottery-Apis/CLAUDE.md` for API details

## Azure SQL Database Credentials (TEST ENVIRONMENT)

**IMPORTANT:** This project is connected to a live Azure SQL Database for testing purposes.

**Credentials files:**
- `azure-sql-credentials.json` - Complete configuration with connection strings for all platforms
- `.env.azure` - Environment variables format for Node.js/.NET applications

**Quick Connection:**
```bash
# Using sqlcmd
sqlcmd -S lottery-sql-1505.database.windows.net -d lottery-db -U lotteryAdmin -P NewLottery2025 -C

# Using PowerShell
$server = "lottery-sql-1505.database.windows.net"
$database = "lottery-db"
$username = "lotteryAdmin"
$password = "NewLottery2025"
Invoke-Sqlcmd -ServerInstance $server -Database $database -Username $username -Password $password -Query "SELECT @@VERSION"
```

**Connection Strings:**
- **.NET:** See `azure-sql-credentials.json` → `connectionStrings.dotnet`
- **Node.js:** See `azure-sql-credentials.json` → `connectionStrings.nodejs`
- **Environment Variables:** See `.env.azure` for all variables

**Deployment:**
```powershell
# Deploy to Azure SQL (drops all existing objects and recreates schema)
.\deploy-simple.ps1
```

**Last Successful Deployment:**
- Date: 2025-10-22
- Script: lottery_database_complete.sql (version 1.1 optimized)
- Tables: 37
- Stored Procedures: 13
- Views: 10
- CHECK Constraints: 33

## Database Setup

### Installation
```bash
# Execute complete database script on SQL Server
sqlcmd -S localhost -i lottery_database_complete.sql

# Or deploy to Azure SQL (uses credentials from azure-sql-credentials.json)
pwsh deploy-simple.ps1
```

The main SQL file (`lottery_database_complete.sql`) is self-contained and includes all necessary components.

### Database Structure
- **SQL Server 2022** or Azure SQL compatible
- **Encoding:** UTF-8
- **Platform:** Runs on SQL Server (not MySQL/PostgreSQL)
- **Cloud:** Currently deployed on Azure SQL (lottery-sql-1505.database.windows.net)

## Core Architecture

### 1. Modular Betting Pool System (CRITICAL)

The betting pool (banca) configuration is split across **12 specialized tables** instead of one monolithic table. This was a major refactorization to eliminate duplicate data and enable granular configuration copying.

**Main Table:**
- `betting_pools` - Only 13 basic fields (code, name, zone, bank, location, credentials)

**Configuration Tables (1:1 relationships):**
- `betting_pool_config` - Fall type, limits, balances, toggles
- `betting_pool_print_config` - Print settings
- `betting_pool_discount_config` - Discount provider/mode
- `betting_pool_footers` - Footer lines for tickets
- `betting_pool_styles` - Visual styles

**Multi-record Tables (1:N or N:M):**
- `betting_pool_prizes_commissions` - Prize/commission config per lottery/game type
- `betting_pool_schedules` - Operating hours (7 days)
- `betting_pool_draws` - Active draws (N:M with `draws`)
- `betting_pool_automatic_expenses` - Auto expenses
- `betting_pool_sortitions` - Additional sortition config
- `balances` - Current financial balance

### 2. Ticket System

Tickets represent customer bets and consist of:
- `tickets` - Header (ticket code, betting pool, user, multipliers, status)
- `ticket_lines` - Individual bet lines (lottery, draw, number, amount, bet type)

**Important:** Always call `sp_CalculateTicketTotals` after creating/modifying tickets.

**Ticket Lifecycle:** PENDING → ACTIVE → [GANADOR | PERDEDOR] → PAGADO/CERRADO

### 3. Permission System (N:M)

Flexible N:M permission model:
- Direct permissions: `users` ↔ `permissions`
- Role-based: `roles` ↔ `permissions`
- Temporary permissions with expiration dates
- Full audit trail

### 4. Key Business Entities

**Hierarchical Structure:**
```
Casa Matriz (Central System)
  ├── Zones (Geographic groups)
  │     └── Betting Pools (Bancas - sales points)
  │           └── Users (Sellers/Cashiers)
  ├── Cobradores (Zone collectors)
  └── External Agents
```

**N:M Relationships:**
- Users can work in multiple betting pools
- Users can manage multiple zones
- Betting pools can have multiple active draws
- Users have both direct permissions and role-based permissions

## Common Operations

### Working with Betting Pools

**Copy entire configuration between betting pools:**
```sql
EXEC sp_CopyBettingPoolConfig
    @source_betting_pool_id = 1,
    @target_betting_pool_id = 2;
```

**Copy only a specific section:**
```sql
-- Options: CONFIGURACION, PIES, PREMIOS, HORARIOS, SORTEOS, ESTILOS, GASTOS
EXEC sp_CopyBettingPoolSection
    @source_betting_pool_id = 1,
    @target_betting_pool_id = 2,
    @section = 'PREMIOS';
```

**View complete betting pool configuration:**
```sql
SELECT * FROM vw_betting_pool_complete_config WHERE betting_pool_id = 1;
```

### Managing Permissions

**Grant permission to user:**
```sql
EXEC sp_GrantPermissionToUser @user_id = 10, @permission_id = 5;
```

**View all user permissions:**
```sql
EXEC sp_GetUserPermissions @user_id = 10;
```

**View users with multiple betting pools:**
```sql
SELECT * FROM vw_users_multiple_betting_pools;
```

### Creating Tickets

**Basic ticket creation:**
```sql
BEGIN TRANSACTION;

DECLARE @ticket_id BIGINT;

-- 1. Create ticket header
INSERT INTO tickets (ticket_code, betting_pool_id, user_id, global_multiplier, currency_code, status)
VALUES ('LAN-20251022-0001', 1, 5, 1.00, 'DOP', 'pending');

SET @ticket_id = SCOPE_IDENTITY();

-- 2. Add bet lines
INSERT INTO ticket_lines (ticket_id, line_number, draw_id, draw_date, draw_time,
                          bet_number, bet_type_id, bet_amount, multiplier, line_status)
VALUES (@ticket_id, 1, 150, '2025-10-22', '12:00', '23', 1, 100, 1.0, 'pending');

-- 3. Calculate totals (REQUIRED)
EXEC sp_CalculateTicketTotals @ticket_id;

COMMIT TRANSACTION;
```

See `GUIA_RAPIDA_TICKETS.md` and `EJEMPLOS_CREAR_TICKETS.sql` for detailed examples.

### Processing Results and Winners

**Check ticket for winners:**
```sql
EXEC sp_CheckTicketWinners @ticket_id = 1;
```

**View pending winners:**
```sql
SELECT * FROM vw_pending_winners;
```

**Pay prize:**
```sql
EXEC sp_PayTicketPrize
    @ticket_id = 1,
    @paid_by = 10,
    @payment_method = 'efectivo',
    @payment_reference = 'PAGO-001';
```

## Useful Views

- `vw_betting_pool_complete_config` - Consolidated betting pool configuration
- `vw_users_multiple_betting_pools` - Users working in multiple shops
- `vw_users_multiple_zones` - Users managing multiple zones
- `vw_expiring_permissions` - Permissions about to expire
- `vw_pending_winners` - Winning tickets awaiting payment
- `vw_hot_numbers_today` - Most bet numbers today
- `vw_daily_sales_by_betting_pool` - Sales per betting pool

## Audit Trail

All critical tables include:
- **Creation tracking:** `created_at`, `created_by`
- **Modification tracking:** `updated_at`, `updated_by`
- **Soft delete:** `deleted_at`, `deleted_by`, `deletion_reason`
- **Active flag:** `is_active` for easy filtering

## Important Constraints and Validations

- `ticket_code` must be unique across all tickets
- `bet_amount` must be greater than 0
- `multiplier` must be >= 1.00
- `discount_percentage` must be between 0 and 100
- Ticket status must be: pending, active, winner, loser, paid, or cancelled
- Users need proper permissions for ticket cancellations (especially post-draw)

## Business Rules

### Lottery Bet Types
The system supports 23 bet types including:
- **Directo/Quiniela** - Exact number match (00-99)
- **Pale/Palé** - Number in any position
- **Tripleta** - Three numbers in any order
- **Cash3** - 3 digits (000-999)
- **Play4** - 4 digits (0000-9999)
- **Pick5** - 5 numbers from pool

### Limits System
Multi-level limit hierarchy to control risk:
1. Global system limit
2. Zone limit
3. Betting pool limit
4. Per-number limit
5. Per-game-type limit

### Commission Structure
- Configurable per betting pool
- Can vary by lottery, game type, and amount
- Stored in `betting_pool_prizes_commissions`
- Typically 7-12% for betting pools

## Documentation Files

- `README.md` - Quick start and overview
- `SISTEMA_NEGOCIO_LOTTO.md` - Complete business model analysis (70+ lottery draws, ticket creation flow, financial model)
- `REFACTORIZACION_RESUMEN.md` - Details of betting pool refactorization
- `GUIA_RAPIDA_TICKETS.md` - Quick guide for ticket creation
- `EJEMPLOS_CREAR_TICKETS.sql` - SQL examples for ticket creation
- `ESTRUCTURA_VISUAL.txt` - ASCII visual database structure
- `lottery_database_complete.sql` - Complete database schema with all tables, stored procedures, views, triggers, and indexes

## Key Design Principles

1. **Modularity** - Each table has single responsibility, betting pool config split across 12 tables
2. **No Data Duplication** - 0% duplicate data through normalization
3. **Granular Operations** - Copy configurations by section or in full
4. **Audit Everything** - Complete audit trail on all critical operations
5. **Flexible Permissions** - N:M with direct and role-based grants
6. **Performance** - Optimized indexes, targeted queries
7. **Scalability** - Supports hundreds of betting pools and thousands of daily tickets
