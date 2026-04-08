using Altura20.Domain.Entities;

namespace Altura20.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
