using Microsoft.EntityFrameworkCore.Storage;
using LotteryApi.Repositories;

namespace LotteryApi.Data;

/// <summary>
/// Unit of Work implementation - Coordinates work of multiple repositories and manages transactions
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly LotteryDbContext _context;
    private IDbContextTransaction? _transaction;
    private readonly Dictionary<Type, object> _repositories;

    // Lazy-loaded repositories
    private ILotteryRepository? _lotteries;
    private IDrawRepository? _draws;
    private IUserRepository? _users;
    private IPermissionRepository? _permissions;

    public UnitOfWork(LotteryDbContext context)
    {
        _context = context;
        _repositories = new Dictionary<Type, object>();
    }

    // Repository properties with lazy initialization
    public ILotteryRepository Lotteries => _lotteries ??= new LotteryRepository(_context);
    public IDrawRepository Draws => _draws ??= new DrawRepository(_context);
    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IPermissionRepository Permissions => _permissions ??= new PermissionRepository(_context);

    /// <summary>
    /// Get a generic repository for any entity type
    /// </summary>
    public IGenericRepository<T> Repository<T>() where T : class
    {
        var type = typeof(T);

        if (!_repositories.ContainsKey(type))
        {
            var repositoryInstance = new GenericRepository<T>(_context);
            _repositories.Add(type, repositoryInstance);
        }

        return (IGenericRepository<T>)_repositories[type];
    }

    /// <summary>
    /// Save all pending changes to the database
    /// </summary>
    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Begin a new database transaction
    /// </summary>
    public async Task BeginTransactionAsync()
    {
        if (_transaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress");
        }

        _transaction = await _context.Database.BeginTransactionAsync();
    }

    /// <summary>
    /// Commit the current transaction
    /// </summary>
    public async Task CommitTransactionAsync()
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction in progress");
        }

        try
        {
            await _context.SaveChangesAsync();
            await _transaction.CommitAsync();
        }
        catch
        {
            await RollbackTransactionAsync();
            throw;
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    /// <summary>
    /// Rollback the current transaction
    /// </summary>
    public async Task RollbackTransactionAsync()
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction in progress");
        }

        await _transaction.RollbackAsync();
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    /// <summary>
    /// Dispose of the unit of work and associated resources
    /// </summary>
    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
