using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class AdminResetPasswordDtoValidator : AbstractValidator<AdminResetPasswordDto>
{
    public AdminResetPasswordDtoValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("La nueva contraseña es requerida")
            .MinimumLength(6).WithMessage("La nueva contraseña debe tener al menos 6 caracteres")
            .MaximumLength(100).WithMessage("La nueva contraseña no puede exceder 100 caracteres");
    }
}
