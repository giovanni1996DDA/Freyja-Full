using Altura20.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Altura20.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated == true;

    public Guid? UserId =>
        Guid.TryParse(User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    public IReadOnlySet<string> PermissionCodes =>
        User?.FindAll("permCode").Select(c => c.Value).ToHashSet()
        ?? (IReadOnlySet<string>)new HashSet<string>();
}
