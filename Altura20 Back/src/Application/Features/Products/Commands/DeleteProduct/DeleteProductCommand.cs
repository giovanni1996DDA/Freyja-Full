using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Commands.DeleteProduct;

public record DeleteProductCommand(Guid Id) : IRequest<Result>, IAuthorizedRequest
{
    public IEnumerable<string> RequiredPermissions =>
    [
        // Aca van los permisos
    ];
}
