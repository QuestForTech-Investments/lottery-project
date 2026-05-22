namespace LotteryApi.Exceptions;

/// <summary>
/// Exception para cuando no se encuentra un recurso
/// </summary>
public class NotFoundException : BusinessException
{
    public NotFoundException(string resource, object id)
        : base("NOT_FOUND", $"{resource} con ID '{id}' no fue encontrado", 404, new { resource, id })
    {
    }

    public NotFoundException(string message)
        : base(message, 404)
    {
    }

    public NotFoundException(string errorCode, string message)
        : base(errorCode, message, 404)
    {
    }
}
