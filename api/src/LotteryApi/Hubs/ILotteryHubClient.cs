namespace LotteryApi.Hubs;

/// <summary>
/// Strongly-typed interface for SignalR client methods.
/// These are the methods that can be called on connected clients.
/// </summary>
public interface ILotteryHubClient
{
    // ==================== RESULT NOTIFICATIONS ====================

    /// <summary>
    /// Notifies clients when a new lottery result is published.
    /// </summary>
    Task ResultPublished(ResultNotification notification);

    /// <summary>
    /// Notifies clients when multiple results are published at once.
    /// </summary>
    Task ResultsBatchPublished(ResultsBatchNotification notification);

    // ==================== TICKET NOTIFICATIONS ====================

    /// <summary>
    /// Notifies when a new ticket is created.
    /// </summary>
    Task TicketCreated(TicketNotification notification);

    /// <summary>
    /// Notifies when a ticket is cancelled.
    /// </summary>
    Task TicketCancelled(TicketNotification notification);

    /// <summary>
    /// Notifies when a ticket wins.
    /// </summary>
    Task TicketWon(TicketWinNotification notification);

    /// <summary>
    /// Notifies when a ticket is paid out.
    /// </summary>
    Task TicketPaid(TicketNotification notification);

    // ==================== LIMIT NOTIFICATIONS ====================

    /// <summary>
    /// Notifies when a number is approaching its limit.
    /// </summary>
    Task LimitWarning(LimitNotification notification);

    /// <summary>
    /// Notifies when a number has reached its limit.
    /// </summary>
    Task LimitReached(LimitNotification notification);

    /// <summary>
    /// Notifies when limit availability changes for a number.
    /// </summary>
    Task LimitUpdated(LimitUpdateNotification notification);

    // ==================== DRAW NOTIFICATIONS ====================

    /// <summary>
    /// Notifies when a draw is about to close.
    /// </summary>
    Task DrawClosingSoon(DrawNotification notification);

    /// <summary>
    /// Notifies when a draw has closed.
    /// </summary>
    Task DrawClosed(DrawNotification notification);

    /// <summary>
    /// Notifies when a draw has opened.
    /// </summary>
    Task DrawOpened(DrawNotification notification);

    // ==================== SALES NOTIFICATIONS ====================

    /// <summary>
    /// Real-time sales update (aggregated).
    /// </summary>
    Task SalesUpdate(SalesUpdateNotification notification);

    /// <summary>
    /// Hot number alert (number receiving heavy betting).
    /// </summary>
    Task HotNumberAlert(HotNumberNotification notification);

    // ==================== SYSTEM NOTIFICATIONS ====================

    /// <summary>
    /// System-wide announcement.
    /// </summary>
    Task SystemAnnouncement(SystemNotification notification);

    /// <summary>
    /// Pong response for connection health check.
    /// </summary>
    Task Pong(DateTime serverTime);

    /// <summary>
    /// Generic notification for extensibility.
    /// </summary>
    Task Notify(GenericNotification notification);
}

// ==================== NOTIFICATION DTOs ====================

/// <summary>
/// Base class for all notifications.
/// </summary>
public abstract class BaseNotification
{
    public string NotificationId { get; set; } = Guid.NewGuid().ToString();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Type { get; set; } = string.Empty;
}

/// <summary>
/// Notification when a lottery result is published.
/// </summary>
public class ResultNotification : BaseNotification
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public DateTime DrawDate { get; set; }
    public string? WinningNumber { get; set; }
    public string? SecondNumber { get; set; }
    public string? ThirdNumber { get; set; }

    public ResultNotification()
    {
        Type = "ResultPublished";
    }
}

/// <summary>
/// Notification when multiple results are published.
/// </summary>
public class ResultsBatchNotification : BaseNotification
{
    public List<ResultNotification> Results { get; set; } = new();
    public int TotalCount => Results.Count;

    public ResultsBatchNotification()
    {
        Type = "ResultsBatchPublished";
    }
}

/// <summary>
/// Notification for ticket events.
/// </summary>
public class TicketNotification : BaseNotification
{
    public long TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int LineCount { get; set; }

    public TicketNotification()
    {
        Type = "TicketEvent";
    }
}

/// <summary>
/// Notification when a ticket wins.
/// </summary>
public class TicketWinNotification : TicketNotification
{
    public decimal WinAmount { get; set; }
    public int WinningLines { get; set; }
    public List<WinningLineInfo> WinningLinesDetail { get; set; } = new();

    public TicketWinNotification()
    {
        Type = "TicketWon";
    }
}

/// <summary>
/// Detail of a winning line.
/// </summary>
public class WinningLineInfo
{
    public string BetNumber { get; set; } = string.Empty;
    public string BetTypeName { get; set; } = string.Empty;
    public decimal BetAmount { get; set; }
    public decimal WinAmount { get; set; }
    public string DrawName { get; set; } = string.Empty;
}

/// <summary>
/// Notification for limit events.
/// </summary>
public class LimitNotification : BaseNotification
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public string BetNumber { get; set; } = string.Empty;
    public int? BetTypeId { get; set; }
    public string? BetTypeName { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal LimitAmount { get; set; }
    public decimal AvailableAmount { get; set; }
    public decimal PercentageUsed { get; set; }

    public LimitNotification()
    {
        Type = "LimitEvent";
    }
}

/// <summary>
/// Notification when limit availability changes.
/// </summary>
public class LimitUpdateNotification : BaseNotification
{
    public int DrawId { get; set; }
    public string BetNumber { get; set; } = string.Empty;
    public decimal AvailableAmount { get; set; }
    public decimal PercentageUsed { get; set; }
    public bool IsBlocked { get; set; }

    public LimitUpdateNotification()
    {
        Type = "LimitUpdated";
    }
}

/// <summary>
/// Notification for draw events.
/// </summary>
public class DrawNotification : BaseNotification
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public DateTime DrawDate { get; set; }
    public TimeSpan? ClosingTime { get; set; }
    public int? MinutesRemaining { get; set; }

    public DrawNotification()
    {
        Type = "DrawEvent";
    }
}

/// <summary>
/// Notification for sales updates.
/// </summary>
public class SalesUpdateNotification : BaseNotification
{
    public int? BettingPoolId { get; set; }
    public int? ZoneId { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalCommissions { get; set; }
    public int TicketCount { get; set; }
    public decimal NetSales { get; set; }

    public SalesUpdateNotification()
    {
        Type = "SalesUpdate";
    }
}

/// <summary>
/// Notification for hot numbers.
/// </summary>
public class HotNumberNotification : BaseNotification
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public string BetNumber { get; set; } = string.Empty;
    public decimal TotalBetAmount { get; set; }
    public int BetCount { get; set; }
    public bool IsNearLimit { get; set; }
    public bool IsAtLimit { get; set; }

    public HotNumberNotification()
    {
        Type = "HotNumberAlert";
    }
}

/// <summary>
/// System-wide notification.
/// </summary>
public class SystemNotification : BaseNotification
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = "info"; // info, warning, error, success
    public bool RequiresAction { get; set; } = false;
    public string? ActionUrl { get; set; }

    public SystemNotification()
    {
        Type = "SystemAnnouncement";
    }
}

/// <summary>
/// Generic notification for extensibility.
/// </summary>
public class GenericNotification : BaseNotification
{
    public string EventName { get; set; } = string.Empty;
    public Dictionary<string, object> Data { get; set; } = new();

    public GenericNotification()
    {
        Type = "Generic";
    }
}
