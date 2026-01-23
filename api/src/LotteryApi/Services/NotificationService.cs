using Microsoft.AspNetCore.SignalR;
using LotteryApi.Hubs;

namespace LotteryApi.Services;

/// <summary>
/// Implementation of notification service using SignalR.
/// Provides methods to broadcast real-time notifications to connected clients.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly IHubContext<LotteryHub, ILotteryHubClient> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IHubContext<LotteryHub, ILotteryHubClient> hubContext,
        ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    // ==================== RESULT NOTIFICATIONS ====================

    public async Task NotifyResultPublished(ResultNotification notification, int? zoneId = null)
    {
        try
        {
            // Notify draw-specific group
            await _hubContext.Clients.Group($"draw_{notification.DrawId}")
                .ResultPublished(notification);

            // Notify zone if specified
            if (zoneId.HasValue)
            {
                await _hubContext.Clients.Group($"zone_{zoneId}")
                    .ResultPublished(notification);
            }

            // Also notify global group
            await _hubContext.Clients.Group("global")
                .ResultPublished(notification);

            _logger.LogInformation(
                "Result notification sent: DrawId={DrawId}, DrawName={DrawName}",
                notification.DrawId, notification.DrawName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending result notification for DrawId={DrawId}", notification.DrawId);
        }
    }

    public async Task NotifyResultsBatchPublished(ResultsBatchNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group("global")
                .ResultsBatchPublished(notification);

            _logger.LogInformation(
                "Batch results notification sent: Count={Count}",
                notification.TotalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending batch results notification");
        }
    }

    // ==================== TICKET NOTIFICATIONS ====================

    public async Task NotifyTicketCreated(TicketNotification notification, int bettingPoolId)
    {
        try
        {
            await _hubContext.Clients.Group($"bettingpool_{bettingPoolId}")
                .TicketCreated(notification);

            _logger.LogDebug(
                "Ticket created notification sent: TicketId={TicketId}, BettingPoolId={BettingPoolId}",
                notification.TicketId, bettingPoolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending ticket created notification for TicketId={TicketId}", notification.TicketId);
        }
    }

    public async Task NotifyTicketCancelled(TicketNotification notification, int bettingPoolId)
    {
        try
        {
            await _hubContext.Clients.Group($"bettingpool_{bettingPoolId}")
                .TicketCancelled(notification);

            _logger.LogDebug(
                "Ticket cancelled notification sent: TicketId={TicketId}, BettingPoolId={BettingPoolId}",
                notification.TicketId, bettingPoolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending ticket cancelled notification for TicketId={TicketId}", notification.TicketId);
        }
    }

    public async Task NotifyTicketWon(TicketWinNotification notification, int bettingPoolId, int? userId = null)
    {
        try
        {
            // Notify the betting pool
            await _hubContext.Clients.Group($"bettingpool_{bettingPoolId}")
                .TicketWon(notification);

            // Also notify the specific user if provided
            if (userId.HasValue)
            {
                await _hubContext.Clients.Group($"user_{userId}")
                    .TicketWon(notification);
            }

            _logger.LogInformation(
                "Ticket won notification sent: TicketId={TicketId}, WinAmount={WinAmount}",
                notification.TicketId, notification.WinAmount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending ticket won notification for TicketId={TicketId}", notification.TicketId);
        }
    }

    public async Task NotifyTicketPaid(TicketNotification notification, int bettingPoolId)
    {
        try
        {
            await _hubContext.Clients.Group($"bettingpool_{bettingPoolId}")
                .TicketPaid(notification);

            _logger.LogDebug(
                "Ticket paid notification sent: TicketId={TicketId}, BettingPoolId={BettingPoolId}",
                notification.TicketId, bettingPoolId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending ticket paid notification for TicketId={TicketId}", notification.TicketId);
        }
    }

    // ==================== LIMIT NOTIFICATIONS ====================

    public async Task NotifyLimitWarning(LimitNotification notification, int drawId)
    {
        try
        {
            await _hubContext.Clients.Group($"draw_{drawId}")
                .LimitWarning(notification);

            _logger.LogInformation(
                "Limit warning notification sent: DrawId={DrawId}, BetNumber={BetNumber}, Percentage={Percentage}%",
                drawId, notification.BetNumber, notification.PercentageUsed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending limit warning notification for DrawId={DrawId}", drawId);
        }
    }

    public async Task NotifyLimitReached(LimitNotification notification, int drawId)
    {
        try
        {
            await _hubContext.Clients.Group($"draw_{drawId}")
                .LimitReached(notification);

            // Also notify global for monitoring purposes
            await _hubContext.Clients.Group("global")
                .LimitReached(notification);

            _logger.LogWarning(
                "Limit reached notification sent: DrawId={DrawId}, BetNumber={BetNumber}",
                drawId, notification.BetNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending limit reached notification for DrawId={DrawId}", drawId);
        }
    }

    public async Task NotifyLimitUpdated(LimitUpdateNotification notification, int drawId)
    {
        try
        {
            await _hubContext.Clients.Group($"draw_{drawId}")
                .LimitUpdated(notification);

            _logger.LogDebug(
                "Limit updated notification sent: DrawId={DrawId}, BetNumber={BetNumber}, Available={Available}",
                drawId, notification.BetNumber, notification.AvailableAmount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending limit updated notification for DrawId={DrawId}", drawId);
        }
    }

    // ==================== DRAW NOTIFICATIONS ====================

    public async Task NotifyDrawClosingSoon(DrawNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group($"draw_{notification.DrawId}")
                .DrawClosingSoon(notification);

            await _hubContext.Clients.Group("global")
                .DrawClosingSoon(notification);

            _logger.LogInformation(
                "Draw closing soon notification sent: DrawId={DrawId}, MinutesRemaining={Minutes}",
                notification.DrawId, notification.MinutesRemaining);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending draw closing notification for DrawId={DrawId}", notification.DrawId);
        }
    }

    public async Task NotifyDrawClosed(DrawNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group($"draw_{notification.DrawId}")
                .DrawClosed(notification);

            await _hubContext.Clients.Group("global")
                .DrawClosed(notification);

            _logger.LogInformation(
                "Draw closed notification sent: DrawId={DrawId}, DrawName={DrawName}",
                notification.DrawId, notification.DrawName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending draw closed notification for DrawId={DrawId}", notification.DrawId);
        }
    }

    public async Task NotifyDrawOpened(DrawNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group("global")
                .DrawOpened(notification);

            _logger.LogInformation(
                "Draw opened notification sent: DrawId={DrawId}, DrawName={DrawName}",
                notification.DrawId, notification.DrawName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending draw opened notification for DrawId={DrawId}", notification.DrawId);
        }
    }

    // ==================== SALES NOTIFICATIONS ====================

    public async Task NotifySalesUpdate(SalesUpdateNotification notification, int? bettingPoolId = null, int? zoneId = null)
    {
        try
        {
            if (bettingPoolId.HasValue)
            {
                await _hubContext.Clients.Group($"bettingpool_{bettingPoolId}")
                    .SalesUpdate(notification);
            }

            if (zoneId.HasValue)
            {
                await _hubContext.Clients.Group($"zone_{zoneId}")
                    .SalesUpdate(notification);
            }

            _logger.LogDebug(
                "Sales update notification sent: BettingPoolId={BettingPoolId}, ZoneId={ZoneId}, TotalSales={TotalSales}",
                bettingPoolId, zoneId, notification.TotalSales);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending sales update notification");
        }
    }

    public async Task NotifyHotNumber(HotNumberNotification notification, int drawId)
    {
        try
        {
            await _hubContext.Clients.Group($"draw_{drawId}")
                .HotNumberAlert(notification);

            _logger.LogInformation(
                "Hot number alert sent: DrawId={DrawId}, BetNumber={BetNumber}, Amount={Amount}",
                drawId, notification.BetNumber, notification.TotalBetAmount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending hot number notification for DrawId={DrawId}", drawId);
        }
    }

    // ==================== SYSTEM NOTIFICATIONS ====================

    public async Task NotifySystemAnnouncement(SystemNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group("global")
                .SystemAnnouncement(notification);

            _logger.LogInformation(
                "System announcement sent: Title={Title}, Severity={Severity}",
                notification.Title, notification.Severity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending system announcement");
        }
    }

    public async Task NotifyUser(int userId, GenericNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group($"user_{userId}")
                .Notify(notification);

            _logger.LogDebug(
                "Notification sent to user: UserId={UserId}, EventName={EventName}",
                userId, notification.EventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to UserId={UserId}", userId);
        }
    }

    public async Task NotifyBettingPool(int bettingPoolId, GenericNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group($"bettingpool_{bettingPoolId}")
                .Notify(notification);

            _logger.LogDebug(
                "Notification sent to betting pool: BettingPoolId={BettingPoolId}, EventName={EventName}",
                bettingPoolId, notification.EventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to BettingPoolId={BettingPoolId}", bettingPoolId);
        }
    }

    public async Task NotifyZone(int zoneId, GenericNotification notification)
    {
        try
        {
            await _hubContext.Clients.Group($"zone_{zoneId}")
                .Notify(notification);

            _logger.LogDebug(
                "Notification sent to zone: ZoneId={ZoneId}, EventName={EventName}",
                zoneId, notification.EventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to ZoneId={ZoneId}", zoneId);
        }
    }
}
