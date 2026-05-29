namespace LotteryApi.Services;

/// <summary>
/// Sends transactional emails (notifications, reports, etc.). Implementations
/// own the transport choice (SMTP, SendGrid API, …). Callers should pass the
/// HTML body pre-built — the builder for the play monitoring email lives in
/// PlayMonitoringEmailBuilder.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an HTML email. Returns the outcome rather than throwing so callers
    /// (e.g. the publication-trigger background task) can log per-receiver
    /// failures without aborting the whole batch.
    /// </summary>
    Task<EmailSendResult> SendAsync(
        string toAddress,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default);
}

public record EmailSendResult(bool Success, string? ErrorMessage = null);
