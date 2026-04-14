using Altura20.Application.Features.Roles;
using Altura20.Application.Features.Roles.Commands.AssignChildRolesToRole;
using Altura20.Application.Features.Roles.Commands.AssignPermissionsToRole;
using Altura20.Application.Features.Roles.Commands.CreateRole;
using Altura20.Application.Features.Roles.Commands.DeleteRole;
using Altura20.Application.Features.Roles.Commands.UpdateRole;
using Altura20.Application.Features.Roles.Queries.GetChildRoles;
using Altura20.Application.Features.Roles.Queries.GetRoleByName;
using Altura20.Application.Features.Roles.Queries.ListRoles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altura20.Api.Controllers;

/// <summary>
/// Manages Roles, which are composite nodes in the authorization tree.
/// A Role can contain Permissions (leaves) and other Roles (child composites),
/// enabling hierarchical permission grouping with unlimited nesting depth.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[Tags("Roles")]
public class RolesController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Returns all root roles with their composite tree resolved up to the requested depth.
    /// </summary>
    /// <remarks>
    /// Only **root roles** are returned — roles that are not assigned as a child of any other role.
    /// Child roles appear nested under their parents according to <c>depth</c>.
    ///
    /// **Depth behavior:**
    /// | depth | Result |
    /// |-------|--------|
    /// | 0 | Root role with its direct permissions. `childRoles` is always empty. |
    /// | 1 | Root role + its direct children (each with their own permissions). |
    /// | N | Recurses N levels into the composite tree. |
    ///
    /// **Response shape at depth=1:**
    /// ```json
    /// [
    ///   {
    ///     "id": "...",
    ///     "name": "Admin",
    ///     "permissions": [{ "code": "USERS_WRITE", ... }],
    ///     "childRoles": [
    ///       {
    ///         "name": "Supervisor",
    ///         "permissions": [{ "code": "PRODUCTION_READ", ... }],
    ///         "childRoles": []
    ///       }
    ///     ]
    ///   }
    /// ]
    /// ```
    /// </remarks>
    /// <param name="depth">
    /// Number of child role levels to include. Default is <c>0</c> (root only).
    /// </param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="200">List of root roles resolved to the requested depth.</response>
    [HttpGet]
    [ProducesResponseType<IEnumerable<RoleDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int depth, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ListRolesQuery(depth), cancellationToken);
        return Ok(result.Value);
    }

    /// <summary>
    /// Returns a single role by its exact name, resolved up to the requested depth.
    /// </summary>
    /// <remarks>
    /// Name matching is case-sensitive. The <c>depth</c> parameter controls how many
    /// levels of child roles are nested in the response (same semantics as <c>GET /api/roles</c>).
    /// </remarks>
    /// <param name="name">Exact name of the role to find.</param>
    /// <param name="depth">Number of child role levels to include. Default is <c>0</c>.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="200">Role found. Returns the role resolved to the requested depth.</response>
    /// <response code="404">No active role found with the given name.</response>
    [HttpGet("by-name/{name}")]
    [ProducesResponseType<RoleDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByName(string name, [FromQuery] int depth, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetRoleByNameQuery(name, depth), cancellationToken);
        return result.IsFailure ? NotFound(result.Error) : Ok(result.Value);
    }

    /// <summary>
    /// Returns the roles directly assigned to a User or Role, resolved up to the requested depth.
    /// </summary>
    /// <remarks>
    /// The <c>parentId</c> is resolved dynamically:
    /// - If it matches an active **User**, returns the roles directly assigned to that user.
    /// - If it matches an active **Role**, returns that role's child roles.
    ///
    /// The <c>depth</c> parameter controls how many additional levels of children are nested
    /// inside each returned role (same semantics as `GET /api/roles`).
    /// </remarks>
    /// <param name="parentId">GUID of the User or Role whose roles you want to inspect.</param>
    /// <param name="depth">Number of child role levels to include in each result. Default is <c>0</c>.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="200">Roles assigned to the given parent, resolved to the requested depth.</response>
    /// <response code="404">No active user or role found with the provided ID.</response>
    [HttpGet("{parentId:guid}/children")]
    [ProducesResponseType<IEnumerable<RoleDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChildRoles(Guid parentId, [FromQuery] int depth, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetChildRolesQuery(parentId, depth), cancellationToken);
        return result.IsFailure ? NotFound(result.Error) : Ok(result.Value);
    }

    /// <summary>
    /// Creates a new role with no permissions or child roles.
    /// </summary>
    /// <remarks>
    /// Creates an empty role. Use `PUT /api/roles/{roleId}` to assign its composite,
    /// or use the additive `POST /api/roles/{roleId}/permissions` and `POST /api/roles/{roleId}/roles` endpoints.
    ///
    /// **Request body example:**
    /// ```json
    /// {
    ///   "name": "Warehouse Operator",
    ///   "description": "Access to inventory intake and stock queries"
    /// }
    /// ```
    /// </remarks>
    /// <param name="command">Role data. <c>name</c> is required and must be unique.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="201">Role created. Returns the new role with empty permissions and childRoles.</response>
    /// <response code="400">Validation failed or a role with the same name already exists.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateRoleCommand command, CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        Console.WriteLine(result);
        return result.IsFailure ? BadRequest(result.Error) : StatusCode(StatusCodes.Status201Created);
    }

    /// <summary>
    /// Replaces the full composite of a role (info + permissions + child roles).
    /// </summary>
    /// <remarks>
    /// This is a **full replacement** operation: all existing permission and child role assignments
    /// are deleted and rebuilt from the arrays provided in the request.
    /// Sending an empty array clears all relations of that type.
    ///
    /// **Constraints:**
    /// - A role cannot be a child of itself.
    /// - All provided permission and child role IDs must exist and be active.
    ///
    /// **Request body example:**
    /// ```json
    /// {
    ///   "name": "Supervisor",
    ///   "description": "Operational oversight role",
    ///   "permissionIds": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    ///   "childRoleIds": ["7b1e4c2a-8f3d-4a9b-b2e1-1c5d8f7a3b6e"]
    /// }
    /// ```
    ///
    /// The response always returns the role at depth=0 (direct permissions and child role list without further nesting).
    /// </remarks>
    /// <param name="roleId">GUID of the role to update.</param>
    /// <param name="request">New role info and composite definition.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="200">Role updated. Returns the role with its new composite at depth=0.</response>
    /// <response code="400">Validation failed, circular reference detected, or invalid IDs provided.</response>
    /// <response code="404">Role not found.</response>
    [HttpPut("{roleId:guid}")]
    [ProducesResponseType<RoleDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid roleId, [FromBody] UpdateRoleRequest request, CancellationToken cancellationToken)
    {
        var command = new UpdateRoleCommand(roleId, request.Name, request.Description, request.PermissionIds, request.ChildRoleIds);
        var result = await sender.Send(command, cancellationToken);
        if (result.IsFailure)
            return result.Error!.Contains("not found") ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Additively assigns permissions to a role.
    /// </summary>
    /// <remarks>
    /// **Additive** — only the listed permissions are added. Existing permissions are preserved.
    /// Permissions already assigned to the role are silently ignored (no duplicate error).
    ///
    /// To fully replace the composite, use `PUT /api/roles/{roleId}` instead.
    ///
    /// **Request body example:**
    /// ```json
    /// ["3fa85f64-5717-4562-b3fc-2c963f66afa6", "9c2b1a7f-4d8e-4b3c-a1f2-5e6d7c8b9a0f"]
    /// ```
    /// </remarks>
    /// <param name="roleId">GUID of the role to assign permissions to.</param>
    /// <param name="permissionIds">Array of permission GUIDs to add.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="204">Permissions assigned successfully.</response>
    /// <response code="400">Role not found or one or more permission IDs are invalid/inactive.</response>
    [HttpPost("{roleId:guid}/permissions")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignPermissions(Guid roleId, [FromBody] IEnumerable<Guid> permissionIds, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new AssignPermissionsToRoleCommand(roleId, permissionIds), cancellationToken);
        return result.IsFailure ? BadRequest(result.Error) : NoContent();
    }

    /// <summary>
    /// Additively assigns child roles to a role, building the composite hierarchy.
    /// </summary>
    /// <remarks>
    /// **Additive** — only the listed roles are added as children. Existing child roles are preserved.
    /// A role cannot be a child of itself (direct self-reference is rejected).
    ///
    /// To fully replace the composite, use `PUT /api/roles/{roleId}` instead.
    ///
    /// **Request body example:**
    /// ```json
    /// ["7b1e4c2a-8f3d-4a9b-b2e1-1c5d8f7a3b6e"]
    /// ```
    /// </remarks>
    /// <param name="roleId">GUID of the parent role.</param>
    /// <param name="childRoleIds">Array of role GUIDs to nest as children.</param>
    /// <param name="cancellationToken">Propagates cancellation from the HTTP request.</param>
    /// <response code="204">Child roles assigned successfully.</response>
    /// <response code="400">Role not found, self-reference detected, or invalid child role IDs.</response>
    [HttpPost("{roleId:guid}/roles")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignChildRoles(Guid roleId, [FromBody] IEnumerable<Guid> childRoleIds, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new AssignChildRolesToRoleCommand(roleId, childRoleIds), cancellationToken);
        return result.IsFailure ? BadRequest(result.Error) : NoContent();
    }

    [HttpDelete("{roleId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteRoleRoles(Guid roleId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteRoleCommand(roleId), cancellationToken);
        return result.IsFailure ? BadRequest(result.Error) : NoContent();
    }
}

/// <summary>
/// Request body for updating a role's info and composite.
/// All permission and child role assignments are replaced with the provided arrays.
/// </summary>
public record UpdateRoleRequest(
    string Name,
    string? Description,
    IEnumerable<Guid> PermissionIds,
    IEnumerable<Guid> ChildRoleIds);
