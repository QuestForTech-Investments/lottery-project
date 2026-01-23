using LotteryApi.Hubs;

namespace LotteryApi.Services;

/// <summary>
/// Service interface for sending real-time notifications via SignalR.
/// </summary>
public interface INotificationService
{
    // ==================== RESULT NOTIFICATIONS ====================

    /// <summary>
    /// Broadcast a result publication to all clients or specific groups.
    /// </summary>
    Task NotifyResultPublished(ResultNotification notification, int? zoneId = null);

    /// <summary>
    /// Broadcast multiple results at once.
    /// </summary>
    Task NotifyResultsBatchPublished(ResultsBatchNotification notification);

    // ==================== TICKET NOTIFICATIONS ====================

    /// <summary>
    /// Notify when a ticket is created.
    /// </summary>
    Task NotifyTicketCreated(TicketNotification notification, int bettingPoolId);

    /// <summary>
    /// Notify when a ticket is cancelled.
    /// </summary>
    Task NotifyTicketCancelled(TicketNotification notification, int bettingPoolId);

    /// <summary>
    /// Notify when a ticket wins.
    /// </summary>
    Task NotifyTicketWon(TicketWinNotification notification, int bettingPoolId, int? userId = null);

    /// <summary>
    /// Notify when a ticket is paid.
    /// </summary>
    Task NotifyTicketPaid(TicketNotification notification, int bettingPoolId);

    // ==================== LIMIT NOTIFICATIONS ====================

    /// <summary>
    /// Notify when a number is approaching its limit.
    /// </summary>
    Task NotifyLimitWarning(LimitNotification notification, int drawId);

    /// <summary>
    /// Notify when a number has reached its limit.
    /// </summary>
    Task NotifyLimitReached(LimitNotification notification, int drawId);

    /// <summary>
    /// Notify when limit availability changes.
    /// </summary>
    Task NotifyLimitUpdated(LimitUpdateNotification notification, int drawId);

    // ==================== DRAW NOTIFICATIONS ====================

    /// <summary>
    /// Notify when a draw is about to close.
    /// </summary>
    Task NotifyDrawClosingSoon(DrawNotification notification);

    /// <summary>
    /// Notify when a draw has closed.
    /// </summary>
    Task NotifyDrawClosed(DrawNotification notification);

    /// <summary>
    /// Notify when a draw has opened.
    /// </summary>
    Task NotifyDrawOpened(DrawNotification notification);

    // ==================== SALES NOTIFICATIONS ====================

    /// <summary>
    /// Send sales update to specific betting pool or zone.
    /// </summary>
    Task NotifySalesUpdate(SalesUpdateNotification notification, int? bettingPoolId = null, int? zoneId = null);

    /// <summary>
    /// Notify about a hot number.
    /// </summary>
    Task NotifyHotNumber(HotNumberNotification notification, int drawId);

    // ==================== SYSTEM NOTIFICATIONS ====================

    /// <summary>
    /// Send a system-wide announcement.
    /// </summary>
    Task NotifySystemAnnouncement(SystemNotification notification);

    /// <summary>
    /// Send a notification to a specific user.
    /// </summary>
    Task NotifyUser(int userId, GenericNotification notification);

    /// <summary>
    /// Send a notification to a specific betting pool.
    /// </summary>
    Task NotifyBettingPool(int bettingPoolId, GenericNotification notification);

    /// <summary>
    /// Send a notification to a specific zone.
    /// </summary>
    Task NotifyZone(int zoneId, GenericNotification notification);
}
