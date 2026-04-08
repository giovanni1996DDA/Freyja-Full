using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Products.Commands.DeleteProduct;

public record DeleteProductCommand(int Id) : IRequest<Result>;
