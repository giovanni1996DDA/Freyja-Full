using Altura20.Domain.Common;

namespace Altura20.Domain.Entities;

// Composite — aggregates Permissions (leaf) + ChildRoles (composite) recursively
public class Role : BaseEntity, IPermissionComponent
{
    private readonly List<Permission> _permissions = [];
    private readonly List<Role> _childRoles = [];

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;

    public IReadOnlyCollection<Permission> Permissions => _permissions.AsReadOnly();
    public IReadOnlyCollection<Role> ChildRoles => _childRoles.AsReadOnly();

    private Role() { }

    public static Result<Role> Create(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Role>("Role name is required.");

        return Result.Success(new Role { Name = name, Description = description });
    }

    // Recursively collects all permission IDs and codes from direct permissions + child roles

    public IEnumerable<Guid> GetPermissionIds()
    {
        var ids = _permissions.Select(p => p.Id).ToList();
        foreach (var child in _childRoles)
            ids.AddRange(child.GetPermissionIds());
        return ids.Distinct();
    }

    public IEnumerable<string> GetPermissionCodes()
    {
        var codes = _permissions.Select(p => p.Code).ToList();
        foreach (var child in _childRoles)
            codes.AddRange(child.GetPermissionCodes());
        return codes.Distinct();
    }

    public Result AssignPermission(Permission permission)
    {
        if (_permissions.Any(p => p.Id == permission.Id))
            return Result.Failure("Permission already assigned to this role.");
        _permissions.Add(permission);
        SetUpdatedAt();
        return Result.Success();
    }

    public Result AssignChildRole(Role role)
    {
        if (role.Id == Id)
            return Result.Failure("A role cannot be a child of itself.");
        if (_childRoles.Any(r => r.Id == role.Id))
            return Result.Failure("Role already assigned as child.");
        _childRoles.Add(role);
        SetUpdatedAt();
        return Result.Success();
    }

    public Result Update(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("Role name is required.");
        Name = name;
        Description = description;
        SetUpdatedAt();
        return Result.Success();
    }

    public void ClearPermissions()
    {
        _permissions.Clear();
        SetUpdatedAt();
    }

    public void ClearChildRoles()
    {
        _childRoles.Clear();
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;

        _permissions.Clear();
        _childRoles.Clear();

        SetUpdatedAt();
    }
}
