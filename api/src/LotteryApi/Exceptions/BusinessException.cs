namespace LotteryApi.Exceptions;

/// <summary>
/// Exception base para errores de lógica de negocio.
///
/// Carries a stable <see cref="ErrorCode"/> the frontend maps to a translated
/// message. The <c>Message</c> field is the Spanish fallback for legacy throws
/// or when the frontend doesn't yet have a translation registered for the code.
/// </summary>
public class BusinessException : Exception
{
    public int StatusCode { get; set; }
    public object? Errors { get; set; }

    /// <summary>
    /// Stable, language-agnostic identifier (e.g. "USER_NOT_FOUND"). Null for
    /// legacy throws that pre-date the i18n migration.
    /// </summary>
    public string? ErrorCode { get; set; }

    public BusinessException(string message, int statusCode = 400, object? errors = null)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors;
    }

    public BusinessException(string errorCode, string message, int statusCode = 400, object? errors = null)
        : base(message)
    {
        ErrorCode = errorCode;
        StatusCode = statusCode;
        Errors = errors;
    }
}
