using FluentValidation;

namespace Altura20.Application.Features.Permissions.Commands.CreatePermission;

public class CreatePermissionCommandValidator : AbstractValidator<CreatePermissionCommand>
{
    public CreatePermissionCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Permission code is required.")
            .MaximumLength(50).WithMessage("Permission code must not exceed 50 characters.")
            .Matches(@"^[A-Z0-9_]+$").WithMessage("Permission code must contain only uppercase letters, digits, and underscores.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Permission name is required.")
            .MaximumLength(50).WithMessage("Permission name must not exceed 50 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(200).WithMessage("Description must not exceed 200 characters.")
            .When(x => x.Description is not null);
    }
}
