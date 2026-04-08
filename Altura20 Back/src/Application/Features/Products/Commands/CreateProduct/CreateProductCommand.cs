using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    string? Description,
    decimal Price,
    int Stock) : IRequest<Result<ProductDto>>;
