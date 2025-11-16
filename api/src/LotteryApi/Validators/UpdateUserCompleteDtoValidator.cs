using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class UpdateUserCompleteDtoValidator : AbstractValidator<UpdateUserCompleteDto>
{
    public UpdateUserCompleteDtoValidator()
    {
        RuleFor(x => x.FullName)
            .MaximumLength(200).WithMessage("El nombre completo no puede exceder 200 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.FullName));

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Formato de email inválido")
            .MaximumLength(100).WithMessage("El email no puede exceder 100 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("El teléfono no puede exceder 20 caracteres")
            .Matches(@"^[\d\s\-\(\)\+]+$").WithMessage("El teléfono solo puede contener números y caracteres: + - ( ) espacios")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.RoleId)
            .GreaterThan(0).WithMessage("El ID del rol debe ser mayor a 0")
            .When(x => x.RoleId.HasValue);

        RuleFor(x => x.CommissionRate)
            .InclusiveBetween(0, 100).WithMessage("La tasa de comisión debe estar entre 0 y 100")
            .When(x => x.CommissionRate.HasValue);

        RuleFor(x => x.ZoneIds)
            .Must(zones => zones == null || zones.All(id => id > 0))
            .WithMessage("Todos los IDs de zona deben ser mayores a 0")
            .When(x => x.ZoneIds != null);

        RuleFor(x => x.BranchId)
            .GreaterThan(0).WithMessage("El ID de la banca debe ser mayor a 0")
            .When(x => x.BranchId.HasValue);

        RuleFor(x => x.PermissionIds)
            .Must(permissions => permissions == null || permissions.All(id => id > 0))
            .WithMessage("Todos los IDs de permisos deben ser mayores a 0")
            .When(x => x.PermissionIds != null);
    }
}
