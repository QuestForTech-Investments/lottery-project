using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/expense-categories")]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<ExpenseCategoriesController> _logger;

    public ExpenseCategoriesController(LotteryDbContext context, ILogger<ExpenseCategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExpenseCategoryDto>>> GetCategories(
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? parentOnly = null)
    {
        try
        {
            var query = _context.ExpenseCategories
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.CategoryName.Contains(search));
            }

            if (isActive.HasValue)
            {
                query = query.Where(c => c.IsActive == isActive.Value);
            }

            if (parentOnly.HasValue && parentOnly.Value)
            {
                query = query.Where(c => c.ParentCategoryId == null);
            }

            var results = await query
                .OrderBy(c => c.CategoryName)
                .Select(c => new ExpenseCategoryDto
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName,
                    ParentCategoryId = c.ParentCategoryId,
                    ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.CategoryName : null,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting expense categories");
            return StatusCode(500, new { error = "Error al obtener categorías de gastos" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseCategoryDto>> GetCategory(int id)
    {
        try
        {
            var category = await _context.ExpenseCategories
                .AsNoTracking()
                .Where(c => c.CategoryId == id)
                .Select(c => new ExpenseCategoryDto
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName,
                    ParentCategoryId = c.ParentCategoryId,
                    ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.CategoryName : null,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound(new { message = "Categoría no encontrada" });

            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting expense category {Id}", id);
            return StatusCode(500, new { error = "Error al obtener categoría de gasto" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseCategoryDto>> CreateCategory([FromBody] CreateExpenseCategoryDto dto)
    {
        try
        {
            // Validate parent exists if specified
            if (dto.ParentCategoryId.HasValue)
            {
                var parentExists = await _context.ExpenseCategories
                    .AnyAsync(c => c.CategoryId == dto.ParentCategoryId.Value && c.ParentCategoryId == null);
                if (!parentExists)
                    return BadRequest(new { message = "La categoría padre no existe o no es una categoría padre válida" });
            }

            // Check for duplicate name within same level
            var nameExists = await _context.ExpenseCategories
                .AnyAsync(c => c.CategoryName == dto.CategoryName && c.ParentCategoryId == dto.ParentCategoryId && c.IsActive);
            if (nameExists)
                return BadRequest(new { message = "Ya existe una categoría con ese nombre" });

            var category = new ExpenseCategory
            {
                CategoryName = dto.CategoryName,
                ParentCategoryId = dto.ParentCategoryId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ExpenseCategories.Add(category);
            await _context.SaveChangesAsync();

            var result = new ExpenseCategoryDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                ParentCategoryId = category.ParentCategoryId,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating expense category");
            return StatusCode(500, new { error = "Error al crear categoría de gasto" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseCategoryDto>> UpdateCategory(int id, [FromBody] UpdateExpenseCategoryDto dto)
    {
        try
        {
            var category = await _context.ExpenseCategories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Categoría no encontrada" });

            if (dto.CategoryName != null)
            {
                // Check for duplicate name within same level
                var parentId = dto.ParentCategoryId ?? category.ParentCategoryId;
                var nameExists = await _context.ExpenseCategories
                    .AnyAsync(c => c.CategoryName == dto.CategoryName && c.ParentCategoryId == parentId && c.CategoryId != id && c.IsActive);
                if (nameExists)
                    return BadRequest(new { message = "Ya existe una categoría con ese nombre" });

                category.CategoryName = dto.CategoryName;
            }

            if (dto.ParentCategoryId.HasValue)
            {
                var parentExists = await _context.ExpenseCategories
                    .AnyAsync(c => c.CategoryId == dto.ParentCategoryId.Value && c.ParentCategoryId == null);
                if (!parentExists)
                    return BadRequest(new { message = "La categoría padre no existe o no es válida" });

                category.ParentCategoryId = dto.ParentCategoryId;
            }

            if (dto.IsActive.HasValue) category.IsActive = dto.IsActive.Value;

            category.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new ExpenseCategoryDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                ParentCategoryId = category.ParentCategoryId,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating expense category {Id}", id);
            return StatusCode(500, new { error = "Error al actualizar categoría de gasto" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        try
        {
            var category = await _context.ExpenseCategories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Categoría no encontrada" });

            // If parent category, also deactivate children
            if (category.ParentCategoryId == null)
            {
                var children = await _context.ExpenseCategories
                    .Where(c => c.ParentCategoryId == id)
                    .ToListAsync();
                foreach (var child in children)
                {
                    child.IsActive = false;
                    child.UpdatedAt = DateTime.UtcNow;
                }
            }

            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Categoría desactivada" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting expense category {Id}", id);
            return StatusCode(500, new { error = "Error al eliminar categoría de gasto" });
        }
    }
}
