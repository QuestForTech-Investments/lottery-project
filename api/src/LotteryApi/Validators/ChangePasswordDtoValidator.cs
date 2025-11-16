using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordDtoValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("La contraseña actual es requerida");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("La nueva contraseña es requerida")
            .MinimumLength(6).WithMessage("La nueva contraseña debe tener al menos 6 caracteres")
            .MaximumLength(100).WithMessage("La nueva contraseña no puede exceder 100 caracteres")
            .NotEqual(x => x.CurrentPassword).WithMessage("La nueva contraseña debe ser diferente a la actual");
    }
}
