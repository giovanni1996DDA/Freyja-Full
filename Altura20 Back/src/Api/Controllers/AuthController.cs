using Altura20.Application.Features.Auth;
using Altura20.Application.Features.Auth.Commands.Login;
using Altura20.Application.Features.Auth.Commands.Refresh;
using Altura20.Application.Features.Auth.Commands.Register;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altura20.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ISender sender) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType<TokenResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new LoginCommand(request.Username, request.Password), cancellationToken);
        return result.IsFailure ? Unauthorized(result.Error) : Ok(result.Value);
    }

    [HttpPost("register")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new RegisterCommand(request.Username, request.Password, request.Name, request.LastName, request.Email),
            cancellationToken);

        return result.IsFailure ? BadRequest(result.Error) : StatusCode(StatusCodes.Status201Created);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType<TokenResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RefreshCommand(request.RefreshToken), cancellationToken);
        return result.IsFailure ? Unauthorized(result.Error) : Ok(result.Value);
    }
}
