using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Permissions.Commands.CreatePermission;

public record CreatePermissionCommand(string Code, string Name, string? Description) : IRequest<Result<PermissionDto>>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
