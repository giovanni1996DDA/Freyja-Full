using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Users.Commands.AssignRolesToUser;

public class AssignRolesToUserCommandHandler(IApplicationDbContext context)
    : IRequestHandler<AssignRolesToUserCommand, Result>
{
    public async Task<Result> Handle(AssignRolesToUserCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive, cancellationToken);

        if (user is null)
            return Result.Failure($"User '{request.Username}' not found.");

        var roleIds = request.RoleIds.ToList();
        var roles = await context.Roles
            .Where(r => roleIds.Contains(r.Id) && r.IsActive)
            .ToListAsync(cancellationToken);

        if (roles.Count != roleIds.Count)
            return Result.Failure("One or more role IDs are invalid or inactive.");

        foreach (var role in roles)
        {
            var result = user.AssignRole(role);
            if (result.IsFailure)
                return result;
        }

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
