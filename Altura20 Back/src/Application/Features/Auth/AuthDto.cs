namespace Altura20.Application.Features.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Email, string Password, string FullName, string Role);

public record TokenResponse(string Token, string Email, string FullName, string Role, DateTime ExpiresAt);
