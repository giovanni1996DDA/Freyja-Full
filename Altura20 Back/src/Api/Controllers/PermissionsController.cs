using Altura20.Application.Features.Permissions;
using Altura20.Application.Features.Permissions.Commands.CreatePermission;
using Altura20.Application.Features.Permissions.Queries.GetChildPermissions;
using Altura20.Application.Features.Permissions.Queries.ListPermissions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altura20.Api.Controllers;

/// <summary>
/// Manages the Permission leaf nodes of the authorization composite.
/// Permissions are atomic access grants identified by a unique Code (e.g. INVENTORY_READ).
/// They can be assigned directly to Users or grouped inside Roles.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[Tags("Permissions")]
public class PermissionsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Returns all active permissions in the system.
    /// </summary>
    /// <remarks>
    /// Use this list to pick permission IDs when building or updating a Role or User composite.
    /// Only active permissions are returned; deactivated ones are excluded.
    /// </remarks>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="200">List of active permissions.</response>
    [HttpGet]
    [ProducesResponseType<IEnumerable<PermissionDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ListPermissionsQuery(), cancellationToken);
        return Ok(result.Value);
    }

    /// <summary>
    /// Returns the permissions directly assigned to a User or Role.
    /// </summary>
    /// <remarks>
    /// The <c>parentId</c> is resolved dynamically:
    /// - If it matches an active **User**, the user's direct permissions are returned (does not include permissions inherited via roles).
    /// - If it matches an active **Role**, the role's direct permissions are returned (does not recurse into child roles).
    ///
    /// To get the fully resolved (flattened) permission set of a user, use the login token which contains all resolved IDs.
    /// </remarks>
    /// <param name="parentId">GUID of the User or Role whose direct permissions you want to inspect.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="200">Permissions directly assigned to the given parent.</response>
    /// <response code="404">No active user or role found with the provided ID.</response>
    [HttpGet("{parentId:guid}/children")]
    [ProducesResponseType<IEnumerable<PermissionDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChildPermissions(Guid parentId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetChildPermissionsQuery(parentId), cancellationToken);
        return result.IsFailure ? NotFound(result.Error) : Ok(result.Value);
    }

    /// <summary>
    /// Creates a new permission.
    /// </summary>
    /// <remarks>
    /// Both <c>code</c> and <c>name</c> must be unique across all permissions.
    /// The <c>code</c> is automatically normalized to uppercase and should follow the convention
    /// <c>MODULE_ACTION</c> (e.g. <c>INVENTORY_READ</c>, <c>PRODUCTION_WRITE</c>).
    ///
    /// **Request body example:**
    /// ```json
    /// {
    ///   "code": "INVENTORY_READ",
    ///   "name": "Read Inventory",
    ///   "description": "Allows querying lot balances and stock levels"
    /// }
    /// ```
    /// </remarks>
    /// <param name="command">Permission data. <c>code</c> and <c>name</c> are required.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="201">Permission created successfully. Returns the new permission.</response>
    /// <response code="400">Validation failed or <c>code</c>/<c>name</c> already exists.</response>
    [HttpPost]
    [ProducesResponseType<PermissionDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePermissionCommand command, CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.IsFailure ? BadRequest(result.Error) : StatusCode(StatusCodes.Status201Created, result.Value);
    }
}
