using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Commands.UpdateRole;

public class UpdateRoleCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateRoleCommand, Result<RoleDto>>
{
    public async Task<Result<RoleDto>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.ChildRoles)
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

        if (role is null)
            return Result.Failure<RoleDto>($"Role '{request.RoleId}' not found.");

        // Check name uniqueness only if it changed
        if (!string.Equals(role.Name, request.Name, StringComparison.OrdinalIgnoreCase))
        {
            var nameExists = await context.Roles
                .AnyAsync(r => r.Name == request.Name && r.Id != request.RoleId, cancellationToken);
            if (nameExists)
                return Result.Failure<RoleDto>($"A role named '{request.Name}' already exists.");
        }

        var updateResult = role.Update(request.Name, request.Description);
        if (updateResult.IsFailure)
            return Result.Failure<RoleDto>(updateResult.Error!);

        // Replace composite: clear then rebuild
        role.ClearPermissions();
        role.ClearChildRoles();

        var permissionIds = request.PermissionIds.ToList();
        if (permissionIds.Count > 0)
        {
            var permissions = await context.Permissions
                .Where(p => permissionIds.Contains(p.Id) && p.IsActive)
                .ToListAsync(cancellationToken);

            if (permissions.Count != permissionIds.Count)
                return Result.Failure<RoleDto>("One or more permission IDs are invalid or inactive.");

            foreach (var permission in permissions)
                role.AssignPermission(permission);
        }

        var childRoleIds = request.ChildRoleIds.ToList();
        if (childRoleIds.Count > 0)
        {
            if (childRoleIds.Contains(request.RoleId))
                return Result.Failure<RoleDto>("A role cannot be a child of itself.");

            var childRoles = await context.Roles
                .Where(r => childRoleIds.Contains(r.Id) && r.IsActive)
                .ToListAsync(cancellationToken);

            if (childRoles.Count != childRoleIds.Count)
                return Result.Failure<RoleDto>("One or more child role IDs are invalid or inactive.");

            foreach (var child in childRoles)
                role.AssignChildRole(child);
        }

        await context.SaveChangesAsync(cancellationToken);

        // Return depth=0: direct permissions and child roles listed (no further nesting)
        return Result.Success(RoleMappings.ToDto(role, depth: 0));
    }
}
