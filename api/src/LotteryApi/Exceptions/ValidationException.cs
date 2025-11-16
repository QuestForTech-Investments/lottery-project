namespace LotteryApi.Exceptions;

/// <summary>
/// Exception para errores de validación
/// </summary>
public class ValidationException : BusinessException
{
    public ValidationException(string message, object? errors = null)
        : base(message, 422, errors)
    {
    }

    public ValidationException(Dictionary<string, string[]> validationErrors)
        : base("Uno o más errores de validación ocurrieron", 422, new { errors = validationErrors })
    {
    }
}
