# Changelog

All notable changes to the Lottery API project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project documentation (README.md, ARCHITECTURE.md, API.md)
- Unit of Work pattern for transaction management
- Memory caching service for static data
- Response compression (Brotli + Gzip)
- Rate limiting (100 req/min, 500 req/15min, 2000 req/hour)
- API versioning support (URL, Query String, Header)
- FluentValidation activation for all endpoints

### Changed
- Optimized EF Core queries by removing unnecessary Include statements
- Refactored BettingPoolsController queries to use direct projection
- Improved query performance by avoiding N+1 problems

### Removed
- 26 obsolete documentation files from docs/
- Temporary installation scripts
- Redundant utility scripts

---

## [1.0.0] - 2025-01-13

### Added
- Initial release of Lottery API
- JWT authentication with BCrypt password hashing
- User management with role-based permissions
- Lottery and draw management
- Betting pool (banca) configuration and operations
- Multi-level prize configuration (lottery, draw, banca)
- Zone-based organization
- 14 controllers with 93+ endpoints
- Swagger/OpenAPI documentation (v3.0 + v2.0)
- Azure SQL Database integration
- Serilog logging (console + file)
- Global error handling middleware
- Repository pattern with EF Core
- CORS support
- Health check endpoint

### Database
- 36 entity models
- IDENTITY support for transactional tables
- N:N relationship tables (user_permissions, user_zones, user_betting_pools)
- Soft delete implementation
- Audit columns (created_at, updated_at, created_by, updated_by)

---

## How to Update This Changelog

### Categories

Use these categories for organizing changes:

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes

### Version Format

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes (e.g., 2.0.0)
- **MINOR** version for new functionality in a backwards-compatible manner (e.g., 1.1.0)
- **PATCH** version for backwards-compatible bug fixes (e.g., 1.0.1)

### Example Entry

```markdown
## [1.1.0] - 2025-01-20

### Added
- New endpoint GET /api/tickets for retrieving ticket history
- Real-time draw results with SignalR

### Changed
- Improved BettingPoolService performance with caching

### Fixed
- Fixed bug where inactive users could still login
- Corrected prize calculation for box bets

### Security
- Updated JWT token expiration to 8 hours
```

---

## Links

- [Repository](https://github.com/your-org/Lottery-Apis)
- [Issues](https://github.com/your-org/Lottery-Apis/issues)
- [Documentation](./README.md)
