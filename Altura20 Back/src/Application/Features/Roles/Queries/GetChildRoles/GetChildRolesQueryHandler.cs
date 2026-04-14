using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Queries.GetChildRoles;

public class GetChildRolesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetChildRolesQuery, Result<IEnumerable<RoleDto>>>
{
    public async Task<Result<IEnumerable<RoleDto>>> Handle(GetChildRolesQuery request, CancellationToken cancellationToken)
    {
        // Load all active roles so EF's identity map wires up the full hierarchy automatically
        await context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.ChildRoles)
            .Where(r => r.IsActive)
            .LoadAsync(cancellationToken);

        // Check if parentId belongs to a User — return its directly assigned roles
        var user = await context.Users
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Id == request.ParentId && u.IsActive, cancellationToken);

        if (user is not null)
        {
            var dtos = user.Roles.Select(r => RoleMappings.ToDto(r, request.Depth));
            return Result.Success<IEnumerable<RoleDto>>(dtos);
        }

        // Check if parentId belongs to a Role — return its child roles
        var role = await context.Roles
            .Include(r => r.ChildRoles)
            .FirstOrDefaultAsync(r => r.Id == request.ParentId && r.IsActive, cancellationToken);

        if (role is not null)
        {
            var dtos = role.ChildRoles.Select(r => RoleMappings.ToDto(r, request.Depth));
            return Result.Success<IEnumerable<RoleDto>>(dtos);
        }

        return Result.Failure<IEnumerable<RoleDto>>($"No active user or role found with ID '{request.ParentId}'.");
    }
}
