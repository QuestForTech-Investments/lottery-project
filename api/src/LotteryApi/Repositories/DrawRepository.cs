using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.DTOs;
using System.Linq.Expressions;

namespace LotteryApi.Repositories;

public class DrawRepository : GenericRepository<Draw>, IDrawRepository
{
    public DrawRepository(LotteryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Draw>> GetDrawsByLotteryAsync(int lotteryId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(d => d.LotteryId == lotteryId && d.IsActive)
            .Include(d => d.Lottery)
                .ThenInclude(l => l!.Country)
            .AsSplitQuery()
            .OrderBy(d => d.DrawTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Draw>> GetActiveDrawsAsync()
    {
        return await _dbSet
            .AsNoTracking()
            .Where(d => d.IsActive)
            .Include(d => d.Lottery)
                .ThenInclude(l => l!.Country)
            .AsSplitQuery()
            .OrderBy(d => d.Lottery!.Country!.CountryName)
                .ThenBy(d => d.DrawTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Draw>> GetDrawsByCountryAsync(int countryId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(d => d.Lottery!.CountryId == countryId && d.IsActive)
            .Include(d => d.Lottery)
                .ThenInclude(l => l!.Country)
            .AsSplitQuery()
            .OrderBy(d => d.DrawTime)
            .ToListAsync();
    }

    public async Task<Draw?> GetDrawWithDetailsAsync(int drawId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(d => d.Lottery)
                .ThenInclude(l => l!.Country)
            .Include(d => d.Results)
            .AsSplitQuery()
            .FirstOrDefaultAsync(d => d.DrawId == drawId);
    }

    // Optimized method with SQL projection - returns DTOs directly from database
    public async Task<(IEnumerable<DrawDto> Items, int TotalCount)> GetPagedDrawsOptimizedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<Draw, bool>>? filter = null)
    {
        var query = _dbSet.AsNoTracking();

        if (filter != null)
        {
            query = query.Where(filter);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(d => d.DrawTime)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DrawDto
            {
                DrawId = d.DrawId,
                LotteryId = d.LotteryId,
                DrawName = d.DrawName,
                DrawTime = d.DrawTime,
                Description = d.Description,
                Abbreviation = d.Abbreviation,
                DisplayColor = d.DisplayColor,
                IsActive = d.IsActive,
                LotteryName = d.Lottery!.LotteryName,
                CountryName = d.Lottery!.Country!.CountryName
            })
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<DrawDto?> GetDrawDtoByIdAsync(int drawId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(d => d.DrawId == drawId)
            .Select(d => new DrawDto
            {
                DrawId = d.DrawId,
                LotteryId = d.LotteryId,
                DrawName = d.DrawName,
                DrawTime = d.DrawTime,
                Description = d.Description,
                Abbreviation = d.Abbreviation,
                DisplayColor = d.DisplayColor,
                IsActive = d.IsActive,
                LotteryName = d.Lottery!.LotteryName,
                CountryName = d.Lottery!.Country!.CountryName
            })
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrawDto>> GetDrawsDtoByLotteryAsync(int lotteryId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(d => d.LotteryId == lotteryId && d.IsActive)
            .OrderBy(d => d.DrawTime)
            .Select(d => new DrawDto
            {
                DrawId = d.DrawId,
                LotteryId = d.LotteryId,
                DrawName = d.DrawName,
                DrawTime = d.DrawTime,
                Description = d.Description,
                Abbreviation = d.Abbreviation,
                DisplayColor = d.DisplayColor,
                IsActive = d.IsActive,
                LotteryName = d.Lottery!.LotteryName,
                CountryName = d.Lottery!.Country!.CountryName
            })
            .ToListAsync();
    }
}
