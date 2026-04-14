using Altura20.Domain.Common;

namespace Altura20.Domain.Entities;

// Leaf — has no children, returns only its own Id
public class Permission : BaseEntity, IPermissionComponent
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Permission() { }

    public static Result<Permission> Create(string code, string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<Permission>("Permission code is required.");

        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Permission>("Permission name is required.");

        return Result.Success(new Permission { Code = code.ToUpperInvariant(), Name = name, Description = description });
    }

    public IEnumerable<Guid> GetPermissionIds() => [Id];
    public IEnumerable<string> GetPermissionCodes() => [Code];

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }
}
