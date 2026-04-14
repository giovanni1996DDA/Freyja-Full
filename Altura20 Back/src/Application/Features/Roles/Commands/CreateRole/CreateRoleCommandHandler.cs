using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using Altura20.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Commands.CreateRole;

public class CreateRoleCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateRoleCommand, Result>
{
    public async Task<Result> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var existing = await context.Roles
            .FirstOrDefaultAsync(r => r.Name == request.Name, cancellationToken);

        if (existing is not null && existing.IsActive)
            return Result.Success();

        var roleResult = Role.Create(request.Name, request.Description);
        if (roleResult.IsFailure)
            return Result.Failure(roleResult.Error!);

        var role = roleResult.Value;

        var childIds = request.ChildIds?.ToList() ?? [];
        if (childIds.Count > 0)
        {
            // Resolve which IDs are roles vs permissions in one query each
            var childRoles = await context.Roles
                .Where(r => childIds.Contains(r.Id) && r.IsActive)
                .ToListAsync(cancellationToken);

            var childRoleIds = childRoles.Select(r => r.Id).ToHashSet();
            var permissionIds = childIds.Where(id => !childRoleIds.Contains(id)).ToList();

            var permissions = permissionIds.Count > 0
                ? await context.Permissions
                    .Where(p => permissionIds.Contains(p.Id) && p.IsActive)
                    .ToListAsync(cancellationToken)
                : [];

            if (permissions.Count != permissionIds.Count)
                return Result.Failure("One or more IDs are not valid active roles or permissions.");

            foreach (var childRole in childRoles)
            {
                var assignResult = role.AssignChildRole(childRole);
                if (assignResult.IsFailure)
                    return Result.Failure(assignResult.Error!);
            }

            foreach (var permission in permissions)
            {
                var assignResult = role.AssignPermission(permission);
                if (assignResult.IsFailure)
                    return Result.Failure(assignResult.Error!);
            }
        }

        context.Roles.Add(role);
        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
