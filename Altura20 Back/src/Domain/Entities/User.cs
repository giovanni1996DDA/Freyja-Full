using Altura20.Domain.Common;
using Altura20.Domain.Enums;

namespace Altura20.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; } = true;

    private User() { }

    public static Result<User> Create(string email, string passwordHash, string fullName, UserRole role)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<User>("Email is required.");
        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result.Failure<User>("Password hash is required.");
        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure<User>("Full name is required.");

        return Result.Success(new User
        {
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            FullName = fullName,
            Role = role
        });
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }
}
