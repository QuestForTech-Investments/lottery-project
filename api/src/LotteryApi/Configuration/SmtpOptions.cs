namespace LotteryApi.Configuration;

/// <summary>
/// SMTP connection settings, bound from the "Smtp" section of appsettings.
/// Real credentials live in appsettings.Development.json / Production.json
/// (both gitignored) — the base appsettings.json only carries the shape.
/// </summary>
public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 465;
    /// <summary>true when the port speaks TLS from the first byte (IONOS:465).
    /// false ⇒ STARTTLS upgrade after EHLO (e.g. port 587).</summary>
    public bool UseSslOnConnect { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "Lottobook";
    /// <summary>SMTP-level timeout for the whole transaction.</summary>
    public int TimeoutSeconds { get; set; } = 30;
}
