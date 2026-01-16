using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;

namespace LotteryApi.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(LotteryDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.UserBettingPools)
                .ThenInclude(ubp => ubp.BettingPool)
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
    }

    public async Task<User?> GetUserWithPermissionsAsync(int userId)
    {
        return await _dbSet
            .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .Include(u => u.UserPermissions)
                .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive);
    }

    public async Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId)
    {
        var user = await GetUserWithPermissionsAsync(userId);
        if (user == null)
        {
            return new List<Permission>();
        }

        var permissions = new List<Permission>();

        // Add role-based permissions
        if (user.Role != null)
        {
            permissions.AddRange(
                user.Role.RolePermissions
                    .Where(rp => rp.IsActive && rp.Permission != null)
                    .Select(rp => rp.Permission!)
            );
        }

        // Add direct user permissions
        permissions.AddRange(
            user.UserPermissions
                .Where(up => up.IsActive &&
                            (up.ExpiresAt == null || up.ExpiresAt > DateTime.Now) &&
                            up.Permission != null)
                .Select(up => up.Permission!)
        );

        return permissions.Distinct();
    }
}
