import axios from 'axios'
import { httpClient } from '../../../shared/services/httpClient'
import type { AuthUser, LoginFormValues, LoginResponseDto } from '../types'

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendPermission {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
}

interface BackendRole {
  id: string
  name: string
  description: string
  isActive: boolean
  permissions: BackendPermission[]
  childRoles: BackendRole[]
}

interface BackendTokenResponse {
  accessToken: string
  refreshToken: string
  username: string
  fullName: string
  roles: BackendRole[]
  directPermissions: BackendPermission[]
  resolvedPermissionIds: string[]
  expiresAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect all unique permission codes from a role composite tree. */
function collectPermissionCodes(roles: BackendRole[]): string[] {
  const codes = new Set<string>()
  function walk(list: BackendRole[]) {
    for (const role of list) {
      for (const perm of role.permissions ?? []) {
        codes.add(perm.code)
      }
      if (role.childRoles?.length) walk(role.childRoles)
    }
  }
  walk(roles)
  return [...codes]
}

function mapTokenResponse(data: BackendTokenResponse): LoginResponseDto {
  const user: AuthUser = {
    username: data.username,
    fullName: data.fullName,
    roles: data.roles.map((r) => r.name),
    permissionIds: collectPermissionCodes(data.roles),
    expiresAt: data.expiresAt,
  }
  return { accessToken: data.accessToken, refreshToken: data.refreshToken, user }
}

// ─── Auth operations ──────────────────────────────────────────────────────────

export async function login(values: LoginFormValues): Promise<LoginResponseDto> {
  try {
    const { data } = await httpClient.post<BackendTokenResponse>('api/auth/login', {
      username: values.username,
      password: values.password,
    })
    return mapTokenResponse(data)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        throw new Error('Invalid username or password.')
      }
      if (!err.response) {
        throw new Error('Unable to reach the server. Check your connection.')
      }
    }
    throw new Error('Login failed. Please try again.')
  }
}

/**
 * Exchanges the refresh token for a new access token + refresh token pair.
 * The current access token is still injected as Bearer by the httpClient
 * interceptor; the refresh token is sent explicitly in the body.
 */
export async function refresh(refreshToken: string): Promise<LoginResponseDto> {
  const { data } = await httpClient.post<BackendTokenResponse>('api/auth/refresh', {
    refreshToken,
  })
  return mapTokenResponse(data)
}
