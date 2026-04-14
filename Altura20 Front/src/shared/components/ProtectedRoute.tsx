import { Navigate } from 'react-router-dom'
import { useAuthStore, selectIsAuthenticated } from '../../features/auth/store/useAuthStore'
import { useTokenRefresh } from '../../features/auth/hooks/useTokenRefresh'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  // Proactively refreshes the access token before it expires, but only when
  // the user has been recently active. No-ops when unauthenticated.
  useTokenRefresh()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
