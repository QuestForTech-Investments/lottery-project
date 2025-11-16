using LotteryApi.Repositories;

namespace LotteryApi.Data;

/// <summary>
/// Unit of Work pattern interface - Manages database transactions and repositories
/// </summary>
public interface IUnitOfWork : IDisposable
{
    // Repositories
    ILotteryRepository Lotteries { get; }
    IDrawRepository Draws { get; }
    IUserRepository Users { get; }
    IPermissionRepository Permissions { get; }
    IGenericRepository<T> Repository<T>() where T : class;

    // Transaction methods
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
