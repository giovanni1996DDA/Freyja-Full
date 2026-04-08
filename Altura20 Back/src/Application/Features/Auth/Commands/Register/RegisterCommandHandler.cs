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
    public async Task<Result> Handle(
        RegisterCommand request, CancellationToken cancellationToken)
    {
        var emailExists = await context.Users
            .AnyAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken);

        if (emailExists)
            return Result.Failure("A user with this email already exists.");

        var hash = passwordHasher.Hash(request.Password);

        var result = User.Create(request.Email, hash, request.FullName, request.Role);

        if (result.IsFailure)
            return Result.Failure(result.Error!);

        context.Users.Add(result.Value);
        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
