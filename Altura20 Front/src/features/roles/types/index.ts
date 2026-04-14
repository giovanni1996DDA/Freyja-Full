// ─── API DTOs ─────────────────────────────────────────────────────────────────

export interface PermissionDto {
  id: string
  code: string
  name: string
  description: string
}

export interface RoleDto {
  id: string
  name: string
  description: string
  permissions: PermissionDto[]
  childRoles: RoleDto[]
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateRolePayload {
  name: string
  description: string
  childIds: string[]
}

export interface UpdateRolePayload {
  name: string
  description: string
  permissionIds: string[]
  childRoleIds: string[]
}

// ─── Form values ──────────────────────────────────────────────────────────────

export interface RoleFormValues {
  name: string
  description: string
}

// ─── Grid row ─────────────────────────────────────────────────────────────────

export type AssignmentNodeType = 'role' | 'permission'

export interface AssignmentRow {
  /** Unique id of the role or permission */
  id: string
  name: string
  type: AssignmentNodeType
  /** Permission code (only present for permission rows) */
  code?: string
  description: string
  /**
   * Path array used by AG Grid treeData to build the hierarchy.
   * Direct assignments: [id]
   * Nested children:    [ancestorId, ..., id]
   */
  path: string[]
  /** Only direct assignments (path.length === 1) are removable */
  isDirect: boolean
  /** Whether this role node may have children (used to show expand affordance) */
  hasChildren: boolean
  /** Whether children have already been fetched for this node */
  childrenLoaded: boolean
}

// ─── Screen modes ─────────────────────────────────────────────────────────────

export type RoleScreenMode = 'idle' | 'existing' | 'create' | 'not-found'

// ─── Picker row (AssignmentPickerModal) ───────────────────────────────────────

export interface PickerRow {
  /** Unique row ID within the picker grid (composite for nested rows: path.join('|')) */
  id: string
  /** Actual backend GUID — used for normalization and assignment building */
  realId: string
  name: string
  type: 'role' | 'permission'
  /** Permission code string (only present for permission rows) */
  code?: string
  description: string
  /** Path array for AG Grid treeData */
  path: string[]
  hasChildren: boolean
  childrenLoaded: boolean
  /** True for synthetic "Loading…" placeholder rows inserted before lazy children load */
  isLoadingPlaceholder?: boolean
}
