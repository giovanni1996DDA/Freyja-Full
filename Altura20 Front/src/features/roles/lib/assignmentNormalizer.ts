import type { PickerRow, AssignmentRow } from '../types'

/**
 * Normalizes a raw picker selection before it is merged into the RoleForm assignment list.
 *
 * Rules applied in order:
 * 1. Strip placeholder rows (loading indicators — not real selections).
 * 2. Deduplicate against the current direct assignments already on the form.
 * 3. If a selected role R has a direct permission P in the cache, and P is also
 *    independently selected, drop P from the result (it is already covered by R).
 * 4. Deduplicate within the selection itself (guard against the picker returning
 *    the same realId twice).
 *
 * The rolePermissionCache maps roleId → Set<permissionId> for every role whose
 * data has been loaded (populated during initial load and lazy expansion with depth=1).
 * If a selected role's data is not in the cache (it was never expanded), its contained
 * permissions are unknown and no redundancy check is performed for that role.
 * This is intentional — the user cannot have explicitly selected a permission that was
 * never visible to them, so no data is lost.
 */
export function normalizePickerSelection(
  selected: PickerRow[],
  existingDirectAssignments: AssignmentRow[],
  rolePermissionCache: Map<string, Set<string>>,
): PickerRow[] {
  // IDs already directly on the form (real backend IDs stored at path[0])
  const existingIds = new Set(
    existingDirectAssignments.filter((r) => r.isDirect).map((r) => r.path[0]),
  )

  const realSelections = selected.filter((r) => !r.isLoadingPlaceholder)
  const selectedRoles = realSelections.filter((r) => r.type === 'role')
  const selectedPermissions = realSelections.filter((r) => r.type === 'permission')

  // Collect all permission IDs that are directly assigned to any selected role
  const coveredPermissionIds = new Set<string>()
  for (const role of selectedRoles) {
    const cached = rolePermissionCache.get(role.realId)
    if (cached) {
      cached.forEach((id) => coveredPermissionIds.add(id))
    }
  }

  // Roles: remove those already on the form
  const normalizedRoles = selectedRoles.filter((r) => !existingIds.has(r.realId))

  // Permissions: remove already-existing AND those covered by a selected role
  const normalizedPermissions = selectedPermissions.filter(
    (p) => !existingIds.has(p.realId) && !coveredPermissionIds.has(p.realId),
  )

  // Final dedup within the selection (roles first, then permissions)
  const seen = new Set<string>()
  const result: PickerRow[] = []
  for (const row of [...normalizedRoles, ...normalizedPermissions]) {
    if (!seen.has(row.realId)) {
      seen.add(row.realId)
      result.push(row)
    }
  }

  return result
}
