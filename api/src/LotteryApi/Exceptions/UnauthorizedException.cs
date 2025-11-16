namespace LotteryApi.Exceptions;

/// <summary>
/// Exception para errores de autorización
/// </summary>
public class UnauthorizedException : BusinessException
{
    public UnauthorizedException(string message = "No está autorizado para realizar esta acción")
        : base(message, 401)
    {
    }
}
