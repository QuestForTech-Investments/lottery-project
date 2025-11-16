using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("El nombre de usuario es requerido")
            .MinimumLength(3).WithMessage("El nombre de usuario debe tener al menos 3 caracteres")
            .MaximumLength(50).WithMessage("El nombre de usuario no puede exceder 50 caracteres")
            .Matches("^[a-zA-Z0-9_.-]+$").WithMessage("El nombre de usuario solo puede contener letras, números y ._-");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres")
            .MaximumLength(100).WithMessage("La contraseña no puede exceder 100 caracteres");

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
            .InclusiveBetween(0, 100).WithMessage("La tasa de comisión debe estar entre 0 y 100");

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
