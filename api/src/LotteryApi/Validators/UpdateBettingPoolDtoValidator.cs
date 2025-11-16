using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class UpdateBettingPoolDtoValidator : AbstractValidator<UpdateBettingPoolDto>
{
    public UpdateBettingPoolDtoValidator()
    {
        RuleFor(x => x.BettingPoolName)
            .MinimumLength(1).WithMessage("El nombre debe tener al menos 1 carácter")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.BettingPoolName));

        RuleFor(x => x.ZoneId)
            .GreaterThan(0).WithMessage("Debe seleccionar una zona válida")
            .When(x => x.ZoneId.HasValue);

        RuleFor(x => x.BankId)
            .GreaterThan(0).WithMessage("El ID del banco debe ser mayor a 0")
            .When(x => x.BankId.HasValue);

        RuleFor(x => x.Address)
            .MaximumLength(255).WithMessage("La dirección no puede exceder 255 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Address));

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("El teléfono no puede exceder 20 caracteres")
            .Matches(@"^[\d\s\-\(\)\+]+$").WithMessage("El teléfono solo puede contener números y caracteres: + - ( ) espacios")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.Location)
            .MaximumLength(255).WithMessage("La ubicación no puede exceder 255 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Location));

        RuleFor(x => x.Reference)
            .MaximumLength(255).WithMessage("La referencia no puede exceder 255 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Reference));

        RuleFor(x => x.Username)
            .MaximumLength(100).WithMessage("El nombre de usuario no puede exceder 100 caracteres")
            .Matches("^[a-zA-Z0-9_.-]+$").WithMessage("El nombre de usuario solo puede contener letras, números y ._-")
            .When(x => !string.IsNullOrWhiteSpace(x.Username));

        RuleFor(x => x.Password)
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres")
            .MaximumLength(255).WithMessage("La contraseña no puede exceder 255 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Password));
    }
}
