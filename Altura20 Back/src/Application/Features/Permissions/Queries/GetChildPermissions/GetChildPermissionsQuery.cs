using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Permissions.Queries.GetChildPermissions;

public record GetChildPermissionsQuery(Guid ParentId) : IRequest<Result<IEnumerable<PermissionDto>>>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
