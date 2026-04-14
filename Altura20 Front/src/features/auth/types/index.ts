export interface AuthUser {
  username: string
  fullName: string
  roles: string[]
  permissionIds: string[]
  expiresAt: string
}

export interface LoginFormValues {
  username: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
