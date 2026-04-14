using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Roles.Commands.AssignPermissionsToRole;

public record AssignPermissionsToRoleCommand(Guid RoleId, IEnumerable<Guid> PermissionIds) : IRequest<Result>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
