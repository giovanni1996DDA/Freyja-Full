using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Username, string Password) : IRequest<Result<TokenResponse>>;
