using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Users.Commands.AssignPermissionsToUser;

public class AssignPermissionsToUserCommandHandler(IApplicationDbContext context)
    : IRequestHandler<AssignPermissionsToUserCommand, Result>
{
    public async Task<Result> Handle(AssignPermissionsToUserCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users
            .Include(u => u.DirectPermissions)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive, cancellationToken);

        if (user is null)
            return Result.Failure($"User '{request.Username}' not found.");

        var permissionIds = request.PermissionIds.ToList();
        var permissions = await context.Permissions
            .Where(p => permissionIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(cancellationToken);

        if (permissions.Count != permissionIds.Count)
            return Result.Failure("One or more permission IDs are invalid or inactive.");

        foreach (var permission in permissions)
        {
            var result = user.AssignPermission(permission);
            if (result.IsFailure)
                return result;
        }

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
