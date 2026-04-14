using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Queries.GetRoleByName;

public class GetRoleByNameQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetRoleByNameQuery, Result<RoleDto>>
{
    public async Task<Result<RoleDto>> Handle(GetRoleByNameQuery request, CancellationToken cancellationToken)
    {
        // Load all active roles so EF's identity map wires up the full hierarchy
        await context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.ChildRoles)
            .Where(r => r.IsActive)
            .LoadAsync(cancellationToken);

        var role = await context.Roles
            .FirstOrDefaultAsync(r => r.Name == request.Name && r.IsActive, cancellationToken);

        if (role is null)
            return Result.Failure<RoleDto>($"Role '{request.Name}' not found.");

        return Result.Success(RoleMappings.ToDto(role, request.Depth));
    }
}
