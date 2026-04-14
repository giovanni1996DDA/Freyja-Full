using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Permissions.Queries.ListPermissions;

public class ListPermissionsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<ListPermissionsQuery, Result<IEnumerable<PermissionDto>>>
{
    public async Task<Result<IEnumerable<PermissionDto>>> Handle(ListPermissionsQuery request, CancellationToken cancellationToken)
    {
        var permissions = await context.Permissions
            .Where(p => p.IsActive)
            .Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Description, p.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IEnumerable<PermissionDto>>(permissions);
    }
}
