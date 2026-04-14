using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Roles.Commands.AssignChildRolesToRole;

public record AssignChildRolesToRoleCommand(Guid ParentRoleId, IEnumerable<Guid> ChildRoleIds) : IRequest<Result>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
