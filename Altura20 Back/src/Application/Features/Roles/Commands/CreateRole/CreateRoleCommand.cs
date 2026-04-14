using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Roles.Commands.CreateRole;

public record CreateRoleCommand(string Name, string? Description, IEnumerable<Guid>? ChildIds = null) : IRequest<Result>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
