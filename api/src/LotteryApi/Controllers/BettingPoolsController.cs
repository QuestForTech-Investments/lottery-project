using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.DTOs;
using BCrypt.Net;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/betting-pools")]
public class BettingPoolsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BettingPoolsController> _logger;

    public BettingPoolsController(LotteryDbContext context, ILogger<BettingPoolsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all betting pools with pagination and filtering
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20, max: 100)</param>
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
        try
        {
            // Validate pagination parameters
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            // Build query - No Include needed, EF will optimize with Select projection
            var query = _context.BettingPools.AsQueryable();

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
                    CreatedAt = bp.CreatedAt
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
        try
        {
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
                return NotFound(new { message = "Banca no encontrada" });
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
    /// Get next available betting pool code (format: LB-XXXX)
    /// </summary>
    [HttpGet("next-code")]
    public async Task<ActionResult<NextBettingPoolCodeDto>> GetNextCode()
    {
        try
        {
            // Get all betting pool codes that start with "LB-" and extract the highest number
            var lbCodes = await _context.BettingPools
                .Where(bp => bp.BettingPoolCode.StartsWith("LB-"))
                .Select(bp => bp.BettingPoolCode)
                .ToListAsync();

            int maxNumber = 0;
            foreach (var code in lbCodes)
            {
                // Extract number from code (e.g., "LB-0013" -> 13)
                if (code.Length > 3 && int.TryParse(code.Substring(3), out int num))
                {
                    if (num > maxNumber) maxNumber = num;
                }
            }

            // Next number is max + 1
            int nextNumber = maxNumber + 1;

            // Generate code with format LB-XXXX (e.g., LB-0001, LB-0014, etc.)
            string nextCode = $"LB-{nextNumber:D4}";

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
        try
        {
            // Validate zone exists
            var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == dto.ZoneId);
            if (!zoneExists)
            {
                return BadRequest(new { message = "La zona especificada no existe" });
            }

            // Validate bank if provided
            if (dto.BankId.HasValue)
            {
                var bankExists = await _context.Banks.AnyAsync(b => b.BankId == dto.BankId.Value);
                if (!bankExists)
                {
                    return BadRequest(new { message = "El banco especificado no existe" });
                }
            }

            // Check if code already exists
            var codeExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolCode == dto.BettingPoolCode);
            if (codeExists)
            {
                return Conflict(new { message = "El código de banca ya existe" });
            }

            // Validate username and password are required
            if (string.IsNullOrWhiteSpace(dto.Username))
            {
                return BadRequest(new { message = "El nombre de usuario es requerido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "La contraseña es requerida" });
            }

            // Check if username already exists
            var userExists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower());
            if (userExists)
            {
                return Conflict(new { message = "Ya existe un usuario con ese nombre" });
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

            // After saving, update the code if it doesn't match LB-XXXX format
            // Generate next sequential code based on existing LB- codes
            if (!dto.BettingPoolCode.StartsWith("LB-"))
            {
                var lbCodes = await _context.BettingPools
                    .Where(bp => bp.BettingPoolCode.StartsWith("LB-"))
                    .Select(bp => bp.BettingPoolCode)
                    .ToListAsync();

                int maxNumber = 0;
                foreach (var code in lbCodes)
                {
                    if (code.Length > 3 && int.TryParse(code.Substring(3), out int num))
                    {
                        if (num > maxNumber) maxNumber = num;
                    }
                }

                bettingPool.BettingPoolCode = $"LB-{(maxNumber + 1):D4}";
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
        try
        {
            var bettingPool = await _context.BettingPools.FindAsync(id);
            if (bettingPool == null)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            // Validate zone if changed
            if (dto.ZoneId.HasValue)
            {
                var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == dto.ZoneId.Value);
                if (!zoneExists)
                {
                    return BadRequest(new { message = "La zona especificada no existe" });
                }
                bettingPool.ZoneId = dto.ZoneId.Value;
            }

            // Validate bank if changed
            if (dto.BankId.HasValue)
            {
                var bankExists = await _context.Banks.AnyAsync(b => b.BankId == dto.BankId.Value);
                if (!bankExists)
                {
                    return BadRequest(new { message = "El banco especificado no existe" });
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

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                bettingPool.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            if (dto.IsActive.HasValue)
            {
                bettingPool.IsActive = dto.IsActive.Value;
            }

            bettingPool.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

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
        try
        {
            var bettingPool = await _context.BettingPools.FindAsync(id);
            if (bettingPool == null)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            // Check if has associated users
            var hasUsers = await _context.UserBettingPools
                .AnyAsync(ubp => ubp.BettingPoolId == id);
            if (hasUsers)
            {
                return BadRequest(new { message = "No se puede eliminar la banca porque tiene usuarios asociados" });
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
            var bettingPoolExists = await _context.BettingPools.AnyAsync(bp => bp.BettingPoolId == id);
            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
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

            // Create the user
            var user = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                Email = dto.Email ?? $"{dto.Username}@pos.local",
                Phone = dto.Phone,
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
                return NotFound(new { message = "Banca no encontrada" });
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
                    PaymentMode = bettingPool.Config.PaymentMode
                } : null,
                DiscountConfig = bettingPool.DiscountConfig != null ? new BettingPoolDiscountConfigDto
                {
                    DiscountProvider = bettingPool.DiscountConfig.DiscountProvider,
                    DiscountMode = bettingPool.DiscountConfig.DiscountMode
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
                    FooterLine4 = bettingPool.Footer.FooterLine4
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
            var bettingPool = await _context.BettingPools
                .Include(bp => bp.Config)
                .Include(bp => bp.DiscountConfig)
                .Include(bp => bp.PrintConfig)
                .Include(bp => bp.Footer)
                .Where(bp => bp.BettingPoolId == id)
                .FirstOrDefaultAsync();

            if (bettingPool == null)
            {
                return NotFound(new { message = "Banca no encontrada" });
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

                bettingPool.DiscountConfig.DiscountProvider = dto.DiscountConfig.DiscountProvider;
                bettingPool.DiscountConfig.DiscountMode = dto.DiscountConfig.DiscountMode;
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
                bettingPool.Footer.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

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
                return BadRequest(new { message = "La zona especificada no existe" });
            }

            // Validate bank if provided
            if (dto.BankId.HasValue)
            {
                var bankExists = await _context.Banks.AnyAsync(b => b.BankId == dto.BankId.Value);
                if (!bankExists)
                {
                    return BadRequest(new { message = "El banco especificado no existe" });
                }
            }

            // Check if code already exists
            var codeExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolCode == dto.BettingPoolCode);
            if (codeExists)
            {
                return Conflict(new { message = "El código de banca ya existe" });
            }

            // Validate username and password are required
            if (string.IsNullOrWhiteSpace(dto.Username))
            {
                return BadRequest(new { message = "El nombre de usuario es requerido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "La contraseña es requerida" });
            }

            // Check if username already exists
            var userExists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower());
            if (userExists)
            {
                return Conflict(new { message = "Ya existe un usuario con ese nombre" });
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

            // Update code if needed - generate next sequential LB- code
            if (!dto.BettingPoolCode.StartsWith("LB-"))
            {
                var lbCodes = await _context.BettingPools
                    .Where(bp => bp.BettingPoolCode.StartsWith("LB-"))
                    .Select(bp => bp.BettingPoolCode)
                    .ToListAsync();

                int maxNumber = 0;
                foreach (var code in lbCodes)
                {
                    if (code.Length > 3 && int.TryParse(code.Substring(3), out int num))
                    {
                        if (num > maxNumber) maxNumber = num;
                    }
                }

                bettingPool.BettingPoolCode = $"LB-{(maxNumber + 1):D4}";
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
                var config = new BettingPoolConfig
                {
                    BettingPoolId = bettingPool.BettingPoolId,
                    FallType = dto.Config.FallType,
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
                    DiscountProvider = dto.DiscountConfig.DiscountProvider,
                    DiscountMode = dto.DiscountConfig.DiscountMode,
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
            var bettingPool = await _context.BettingPools
                .Include(bp => bp.Schedules)
                .FirstOrDefaultAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (bettingPool == null)
            {
                return NotFound(new { message = "Banca no encontrada" });
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
            var bettingPool = await _context.BettingPools
                .Include(bp => bp.Schedules)
                .FirstOrDefaultAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (bettingPool == null)
            {
                return NotFound(new { message = "Banca no encontrada" });
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
}
