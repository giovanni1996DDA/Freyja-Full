using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Commands.DeleteRole;

public class DeleteRoleCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteRoleCommand, Result>
{
    public async Task<Result> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {

        var role = await context.Roles.FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

        if (role is null)
            return Result.Failure<RoleDto>($"Role '{request.RoleId}' not found.");

        var parentRoles = await context.Roles
                        .Include(r => r.ChildRoles)
                        .Where(r => r.ChildRoles.Any(cr => cr.Id == request.RoleId))
                        .ToListAsync(cancellationToken);

        var usersWithRole = await context.Users
                            .Include(u => u.Roles)
                            .Where(u => u.Roles.Any(r => r.Id == request.RoleId))
                            .ToListAsync(cancellationToken);

        foreach (var user in usersWithRole)
            user.RemoveRole(request.RoleId);

        foreach (var parent in parentRoles)
            parent.ClearChildRoles();

        role.Deactivate();

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
