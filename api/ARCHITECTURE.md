# Lottery API - Architecture Documentation

> Detailed technical architecture, design patterns, and architectural decisions for the Lottery API project.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Design Patterns](#design-patterns)
- [Layered Architecture](#layered-architecture)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [Security Architecture](#security-architecture)
- [Performance Optimizations](#performance-optimizations)
- [API Versioning Strategy](#api-versioning-strategy)
- [Error Handling](#error-handling)
- [Architectural Decisions](#architectural-decisions)
- [Future Improvements](#future-improvements)

---

## Architecture Overview

The Lottery API follows a **Clean Architecture** approach with clear separation of concerns across multiple layers. The architecture prioritizes:

- **Maintainability:** Clear boundaries between layers
- **Testability:** Dependency injection and interface-based design
- **Scalability:** Stateless design, caching, and optimized queries
- **Security:** JWT authentication, rate limiting, input validation

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (React Frontend, Mobile Apps, Third-party Integrations)    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS (REST)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  Rate Limiting │ CORS │ Authentication │ Compression        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Controller Layer                           │
│  (AuthController, UsersController, LotteriesController...)  │
│  Responsibilities:                                           │
│  - HTTP request/response handling                            │
│  - Input validation (FluentValidation)                       │
│  - Authorization checks ([Authorize])                        │
│  - DTO mapping                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  (AuthService, CacheService, [Future: BettingPoolService])  │
│  Responsibilities:                                           │
│  - Business logic orchestration                              │
│  - Cross-cutting concerns (caching, logging)                 │
│  - Complex workflows                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Repository Layer                            │
│  (GenericRepository, UserRepository, LotteryRepository...)  │
│  Responsibilities:                                           │
│  - Data access abstraction                                   │
│  - Query composition                                         │
│  - Entity tracking                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Unit of Work Pattern                          │
│  Coordinates repositories and manages transactions          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Data Access Layer                            │
│  (LotteryDbContext - Entity Framework Core)                 │
│  Responsibilities:                                           │
│  - ORM configuration                                         │
│  - Database connection management                            │
│  - Change tracking                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Azure SQL Database                          │
│  Production: lottery-db                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access logic and provide a collection-like interface for domain entities.

**Implementation:**
```csharp
// Generic repository for common CRUD operations
public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

// Specific repositories extend with specialized queries
public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    // ... other user-specific queries
}
```

**Benefits:**
- ✅ Centralized data access logic
- ✅ Easy to mock for testing
- ✅ Reduces code duplication
- ✅ Allows query optimization in one place

### 2. Unit of Work Pattern

**Purpose:** Maintain a list of objects affected by a business transaction and coordinate the writing out of changes.

**Implementation:**
```csharp
public interface IUnitOfWork : IDisposable
{
    ILotteryRepository Lotteries { get; }
    IDrawRepository Draws { get; }
    IUserRepository Users { get; }
    IPermissionRepository Permissions { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

**Usage Example:**
```csharp
// Multiple operations in a single transaction
await _unitOfWork.BeginTransactionAsync();
try
{
    var user = await _unitOfWork.Users.AddAsync(newUser);
    await _unitOfWork.SaveChangesAsync();

    foreach (var permissionId in dto.PermissionIds)
    {
        await _unitOfWork.Permissions.AssignToUserAsync(user.UserId, permissionId);
    }
    await _unitOfWork.SaveChangesAsync();

    await _unitOfWork.CommitTransactionAsync();
}
catch
{
    await _unitOfWork.RollbackTransactionAsync();
    throw;
}
```

**Benefits:**
- ✅ ACID compliance for complex operations
- ✅ Reduced database round-trips
- ✅ Atomic operations across multiple repositories
- ✅ Easier rollback on failures

### 3. Dependency Injection (DI)

**Purpose:** Invert dependencies and achieve loose coupling between components.

**Configuration (Program.cs):**
```csharp
// Repository registration
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ILotteryRepository, LotteryRepository>();

// Service registration
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();

// Unit of Work registration
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// DbContext registration
builder.Services.AddDbContext<LotteryDbContext>(options =>
    options.UseSqlServer(connectionString));
```

**Lifetime Scopes:**
- **Scoped:** Per HTTP request (Repositories, DbContext, UnitOfWork)
- **Singleton:** Application lifetime (CacheService, RateLimitConfiguration)
- **Transient:** Created each time requested (not used in this project)

### 4. DTO Pattern (Data Transfer Objects)

**Purpose:** Decouple internal domain models from API contracts.

**Benefits:**
- ✅ API versioning without breaking existing clients
- ✅ Control what data is exposed
- ✅ Reduce over-posting vulnerabilities
- ✅ Optimize payload size

**Example:**
```csharp
// Domain Model (internal)
public class User
{
    public int UserId { get; set; }
    public string PasswordHash { get; set; }  // Never expose!
    public string Username { get; set; }
    // ... navigation properties
}

// DTO (exposed via API)
public class UserDto
{
    public int UserId { get; set; }
    public string Username { get; set; }
    public string? Email { get; set; }
    // No password hash!
}
```

### 5. Middleware Pipeline Pattern

**Purpose:** Chain request processing components for cross-cutting concerns.

**Pipeline Configuration (Program.cs):**
```csharp
// Order matters! Middleware executes in registration order
app.UseResponseCompression();      // 1. Compress responses
app.UseSwagger();                   // 2. Swagger docs
app.UseSwaggerUI();                 // 3. Swagger UI
app.UseMiddleware<ErrorHandlingMiddleware>(); // 4. Global error handler
app.UseIpRateLimiting();           // 5. Rate limiting
app.UseCors("AllowAll");           // 6. CORS
app.UseAuthentication();           // 7. JWT validation
app.UseAuthorization();            // 8. Permission checks
app.MapControllers();              // 9. Route to controllers
```

---

## Layered Architecture

### Layer 1: Presentation Layer (Controllers)

**Responsibilities:**
- Accept HTTP requests
- Validate input (FluentValidation)
- Call services/repositories
- Map domain models to DTOs
- Return HTTP responses

**Current State:**
- ✅ Well-defined with 14 controllers
- ⚠️ **Issue:** Some controllers have too much logic (1000+ lines)
- 🎯 **Future:** Extract business logic to Service layer

**Example Controller Pattern:**
```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LotteriesController : ControllerBase
{
    private readonly ILotteryRepository _lotteryRepository;
    private readonly ILogger<LotteriesController> _logger;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1)
    {
        var lotteries = await _lotteryRepository.GetPagedAsync(page, 20);
        var dtos = lotteries.Select(MapToDto);
        return Ok(dtos);
    }
}
```

### Layer 2: Service Layer (Business Logic)

**Responsibilities:**
- Complex business logic
- Workflow orchestration
- Cross-cutting concerns (caching, logging)
- Transaction coordination

**Current State:**
- ✅ `AuthService` - Login/Register logic
- ✅ `MemoryCacheService` - Caching abstraction
- ⚠️ **Missing:** Most business logic is in controllers
- 🎯 **Future:** Create `BettingPoolService`, `UserService`, `DrawService`, etc.

**Target Service Pattern:**
```csharp
public interface IBettingPoolService
{
    Task<PagedResponse<BettingPoolDto>> GetAllAsync(BettingPoolFilters filters);
    Task<BettingPoolDetailDto> GetByIdAsync(int id);
    Task<BettingPoolDto> CreateAsync(CreateBettingPoolDto dto);
    Task UpdateAsync(int id, UpdateBettingPoolDto dto);
}

public class BettingPoolService : IBettingPoolService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly ILogger<BettingPoolService> _logger;

    // Implementation with caching, logging, validation
}
```

### Layer 3: Data Access Layer (Repositories)

**Responsibilities:**
- Query construction
- Entity tracking
- Database interaction abstraction

**Current State:**
- ✅ Generic repository for common CRUD
- ✅ Specialized repositories: User, Permission, Lottery, Draw
- ✅ Unit of Work for transaction management

**Query Optimization Pattern:**
```csharp
// ❌ BAD: N+1 problem with Include
var users = await _context.Users
    .Include(u => u.Role)
    .Include(u => u.Permissions)
    .ToListAsync();

// ✅ GOOD: Direct projection (single SQL query)
var users = await _context.Users
    .Select(u => new UserDto {
        UserId = u.UserId,
        Username = u.Username,
        RoleName = u.Role.RoleName,
        PermissionCount = u.Permissions.Count
    })
    .ToListAsync();
```

### Layer 4: Data Layer (Entity Framework Core)

**Responsibilities:**
- ORM configuration
- Entity mappings
- Migration management
- Database connection pooling

**DbContext Configuration:**
```csharp
public class LotteryDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Lottery> Lotteries { get; set; }
    // ... 36 DbSets total

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Table mappings with snake_case
        modelBuilder.Entity<User>().ToTable("users");

        // Relationships
        modelBuilder.Entity<UserPermission>()
            .HasOne(up => up.User)
            .WithMany(u => u.UserPermissions)
            .HasForeignKey(up => up.UserId);

        // Indexes for performance
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
    }
}
```

---

## Data Flow

### Authentication Flow

```
1. Client sends POST /api/auth/login
   Body: { "username": "admin", "password": "pass123" }

2. AuthController receives request
   → Validates with FluentValidation
   → Calls AuthService.LoginAsync(dto)

3. AuthService
   → Calls UserRepository.GetByUsernameAsync()
   → Verifies password with BCrypt
   → Updates LastLoginAt
   → Generates JWT token
   → Returns LoginResponseDto

4. Controller returns 200 OK
   Body: { "token": "eyJ...", "username": "admin", "expiresAt": "..." }

5. Client stores token
   → Subsequent requests include: Authorization: Bearer eyJ...
```

### CRUD Operation Flow (with Unit of Work)

```
1. Client sends POST /api/bettingpools
   Headers: Authorization: Bearer eyJ...
   Body: { "name": "Banca Central", "zoneId": 1, ... }

2. Middleware Pipeline
   → ErrorHandlingMiddleware (wrap try-catch)
   → RateLimitMiddleware (check limits)
   → AuthenticationMiddleware (validate JWT)
   → AuthorizationMiddleware (check permissions)

3. BettingPoolsController.Create()
   → Validates DTO with FluentValidation
   → Maps DTO to BettingPool entity
   → Calls UnitOfWork

4. Unit of Work Pattern
   await _unitOfWork.BeginTransactionAsync();

   var pool = await _unitOfWork.BettingPools.AddAsync(entity);
   await _unitOfWork.SaveChangesAsync();  // Get ID

   // Assign default configurations
   await _unitOfWork.Configs.CreateDefaultAsync(pool.Id);
   await _unitOfWork.SaveChangesAsync();

   await _unitOfWork.CommitTransactionAsync();

5. Controller returns 201 Created
   Headers: Location: /api/bettingpools/42
   Body: { "bettingPoolId": 42, "name": "Banca Central", ... }
```

---

## Database Design

### Key Design Decisions

#### 1. **IDENTITY Columns for Transactional Tables**

```sql
-- IDENTITY auto-increment for primary keys
CREATE TABLE [users] (
    [user_id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(50) NOT NULL,
    ...
    CONSTRAINT [PK_users] PRIMARY KEY ([user_id])
);
```

**Reasoning:**
- ✅ Automatic ID generation
- ✅ Prevents ID conflicts in concurrent environments
- ✅ Better performance than GUID for clustered indexes

#### 2. **N:M Relationship Tables with Composite Keys**

```sql
CREATE TABLE [user_permissions] (
    [user_permission_id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [permission_id] INT NOT NULL,
    [is_active] BIT DEFAULT 1,
    CONSTRAINT [PK_user_permissions] PRIMARY KEY ([user_permission_id]),
    CONSTRAINT [UQ_user_permissions] UNIQUE ([user_id], [permission_id]),
    CONSTRAINT [FK_user_permissions_users] FOREIGN KEY ([user_id]) REFERENCES [users]([user_id]),
    CONSTRAINT [FK_user_permissions_permissions] FOREIGN KEY ([permission_id]) REFERENCES [permissions]([permission_id])
);
```

**Reasoning:**
- ✅ Surrogate key (user_permission_id) for easier ORM handling
- ✅ Unique constraint on natural key (user_id, permission_id)
- ✅ Foreign keys for referential integrity
- ✅ Soft delete with is_active flag

#### 3. **Audit Columns on All Tables**

```sql
[created_at] DATETIME2 DEFAULT GETDATE(),
[updated_at] DATETIME2 NULL,
[created_by] INT NULL,
[updated_by] INT NULL
```

**Reasoning:**
- ✅ Track when records are created/modified
- ✅ Compliance and debugging
- ✅ User accountability

#### 4. **Soft Deletes with is_active**

```sql
[is_active] BIT NOT NULL DEFAULT 1,
[deleted_at] DATETIME2 NULL
```

**Reasoning:**
- ✅ Preserve historical data
- ✅ Enable data recovery
- ✅ Maintain referential integrity

### Entity Relationships

```
Users (1) ──< (N) UserPermissions (N) >── (1) Permissions
  │
  ├──< (N) UserZones (N) >── (1) Zones
  │
  └──< (N) UserBettingPools (N) >── (1) BettingPools
                                          │
                                          ├── (1:1) BettingPoolConfig
                                          ├── (1:1) BettingPoolPrintConfig
                                          ├── (1:1) BettingPoolDiscountConfig
                                          ├──< (N) BettingPoolSchedules
                                          ├──< (N) BettingPoolSortitions
                                          └──< (N) BancaPrizeConfigs

Lotteries (1) ──< (N) Draws (1) ──< (N) DrawPrizeConfigs
    │                   │
    │                   └──< (N) BettingPoolDraws (N) >── (1) BettingPools
    │
    └──< (N) LotteryBetTypeCompatibilities (N) >── (1) BetTypes
```

---

## Security Architecture

### 1. Authentication: JWT Bearer Tokens

**Configuration:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero  // No tolerance for expired tokens
        };
    });
```

**Token Generation:**
```csharp
var claims = new[] {
    new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
    new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
    new Claim("role", user.Role?.RoleName ?? "User")
};

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

var token = new JwtSecurityToken(
    issuer: _jwtIssuer,
    audience: _jwtAudience,
    claims: claims,
    expires: DateTime.Now.AddHours(12),
    signingCredentials: credentials
);
```

**Security Features:**
- ✅ HS256 algorithm (HMAC-SHA256)
- ✅ 12-hour expiration
- ✅ Zero clock skew (strict expiration)
- ✅ Claims-based identity

### 2. Authorization: Role-Based + Permission-Based

**Controller-Level Authorization:**
```csharp
[Authorize]  // Requires valid JWT token
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    // Only authenticated users can access
}
```

**Future: Permission-Based Authorization**
```csharp
[Authorize(Policy = "RequireAdminRole")]
public async Task<IActionResult> DeleteUser(int id)
{
    // Only admins can delete users
}

// Policy configuration
builder.Services.AddAuthorization(options => {
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("ManageUsers", policy =>
        policy.RequireClaim("permission", "users:write"));
});
```

### 3. Password Security

**Hashing:** BCrypt (Work Factor: 11 rounds)
```csharp
// Registration
var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

// Login verification
bool isValid = BCrypt.Net.BCrypt.Verify(enteredPassword, storedHash);
```

**Benefits:**
- ✅ Salted automatically
- ✅ Adaptive (configurable work factor)
- ✅ Resistant to rainbow tables
- ✅ Resistant to brute-force (slow by design)

### 4. Rate Limiting

**Configuration:**
```json
{
  "IpRateLimiting": {
    "GeneralRules": [
      { "Endpoint": "*", "Period": "1m", "Limit": 100 },
      { "Endpoint": "*", "Period": "15m", "Limit": 500 },
      { "Endpoint": "*", "Period": "1h", "Limit": 2000 },
      { "Endpoint": "POST:/api/auth/*", "Period": "1m", "Limit": 10 }
    ]
  }
}
```

**Protection Against:**
- ✅ DDoS attacks
- ✅ Brute-force login attempts
- ✅ API abuse
- ✅ Credential stuffing

### 5. Input Validation

**FluentValidation:**
```csharp
public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(50);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6);
    }
}
```

**Protection Against:**
- ✅ SQL Injection (parameterized queries)
- ✅ XSS (JSON serialization escapes)
- ✅ Over-posting (explicit DTO binding)
- ✅ Mass assignment (whitelisted properties)

---

## Performance Optimizations

### 1. Memory Caching

**Implementation:**
```csharp
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public async Task<T?> GetAsync<T>(string key)
    {
        return _cache.TryGetValue(key, out T? value) ? value : default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var options = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(expiration ?? TimeSpan.FromHours(1));
        _cache.Set(key, value, options);
    }
}
```

**Usage:**
```csharp
// Cache lotteries (rarely change)
var cacheKey = "lotteries:all";
var lotteries = await _cache.GetAsync<List<LotteryDto>>(cacheKey);

if (lotteries == null)
{
    lotteries = await _repository.GetAllAsync();
    await _cache.SetAsync(cacheKey, lotteries, TimeSpan.FromHours(24));
}
```

**Cache Strategy:**
- Static data: 24 hours (lotteries, game types)
- User data: 1 hour (permissions, roles)
- Dynamic data: No cache (draws, tickets)

### 2. Response Compression

**Configuration:**
```csharp
builder.Services.AddResponseCompression(options => {
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options => {
    options.Level = CompressionLevel.Optimal;
});
```

**Performance Impact:**
- 🚀 50-70% reduction in payload size
- 🚀 Faster response times on slow networks
- 🚀 Reduced bandwidth costs

### 3. Query Optimization

**Avoid N+1 Problems:**
```csharp
// ❌ BAD: N+1 queries (1 for users + N for roles)
var users = await _context.Users.ToListAsync();
foreach (var user in users) {
    var roleName = user.Role.RoleName;  // Lazy load = extra query
}

// ✅ GOOD: Single query with projection
var users = await _context.Users
    .Select(u => new UserDto {
        UserId = u.UserId,
        Username = u.Username,
        RoleName = u.Role.RoleName  // Compiled into JOIN
    })
    .ToListAsync();
```

**Use AsNoTracking for Read-Only:**
```csharp
// Read-only queries don't need change tracking
var lotteries = await _context.Lotteries
    .AsNoTracking()  // 30-40% faster
    .ToListAsync();
```

### 4. Connection Pooling

**Default Configuration:**
- Min Pool Size: 0
- Max Pool Size: 100
- Connection Lifetime: 0 (unlimited)
- Connection Timeout: 30 seconds

**Benefits:**
- ✅ Reuse existing connections
- ✅ Reduce connection establishment overhead
- ✅ Handle connection spikes

---

## API Versioning Strategy

**Current Implementation:**
```csharp
builder.Services.AddApiVersioning(options => {
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new QueryStringApiVersionReader("api-version"),
        new HeaderApiVersionReader("X-Api-Version")
    );
});
```

**Versioning Methods:**
1. **URL Segment:** `/api/v1/users`
2. **Query String:** `/api/users?api-version=1.0`
3. **Header:** `X-Api-Version: 1.0`

**Future v2 Changes:**
- Enhanced filtering options
- GraphQL support
- WebSocket for real-time updates

---

## Error Handling

### Global Exception Handler

**Middleware:**
```csharp
public class ErrorHandlingMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try {
            await _next(context);
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Unhandled exception");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = exception switch {
            ArgumentException => HttpStatusCode.BadRequest,
            UnauthorizedAccessException => HttpStatusCode.Unauthorized,
            KeyNotFoundException => HttpStatusCode.NotFound,
            InvalidOperationException => HttpStatusCode.Conflict,
            _ => HttpStatusCode.InternalServerError
        };

        var problemDetails = new ProblemDetails {
            Status = (int)statusCode,
            Title = GetTitle(statusCode),
            Detail = exception.Message
        };

        context.Response.StatusCode = (int)statusCode;
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
```

**Response Format (RFC 7807 Problem Details):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "User with ID 999 not found",
  "instance": "/api/users/999"
}
```

---

## Architectural Decisions

### ADR-001: Use Repository Pattern Over Direct DbContext Injection

**Decision:** Implement Repository Pattern instead of injecting DbContext directly into controllers.

**Rationale:**
- Abstraction allows easier unit testing (mock repositories)
- Centralizes data access logic
- Prevents controllers from coupling to EF Core
- Enables query optimization in one place

**Status:** Implemented ✅

---

### ADR-002: Implement Unit of Work for Transaction Management

**Decision:** Use Unit of Work pattern to coordinate repositories and manage transactions.

**Rationale:**
- Multiple operations need ACID guarantees
- Repositories shouldn't manage transactions individually
- Simplifies complex workflows (e.g., user creation with permissions)

**Status:** Implemented ✅

---

### ADR-003: Use DTOs for API Contracts

**Decision:** Never expose domain entities directly through API endpoints.

**Rationale:**
- Prevent over-posting vulnerabilities
- Enable API versioning without breaking changes
- Control sensitive data exposure (e.g., password hashes)
- Optimize payload size

**Status:** Implemented ✅

---

### ADR-004: Extract Business Logic to Service Layer

**Decision:** Move complex business logic from controllers to dedicated service classes.

**Rationale:**
- Controllers should be thin (routing + validation)
- Business logic should be testable independently
- Enables code reuse across controllers
- Improves maintainability

**Status:** Partially implemented ⚠️ (AuthService exists, others needed)

---

### ADR-005: Use JWT for Stateless Authentication

**Decision:** Implement JWT Bearer tokens instead of session-based auth.

**Rationale:**
- Stateless (no server-side session storage)
- Scalable (works across multiple servers)
- Mobile-friendly (native apps can store tokens)
- Standard (OAuth 2.0 compatible)

**Status:** Implemented ✅

---

## Future Improvements

### Phase 1: Refactoring (Priority: HIGH)

1. **Extract Services from Large Controllers**
   - BettingPoolsController (1016 lines) → BettingPoolService
   - BettingPoolPrizesCommissionsController (846 lines) → PrizesCommissionsService
   - UsersController (729 lines) → UserService (enhance existing)

2. **Improve Error Handling**
   - Custom exception types (e.g., `UserNotFoundException`)
   - Detailed error codes for client-side handling
   - Localization support for error messages

3. **Add Comprehensive Tests**
   - Unit tests for services (target: 80% coverage)
   - Integration tests for critical endpoints
   - Load testing for performance benchmarks

### Phase 2: Features (Priority: MEDIUM)

4. **Implement CQRS Pattern**
   - Separate read and write operations
   - Optimize read models with projections
   - Use MediatR for command/query handling

5. **Add Real-Time Features**
   - SignalR for live draw results
   - WebSocket notifications
   - Server-Sent Events for updates

6. **Enhanced Caching Strategy**
   - Distributed cache (Redis) for multi-server deployments
   - Cache invalidation patterns
   - Cache-aside pattern for all static data

### Phase 3: Scalability (Priority: LOW)

7. **Message Queue Integration**
   - Azure Service Bus for async operations
   - Background jobs for heavy processing
   - Event-driven architecture

8. **Monitoring & Observability**
   - Application Insights integration
   - Distributed tracing (OpenTelemetry)
   - Custom metrics and dashboards

9. **GraphQL Support**
   - Add GraphQL endpoint alongside REST
   - Enable flexible queries from clients
   - Reduce over-fetching

---

## Conclusion

The Lottery API follows industry best practices with a solid foundation in Clean Architecture, SOLID principles, and proven design patterns. The current architecture supports the business requirements effectively while maintaining good separation of concerns.

**Strengths:**
- ✅ Clear layered architecture
- ✅ Repository + Unit of Work patterns
- ✅ Security-first approach (JWT, BCrypt, Rate Limiting)
- ✅ Performance optimizations (caching, compression, query optimization)

**Areas for Improvement:**
- ⚠️ Extract business logic from controllers to services
- ⚠️ Increase test coverage
- ⚠️ Add distributed caching for scalability

With the refactoring plan in place, the API will achieve even higher maintainability and scalability while preserving all existing functionality.

---

**Last Updated:** 2025-01-13
**Version:** 1.0
