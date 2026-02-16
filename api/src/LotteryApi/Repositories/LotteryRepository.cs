using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.DTOs;
using System.Linq.Expressions;

namespace LotteryApi.Repositories;

public class LotteryRepository : GenericRepository<Lottery>, ILotteryRepository
{
    public LotteryRepository(LotteryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Lottery>> GetLotteriesByCountryAsync(int countryId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(l => l.CountryId == countryId && l.IsActive)
            .Include(l => l.Country)
            .OrderBy(l => l.LotteryName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Lottery>> GetActiveLotteriesAsync()
    {
        return await _dbSet
            .AsNoTracking()
            .Where(l => l.IsActive)
            .Include(l => l.Country)
            .OrderBy(l => l.LotteryName)
            .ToListAsync();
    }

    public async Task<Lottery?> GetLotteryWithDrawsAsync(int lotteryId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(l => l.Country)
            .Include(l => l.Draws.Where(d => d.IsActive))
            .AsSplitQuery()
            .FirstOrDefaultAsync(l => l.LotteryId == lotteryId);
    }

    // Optimized method with SQL projection - returns DTOs directly from database
    public async Task<(IEnumerable<LotteryDto> Items, int TotalCount)> GetPagedLotteriesOptimizedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<Lottery, bool>>? filter = null)
    {
        var query = _dbSet.AsNoTracking();

        if (filter != null)
        {
            query = query.Where(filter);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(l => l.LotteryName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LotteryDto
            {
                LotteryId = l.LotteryId,
                CountryId = l.CountryId,
                LotteryName = l.LotteryName,
                LotteryType = l.LotteryType,
                Description = l.Description,
                Color = l.Colour,
                IsActive = l.IsActive,
                CountryName = l.Country!.CountryName,
                ImageUrl = l.ImageUrl,
                Timezone = l.Timezone
            })
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<LotteryDto?> GetLotteryDtoByIdAsync(int lotteryId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(l => l.LotteryId == lotteryId)
            .Select(l => new LotteryDto
            {
                LotteryId = l.LotteryId,
                CountryId = l.CountryId,
                LotteryName = l.LotteryName,
                LotteryType = l.LotteryType,
                Description = l.Description,
                Color = l.Colour,
                IsActive = l.IsActive,
                CountryName = l.Country!.CountryName,
                ImageUrl = l.ImageUrl,
                Timezone = l.Timezone
            })
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<LotteryDto>> GetLotteriesDtoByCountryAsync(int countryId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(l => l.CountryId == countryId && l.IsActive)
            .OrderBy(l => l.LotteryName)
            .Select(l => new LotteryDto
            {
                LotteryId = l.LotteryId,
                CountryId = l.CountryId,
                LotteryName = l.LotteryName,
                LotteryType = l.LotteryType,
                Description = l.Description,
                Color = l.Colour,
                IsActive = l.IsActive,
                CountryName = l.Country!.CountryName,
                ImageUrl = l.ImageUrl,
                Timezone = l.Timezone
            })
            .ToListAsync();
    }
}
