using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class CreateBettingPoolDtoValidator : AbstractValidator<CreateBettingPoolDto>
{
    public CreateBettingPoolDtoValidator()
    {
        RuleFor(x => x.BettingPoolName)
            .NotEmpty().WithMessage("El nombre de la banca es requerido")
            .MinimumLength(1).WithMessage("El nombre debe tener al menos 1 carácter")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres");

        RuleFor(x => x.BettingPoolCode)
            .NotEmpty().WithMessage("El código de la banca es requerido")
            .MinimumLength(1).WithMessage("El código debe tener al menos 1 carácter")
            .MaximumLength(20).WithMessage("El código no puede exceder 20 caracteres")
            .Matches("^[A-Z0-9\\-]+$").WithMessage("El código solo puede contener letras mayúsculas, números y guiones");

        RuleFor(x => x.ZoneId)
            .NotEmpty().WithMessage("La zona es requerida")
            .GreaterThan(0).WithMessage("Debe seleccionar una zona válida");

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

        // If Username is provided, Password should also be provided
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida cuando se proporciona un nombre de usuario")
            .When(x => !string.IsNullOrWhiteSpace(x.Username));
    }
}
