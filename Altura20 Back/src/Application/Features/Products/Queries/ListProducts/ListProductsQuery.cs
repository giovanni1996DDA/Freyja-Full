using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Queries.ListProducts;

public record ListProductsQuery : IRequest<Result<IEnumerable<ProductDto>>>;
