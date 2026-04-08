using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using Altura20.Domain.Entities;
using MediatR;

namespace Altura20.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    public async Task<Result<ProductDto>> Handle(
        CreateProductCommand request, CancellationToken cancellationToken)
    {
        var result = Product.Create(request.Name, request.Description, request.Price, request.Stock);

        if (result.IsFailure)
            return Result.Failure<ProductDto>(result.Error!);

        context.Products.Add(result.Value);
        await context.SaveChangesAsync(cancellationToken);

        var product = result.Value;
        return Result.Success(new ProductDto(
            product.Id, product.Name, product.Description,
            product.Price, product.Stock, product.IsActive,
            product.CreatedAt, product.UpdatedAt));
    }
}
