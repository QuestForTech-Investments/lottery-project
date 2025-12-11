using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services;

/// <summary>
/// Service for managing result audit logs
/// </summary>
public interface IResultLogService
{
    Task<ResultLog> CreateLogAsync(CreateResultLogDto dto);
    Task<ResultLog> LogResultCreatedAsync(int resultId, int userId, string winningNumber, string? additionalNumber, string? ipAddress, int? drawId, DateTime? resultDate);
    Task<ResultLog> LogResultUpdatedAsync(int resultId, int userId, string? oldWinningNumber, string? newWinningNumber, string? oldAdditionalNumber, string? newAdditionalNumber, string? ipAddress, string? details = null);
    Task<ResultLog> LogResultDeletedAsync(int resultId, int userId, string? ipAddress, string? reason = null);
    Task<ResultLog> LogResultApprovedAsync(int resultId, int userId, string? ipAddress);
    Task<List<ResultLogDto>> GetLogsByResultIdAsync(int resultId);
    Task<List<ResultLogDto>> GetLogsByUserIdAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<ResultLogDto>> GetRecentLogsAsync(int count = 50);
}

public class ResultLogService : IResultLogService
{
    private readonly LotteryDbContext _context;

    public ResultLogService(LotteryDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Create a generic result log entry
    /// </summary>
    public async Task<ResultLog> CreateLogAsync(CreateResultLogDto dto)
    {
        var log = new ResultLog
        {
            ResultId = dto.ResultId,
            UserId = dto.UserId,
            Action = dto.Action,
            IpAddress = dto.IpAddress,
            Details = dto.Details,
            OldWinningNumber = dto.OldWinningNumber,
            NewWinningNumber = dto.NewWinningNumber,
            OldAdditionalNumber = dto.OldAdditionalNumber,
            NewAdditionalNumber = dto.NewAdditionalNumber,
            DrawId = dto.DrawId,
            ResultDate = dto.ResultDate,
            CreatedAt = DateTime.UtcNow
        };

        _context.ResultLogs.Add(log);
        await _context.SaveChangesAsync();

        return log;
    }

    /// <summary>
    /// Log a result creation action
    /// </summary>
    public async Task<ResultLog> LogResultCreatedAsync(
        int resultId,
        int userId,
        string winningNumber,
        string? additionalNumber,
        string? ipAddress,
        int? drawId,
        DateTime? resultDate)
    {
        var log = new ResultLog
        {
            ResultId = resultId,
            UserId = userId,
            Action = ResultLogActions.Created,
            IpAddress = ipAddress,
            NewWinningNumber = winningNumber,
            NewAdditionalNumber = additionalNumber,
            DrawId = drawId,
            ResultDate = resultDate,
            CreatedAt = DateTime.UtcNow
        };

        _context.ResultLogs.Add(log);
        await _context.SaveChangesAsync();

        return log;
    }

    /// <summary>
    /// Log a result update action
    /// </summary>
    public async Task<ResultLog> LogResultUpdatedAsync(
        int resultId,
        int userId,
        string? oldWinningNumber,
        string? newWinningNumber,
        string? oldAdditionalNumber,
        string? newAdditionalNumber,
        string? ipAddress,
        string? details = null)
    {
        var log = new ResultLog
        {
            ResultId = resultId,
            UserId = userId,
            Action = ResultLogActions.Updated,
            IpAddress = ipAddress,
            Details = details,
            OldWinningNumber = oldWinningNumber,
            NewWinningNumber = newWinningNumber,
            OldAdditionalNumber = oldAdditionalNumber,
            NewAdditionalNumber = newAdditionalNumber,
            CreatedAt = DateTime.UtcNow
        };

        _context.ResultLogs.Add(log);
        await _context.SaveChangesAsync();

        return log;
    }

    /// <summary>
    /// Log a result deletion action
    /// </summary>
    public async Task<ResultLog> LogResultDeletedAsync(
        int resultId,
        int userId,
        string? ipAddress,
        string? reason = null)
    {
        var log = new ResultLog
        {
            ResultId = resultId,
            UserId = userId,
            Action = ResultLogActions.Deleted,
            IpAddress = ipAddress,
            Details = reason,
            CreatedAt = DateTime.UtcNow
        };

        _context.ResultLogs.Add(log);
        await _context.SaveChangesAsync();

        return log;
    }

    /// <summary>
    /// Log a result approval action
    /// </summary>
    public async Task<ResultLog> LogResultApprovedAsync(
        int resultId,
        int userId,
        string? ipAddress)
    {
        var log = new ResultLog
        {
            ResultId = resultId,
            UserId = userId,
            Action = ResultLogActions.Approved,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        _context.ResultLogs.Add(log);
        await _context.SaveChangesAsync();

        return log;
    }

    /// <summary>
    /// Get all logs for a specific result
    /// </summary>
    public async Task<List<ResultLogDto>> GetLogsByResultIdAsync(int resultId)
    {
        return await _context.ResultLogs
            .Where(rl => rl.ResultId == resultId)
            .OrderBy(rl => rl.CreatedAt)
            .Select(rl => new ResultLogDto
            {
                LogId = rl.LogId,
                ResultId = rl.ResultId,
                UserId = rl.UserId,
                Action = rl.Action,
                CreatedAt = rl.CreatedAt,
                IpAddress = rl.IpAddress,
                Details = rl.Details,
                OldWinningNumber = rl.OldWinningNumber,
                NewWinningNumber = rl.NewWinningNumber,
                OldAdditionalNumber = rl.OldAdditionalNumber,
                NewAdditionalNumber = rl.NewAdditionalNumber,
                DrawId = rl.DrawId,
                ResultDate = rl.ResultDate,
                Username = rl.User != null ? rl.User.Username : null,
                DrawName = rl.Result != null && rl.Result.Draw != null ? rl.Result.Draw.DrawName : null
            })
            .ToListAsync();
    }

    /// <summary>
    /// Get all logs for a specific user within a date range
    /// </summary>
    public async Task<List<ResultLogDto>> GetLogsByUserIdAsync(
        int userId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _context.ResultLogs
            .Where(rl => rl.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(rl => rl.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(rl => rl.CreatedAt <= endDate.Value);

        return await query
            .OrderByDescending(rl => rl.CreatedAt)
            .Select(rl => new ResultLogDto
            {
                LogId = rl.LogId,
                ResultId = rl.ResultId,
                UserId = rl.UserId,
                Action = rl.Action,
                CreatedAt = rl.CreatedAt,
                IpAddress = rl.IpAddress,
                Details = rl.Details,
                OldWinningNumber = rl.OldWinningNumber,
                NewWinningNumber = rl.NewWinningNumber,
                OldAdditionalNumber = rl.OldAdditionalNumber,
                NewAdditionalNumber = rl.NewAdditionalNumber,
                DrawId = rl.DrawId,
                ResultDate = rl.ResultDate,
                Username = rl.User != null ? rl.User.Username : null,
                DrawName = rl.Result != null && rl.Result.Draw != null ? rl.Result.Draw.DrawName : null
            })
            .ToListAsync();
    }

    /// <summary>
    /// Get most recent result logs
    /// </summary>
    public async Task<List<ResultLogDto>> GetRecentLogsAsync(int count = 50)
    {
        return await _context.ResultLogs
            .OrderByDescending(rl => rl.CreatedAt)
            .Take(count)
            .Select(rl => new ResultLogDto
            {
                LogId = rl.LogId,
                ResultId = rl.ResultId,
                UserId = rl.UserId,
                Action = rl.Action,
                CreatedAt = rl.CreatedAt,
                IpAddress = rl.IpAddress,
                Details = rl.Details,
                OldWinningNumber = rl.OldWinningNumber,
                NewWinningNumber = rl.NewWinningNumber,
                OldAdditionalNumber = rl.OldAdditionalNumber,
                NewAdditionalNumber = rl.NewAdditionalNumber,
                DrawId = rl.DrawId,
                ResultDate = rl.ResultDate,
                Username = rl.User != null ? rl.User.Username : null,
                DrawName = rl.Result != null && rl.Result.Draw != null ? rl.Result.Draw.DrawName : null
            })
            .ToListAsync();
    }
}
