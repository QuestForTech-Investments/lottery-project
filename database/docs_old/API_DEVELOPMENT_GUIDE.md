# 🚀 API Development Guide - Lottery System
**Version:** 1.0
**Date:** October 22, 2025
**Database:** SQL Server 2022 / Azure SQL
**Target Audience:** Backend API Developers

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Database Schema Overview](#2-database-schema-overview)
3. [Technology Stack Recommendation](#3-technology-stack-recommendation)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Critical Business Flows](#6-critical-business-flows)
7. [Business Rules to Implement](#7-business-rules-to-implement)
8. [Data Validation Rules](#8-data-validation-rules)
9. [Performance Considerations](#9-performance-considerations)
10. [Error Handling](#10-error-handling)
11. [Real-Time Features](#11-real-time-features)
12. [Sample Code Implementations](#12-sample-code-implementations)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment & Monitoring](#14-deployment--monitoring)
15. [Appendices](#15-appendices)

---

## 1. EXECUTIVE SUMMARY

### System Overview
This is a comprehensive lottery management system for the Dominican Republic market implementing a B2B2C model:

```
Casa Matriz (Central Operator)
    ↓
Zones (Geographic Groups)
    ↓
Betting Pools / Bancas (Sales Points)
    ↓
Users (Sellers/Cashiers)
    ↓
End Customers
```

### Key Statistics
- **70+ daily lottery draws** across multiple lottery types
- **21 betting game types** (Directo, Pale, Tripleta, Cash3, Play4, etc.)
- **37 database tables** (31 original + 6 new critical tables)
- **Multi-level limits system** to control betting exposure
- **Real-time operations** for limit checks and hot numbers
- **Complex financial calculations** (commissions, prizes, discounts, multipliers)

### Core Operations
1. **Ticket Creation** - Most complex operation with validations, limit checks, calculations
2. **Result Publishing** - Determine winners automatically
3. **Prize Payment** - Financial transaction with audit trail
4. **Limit Management** - Real-time limit consumption tracking
5. **Hot Numbers Dashboard** - Live monitoring of popular bets
6. **Financial Reporting** - Daily reconciliation and commission calculations

---

## 2. DATABASE SCHEMA OVERVIEW

### Main Entities

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE ENTITIES                            │
└─────────────────────────────────────────────────────────────┘

CATALOGS (Master Data):
├── countries          → Countries
├── zones             → Geographic zones
├── banks             → Banking institutions
├── lotteries         → Lottery systems (REAL, NACIONAL, LEIDSA, etc.)
├── game_categories   → Game categories
└── game_types        → Bet types (Directo, Pale, Tripleta, etc.)

DRAWS & RESULTS:
├── draws             → Lottery draw schedules
└── results           → Published lottery results with position

BETTING POOLS (MODULAR - 12 tables):
├── betting_pools                      → Basic info (code, name, zone)
├── betting_pool_config                → Limits, balances, fall type
├── betting_pool_print_config          → Print settings
├── betting_pool_discount_config       → Discount configuration
├── betting_pool_footers               → Ticket footer lines
├── betting_pool_prizes_commissions    → Prize/commission per lottery/game
├── betting_pool_schedules             → Operating hours (7 days)
├── betting_pool_draws                 → Active draws (N:M)
├── betting_pool_styles                → Visual styles
├── betting_pool_automatic_expenses    → Auto expenses
├── betting_pool_sortitions            → Additional config
└── balances                           → Current financial balance

USERS & PERMISSIONS:
├── users                    → System users
├── roles                    → User roles
├── permissions              → Available permissions
├── user_roles               → Users ↔ Roles (N:M)
├── user_permissions         → Direct permissions (N:M)
├── role_permissions         → Role permissions (N:M)
├── user_betting_pools       → Users ↔ Betting Pools (N:M)
└── user_zones               → Users ↔ Zones (N:M)

TICKETS & BETS:
├── tickets           → Ticket header (code, pool, user, totals)
└── ticket_lines      → Individual bet lines (lottery, draw, number, amount)

PRIZES:
└── prizes           → Prize records (line_id, amount, payment info)

LIMITS & MONITORING (NEW - CRITICAL):
├── limit_rules         → Define betting limits per lottery/draw/number
├── limit_consumption   → Real-time limit usage tracking
└── hot_numbers         → Numbers near their limits (dashboard)

AUDIT & LOGS (NEW - CRITICAL):
├── error_logs              → System error logging
├── audit_log               → Comprehensive change tracking
└── financial_transactions  → All money movements
```

### Key Relationships

```sql
-- N:M Relationships (Critical)
users ↔ betting_pools   (user_betting_pools)
users ↔ zones           (user_zones)
users ↔ permissions     (user_permissions + role_permissions)
betting_pools ↔ draws   (betting_pool_draws)

-- 1:N Relationships
betting_pools → tickets → ticket_lines → prizes
draws → results
lotteries → draws
zones → betting_pools
```

### Entity Detail: tickets & ticket_lines

**tickets** (header):
```sql
ticket_id (PK)          - BIGINT IDENTITY
ticket_code             - VARCHAR(50) UNIQUE (e.g., 'LAN-20251022-0001')
betting_pool_id         - FK to betting_pools
user_id                 - FK to users (seller)
global_multiplier       - DECIMAL(10,2) DEFAULT 1.00 (e.g., x2, x5)
global_discount         - DECIMAL(5,2) DEFAULT 0.00 (percentage 0-100)
currency_code           - VARCHAR(3) DEFAULT 'DOP'
status                  - VARCHAR(20) (pending, active, winner, loser, paid, cancelled)
total_amount            - DECIMAL(18,2) (sum of all lines)
grand_total             - DECIMAL(18,2) (after discounts/multipliers)
customer_name           - NVARCHAR(200) (for large tickets)
customer_phone          - VARCHAR(20)
customer_email          - VARCHAR(100)
customer_id_number      - VARCHAR(50)
created_at              - DATETIME2
created_by              - INT (user_id)
```

**ticket_lines** (bet lines):
```sql
line_id (PK)            - BIGINT IDENTITY
ticket_id (FK)          - BIGINT
line_number             - INT (1, 2, 3...)
lottery_id (FK)         - INT
draw_id (FK)            - INT
draw_date               - DATE
draw_time               - TIME
bet_number              - VARCHAR(20) (e.g., '23', '456', '1234')
bet_type_id (FK)        - INT (game_type_id: Directo, Pale, etc.)
bet_amount              - DECIMAL(10,2)
multiplier              - DECIMAL(10,2) DEFAULT 1.00
subtotal                - DECIMAL(18,2)
total_with_multiplier   - DECIMAL(18,2)
net_amount              - DECIMAL(18,2)
line_status             - VARCHAR(20) (pending, active, winner, loser, paid)
prize_amount            - DECIMAL(18,2) (if winner)
```

---

## 3. TECHNOLOGY STACK RECOMMENDATION

### Option A: Node.js + Express (Recommended for Fast Development)

```javascript
// Stack
- Runtime: Node.js 20 LTS
- Framework: Express 4.x
- Database: mssql (tedious driver) or Sequelize ORM
- Auth: jsonwebtoken + bcrypt
- Validation: Joi or Zod
- Cache: Redis (ioredis)
- Real-time: Socket.io
- Documentation: Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express)
- Testing: Jest + Supertest
- Logging: Winston + Morgan
- Monitoring: Prometheus + Grafana
```

**Folder Structure:**
```
src/
├── config/
│   ├── database.js
│   ├── redis.js
│   └── auth.js
├── middleware/
│   ├── auth.js
│   ├── permissions.js
│   ├── validation.js
│   └── errorHandler.js
├── routes/
│   ├── auth.routes.js
│   ├── tickets.routes.js
│   ├── draws.routes.js
│   ├── results.routes.js
│   ├── prizes.routes.js
│   ├── limits.routes.js
│   ├── pools.routes.js
│   └── reports.routes.js
├── controllers/
│   ├── ticketController.js
│   ├── drawController.js
│   └── ...
├── services/
│   ├── ticketService.js
│   ├── limitService.js
│   ├── prizeService.js
│   └── ...
├── models/
│   ├── Ticket.js
│   ├── TicketLine.js
│   └── ...
├── utils/
│   ├── calculations.js
│   ├── validators.js
│   └── errorLogger.js
├── websockets/
│   └── hotNumbers.js
└── app.js
```

### Option B: .NET 8 (Recommended for Enterprise)

```csharp
// Stack
- Framework: ASP.NET Core 8.0 Web API
- ORM: Entity Framework Core 8.0
- Database: Microsoft.Data.SqlClient
- Auth: Microsoft.AspNetCore.Authentication.JwtBearer
- Validation: FluentValidation
- Cache: StackExchange.Redis
- Real-time: SignalR
- Documentation: Swashbuckle (Swagger)
- Testing: xUnit + Moq
- Logging: Serilog
```

**Project Structure:**
```
LotteryAPI/
├── LotteryAPI.Core/          (Domain models, interfaces)
├── LotteryAPI.Infrastructure/ (Data access, repositories)
├── LotteryAPI.Application/    (Business logic, services)
├── LotteryAPI.WebAPI/         (Controllers, middleware)
└── LotteryAPI.Tests/          (Unit & integration tests)
```

### Database Connection

**Node.js Example:**
```javascript
// config/database.js
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 50,
    min: 5,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

module.exports = { getConnection, sql };
```

**.NET Example:**
```csharp
// appsettings.json
{
  "ConnectionStrings": {
    "LotteryDB": "Server=localhost;Database=lottery_database;User Id=sa;Password=***;TrustServerCertificate=True;"
  }
}

// Program.cs
builder.Services.AddDbContext<LotteryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("LotteryDB")));
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### JWT Authentication Strategy

**Token Structure:**
```json
{
  "user_id": 123,
  "username": "juan.perez",
  "betting_pool_id": 5,
  "role": "seller",
  "permissions": ["tickets.create", "tickets.view", "tickets.cancel"],
  "iat": 1729599600,
  "exp": 1729686000
}
```

### Endpoints

#### POST /api/auth/login
```json
Request:
{
  "username": "juan.perez",
  "password": "password123",
  "betting_pool_id": 5  // optional, user may work in multiple pools
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "8f3d7e2b-4a1c-9e5f-3b7d-2c6a8e1f4d9b",
    "expires_in": 86400,
    "user": {
      "user_id": 123,
      "username": "juan.perez",
      "full_name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "seller",
      "betting_pools": [
        {
          "betting_pool_id": 5,
          "branch_code": "LAN-010",
          "branch_name": "LA CENTRAL 10",
          "is_primary": true
        }
      ],
      "permissions": ["tickets.create", "tickets.view", "tickets.cancel"]
    }
  }
}
```

#### POST /api/auth/refresh
```json
Request:
{
  "refresh_token": "8f3d7e2b-4a1c-9e5f-3b7d-2c6a8e1f4d9b"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

#### POST /api/auth/logout
```json
Request: {} (token in header)

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Permission System

Use the existing N:M permission tables:
- Check `user_permissions` for direct permissions
- Check `role_permissions` via `user_roles` for role-based permissions
- Combine both (union)

**SQL Query to get user permissions:**
```sql
-- Use stored procedure: sp_GetUserPermissions
EXEC sp_GetUserPermissions @user_id = 123;

-- Or manual query:
SELECT DISTINCT p.permission_code
FROM permissions p
WHERE p.permission_id IN (
    -- Direct permissions
    SELECT permission_id FROM user_permissions
    WHERE user_id = @user_id AND is_active = 1
    UNION
    -- Role permissions
    SELECT rp.permission_id FROM role_permissions rp
    INNER JOIN user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = @user_id AND ur.is_active = 1 AND rp.is_active = 1
);
```

### Middleware Example (Node.js)

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

// middleware/permissions.js
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: ${permission} required`
      });
    }
    next();
  };
}

module.exports = { authenticate, requirePermission };
```

**Usage:**
```javascript
router.post('/tickets',
  authenticate,
  requirePermission('tickets.create'),
  ticketController.create
);
```

---

## 5. API ENDPOINTS REFERENCE

### 5.1 Authentication Module

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/auth/login` | Public | User login |
| POST | `/api/auth/logout` | Authenticated | User logout |
| POST | `/api/auth/refresh` | Public | Refresh JWT token |
| GET | `/api/auth/me` | Authenticated | Get current user info |
| POST | `/api/auth/change-password` | Authenticated | Change password |

### 5.2 Betting Pools Module

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/pools` | `pools.list` | List all betting pools |
| GET | `/api/pools/:id` | `pools.view` | Get pool details |
| GET | `/api/pools/:id/config` | `pools.view_config` | Get complete pool configuration |
| POST | `/api/pools` | `pools.create` | Create new betting pool |
| PUT | `/api/pools/:id` | `pools.update` | Update pool basic info |
| PUT | `/api/pools/:id/config` | `pools.update_config` | Update pool configuration |
| POST | `/api/pools/:id/copy-config` | `pools.copy_config` | Copy config from another pool |
| GET | `/api/pools/:id/balance` | `pools.view_balance` | Get current balance |
| POST | `/api/pools/:id/balance/adjust` | `pools.adjust_balance` | Adjust balance (admin only) |

### 5.3 Tickets Module (MOST CRITICAL)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/tickets` | `tickets.create` | Create new ticket |
| GET | `/api/tickets/:id` | `tickets.view` | Get ticket details |
| GET | `/api/tickets` | `tickets.list` | List tickets with filters |
| POST | `/api/tickets/:id/cancel` | `tickets.cancel` | Cancel ticket |
| GET | `/api/tickets/:id/preview` | `tickets.create` | Preview ticket before creation |
| POST | `/api/tickets/validate` | `tickets.create` | Validate ticket without creating |
| GET | `/api/tickets/search` | `tickets.search` | Search tickets by code/customer |

### 5.4 Draws Module

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/draws` | Public | List active draws |
| GET | `/api/draws/:id` | Public | Get draw details |
| GET | `/api/draws/active` | Public | Get currently open draws |
| POST | `/api/draws/:id/close` | `draws.close` | Close draw (admin) |
| GET | `/api/draws/:id/schedule` | Public | Get draw schedule |
| GET | `/api/lotteries` | Public | List all lotteries |
| GET | `/api/lotteries/:id/draws` | Public | Get draws for lottery |

### 5.5 Results Module

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/results` | `results.publish` | Publish draw results |
| GET | `/api/results/:draw_id` | Public | Get results for draw |
| PUT | `/api/results/:id` | `results.modify` | Modify result (admin, audited) |
| POST | `/api/results/:draw_id/verify-winners` | `results.publish` | Verify winners for draw |
| GET | `/api/results/latest` | Public | Get latest results |

### 5.6 Prizes Module

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/prizes/pending` | `prizes.view` | Get pending prizes |
| GET | `/api/prizes/:ticket_id` | `prizes.view` | Get prize info for ticket |
| POST | `/api/prizes/:ticket_id/pay` | `prizes.pay` | Pay prize |
| GET | `/api/prizes/history` | `prizes.view_history` | Prize payment history |

### 5.7 Limits Module (CRITICAL FOR REAL-TIME)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/limits/check` | `tickets.create` | Check if bet is within limits |
| GET | `/api/limits/hot-numbers` | `limits.view` | Get hot numbers dashboard |
| GET | `/api/limits/consumption/:draw_id` | `limits.view` | Get limit consumption for draw |
| POST | `/api/limits/rules` | `limits.manage` | Create/update limit rule |
| GET | `/api/limits/rules/:draw_id` | `limits.view` | Get limit rules for draw |

### 5.8 Reports Module

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/reports/daily-sales` | `reports.sales` | Daily sales by pool/zone/user |
| GET | `/api/reports/hot-numbers` | `reports.analytics` | Hot numbers report |
| GET | `/api/reports/financial-summary` | `reports.financial` | Financial summary (sales - prizes) |
| GET | `/api/reports/commissions` | `reports.commissions` | Commission calculations |
| GET | `/api/reports/cancelled-tickets` | `reports.audit` | Cancelled tickets audit |
| GET | `/api/reports/limit-consumption` | `reports.limits` | Limit consumption report |

### 5.9 Users & Admin Module

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/users` | `users.list` | List users |
| POST | `/api/users` | `users.create` | Create user |
| PUT | `/api/users/:id` | `users.update` | Update user |
| POST | `/api/users/:id/permissions` | `users.manage_permissions` | Grant/revoke permissions |
| POST | `/api/users/:id/pools` | `users.assign_pools` | Assign user to betting pools |
| GET | `/api/admin/error-logs` | `admin.view_logs` | Get error logs |
| GET | `/api/admin/audit-log` | `admin.view_audit` | Get audit trail |
| GET | `/api/admin/system-config` | `admin.manage_config` | Get system configuration |

---

## 6. CRITICAL BUSINESS FLOWS

### 6.1 FLOW: Create Ticket (MOST COMPLEX)

This is the most critical and complex operation. Follow these steps EXACTLY:

#### Step-by-Step Process

```
CLIENT REQUEST
    ↓
1. AUTHENTICATE & AUTHORIZE
    ↓
2. VALIDATE INPUT DATA
    ↓
3. CHECK DRAW STATUS (open?)
    ↓
4. CHECK LIMITS FOR EACH LINE
    ↓
5. CALCULATE TOTALS
    ↓
6. BEGIN DATABASE TRANSACTION
    ↓
7. INSERT TICKET (header)
    ↓
8. INSERT TICKET_LINES (bet lines)
    ↓
9. UPDATE LIMIT_CONSUMPTION
    ↓
10. UPDATE HOT_NUMBERS
    ↓
11. LOG FINANCIAL_TRANSACTION
    ↓
12. CALCULATE FINAL TOTALS (sp_CalculateTicketTotals)
    ↓
13. COMMIT TRANSACTION
    ↓
14. RETURN SUCCESS + TICKET
```

#### API Endpoint Details

**POST /api/tickets**

**Request:**
```json
{
  "betting_pool_id": 5,
  "global_multiplier": 2.0,
  "global_discount": 10.0,
  "currency_code": "DOP",
  "customer_name": "Juan Pérez",
  "customer_phone": "809-555-1234",
  "lines": [
    {
      "lottery_id": 5,
      "draw_id": 150,
      "draw_date": "2025-10-22",
      "draw_time": "12:00",
      "bet_number": "23",
      "bet_type_code": "DIRECTO",
      "bet_amount": 100.00
    },
    {
      "lottery_id": 5,
      "draw_id": 150,
      "draw_date": "2025-10-22",
      "draw_time": "12:00",
      "bet_number": "23",
      "bet_type_code": "PALE",
      "bet_amount": 50.00
    },
    {
      "lottery_id": 8,
      "draw_id": 152,
      "draw_date": "2025-10-22",
      "draw_time": "18:00",
      "bet_number": "456",
      "bet_type_code": "TRIPLETA",
      "bet_amount": 25.00
    }
  ]
}
```

**Validations to Perform:**

```javascript
// 1. Input Validation
- betting_pool_id exists and is active
- global_multiplier >= 1.0
- global_discount between 0 and 100
- lines array not empty (min 1, max 100 lines)
- For each line:
  - lottery_id exists and is active
  - draw_id exists
  - draw_date is today or future
  - bet_number format is valid for bet_type
  - bet_amount > 0
  - bet_type_code exists

// 2. Draw Status Validation
SELECT close_time, draw_time, is_active
FROM draws
WHERE draw_id = @draw_id AND draw_date = @draw_date;

IF draw is closed or inactive:
  RETURN ERROR "Draw is closed or inactive"

IF current time > close_time:
  RETURN ERROR "Cannot create ticket after draw close time"

// 3. Limit Validation (FOR EACH LINE)
EXEC sp_CheckBetLimit
  @lottery_id = line.lottery_id,
  @draw_id = line.draw_id,
  @draw_date = line.draw_date,
  @bet_number = line.bet_number,
  @bet_amount = line.bet_amount,
  @betting_pool_id = request.betting_pool_id;

IF limit exceeded:
  RETURN ERROR with available amount

// 4. Balance Validation (Optional)
SELECT current_balance FROM balances WHERE betting_pool_id = @betting_pool_id;

IF current_balance < grand_total:
  RETURN WARNING or ERROR (based on credit_limit config)
```

**Transaction Implementation:**

```javascript
// Node.js Example
async function createTicket(req, res) {
  const transaction = await sql.connect().transaction();

  try {
    await transaction.begin();

    // 1. Generate unique ticket code
    const ticketCode = `${bettingPoolCode}-${dateFormat}-${sequentialNumber}`;
    // Example: 'LAN-20251022-0001'

    // 2. Insert ticket header
    const ticketResult = await transaction.request()
      .input('ticket_code', sql.VarChar(50), ticketCode)
      .input('betting_pool_id', sql.Int, req.body.betting_pool_id)
      .input('user_id', sql.Int, req.user.user_id)
      .input('global_multiplier', sql.Decimal(10, 2), req.body.global_multiplier || 1.0)
      .input('global_discount', sql.Decimal(5, 2), req.body.global_discount || 0.0)
      .input('currency_code', sql.VarChar(3), req.body.currency_code || 'DOP')
      .input('status', sql.VarChar(20), 'pending')
      .input('customer_name', sql.NVarChar(200), req.body.customer_name)
      .input('customer_phone', sql.VarChar(20), req.body.customer_phone)
      .query(`
        INSERT INTO tickets (ticket_code, betting_pool_id, user_id, global_multiplier,
                             global_discount, currency_code, status, customer_name,
                             customer_phone, created_at, created_by)
        OUTPUT INSERTED.ticket_id
        VALUES (@ticket_code, @betting_pool_id, @user_id, @global_multiplier,
                @global_discount, @currency_code, @status, @customer_name,
                @customer_phone, GETDATE(), @user_id)
      `);

    const ticketId = ticketResult.recordset[0].ticket_id;

    // 3. Insert ticket lines
    for (let i = 0; i < req.body.lines.length; i++) {
      const line = req.body.lines[i];

      // Get bet_type_id from bet_type_code
      const betType = await transaction.request()
        .input('code', sql.VarChar(50), line.bet_type_code)
        .query('SELECT game_type_id FROM game_types WHERE game_type_code = @code');

      const betTypeId = betType.recordset[0].game_type_id;

      // Calculate line totals
      const subtotal = line.bet_amount;
      const totalWithMultiplier = subtotal * (req.body.global_multiplier || 1.0);
      const discount = totalWithMultiplier * ((req.body.global_discount || 0) / 100);
      const netAmount = totalWithMultiplier - discount;

      await transaction.request()
        .input('ticket_id', sql.BigInt, ticketId)
        .input('line_number', sql.Int, i + 1)
        .input('lottery_id', sql.Int, line.lottery_id)
        .input('draw_id', sql.Int, line.draw_id)
        .input('draw_date', sql.Date, line.draw_date)
        .input('draw_time', sql.Time, line.draw_time)
        .input('bet_number', sql.VarChar(20), line.bet_number)
        .input('bet_type_id', sql.Int, betTypeId)
        .input('bet_amount', sql.Decimal(10, 2), line.bet_amount)
        .input('multiplier', sql.Decimal(10, 2), req.body.global_multiplier || 1.0)
        .input('subtotal', sql.Decimal(18, 2), subtotal)
        .input('total_with_multiplier', sql.Decimal(18, 2), totalWithMultiplier)
        .input('net_amount', sql.Decimal(18, 2), netAmount)
        .input('line_status', sql.VarChar(20), 'pending')
        .query(`
          INSERT INTO ticket_lines (
            ticket_id, line_number, lottery_id, draw_id, draw_date, draw_time,
            bet_number, bet_type_id, bet_amount, multiplier, subtotal,
            total_with_multiplier, net_amount, line_status
          ) VALUES (
            @ticket_id, @line_number, @lottery_id, @draw_id, @draw_date, @draw_time,
            @bet_number, @bet_type_id, @bet_amount, @multiplier, @subtotal,
            @total_with_multiplier, @net_amount, @line_status
          )
        `);

      // 4. Update limit_consumption
      await transaction.request()
        .input('lottery_id', sql.Int, line.lottery_id)
        .input('draw_id', sql.Int, line.draw_id)
        .input('bet_number', sql.VarChar(20), line.bet_number)
        .input('bet_amount', sql.Decimal(10, 2), line.bet_amount)
        .input('ticket_id', sql.BigInt, ticketId)
        .query(`
          UPDATE limit_consumption
          SET current_amount = current_amount + @bet_amount,
              last_ticket_id = @ticket_id,
              last_updated = GETDATE()
          WHERE lottery_id = @lottery_id
            AND draw_id = @draw_id
            AND bet_number = @bet_number
        `);

      // 5. Update hot_numbers
      await updateHotNumbers(transaction, line.lottery_id, line.draw_id, line.bet_number);
    }

    // 6. Calculate ticket totals (use stored procedure)
    await transaction.request()
      .input('ticket_id', sql.BigInt, ticketId)
      .execute('sp_CalculateTicketTotals');

    // 7. Log financial transaction
    await transaction.request()
      .input('transaction_type', sql.VarChar(50), 'ticket_sale')
      .input('betting_pool_id', sql.Int, req.body.betting_pool_id)
      .input('user_id', sql.Int, req.user.user_id)
      .input('ticket_id', sql.BigInt, ticketId)
      .input('amount', sql.Decimal(18, 2), grandTotal)
      .input('description', sql.NVarChar(500), `Ticket sale: ${ticketCode}`)
      .query(`
        INSERT INTO financial_transactions (
          transaction_type, betting_pool_id, user_id, ticket_id, amount,
          description, created_at
        ) VALUES (
          @transaction_type, @betting_pool_id, @user_id, @ticket_id, @amount,
          @description, GETDATE()
        )
      `);

    // 8. Commit transaction
    await transaction.commit();

    // 9. Return success response
    return res.status(201).json({
      success: true,
      data: {
        ticket_id: ticketId,
        ticket_code: ticketCode,
        total_amount: totalAmount,
        grand_total: grandTotal,
        created_at: new Date()
      }
    });

  } catch (error) {
    await transaction.rollback();

    // Log error to error_logs table
    await logError(error, 'createTicket', req.user.user_id);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticket_id": 12345,
    "ticket_code": "LAN-20251022-0001",
    "betting_pool_id": 5,
    "betting_pool_name": "LA CENTRAL 10",
    "user_id": 123,
    "seller_name": "Juan Pérez",
    "lines_count": 3,
    "total_amount": 175.00,
    "global_discount": 10.0,
    "discount_amount": 17.50,
    "global_multiplier": 2.0,
    "grand_total": 315.00,
    "currency_code": "DOP",
    "status": "pending",
    "created_at": "2025-10-22T10:30:00Z",
    "lines": [
      {
        "line_id": 98765,
        "line_number": 1,
        "lottery_name": "LEIDSA",
        "draw_date": "2025-10-22",
        "draw_time": "12:00",
        "bet_number": "23",
        "bet_type": "DIRECTO",
        "bet_amount": 100.00,
        "net_amount": 180.00
      },
      {
        "line_id": 98766,
        "line_number": 2,
        "lottery_name": "LEIDSA",
        "draw_date": "2025-10-22",
        "draw_time": "12:00",
        "bet_number": "23",
        "bet_type": "PALE",
        "bet_amount": 50.00,
        "net_amount": 90.00
      },
      {
        "line_id": 98767,
        "line_number": 3,
        "lottery_name": "NACIONAL",
        "draw_date": "2025-10-22",
        "draw_time": "18:00",
        "bet_number": "456",
        "bet_type": "TRIPLETA",
        "bet_amount": 25.00,
        "net_amount": 45.00
      }
    ]
  }
}
```

---

### 6.2 FLOW: Publish Results & Determine Winners

**POST /api/results**

**Request:**
```json
{
  "draw_id": 150,
  "draw_date": "2025-10-22",
  "lottery_id": 5,
  "results": [
    {
      "position": 1,
      "winning_number": "23"
    },
    {
      "position": 2,
      "winning_number": "45"
    },
    {
      "position": 3,
      "winning_number": "67"
    }
  ]
}
```

**Process:**
```javascript
async function publishResults(req, res) {
  const transaction = await sql.connect().transaction();

  try {
    await transaction.begin();

    // 1. Validate draw exists and is closed
    const draw = await transaction.request()
      .input('draw_id', sql.Int, req.body.draw_id)
      .input('draw_date', sql.Date, req.body.draw_date)
      .query(`
        SELECT draw_id, close_time, is_active
        FROM draws
        WHERE draw_id = @draw_id AND draw_date = @draw_date
      `);

    if (draw.recordset.length === 0) {
      throw new Error('Draw not found');
    }

    // 2. Check if results already published
    const existing = await transaction.request()
      .input('draw_id', sql.Int, req.body.draw_id)
      .input('draw_date', sql.Date, req.body.draw_date)
      .query(`
        SELECT result_id FROM results
        WHERE draw_id = @draw_id AND CAST(result_date AS DATE) = @draw_date
      `);

    if (existing.recordset.length > 0) {
      throw new Error('Results already published for this draw');
    }

    // 3. Insert results
    for (const result of req.body.results) {
      await transaction.request()
        .input('draw_id', sql.Int, req.body.draw_id)
        .input('winning_number', sql.NVarChar(20), result.winning_number)
        .input('position', sql.Int, result.position)
        .input('result_date', sql.DateTime2, new Date())
        .input('user_id', sql.Int, req.user.user_id)
        .query(`
          INSERT INTO results (draw_id, winning_number, position, result_date, created_by, created_at)
          VALUES (@draw_id, @winning_number, @position, @result_date, @user_id, GETDATE())
        `);
    }

    // 4. Determine winners (use stored procedure)
    await transaction.request()
      .input('draw_id', sql.Int, req.body.draw_id)
      .input('draw_date', sql.Date, req.body.draw_date)
      .execute('sp_DetermineWinners');

    // 5. Update ticket statuses
    await transaction.request()
      .input('draw_id', sql.Int, req.body.draw_id)
      .input('draw_date', sql.Date, req.body.draw_date)
      .query(`
        UPDATE t
        SET t.status = CASE
          WHEN EXISTS (
            SELECT 1 FROM ticket_lines tl
            WHERE tl.ticket_id = t.ticket_id AND tl.line_status = 'winner'
          ) THEN 'winner'
          ELSE 'loser'
        END
        FROM tickets t
        INNER JOIN ticket_lines tl ON t.ticket_id = tl.ticket_id
        WHERE tl.draw_id = @draw_id AND tl.draw_date = @draw_date
      `);

    // 6. Log audit
    await transaction.request()
      .input('table_name', sql.VarChar(100), 'results')
      .input('operation', sql.VarChar(20), 'INSERT')
      .input('user_id', sql.Int, req.user.user_id)
      .input('new_values', sql.NVarChar(sql.MAX), JSON.stringify(req.body.results))
      .query(`
        INSERT INTO audit_log (table_name, operation, user_id, new_values, created_at)
        VALUES (@table_name, @operation, @user_id, @new_values, GETDATE())
      `);

    await transaction.commit();

    // 7. Get winner summary
    const summary = await getWinnerSummary(req.body.draw_id, req.body.draw_date);

    return res.status(201).json({
      success: true,
      data: {
        draw_id: req.body.draw_id,
        draw_date: req.body.draw_date,
        results: req.body.results,
        winners: summary
      }
    });

  } catch (error) {
    await transaction.rollback();
    await logError(error, 'publishResults', req.user.user_id);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

---

### 6.3 FLOW: Pay Prize

**POST /api/prizes/:ticket_id/pay**

**Request:**
```json
{
  "payment_method": "efectivo",
  "payment_reference": "PAGO-20251022-001",
  "paid_by": 123
}
```

**Process:**
```javascript
// Use the improved stored procedure sp_PayTicketPrize
async function payPrize(req, res) {
  try {
    const result = await sql.connect().request()
      .input('ticket_id', sql.BigInt, req.params.ticket_id)
      .input('paid_by', sql.Int, req.body.paid_by || req.user.user_id)
      .input('payment_method', sql.VarChar(50), req.body.payment_method)
      .input('payment_reference', sql.VarChar(100), req.body.payment_reference)
      .execute('sp_PayTicketPrize');

    return res.status(200).json({
      success: true,
      message: 'Prize paid successfully',
      data: {
        ticket_id: req.params.ticket_id,
        paid_at: new Date(),
        paid_by: req.body.paid_by || req.user.user_id
      }
    });

  } catch (error) {
    await logError(error, 'payPrize', req.user.user_id);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

---

### 6.4 FLOW: Cancel Ticket

**POST /api/tickets/:id/cancel**

**Request:**
```json
{
  "reason": "Customer requested cancellation",
  "override": false
}
```

**Process:**
```javascript
async function cancelTicket(req, res) {
  const transaction = await sql.connect().transaction();

  try {
    await transaction.begin();

    // 1. Get ticket details
    const ticket = await transaction.request()
      .input('ticket_id', sql.BigInt, req.params.id)
      .query(`
        SELECT t.*, MIN(tl.draw_date + CAST(tl.draw_time AS DATETIME)) as earliest_draw
        FROM tickets t
        INNER JOIN ticket_lines tl ON t.ticket_id = tl.ticket_id
        WHERE t.ticket_id = @ticket_id
        GROUP BY t.ticket_id, t.ticket_code, t.status, ...
      `);

    if (ticket.recordset.length === 0) {
      throw new Error('Ticket not found');
    }

    const ticketData = ticket.recordset[0];

    // 2. Check if ticket can be cancelled
    if (ticketData.status === 'cancelled') {
      throw new Error('Ticket already cancelled');
    }

    if (ticketData.status === 'paid') {
      throw new Error('Cannot cancel paid ticket');
    }

    // 3. Check if draw has closed (unless override permission)
    const now = new Date();
    if (ticketData.earliest_draw < now && !req.body.override) {
      throw new Error('Cannot cancel ticket after draw has closed');
    }

    if (req.body.override && !req.user.permissions.includes('tickets.cancel_override')) {
      throw new Error('Permission denied: cancel_override required');
    }

    // 4. Get betting pool config for cancel limits
    const config = await transaction.request()
      .input('pool_id', sql.Int, ticketData.betting_pool_id)
      .query(`
        SELECT cancel_minutes, daily_cancel_tickets, max_cancel_amount
        FROM betting_pool_config
        WHERE betting_pool_id = @pool_id
      `);

    // Check cancel limits (implementation omitted for brevity)

    // 5. Update ticket status
    await transaction.request()
      .input('ticket_id', sql.BigInt, req.params.id)
      .input('cancelled_by', sql.Int, req.user.user_id)
      .input('cancellation_reason', sql.NVarChar(500), req.body.reason)
      .query(`
        UPDATE tickets
        SET status = 'cancelled',
            cancelled_at = GETDATE(),
            cancelled_by = @cancelled_by,
            cancellation_reason = @cancellation_reason
        WHERE ticket_id = @ticket_id
      `);

    // 6. Update ticket lines
    await transaction.request()
      .input('ticket_id', sql.BigInt, req.params.id)
      .query(`
        UPDATE ticket_lines
        SET line_status = 'cancelled'
        WHERE ticket_id = @ticket_id
      `);

    // 7. Release limits (decrease limit_consumption)
    const lines = await transaction.request()
      .input('ticket_id', sql.BigInt, req.params.id)
      .query(`
        SELECT lottery_id, draw_id, bet_number, bet_amount
        FROM ticket_lines
        WHERE ticket_id = @ticket_id
      `);

    for (const line of lines.recordset) {
      await transaction.request()
        .input('lottery_id', sql.Int, line.lottery_id)
        .input('draw_id', sql.Int, line.draw_id)
        .input('bet_number', sql.VarChar(20), line.bet_number)
        .input('amount', sql.Decimal(10, 2), line.bet_amount)
        .query(`
          UPDATE limit_consumption
          SET current_amount = current_amount - @amount,
              last_updated = GETDATE()
          WHERE lottery_id = @lottery_id
            AND draw_id = @draw_id
            AND bet_number = @bet_number
        `);
    }

    // 8. Log financial transaction (refund)
    await transaction.request()
      .input('transaction_type', sql.VarChar(50), 'ticket_cancellation')
      .input('betting_pool_id', sql.Int, ticketData.betting_pool_id)
      .input('user_id', sql.Int, req.user.user_id)
      .input('ticket_id', sql.BigInt, req.params.id)
      .input('amount', sql.Decimal(18, 2), -ticketData.grand_total)
      .input('description', sql.NVarChar(500), `Ticket cancelled: ${ticketData.ticket_code}`)
      .query(`
        INSERT INTO financial_transactions (
          transaction_type, betting_pool_id, user_id, ticket_id, amount,
          description, created_at
        ) VALUES (
          @transaction_type, @betting_pool_id, @user_id, @ticket_id, @amount,
          @description, GETDATE()
        )
      `);

    // 9. Log audit
    await transaction.request()
      .input('table_name', sql.VarChar(100), 'tickets')
      .input('operation', sql.VarChar(20), 'CANCEL')
      .input('record_id', sql.BigInt, req.params.id)
      .input('user_id', sql.Int, req.user.user_id)
      .input('new_values', sql.NVarChar(sql.MAX), JSON.stringify({
        status: 'cancelled',
        reason: req.body.reason,
        override: req.body.override
      }))
      .query(`
        INSERT INTO audit_log (table_name, operation, record_id, user_id, new_values, created_at)
        VALUES (@table_name, @operation, @record_id, @user_id, @new_values, GETDATE())
      `);

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: {
        ticket_id: req.params.id,
        ticket_code: ticketData.ticket_code,
        refund_amount: ticketData.grand_total,
        cancelled_at: new Date()
      }
    });

  } catch (error) {
    await transaction.rollback();
    await logError(error, 'cancelTicket', req.user.user_id);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

---

### 6.5 FLOW: Check Limits in Real-Time

**POST /api/limits/check**

**Request:**
```json
{
  "lines": [
    {
      "lottery_id": 5,
      "draw_id": 150,
      "draw_date": "2025-10-22",
      "bet_number": "23",
      "bet_amount": 100.00
    },
    {
      "lottery_id": 5,
      "draw_id": 150,
      "draw_date": "2025-10-22",
      "bet_number": "45",
      "bet_amount": 50.00
    }
  ]
}
```

**Process:**
```javascript
async function checkLimits(req, res) {
  try {
    const results = [];

    for (const line of req.body.lines) {
      // 1. Get limit rule for this bet
      const limitRule = await sql.connect().request()
        .input('lottery_id', sql.Int, line.lottery_id)
        .input('draw_id', sql.Int, line.draw_id)
        .input('bet_number', sql.VarChar(20), line.bet_number)
        .query(`
          SELECT lr.limit_rule_id, lr.max_amount_per_number, lr.limit_type
          FROM limit_rules lr
          WHERE lr.lottery_id = @lottery_id
            AND lr.draw_id = @draw_id
            AND (lr.bet_number = @bet_number OR lr.bet_number IS NULL)
            AND lr.is_active = 1
          ORDER BY
            CASE WHEN lr.bet_number IS NOT NULL THEN 1 ELSE 2 END -- Specific first
          LIMIT 1
        `);

      if (limitRule.recordset.length === 0) {
        // No limit rule = unlimited
        results.push({
          ...line,
          limit_ok: true,
          limit_available: null,
          message: 'No limit defined (unlimited)'
        });
        continue;
      }

      const rule = limitRule.recordset[0];

      // 2. Get current consumption
      const consumption = await sql.connect().request()
        .input('lottery_id', sql.Int, line.lottery_id)
        .input('draw_id', sql.Int, line.draw_id)
        .input('bet_number', sql.VarChar(20), line.bet_number)
        .query(`
          SELECT current_amount
          FROM limit_consumption
          WHERE lottery_id = @lottery_id
            AND draw_id = @draw_id
            AND bet_number = @bet_number
        `);

      const currentAmount = consumption.recordset.length > 0
        ? consumption.recordset[0].current_amount
        : 0;

      // 3. Calculate available
      const maxAmount = rule.max_amount_per_number;
      const available = maxAmount - currentAmount;
      const newTotal = currentAmount + line.bet_amount;

      // 4. Determine status
      const percentageUsed = (newTotal / maxAmount) * 100;
      let status = 'normal';
      if (percentageUsed >= 90) status = 'blocked';
      else if (percentageUsed >= 70) status = 'critical';
      else if (percentageUsed >= 30) status = 'warning';

      const limitOk = line.bet_amount <= available;

      results.push({
        ...line,
        limit_ok: limitOk,
        limit_available: available,
        limit_max: maxAmount,
        current_consumption: currentAmount,
        percentage_used: percentageUsed,
        status: status,
        message: limitOk
          ? `OK - ${available.toFixed(2)} DOP available`
          : `LIMIT EXCEEDED - Only ${available.toFixed(2)} DOP available`
      });
    }

    const allOk = results.every(r => r.limit_ok);

    return res.status(200).json({
      success: true,
      all_limits_ok: allOk,
      data: results
    });

  } catch (error) {
    await logError(error, 'checkLimits', req.user?.user_id);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

**Response:**
```json
{
  "success": true,
  "all_limits_ok": false,
  "data": [
    {
      "lottery_id": 5,
      "draw_id": 150,
      "draw_date": "2025-10-22",
      "bet_number": "23",
      "bet_amount": 100.00,
      "limit_ok": false,
      "limit_available": 25.00,
      "limit_max": 500.00,
      "current_consumption": 475.00,
      "percentage_used": 95.0,
      "status": "blocked",
      "message": "LIMIT EXCEEDED - Only 25.00 DOP available"
    },
    {
      "lottery_id": 5,
      "draw_id": 150,
      "draw_date": "2025-10-22",
      "bet_number": "45",
      "bet_amount": 50.00,
      "limit_ok": true,
      "limit_available": 350.00,
      "limit_max": 500.00,
      "current_consumption": 100.00,
      "percentage_used": 30.0,
      "status": "warning",
      "message": "OK - 350.00 DOP available"
    }
  ]
}
```

---

## 7. BUSINESS RULES TO IMPLEMENT

### Critical Validations

```javascript
// TICKET CREATION
✓ User must be authenticated and have permission 'tickets.create'
✓ User must be assigned to the betting_pool
✓ Betting pool must be active
✓ Draw must be open (current time < close_time)
✓ Bet amount must be > 0
✓ Global multiplier must be >= 1.0
✓ Global discount must be 0-100
✓ Bet number format must match bet type (e.g., 2 digits for Directo)
✓ Each line must pass limit check
✓ Lottery and draw must exist and be active
✓ Game type must be compatible with lottery

// TICKET CANCELLATION
✓ Ticket must exist and not be already cancelled
✓ Cannot cancel paid tickets
✓ Cannot cancel after draw closes (unless override permission)
✓ Must not exceed daily cancellation limits (betting_pool_config)
✓ Must not exceed max_cancel_amount (betting_pool_config)
✓ Cancellation reason is required
✓ Must release consumed limits

// RESULT PUBLICATION
✓ Draw must exist
✓ Results cannot be published twice for same draw
✓ Only users with 'results.publish' permission
✓ Winning numbers must be in valid format
✓ Position must be 1, 2, or 3
✓ Must trigger winner determination automatically
✓ All modifications must be audited

// PRIZE PAYMENT
✓ Ticket must be a winner
✓ Ticket must not be already paid
✓ Prize amount must be > 0
✓ Payment method is required
✓ Must update betting pool balance
✓ Must log financial transaction
✓ Must update ticket status to 'paid'

// LIMIT MANAGEMENT
✓ Limit rules must have max_amount_per_number > 0
✓ Limit consumption cannot exceed limit rule
✓ Hot numbers must update in real-time
✓ Status: normal (< 30%), warning (30-70%), critical (70-90%), blocked (>= 90%)

// PERMISSIONS
✓ Direct permissions take precedence over role permissions
✓ Expired permissions are not valid
✓ User must have at least one active role
✓ Permission checks must combine direct + role permissions

// FINANCIAL
✓ All money movements must be logged in financial_transactions
✓ Balances can go negative only if within credit_limit
✓ Commissions must be calculated per betting pool configuration
✓ Prize calculations use betting_pool_prizes_commissions table
```

---

## 8. DATA VALIDATION RULES

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "lines[0].bet_amount",
        "message": "Bet amount must be greater than 0",
        "value": -10
      },
      {
        "field": "global_discount",
        "message": "Discount must be between 0 and 100",
        "value": 150
      }
    ]
  }
}
```

### Validation Schema Example (using Joi for Node.js)

```javascript
const Joi = require('joi');

const createTicketSchema = Joi.object({
  betting_pool_id: Joi.number().integer().positive().required(),
  global_multiplier: Joi.number().min(1.0).max(100.0).default(1.0),
  global_discount: Joi.number().min(0).max(100).default(0),
  currency_code: Joi.string().length(3).default('DOP'),
  customer_name: Joi.string().max(200).when('grand_total', {
    is: Joi.number().greater(1000),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  customer_phone: Joi.string().max(20).optional(),
  customer_email: Joi.string().email().max(100).optional(),
  customer_id_number: Joi.string().max(50).optional(),
  lines: Joi.array().items(
    Joi.object({
      lottery_id: Joi.number().integer().positive().required(),
      draw_id: Joi.number().integer().positive().required(),
      draw_date: Joi.date().min('now').required(),
      draw_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      bet_number: Joi.string().max(20).required(),
      bet_type_code: Joi.string().max(50).required(),
      bet_amount: Joi.number().positive().required()
    })
  ).min(1).max(100).required()
});

// Usage in middleware
function validateCreateTicket(req, res, next) {
  const { error, value } = createTicketSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
          value: d.context.value
        }))
      }
    });
  }

  req.body = value; // Use validated/coerced value
  next();
}
```

### HTTP Status Codes to Use

```javascript
200 OK                    - Successful GET, PUT, DELETE
201 Created               - Successful POST
204 No Content            - Successful DELETE with no response body
400 Bad Request           - Validation errors, malformed request
401 Unauthorized          - Missing or invalid authentication token
403 Forbidden             - User lacks required permission
404 Not Found             - Resource not found
409 Conflict              - Business rule violation (e.g., duplicate ticket code)
422 Unprocessable Entity  - Valid request but business logic prevents action
429 Too Many Requests     - Rate limit exceeded
500 Internal Server Error - Unexpected server error
503 Service Unavailable   - Database connection failed, maintenance mode
```

---

## 9. PERFORMANCE CONSIDERATIONS

### 9.1 Caching Strategy (Redis)

```javascript
// Cache TTL recommendations
const CACHE_TTL = {
  ACTIVE_DRAWS: 60,           // 1 minute
  LOTTERY_LIST: 3600,         // 1 hour
  BETTING_POOL_CONFIG: 300,   // 5 minutes
  HOT_NUMBERS: 10,            // 10 seconds (very dynamic)
  GAME_TYPES: 86400,          // 24 hours
  LIMIT_RULES: 300,           // 5 minutes
  USER_PERMISSIONS: 600       // 10 minutes
};

// Example: Cache active draws
async function getActiveDraws() {
  const cacheKey = 'active_draws';

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Query database
  const result = await sql.connect().request().query(`
    SELECT d.draw_id, d.lottery_id, l.lottery_name, d.draw_date, d.draw_time,
           d.close_time, d.is_active
    FROM draws d
    INNER JOIN lotteries l ON d.lottery_id = l.lottery_id
    WHERE d.is_active = 1
      AND d.draw_date >= CAST(GETDATE() AS DATE)
      AND CAST(GETDATE() AS TIME) < d.close_time
    ORDER BY d.draw_time
  `);

  const draws = result.recordset;

  // Store in cache
  await redis.setex(cacheKey, CACHE_TTL.ACTIVE_DRAWS, JSON.stringify(draws));

  return draws;
}

// Cache invalidation on result publication
async function invalidateDrawCache(draw_id) {
  await redis.del('active_draws');
  await redis.del(`draw:${draw_id}`);
  await redis.del(`hot_numbers:${draw_id}`);
}
```

### 9.2 Use Database Indexes

The following indexes were added (see SCRIPT_CHANGES_APPLIED.md):

```sql
-- Use these indexes by structuring queries properly:

-- 1. Limit checks (uses IX_ticket_lines_limit_check)
SELECT SUM(bet_amount) as total
FROM ticket_lines
WHERE lottery_id = @lottery_id
  AND draw_id = @draw_id
  AND draw_date = @draw_date
  AND bet_number = @bet_number;

-- 2. Daily sales (uses IX_tickets_pool_date_status)
SELECT SUM(total_amount) as daily_sales
FROM tickets
WHERE betting_pool_id = @betting_pool_id
  AND CAST(created_at AS DATE) = @target_date
  AND status != 'cancelled';

-- 3. Winners (uses IX_ticket_lines_winners - filtered index)
SELECT line_id, ticket_id, prize_amount
FROM ticket_lines
WHERE status IN ('winner', 'pending_payment')
  AND betting_pool_id = @betting_pool_id;

-- 4. Result lookups (uses IX_results_draw_date)
SELECT first_number, second_number, third_number
FROM results
WHERE draw_id = @draw_id
  AND result_date = @result_date;
```

### 9.3 Batch Operations

For operations on multiple tickets/lines, use batch inserts:

```javascript
// BAD: Individual inserts
for (const line of lines) {
  await insertTicketLine(line);
}

// GOOD: Batch insert with Table-Valued Parameters
const table = new sql.Table('ticket_lines');
table.columns.add('ticket_id', sql.BigInt);
table.columns.add('line_number', sql.Int);
table.columns.add('bet_number', sql.VarChar(20));
// ... add all columns

for (let i = 0; i < lines.length; i++) {
  table.rows.add(ticketId, i + 1, lines[i].bet_number, ...);
}

await request.bulk(table);
```

### 9.4 Connection Pooling

```javascript
// Node.js configuration
const pool = new sql.ConnectionPool({
  ...config,
  pool: {
    max: 50,    // Maximum connections
    min: 5,     // Minimum connections
    idleTimeoutMillis: 30000
  }
});

// Reuse connection pool, don't create new connections per request
```

### 9.5 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Limit ticket creation to prevent abuse
const ticketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per user
  keyGenerator: (req) => req.user.user_id,
  message: 'Too many ticket creation requests, please try again later'
});

router.post('/tickets', authenticate, ticketLimiter, createTicket);

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  keyGenerator: (req) => req.body.username,
  message: 'Too many login attempts, please try again later'
});

router.post('/auth/login', loginLimiter, login);
```

---

## 10. ERROR HANDLING

### 10.1 Error Logging to Database

```javascript
// utils/errorLogger.js
async function logError(error, procedureName, userId = null) {
  try {
    await sql.connect().request()
      .input('error_number', sql.Int, error.number || 0)
      .input('error_message', sql.NVarChar(sql.MAX), error.message)
      .input('error_severity', sql.Int, error.severity || 16)
      .input('error_state', sql.Int, error.state || 1)
      .input('error_procedure', sql.NVarChar(200), procedureName)
      .input('error_line', sql.Int, error.lineNumber || 0)
      .input('user_id', sql.Int, userId)
      .input('additional_info', sql.NVarChar(sql.MAX), JSON.stringify({
        stack: error.stack,
        name: error.name,
        code: error.code
      }))
      .query(`
        INSERT INTO error_logs (
          error_number, error_message, error_severity, error_state,
          error_procedure, error_line, user_id, additional_info, created_at
        ) VALUES (
          @error_number, @error_message, @error_severity, @error_state,
          @error_procedure, @error_line, @user_id, @additional_info, GETDATE()
        )
      `);
  } catch (logError) {
    // If logging fails, at least log to console
    console.error('Failed to log error to database:', logError);
    console.error('Original error:', error);
  }
}

module.exports = { logError };
```

### 10.2 Global Error Handler Middleware

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  // Log error to database
  logError(err, req.route?.path || 'unknown', req.user?.user_id);

  // Determine error type and status code
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
    message = 'Permission denied';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = 'Resource not found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = err.message || 'Conflict with existing resource';
  } else if (err.name === 'BusinessRuleError') {
    statusCode = 422;
    errorCode = 'BUSINESS_RULE_VIOLATION';
    message = err.message;
  }

  // Don't expose internal error details in production
  const response = {
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  };

  // Include details in development
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
```

### 10.3 Custom Error Classes

```javascript
// utils/errors.js
class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends Error {
  constructor(permission) {
    super(`Permission denied: ${permission} required`);
    this.name = 'ForbiddenError';
  }
}

module.exports = {
  BusinessRuleError,
  NotFoundError,
  ForbiddenError
};

// Usage in controller
if (!ticket) {
  throw new NotFoundError('Ticket');
}

if (ticket.status === 'paid') {
  throw new BusinessRuleError('Cannot cancel paid ticket');
}
```

---

## 11. REAL-TIME FEATURES

### 11.1 WebSocket for Hot Numbers Dashboard

```javascript
// websockets/hotNumbers.js
const socketIO = require('socket.io');

function setupHotNumbersWebSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  // Authenticate WebSocket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Join room for specific draw
    socket.on('subscribe:hot-numbers', async ({ draw_id }) => {
      socket.join(`draw:${draw_id}`);

      // Send initial hot numbers data
      const hotNumbers = await getHotNumbers(draw_id);
      socket.emit('hot-numbers:update', hotNumbers);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  // Function to broadcast updates (call this after ticket creation)
  async function broadcastHotNumbersUpdate(draw_id) {
    const hotNumbers = await getHotNumbers(draw_id);
    io.to(`draw:${draw_id}`).emit('hot-numbers:update', hotNumbers);
  }

  return { io, broadcastHotNumbersUpdate };
}

async function getHotNumbers(draw_id) {
  const result = await sql.connect().request()
    .input('draw_id', sql.Int, draw_id)
    .query(`
      SELECT bet_number, total_bet, limit_amount, percentage_used, status
      FROM hot_numbers
      WHERE draw_id = @draw_id
      ORDER BY percentage_used DESC
      LIMIT 100
    `);

  return result.recordset;
}

module.exports = { setupHotNumbersWebSocket };
```

**Client Usage (JavaScript):**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');

  // Subscribe to hot numbers for draw 150
  socket.emit('subscribe:hot-numbers', { draw_id: 150 });
});

socket.on('hot-numbers:update', (hotNumbers) => {
  console.log('Hot numbers updated:', hotNumbers);
  updateDashboard(hotNumbers);
});
```

### 11.2 Server-Sent Events for Result Notifications

```javascript
// routes/events.routes.js
router.get('/events/results', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial comment
  res.write(': connected\n\n');

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Listen for result publications (implement with Redis Pub/Sub)
  const subscriber = redis.duplicate();
  subscriber.subscribe('results:published');

  subscriber.on('message', (channel, message) => {
    const data = JSON.parse(message);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', () => {
    clearInterval(heartbeat);
    subscriber.unsubscribe();
    subscriber.quit();
  });
});

// In result publication function
async function publishResults(drawId, results) {
  // ... publish to database

  // Broadcast via Redis Pub/Sub
  await redis.publish('results:published', JSON.stringify({
    draw_id: drawId,
    results: results,
    timestamp: new Date()
  }));
}
```

---

## 12. SAMPLE CODE IMPLEMENTATIONS

### 12.1 Complete Node.js/Express Example - Create Ticket Endpoint

See section 6.1 for full implementation.

### 12.2 Permission Checking Middleware

Already provided in section 4 (Authentication & Authorization).

### 12.3 Limit Validation Function

See section 6.5 for complete implementation.

### 12.4 Prize Calculation Function

```javascript
// services/prizeService.js
async function calculatePrize(ticketLine, result) {
  // Get prize configuration
  const config = await sql.connect().request()
    .input('betting_pool_id', sql.Int, ticketLine.betting_pool_id)
    .input('lottery_id', sql.Int, ticketLine.lottery_id)
    .input('game_type_id', sql.Int, ticketLine.bet_type_id)
    .query(`
      SELECT prize_payment_1, prize_payment_2, prize_payment_3, prize_payment_4
      FROM betting_pool_prizes_commissions
      WHERE betting_pool_id = @betting_pool_id
        AND lottery_id = @lottery_id
        AND game_type = (SELECT game_type_code FROM game_types WHERE game_type_id = @game_type_id)
    `);

  if (config.recordset.length === 0) {
    throw new Error('Prize configuration not found');
  }

  const prizeConfig = config.recordset[0];

  // Determine prize multiplier based on position
  let multiplier = 0;

  if (result.position === 1) {
    multiplier = prizeConfig.prize_payment_1;
  } else if (result.position === 2) {
    multiplier = prizeConfig.prize_payment_2;
  } else if (result.position === 3) {
    multiplier = prizeConfig.prize_payment_3;
  }

  // Calculate prize
  const prizeAmount = ticketLine.net_amount * multiplier;

  return {
    prize_amount: prizeAmount,
    multiplier: multiplier,
    position: result.position
  };
}

module.exports = { calculatePrize };
```

---

## 13. TESTING STRATEGY

### 13.1 Unit Tests (Jest)

```javascript
// tests/services/limitService.test.js
const { checkLimit } = require('../../services/limitService');
const sql = require('mssql');

jest.mock('mssql');

describe('Limit Service', () => {
  describe('checkLimit', () => {
    it('should return limit_ok: true when within limit', async () => {
      // Mock database response
      sql.connect().request().query.mockResolvedValueOnce({
        recordset: [{ max_amount_per_number: 500 }]
      });

      sql.connect().request().query.mockResolvedValueOnce({
        recordset: [{ current_amount: 100 }]
      });

      const result = await checkLimit(5, 150, '23', 50);

      expect(result.limit_ok).toBe(true);
      expect(result.limit_available).toBe(400);
    });

    it('should return limit_ok: false when exceeds limit', async () => {
      sql.connect().request().query.mockResolvedValueOnce({
        recordset: [{ max_amount_per_number: 500 }]
      });

      sql.connect().request().query.mockResolvedValueOnce({
        recordset: [{ current_amount: 480 }]
      });

      const result = await checkLimit(5, 150, '23', 50);

      expect(result.limit_ok).toBe(false);
      expect(result.limit_available).toBe(20);
    });
  });
});
```

### 13.2 Integration Tests (Supertest)

```javascript
// tests/integration/tickets.test.js
const request = require('supertest');
const app = require('../../app');
const sql = require('mssql');

describe('POST /api/tickets', () => {
  let authToken;

  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test.user',
        password: 'password123'
      });

    authToken = response.body.data.token;
  });

  afterAll(async () => {
    await sql.close();
  });

  it('should create ticket successfully', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        betting_pool_id: 1,
        lines: [
          {
            lottery_id: 5,
            draw_id: 150,
            draw_date: '2025-10-23',
            draw_time: '12:00',
            bet_number: '23',
            bet_type_code: 'DIRECTO',
            bet_amount: 100
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.ticket_code).toBeDefined();
  });

  it('should reject ticket with invalid bet amount', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        betting_pool_id: 1,
        lines: [
          {
            lottery_id: 5,
            draw_id: 150,
            draw_date: '2025-10-23',
            draw_time: '12:00',
            bet_number: '23',
            bet_type_code: 'DIRECTO',
            bet_amount: -10
          }
        ]
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### 13.3 Load Testing Considerations

```javascript
// Use tools like Apache JMeter, k6, or Artillery

// Example k6 script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50, // 50 virtual users
  duration: '5m',
};

const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'your-token';

export default function() {
  // Create ticket
  let response = http.post(`${BASE_URL}/api/tickets`, JSON.stringify({
    betting_pool_id: 1,
    lines: [{
      lottery_id: 5,
      draw_id: 150,
      draw_date: '2025-10-23',
      draw_time: '12:00',
      bet_number: Math.floor(Math.random() * 100).toString(),
      bet_type_code: 'DIRECTO',
      bet_amount: 100
    }]
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });

  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);
}
```

---

## 14. DEPLOYMENT & MONITORING

### 14.1 Environment Variables

```bash
# .env file
NODE_ENV=production

# Database
DB_SERVER=your-server.database.windows.net
DB_NAME=lottery_database
DB_USER=api_user
DB_PASSWORD=SecurePassword123!
DB_ENCRYPT=true

# JWT
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# API
PORT=3000
API_BASE_URL=/api
FRONTEND_URL=https://your-frontend.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/app.log

# Monitoring
ENABLE_PROMETHEUS=true
PROMETHEUS_PORT=9090
```

### 14.2 Health Check Endpoint

```javascript
// routes/health.routes.js
router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {}
  };

  try {
    // Check database connection
    await sql.connect().request().query('SELECT 1');
    health.checks.database = 'OK';
  } catch (error) {
    health.checks.database = 'FAIL';
    health.status = 'DEGRADED';
  }

  try {
    // Check Redis connection
    await redis.ping();
    health.checks.redis = 'OK';
  } catch (error) {
    health.checks.redis = 'FAIL';
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### 14.3 Monitoring Queries

```sql
-- Active connections
SELECT
    DB_NAME(dbid) as DatabaseName,
    COUNT(dbid) as NumberOfConnections,
    loginame
FROM sys.sysprocesses
WHERE dbid > 0
GROUP BY dbid, loginame;

-- Slow queries (from query store)
SELECT TOP 10
    qt.query_sql_text,
    rs.avg_duration / 1000.0 AS avg_duration_ms,
    rs.count_executions
FROM sys.query_store_query_text qt
INNER JOIN sys.query_store_query q ON qt.query_text_id = q.query_text_id
INNER JOIN sys.query_store_plan p ON q.query_id = p.query_id
INNER JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
ORDER BY rs.avg_duration DESC;

-- Table sizes
SELECT
    t.name AS TableName,
    p.rows AS RowCount,
    SUM(a.total_pages) * 8 / 1024 AS TotalSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
GROUP BY t.name, p.rows
ORDER BY TotalSpaceMB DESC;

-- Error log summary (from error_logs table)
SELECT
    error_severity,
    error_procedure,
    COUNT(*) as error_count,
    MAX(created_at) as last_occurrence
FROM error_logs
WHERE created_at >= DATEADD(hour, -24, GETDATE())
GROUP BY error_severity, error_procedure
ORDER BY error_count DESC;
```

### 14.4 Backup Strategy

```sql
-- Full backup (daily at 2 AM)
BACKUP DATABASE lottery_database
TO DISK = 'C:\Backups\lottery_database_full.bak'
WITH FORMAT, COMPRESSION, STATS = 10;

-- Differential backup (every 6 hours)
BACKUP DATABASE lottery_database
TO DISK = 'C:\Backups\lottery_database_diff.bak'
WITH DIFFERENTIAL, COMPRESSION, STATS = 10;

-- Transaction log backup (every hour)
BACKUP LOG lottery_database
TO DISK = 'C:\Backups\lottery_database_log.trn'
WITH COMPRESSION, STATS = 10;
```

---

## 15. APPENDICES

### A. Glossary of Lottery Terms

| Spanish Term | English | Description |
|--------------|---------|-------------|
| **Banca** | Betting Pool / Shop | Sales point authorized to sell lottery tickets |
| **Casa Matriz** | Central Operator | Main lottery system operator |
| **Sorteo** | Draw | Lottery draw event |
| **Jugada** | Bet / Play | Individual bet on a number |
| **Directo / Quiniela** | Straight | Exact number match in specific position |
| **Pale** | Box | Number wins in any position |
| **Tripleta** | Triple | Three numbers in any order |
| **Número Caliente** | Hot Number | Number near its betting limit |
| **Límite** | Limit | Maximum amount that can be bet |
| **Excedente** | Excess / Surplus | Amount over the limit, shared with other operators |
| **Caída** | Fall / Loss | Accumulated losses of a betting pool |
| **Comisión** | Commission | Percentage retained by betting pool |
| **Premio** | Prize | Winning payout amount |
| **Vendedor** | Seller | User who creates tickets |
| **Cobrador** | Collector | Zone manager responsible for collections |

### B. Common SQL Queries

```sql
-- Get daily sales for a betting pool
SELECT
    CAST(created_at AS DATE) as sale_date,
    COUNT(*) as ticket_count,
    SUM(total_amount) as total_sales,
    SUM(grand_total) as net_sales
FROM tickets
WHERE betting_pool_id = @betting_pool_id
    AND status != 'cancelled'
    AND created_at >= DATEADD(day, -7, GETDATE())
GROUP BY CAST(created_at AS DATE)
ORDER BY sale_date DESC;

-- Get hot numbers for a draw
SELECT TOP 50
    bet_number,
    SUM(bet_amount) as total_bet,
    COUNT(*) as bet_count
FROM ticket_lines
WHERE lottery_id = @lottery_id
    AND draw_id = @draw_id
    AND draw_date = @draw_date
    AND line_status NOT IN ('cancelled')
GROUP BY bet_number
ORDER BY total_bet DESC;

-- Get pending winners for a betting pool
SELECT
    t.ticket_code,
    t.customer_name,
    t.grand_total as ticket_amount,
    SUM(tl.prize_amount) as total_prize,
    MIN(t.created_at) as ticket_date
FROM tickets t
INNER JOIN ticket_lines tl ON t.ticket_id = tl.ticket_id
WHERE t.betting_pool_id = @betting_pool_id
    AND t.status = 'winner'
    AND t.paid_at IS NULL
GROUP BY t.ticket_id, t.ticket_code, t.customer_name, t.grand_total, t.created_at
ORDER BY ticket_date;

-- Get user permissions (combined direct + role)
SELECT DISTINCT p.permission_code, p.permission_name
FROM permissions p
WHERE p.permission_id IN (
    -- Direct permissions
    SELECT permission_id FROM user_permissions
    WHERE user_id = @user_id AND is_active = 1
    UNION
    -- Role permissions
    SELECT rp.permission_id FROM role_permissions rp
    INNER JOIN user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = @user_id AND ur.is_active = 1 AND rp.is_active = 1
)
ORDER BY p.permission_code;
```

### C. Transaction Isolation Levels

```javascript
// For ticket creation (prevent dirty reads)
const transaction = new sql.Transaction(pool);
transaction.isolationLevel = sql.ISOLATION_LEVEL.READ_COMMITTED;
await transaction.begin();

// For limit checks (allow dirty reads for performance)
const transaction = new sql.Transaction(pool);
transaction.isolationLevel = sql.ISOLATION_LEVEL.READ_UNCOMMITTED;
await transaction.begin();

// For financial reconciliation (prevent phantom reads)
const transaction = new sql.Transaction(pool);
transaction.isolationLevel = sql.ISOLATION_LEVEL.REPEATABLE_READ;
await transaction.begin();
```

### D. Connection Pool Settings

```javascript
// Recommended settings for different load scenarios

// Low Load (< 100 concurrent users)
pool: {
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeout: 5000
}

// Medium Load (100-500 concurrent users)
pool: {
  max: 50,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeout: 5000
}

// High Load (500+ concurrent users)
pool: {
  max: 100,
  min: 10,
  idleTimeoutMillis: 30000,
  connectionTimeout: 5000
}
```

---

## 🎉 CONCLUSION

This guide provides everything needed to build a production-ready REST API for the lottery system. The API must:

✅ **Handle complex ticket creation** with validations and limit checks
✅ **Manage real-time operations** (hot numbers, limit consumption)
✅ **Enforce business rules** at the API level
✅ **Provide comprehensive error handling** and logging
✅ **Implement proper authentication** and authorization
✅ **Optimize performance** with caching and indexes
✅ **Support real-time features** via WebSockets
✅ **Maintain complete audit trail** of all operations

### Next Steps for API Developer:

1. **Set up development environment** (Node.js/Express or .NET)
2. **Configure database connection** to SQL Server
3. **Implement authentication** (JWT)
4. **Start with critical endpoints** (tickets, limits, draws)
5. **Add validation and error handling**
6. **Implement real-time features** (WebSocket for hot numbers)
7. **Write tests** (unit + integration)
8. **Deploy to staging** environment
9. **Load test** and optimize
10. **Deploy to production** with monitoring

### Support Documents:
- **lottery_database_complete.sql** - Complete database schema
- **SCRIPT_CHANGES_APPLIED.md** - Recent database improvements
- **DATABASE_ANALYSIS_REPORT.md** - 29 questions for client + issues
- **SISTEMA_NEGOCIO_LOTTO.md** - Complete business model documentation

**Good luck building the API!** 🚀

---

**Document Version:** 1.0
**Last Updated:** October 22, 2025
**Maintained By:** Database & Backend Team
