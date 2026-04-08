using Altura20.Domain.Common;
using Altura20.Domain.Enums;
using MediatR;

namespace Altura20.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Email,
    string Password,
    string FullName,
    UserRole Role) : IRequest<Result>;
