namespace LotteryApi.Exceptions;

/// <summary>
/// Exception para cuando se intenta crear un recurso duplicado
/// </summary>
public class DuplicateException : BusinessException
{
    public DuplicateException(string resource, string field, object value)
        : base("DUPLICATE_RESOURCE", $"{resource} con {field} '{value}' ya existe", 409, new { resource, field, value })
    {
    }

    public DuplicateException(string message)
        : base(message, 409)
    {
    }

    public DuplicateException(string errorCode, string message)
        : base(errorCode, message, 409)
    {
    }
}
