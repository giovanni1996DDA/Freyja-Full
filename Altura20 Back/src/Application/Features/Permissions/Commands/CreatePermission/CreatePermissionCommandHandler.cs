using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using Altura20.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Features.Permissions.Commands.CreatePermission;

public class CreatePermissionCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreatePermissionCommand, Result<PermissionDto>>
{
    public async Task<Result<PermissionDto>> Handle(CreatePermissionCommand request, CancellationToken cancellationToken)
    {
        var code = request.Code.ToUpperInvariant();

        var codeExists = await context.Permissions
            .AnyAsync(p => p.Code == code, cancellationToken);
        if (codeExists)
            return Result.Failure<PermissionDto>($"Permission with code '{code}' already exists.");

        var nameExists = await context.Permissions
            .AnyAsync(p => p.Name == request.Name, cancellationToken);
        if (nameExists)
            return Result.Failure<PermissionDto>($"Permission '{request.Name}' already exists.");

        var result = Permission.Create(code, request.Name, request.Description);
        if (result.IsFailure)
            return Result.Failure<PermissionDto>(result.Error!);

        context.Permissions.Add(result.Value);
        await context.SaveChangesAsync(cancellationToken);

        var p = result.Value;
        return Result.Success(new PermissionDto(p.Id, p.Code, p.Name, p.Description, p.IsActive));
    }
}
