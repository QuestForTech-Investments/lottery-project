using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;

namespace LotteryApi.Repositories;

public class PermissionRepository : GenericRepository<Permission>, IPermissionRepository
{
    public PermissionRepository(LotteryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Permission>> GetPermissionsByCategoryAsync(string category)
    {
        return await _dbSet
            .Where(p => p.Category == category && p.IsActive)
            .OrderBy(p => p.PermissionName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Permission>> GetActivePermissionsAsync()
    {
        return await _dbSet
            .Where(p => p.IsActive)
            .OrderBy(p => p.Category)
            .ThenBy(p => p.PermissionName)
            .ToListAsync();
    }

    public async Task<Permission?> GetPermissionByCodeAsync(string permissionCode)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.PermissionCode == permissionCode);
    }

    public async Task<bool> PermissionCodeExistsAsync(string permissionCode, int? excludePermissionId = null)
    {
        var query = _dbSet.Where(p => p.PermissionCode == permissionCode);

        if (excludePermissionId.HasValue)
        {
            query = query.Where(p => p.PermissionId != excludePermissionId.Value);
        }

        return await query.AnyAsync();
    }
}
