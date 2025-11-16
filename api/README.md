# Lottery API

> **ASP.NET Core 8.0 REST API** for comprehensive lottery management system with support for betting pools, draws, prizes, and user management.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![License](https://img.shields.io/badge/license-MIT-blue)
![Azure](https://img.shields.io/badge/deployed-Azure-0078D4?logo=microsoft-azure)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Lottery API is a production-ready REST API designed to manage lottery operations for betting pools (bancas). It provides comprehensive functionality for:

- User authentication and authorization with role-based permissions
- Lottery and draw management with multiple game types
- Betting pool (banca) configuration and operations
- Prize configuration at multiple levels (lottery, draw, banca)
- Zone-based organization and user assignments
- Real-time draw results and ticket management

**Live API:** Running in production on Azure App Service
**Database:** Azure SQL Database (`lottery-db`)
**Documentation:** Swagger UI available at `/swagger`

---

## Features

### Core Functionality

- **Authentication & Authorization**
  - JWT Bearer token authentication
  - Role-based access control (RBAC)
  - User permissions at granular level
  - Secure password hashing with BCrypt

- **Lottery Management**
  - Multiple lottery types support
  - Draw scheduling and results
  - Prize configuration (3 levels: lottery, draw, banca)
  - Game type compatibility system

- **Betting Pool (Banca) Operations**
  - Multi-zone betting pool management
  - Custom prize configurations per banca
  - Operating schedules and time windows
  - Print configuration and styles
  - Automatic expense tracking

- **User & Zone Management**
  - Hierarchical zone organization
  - User-zone assignments (N:N)
  - User-betting pool relationships
  - Commission tracking

### Technical Features

- **Performance Optimizations**
  - Unit of Work pattern for transaction management
  - Memory caching for static data
  - Response compression (Brotli + Gzip)
  - Optimized EF Core queries with projection

- **API Features**
  - Rate limiting (100 req/min, 500 req/15min)
  - API versioning support (URL, Query String, Header)
  - FluentValidation for request validation
  - Centralized error handling
  - Comprehensive logging with Serilog

- **Documentation**
  - Swagger UI (OpenAPI 3.0 + Swagger 2.0)
  - XML documentation comments
  - Multiple API format exports (JSON, YAML)

---

## Tech Stack

### Framework & Runtime
- **ASP.NET Core** 8.0
- **.NET** 8.0
- **C#** 12

### Database & ORM
- **Azure SQL Database** (Production)
- **Entity Framework Core** 8.0
- **Dapper** 2.1 (for optimized queries)

### Authentication & Security
- **JWT Bearer Authentication**
- **BCrypt.Net** (Password hashing)
- **AspNetCoreRateLimit** (Rate limiting)

### Validation & Mapping
- **FluentValidation** 11.3
- Manual DTO mapping (no AutoMapper dependency)

### Logging & Monitoring
- **Serilog** 8.0
  - Console sink
  - File sink (rolling daily)
  - Structured logging

### API Documentation
- **Swashbuckle.AspNetCore** 6.8
- OpenAPI 3.0 & Swagger 2.0 support

### Development Tools
- **Microsoft.EntityFrameworkCore.Tools** (Migrations)
- **Microsoft.EntityFrameworkCore.Design**

---

## Prerequisites

### Required
- **.NET SDK 8.0** or higher ([Download](https://dotnet.microsoft.com/download))
- **Azure SQL Database** access (connection string required)
- **Git** for version control

### Optional
- **Visual Studio 2022** or **VS Code** with C# extension
- **Postman** or similar API testing tool
- **Azure CLI** (for deployment)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/Lottery-Apis.git
cd Lottery-Apis
```

### 2. Configure Database Connection

Edit `src/LotteryApi/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER.database.windows.net,1433;Initial Catalog=lottery-db;User ID=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

**Production Connection:**
- Server: `lottery-sql-1505.database.windows.net`
- Database: `lottery-db`
- See deployment documentation for credentials

### 3. Configure JWT Secret

Update JWT settings in `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "YOUR_SUPER_SECRET_KEY_HERE_MINIMUM_32_CHARACTERS",
    "Issuer": "LotteryApi",
    "Audience": "LotteryApi",
    "ExpiryInHours": 12
  }
}
```

### 4. Restore Dependencies

```bash
cd src/LotteryApi
dotnet restore
```

### 5. Run the Application

#### Development (Windows/Linux/macOS)
```bash
dotnet run --urls "http://0.0.0.0:5000"
```

#### WSL (Windows Subsystem for Linux)
```bash
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run --urls "http://0.0.0.0:5000"
```

### 6. Access the API

- **API Base URL:** http://localhost:5000
- **Swagger UI:** http://localhost:5000/swagger
- **Health Check:** http://localhost:5000/health
- **API Info:** http://localhost:5000/api/info

---

## Project Structure

```
Lottery-Apis/
├── src/
│   └── LotteryApi/                    # Main API project
│       ├── Controllers/               # API endpoints (14 controllers)
│       │   ├── AuthController.cs      # Login/Register (2 endpoints)
│       │   ├── UsersController.cs     # User management (14 endpoints)
│       │   ├── PermissionsController.cs  # Permissions (11 endpoints)
│       │   ├── LotteriesController.cs    # Lottery CRUD
│       │   ├── DrawsController.cs        # Draw management
│       │   ├── BettingPoolsController.cs # Banca operations
│       │   ├── ZonesController.cs        # Zone management
│       │   ├── BetTypesController.cs     # Bet type configurations
│       │   └── ...                       # Prize configs, game types, etc.
│       │
│       ├── Models/                    # Entity models (36 models)
│       │   ├── User.cs
│       │   ├── Permission.cs
│       │   ├── Lottery.cs
│       │   ├── Draw.cs
│       │   ├── BettingPool.cs
│       │   ├── Zone.cs
│       │   └── ...
│       │
│       ├── DTOs/                      # Data Transfer Objects (12 DTOs)
│       │   ├── UserDto.cs             # 9 User DTOs
│       │   ├── PermissionDto.cs       # 4 Permission DTOs
│       │   ├── AuthDto.cs             # Login/Register DTOs
│       │   ├── LotteryDto.cs
│       │   └── ...
│       │
│       ├── Repositories/              # Data access layer
│       │   ├── IGenericRepository.cs  # Base repository interface
│       │   ├── GenericRepository.cs   # Generic CRUD implementation
│       │   ├── IUserRepository.cs
│       │   ├── UserRepository.cs
│       │   ├── ILotteryRepository.cs
│       │   ├── LotteryRepository.cs
│       │   └── ...
│       │
│       ├── Services/                  # Business logic services
│       │   ├── IAuthService.cs
│       │   ├── AuthService.cs         # Authentication logic
│       │   ├── ICacheService.cs
│       │   └── MemoryCacheService.cs  # Caching implementation
│       │
│       ├── Data/                      # EF Core context
│       │   ├── LotteryDbContext.cs    # DbContext configuration
│       │   ├── IUnitOfWork.cs         # Unit of Work interface
│       │   └── UnitOfWork.cs          # Transaction management
│       │
│       ├── Middleware/                # Custom middleware
│       │   └── ErrorHandlingMiddleware.cs  # Global error handler
│       │
│       ├── Validators/                # FluentValidation validators
│       │   ├── LoginDtoValidator.cs
│       │   ├── RegisterDtoValidator.cs
│       │   └── CreateLotteryDtoValidator.cs
│       │
│       ├── Program.cs                 # Application entry point
│       ├── appsettings.json          # Configuration
│       └── LotteryApi.csproj         # Project file
│
├── tests/
│   └── LotteryApi.Tests/             # Unit & integration tests
│
├── README.md                          # This file
├── ARCHITECTURE.md                    # Architecture documentation
└── API.md                            # API endpoints documentation
```

---

## Configuration

### Application Settings

The API uses a hierarchical configuration system:

1. **appsettings.json** - Base configuration
2. **appsettings.Development.json** - Development overrides
3. **appsettings.Production.json** - Production overrides
4. **Environment Variables** - Highest priority (Azure App Service)

### Key Configuration Sections

#### Database Connection
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=lottery-db;..."
  }
}
```

#### JWT Authentication
```json
{
  "Jwt": {
    "Key": "YourSecretKeyHere",
    "Issuer": "LotteryApi",
    "Audience": "LotteryApi",
    "ExpiryInHours": 12
  }
}
```

#### Rate Limiting
```json
{
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "GeneralRules": [
      { "Endpoint": "*", "Period": "1m", "Limit": 100 },
      { "Endpoint": "*", "Period": "15m", "Limit": 500 },
      { "Endpoint": "*", "Period": "1h", "Limit": 2000 },
      { "Endpoint": "POST:/api/auth/*", "Period": "1m", "Limit": 10 }
    ]
  }
}
```

#### Logging (Serilog)
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/lottery-api-.txt",
          "rollingInterval": "Day"
        }
      }
    ]
  }
}
```

---

## API Documentation

### Swagger UI

Access comprehensive API documentation at:
- **http://localhost:5000/swagger** (Local)
- **Production Swagger URL** (if deployed)

### Available Formats

The API provides documentation in multiple formats:

| Format | Endpoint |
|--------|----------|
| OpenAPI 3.0 (JSON) | `/swagger/v1-openapi3/swagger.json` |
| OpenAPI 3.0 (YAML) | `/swagger/v1-openapi3/swagger.yaml` |
| Swagger 2.0 (JSON) | `/swagger/v1-swagger2/swagger.json` |
| Swagger 2.0 (YAML) | `/swagger/v1-swagger2/swagger.yaml` |

### Quick API Overview

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Authentication | 2 | Login, Register |
| Users | 14 | CRUD, permissions, zones |
| Permissions | 11 | Permission management |
| Lotteries | 8+ | Lottery configuration |
| Draws | 10+ | Draw management & results |
| Betting Pools | 20+ | Banca operations & config |
| Zones | 10+ | Zone hierarchy management |
| Prizes | 15+ | Multi-level prize config |
| Bet Types | 8+ | Game type configurations |

**Total:** ~93 endpoints across 14 controllers

For detailed endpoint documentation, see [API.md](./API.md)

---

## Database

### Schema Overview

The API uses Azure SQL Database with the following main tables:

**Core Entities:**
- `users` - User accounts
- `permissions` - Permission definitions
- `roles` - User roles
- `lotteries` - Lottery definitions
- `draws` - Draw instances
- `betting_pools` - Banca configurations
- `zones` - Geographic organization
- `tickets` - Bet tickets
- `results` - Draw results

**Relationship Tables:**
- `user_permissions` (N:N)
- `user_zones` (N:N)
- `user_betting_pools` (N:N)
- `betting_pool_draws` (N:N)

**Configuration Tables:**
- `draw_prize_config` - Draw-level prizes
- `banca_prize_config` - Banca-level overrides
- `bet_types` - Available bet types
- `game_types` - Game categories
- `betting_pool_schedules` - Operating hours

### IDENTITY Columns

The following tables use SQL Server IDENTITY for auto-increment:
- `users` (user_id)
- `permissions` (permission_id)
- `user_permissions` (user_permission_id)
- `user_zones` (user_zone_id)
- `user_betting_pools` (user_betting_pool_id)
- `tickets` (ticket_id)
- `ticket_lines` (line_id)

### Connection

**Production Database:**
- **Server:** `lottery-sql-1505.database.windows.net`
- **Database:** `lottery-db`
- **Authentication:** SQL Authentication
- **Encryption:** Required (TLS 1.2+)

---

## Deployment

### Azure App Service

The API is deployed to Azure App Service with continuous deployment via GitHub Actions.

#### Prerequisites
- Azure subscription
- Azure SQL Database
- Azure App Service (Linux or Windows)

#### Quick Deployment

1. **Configure Azure App Service Connection String:**
   ```bash
   az webapp config connection-string set \
     --name your-app-name \
     --resource-group your-rg \
     --settings DefaultConnection="Server=..." \
     --connection-string-type SQLAzure
   ```

2. **Set JWT Secret:**
   ```bash
   az webapp config appsettings set \
     --name your-app-name \
     --resource-group your-rg \
     --settings Jwt__Key="YourSecretKey"
   ```

3. **Deploy via GitHub Actions:**
   - Push to `main` branch triggers automatic deployment
   - See `.github/workflows/` for CI/CD configuration

#### Manual Deployment

```bash
# Publish the application
dotnet publish -c Release -o ./publish

# Deploy to Azure (requires Azure CLI)
az webapp deploy --resource-group your-rg \
                 --name your-app-name \
                 --src-path ./publish.zip
```

### Health Monitoring

Check API health:
```bash
curl https://your-api.azurewebsites.net/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-13T12:00:00Z",
  "environment": "Production"
}
```

---

## Development

### Build the Project

```bash
dotnet build
```

### Run Tests

```bash
dotnet test
```

### Watch Mode (Auto-rebuild)

```bash
dotnet watch run --urls "http://0.0.0.0:5000"
```

### Code Style

This project follows:
- **C# Coding Conventions** (Microsoft)
- **PascalCase** for classes, methods, properties
- **camelCase** for local variables, parameters
- **JSON responses** use camelCase (configured)

---

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new betting pool configuration endpoint
fix: resolve user permission assignment bug
docs: update API documentation
refactor: extract betting pool service logic
test: add unit tests for lottery repository
```

### Code Review Process

All PRs require:
- ✅ Passing build
- ✅ All tests passing
- ✅ Code review approval
- ✅ No merge conflicts

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support & Contact

For questions, issues, or feature requests:

- **Issues:** [GitHub Issues](https://github.com/your-org/Lottery-Apis/issues)
- **Email:** support@lotteryapi.com
- **Documentation:** [Wiki](https://github.com/your-org/Lottery-Apis/wiki)

---

## Architecture

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## API Reference

For detailed API endpoint documentation, see [API.md](./API.md)

---

**Built with** ❤️ **using ASP.NET Core 8.0**
