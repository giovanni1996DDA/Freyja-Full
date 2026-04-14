using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Commands.AssignPermissionsToRole;

public class AssignPermissionsToRoleCommandHandler(IApplicationDbContext context)
    : IRequestHandler<AssignPermissionsToRoleCommand, Result>
{
    public async Task<Result> Handle(AssignPermissionsToRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

        if (role is null)
            return Result.Failure($"Role {request.RoleId} not found.");

        var permissionIds = request.PermissionIds.ToList();
        var permissions = await context.Permissions
            .Where(p => permissionIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(cancellationToken);

        if (permissions.Count != permissionIds.Count)
            return Result.Failure("One or more permission IDs are invalid or inactive.");

        foreach (var permission in permissions)
        {
            var result = role.AssignPermission(permission);
            if (result.IsFailure)
                return result;
        }

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
