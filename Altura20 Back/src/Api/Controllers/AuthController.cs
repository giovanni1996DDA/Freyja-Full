using Altura20.Application.Features.Auth;
using Altura20.Application.Features.Auth.Commands.Login;
using Altura20.Application.Features.Auth.Commands.Register;
using Altura20.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altura20.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(ISender sender) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType<TokenResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new LoginCommand(request.Email, request.Password), cancellationToken);
        return result.IsFailure ? Unauthorized(result.Error) : Ok(result.Value);
    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var role))
            return BadRequest($"Invalid role. Valid values: {string.Join(", ", Enum.GetNames<UserRole>())}");

        var result = await sender.Send(new RegisterCommand(request.Email, request.Password, request.FullName, role), cancellationToken);
        return result.IsFailure ? BadRequest(result.Error) : StatusCode(StatusCodes.Status201Created);
    }
}
