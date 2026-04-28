using LotteryApi.Models;

namespace LotteryApi.Services.Warnings;

/// <summary>
/// Canonical warning type codes. Frontend filters/groups by these strings.
/// </summary>
public static class WarningTypes
{
    public const string TicketCreatedLate          = "TICKET_CREATED_LATE";
    public const string TicketCancelledLate        = "TICKET_CANCELLED_LATE";
    public const string TicketCancelledAfterDraw   = "TICKET_CANCELLED_AFTER_DRAW";
    public const string TicketWinnerCancelled      = "TICKET_WINNER_CANCELLED";
    public const string TicketBypassValidation     = "TICKET_BYPASS_VALIDATION";
    public const string ResultChangedAfterPrizes   = "RESULT_CHANGED_AFTER_PRIZES";
    public const string ResultPublicationLate      = "RESULT_PUBLICATION_LATE";
}

public interface IWarningService
{
    /// <summary>
    /// Persist a warning. Failures are swallowed and logged so the primary
    /// flow is never broken by audit logging.
    /// </summary>
    Task RecordAsync(
        string type,
        string? message,
        int? bettingPoolId,
        int? userId,
        string? referenceId,
        string? referenceType,
        string severity = "medium",
        object? metadata = null,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        string type,
        string referenceId,
        string referenceType,
        CancellationToken cancellationToken = default);
}
