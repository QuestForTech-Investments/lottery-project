using System.Collections.Concurrent;

namespace LotteryApi.Services;

public interface ILimitReservationService
{
    /// <summary>
    /// Reserve an amount for a specific draw + game type + bet number combination.
    /// </summary>
    string Reserve(int drawId, int gameTypeId, int bettingPoolId, decimal amount, string? betNumber = null);

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
    /// Get total reserved amount for a draw + game type + bet number.
    /// </summary>
    decimal GetReservedAmount(int drawId, int gameTypeId, string betNumber, string? excludeReservationId = null);

    /// <summary>
    /// Get reserved amount scoped to a specific betting pool (for banca-level limits).
    /// </summary>
    decimal GetReservedAmountForPool(int drawId, int gameTypeId, string betNumber, int bettingPoolId);

    /// <summary>
    /// Get reserved amount for all pools in a zone (for zona-level limits).
    /// </summary>
    decimal GetReservedAmountForZone(int drawId, int gameTypeId, string betNumber, HashSet<int>? zonePoolIds);

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

    public string Reserve(int drawId, int gameTypeId, int bettingPoolId, decimal amount, string? betNumber = null)
    {
        var reservation = new Reservation
        {
            ReservationId = Guid.NewGuid().ToString("N")[..12],
            DrawId = drawId,
            GameTypeId = gameTypeId,
            BettingPoolId = bettingPoolId,
            BetNumber = betNumber ?? "",
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
    public decimal GetReservedAmount(int drawId, int gameTypeId, string betNumber, string? excludeReservationId = null)
    {
        var now = DateTime.UtcNow;
        var total = 0m;
        foreach (var kvp in _reservations)
        {
            var r = kvp.Value;
            if (r.DrawId == drawId && r.GameTypeId == gameTypeId && r.BetNumber == betNumber
                && r.ExpiresAt > now && kvp.Key != excludeReservationId)
                total += r.Amount;
        }
        return total;
    }

    public decimal GetReservedAmountForPool(int drawId, int gameTypeId, string betNumber, int bettingPoolId)
    {
        var now = DateTime.UtcNow;
        var total = 0m;
        foreach (var kvp in _reservations)
        {
            var r = kvp.Value;
            if (r.DrawId == drawId && r.GameTypeId == gameTypeId && r.BetNumber == betNumber
                && r.BettingPoolId == bettingPoolId && r.ExpiresAt > now)
                total += r.Amount;
        }
        return total;
    }

    public decimal GetReservedAmountForZone(int drawId, int gameTypeId, string betNumber, HashSet<int>? zonePoolIds)
    {
        if (zonePoolIds == null) return GetReservedAmount(drawId, gameTypeId, betNumber);
        var now = DateTime.UtcNow;
        var total = 0m;
        foreach (var kvp in _reservations)
        {
            var r = kvp.Value;
            if (r.DrawId == drawId && r.GameTypeId == gameTypeId && r.BetNumber == betNumber
                && zonePoolIds.Contains(r.BettingPoolId) && r.ExpiresAt > now)
                total += r.Amount;
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
        public string BetNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
