using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Exceptions;
using LotteryApi.Helpers;
using LotteryApi.Models;
using LotteryApi.DTOs;
using LotteryApi.Services;
using BCrypt.Net;
using System.Text.Json;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/betting-pools")]
public class BettingPoolsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BettingPoolsController> _logger;
    private readonly IZoneScopeService _zoneScope;
    // Tenant-aware code prefix. Read once from configuration so the same
    // codebase can issue LB-XXXX for Lottobook and LC-XXXX for La Central
    // by setting BettingPool__CodePrefix on each tenant's App Service.
    private readonly string _codePrefix;

    public BettingPoolsController(LotteryDbContext context, ILogger<BettingPoolsController> logger, IZoneScopeService zoneScope, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _zoneScope = zoneScope;
        _codePrefix = configuration["BettingPool:CodePrefix"] ?? "LB-";
    }

    /// <summary>
    /// Returns true if the current user holds the given permission code.
    /// </summary>
    private async Task<bool> HasPermissionAsync(string code)
    {
        var userId = CurrentUserId();
        if (userId == null) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId.Value
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == code);
    }

    /// <summary>Resolve the current user id from JWT claims (null if missing).</summary>
    private int? CurrentUserId()
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var id) ? id : (int?)null;
    }

    /// <summary>JSON options used by the audit log so the frontend can decode
    /// the `details` payload with camelCase property names.</summary>
    private static readonly JsonSerializerOptions AuditJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    /// <summary>Append a `{field, oldValue, newValue}` entry when values differ.
    /// Stringifies both sides so the JSON stays stable regardless of CLR type.</summary>
    private static void TrackChange(List<object> changes, string field, object? oldValue, object? newValue)
    {
        var oldStr = oldValue?.ToString();
        var newStr = newValue?.ToString();
        if (oldStr != newStr)
        {
            changes.Add(new { field, oldValue = oldStr, newValue = newStr });
        }
    }

    /// <summary>
    /// Pulls field-level changes from EF Core's change tracker for the given
    /// entity. Returns one `{field, oldValue, newValue}` per actually-modified
    /// property, skipping audit/FK columns. Must be called BEFORE
    /// SaveChangesAsync — EF resets entries to Unchanged after persisting.
    ///
    /// Uses EF's equality (not string comparison) so values that stringify
    /// differently but represent the same number (e.g. `5` vs `5.00m`) are
    /// correctly treated as unchanged.
    /// </summary>
    private IEnumerable<object> ChangesFromTracker(object? entity, string section)
    {
        if (entity == null) yield break;
        var entry = _context.Entry(entity);
        var isNew = entry.State == Microsoft.EntityFrameworkCore.EntityState.Added;
        var excluded = new HashSet<string> {
            "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy",
            "BettingPoolId", "BettingPoolConfigId", "BettingPoolDiscountConfigId",
            "BettingPoolPrintConfigId", "BettingPoolFooterId",
        };

        foreach (var p in entry.Properties)
        {
            var name = p.Metadata.Name;
            if (excluded.Contains(name)) continue;

            // Existing rows: only walk properties EF flagged as modified.
            // New rows: every non-default-value property counts as "new".
            if (!isNew && !p.IsModified) continue;

            var oldVal = isNew ? null : p.OriginalValue;
            var newVal = p.CurrentValue;
            // Belt-and-suspenders: EF sometimes flags a property modified even
            // when the value is effectively unchanged (e.g. the same decimal
            // assigned again). Equals catches that.
            if (Equals(oldVal, newVal)) continue;

            var camel = char.ToLowerInvariant(name[0]) + name[1..];
            // Empty section ⇒ no prefix (used by direct-on-pool changes like
            // the mass-update endpoint, whose fields share the same un-prefixed
            // namespace as the single-pool UPDATE endpoint).
            var fieldKey = string.IsNullOrEmpty(section) ? camel : section + "." + camel;
            yield return new
            {
                field = fieldKey,
                oldValue = oldVal?.ToString(),
                newValue = newVal?.ToString(),
            };
        }
    }

    /// <summary>
    /// True if the current user has an active assignment to the given banca.
    /// Used to let POS users read data scoped to their own banca even without admin perms.
    /// </summary>
    private async Task<bool> IsAssignedToBettingPoolAsync(int bettingPoolId)
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;
        return await _context.UserBettingPools.AsNoTracking()
            .AnyAsync(ubp => ubp.UserId == userId && ubp.BettingPoolId == bettingPoolId && ubp.IsActive);
    }

    /// <summary>
    /// Get all betting pools with pagination and filtering
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20, max: 5000)</param>
    /// <param name="search">Search by name or code</param>
    /// <param name="zoneId">Filter by zone</param>
    /// <param name="isActive">Filter by active status</param>
    /// <returns>Paginated list of betting pools</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<BettingPoolListDto>>> GetBettingPools(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? zoneId = null,
        [FromQuery] bool? isActive = null)
    {
        if (!await HasPermissionAsync("BANK_ACCESS")) return Forbid();
        try
        {
            // Validate pagination parameters. Cap raised to 5000 so tenants
            // with several hundred bancas (e.g. La Central with 600) can load
            // the full list for client-side filtering on the list page.
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 5000);

            // Build query - No Include needed, EF will optimize with Select projection
            var query = _context.BettingPools.AsQueryable();

            // Zone scope: admin with assigned zones only sees bancas in those zones.
            // Super-admin (no zones) → allowedZones is null → no filter.
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZones != null)
            {
                query = query.Where(bp => allowedZones.Contains(bp.ZoneId));
            }

            // Apply filters
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(bp =>
                    bp.BettingPoolName.ToLower().Contains(searchLower) ||
                    bp.BettingPoolCode.ToLower().Contains(searchLower));
            }

            if (zoneId.HasValue)
            {
                query = query.Where(bp => bp.ZoneId == zoneId.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(bp => bp.IsActive == isActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // ✅ OPTIMIZED: Apply pagination with direct projection (single SQL query with JOINs)
            var bettingPools = await query
                .OrderBy(bp => bp.BettingPoolName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(bp => new BettingPoolListDto
                {
                    BettingPoolId = bp.BettingPoolId,
                    BettingPoolCode = bp.BettingPoolCode,
                    BettingPoolName = bp.BettingPoolName,
                    ZoneId = bp.ZoneId,
                    ZoneName = bp.Zone != null ? bp.Zone.ZoneName : null,
                    BankId = bp.BankId,
                    BankName = bp.Bank != null ? bp.Bank.BankName : null,
                    Location = bp.Location,
                    Phone = bp.Phone,
                    Reference = bp.Reference,
                    Users = bp.UserBettingPools
                        .Where(ubp => ubp.IsActive && ubp.User != null && ubp.User.IsActive
                            && ubp.User.Role != null && ubp.User.Role.RoleName == "POS")
                        .Select(ubp => ubp.User!.Username)
                        .ToList(),
                    IsActive = bp.IsActive,
                    CreatedAt = bp.CreatedAt,
                    Balance = bp.Balance != null ? bp.Balance.CurrentBalance : 0m
                })
                .ToListAsync();

            var response = new PagedResponse<BettingPoolListDto>
            {
                Items = bettingPools,
                PageNumber = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting betting pools");
            return StatusCode(500, new { message = "Error al obtener las bancas" });
        }
    }

    /// <summary>
    /// Get betting pool by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BettingPoolDetailDto>> GetBettingPool(int id)
    {
        // Admins need BANK_ACCESS. POS users can read their own banca without it.
        if (!await HasPermissionAsync("BANK_ACCESS") && !await IsAssignedToBettingPoolAsync(id)) return Forbid();
        try
        {
            // Scope check — admin cannot read a banca outside their assigned zones.
            if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            // Direct projection - no Include needed, single optimized SQL query
            var bettingPool = await _context.BettingPools
                .Where(bp => bp.BettingPoolId == id)
                .Select(bp => new
                {
                    bp.BettingPoolId,
                    bp.BettingPoolCode,
                    bp.BettingPoolName,
                    bp.ZoneId,
                    ZoneName = bp.Zone.ZoneName,
                    bp.BankId,
                    BankName = bp.Bank != null ? bp.Bank.BankName : null,
                    bp.Address,
                    bp.Phone,
                    bp.Location,
                    bp.Reference,
                    bp.Comment,
                    bp.Username,
                    bp.IsActive,
                    bp.CreatedAt,
                    bp.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (bettingPool == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var dto = new BettingPoolDetailDto
            {
                BettingPoolId = bettingPool.BettingPoolId,
                BettingPoolCode = bettingPool.BettingPoolCode,
                BettingPoolName = bettingPool.BettingPoolName,
                ZoneId = bettingPool.ZoneId,
                ZoneName = bettingPool.ZoneName,
                BankId = bettingPool.BankId,
                BankName = bettingPool.BankName,
                Address = bettingPool.Address,
                Phone = bettingPool.Phone,
                Location = bettingPool.Location,
                Reference = bettingPool.Reference,
                Comment = bettingPool.Comment,
                Username = bettingPool.Username,
                IsActive = bettingPool.IsActive,
                CreatedAt = bettingPool.CreatedAt,
                UpdatedAt = bettingPool.UpdatedAt
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting betting pool {Id}", id);
            return StatusCode(500, new { message = "Error al obtener la banca" });
        }
    }

    /// <summary>
    /// Get next available betting pool code (format: {prefix}XXXX, e.g. LB-XXXX or LC-XXXX)
    /// </summary>
    [HttpGet("next-code")]
    public async Task<ActionResult<NextBettingPoolCodeDto>> GetNextCode()
    {
        try
        {
            // Get all betting pool codes that start with the tenant prefix and extract the highest number
            var lbCodes = await _context.BettingPools
                .Where(bp => bp.BettingPoolCode.StartsWith(_codePrefix))
                .Select(bp => bp.BettingPoolCode)
                .ToListAsync();

            int maxNumber = 0;
            foreach (var code in lbCodes)
            {
                // Extract number from code (e.g., "LB-0013" -> 13)
                if (code.Length > _codePrefix.Length && int.TryParse(code.Substring(_codePrefix.Length), out int num))
                {
                    if (num > maxNumber) maxNumber = num;
                }
            }

            // Next number is max + 1
            int nextNumber = maxNumber + 1;

            // Generate code with format {prefix}XXXX (e.g., LB-0001, LC-0014, etc.)
            string nextCode = $"{_codePrefix}{nextNumber:D4}";

            return Ok(new NextBettingPoolCodeDto
            {
                NextCode = nextCode,
                Suggestion = $"Código sugerido: {nextCode}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting next betting pool code");
            return StatusCode(500, new { message = "Error al obtener el próximo código" });
        }
    }

    /// <summary>
    /// Create new betting pool
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BettingPoolDetailDto>> CreateBettingPool([FromBody] CreateBettingPoolDto dto)
    {
        if (!await HasPermissionAsync("CREATE_BANKS")) return Forbid();
        try
        {
            // Validate zone exists
            var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == dto.ZoneId);
            if (!zoneExists)
            {
                return ApiErrorResult.BadRequest(ErrorCodes.ZoneNotFound, "La zona especificada no existe");
            }

            // Zone scope: admin can only create bancas in their assigned zones.
            if (!await _zoneScope.IsZoneAllowedAsync(dto.ZoneId))
            {
                return Forbid();
            }

            // Validate bank if provided
            if (dto.BankId.HasValue)
            {
                var bankExists = await _context.Banks.AnyAsync(b => b.BankId == dto.BankId.Value);
                if (!bankExists)
                {
                    return ApiErrorResult.BadRequest(ErrorCodes.BankNotFound, "El banco especificado no existe");
                }
            }

            // Check if code already exists
            var codeExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolCode == dto.BettingPoolCode);
            if (codeExists)
            {
                return ApiErrorResult.Conflict(ErrorCodes.BettingPoolCodeExists, "El código de banca ya existe");
            }

            // Validate username and password are required
            if (string.IsNullOrWhiteSpace(dto.Username))
            {
                return ApiErrorResult.BadRequest(ErrorCodes.UsernameRequired, "El nombre de usuario es requerido");
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return ApiErrorResult.BadRequest(ErrorCodes.PasswordRequired, "La contraseña es requerida");
            }

            // Check if username already exists
            var userExists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower());
            if (userExists)
            {
                return ApiErrorResult.Conflict(ErrorCodes.UserAlreadyExists, "Ya existe un usuario con ese nombre");
            }

            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create betting pool
            var bettingPool = new BettingPool
            {
                BettingPoolCode = dto.BettingPoolCode,
                BettingPoolName = dto.BettingPoolName,
                ZoneId = dto.ZoneId,
                BankId = dto.BankId,
                Address = dto.Address,
                Phone = dto.Phone,
                Location = dto.Location,
                Reference = dto.Reference,
                Comment = dto.Comment,
                Username = dto.Username,
                PasswordHash = hashedPassword,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.BettingPools.Add(bettingPool);
            await _context.SaveChangesAsync();

            // After saving, update the code if it doesn't match the tenant prefix format
            // Generate next sequential code based on existing codes for this tenant
            if (!dto.BettingPoolCode.StartsWith(_codePrefix))
            {
                var lbCodes = await _context.BettingPools
                    .Where(bp => bp.BettingPoolCode.StartsWith(_codePrefix))
                    .Select(bp => bp.BettingPoolCode)
                    .ToListAsync();

                int maxNumber = 0;
                foreach (var code in lbCodes)
                {
                    if (code.Length > _codePrefix.Length && int.TryParse(code.Substring(_codePrefix.Length), out int num))
                    {
                        if (num > maxNumber) maxNumber = num;
                    }
                }

                bettingPool.BettingPoolCode = $"{_codePrefix}{(maxNumber + 1):D4}";
                await _context.SaveChangesAsync();
            }

            // Load relationships for response
            await _context.Entry(bettingPool).Reference(bp => bp.Zone).LoadAsync();
            await _context.Entry(bettingPool).Reference(bp => bp.Bank).LoadAsync();

            // If username and password provided, create POS user and associate with betting pool
            if (!string.IsNullOrWhiteSpace(dto.Username) && !string.IsNullOrWhiteSpace(dto.Password))
            {
                // Check if username already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());

                if (existingUser == null)
                {
                    // Get the POS role
                    var posRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "POS");
                    if (posRole != null)
                    {
                        // Create the user
                        var user = new User
                        {
                            Username = dto.Username,
                            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                            FullName = dto.BettingPoolName,
                            Email = $"{dto.Username}@pos.local",
                            RoleId = posRole.RoleId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Users.Add(user);
                        await _context.SaveChangesAsync();

                        // Create the user-betting pool association
                        var userBettingPool = new UserBettingPool
                        {
                            UserId = user.UserId,
                            BettingPoolId = bettingPool.BettingPoolId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.UserBettingPools.Add(userBettingPool);
                        await _context.SaveChangesAsync();

                        _logger.LogInformation("Created POS user {Username} for new betting pool {BettingPoolId}",
                            dto.Username, bettingPool.BettingPoolId);
                    }
                }
            }

            var result = new BettingPoolDetailDto
            {
                BettingPoolId = bettingPool.BettingPoolId,
                BettingPoolCode = bettingPool.BettingPoolCode,
                BettingPoolName = bettingPool.BettingPoolName,
                ZoneId = bettingPool.ZoneId,
                ZoneName = bettingPool.Zone?.ZoneName,
                BankId = bettingPool.BankId,
                BankName = bettingPool.Bank?.BankName,
                Address = bettingPool.Address,
                Phone = bettingPool.Phone,
                Location = bettingPool.Location,
                Reference = bettingPool.Reference,
                Comment = bettingPool.Comment,
                Username = bettingPool.Username,
                IsActive = bettingPool.IsActive,
                CreatedAt = bettingPool.CreatedAt
            };

            return CreatedAtAction(nameof(GetBettingPool), new { id = bettingPool.BettingPoolId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating betting pool");
            return StatusCode(500, new { message = "Error al crear la banca" });
        }
    }

    /// <summary>
    /// Update existing betting pool
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<BettingPoolDetailDto>> UpdateBettingPool(int id, [FromBody] UpdateBettingPoolDto dto)
    {
        if (!await HasPermissionAsync("MANAGE_BANKS")) return Forbid();
        try
        {
            var bettingPool = await _context.BettingPools.FindAsync(id);
            if (bettingPool == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            // Zone scope: admin cannot edit a banca outside their assigned zones.
            if (!await _zoneScope.IsZoneAllowedAsync(bettingPool.ZoneId))
            {
                return Forbid();
            }

            // Snapshot mutable fields BEFORE any change so we can diff for the
            // audit log after SaveChanges. Password is intentionally excluded —
            // we only record that it changed, not the value.
            var beforeName = bettingPool.BettingPoolName;
            var beforeZoneId = bettingPool.ZoneId;
            var beforeBankId = bettingPool.BankId;
            var beforeAddress = bettingPool.Address;
            var beforePhone = bettingPool.Phone;
            var beforeLocation = bettingPool.Location;
            var beforeReference = bettingPool.Reference;
            var beforeComment = bettingPool.Comment;
            var beforeUsername = bettingPool.Username;
            var beforeIsActive = bettingPool.IsActive;

            // Validate zone if changed
            if (dto.ZoneId.HasValue)
            {
                var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == dto.ZoneId.Value);
                if (!zoneExists)
                {
                    return ApiErrorResult.BadRequest(ErrorCodes.ZoneNotFound, "La zona especificada no existe");
                }
                // Block moving a banca to a zone the admin doesn't manage.
                if (!await _zoneScope.IsZoneAllowedAsync(dto.ZoneId.Value))
                {
                    return Forbid();
                }
                bettingPool.ZoneId = dto.ZoneId.Value;
            }

            // Validate bank if changed
            if (dto.BankId.HasValue)
            {
                var bankExists = await _context.Banks.AnyAsync(b => b.BankId == dto.BankId.Value);
                if (!bankExists)
                {
                    return ApiErrorResult.BadRequest(ErrorCodes.BankNotFound, "El banco especificado no existe");
                }
                bettingPool.BankId = dto.BankId;
            }

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(dto.BettingPoolName))
            {
                bettingPool.BettingPoolName = dto.BettingPoolName;
            }

            if (dto.Address != null) bettingPool.Address = dto.Address;
            if (dto.Phone != null) bettingPool.Phone = dto.Phone;
            if (dto.Location != null) bettingPool.Location = dto.Location;
            if (dto.Reference != null) bettingPool.Reference = dto.Reference;
            if (dto.Comment != null) bettingPool.Comment = dto.Comment;
            if (dto.Username != null) bettingPool.Username = dto.Username;

            // Update password if provided — sync to both banca and POS user
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                bettingPool.PasswordHash = hashedPassword;

                // Sync password to the POS user (find by username match or user_betting_pools link)
                var posUser = await _context.UserBettingPools
                    .Where(ubp => ubp.BettingPoolId == id && ubp.IsActive)
                    .Select(ubp => ubp.User)
                    .FirstOrDefaultAsync();

                if (posUser == null && !string.IsNullOrWhiteSpace(bettingPool.Username))
                {
                    // POS user doesn't exist yet — create it
                    var posRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "POS");
                    if (posRole != null)
                    {
                        var newUser = new User
                        {
                            Username = bettingPool.Username,
                            PasswordHash = hashedPassword,
                            FullName = bettingPool.BettingPoolName,
                            Email = $"{bettingPool.Username}@pos.local",
                            RoleId = posRole.RoleId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Users.Add(newUser);
                        await _context.SaveChangesAsync();

                        _context.UserBettingPools.Add(new UserBettingPool
                        {
                            UserId = newUser.UserId,
                            BettingPoolId = id,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        });
                        _logger.LogInformation("Created POS user {Username} for banca {BettingPoolId} during password update", bettingPool.Username, id);
                    }
                }
                else if (posUser != null)
                {
                    posUser.PasswordHash = hashedPassword;
                    posUser.UpdatedAt = DateTime.UtcNow;
                }
            }

            if (dto.IsActive.HasValue)
            {
                bettingPool.IsActive = dto.IsActive.Value;
            }

            bettingPool.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Diff against the pre-mutation snapshot to record exactly which
            // fields changed. Password gets a value-less "changed" entry so we
            // never store the secret in the audit table.
            var changes = new List<object>();
            TrackChange(changes, "name", beforeName, bettingPool.BettingPoolName);
            TrackChange(changes, "zoneId", beforeZoneId, bettingPool.ZoneId);
            TrackChange(changes, "bankId", beforeBankId, bettingPool.BankId);
            TrackChange(changes, "address", beforeAddress, bettingPool.Address);
            TrackChange(changes, "phone", beforePhone, bettingPool.Phone);
            TrackChange(changes, "location", beforeLocation, bettingPool.Location);
            TrackChange(changes, "reference", beforeReference, bettingPool.Reference);
            TrackChange(changes, "comment", beforeComment, bettingPool.Comment);
            TrackChange(changes, "username", beforeUsername, bettingPool.Username);
            TrackChange(changes, "isActive", beforeIsActive, bettingPool.IsActive);
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                changes.Add(new { field = "password", oldValue = (string?)null, newValue = (string?)null });
            }

            if (changes.Count > 0)
            {
                _context.BettingPoolAuditLogs.Add(new BettingPoolAuditLog
                {
                    BettingPoolId = id,
                    UserId = CurrentUserId(),
                    Action = "UPDATED",
                    Details = JsonSerializer.Serialize(changes, AuditJsonOptions),
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    CreatedAt = DateTime.UtcNow,
                });
                await _context.SaveChangesAsync();
            }

            // Load relationships for response
            await _context.Entry(bettingPool).Reference(bp => bp.Zone).LoadAsync();
            await _context.Entry(bettingPool).Reference(bp => bp.Bank).LoadAsync();

            var result = new BettingPoolDetailDto
            {
                BettingPoolId = bettingPool.BettingPoolId,
                BettingPoolCode = bettingPool.BettingPoolCode,
                BettingPoolName = bettingPool.BettingPoolName,
                ZoneId = bettingPool.ZoneId,
                ZoneName = bettingPool.Zone?.ZoneName,
                BankId = bettingPool.BankId,
                BankName = bettingPool.Bank?.BankName,
                Address = bettingPool.Address,
                Phone = bettingPool.Phone,
                Location = bettingPool.Location,
                Reference = bettingPool.Reference,
                Comment = bettingPool.Comment,
                Username = bettingPool.Username,
                IsActive = bettingPool.IsActive,
                CreatedAt = bettingPool.CreatedAt,
                UpdatedAt = bettingPool.UpdatedAt
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating betting pool {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar la banca" });
        }
    }

    /// <summary>
    /// Delete betting pool (soft delete by setting IsActive = false)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBettingPool(int id)
    {
        if (!await HasPermissionAsync("MANAGE_BANKS")) return Forbid();
        try
        {
            var bettingPool = await _context.BettingPools.FindAsync(id);
            if (bettingPool == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            // Zone scope: admin cannot delete a banca outside their assigned zones.
            if (!await _zoneScope.IsZoneAllowedAsync(bettingPool.ZoneId))
            {
                return Forbid();
            }

            // Check if has associated users
            var hasUsers = await _context.UserBettingPools
                .AnyAsync(ubp => ubp.BettingPoolId == id);
            if (hasUsers)
            {
                return ApiErrorResult.BadRequest(ErrorCodes.BettingPoolHasUsers, "No se puede eliminar la banca porque tiene usuarios asociados");
            }

            // Soft delete
            bettingPool.IsActive = false;
            bettingPool.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Banca eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting betting pool {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar la banca" });
        }
    }

    /// <summary>
    /// Get POS users assigned to a betting pool
    /// </summary>
    [HttpGet("{id}/users")]
    public async Task<ActionResult<List<BettingPoolUserDto>>> GetBettingPoolUsers(int id)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var bettingPoolExists = await _context.BettingPools.AnyAsync(bp => bp.BettingPoolId == id);
            if (!bettingPoolExists)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var users = await _context.UserBettingPools
                .Where(ubp => ubp.BettingPoolId == id && ubp.IsActive)
                .Include(ubp => ubp.User)
                    .ThenInclude(u => u!.Role)
                .Where(ubp => ubp.User != null && ubp.User.IsActive
                    && ubp.User.Role != null && ubp.User.Role.RoleName == "POS")
                .Select(ubp => new BettingPoolUserDto
                {
                    UserId = ubp.User!.UserId,
                    Username = ubp.User.Username,
                    FirstName = ubp.User.FullName,
                    LastName = null,
                    Email = ubp.User.Email,
                    IsActive = ubp.User.IsActive
                })
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users for betting pool {Id}", id);
            return StatusCode(500, new { message = "Error al obtener usuarios de la banca" });
        }
    }

    /// <summary>
    /// Create a new POS user and assign to a betting pool
    /// </summary>
    [HttpPost("{id}/users")]
    public async Task<ActionResult<BettingPoolUserAssignmentResponse>> AddUserToBettingPool(
        int id,
        [FromBody] CreateBettingPoolUserDto dto)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            {
                return Forbid();
            }

            // Validate betting pool exists
            var bettingPool = await _context.BettingPools.FindAsync(id);
            if (bettingPool == null)
            {
                return NotFound(new BettingPoolUserAssignmentResponse
                {
                    Success = false,
                    Message = "Banca no encontrada"
                });
            }

            // Check if username already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());
            if (existingUser != null)
            {
                return Conflict(new BettingPoolUserAssignmentResponse
                {
                    Success = false,
                    Message = "Ya existe un usuario con ese nombre"
                });
            }

            // Get the POS role
            var posRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "POS");
            if (posRole == null)
            {
                return StatusCode(500, new BettingPoolUserAssignmentResponse
                {
                    Success = false,
                    Message = "Error: Rol POS no encontrado en el sistema"
                });
            }

            // Auto-generate a 6-digit numeric temp password (POS users).
            var temporaryPassword = Helpers.PasswordHelper.GenerateNumeric6();

            // Create the user
            var user = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
                FullName = dto.FullName,
                Email = dto.Email ?? $"{dto.Username}@pos.local",
                Phone = dto.Phone,
                RoleId = posRole.RoleId,
                IsActive = true,
                MustChangePassword = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create the user-betting pool association
            var userBettingPool = new UserBettingPool
            {
                UserId = user.UserId,
                BettingPoolId = id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserBettingPools.Add(userBettingPool);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created POS user {Username} for betting pool {BettingPoolId}",
                dto.Username, id);

            return Ok(new BettingPoolUserAssignmentResponse
            {
                Success = true,
                Message = "Usuario creado y asignado exitosamente",
                TemporaryPassword = temporaryPassword,
                User = new BettingPoolUserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    FirstName = user.FullName,
                    Email = user.Email,
                    IsActive = user.IsActive
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user to betting pool {Id}", id);
            return StatusCode(500, new BettingPoolUserAssignmentResponse
            {
                Success = false,
                Message = "Error al crear el usuario"
            });
        }
    }

    /// <summary>
    /// Remove a user from a betting pool (soft delete the association)
    /// </summary>
    [HttpDelete("{id}/users/{userId}")]
    public async Task<ActionResult<BettingPoolUserAssignmentResponse>> RemoveUserFromBettingPool(int id, int userId)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            {
                return Forbid();
            }

            // Find the user-betting pool association
            var userBettingPool = await _context.UserBettingPools
                .Include(ubp => ubp.User)
                .FirstOrDefaultAsync(ubp => ubp.BettingPoolId == id && ubp.UserId == userId);

            if (userBettingPool == null)
            {
                return NotFound(new BettingPoolUserAssignmentResponse
                {
                    Success = false,
                    Message = "El usuario no está asignado a esta banca"
                });
            }

            // Soft delete the association
            userBettingPool.IsActive = false;
            userBettingPool.UpdatedAt = DateTime.UtcNow;

            // Also deactivate the user if it's a POS user
            var user = userBettingPool.User;
            if (user != null)
            {
                user.IsActive = false;
                user.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Removed user {UserId} from betting pool {BettingPoolId}", userId, id);

            return Ok(new BettingPoolUserAssignmentResponse
            {
                Success = true,
                Message = "Usuario eliminado de la banca exitosamente"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user {UserId} from betting pool {Id}", userId, id);
            return StatusCode(500, new BettingPoolUserAssignmentResponse
            {
                Success = false,
                Message = "Error al eliminar el usuario de la banca"
            });
        }
    }

    /// <summary>
    /// Get betting pool configuration
    /// </summary>
    [HttpGet("{id}/config")]
    public async Task<ActionResult<BettingPoolDetailWithConfigDto>> GetBettingPoolConfig(int id)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var bettingPool = await _context.BettingPools
                .Include(bp => bp.Zone)
                .Include(bp => bp.Bank)
                .Include(bp => bp.Config)
                .Include(bp => bp.DiscountConfig)
                .Include(bp => bp.PrintConfig)
                .Include(bp => bp.Footer)
                .Where(bp => bp.BettingPoolId == id)
                .FirstOrDefaultAsync();

            if (bettingPool == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var result = new BettingPoolDetailWithConfigDto
            {
                BettingPoolId = bettingPool.BettingPoolId,
                BettingPoolCode = bettingPool.BettingPoolCode,
                BettingPoolName = bettingPool.BettingPoolName,
                ZoneId = bettingPool.ZoneId,
                ZoneName = bettingPool.Zone?.ZoneName,
                BankId = bettingPool.BankId,
                BankName = bettingPool.Bank?.BankName,
                Address = bettingPool.Address,
                Phone = bettingPool.Phone,
                Location = bettingPool.Location,
                Reference = bettingPool.Reference,
                Comment = bettingPool.Comment,
                Username = bettingPool.Username,
                IsActive = bettingPool.IsActive,
                CreatedAt = bettingPool.CreatedAt,
                UpdatedAt = bettingPool.UpdatedAt,
                Config = bettingPool.Config != null ? new BettingPoolConfigDto
                {
                    FallType = bettingPool.Config.FallType,
                    FallPercentage = bettingPool.Config.FallPercentage,
                    DeactivationBalance = bettingPool.Config.DeactivationBalance,
                    DailySaleLimit = bettingPool.Config.DailySaleLimit,
                    DailyBalanceLimit = bettingPool.Config.DailyBalanceLimit,
                    TemporaryAdditionalBalance = bettingPool.Config.TemporaryAdditionalBalance,
                    EnableTemporaryBalance = bettingPool.Config.EnableTemporaryBalance,
                    CreditLimit = bettingPool.Config.CreditLimit,
                    IsActive = bettingPool.Config.IsActive,
                    ControlWinningTickets = bettingPool.Config.ControlWinningTickets,
                    AllowJackpot = bettingPool.Config.AllowJackpot,
                    EnableRecharges = bettingPool.Config.EnableRecharges,
                    AllowPasswordChange = bettingPool.Config.AllowPasswordChange,
                    CancelMinutes = bettingPool.Config.CancelMinutes,
                    DailyCancelTickets = bettingPool.Config.DailyCancelTickets,
                    MaxCancelAmount = bettingPool.Config.MaxCancelAmount,
                    MaxTicketAmount = bettingPool.Config.MaxTicketAmount,
                    MaxDailyRecharge = bettingPool.Config.MaxDailyRecharge,
                    PaymentMode = bettingPool.Config.PaymentMode,
                    AllowFutureSales = bettingPool.Config.AllowFutureSales,
                    MaxFutureDays = bettingPool.Config.MaxFutureDays,
                    FutureSalesMode = bettingPool.Config.FutureSalesMode,
                    DefaultLanguage = bettingPool.Config.DefaultLanguage,
                    UseCentralLogo = bettingPool.Config.UseCentralLogo,
                    ShowStatsPanel = bettingPool.Config.ShowStatsPanel,
                    StatsPanelConfig = bettingPool.Config.StatsPanelConfig,
                    EnableAutoLogout = bettingPool.Config.EnableAutoLogout,
                    AutoLogoutMinutes = bettingPool.Config.AutoLogoutMinutes
                } : null,
                DiscountConfig = bettingPool.DiscountConfig != null ? new BettingPoolDiscountConfigDto
                {
                    DiscountMode = bettingPool.DiscountConfig.DiscountMode,
                    DiscountAmount = bettingPool.DiscountConfig.DiscountAmount,
                    DiscountPerEvery = bettingPool.DiscountConfig.DiscountPerEvery
                } : null,
                PrintConfig = bettingPool.PrintConfig != null ? new BettingPoolPrintConfigDto
                {
                    PrintMode = bettingPool.PrintConfig.PrintMode,
                    PrintEnabled = bettingPool.PrintConfig.PrintEnabled,
                    PrintTicketCopy = bettingPool.PrintConfig.PrintTicketCopy,
                    PrintRechargeReceipt = bettingPool.PrintConfig.PrintRechargeReceipt,
                    SmsOnly = bettingPool.PrintConfig.SmsOnly
                } : null,
                Footer = bettingPool.Footer != null ? new BettingPoolFooterDto
                {
                    AutoFooter = bettingPool.Footer.AutoFooter,
                    FooterLine1 = bettingPool.Footer.FooterLine1,
                    FooterLine2 = bettingPool.Footer.FooterLine2,
                    FooterLine3 = bettingPool.Footer.FooterLine3,
                    FooterLine4 = bettingPool.Footer.FooterLine4,
                    FooterLine5 = bettingPool.Footer.FooterLine5,
                    FooterLine6 = bettingPool.Footer.FooterLine6,
                    FooterLine7 = bettingPool.Footer.FooterLine7,
                    FooterLine8 = bettingPool.Footer.FooterLine8
                } : null
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting betting pool configuration {Id}", id);
            return StatusCode(500, new { message = "Error al obtener la configuración de la banca" });
        }
    }

    /// <summary>
    /// Create or update betting pool configuration
    /// </summary>
    [HttpPost("{id}/config")]
    public async Task<ActionResult<BettingPoolDetailWithConfigDto>> UpdateBettingPoolConfig(
        int id,
        [FromBody] UpdateBettingPoolConfigDto dto)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            {
                return Forbid();
            }

            var bettingPool = await _context.BettingPools
                .Include(bp => bp.Config)
                .Include(bp => bp.DiscountConfig)
                .Include(bp => bp.PrintConfig)
                .Include(bp => bp.Footer)
                .Where(bp => bp.BettingPoolId == id)
                .FirstOrDefaultAsync();

            if (bettingPool == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            // Update or create main configuration
            if (dto.Config != null)
            {
                if (bettingPool.Config == null)
                {
                    bettingPool.Config = new BettingPoolConfig
                    {
                        BettingPoolId = id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.BettingPoolConfigs.Add(bettingPool.Config);
                }

                bettingPool.Config.FallType = dto.Config.FallType;
                bettingPool.Config.FallPercentage = dto.Config.FallPercentage;
                bettingPool.Config.DeactivationBalance = dto.Config.DeactivationBalance;
                bettingPool.Config.DailySaleLimit = dto.Config.DailySaleLimit;
                bettingPool.Config.DailyBalanceLimit = dto.Config.DailyBalanceLimit;
                bettingPool.Config.TemporaryAdditionalBalance = dto.Config.TemporaryAdditionalBalance;
                bettingPool.Config.EnableTemporaryBalance = dto.Config.EnableTemporaryBalance;
                bettingPool.Config.CreditLimit = dto.Config.CreditLimit;
                bettingPool.Config.IsActive = dto.Config.IsActive;
                bettingPool.Config.ControlWinningTickets = dto.Config.ControlWinningTickets;
                bettingPool.Config.AllowJackpot = dto.Config.AllowJackpot;
                bettingPool.Config.EnableRecharges = dto.Config.EnableRecharges;
                bettingPool.Config.AllowPasswordChange = dto.Config.AllowPasswordChange;
                bettingPool.Config.CancelMinutes = dto.Config.CancelMinutes;
                bettingPool.Config.DailyCancelTickets = dto.Config.DailyCancelTickets;
                bettingPool.Config.MaxCancelAmount = dto.Config.MaxCancelAmount;
                bettingPool.Config.MaxTicketAmount = dto.Config.MaxTicketAmount;
                bettingPool.Config.MaxDailyRecharge = dto.Config.MaxDailyRecharge;
                bettingPool.Config.PaymentMode = dto.Config.PaymentMode;
                bettingPool.Config.FutureSalesMode = dto.Config.FutureSalesMode ?? "OFF";
                bettingPool.Config.AllowFutureSales = dto.Config.FutureSalesMode != "OFF";
                bettingPool.Config.MaxFutureDays = dto.Config.MaxFutureDays;
                bettingPool.Config.DefaultLanguage = dto.Config.DefaultLanguage;
                bettingPool.Config.UseCentralLogo = dto.Config.UseCentralLogo;
                bettingPool.Config.ShowStatsPanel = dto.Config.ShowStatsPanel;
                bettingPool.Config.StatsPanelConfig = dto.Config.StatsPanelConfig;
                bettingPool.Config.EnableAutoLogout = dto.Config.EnableAutoLogout;
                // Cap idle auto-logout at 60 minutes — anything longer is
                // almost certainly a mistake (POS sessions on the cash register
                // shouldn't stay open all day).
                if (dto.Config.AutoLogoutMinutes < 1 || dto.Config.AutoLogoutMinutes > 60)
                {
                    return ApiErrorResult.BadRequest(
                        ErrorCodes.BadRequest,
                        "Auto-logout debe estar entre 1 y 60 minutos.");
                }
                bettingPool.Config.AutoLogoutMinutes = dto.Config.AutoLogoutMinutes;
                bettingPool.Config.UpdatedAt = DateTime.UtcNow;
            }

            // Update or create discount configuration
            if (dto.DiscountConfig != null)
            {
                if (bettingPool.DiscountConfig == null)
                {
                    bettingPool.DiscountConfig = new BettingPoolDiscountConfig
                    {
                        BettingPoolId = id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.BettingPoolDiscountConfigs.Add(bettingPool.DiscountConfig);
                }

                bettingPool.DiscountConfig.DiscountMode = dto.DiscountConfig.DiscountMode;
                bettingPool.DiscountConfig.DiscountAmount = dto.DiscountConfig.DiscountAmount;
                bettingPool.DiscountConfig.DiscountPerEvery = dto.DiscountConfig.DiscountPerEvery;
                bettingPool.DiscountConfig.UpdatedAt = DateTime.UtcNow;
            }

            // Update or create print configuration
            if (dto.PrintConfig != null)
            {
                if (bettingPool.PrintConfig == null)
                {
                    bettingPool.PrintConfig = new BettingPoolPrintConfig
                    {
                        BettingPoolId = id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.BettingPoolPrintConfigs.Add(bettingPool.PrintConfig);
                }

                bettingPool.PrintConfig.PrintMode = dto.PrintConfig.PrintMode;
                bettingPool.PrintConfig.PrintEnabled = dto.PrintConfig.PrintEnabled;
                bettingPool.PrintConfig.PrintTicketCopy = dto.PrintConfig.PrintTicketCopy;
                bettingPool.PrintConfig.PrintRechargeReceipt = dto.PrintConfig.PrintRechargeReceipt;
                bettingPool.PrintConfig.SmsOnly = dto.PrintConfig.SmsOnly;
                bettingPool.PrintConfig.UpdatedAt = DateTime.UtcNow;
            }

            // Update or create footer
            if (dto.Footer != null)
            {
                if (bettingPool.Footer == null)
                {
                    bettingPool.Footer = new BettingPoolFooter
                    {
                        BettingPoolId = id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.BettingPoolFooters.Add(bettingPool.Footer);
                }

                bettingPool.Footer.AutoFooter = dto.Footer.AutoFooter;
                bettingPool.Footer.FooterLine1 = dto.Footer.FooterLine1;
                bettingPool.Footer.FooterLine2 = dto.Footer.FooterLine2;
                bettingPool.Footer.FooterLine3 = dto.Footer.FooterLine3;
                bettingPool.Footer.FooterLine4 = dto.Footer.FooterLine4;
                bettingPool.Footer.FooterLine5 = dto.Footer.FooterLine5;
                bettingPool.Footer.FooterLine6 = dto.Footer.FooterLine6;
                bettingPool.Footer.FooterLine7 = dto.Footer.FooterLine7;
                bettingPool.Footer.FooterLine8 = dto.Footer.FooterLine8;
                bettingPool.Footer.UpdatedAt = DateTime.UtcNow;
            }

            // Collect actually-modified fields from EF's change tracker BEFORE
            // SaveChanges — EF compares by value (so `5` vs `5.00m` decimals
            // don't produce false-positive changes) and only flags properties
            // that genuinely differ from the originals loaded from the DB.
            var configChanges = new List<object>();
            configChanges.AddRange(ChangesFromTracker(bettingPool.Config, "config"));
            configChanges.AddRange(ChangesFromTracker(bettingPool.DiscountConfig, "discount"));
            configChanges.AddRange(ChangesFromTracker(bettingPool.PrintConfig, "print"));
            configChanges.AddRange(ChangesFromTracker(bettingPool.Footer, "footer"));

            await _context.SaveChangesAsync();

            if (configChanges.Count > 0)
            {
                _context.BettingPoolAuditLogs.Add(new BettingPoolAuditLog
                {
                    BettingPoolId = id,
                    UserId = CurrentUserId(),
                    Action = "UPDATED",
                    Details = JsonSerializer.Serialize(configChanges, AuditJsonOptions),
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    CreatedAt = DateTime.UtcNow,
                });
                await _context.SaveChangesAsync();
            }

            // Return updated configuration
            return await GetBettingPoolConfig(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating betting pool configuration {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar la configuración de la banca" });
        }
    }

    /// <summary>
    /// Create new betting pool with full configuration
    /// </summary>
    [HttpPost("with-config")]
    public async Task<ActionResult<BettingPoolDetailWithConfigDto>> CreateBettingPoolWithConfig(
        [FromBody] CreateBettingPoolWithConfigDto dto)
    {
        try
        {
            // Validate zone exists
            var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == dto.ZoneId);
            if (!zoneExists)
            {
                return ApiErrorResult.BadRequest(ErrorCodes.ZoneNotFound, "La zona especificada no existe");
            }

            // Validate bank if provided
            if (dto.BankId.HasValue)
            {
                var bankExists = await _context.Banks.AnyAsync(b => b.BankId == dto.BankId.Value);
                if (!bankExists)
                {
                    return ApiErrorResult.BadRequest(ErrorCodes.BankNotFound, "El banco especificado no existe");
                }
            }

            // Check if code already exists
            var codeExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolCode == dto.BettingPoolCode);
            if (codeExists)
            {
                return ApiErrorResult.Conflict(ErrorCodes.BettingPoolCodeExists, "El código de banca ya existe");
            }

            // Validate username and password are required
            if (string.IsNullOrWhiteSpace(dto.Username))
            {
                return ApiErrorResult.BadRequest(ErrorCodes.UsernameRequired, "El nombre de usuario es requerido");
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return ApiErrorResult.BadRequest(ErrorCodes.PasswordRequired, "La contraseña es requerida");
            }

            // Check if username already exists
            var userExists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower());
            if (userExists)
            {
                return ApiErrorResult.Conflict(ErrorCodes.UserAlreadyExists, "Ya existe un usuario con ese nombre");
            }

            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create betting pool
            var bettingPool = new BettingPool
            {
                BettingPoolCode = dto.BettingPoolCode,
                BettingPoolName = dto.BettingPoolName,
                ZoneId = dto.ZoneId,
                BankId = dto.BankId,
                Address = dto.Address,
                Phone = dto.Phone,
                Location = dto.Location,
                Reference = dto.Reference,
                Comment = dto.Comment,
                Username = dto.Username,
                PasswordHash = hashedPassword,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.BettingPools.Add(bettingPool);
            await _context.SaveChangesAsync();

            // Update code if needed - generate next sequential code for this tenant
            if (!dto.BettingPoolCode.StartsWith(_codePrefix))
            {
                var lbCodes = await _context.BettingPools
                    .Where(bp => bp.BettingPoolCode.StartsWith(_codePrefix))
                    .Select(bp => bp.BettingPoolCode)
                    .ToListAsync();

                int maxNumber = 0;
                foreach (var code in lbCodes)
                {
                    if (code.Length > _codePrefix.Length && int.TryParse(code.Substring(_codePrefix.Length), out int num))
                    {
                        if (num > maxNumber) maxNumber = num;
                    }
                }

                bettingPool.BettingPoolCode = $"{_codePrefix}{(maxNumber + 1):D4}";
                await _context.SaveChangesAsync();
            }

            // If username and password provided, create POS user and associate with betting pool
            if (!string.IsNullOrWhiteSpace(dto.Username) && !string.IsNullOrWhiteSpace(dto.Password))
            {
                // Check if username already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());

                if (existingUser == null)
                {
                    // Get the POS role
                    var posRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "POS");
                    if (posRole != null)
                    {
                        // Create the user
                        var user = new User
                        {
                            Username = dto.Username,
                            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                            FullName = dto.BettingPoolName,
                            Email = $"{dto.Username}@pos.local",
                            RoleId = posRole.RoleId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Users.Add(user);
                        await _context.SaveChangesAsync();

                        // Create the user-betting pool association
                        var userBettingPool = new UserBettingPool
                        {
                            UserId = user.UserId,
                            BettingPoolId = bettingPool.BettingPoolId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.UserBettingPools.Add(userBettingPool);
                        await _context.SaveChangesAsync();

                        _logger.LogInformation("Created POS user {Username} for new betting pool {BettingPoolId}",
                            dto.Username, bettingPool.BettingPoolId);
                    }
                }
            }

            // Create configuration if provided
            if (dto.Config != null)
            {
                // Same auto-logout cap as the update endpoint.
                if (dto.Config.AutoLogoutMinutes < 1 || dto.Config.AutoLogoutMinutes > 60)
                {
                    return ApiErrorResult.BadRequest(
                        ErrorCodes.BadRequest,
                        "Auto-logout debe estar entre 1 y 60 minutos.");
                }
                var config = new BettingPoolConfig
                {
                    BettingPoolId = bettingPool.BettingPoolId,
                    FallType = dto.Config.FallType,
                    FallPercentage = dto.Config.FallPercentage,
                    DeactivationBalance = dto.Config.DeactivationBalance,
                    DailySaleLimit = dto.Config.DailySaleLimit,
                    DailyBalanceLimit = dto.Config.DailyBalanceLimit,
                    TemporaryAdditionalBalance = dto.Config.TemporaryAdditionalBalance,
                    CreditLimit = dto.Config.CreditLimit,
                    IsActive = dto.Config.IsActive,
                    ControlWinningTickets = dto.Config.ControlWinningTickets,
                    AllowJackpot = dto.Config.AllowJackpot,
                    EnableRecharges = dto.Config.EnableRecharges,
                    AllowPasswordChange = dto.Config.AllowPasswordChange,
                    CancelMinutes = dto.Config.CancelMinutes,
                    DailyCancelTickets = dto.Config.DailyCancelTickets,
                    MaxCancelAmount = dto.Config.MaxCancelAmount,
                    MaxTicketAmount = dto.Config.MaxTicketAmount,
                    MaxDailyRecharge = dto.Config.MaxDailyRecharge,
                    PaymentMode = dto.Config.PaymentMode,
                    FutureSalesMode = dto.Config.FutureSalesMode ?? "OFF",
                    AllowFutureSales = dto.Config.FutureSalesMode != "OFF",
                    MaxFutureDays = dto.Config.MaxFutureDays,
                    DefaultLanguage = dto.Config.DefaultLanguage,
                    UseCentralLogo = dto.Config.UseCentralLogo,
                    ShowStatsPanel = dto.Config.ShowStatsPanel,
                    StatsPanelConfig = dto.Config.StatsPanelConfig,
                    EnableAutoLogout = dto.Config.EnableAutoLogout,
                    AutoLogoutMinutes = dto.Config.AutoLogoutMinutes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.BettingPoolConfigs.Add(config);
            }

            // Create discount configuration if provided
            if (dto.DiscountConfig != null)
            {
                var discountConfig = new BettingPoolDiscountConfig
                {
                    BettingPoolId = bettingPool.BettingPoolId,
                    DiscountMode = dto.DiscountConfig.DiscountMode,
                    DiscountAmount = dto.DiscountConfig.DiscountAmount,
                    DiscountPerEvery = dto.DiscountConfig.DiscountPerEvery,
                    CreatedAt = DateTime.UtcNow
                };
                _context.BettingPoolDiscountConfigs.Add(discountConfig);
            }

            // Create print configuration if provided
            if (dto.PrintConfig != null)
            {
                var printConfig = new BettingPoolPrintConfig
                {
                    BettingPoolId = bettingPool.BettingPoolId,
                    PrintMode = dto.PrintConfig.PrintMode,
                    PrintEnabled = dto.PrintConfig.PrintEnabled,
                    PrintTicketCopy = dto.PrintConfig.PrintTicketCopy,
                    PrintRechargeReceipt = dto.PrintConfig.PrintRechargeReceipt,
                    SmsOnly = dto.PrintConfig.SmsOnly,
                    CreatedAt = DateTime.UtcNow
                };
                _context.BettingPoolPrintConfigs.Add(printConfig);
            }

            await _context.SaveChangesAsync();

            // Return created betting pool with configuration
            return await GetBettingPoolConfig(bettingPool.BettingPoolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating betting pool with configuration");
            return StatusCode(500, new { message = "Error al crear la banca con configuración" });
        }
    }

    // ============================================
    // SCHEDULES ENDPOINTS
    // ============================================

    /// <summary>
    /// Get schedules for a betting pool
    /// GET /api/betting-pools/{id}/schedules
    /// </summary>
    [HttpGet("{bettingPoolId}/schedules")]
    public async Task<ActionResult<SchedulesResponse>> GetSchedules(int bettingPoolId)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId))
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var bettingPool = await _context.BettingPools
                .Include(bp => bp.Schedules)
                .FirstOrDefaultAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (bettingPool == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var scheduleDtos = bettingPool.Schedules
                .Where(s => s.IsActive)
                .Select(s => new BettingPoolScheduleDto
                {
                    DayOfWeek = s.DayOfWeek,
                    OpeningTime = s.OpeningTime.HasValue ? TimeSpanToAmPm(s.OpeningTime.Value) : null,
                    ClosingTime = s.ClosingTime.HasValue ? TimeSpanToAmPm(s.ClosingTime.Value) : null,
                    IsActive = s.IsActive
                })
                .OrderBy(s => s.DayOfWeek)
                .ToList();

            return Ok(new SchedulesResponse
            {
                BettingPoolId = bettingPoolId,
                Schedules = scheduleDtos
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedules for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error al obtener los horarios" });
        }
    }

    /// <summary>
    /// Save/Update schedules for a betting pool
    /// POST /api/betting-pools/{id}/schedules
    /// </summary>
    [HttpPost("{bettingPoolId}/schedules")]
    public async Task<ActionResult<SchedulesResponse>> SaveSchedules(
        int bettingPoolId,
        [FromBody] SaveSchedulesRequest request)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId))
            {
                return Forbid();
            }

            var bettingPool = await _context.BettingPools
                .Include(bp => bp.Schedules)
                .FirstOrDefaultAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (bettingPool == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            // Delete existing schedules
            var existingSchedules = await _context.BettingPoolSchedules
                .Where(s => s.BettingPoolId == bettingPoolId)
                .ToListAsync();

            if (existingSchedules.Any())
            {
                _context.BettingPoolSchedules.RemoveRange(existingSchedules);
            }

            // Add new schedules
            foreach (var scheduleDto in request.Schedules)
            {
                var schedule = new BettingPoolSchedule
                {
                    BettingPoolId = bettingPoolId,
                    DayOfWeek = scheduleDto.DayOfWeek,
                    OpeningTime = !string.IsNullOrEmpty(scheduleDto.OpeningTime)
                        ? AmPmToTimeSpan(scheduleDto.OpeningTime)
                        : null,
                    ClosingTime = !string.IsNullOrEmpty(scheduleDto.ClosingTime)
                        ? AmPmToTimeSpan(scheduleDto.ClosingTime)
                        : null,
                    IsActive = scheduleDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.BettingPoolSchedules.Add(schedule);
            }

            await _context.SaveChangesAsync();

            // Return saved schedules
            return await GetSchedules(bettingPoolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving schedules for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error al guardar los horarios" });
        }
    }

    // ============================================
    // AUTO EXPENSES ENDPOINTS
    // ============================================

    /// <summary>
    /// Get auto expenses for a betting pool
    /// </summary>
    [HttpGet("{bettingPoolId}/auto-expenses")]
    public async Task<ActionResult<List<AutoExpenseDto>>> GetAutoExpenses(int bettingPoolId)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId))
            {
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
            }

            var expenses = await _context.BettingPoolAutomaticExpenses
                .AsNoTracking()
                .Where(e => e.BettingPoolId == bettingPoolId)
                .Select(e => new AutoExpenseDto
                {
                    ExpenseId = e.ExpenseId,
                    Description = e.ExpenseType,
                    Amount = e.Amount ?? 0,
                    Frequency = e.Frequency,
                    DayOfWeek = e.DayOfWeek,
                    DayOfMonth = e.DayOfMonth,
                    IsActive = e.IsActive
                })
                .ToListAsync();

            return Ok(expenses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting auto expenses for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error al obtener gastos automáticos" });
        }
    }

    /// <summary>
    /// Save auto expenses for a betting pool (replace all)
    /// </summary>
    [HttpPost("{bettingPoolId}/auto-expenses")]
    public async Task<ActionResult<List<AutoExpenseDto>>> SaveAutoExpenses(
        int bettingPoolId, [FromBody] SaveAutoExpensesRequest request)
    {
        try
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId))
            {
                return Forbid();
            }

            var bettingPool = await _context.BettingPools.FindAsync(bettingPoolId);
            if (bettingPool == null)
                return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");

            // Delete existing
            var existing = await _context.BettingPoolAutomaticExpenses
                .Where(e => e.BettingPoolId == bettingPoolId)
                .ToListAsync();
            if (existing.Any())
                _context.BettingPoolAutomaticExpenses.RemoveRange(existing);

            // Create new
            foreach (var dto in request.Expenses)
            {
                _context.BettingPoolAutomaticExpenses.Add(new BettingPoolAutomaticExpense
                {
                    BettingPoolId = bettingPoolId,
                    ExpenseType = dto.Description,
                    Amount = dto.Amount,
                    Frequency = dto.Frequency,
                    DayOfWeek = dto.DayOfWeek,
                    DayOfMonth = dto.DayOfMonth,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return await GetAutoExpenses(bettingPoolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving auto expenses for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error al guardar gastos automáticos" });
        }
    }

    // ============================================
    // MASS UPDATE ENDPOINT
    // ============================================

    /// <summary>
    /// Mass update multiple betting pools at once
    /// </summary>
    /// <param name="request">Mass update request with betting pool IDs and fields to update</param>
    /// <returns>Result of mass update operation</returns>
    [HttpPatch("mass-update")]
    public async Task<ActionResult<MassUpdateResponseDto>> MassUpdateBettingPools([FromBody] MassUpdateBettingPoolsDto request)
    {
        try
        {
            _logger.LogInformation("Mass updating {Count} betting pools", request.BettingPoolIds.Count);

            // Validate that betting pools exist
            var existingPools = await _context.BettingPools
                .Where(bp => request.BettingPoolIds.Contains(bp.BettingPoolId))
                .ToListAsync();

            if (existingPools.Count == 0)
            {
                return BadRequest(new MassUpdateResponseDto
                {
                    Success = false,
                    UpdatedCount = 0,
                    Message = "No se encontraron las bancas especificadas"
                });
            }

            var errors = new List<string>();
            var updatedIds = new List<int>();
            // Per-pool change lists collected BEFORE SaveChangesAsync — EF's
            // change tracker forgets `IsModified` after persisting, so we
            // capture each pool's diff inline and write the audit rows in a
            // second pass once the main update has committed.
            var perPoolChanges = new Dictionary<int, List<object>>();

            // Validate zone if provided
            if (request.ZoneId.HasValue)
            {
                var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == request.ZoneId.Value);
                if (!zoneExists)
                {
                    return BadRequest(new MassUpdateResponseDto
                    {
                        Success = false,
                        UpdatedCount = 0,
                        Message = $"La zona con ID {request.ZoneId} no existe"
                    });
                }
            }

            // Update each betting pool
            foreach (var pool in existingPools)
            {
                try
                {
                    // Update zone if specified
                    if (request.ZoneId.HasValue)
                    {
                        pool.ZoneId = request.ZoneId.Value;
                    }

                    // Update active status if specified
                    if (!string.IsNullOrEmpty(request.IsActive) && request.IsActive != "no_change")
                    {
                        pool.IsActive = request.IsActive == "on";
                    }

                    pool.UpdatedAt = DateTime.UtcNow;
                    updatedIds.Add(pool.BettingPoolId);

                    // Diff against the originally-loaded values. Skipping
                    // UpdatedAt avoids logging a meaningless "timestamp moved"
                    // entry on pools that were touched but otherwise unchanged.
                    var changes = ChangesFromTracker(pool, "")
                        .Where(c =>
                        {
                            // anonymous type → reflect just the `field` prop
                            var f = c.GetType().GetProperty("field")?.GetValue(c) as string;
                            return f != null && f != "updatedAt";
                        })
                        .ToList();
                    if (changes.Count > 0)
                    {
                        perPoolChanges[pool.BettingPoolId] = changes;
                    }
                }
                catch (Exception ex)
                {
                    errors.Add($"Error actualizando banca {pool.BettingPoolId}: {ex.Message}");
                }
            }

            // Handle draw assignments if specified
            if (request.DrawIds != null && request.DrawIds.Count > 0)
            {
                // Validate draws exist
                var validDrawIds = await _context.Draws
                    .Where(d => request.DrawIds.Contains(d.DrawId))
                    .Select(d => d.DrawId)
                    .ToListAsync();

                if (validDrawIds.Count > 0)
                {
                    foreach (var poolId in updatedIds)
                    {
                        foreach (var drawId in validDrawIds)
                        {
                            // Check if association already exists
                            var exists = await _context.BettingPoolDraws
                                .AnyAsync(bpd => bpd.BettingPoolId == poolId && bpd.DrawId == drawId);

                            if (!exists)
                            {
                                _context.BettingPoolDraws.Add(new BettingPoolDraw
                                {
                                    BettingPoolId = poolId,
                                    DrawId = drawId,
                                    IsActive = true,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                });
                            }
                            else
                            {
                                // Enable if it exists but was disabled
                                var existing = await _context.BettingPoolDraws
                                    .FirstOrDefaultAsync(bpd => bpd.BettingPoolId == poolId && bpd.DrawId == drawId);
                                if (existing != null && !existing.IsActive)
                                {
                                    existing.IsActive = true;
                                    existing.UpdatedAt = DateTime.UtcNow;
                                }
                            }
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Audit pass — one BULK_UPDATED row per banca that actually changed.
            // Action verb distinguishes the bulk from single-pool UPDATEs so
            // the auditor can spot them in the per-banca history.
            if (perPoolChanges.Count > 0)
            {
                var auditUserId = CurrentUserId();
                var auditIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                var now = DateTime.UtcNow;
                foreach (var (poolId, changes) in perPoolChanges)
                {
                    _context.BettingPoolAuditLogs.Add(new BettingPoolAuditLog
                    {
                        BettingPoolId = poolId,
                        UserId = auditUserId,
                        Action = "BULK_UPDATED",
                        Details = JsonSerializer.Serialize(changes, AuditJsonOptions),
                        IpAddress = auditIp,
                        CreatedAt = now,
                    });
                }
                await _context.SaveChangesAsync();
            }

            var response = new MassUpdateResponseDto
            {
                Success = errors.Count == 0,
                UpdatedCount = updatedIds.Count,
                UpdatedPoolIds = updatedIds,
                Message = $"{updatedIds.Count} bancas actualizadas exitosamente",
                Errors = errors.Count > 0 ? errors : null
            };

            _logger.LogInformation("Mass update completed: {Count} pools updated", updatedIds.Count);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in mass update operation");
            return StatusCode(500, new MassUpdateResponseDto
            {
                Success = false,
                UpdatedCount = 0,
                Message = "Error al realizar la actualización masiva",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    // ============================================
    // HELPER METHODS FOR TIME CONVERSION
    // ============================================

    /// <summary>
    /// Convert TimeSpan to AM/PM format string
    /// Example: 14:30:00 → "02:30 PM"
    /// </summary>
    private string TimeSpanToAmPm(TimeSpan time)
    {
        var hours = time.Hours;
        var minutes = time.Minutes;
        var period = hours >= 12 ? "PM" : "AM";

        // Convert to 12-hour format
        var displayHours = hours % 12;
        if (displayHours == 0) displayHours = 12;

        return $"{displayHours:D2}:{minutes:D2} {period}";
    }

    // -----------------------------------------------------------------------
    // Weekly sales per banca (Mon-Sun bucket)
    // -----------------------------------------------------------------------

    /// <summary>
    /// Per-banca daily totals for the ISO week (Mon-Sun) containing the given
    /// date. Used by /betting-pools/days-report.
    /// </summary>
    [HttpGet("weekly-sales")]
    public async Task<ActionResult<object>> GetWeeklySales(
        [FromQuery] DateTime? date = null,
        [FromQuery] string? zoneIds = null)
    {
        var target = (date ?? Helpers.DateTimeHelper.TodayInBusinessTimezone()).Date;
        // ISO-style week starting Monday (day-of-week: Mon=1..Sun=0 → 0..6 with Mon=0).
        var diff = ((int)target.DayOfWeek + 6) % 7;
        var weekStartLocal = target.AddDays(-diff);
        var weekEndLocal = weekStartLocal.AddDays(7); // exclusive

        // Window in UTC for filtering Ticket.CreatedAt.
        var weekStartUtc = Helpers.DateTimeHelper.ToUtc(weekStartLocal);
        var weekEndUtc = Helpers.DateTimeHelper.ToUtc(weekEndLocal);

        List<int>? zoneIdList = null;
        if (!string.IsNullOrEmpty(zoneIds))
        {
            zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => int.TryParse(s.Trim(), out var n) ? n : 0)
                .Where(n => n > 0)
                .ToList();
        }

        var bancasQuery = _context.BettingPools.AsNoTracking()
            .Include(bp => bp.Zone)
            .Where(bp => bp.IsActive && bp.DeletedAt == null);

        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        if (allowedBpIds != null)
        {
            bancasQuery = bancasQuery.Where(bp => allowedBpIds.Contains(bp.BettingPoolId));
        }
        if (zoneIdList != null && zoneIdList.Count > 0)
        {
            bancasQuery = bancasQuery.Where(bp => zoneIdList.Contains(bp.ZoneId));
        }

        var bancas = await bancasQuery
            .Select(bp => new
            {
                bp.BettingPoolId,
                bp.BettingPoolCode,
                bp.BettingPoolName,
                bp.ZoneId,
                ZoneName = bp.Zone != null ? bp.Zone.ZoneName : null,
            })
            .ToListAsync();

        var bancaIds = bancas.Select(b => b.BettingPoolId).ToList();

        // Pull tickets in the week for the scoped bancas, then bucket in-memory by
        // (banca, local weekday).
        var tickets = await _context.Tickets
            .AsNoTracking()
            .Where(t => !t.IsCancelled
                && t.CreatedAt >= weekStartUtc && t.CreatedAt < weekEndUtc
                && bancaIds.Contains(t.BettingPoolId))
            .Select(t => new { t.BettingPoolId, t.CreatedAt, t.GrandTotal })
            .ToListAsync();

        // Bucket key: bettingPoolId → 7-element decimal[] (0=Mon..6=Sun).
        var buckets = new Dictionary<int, decimal[]>();
        foreach (var bp in bancas) buckets[bp.BettingPoolId] = new decimal[7];

        foreach (var t in tickets)
        {
            var local = Helpers.DateTimeHelper.ToBusinessTimezone(t.CreatedAt).Date;
            var idx = (local - weekStartLocal).Days;
            if (idx < 0 || idx > 6) continue; // safety
            if (buckets.TryGetValue(t.BettingPoolId, out var arr))
            {
                arr[idx] += t.GrandTotal;
            }
        }

        var result = bancas.Select(bp =>
        {
            var arr = buckets[bp.BettingPoolId];
            return new
            {
                bettingPoolId = bp.BettingPoolId,
                bettingPoolCode = bp.BettingPoolCode,
                bettingPoolName = bp.BettingPoolName,
                zoneId = bp.ZoneId,
                zoneName = bp.ZoneName,
                weekStart = weekStartLocal.ToString("yyyy-MM-dd"),
                monday = arr[0],
                tuesday = arr[1],
                wednesday = arr[2],
                thursday = arr[3],
                friday = arr[4],
                saturday = arr[5],
                sunday = arr[6],
            };
        })
        .OrderBy(x => x.bettingPoolCode)
        .ToList();

        return Ok(result);
    }

    // -----------------------------------------------------------------------
    // Bancas without sales
    // -----------------------------------------------------------------------

    /// <summary>
    /// List bancas whose last ticket sale is at least `minDays` days old
    /// (or that have never sold). Used by /betting-pools/no-sales.
    /// </summary>
    [HttpGet("without-sales")]
    public async Task<ActionResult<object>> GetWithoutSales(
        [FromQuery] int minDays = 7,
        [FromQuery] string? zoneIds = null,
        [FromQuery] string status = "active")
    {
        var today = Helpers.DateTimeHelper.TodayInBusinessTimezone();

        List<int>? zoneIdList = null;
        if (!string.IsNullOrEmpty(zoneIds))
        {
            zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => int.TryParse(s.Trim(), out var n) ? n : 0)
                .Where(n => n > 0)
                .ToList();
        }

        // status: "all" | "active" | "inactive" — defaults to "active" to keep
        // legacy callers stable. Soft-deleted bancas are always excluded.
        var normalizedStatus = (status ?? "active").Trim().ToLowerInvariant();
        var bancasQuery = _context.BettingPools.AsNoTracking()
            .Include(bp => bp.Zone)
            .Where(bp => bp.DeletedAt == null);
        if (normalizedStatus == "active")
        {
            bancasQuery = bancasQuery.Where(bp => bp.IsActive);
        }
        else if (normalizedStatus == "inactive")
        {
            bancasQuery = bancasQuery.Where(bp => !bp.IsActive);
        }

        // Zone scope — admin sees their assigned zones; POS sees only assigned bancas.
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        if (allowedBpIds != null)
        {
            bancasQuery = bancasQuery.Where(bp => allowedBpIds.Contains(bp.BettingPoolId));
        }
        if (zoneIdList != null && zoneIdList.Count > 0)
        {
            bancasQuery = bancasQuery.Where(bp => zoneIdList.Contains(bp.ZoneId));
        }

        var bancas = await bancasQuery
            .Select(bp => new
            {
                bp.BettingPoolId,
                bp.BettingPoolCode,
                bp.BettingPoolName,
                bp.Reference,
                bp.ZoneId,
                ZoneName = bp.Zone != null ? bp.Zone.ZoneName : null,
                bp.IsActive,
                bp.CreatedAt,
                Balance = _context.Balances.Where(b => b.BettingPoolId == bp.BettingPoolId)
                    .Select(b => (decimal?)b.CurrentBalance).FirstOrDefault() ?? 0m
            })
            .ToListAsync();

        var lastSaleByBanca = await _context.Tickets
            .AsNoTracking()
            .Where(t => !t.IsCancelled)
            .GroupBy(t => t.BettingPoolId)
            .Select(g => new { BettingPoolId = g.Key, LastCreated = g.Max(t => t.CreatedAt) })
            .ToDictionaryAsync(x => x.BettingPoolId, x => x.LastCreated);

        var result = bancas
            .Select(bp =>
            {
                DateTime? lastSaleLocal = null;
                if (lastSaleByBanca.TryGetValue(bp.BettingPoolId, out var lastUtc))
                    lastSaleLocal = Helpers.DateTimeHelper.ToBusinessTimezone(lastUtc).Date;

                int days;
                if (lastSaleLocal.HasValue)
                {
                    days = (today - lastSaleLocal.Value).Days;
                }
                else
                {
                    var createdLocal = bp.CreatedAt.HasValue
                        ? Helpers.DateTimeHelper.ToBusinessTimezone(bp.CreatedAt.Value).Date
                        : today;
                    days = (today - createdLocal).Days;
                }

                return new
                {
                    bettingPoolId = bp.BettingPoolId,
                    bettingPoolCode = bp.BettingPoolCode,
                    bettingPoolName = bp.BettingPoolName,
                    reference = bp.Reference,
                    zoneId = bp.ZoneId,
                    zoneName = bp.ZoneName,
                    isActive = bp.IsActive,
                    daysWithoutSales = days,
                    balance = bp.Balance,
                    lastSaleDate = lastSaleLocal?.ToString("yyyy-MM-dd")
                };
            })
            // Inactive bancas always pass — the fact that they're inactive is
            // the relevant signal, regardless of how long since their last sale.
            // Active bancas still need to meet the `minDays` threshold.
            .Where(x => !x.isActive || x.daysWithoutSales >= minDays)
            .OrderByDescending(x => x.daysWithoutSales)
            .ToList();

        return Ok(result);
    }

    // -----------------------------------------------------------------------
    // Clean pending payments
    // -----------------------------------------------------------------------

    /// <summary>
    /// Preview how many winner tickets are pending payment for a banca up to a date.
    /// Used by the "Limpiar pendientes de pago" modal to show counts before confirming.
    /// </summary>
    [HttpGet("{id}/pending-payments-preview")]
    public async Task<ActionResult<object>> GetPendingPaymentsPreview(int id, [FromQuery] DateTime? untilDate)
    {
        if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            return Forbid();

        var day = (untilDate ?? Helpers.DateTimeHelper.TodayInBusinessTimezone()).Date;
        // [start, end) for that single day in business timezone, converted to UTC.
        var startUtc = Helpers.DateTimeHelper.GetUtcStartOfDay(day);
        var endUtc = Helpers.DateTimeHelper.GetUtcEndOfDay(day);

        var query = _context.Tickets
            .AsNoTracking()
            .Where(t => t.BettingPoolId == id)
            .Where(t => !t.IsCancelled)
            .Where(t => !t.IsPaid)
            .Where(t => t.WinningLines > 0)
            // Only tickets whose latest draw happened on the chosen day (fall back
            // to CreatedAt for legacy rows where LatestDrawTime is null).
            .Where(t => (t.LatestDrawTime ?? t.CreatedAt) >= startUtc
                     && (t.LatestDrawTime ?? t.CreatedAt) <= endUtc);

        var tickets = await query.CountAsync();
        var amount = await query.SumAsync(t => (decimal?)t.TotalPrize) ?? 0m;

        return Ok(new { tickets, amount });
    }

    public class CleanPendingPaymentsRequest
    {
        public DateTime UntilDate { get; set; }
    }

    /// <summary>
    /// Mark every pending-payment winner ticket up to `untilDate` as paid.
    /// </summary>
    [HttpPost("{id}/clean-pending-payments")]
    public async Task<ActionResult<object>> CleanPendingPayments(int id, [FromBody] CleanPendingPaymentsRequest request)
    {
        if (!await _zoneScope.IsBettingPoolAllowedAsync(id))
            return Forbid();

        var day = request.UntilDate.Date;
        var startUtc = Helpers.DateTimeHelper.GetUtcStartOfDay(day);
        var endUtc = Helpers.DateTimeHelper.GetUtcEndOfDay(day);

        // Tickets whose latest draw falls on the chosen day, same window as preview.
        var matching = await _context.Tickets
            .Where(t => t.BettingPoolId == id)
            .Where(t => !t.IsCancelled)
            .Where(t => !t.IsPaid)
            .Where(t => t.WinningLines > 0)
            .Where(t => (t.LatestDrawTime ?? t.CreatedAt) >= startUtc
                     && (t.LatestDrawTime ?? t.CreatedAt) <= endUtc)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var totalAmount = 0m;
        foreach (var t in matching)
        {
            t.IsPaid = true;
            t.PaidAt = now;
            totalAmount += t.TotalPrize;
        }

        if (matching.Count > 0)
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation(
                "Cleaned {Count} pending tickets for betting pool {BettingPoolId} on {Day}",
                matching.Count, id, day);
        }

        return Ok(new { tickets = matching.Count, amount = totalAmount });
    }

    /// <summary>
    /// Convert AM/PM format string to TimeSpan
    /// Example: "02:30 PM" → 14:30:00
    /// </summary>
    private TimeSpan? AmPmToTimeSpan(string timeString)
    {
        try
        {
            // Remove extra spaces and convert to upper case
            timeString = timeString.Trim().ToUpper();

            // Expected format: "HH:MM AM/PM" or "H:MM AM/PM"
            var parts = timeString.Split(' ');
            if (parts.Length != 2) return null;

            var timePart = parts[0];
            var period = parts[1];

            var timeParts = timePart.Split(':');
            if (timeParts.Length != 2) return null;

            if (!int.TryParse(timeParts[0], out int hours)) return null;
            if (!int.TryParse(timeParts[1], out int minutes)) return null;

            // Validate ranges
            if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

            // Convert to 24-hour format
            if (period == "PM" && hours != 12)
            {
                hours += 12;
            }
            else if (period == "AM" && hours == 12)
            {
                hours = 0;
            }

            return new TimeSpan(hours, minutes, 0);
        }
        catch
        {
            return null;
        }
    }

    // -----------------------------------------------------------------------
    // Audit log — change history for a single banca. Gated by a dedicated
    // permission (VIEW_BANCA_AUDIT_LOG) so view-only auditors can see history
    // without needing MANAGE_BANKS edit rights.
    // -----------------------------------------------------------------------

    [HttpGet("{id:int}/audit-log")]
    public async Task<ActionResult<List<BettingPoolAuditLogDto>>> GetAuditLog(int id)
    {
        if (!await HasPermissionAsync("VIEW_BANCA_AUDIT_LOG")) return Forbid();

        var bettingPool = await _context.BettingPools.AsNoTracking()
            .FirstOrDefaultAsync(bp => bp.BettingPoolId == id);
        if (bettingPool == null)
        {
            return ApiErrorResult.NotFound(ErrorCodes.BettingPoolNotFound, "Banca no encontrada");
        }

        // Zone scope: same rule as the rest of the controller — admin can only
        // see history for bancas in their assigned zones.
        if (!await _zoneScope.IsZoneAllowedAsync(bettingPool.ZoneId))
        {
            return Forbid();
        }

        var rows = await _context.BettingPoolAuditLogs
            .AsNoTracking()
            .Where(a => a.BettingPoolId == id)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.AuditLogId,
                a.BettingPoolId,
                a.UserId,
                UserName = a.User != null ? (a.User.FullName ?? a.User.Username) : null,
                a.Action,
                a.Details,
                a.IpAddress,
                a.CreatedAt,
            })
            .ToListAsync();

        var result = rows.Select(r => new BettingPoolAuditLogDto
        {
            AuditLogId = r.AuditLogId,
            BettingPoolId = r.BettingPoolId,
            UserId = r.UserId,
            UserName = r.UserName,
            Action = r.Action,
            IpAddress = r.IpAddress,
            CreatedAt = r.CreatedAt,
            // Pre-parse the JSON payload so the frontend doesn't have to.
            // Malformed rows degrade to an empty change list rather than failing
            // the whole response.
            Changes = ParseAuditDetails(r.Details),
        }).ToList();

        return Ok(result);
    }

    private static List<BettingPoolAuditFieldChangeDto> ParseAuditDetails(string? details)
    {
        if (string.IsNullOrWhiteSpace(details)) return new();
        try
        {
            return JsonSerializer.Deserialize<List<BettingPoolAuditFieldChangeDto>>(details, AuditJsonOptions)
                ?? new();
        }
        catch
        {
            return new();
        }
    }
}
