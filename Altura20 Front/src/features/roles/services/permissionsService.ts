import { httpClient } from '../../../shared/services/httpClient'
import type { PermissionDto } from '../types'

// ─── List ─────────────────────────────────────────────────────────────────────

/** Fetch all permissions. Used to populate the picker modal. */
export async function getAllPermissions(): Promise<PermissionDto[]> {
  const { data } = await httpClient.get<PermissionDto[]>('/api/permissions')
  return data
}

// ─── Children ─────────────────────────────────────────────────────────────────

/**
 * Fetch child permissions of a parent permission node.
 * Kept for completeness — not used in the current picker (permissions are flat).
 */
export async function getPermissionChildren(parentId: string): Promise<PermissionDto[]> {
  const { data } = await httpClient.get<PermissionDto[]>(
    `/api/permissions/${parentId}/children`,
  )
  return data
}
