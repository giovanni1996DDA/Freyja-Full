import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { refresh } from '../services/authService'
import { getLastActiveAt } from '../../../shared/lib/activityTracker'

/** How far before expiry to attempt the proactive refresh (5 minutes). */
const REFRESH_BEFORE_MS = 5 * 60 * 1000

/**
 * A session is considered "active" if the user interacted within this window.
 * We use the same 5-minute window so a user who was active right up to the
 * refresh moment will always qualify.
 */
const ACTIVITY_WINDOW_MS = 5 * 60 * 1000

/**
 * Schedules a single proactive token refresh per token lifetime.
 *
 * Behaviour:
 * - Fires a setTimeout at (expiresAt − REFRESH_BEFORE_MS).
 * - When it fires, checks whether the user was active within ACTIVITY_WINDOW_MS.
 *   - Active  → calls authService.refresh(refreshToken); on success updates the
 *               store, which re-runs this effect with the new expiresAt; on
 *               failure clears auth (forces logout).
 *   - Inactive → no refresh; the token will naturally expire and the 401
 *               interceptor (or ProtectedRoute) handles the logout.
 *
 * Mount once inside a component that is only rendered when authenticated
 * (e.g. ProtectedRoute).
 */
export function useTokenRefresh() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const expiresAt = useAuthStore((s) => s.user?.expiresAt ?? null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    if (!accessToken || !refreshToken || !expiresAt) return

    const expiresAtMs = new Date(expiresAt).getTime()
    const now = Date.now()
    const refreshAt = expiresAtMs - REFRESH_BEFORE_MS
    // If the refresh moment is already past (e.g. app loaded with a stale token)
    // wait at least one tick so the render cycle settles before acting.
    const delay = Math.max(refreshAt - now, 0)

    const timer = setTimeout(async () => {
      const msSinceActivity = Date.now() - getLastActiveAt()
      if (msSinceActivity > ACTIVITY_WINDOW_MS) {
        // User has been idle; let the token expire naturally.
        return
      }

      try {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: newUser } =
          await refresh(refreshToken)
        setAuth(newUser, newAccessToken, newRefreshToken)
      } catch {
        // Backend rejected the refresh (expired/revoked session, etc.)
        clearAuth()
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [accessToken, refreshToken, expiresAt, setAuth, clearAuth])
}
