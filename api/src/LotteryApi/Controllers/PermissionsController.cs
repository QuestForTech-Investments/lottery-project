using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Repositories;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(IPermissionRepository permissionRepository, ILogger<PermissionsController> logger)
    {
        _permissionRepository = permissionRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get all permissions with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<PermissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var (items, totalCount) = await _permissionRepository.GetPagedAsync(
            pageNumber,
            pageSize,
            filter: p => p.IsActive,
            orderBy: q => q.OrderBy(p => p.Category).ThenBy(p => p.PermissionName)
        );

        var dtos = items.Select(p => new PermissionDto
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

        var response = new PagedResponse<PermissionDto>
        {
            Items = dtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return Ok(response);
    }

    /// <summary>
    /// Get permission by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PermissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var permission = await _permissionRepository.GetByIdAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = $"Permission with ID {id} not found" });
        }

        var dto = new PermissionDto
        {
            PermissionId = permission.PermissionId,
            PermissionCode = permission.PermissionCode,
            PermissionName = permission.PermissionName,
            Category = permission.Category,
            Description = permission.Description,
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt
        };

        return Ok(dto);
    }

    /// <summary>
    /// Get permission by code
    /// </summary>
    [HttpGet("code/{permissionCode}")]
    [ProducesResponseType(typeof(PermissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string permissionCode)
    {
        var permission = await _permissionRepository.GetPermissionByCodeAsync(permissionCode);

        if (permission == null)
        {
            return NotFound(new { message = $"Permission with code '{permissionCode}' not found" });
        }

        var dto = new PermissionDto
        {
            PermissionId = permission.PermissionId,
            PermissionCode = permission.PermissionCode,
            PermissionName = permission.PermissionName,
            Category = permission.Category,
            Description = permission.Description,
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt
        };

        return Ok(dto);
    }

    /// <summary>
    /// Get permissions by category
    /// </summary>
    [HttpGet("category/{category}")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCategory(string category)
    {
        var permissions = await _permissionRepository.GetPermissionsByCategoryAsync(category);

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
    /// Get all active permissions
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActive()
    {
        var permissions = await _permissionRepository.GetActivePermissionsAsync();

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
    /// Get permissions grouped by category
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(IEnumerable<PermissionCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var permissions = await _permissionRepository.GetActivePermissionsAsync();

        var grouped = permissions
            .GroupBy(p => p.Category)
            .Select(g => new PermissionCategoryDto
            {
                Category = g.Key,
                Permissions = g.Select(p => new PermissionDto
                {
                    PermissionId = p.PermissionId,
                    PermissionCode = p.PermissionCode,
                    PermissionName = p.PermissionName,
                    Category = p.Category,
                    Description = p.Description,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList()
            })
            .OrderBy(c => c.Category);

        return Ok(grouped);
    }

    /// <summary>
    /// Get all permissions (flat list) - Used by frontend
    /// </summary>
    [HttpGet("all")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllFlat()
    {
        var permissions = await _permissionRepository.GetActivePermissionsAsync();

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
    /// Create a new permission
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PermissionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePermissionDto dto)
    {
        // Check if permission code already exists
        if (await _permissionRepository.PermissionCodeExistsAsync(dto.PermissionCode))
        {
            return BadRequest(new { message = $"Permission code '{dto.PermissionCode}' already exists" });
        }

        var permission = new Permission
        {
            PermissionCode = dto.PermissionCode,
            PermissionName = dto.PermissionName,
            Category = dto.Category,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _permissionRepository.AddAsync(permission);

        var resultDto = new PermissionDto
        {
            PermissionId = permission.PermissionId,
            PermissionCode = permission.PermissionCode,
            PermissionName = permission.PermissionName,
            Category = permission.Category,
            Description = permission.Description,
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = permission.PermissionId }, resultDto);
    }

    /// <summary>
    /// Update an existing permission
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePermissionDto dto)
    {
        var permission = await _permissionRepository.GetByIdAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = $"Permission with ID {id} not found" });
        }

        // Check if permission code already exists (excluding current permission)
        if (await _permissionRepository.PermissionCodeExistsAsync(dto.PermissionCode, id))
        {
            return BadRequest(new { message = $"Permission code '{dto.PermissionCode}' already exists" });
        }

        permission.PermissionCode = dto.PermissionCode;
        permission.PermissionName = dto.PermissionName;
        permission.Category = dto.Category;
        permission.Description = dto.Description;
        permission.IsActive = dto.IsActive;
        permission.UpdatedAt = DateTime.UtcNow;

        await _permissionRepository.UpdateAsync(permission);

        return NoContent();
    }

    /// <summary>
    /// Delete a permission (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var permission = await _permissionRepository.GetByIdAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = $"Permission with ID {id} not found" });
        }

        // Soft delete by setting IsActive to false
        permission.IsActive = false;
        permission.UpdatedAt = DateTime.UtcNow;
        await _permissionRepository.UpdateAsync(permission);

        return NoContent();
    }

    /// <summary>
    /// Permanently delete a permission (hard delete)
    /// </summary>
    [HttpDelete("{id}/permanent")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePermanent(int id)
    {
        var permission = await _permissionRepository.GetByIdAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = $"Permission with ID {id} not found" });
        }

        await _permissionRepository.DeleteAsync(permission);

        return NoContent();
    }
}
