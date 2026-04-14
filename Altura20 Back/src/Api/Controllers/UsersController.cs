using Altura20.Application.Features.Users;
using Altura20.Application.Features.Users.Commands.AssignPermissionsToUser;
using Altura20.Application.Features.Users.Commands.AssignRolesToUser;
using Altura20.Application.Features.Users.Commands.UpdateUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altura20.Api.Controllers;

/// <summary>
/// Manages Users, which are the root composite nodes of the authorization tree.
/// A User can hold direct Permissions (leaves) and Roles (composites).
/// The resolved permission set is the union of all direct permissions and all permissions
/// inherited recursively through the assigned role hierarchy.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[Tags("Users")]
public class UsersController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Replaces the full composite of a user (profile info + direct permissions + roles).
    /// </summary>
    /// <remarks>
    /// This is a **full replacement** operation:
    /// - User profile fields (name, lastName, email) are updated.
    /// - All existing direct permission and role assignments are deleted and rebuilt
    ///   from the arrays provided in the request. Sending an empty array clears all relations of that type.
    ///
    /// **Does not update:** username or password — those require separate dedicated flows.
    ///
    /// **Constraints:**
    /// - Email must be unique across all users.
    /// - All provided permission and role IDs must exist and be active.
    ///
    /// **Request body example:**
    /// ```json
    /// {
    ///   "name": "Juan",
    ///   "lastName": "Diaz",
    ///   "email": "juan@empresa.com",
    ///   "permissionIds": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    ///   "roleIds": ["7b1e4c2a-8f3d-4a9b-b2e1-1c5d8f7a3b6e"]
    /// }
    /// ```
    ///
    /// The response includes resolved `permissionIds` — the full flattened set from direct permissions
    /// plus all permissions inherited through roles.
    /// </remarks>
    /// <param name="username">Case-sensitive username of the user to update.</param>
    /// <param name="request">New profile info and composite definition.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="200">User updated. Returns the updated user with resolved composite.</response>
    /// <response code="400">Validation failed, email already in use, or invalid IDs provided.</response>
    /// <response code="404">User not found or inactive.</response>
    [HttpPut("{username}")]
    [ProducesResponseType<UserDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string username, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var command = new UpdateUserCommand(username, request.Name, request.LastName, request.Email, request.PermissionIds, request.RoleIds);
        var result = await sender.Send(command, cancellationToken);
        if (result.IsFailure)
            return result.Error!.Contains("not found") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Additively assigns direct permissions to a user.
    /// </summary>
    /// <remarks>
    /// **Additive** — only the listed permissions are added. Existing direct permissions are preserved.
    /// These are permissions held directly by the user, independent of any role assignment.
    ///
    /// To fully replace the composite (permissions + roles together), use `PUT /api/users/{username}` instead.
    ///
    /// **Request body example:**
    /// ```json
    /// ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
    /// ```
    /// </remarks>
    /// <param name="username">Case-sensitive username of the target user.</param>
    /// <param name="permissionIds">Array of permission GUIDs to add directly to the user.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="204">Permissions assigned successfully.</response>
    /// <response code="400">User not found or one or more permission IDs are invalid/inactive.</response>
    [HttpPost("{username}/permissions")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignPermissions(string username, [FromBody] IEnumerable<Guid> permissionIds, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new AssignPermissionsToUserCommand(username, permissionIds), cancellationToken);
        return result.IsFailure ? BadRequest(result.Error) : NoContent();
    }

    /// <summary>
    /// Additively assigns roles to a user.
    /// </summary>
    /// <remarks>
    /// **Additive** — only the listed roles are added. Existing role assignments are preserved.
    /// Assigning a role makes the user inherit all permissions from that role and its entire child hierarchy.
    ///
    /// To fully replace the composite (permissions + roles together), use `PUT /api/users/{username}` instead.
    ///
    /// **Request body example:**
    /// ```json
    /// ["7b1e4c2a-8f3d-4a9b-b2e1-1c5d8f7a3b6e"]
    /// ```
    /// </remarks>
    /// <param name="username">Case-sensitive username of the target user.</param>
    /// <param name="roleIds">Array of role GUIDs to assign to the user.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="204">Roles assigned successfully.</response>
    /// <response code="400">User not found or one or more role IDs are invalid/inactive.</response>
    [HttpPost("{username}/roles")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignRoles(string username, [FromBody] IEnumerable<Guid> roleIds, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new AssignRolesToUserCommand(username, roleIds), cancellationToken);
        return result.IsFailure ? BadRequest(result.Error) : NoContent();
    }
}

/// <summary>
/// Request body for updating a user's profile and composite.
/// All direct permission and role assignments are replaced with the provided arrays.
/// Email is stored in lowercase; username and password are not updatable here.
/// </summary>
public record UpdateUserRequest(
    string Name,
    string LastName,
    string Email,
    IEnumerable<Guid> PermissionIds,
    IEnumerable<Guid> RoleIds);
