using LotteryApi.Models;

namespace LotteryApi.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetUserWithPermissionsAsync(int userId);
    Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId);
}
