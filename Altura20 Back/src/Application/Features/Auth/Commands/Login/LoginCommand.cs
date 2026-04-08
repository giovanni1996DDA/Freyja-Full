using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<TokenResponse>>;
