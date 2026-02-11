using System.Collections.Concurrent;

namespace LotteryApi.Services;

public interface ILimitReservationService
{
    /// <summary>
    /// Reserve an amount for a specific number/draw combination.
    /// Returns the reservation ID.
    /// </summary>
    string Reserve(int drawId, string betNumber, int bettingPoolId, decimal amount);

    /// <summary>
    /// Release a specific reservation by ID.
    /// Returns true if found and removed.
    /// </summary>
    bool Release(string reservationId);

    /// <summary>
    /// Release all reservations for a specific betting pool (e.g., after ticket save).
    /// Returns count of released reservations.
    /// </summary>
    int ReleaseAllForBettingPool(int bettingPoolId, List<(int DrawId, string BetNumber)>? plays = null);

    /// <summary>
    /// Get total reserved amount for a specific number/draw combination.
    /// Optionally exclude a specific reservation (useful when the caller already has one).
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

    public string Reserve(int drawId, string betNumber, int bettingPoolId, decimal amount)
    {
        var reservation = new Reservation
        {
            ReservationId = Guid.NewGuid().ToString("N")[..12],
            DrawId = drawId,
            BetNumber = betNumber,
            BettingPoolId = bettingPoolId,
            Amount = amount,
            ExpiresAt = DateTime.UtcNow.Add(ReservationTtl)
        };

        _reservations[reservation.ReservationId] = reservation;

        _logger.LogDebug(
            "Reserved {Amount} for Draw={DrawId} Number={BetNumber} Pool={BettingPoolId} -> {ReservationId}",
            amount, drawId, betNumber, bettingPoolId, reservation.ReservationId);

        return reservation.ReservationId;
    }

    public bool Release(string reservationId)
    {
        if (_reservations.TryRemove(reservationId, out var reservation))
        {
            _logger.LogDebug(
                "Released reservation {ReservationId}: Draw={DrawId} Number={BetNumber} Amount={Amount}",
                reservationId, reservation.DrawId, reservation.BetNumber, reservation.Amount);
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

            if (plays != null && !plays.Any(p => p.DrawId == kvp.Value.DrawId && p.BetNumber == kvp.Value.BetNumber))
                continue;

            if (_reservations.TryRemove(kvp.Key, out _))
                count++;
        }

        if (count > 0)
        {
            _logger.LogDebug("Released {Count} reservations for BettingPool={BettingPoolId}", count, bettingPoolId);
        }

        return count;
    }

    public decimal GetReservedAmount(int drawId, string betNumber, string? excludeReservationId = null)
    {
        var now = DateTime.UtcNow;
        var total = 0m;

        foreach (var kvp in _reservations)
        {
            var r = kvp.Value;
            if (r.DrawId == drawId
                && r.BetNumber == betNumber
                && r.ExpiresAt > now
                && kvp.Key != excludeReservationId)
            {
                total += r.Amount;
            }
        }

        return total;
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
        {
            _logger.LogDebug("Cleaned up {Count} expired limit reservations", removed);
        }
    }

    public void Dispose()
    {
        _cleanupTimer.Dispose();
    }

    private class Reservation
    {
        public string ReservationId { get; set; } = string.Empty;
        public int DrawId { get; set; }
        public string BetNumber { get; set; } = string.Empty;
        public int BettingPoolId { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
