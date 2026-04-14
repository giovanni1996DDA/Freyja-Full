import { useState, useCallback, useMemo } from 'react'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { PERMISSIONS } from '../../auth/lib/menuPermissions'
import {
  searchRoleByName,
  createRole,
  updateRole,
  deleteRole,
} from '../services/rolesService'
import type {
  RoleDto,
  RoleFormValues,
  AssignmentRow,
  AssignmentNodeType,
  RoleScreenMode,
  PickerRow,
} from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a RoleDto's direct assignments into AssignmentRow[] for the grid. */
function buildDirectRows(role: RoleDto): AssignmentRow[] {
  const rows: AssignmentRow[] = []

  for (const perm of role.permissions ?? []) {
    rows.push({
      id: perm.id,
      name: perm.name,
      type: 'permission',
      code: perm.code,
      description: perm.description,
      path: [perm.id],
      isDirect: true,
      hasChildren: false,
      childrenLoaded: true,
    })
  }

  for (const child of role.childRoles ?? []) {
    rows.push({
      id: child.id,
      name: child.name,
      type: 'role',
      description: child.description,
      path: [child.id],
      isDirect: true,
      // Consider a child role as expandable if it has nested roles or permissions
      hasChildren:
        (child.childRoles?.length ?? 0) > 0 ||
        (child.permissions?.length ?? 0) > 0,
      childrenLoaded: false,
    })
  }

  return rows
}


function formValuesEqual(a: RoleFormValues, b: RoleFormValues): boolean {
  return a.name === b.name && a.description === b.description
}

function assignmentsEqual(a: AssignmentRow[], b: AssignmentRow[]): boolean {
  if (a.length !== b.length) return false
  const aIds = new Set(a.filter((r) => r.isDirect).map((r) => r.id))
  const bIds = new Set(b.filter((r) => r.isDirect).map((r) => r.id))
  if (aIds.size !== bIds.size) return false
  for (const id of aIds) {
    if (!bIds.has(id)) return false
  }
  return true
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseRoleFormReturn {
  // Permissions
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  isReadOnly: boolean

  // Screen state
  mode: RoleScreenMode
  searchName: string
  isSearching: boolean
  isSaving: boolean
  isDeleting: boolean
  error: string | null
  saveError: string | null
  showEmptySearchModal: boolean

  // Form data
  loadedRole: RoleDto | null
  formValues: RoleFormValues
  assignments: AssignmentRow[]
  isDirty: boolean

  // Handlers
  handleSearchNameChange: (value: string) => void
  handleSearch: () => Promise<void>
  handleFormChange: (field: keyof RoleFormValues, value: string) => void
  handleAddAssignments: (selected: PickerRow[]) => void
  handleRemoveAssignment: (rowId: string) => void
  handleSave: () => Promise<void>
  handleDelete: () => Promise<void>
  handleCloseEmptyModal: () => void
  handleClearError: () => void
}

export function useRoleForm(): UseRoleFormReturn {
  const user = useAuthStore((s) => s.user)
  const userPerms = user?.permissionIds ?? []

  const canView = userPerms.includes(PERMISSIONS.ROLES_VIEW)
  const canCreate = userPerms.includes(PERMISSIONS.ROLES_CREATE)
  const canEdit = userPerms.includes(PERMISSIONS.ROLES_EDIT)
  const canDelete = userPerms.includes(PERMISSIONS.ROLES_DELETE)
  const isReadOnly = !canEdit

  // ── State ──────────────────────────────────────────────────────────────────

  const [mode, setMode] = useState<RoleScreenMode>('idle')
  const [searchName, setSearchName] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showEmptySearchModal, setShowEmptySearchModal] = useState(false)

  const [loadedRole, setLoadedRole] = useState<RoleDto | null>(null)

  const [formValues, setFormValues] = useState<RoleFormValues>({ name: '', description: '' })
  const [originalFormValues, setOriginalFormValues] = useState<RoleFormValues>({ name: '', description: '' })

  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [originalAssignments, setOriginalAssignments] = useState<AssignmentRow[]>([])

  // ── Dirty state ────────────────────────────────────────────────────────────

  const isDirty = useMemo(() => {
    if (mode === 'idle' || mode === 'not-found') return false
    if (mode === 'create') return true // unsaved role always has pending changes
    return (
      !formValuesEqual(formValues, originalFormValues) ||
      !assignmentsEqual(assignments, originalAssignments)
    )
  }, [mode, formValues, originalFormValues, assignments, originalAssignments])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchNameChange = useCallback((value: string) => {
    setSearchName(value)
    setError(null)
  }, [])

  const handleSearch = useCallback(async () => {
    const trimmed = searchName.trim()
    if (!trimmed) {
      setShowEmptySearchModal(true)
      return
    }

    setIsSearching(true)
    setError(null)
    // Don't reset mode/data upfront — keep current content visible while the request is in flight

    try {
      const role = await searchRoleByName(trimmed)

      if (role) {
        const directRows = buildDirectRows(role)
        setLoadedRole(role)
        const vals = { name: role.name, description: role.description }
        setFormValues(vals)
        setOriginalFormValues(vals)
        setAssignments(directRows)
        setOriginalAssignments(directRows)
        setMode('existing')
      } else {
        setLoadedRole(null)
        setFormValues({ name: '', description: '' })
        setOriginalFormValues({ name: '', description: '' })
        setAssignments([])
        setOriginalAssignments([])
        if (canCreate) {
          const vals = { name: trimmed, description: '' }
          setFormValues(vals)
          setOriginalFormValues(vals)
          setMode('create')
        } else {
          setMode('not-found')
        }
      }
    } catch {
      setError('Failed to search for the role. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [searchName, canCreate])

  const handleFormChange = useCallback(
    (field: keyof RoleFormValues, value: string) => {
      if (isReadOnly) return
      setFormValues((prev) => ({ ...prev, [field]: value }))
    },
    [isReadOnly],
  )

  const handleAddAssignments = useCallback(
    (selected: PickerRow[]) => {
      if (isReadOnly || selected.length === 0) return
      const newRows: AssignmentRow[] = selected.map((item) => ({
        id: item.realId,
        name: item.name,
        type: item.type as AssignmentNodeType,
        code: item.code,
        description: item.description,
        path: [item.realId],
        isDirect: true,
        hasChildren: item.type === 'role' && item.hasChildren,
        childrenLoaded: false,
      }))
      setAssignments((prev) => [...prev, ...newRows])
    },
    [isReadOnly],
  )

  const handleRemoveAssignment = useCallback(
    (rowId: string) => {
      if (isReadOnly) return
      // Remove the direct row and any of its descendants from the tree
      setAssignments((prev) => {
        const target = prev.find((r) => r.id === rowId)
        if (!target || !target.isDirect) return prev
        const prefixPath = target.path
        return prev.filter(
          (r) =>
            r.id !== rowId &&
            !r.path.join('/').startsWith(prefixPath.join('/') + '/'),
        )
      })
    },
    [isReadOnly],
  )

  const handleSave = useCallback(async () => {
    if (!isDirty) return
    setSaveError(null)
    setIsSaving(true)

    try {
      const directPermissions = assignments
        .filter((r) => r.isDirect && r.type === 'permission')
        .map((r) => r.id)

      const directChildRoles = assignments
        .filter((r) => r.isDirect && r.type === 'role')
        .map((r) => r.id)

      if (mode === 'create') {
        await createRole({
          name: formValues.name,
          description: formValues.description,
          childIds: [...directPermissions, ...directChildRoles],
        })

        // Reload fresh data after creation
        const fresh = await searchRoleByName(formValues.name)
        if (fresh) {
          const directRows = buildDirectRows(fresh)
          setLoadedRole(fresh)
          const vals = { name: fresh.name, description: fresh.description }
          setFormValues(vals)
          setOriginalFormValues(vals)
          setAssignments(directRows)
          setOriginalAssignments(directRows)
          setMode('existing')
        }
      } else if (mode === 'existing' && loadedRole) {
        await updateRole(loadedRole.id, {
          name: formValues.name,
          description: formValues.description,
          permissionIds: directPermissions,  // GUIDs from r.id
          childRoleIds: directChildRoles,    // GUIDs from r.id
        })

        const fresh = await searchRoleByName(formValues.name)
        if (fresh) {
          const directRows = buildDirectRows(fresh)
          setLoadedRole(fresh)
          const vals = { name: fresh.name, description: fresh.description }
          setFormValues(vals)
          setOriginalFormValues(vals)
          setAssignments(directRows)
          setOriginalAssignments(directRows)
        }
      }
    } catch {
      setSaveError('Failed to save the role. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, mode, formValues, assignments, loadedRole])

  const handleDelete = useCallback(async () => {
    if (!loadedRole) return
    setIsDeleting(true)
    try {
      await deleteRole(loadedRole.id)
      // Reset screen after successful delete
      setMode('idle')
      setLoadedRole(null)
      setFormValues({ name: '', description: '' })
      setOriginalFormValues({ name: '', description: '' })
      setAssignments([])
      setOriginalAssignments([])
      setSearchName('')
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Failed to delete the role. Please try again.',
      )
    } finally {
      setIsDeleting(false)
    }
  }, [loadedRole])

  const handleCloseEmptyModal = useCallback(() => {
    setShowEmptySearchModal(false)
  }, [])

  const handleClearError = useCallback(() => {
    setError(null)
    setSaveError(null)
  }, [])

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    isReadOnly,
    mode,
    searchName,
    isSearching,
    isSaving,
    isDeleting,
    error,
    saveError,
    showEmptySearchModal,
    loadedRole,
    formValues,
    assignments,
    isDirty,
    handleSearchNameChange,
    handleSearch,
    handleFormChange,
    handleAddAssignments,
    handleRemoveAssignment,
    handleSave,
    handleDelete,
    handleCloseEmptyModal,
    handleClearError,
  }
}
