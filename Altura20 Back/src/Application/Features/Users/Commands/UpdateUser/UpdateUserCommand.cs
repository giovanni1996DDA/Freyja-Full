using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    string Username,
    string Name,
    string LastName,
    string Email,
    IEnumerable<Guid> PermissionIds,
    IEnumerable<Guid> RoleIds) : IRequest<Result<UserDto>>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
