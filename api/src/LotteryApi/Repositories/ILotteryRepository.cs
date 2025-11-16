using LotteryApi.Models;
using LotteryApi.DTOs;
using System.Linq.Expressions;

namespace LotteryApi.Repositories;

public interface ILotteryRepository : IGenericRepository<Lottery>
{
    Task<IEnumerable<Lottery>> GetLotteriesByCountryAsync(int countryId);
    Task<IEnumerable<Lottery>> GetActiveLotteriesAsync();
    Task<Lottery?> GetLotteryWithDrawsAsync(int lotteryId);

    // Optimized methods with SQL projection
    Task<(IEnumerable<LotteryDto> Items, int TotalCount)> GetPagedLotteriesOptimizedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<Lottery, bool>>? filter = null);
    Task<LotteryDto?> GetLotteryDtoByIdAsync(int lotteryId);
    Task<IEnumerable<LotteryDto>> GetLotteriesDtoByCountryAsync(int countryId);
}
