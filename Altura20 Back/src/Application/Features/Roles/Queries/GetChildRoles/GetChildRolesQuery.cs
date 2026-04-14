using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Roles.Queries.GetChildRoles;

public record GetChildRolesQuery(Guid ParentId, int Depth = 0) : IRequest<Result<IEnumerable<RoleDto>>>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
