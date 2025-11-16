namespace LotteryApi.Exceptions;

/// <summary>
/// Exception para cuando no se encuentra un recurso
/// </summary>
public class NotFoundException : BusinessException
{
    public NotFoundException(string resource, object id)
        : base($"{resource} con ID '{id}' no fue encontrado", 404)
    {
    }

    public NotFoundException(string message)
        : base(message, 404)
    {
    }
}
