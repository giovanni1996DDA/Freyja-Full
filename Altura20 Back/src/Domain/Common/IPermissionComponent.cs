namespace Altura20.Domain.Common;

/// <summary>
/// Composite pattern component.
/// Leaf: Permission — returns its own Id and Code.
/// Composite: Role, User — aggregates permissions from children recursively.
/// </summary>
public interface IPermissionComponent
{
    IEnumerable<Guid> GetPermissionIds();
    IEnumerable<string> GetPermissionCodes();
}
