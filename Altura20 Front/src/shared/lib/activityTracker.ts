/**
 * Module-level activity tracker.
 *
 * Listens to user interaction events on the window and records the last time
 * the user was active. Initializes once on first import; no teardown needed
 * for a global singleton.
 *
 * Usage:
 *   import { getLastActiveAt } from '@/shared/lib/activityTracker'
 *   const isRecent = Date.now() - getLastActiveAt() < ACTIVITY_WINDOW_MS
 */

const TRACKED_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
]

let lastActiveAt: number = Date.now()

function handleActivity() {
  lastActiveAt = Date.now()
}

export function getLastActiveAt(): number {
  return lastActiveAt
}

TRACKED_EVENTS.forEach((event) => {
  window.addEventListener(event, handleActivity, { passive: true })
})
