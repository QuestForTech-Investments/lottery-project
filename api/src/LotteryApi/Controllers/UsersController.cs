using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Repositories;
using LotteryApi.Data;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly LotteryDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserRepository userRepository,
        IPermissionRepository permissionRepository,
        LotteryDbContext context,
        ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _permissionRepository = permissionRepository;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all users with pagination and filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? roleId = null,
        [FromQuery] int? zoneId = null)
    {
        var query = _context.Users
            .Where(u => u.IsActive)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u =>
                u.Username.Contains(search) ||
                (u.FullName != null && u.FullName.Contains(search)) ||
                (u.Email != null && u.Email.Contains(search)));
        }

        if (roleId.HasValue)
        {
            query = query.Where(u => u.RoleId == roleId.Value);
        }

        if (zoneId.HasValue)
        {
            query = query.Where(u => u.UserZones.Any(uz => uz.ZoneId == zoneId.Value));
        }

        var totalCount = await query.CountAsync();

        // ✅ OPTIMIZED: Direct projection to DTO (no N+1 problem)
        var dtos = await query
            .OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : null,
                CommissionRate = u.CommissionRate,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync();

        var response = new PagedResponse<UserDto>
        {
            Items = dtos,
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return Ok(response);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserZones)
            .Include(u => u.UserBettingPools)
            .FirstOrDefaultAsync(u => u.UserId == id && u.IsActive);

        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        // Get user permissions
        var permissions = await _userRepository.GetUserPermissionsAsync(id);

        var dto = new UserDetailDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            RoleId = user.RoleId,
            RoleName = user.Role?.RoleName,
            CommissionRate = user.CommissionRate,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Permissions = permissions.Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionCode = p.PermissionCode,
                PermissionName = p.PermissionName,
                Category = p.Category,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList(),
            ZoneIds = user.UserZones.Select(uz => uz.ZoneId).ToList(),
            BettingPoolIds = user.UserBettingPools.Select(ubp => ubp.BettingPoolId).ToList()
        };

        return Ok(dto);
    }

    /// <summary>
    /// Get all available permissions (flat list) - Compatibility endpoint for frontend
    /// </summary>
    [HttpGet("permissions/all")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPermissions()
    {
        // ✅ OPTIMIZED: Direct projection to DTO
        var dtos = await _context.Permissions
            .Where(p => p.IsActive)
            .OrderBy(p => p.Category)
            .ThenBy(p => p.PermissionName)
            .Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionCode = p.PermissionCode,
                PermissionName = p.PermissionName,
                Category = p.Category,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync();

        return Ok(dtos);
    }

    /// <summary>
    /// Get user permissions
    /// </summary>
    [HttpGet("{userId}/permissions")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserPermissions(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {userId} not found" });
        }

        var permissions = await _userRepository.GetUserPermissionsAsync(userId);

        var dtos = permissions.Select(p => new PermissionDto
        {
            PermissionId = p.PermissionId,
            PermissionCode = p.PermissionCode,
            PermissionName = p.PermissionName,
            Category = p.Category,
            Description = p.Description,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Search users
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new List<UserDto>());
        }

        // ✅ OPTIMIZED: Direct projection to DTO (no N+1 problem)
        var dtos = await _context.Users
            .Where(u => u.IsActive &&
                (u.Username.Contains(query) ||
                 (u.FullName != null && u.FullName.Contains(query)) ||
                 (u.Email != null && u.Email.Contains(query))))
            .OrderBy(u => u.Username)
            .Take(20)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : null,
                CommissionRate = u.CommissionRate,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync();

        return Ok(dtos);
    }

    /// <summary>
    /// Get users by role
    /// </summary>
    [HttpGet("by-role/{roleId}")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByRole(int roleId)
    {
        // ✅ OPTIMIZED: Direct projection to DTO (no N+1 problem)
        var dtos = await _context.Users
            .Where(u => u.IsActive && u.RoleId == roleId)
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : null,
                CommissionRate = u.CommissionRate,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync();

        return Ok(dtos);
    }

    /// <summary>
    /// Get users by zone
    /// </summary>
    [HttpGet("by-zone/{zoneId}")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByZone(int zoneId)
    {
        // ✅ OPTIMIZED: Direct projection to DTO (no N+1 problem)
        var dtos = await _context.Users
            .Where(u => u.IsActive && u.UserZones.Any(uz => uz.ZoneId == zoneId))
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : null,
                CommissionRate = u.CommissionRate,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync();

        return Ok(dtos);
    }

    /// <summary>
    /// Get users by betting pool (branch)
    /// </summary>
    [HttpGet("by-branch/{branchId}")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByBranch(int branchId)
    {
        // ✅ OPTIMIZED: Direct projection to DTO (no N+1 problem)
        var dtos = await _context.Users
            .Where(u => u.IsActive && u.UserBettingPools.Any(ubp => ubp.BettingPoolId == branchId))
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : null,
                CommissionRate = u.CommissionRate,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync();

        return Ok(dtos);
    }

    /// <summary>
    /// Create a new user with permissions
    /// </summary>
    [HttpPost("with-permissions")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWithPermissions([FromBody] CreateUserDto dto)
    {
        // Check if username already exists
        var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
        {
            return BadRequest(new { message = $"Username '{dto.Username}' already exists" });
        }

        // Validate password
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long" });
        }

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            Email = string.IsNullOrWhiteSpace(dto.Email) ? $"{dto.Username}@lottery.local" : dto.Email,
            Phone = dto.Phone,
            RoleId = dto.RoleId,
            CommissionRate = dto.CommissionRate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        // Add user permissions
        if (dto.PermissionIds != null && dto.PermissionIds.Any())
        {
            foreach (var permissionId in dto.PermissionIds)
            {
                var userPermission = new UserPermission
                {
                    UserId = user.UserId,
                    PermissionId = permissionId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserPermissions.Add(userPermission);
            }
            await _context.SaveChangesAsync();
        }

        // Add zones if provided
        if (dto.ZoneIds != null && dto.ZoneIds.Any())
        {
            foreach (var zoneId in dto.ZoneIds)
            {
                var userZone = new UserZone
                {
                    UserId = user.UserId,
                    ZoneId = zoneId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserZones.Add(userZone);
            }
            await _context.SaveChangesAsync();
        }

        // Add betting pool if provided
        if (dto.BranchId.HasValue)
        {
            var userBettingPool = new UserBettingPool
            {
                UserId = user.UserId,
                BettingPoolId = dto.BranchId.Value,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserBettingPools.Add(userBettingPool);
            await _context.SaveChangesAsync();
        }

        // Reload user with all data
        var createdUser = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == user.UserId);

        var permissions = await _userRepository.GetUserPermissionsAsync(user.UserId);

        // Get zone IDs
        var zoneIds = await _context.UserZones
            .Where(uz => uz.UserId == user.UserId && uz.IsActive)
            .Select(uz => uz.ZoneId)
            .ToListAsync();

        // Get betting pool IDs
        var bettingPoolIds = await _context.UserBettingPools
            .Where(ubp => ubp.UserId == user.UserId && ubp.IsActive)
            .Select(ubp => ubp.BettingPoolId)
            .ToListAsync();

        var resultDto = new UserDetailDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            RoleId = user.RoleId,
            RoleName = createdUser?.Role?.RoleName,
            CommissionRate = user.CommissionRate,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Permissions = permissions.Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionCode = p.PermissionCode,
                PermissionName = p.PermissionName,
                Category = p.Category,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList(),
            ZoneIds = zoneIds,
            BettingPoolIds = bettingPoolIds
        };

        return CreatedAtAction(nameof(GetById), new { id = user.UserId }, resultDto);
    }

    /// <summary>
    /// Update user basic information
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        // Update only provided fields
        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.RoleId.HasValue) user.RoleId = dto.RoleId;
        if (dto.CommissionRate.HasValue) user.CommissionRate = dto.CommissionRate.Value;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return NoContent();
    }

    /// <summary>
    /// Update user permissions
    /// </summary>
    [HttpPut("{userId}/permissions")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePermissions(int userId, [FromBody] UpdateUserPermissionsDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {userId} not found" });
        }

        // Remove all existing user permissions
        var existingPermissions = await _context.UserPermissions
            .Where(up => up.UserId == userId)
            .ToListAsync();
        _context.UserPermissions.RemoveRange(existingPermissions);

        // Add new permissions
        foreach (var permissionId in dto.PermissionIds)
        {
            var userPermission = new UserPermission
            {
                UserId = userId,
                PermissionId = permissionId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserPermissions.Add(userPermission);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Update user completely (permissions, zone, branch, role)
    /// </summary>
    [HttpPut("{userId}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateComplete(int userId, [FromBody] UpdateUserCompleteDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {userId} not found" });
        }

        // Update basic information
        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.RoleId.HasValue) user.RoleId = dto.RoleId;
        if (dto.CommissionRate.HasValue) user.CommissionRate = dto.CommissionRate.Value;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Update permissions
        if (dto.PermissionIds != null)
        {
            var existingPermissions = await _context.UserPermissions
                .Where(up => up.UserId == userId)
                .ToListAsync();
            _context.UserPermissions.RemoveRange(existingPermissions);

            foreach (var permissionId in dto.PermissionIds)
            {
                var userPermission = new UserPermission
                {
                    UserId = userId,
                    PermissionId = permissionId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserPermissions.Add(userPermission);
            }
        }

        // Update zones
        if (dto.ZoneIds != null)
        {
            var existingZones = await _context.UserZones
                .Where(uz => uz.UserId == userId)
                .ToListAsync();
            _context.UserZones.RemoveRange(existingZones);

            foreach (var zoneId in dto.ZoneIds)
            {
                var userZone = new UserZone
                {
                    UserId = userId,
                    ZoneId = zoneId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserZones.Add(userZone);
            }
        }

        // Update betting pool
        if (dto.BranchId.HasValue)
        {
            var existingBettingPools = await _context.UserBettingPools
                .Where(ubp => ubp.UserId == userId)
                .ToListAsync();
            _context.UserBettingPools.RemoveRange(existingBettingPools);

            var userBettingPool = new UserBettingPool
            {
                UserId = userId,
                BettingPoolId = dto.BranchId.Value,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserBettingPools.Add(userBettingPool);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPut("{userId}/password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {userId} not found" });
        }

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect" });
        }

        // Validate new password
        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters long" });
        }

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return NoContent();
    }

    /// <summary>
    /// Admin reset user password (no current password required)
    /// </summary>
    [HttpPut("{userId}/password/admin-reset")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AdminResetPassword(int userId, [FromBody] AdminResetPasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {userId} not found" });
        }

        // Validate new password
        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters long" });
        }

        // Update password (no current password verification needed for admin reset)
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("Admin reset password for user {UserId} ({Username})", userId, user.Username);

        return NoContent();
    }

    /// <summary>
    /// Deactivate user (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        // Soft delete by setting IsActive to false
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        user.DeletedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return NoContent();
    }
}
