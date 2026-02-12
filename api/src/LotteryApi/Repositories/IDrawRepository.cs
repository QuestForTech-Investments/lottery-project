using LotteryApi.Models;
using LotteryApi.DTOs;
using System.Linq.Expressions;

namespace LotteryApi.Repositories;

public interface IDrawRepository : IGenericRepository<Draw>
{
    Task<IEnumerable<Draw>> GetDrawsByLotteryAsync(int lotteryId);
    Task<IEnumerable<Draw>> GetActiveDrawsAsync();
    Task<IEnumerable<Draw>> GetDrawsByCountryAsync(int countryId);
    Task<Draw?> GetDrawWithDetailsAsync(int drawId);

    // Optimized methods with SQL projection
    Task<(IEnumerable<DrawDto> Items, int TotalCount)> GetPagedDrawsOptimizedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<Draw, bool>>? filter = null,
        string? sortBy = null);
    Task<DrawDto?> GetDrawDtoByIdAsync(int drawId);
    Task<IEnumerable<DrawDto>> GetDrawsDtoByLotteryAsync(int lotteryId);
}
