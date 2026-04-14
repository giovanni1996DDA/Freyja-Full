import axios from 'axios'
import { httpClient } from '../../../shared/services/httpClient'
import type { RoleDto, CreateRolePayload, UpdateRolePayload } from '../types'

// ─── Root list (picker) ───────────────────────────────────────────────────────

/**
 * Fetch all root-level roles.
 * depth=1 populates direct permissions on each role so the normalizer cache can be
 * pre-populated without extra round-trips at confirmation time.
 */
export async function getRootRoles(depth = 1): Promise<RoleDto[]> {
  const { data } = await httpClient.get<RoleDto[]>('/api/roles', { params: { depth } })
  return data
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Search a role by exact name.
 * Returns the role (with direct assignments at depth=1) or null if not found.
 */
export async function searchRoleByName(name: string): Promise<RoleDto | null> {
  try {

    console.log(`/api/roles/by-name/${encodeURIComponent(name)}`);

    const { data } = await httpClient.get<RoleDto>(
      `/api/roles/by-name/${encodeURIComponent(name)}`,
      { params: { depth: 1 } },
    )
    console.log(data);

    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}

// ─── Get by ID ───────────────────────────────────────────────────────────────

export async function getRoleById(roleId: string, depth = 1): Promise<RoleDto> {
  const { data } = await httpClient.get<RoleDto>(`/api/roles/${roleId}`, { params: { depth } })
  return data
}

// ─── Children (lazy loading) ──────────────────────────────────────────────────

/**
 * Load the direct child roles of a given role node (used for grid lazy expansion).
 * depth=1 so each child also carries its own direct assignments.
 */
export async function getRoleChildren(roleId: string): Promise<RoleDto[]> {
  const { data } = await httpClient.get<RoleDto[]>(
    `/api/roles/${roleId}/children`,
    { params: { depth: 1 } },
  )
  return data
}

// ─── Create / Update ──────────────────────────────────────────────────────────

export async function createRole(payload: CreateRolePayload): Promise<RoleDto> {
  const { data } = await httpClient.post<RoleDto>('/api/roles', payload)
  return data
}

export async function updateRole(
  roleId: string,
  payload: UpdateRolePayload,
): Promise<RoleDto> {
  const { data } = await httpClient.put<RoleDto>(`/api/roles/${roleId}`, payload)
  return data
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a role.
 * NOTE: No DELETE endpoint has been provided in the current API contract.
 * The UI renders the Delete button when the user holds ROLES_DELETE, but
 * this call will throw until the backend exposes the endpoint.
 */
export async function deleteRole(_roleId: string): Promise<void> {
  // TODO: implement once DELETE /api/roles/{roleId} is available
  try {
    const { data } = await httpClient.delete(`/api/roles/${_roleId}`);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400)
      throw err
  }
  // throw new Error('Delete endpoint is not yet available.')
}
