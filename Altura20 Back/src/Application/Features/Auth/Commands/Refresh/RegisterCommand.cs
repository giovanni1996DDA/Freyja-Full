using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Auth.Commands.Refresh;

public record RefreshCommand(string Token) : IRequest<Result<TokenResponse>>;
