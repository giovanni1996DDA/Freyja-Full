using System.Security.Cryptography;
using Altura20.Application.Features.Permissions;
using Altura20.Application.Features.Roles;
using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using Altura20.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Auth.Commands.Refresh;

public class RefreshCommandHandler(
    IApplicationDbContext context,
    IJwtTokenGenerator tokenGenerator)
    : IRequestHandler<RefreshCommand, Result<TokenResponse>>
{
    public async Task<Result<TokenResponse>> Handle(RefreshCommand request, CancellationToken cancellationToken)
    {
        var existing = await context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.Token, cancellationToken);

        if (existing is null || existing.IsRevoked || existing.ExpiresAt <= DateTime.UtcNow)
            return Result.Failure<TokenResponse>("Invalid or expired refresh token.");

        // Load all active roles for hierarchy resolution
        await context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.ChildRoles)
            .Where(r => r.IsActive)
            .LoadAsync(cancellationToken);

        var user = await context.Users
            .Include(u => u.DirectPermissions)
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Id == existing.UserId && u.IsActive, cancellationToken);

        if (user is null)
            return Result.Failure<TokenResponse>("User not found or inactive.");

        // Rotate: revoke old token and issue a new one
        existing.Revoke();
        var newRefreshTokenValue = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var newRefreshToken = RefreshToken.Create(user.Id, newRefreshTokenValue, DateTime.UtcNow.AddDays(7));
        context.RefreshTokens.Add(newRefreshToken);
        await context.SaveChangesAsync(cancellationToken);

        var resolvedPermissionIds = user.GetPermissionIds().ToList();
        var resolvedPermissionCodes = user.GetPermissionCodes().ToList();
        var roleNames = user.Roles.Select(r => r.Name).ToList();
        var expiresAt = DateTime.UtcNow.AddMinutes(60);
        var accessToken = tokenGenerator.GenerateToken(user, resolvedPermissionIds, resolvedPermissionCodes, roleNames);

        var directPermissions = user.DirectPermissions
            .Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Description, p.IsActive));
        var roles = user.Roles.Select(r => RoleMappings.ToDto(r, depth: 1));

        return Result.Success(new TokenResponse(
            AccessToken: accessToken,
            RefreshToken: newRefreshTokenValue,
            Username: user.Username,
            FullName: $"{user.Name} {user.LastName}",
            Roles: roles,
            DirectPermissions: directPermissions,
            ResolvedPermissionIds: resolvedPermissionIds.Select(id => id.ToString()),
            ExpiresAt: expiresAt));
    }
}
