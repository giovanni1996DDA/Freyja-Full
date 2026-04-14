using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Roles.Commands.AssignChildRolesToRole;

public class AssignChildRolesToRoleCommandHandler(IApplicationDbContext context)
    : IRequestHandler<AssignChildRolesToRoleCommand, Result>
{
    public async Task<Result> Handle(AssignChildRolesToRoleCommand request, CancellationToken cancellationToken)
    {
        var parentRole = await context.Roles
            .Include(r => r.ChildRoles)
            .FirstOrDefaultAsync(r => r.Id == request.ParentRoleId, cancellationToken);

        if (parentRole is null)
            return Result.Failure($"Role {request.ParentRoleId} not found.");

        var childRoleIds = request.ChildRoleIds.ToList();
        var childRoles = await context.Roles
            .Where(r => childRoleIds.Contains(r.Id) && r.IsActive)
            .ToListAsync(cancellationToken);

        if (childRoles.Count != childRoleIds.Count)
            return Result.Failure("One or more child role IDs are invalid or inactive.");

        foreach (var child in childRoles)
        {
            var result = parentRole.AssignChildRole(child);
            if (result.IsFailure)
                return result;
        }

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
