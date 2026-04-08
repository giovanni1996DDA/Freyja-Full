using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Products.Queries.ListProducts;

public class ListProductsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<ListProductsQuery, Result<IEnumerable<ProductDto>>>
{
    public async Task<Result<IEnumerable<ProductDto>>> Handle(
        ListProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await context.Products
            .Where(p => p.IsActive)
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.CreatedAt, p.UpdatedAt))
            .ToListAsync(cancellationToken);

        return Result.Success<IEnumerable<ProductDto>>(products);
    }
}
