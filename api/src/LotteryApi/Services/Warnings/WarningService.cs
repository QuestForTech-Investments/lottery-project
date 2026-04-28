using System.Text.Json;
using LotteryApi.Data;
using LotteryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services.Warnings;

public class WarningService : IWarningService
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<WarningService> _logger;

    public WarningService(LotteryDbContext context, ILogger<WarningService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task RecordAsync(
        string type,
        string? message,
        int? bettingPoolId,
        int? userId,
        string? referenceId,
        string? referenceType,
        string severity = "medium",
        object? metadata = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var warning = new Warning
            {
                WarningType = type,
                Severity = severity,
                BettingPoolId = bettingPoolId,
                UserId = userId,
                ReferenceId = referenceId,
                ReferenceType = referenceType,
                Message = message,
                MetadataJson = metadata != null ? JsonSerializer.Serialize(metadata) : null,
                CreatedAt = DateTime.UtcNow
            };

            _context.Warnings.Add(warning);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Recorded warning {Type} for {RefType}={RefId}",
                type, referenceType, referenceId);
        }
        catch (Exception ex)
        {
            // Warnings must never break the primary flow.
            _logger.LogError(ex, "Failed to record warning {Type}", type);
        }
    }

    public Task<bool> ExistsAsync(
        string type,
        string referenceId,
        string referenceType,
        CancellationToken cancellationToken = default)
    {
        return _context.Warnings
            .AsNoTracking()
            .AnyAsync(w => w.WarningType == type
                && w.ReferenceId == referenceId
                && w.ReferenceType == referenceType,
                cancellationToken);
    }
}
