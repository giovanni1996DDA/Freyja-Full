namespace Altura20.Application.Features.Permissions;

public record PermissionDto(Guid Id, string Code, string Name, string? Description, bool IsActive);
