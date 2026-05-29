using LotteryApi.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace LotteryApi.Services;

/// <summary>
/// MailKit-backed SMTP sender. Picks SSL-on-connect vs. STARTTLS based on the
/// `UseSslOnConnect` flag in <see cref="SmtpOptions"/> — IONOS on :465 wants
/// the former, generic :587 servers want the latter.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<EmailSendResult> SendAsync(
        string toAddress,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.Host) || string.IsNullOrWhiteSpace(_options.Username))
        {
            _logger.LogError("SMTP not configured: Host/Username missing");
            return new EmailSendResult(false, "SMTP no está configurado en el servidor.");
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
        message.To.Add(MailboxAddress.Parse(toAddress));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient
        {
            Timeout = _options.TimeoutSeconds * 1000,
        };

        try
        {
            var secureSocket = _options.UseSslOnConnect
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            await client.ConnectAsync(_options.Host, _options.Port, secureSocket, cancellationToken);
            await client.AuthenticateAsync(_options.Username, _options.Password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent to {To} — subject: {Subject}", toAddress, subject);
            return new EmailSendResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP send failed for {To}", toAddress);
            // Best-effort cleanup if Connect succeeded but a later step threw.
            try { if (client.IsConnected) await client.DisconnectAsync(true, cancellationToken); }
            catch { /* swallow disconnect errors */ }
            return new EmailSendResult(false, ex.Message);
        }
    }
}
