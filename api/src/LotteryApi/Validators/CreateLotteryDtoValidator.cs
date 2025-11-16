using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class CreateLotteryDtoValidator : AbstractValidator<CreateLotteryDto>
{
    public CreateLotteryDtoValidator()
    {
        RuleFor(x => x.CountryId)
            .GreaterThan(0).WithMessage("Country ID must be greater than 0");

        RuleFor(x => x.LotteryName)
            .NotEmpty().WithMessage("Lottery name is required")
            .MaximumLength(100).WithMessage("Lottery name cannot exceed 100 characters");

        RuleFor(x => x.LotteryType)
            .MaximumLength(50).WithMessage("Lottery type cannot exceed 50 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");
    }
}
