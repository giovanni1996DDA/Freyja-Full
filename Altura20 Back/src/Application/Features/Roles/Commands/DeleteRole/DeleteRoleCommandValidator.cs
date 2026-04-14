using FluentValidation;

namespace Altura20.Application.Features.Roles.Commands.DeleteRole;

public class DeleteRoleCommandValidator : AbstractValidator<DeleteRoleCommand>
{
    public DeleteRoleCommandValidator()
    {
        RuleFor(x => x.RoleId)
            .NotEqual(Guid.Empty).WithMessage("Role ID is required.");
    }
}
