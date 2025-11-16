# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this Lottery API project.

## 📍 Project Paths

**Primary Working Directory:** `/mnt/h/GIT/Lottery-Apis`
**Windows Path:** `H:\GIT\Lottery-Apis`

**API Source Code:** `src/LotteryApi/`
**Tests:** `tests/LotteryApi.Tests/`

## 🔗 Related Projects

**Lottery Database Project:** This API consumes data from the comprehensive SQL Server lottery database.
- **Location (WSL):** `/mnt/h/GIT/Lottery-Database`
- **Location (Windows):** `H:\GIT\Lottery-Database`
- **GitHub:** https://github.com/jorge-vsoftware-solutions/Lottery-Database
- **Main Script:** `lottery_database_complete.sql`
- **Azure Deployment:** `deploy-simple.ps1`
- **Documentation:** See `Lottery-Database/CLAUDE.md` for database schema details

## 🚀 Quick Start Commands

### Run the API (from WSL)
```bash
cd /mnt/h/GIT/Lottery-Apis
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
cd src/LotteryApi
dotnet run --urls "http://0.0.0.0:5000"
```

### Run the API (from PowerShell)
```powershell
cd H:\GIT\Lottery-Apis\src\LotteryApi
dotnet run --urls "http://0.0.0.0:5000"
```

### Access Points
- **API Base URL:** http://localhost:5000
- **Swagger UI:** http://localhost:5000/swagger
- **From Windows (WSL IP):** http://172.19.169.103:5000

## 🗃️ Azure SQL Database Connection

**Server:** lottery-sql-1505.database.windows.net
**Database:** lottery-db
**Username:** lotteryAdmin
**Password:** NewLottery2025

**Connection String (.NET):**
```
Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db;User ID=lotteryAdmin;Password=NewLottery2025;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

**Configuration Files:**
- Production: `src/LotteryApi/appsettings.Production.json`
- Development: `src/LotteryApi/appsettings.Development.json`

## 🏗️ Project Structure

```
Lottery-Apis/
├── src/LotteryApi/
│   ├── Controllers/
│   │   ├── AuthController.cs          # Login/Register (2 endpoints)
│   │   ├── UsersController.cs         # User management (14 endpoints) ⭐ NEW
│   │   ├── PermissionsController.cs   # Permission CRUD (11 endpoints)
│   │   ├── LotteriesController.cs     # Lottery management
│   │   └── DrawsController.cs         # Draw management
│   ├── Models/                        # 26 Entity models
│   ├── DTOs/
│   │   ├── UserDto.cs                 # 9 User DTOs ⭐ NEW
│   │   ├── PermissionDto.cs           # 4 Permission DTOs
│   │   ├── AuthDto.cs                 # Authentication DTOs
│   │   └── ...                        # Other DTOs
│   ├── Repositories/                  # Data access layer
│   ├── Services/                      # Business logic
│   ├── Validators/                    # FluentValidation
│   └── Data/
│       └── LotteryDbContext.cs        # EF Core DbContext (with trigger support)
├── SqlRunner/                         # SQL script executor
├── tests/LotteryApi.Tests/            # Unit tests
└── AZURE_SQL_GUIDE.md                 # Complete Azure SQL documentation
```

## 🔧 Technologies

- **Framework:** ASP.NET Core 8.0
- **ORM:** Entity Framework Core 8.0
- **Database:** Azure SQL Database
- **Authentication:** JWT Bearer
- **Validation:** FluentValidation
- **API Documentation:** Swagger/OpenAPI
- **Architecture:** Repository Pattern

## 📋 Implemented Features

### ✅ Controllers (5)
1. **AuthController** - User authentication (Login, Register)
2. **UsersController** - User management (14 endpoints) ⭐ NEW
3. **LotteriesController** - Lottery CRUD operations
4. **DrawsController** - Draw CRUD operations
5. **PermissionsController** - Permission management (11 endpoints)

### ✅ User Management Endpoints (14) ⭐ NEW
- `GET /api/users` - Get all users with pagination and filtering
- `GET /api/users/{id}` - Get user by ID with full details
- `GET /api/users/{userId}/permissions` - Get user's permissions (frontend v1 compatible)
- `GET /api/users/email/{email}` - Get user by email
- `GET /api/users/username/{username}` - Get user by username
- `GET /api/users/role/{roleId}` - Get users by role
- `GET /api/users/active` - Get all active users
- `GET /api/users/search` - Search users by criteria
- `POST /api/users` - Create new user (basic)
- `POST /api/users/with-permissions` - Create user with permissions assigned
- `PUT /api/users/{id}` - Update user basic info
- `PUT /api/users/{userId}/permissions` - Update user permissions (add/remove)
- `PUT /api/users/{id}/password` - Change user password
- `DELETE /api/users/{id}` - Soft delete user (sets IsActive = false)

### ✅ Permission Endpoints (11)
- `GET /api/permissions` - Get all with pagination
- `GET /api/permissions/{id}` - Get by ID
- `GET /api/permissions/code/{code}` - Get by permission code
- `GET /api/permissions/category/{category}` - Get by category
- `GET /api/permissions/active` - Get all active permissions
- `GET /api/permissions/categories` - Get permissions grouped by category ⭐ NEW
- `GET /api/permissions/all` - Get flat list of all permissions ⭐ NEW
- `POST /api/permissions` - Create new permission
- `PUT /api/permissions/{id}` - Update permission
- `DELETE /api/permissions/{id}` - Soft delete (sets IsActive = false)
- `DELETE /api/permissions/{id}/permanent` - Hard delete

## 🗄️ Database Schema Status

### Tables with IDENTITY (Auto-increment)
- ✅ `users` (user_id) - IDENTITY(1,1) - Fixed 2025-10-22
- ✅ `permissions` (permission_id) - IDENTITY(1,1) - Fixed 2025-10-23
- ✅ `user_permissions` (user_permission_id) - IDENTITY(1,1) - Fixed 2025-10-23 ⭐ NEW
- ✅ `user_zones` (user_zone_id) - IDENTITY(1,1) - Fixed 2025-10-23 ⭐ NEW
- ✅ `user_betting_pools` (user_betting_pool_id) - IDENTITY(1,1) - Fixed 2025-10-23 ⭐ NEW
- ✅ `tickets` (ticket_id) - Original
- ✅ `ticket_lines` (line_id) - Original

### Database Fix Scripts Available
- `fix-users-table-v2.sql` - Adds IDENTITY to users table
- `fix-permissions-table.sql` - Adds IDENTITY to permissions table
- `fix-identity-tables.sql` - Adds IDENTITY to N:M relationship tables (user_permissions, user_zones, user_betting_pools) ⭐ NEW

## 🔐 Azure Access

**Subscription:** IotSlots
**Tenant:** vsoftware-solutions.com
**Resource Group:** rg-lottery-api
**Location:** West US 2

### Available Databases
| Database | Tier | Capacity | Max Size | Usage |
|----------|------|----------|----------|-------|
| lottery-db | Basic | 5 DTU | 2GB | ✅ Development/Testing (current) |
| Lottery | GeneralPurpose Gen5 | 2 vCores | 32GB | Production |
| LottoTest | Basic | 5 DTU | 2GB | Testing |

## 📚 Documentation Files

- **AZURE_SQL_GUIDE.md** - Complete Azure SQL connection guide with credentials, troubleshooting, and Azure CLI commands
- **PERMISSIONS_IMPLEMENTATION_SUMMARY.md** - Full permissions implementation details and testing results
- **SWAGGER_OPENAPI_GUIDE.md** - Swagger configuration and examples
- **QUICK_START.md** - Quick start guide for developers
- **README.md** - Project overview and setup instructions

## ⚠️ Important Notes

1. **Password:** `NewLottery2025` (updated November 2025)
2. **WSL .NET Variables:** Always export `DOTNET_ROOT` and `PATH` before running dotnet commands in non-interactive shells
3. **Port Binding:** Use `0.0.0.0:5000` to allow access from Windows
4. **Protected Files:** `.gitignore` protects appsettings.*.local.json and secrets files

## 🔄 Common Tasks

### Build the Project
```bash
export DOTNET_ROOT=$HOME/.dotnet && export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet build src/LotteryApi/LotteryApi.csproj
```

### Run Tests
```bash
dotnet test tests/LotteryApi.Tests/LotteryApi.Tests.csproj
```

### Execute SQL Script on Azure
```bash
cd SqlRunner
dotnet run
```

### Check API Status
```bash
curl http://localhost:5000/swagger/index.html
```

## 📊 Current Status

**API Status:** ✅ Running and tested
**Database:** ✅ Connected to Azure SQL (lottery-db)
**Authentication:** ✅ JWT working
**Swagger:** ✅ Fully configured and accessible
**Permissions CRUD:** ✅ 100% functional with IDENTITY support
**User Management:** ✅ 100% functional (14 endpoints, tested 11/11) ⭐ NEW
**Frontend Compatibility:** ✅ Compatible with v1 and v2 frontend applications
**Git Repository:** https://github.com/jorge-vsoftware-solutions/Lottery-Apis

---

**Last Updated:** 2025-11-13
**Maintained by:** Lottery-Apis Project Team
