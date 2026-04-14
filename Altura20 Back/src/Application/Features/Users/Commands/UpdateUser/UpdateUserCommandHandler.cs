using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateUserCommand, Result<UserDto>>
{
    public async Task<Result<UserDto>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users
            .Include(u => u.DirectPermissions)
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive, cancellationToken);

        if (user is null)
            return Result.Failure<UserDto>($"User '{request.Username}' not found.");

        // Check email uniqueness only if it changed
        var normalizedEmail = request.Email.ToLowerInvariant();
        if (!string.Equals(user.Email, normalizedEmail, StringComparison.Ordinal))
        {
            var emailExists = await context.Users
                .AnyAsync(u => u.Email == normalizedEmail && u.Username != request.Username, cancellationToken);
            if (emailExists)
                return Result.Failure<UserDto>($"Email '{request.Email}' is already in use.");
        }

        var updateResult = user.Update(request.Name, request.LastName, request.Email);
        if (updateResult.IsFailure)
            return Result.Failure<UserDto>(updateResult.Error!);

        // Replace composite: clear then rebuild
        user.ClearDirectPermissions();
        user.ClearRoles();

        var permissionIds = request.PermissionIds.ToList();
        if (permissionIds.Count > 0)
        {
            var permissions = await context.Permissions
                .Where(p => permissionIds.Contains(p.Id) && p.IsActive)
                .ToListAsync(cancellationToken);

            if (permissions.Count != permissionIds.Count)
                return Result.Failure<UserDto>("One or more permission IDs are invalid or inactive.");

            foreach (var permission in permissions)
                user.AssignPermission(permission);
        }

        var roleIds = request.RoleIds.ToList();
        if (roleIds.Count > 0)
        {
            var roles = await context.Roles
                .Where(r => roleIds.Contains(r.Id) && r.IsActive)
                .ToListAsync(cancellationToken);

            if (roles.Count != roleIds.Count)
                return Result.Failure<UserDto>("One or more role IDs are invalid or inactive.");

            foreach (var role in roles)
                user.AssignRole(role);
        }

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success(new UserDto(
            user.Id,
            user.Username,
            user.Name,
            user.LastName,
            user.Email,
            user.IsActive,
            user.Roles.Select(r => r.Id.ToString()),
            user.GetPermissionIds().Select(id => id.ToString())));
    }
}
