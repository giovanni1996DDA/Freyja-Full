using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Commands.UpdateProduct;

public class UpdateProductCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    public async Task<Result<ProductDto>> Handle(
        UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync([request.Id], cancellationToken);

        if (product is null)
            return Result.Failure<ProductDto>($"Product with id {request.Id} not found.");

        var result = product.Update(request.Name, request.Description, request.Price);

        if (result.IsFailure)
            return Result.Failure<ProductDto>(result.Error!);

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success(new ProductDto(
            product.Id, product.Name, product.Description,
            product.Price, product.Stock, product.IsActive,
            product.CreatedAt, product.UpdatedAt));
    }
}
