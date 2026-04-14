using Altura20.Application.Features.Permissions;
using Altura20.Domain.Entities;

namespace Altura20.Application.Features.Roles;

public static class RoleMappings
{
    /// <summary>
    /// Maps a Role entity to RoleDto.
    /// depth=0 → only the role itself with its direct permissions, ChildRoles is empty.
    /// depth=1 → role + direct children (each with their own permissions).
    /// depth=N → recurses N levels deep.
    /// </summary>
    public static RoleDto ToDto(Role role, int depth)
    {
        var permissions = role.Permissions
            .Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Description, p.IsActive));

        var childRoles = depth > 0
            ? role.ChildRoles.Select(cr => ToDto(cr, depth - 1))
            : [];

        return new RoleDto(role.Id, role.Name, role.Description, role.IsActive, permissions, childRoles);
    }
}
