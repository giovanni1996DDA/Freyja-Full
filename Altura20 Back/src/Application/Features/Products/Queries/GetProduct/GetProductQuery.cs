using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Queries.GetProduct;

public record GetProductQuery(int Id) : IRequest<Result<ProductDto>>;
