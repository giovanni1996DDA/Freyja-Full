using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using Altura20.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler(
    IApplicationDbContext context,
    IPasswordHasher passwordHasher)
    : IRequestHandler<RegisterCommand, Result>
{
    public async Task<Result> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var usernameExists = await context.Users
            .AnyAsync(u => u.Username == request.Username, cancellationToken);

        if (usernameExists)
            return Result.Failure("Username is already taken.");

        var emailNormalized = request.Email.ToLowerInvariant();
        var emailExists = await context.Users
            .AnyAsync(u => u.Email == emailNormalized, cancellationToken);

        if (emailExists)
            return Result.Failure("A user with this email already exists.");

        var hash = passwordHasher.Hash(request.Password);
        var result = User.Create(request.Username, hash, request.Name, request.LastName, request.Email);

        if (result.IsFailure)
            return Result.Failure(result.Error!);

        context.Users.Add(result.Value);
        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
