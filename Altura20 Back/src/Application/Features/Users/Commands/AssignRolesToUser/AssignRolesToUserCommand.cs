using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Users.Commands.AssignRolesToUser;

public record AssignRolesToUserCommand(string Username, IEnumerable<Guid> RoleIds) : IRequest<Result>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
