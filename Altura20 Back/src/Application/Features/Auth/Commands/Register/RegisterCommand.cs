using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Username,
    string Password,
    string Name,
    string LastName,
    string Email) : IRequest<Result>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
