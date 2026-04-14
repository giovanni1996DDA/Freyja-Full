using Altura20.Application.Features.Permissions;
using Altura20.Application.Features.Roles;

namespace Altura20.Application.Features.Auth;

public record LoginRequest(string Username, string Password);

public record RegisterRequest(string Username, string Password, string Name, string LastName, string Email);

public record RefreshRequest(string RefreshToken);

public record TokenResponse(
    string AccessToken,
    string RefreshToken,
    string Username,
    string FullName,
    IEnumerable<RoleDto> Roles,
    IEnumerable<PermissionDto> DirectPermissions,
    IEnumerable<string> ResolvedPermissionIds,
    DateTime ExpiresAt);
