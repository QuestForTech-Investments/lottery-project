using LotteryApi.Models;

namespace LotteryApi.Repositories;

public interface IPermissionRepository : IGenericRepository<Permission>
{
    Task<IEnumerable<Permission>> GetPermissionsByCategoryAsync(string category);
    Task<IEnumerable<Permission>> GetActivePermissionsAsync();
    Task<Permission?> GetPermissionByCodeAsync(string permissionCode);
    Task<bool> PermissionCodeExistsAsync(string permissionCode, int? excludePermissionId = null);
}
