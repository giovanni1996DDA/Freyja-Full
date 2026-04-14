using Altura20.Application.Features.Permissions;

namespace Altura20.Application.Features.Roles;

public record RoleDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    IEnumerable<PermissionDto> Permissions,
    IEnumerable<RoleDto> ChildRoles);
