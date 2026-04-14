using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Queries.ListRoles;

public class ListRolesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<ListRolesQuery, Result<IEnumerable<RoleDto>>>
{
    public async Task<Result<IEnumerable<RoleDto>>> Handle(ListRolesQuery request, CancellationToken cancellationToken)
    {
        // Load all active roles with their direct permissions and child-role relations.
        // EF Core's identity map automatically wires up grandchildren and beyond
        // because every referenced child role is also in the result set.
        var roles = await context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.ChildRoles)
            .Where(r => r.IsActive)
            .ToListAsync(cancellationToken);

        // Only top-level roles (not referenced as a child of any other role in this set)
        var childIds = roles.SelectMany(r => r.ChildRoles.Select(cr => cr.Id)).ToHashSet();
        var rootRoles = roles.Where(r => !childIds.Contains(r.Id));

        var dtos = rootRoles.Select(r => RoleMappings.ToDto(r, request.Depth));
        return Result.Success<IEnumerable<RoleDto>>(dtos);
    }
}
