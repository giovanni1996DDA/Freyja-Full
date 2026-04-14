using Altura20.Domain.Entities;

namespace Altura20.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, IEnumerable<Guid> permissionIds, IEnumerable<string> permissionCodes, IEnumerable<string> roleNames);
}
