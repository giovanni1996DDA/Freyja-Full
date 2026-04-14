using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Users.Commands.AssignPermissionsToUser;

public record AssignPermissionsToUserCommand(string Username, IEnumerable<Guid> PermissionIds) : IRequest<Result>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
