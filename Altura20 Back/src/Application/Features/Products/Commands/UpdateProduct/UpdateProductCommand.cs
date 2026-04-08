using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Commands.UpdateProduct;

public record UpdateProductCommand(
    int Id,
    string Name,
    string? Description,
    decimal Price) : IRequest<Result<ProductDto>>;
