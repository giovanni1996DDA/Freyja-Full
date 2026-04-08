using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler(
    IApplicationDbContext context,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator tokenGenerator)
    : IRequestHandler<LoginCommand, Result<TokenResponse>>
{
    public async Task<Result<TokenResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant() && u.IsActive, cancellationToken);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<TokenResponse>("Invalid email or password.");

        var token = tokenGenerator.GenerateToken(user);

        return Result.Success(new TokenResponse(
            Token: token,
            Email: user.Email,
            FullName: user.FullName,
            Role: user.Role.ToString(),
            ExpiresAt: DateTime.UtcNow.AddMinutes(60)));
    }
}
