import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../../features/auth/store/useAuthStore'
import { useMenuStore } from '../../../features/auth/store/useMenuStore'

interface TopBarProps {
  onToggleSidebar: () => void
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const clearMenu = useMenuStore((s) => s.clearMenu)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between
      border-b border-gray-200 bg-white px-4 shadow-sm">

      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative max-w-sm flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search…"
            className="w-full rounded-md border border-gray-300 bg-gray-50 py-1.5 pl-9 pr-3
              text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right: user */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full
            bg-blue-600 text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 lg:block">
            {user?.fullName ?? 'User'}
          </span>
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1
            shadow-lg ring-1 ring-black ring-opacity-5">
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700
                hover:bg-gray-50"
              onClick={() => setDropdownOpen(false)}
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
              </svg>
              My Profile
            </button>
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700
                hover:bg-gray-50"
              onClick={() => setDropdownOpen(false)}
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94
                  3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724
                  1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572
                  1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826
                  -2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724
                  0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              </svg>
              System Settings
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600
                hover:bg-red-50"
              onClick={() => {
                setDropdownOpen(false)
                clearAuth()
                clearMenu()
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
