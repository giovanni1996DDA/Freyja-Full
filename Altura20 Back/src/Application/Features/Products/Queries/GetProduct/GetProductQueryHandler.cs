using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Queries.GetProduct;

public class GetProductQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetProductQuery, Result<ProductDto>>
{
    public async Task<Result<ProductDto>> Handle(
        GetProductQuery request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync([request.Id], cancellationToken);

        if (product is null)
            return Result.Failure<ProductDto>($"Product with id {request.Id} not found.");

        return Result.Success(new ProductDto(
            product.Id, product.Name, product.Description,
            product.Price, product.Stock, product.IsActive,
            product.CreatedAt, product.UpdatedAt));
    }
}
