using System.Security.Cryptography;
using Altura20.Application.Features.Permissions;
using Altura20.Application.Features.Roles;
using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using Altura20.Domain.Entities;
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
        // Load all active roles with their permissions and child relations.
        // EF Core's identity map wires up the full hierarchy automatically.
        await context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.ChildRoles)
            .Where(r => r.IsActive)
            .LoadAsync(cancellationToken);

        var user = await context.Users
            .Include(u => u.DirectPermissions)
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive, cancellationToken);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<TokenResponse>("Invalid username or password.");

        // Flat resolved permission IDs and codes — used for JWT claims and quick client-side checks
        var resolvedPermissionIds = user.GetPermissionIds().ToList();
        var resolvedPermissionCodes = user.GetPermissionCodes().ToList();
        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var expiresAt = DateTime.UtcNow.AddMinutes(60);

        var accessToken = tokenGenerator.GenerateToken(user, resolvedPermissionIds, resolvedPermissionCodes, roleNames);

        // Generate and persist refresh token (7-day sliding window)
        var refreshTokenValue = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue, DateTime.UtcNow.AddDays(7));
        context.RefreshTokens.Add(refreshToken);
        await context.SaveChangesAsync(cancellationToken);

        // Map direct permissions as PermissionDto objects
        var directPermissions = user.DirectPermissions
            .Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Description, p.IsActive));

        // Map roles as composite RoleDto objects (depth=1: role + direct children)
        var roles = user.Roles.Select(r => RoleMappings.ToDto(r, depth: 1));

        return Result.Success(new TokenResponse(
            AccessToken: accessToken,
            RefreshToken: refreshTokenValue,
            Username: user.Username,
            FullName: $"{user.Name} {user.LastName}",
            Roles: roles,
            DirectPermissions: directPermissions,
            ResolvedPermissionIds: resolvedPermissionIds.Select(id => id.ToString()),
            ExpiresAt: expiresAt));
    }
}
