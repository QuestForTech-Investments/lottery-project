namespace LotteryApi.Exceptions;

/// <summary>
/// Exception base para errores de lógica de negocio
/// </summary>
public class BusinessException : Exception
{
    public int StatusCode { get; set; }
    public object? Errors { get; set; }

    public BusinessException(string message, int statusCode = 400, object? errors = null)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors;
    }
}
