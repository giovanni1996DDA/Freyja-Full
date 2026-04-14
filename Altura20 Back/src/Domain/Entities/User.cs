using Altura20.Domain.Common;

namespace Altura20.Domain.Entities;

// Root composite — aggregates direct Permissions + Roles (each a composite)
public class User : BaseEntity, IPermissionComponent
{
    private readonly List<Permission> _directPermissions = [];
    private readonly List<Role> _roles = [];

    public string Username { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;

    public IReadOnlyCollection<Permission> DirectPermissions => _directPermissions.AsReadOnly();
    public IReadOnlyCollection<Role> Roles => _roles.AsReadOnly();

    private User() { }

    public static Result<User> Create(string username, string passwordHash, string name, string lastName, string email)
    {
        if (string.IsNullOrWhiteSpace(username))
            return Result.Failure<User>("Username is required.");
        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result.Failure<User>("Password is required.");
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<User>("Name is required.");
        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure<User>("Last name is required.");
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<User>("Email is required.");

        return Result.Success(new User
        {
            Username = username,
            PasswordHash = passwordHash,
            Name = name,
            LastName = lastName,
            Email = email.ToLowerInvariant()
        });
    }

    // Flattens the full composite tree into a distinct set of permission IDs and codes
    public IEnumerable<Guid> GetPermissionIds()
    {
        var ids = _directPermissions.Select(p => p.Id).ToList();
        foreach (var role in _roles)
            ids.AddRange(role.GetPermissionIds());
        return ids.Distinct();
    }

    public IEnumerable<string> GetPermissionCodes()
    {
        var codes = _directPermissions.Select(p => p.Code).ToList();
        foreach (var role in _roles)
            codes.AddRange(role.GetPermissionCodes());
        return codes.Distinct();
    }

    public Result AssignPermission(Permission permission)
    {
        if (_directPermissions.Any(p => p.Id == permission.Id))
            return Result.Failure("Permission already assigned to this user.");
        _directPermissions.Add(permission);
        SetUpdatedAt();
        return Result.Success();
    }

    public Result AssignRole(Role role)
    {
        if (_roles.Any(r => r.Id == role.Id))
            return Result.Failure("Role already assigned to this user.");
        _roles.Add(role);
        SetUpdatedAt();
        return Result.Success();
    }

    public void RemovePermission(Guid permissionId)
    {
        var p = _directPermissions.FirstOrDefault(p => p.Id == permissionId);
        if (p is not null) { _directPermissions.Remove(p); SetUpdatedAt(); }
    }

    public void RemoveRole(Guid roleId)
    {
        var r = _roles.FirstOrDefault(r => r.Id == roleId);
        if (r is not null) { _roles.Remove(r); SetUpdatedAt(); }
    }

    public Result Update(string name, string lastName, string email)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("Name is required.");
        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure("Last name is required.");
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure("Email is required.");
        Name = name;
        LastName = lastName;
        Email = email.ToLowerInvariant();
        SetUpdatedAt();
        return Result.Success();
    }

    public void ClearDirectPermissions()
    {
        _directPermissions.Clear();
        SetUpdatedAt();
    }

    public void ClearRoles()
    {
        _roles.Clear();
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }
}
