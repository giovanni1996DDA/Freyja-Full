namespace Altura20.Application.Features.Users;

public record UserDto(
    Guid Id,
    string Username,
    string Name,
    string LastName,
    string Email,
    bool IsActive,
    IEnumerable<string> RoleIds,
    IEnumerable<string> PermissionIds);
