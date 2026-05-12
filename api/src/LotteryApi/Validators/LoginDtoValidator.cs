using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        // Login should only validate presence + sane upper bounds. Length/strength
        // rules belong on registration/change-password — enforcing them here turns
        // every bad password into a 400 (and leaks the min-length to attackers).
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .MaximumLength(100).WithMessage("Username too long");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MaximumLength(200).WithMessage("Password too long");
    }
}
