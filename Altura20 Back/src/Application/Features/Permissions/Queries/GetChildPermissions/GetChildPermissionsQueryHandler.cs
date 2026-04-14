using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Permissions.Queries.GetChildPermissions;

public class GetChildPermissionsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetChildPermissionsQuery, Result<IEnumerable<PermissionDto>>>
{
    public async Task<Result<IEnumerable<PermissionDto>>> Handle(GetChildPermissionsQuery request, CancellationToken cancellationToken)
    {
        // Check if parentId belongs to a User — return its directly assigned permissions
        var user = await context.Users
            .Include(u => u.DirectPermissions)
            .FirstOrDefaultAsync(u => u.Id == request.ParentId && u.IsActive, cancellationToken);

        if (user is not null)
        {
            var dtos = user.DirectPermissions.Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Description, p.IsActive));
            return Result.Success<IEnumerable<PermissionDto>>(dtos);
        }

        // Check if parentId belongs to a Role — return its directly assigned permissions
        var role = await context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == request.ParentId && r.IsActive, cancellationToken);

        if (role is not null)
        {
            var dtos = role.Permissions.Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Description, p.IsActive));
            return Result.Success<IEnumerable<PermissionDto>>(dtos);
        }

        return Result.Failure<IEnumerable<PermissionDto>>($"No active user or role found with ID '{request.ParentId}'.");
    }
}
