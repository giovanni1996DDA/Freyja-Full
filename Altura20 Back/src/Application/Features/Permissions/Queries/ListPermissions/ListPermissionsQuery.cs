using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Permissions.Queries.ListPermissions;

public record ListPermissionsQuery : IRequest<Result<IEnumerable<PermissionDto>>>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
