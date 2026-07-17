namespace LotteryApi.Configuration;

/// <summary>
/// Settings for the cross-tenant public API ("/api/public/v1/*"). These
/// endpoints are NOT JWT-authenticated — they validate a shared
/// <see cref="CentralKey"/> sent as the <c>X-Central-Key</c> header. Used by
/// La Central (and any future "super-tenant") to read today's sales summary
/// from this tenant without going through a user session.
///
/// The actual key value lives in appsettings.Development.json /
/// Production.json (both gitignored). Base appsettings.json only carries
/// the shape so partners know what fields to expect.
/// </summary>
public class PublicApiOptions
{
    public const string SectionName = "PublicApi";

    /// <summary>
    /// 64+ random chars. Compared in constant-time against the
    /// <c>X-Central-Key</c> header. Empty disables the endpoints entirely.
    /// </summary>
    public string CentralKey { get; set; } = string.Empty;

    /// <summary>Short slug identifying this tenant in cross-tenant payloads
    /// (e.g. "lottobook", "lacentral").</summary>
    public string TenantCode { get; set; } = string.Empty;

    /// <summary>Display name returned in cross-tenant responses.</summary>
    public string TenantName { get; set; } = string.Empty;

    /// <summary>ISO 4217 currency for monetary totals.</summary>
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// This tenant's admin frontend base URL — used to build deep links in
    /// automated emails ("Ver en …" buttons). Defaults to the Lottobook
    /// production domain so the original tenant needs no extra config;
    /// other tenants set PublicApi__FrontendBaseUrl on their App Service
    /// (e.g. https://lacentralnumbers.com).
    /// </summary>
    public string FrontendBaseUrl { get; set; } = "https://lottobook.net";
}
