namespace Altura20.Application.Interfaces;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    IReadOnlySet<string> PermissionCodes { get; }
}
