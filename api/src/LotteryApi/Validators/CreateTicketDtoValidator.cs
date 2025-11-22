using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

/// <summary>
/// Validator for CreateTicketLineDto
/// </summary>
public class CreateTicketLineDtoValidator : AbstractValidator<CreateTicketLineDto>
{
    public CreateTicketLineDtoValidator()
    {
        // LotteryId no es necesario, se obtiene a través de Draw.LotteryId

        RuleFor(x => x.DrawId)
            .GreaterThan(0)
            .WithMessage("El ID de sorteo debe ser mayor que 0");

        RuleFor(x => x.BetNumber)
            .NotEmpty()
            .WithMessage("El número de apuesta es requerido")
            .MaximumLength(20)
            .WithMessage("El número de apuesta no puede exceder 20 caracteres")
            .Matches(@"^[0-9]+$")
            .WithMessage("El número de apuesta solo debe contener dígitos");

        RuleFor(x => x.BetTypeId)
            .GreaterThan(0)
            .WithMessage("El ID de tipo de apuesta debe ser mayor que 0");

        RuleFor(x => x.BetAmount)
            .GreaterThan(0)
            .WithMessage("El monto de apuesta debe ser mayor que 0")
            .LessThanOrEqualTo(999999.99m)
            .WithMessage("El monto de apuesta no puede exceder 999,999.99");

        RuleFor(x => x.Multiplier)
            .GreaterThanOrEqualTo(1.00m)
            .WithMessage("El multiplicador debe ser al menos 1.00")
            .LessThanOrEqualTo(100.00m)
            .WithMessage("El multiplicador no puede exceder 100.00");

        RuleFor(x => x.Position)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Position.HasValue)
            .WithMessage("La posición debe ser mayor o igual a 0");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Notes))
            .WithMessage("Las notas no pueden exceder 500 caracteres");
    }
}

/// <summary>
/// Validator for CreateTicketDto
/// </summary>
public class CreateTicketDtoValidator : AbstractValidator<CreateTicketDto>
{
    public CreateTicketDtoValidator()
    {
        RuleFor(x => x.BettingPoolId)
            .GreaterThan(0)
            .WithMessage("El ID de banca es requerido y debe ser mayor que 0");

        RuleFor(x => x.UserId)
            .GreaterThan(0)
            .WithMessage("El ID de usuario es requerido y debe ser mayor que 0");

        RuleFor(x => x.Lines)
            .NotEmpty()
            .WithMessage("Debe incluir al menos una línea de apuesta")
            .Must(lines => lines != null && lines.Count > 0)
            .WithMessage("Debe incluir al menos una línea de apuesta")
            .Must(lines => lines == null || lines.Count <= 100)
            .WithMessage("No puede incluir más de 100 líneas por ticket");

        RuleForEach(x => x.Lines)
            .SetValidator(new CreateTicketLineDtoValidator());

        RuleFor(x => x.GlobalMultiplier)
            .GreaterThanOrEqualTo(1.00m)
            .WithMessage("El multiplicador global debe ser al menos 1.00")
            .LessThanOrEqualTo(100.00m)
            .WithMessage("El multiplicador global no puede exceder 100.00");

        RuleFor(x => x.GlobalDiscount)
            .GreaterThanOrEqualTo(0.00m)
            .WithMessage("El descuento global debe ser mayor o igual a 0")
            .LessThanOrEqualTo(99.99m)
            .WithMessage("El descuento global no puede exceder 99.99%");

        RuleFor(x => x.TerminalId)
            .MaximumLength(20)
            .When(x => !string.IsNullOrEmpty(x.TerminalId))
            .WithMessage("El ID de terminal no puede exceder 20 caracteres");

        RuleFor(x => x.IpAddress)
            .MaximumLength(45)
            .When(x => !string.IsNullOrEmpty(x.IpAddress))
            .WithMessage("La dirección IP no puede exceder 45 caracteres")
            .Matches(@"^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$")
            .When(x => !string.IsNullOrEmpty(x.IpAddress))
            .WithMessage("La dirección IP no tiene un formato válido");

        RuleFor(x => x.CustomerName)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.CustomerName))
            .WithMessage("El nombre del cliente no puede exceder 100 caracteres");

        RuleFor(x => x.CustomerPhone)
            .MaximumLength(20)
            .When(x => !string.IsNullOrEmpty(x.CustomerPhone))
            .WithMessage("El teléfono del cliente no puede exceder 20 caracteres");

        RuleFor(x => x.CustomerEmail)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail))
            .WithMessage("El email del cliente no puede exceder 100 caracteres")
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail))
            .WithMessage("El email del cliente no tiene un formato válido");

        RuleFor(x => x.CustomerIdNumber)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.CustomerIdNumber))
            .WithMessage("El número de identificación no puede exceder 50 caracteres");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Notes))
            .WithMessage("Las notas no pueden exceder 500 caracteres");
    }
}

/// <summary>
/// Validator for CancelTicketDto
/// </summary>
public class CancelTicketDtoValidator : AbstractValidator<CancelTicketDto>
{
    public CancelTicketDtoValidator()
    {
        RuleFor(x => x.CancellationReason)
            .NotEmpty()
            .WithMessage("La razón de cancelación es requerida")
            .MaximumLength(200)
            .WithMessage("La razón de cancelación no puede exceder 200 caracteres");

        RuleFor(x => x.CancelledBy)
            .GreaterThan(0)
            .WithMessage("El ID del usuario que cancela es requerido");
    }
}

/// <summary>
/// Validator for PayTicketDto
/// </summary>
public class PayTicketDtoValidator : AbstractValidator<PayTicketDto>
{
    public PayTicketDtoValidator()
    {
        RuleFor(x => x.PaidBy)
            .GreaterThan(0)
            .WithMessage("El ID del usuario que paga es requerido");

        RuleFor(x => x.PaymentMethod)
            .NotEmpty()
            .WithMessage("El método de pago es requerido")
            .MaximumLength(50)
            .WithMessage("El método de pago no puede exceder 50 caracteres")
            .Must(method => new[] { "cash", "transfer", "check", "card" }.Contains(method.ToLower()))
            .WithMessage("El método de pago debe ser: cash, transfer, check o card");

        RuleFor(x => x.PaymentReference)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.PaymentReference))
            .WithMessage("La referencia de pago no puede exceder 100 caracteres");
    }
}

/// <summary>
/// Validator for TicketFilterDto
/// </summary>
public class TicketFilterDtoValidator : AbstractValidator<TicketFilterDto>
{
    public TicketFilterDtoValidator()
    {
        // At least one filter must be provided
        RuleFor(x => x)
            .Must(filter =>
                filter.BettingPoolId.HasValue ||
                filter.LotteryId.HasValue ||
                filter.Date.HasValue ||
                (filter.ZoneIds != null && filter.ZoneIds.Count > 0) ||
                !string.IsNullOrEmpty(filter.Status) ||
                !string.IsNullOrEmpty(filter.Search))
            .WithMessage("Debe proporcionar al menos un filtro (banca, lotería, fecha, zona, estado o búsqueda)");

        RuleFor(x => x.BettingPoolId)
            .GreaterThan(0)
            .When(x => x.BettingPoolId.HasValue)
            .WithMessage("El ID de banca debe ser mayor que 0");

        RuleFor(x => x.LotteryId)
            .GreaterThan(0)
            .When(x => x.LotteryId.HasValue)
            .WithMessage("El ID de lotería debe ser mayor que 0");

        RuleFor(x => x.BetTypeId)
            .GreaterThan(0)
            .When(x => x.BetTypeId.HasValue)
            .WithMessage("El ID de tipo de apuesta debe ser mayor que 0");

        RuleFor(x => x.BetNumber)
            .MaximumLength(20)
            .When(x => !string.IsNullOrEmpty(x.BetNumber))
            .WithMessage("El número de apuesta no puede exceder 20 caracteres");

        RuleFor(x => x.ZoneIds)
            .Must(zones => zones == null || zones.All(z => z > 0))
            .When(x => x.ZoneIds != null)
            .WithMessage("Todos los IDs de zona deben ser mayores que 0");

        RuleFor(x => x.Status)
            .Must(status => new[] { "all", "winner", "pending", "loser", "cancelled" }.Contains(status.ToLower()))
            .When(x => !string.IsNullOrEmpty(x.Status))
            .WithMessage("El estado debe ser: all, winner, pending, loser o cancelled");

        RuleFor(x => x.Search)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.Search))
            .WithMessage("El término de búsqueda no puede exceder 100 caracteres");

        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("El número de página debe ser mayor que 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0)
            .WithMessage("El tamaño de página debe ser mayor que 0")
            .LessThanOrEqualTo(100)
            .WithMessage("El tamaño de página no puede exceder 100");
    }
}
