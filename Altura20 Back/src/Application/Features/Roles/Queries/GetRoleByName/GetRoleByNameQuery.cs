using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Roles.Queries.GetRoleByName;

public record GetRoleByNameQuery(string Name, int Depth = 0) : IRequest<Result<RoleDto>>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
