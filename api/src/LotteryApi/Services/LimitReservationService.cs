using System.Collections.Concurrent;

namespace LotteryApi.Services;

public interface ILimitReservationService
{
    /// <summary>
    /// Reserve an amount for a specific draw + game type combination.
    /// </summary>
    string Reserve(int drawId, int gameTypeId, int bettingPoolId, decimal amount);

    /// <summary>
    /// Release a specific reservation by ID.
    /// </summary>
    bool Release(string reservationId);

    /// <summary>
    /// Release all reservations for a specific betting pool (e.g., after ticket save).
    /// Optionally filter by specific plays.
    /// </summary>
    int ReleaseAllForBettingPool(int bettingPoolId, List<(int DrawId, string BetNumber)>? plays = null);

    /// <summary>
    /// Get total reserved amount for a draw + game type (across all numbers and pools).
    /// </summary>
    decimal GetReservedAmount(int drawId, int gameTypeId, string? excludeReservationId = null);

    /// <summary>
    /// Legacy: Get reserved amount by draw + betNumber.
    /// </summary>
    decimal GetReservedAmount(int drawId, string betNumber, string? excludeReservationId = null);
}

public class LimitReservationService : ILimitReservationService, IDisposable
{
    private readonly ConcurrentDictionary<string, Reservation> _reservations = new();
    private readonly Timer _cleanupTimer;
    private readonly ILogger<LimitReservationService> _logger;
    private static readonly TimeSpan ReservationTtl = TimeSpan.FromMinutes(3);
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromSeconds(30);

    public LimitReservationService(ILogger<LimitReservationService> logger)
    {
        _logger = logger;
        _cleanupTimer = new Timer(CleanupExpired, null, CleanupInterval, CleanupInterval);
    }

    public string Reserve(int drawId, int gameTypeId, int bettingPoolId, decimal amount)
    {
        var reservation = new Reservation
        {
            ReservationId = Guid.NewGuid().ToString("N")[..12],
            DrawId = drawId,
            GameTypeId = gameTypeId,
            BettingPoolId = bettingPoolId,
            Amount = amount,
            ExpiresAt = DateTime.UtcNow.Add(ReservationTtl)
        };

        _reservations[reservation.ReservationId] = reservation;

        _logger.LogDebug(
            "Reserved {Amount} for Draw={DrawId} GameType={GameTypeId} Pool={BettingPoolId} -> {ReservationId}",
            amount, drawId, gameTypeId, bettingPoolId, reservation.ReservationId);

        return reservation.ReservationId;
    }

    public bool Release(string reservationId)
    {
        if (_reservations.TryRemove(reservationId, out var reservation))
        {
            _logger.LogDebug(
                "Released reservation {ReservationId}: Draw={DrawId} GameType={GameTypeId} Amount={Amount}",
                reservationId, reservation.DrawId, reservation.GameTypeId, reservation.Amount);
            return true;
        }
        return false;
    }

    public int ReleaseAllForBettingPool(int bettingPoolId, List<(int DrawId, string BetNumber)>? plays = null)
    {
        var count = 0;
        foreach (var kvp in _reservations)
        {
            if (kvp.Value.BettingPoolId != bettingPoolId)
                continue;

            // If plays filter provided, match by drawId (betNumber not relevant for game-type reservations)
            if (plays != null && !plays.Any(p => p.DrawId == kvp.Value.DrawId))
                continue;

            if (_reservations.TryRemove(kvp.Key, out _))
                count++;
        }

        if (count > 0)
            _logger.LogDebug("Released {Count} reservations for BettingPool={BettingPoolId}", count, bettingPoolId);

        return count;
    }

    /// <summary>
    /// Get reserved amount by draw + game type (the primary method for limit checking).
    /// </summary>
    public decimal GetReservedAmount(int drawId, int gameTypeId, string? excludeReservationId = null)
    {
        var now = DateTime.UtcNow;
        var total = 0m;

        foreach (var kvp in _reservations)
        {
            var r = kvp.Value;
            if (r.DrawId == drawId
                && r.GameTypeId == gameTypeId
                && r.ExpiresAt > now
                && kvp.Key != excludeReservationId)
            {
                total += r.Amount;
            }
        }

        return total;
    }

    /// <summary>
    /// Legacy: get reserved amount by draw + betNumber (maps to game type by number length).
    /// </summary>
    public decimal GetReservedAmount(int drawId, string betNumber, string? excludeReservationId = null)
    {
        var gameTypeId = betNumber.Length switch
        {
            2 => 1, 4 => 2, 6 => 3, 3 => 4, 5 => 12, _ => 1
        };
        return GetReservedAmount(drawId, gameTypeId, excludeReservationId);
    }

    private void CleanupExpired(object? state)
    {
        var now = DateTime.UtcNow;
        var removed = 0;

        foreach (var kvp in _reservations)
        {
            if (kvp.Value.ExpiresAt <= now)
            {
                if (_reservations.TryRemove(kvp.Key, out _))
                    removed++;
            }
        }

        if (removed > 0)
            _logger.LogDebug("Cleaned up {Count} expired limit reservations", removed);
    }

    public void Dispose()
    {
        _cleanupTimer.Dispose();
    }

    private class Reservation
    {
        public string ReservationId { get; set; } = string.Empty;
        public int DrawId { get; set; }
        public int GameTypeId { get; set; }
        public int BettingPoolId { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
