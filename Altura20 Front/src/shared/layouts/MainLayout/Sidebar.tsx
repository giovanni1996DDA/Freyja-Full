import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useMenuStore } from '../../../features/auth/store/useMenuStore'
import type { ResolvedMenuItem } from '../../../features/auth/types/menu'

// ─── Icon map ─────────────────────────────────────────────────────────────────
// Only top-level module keys need icons. Sub-group and leaf items are styled
// with indentation only. Add new module icons here when extending the menu.

const MODULE_ICONS: Record<string, React.ReactNode> = {
  home: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
    </svg>
  ),
  administration: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'master-data': (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2zm1 5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2H5z" />
    </svg>
  ),
  inventory: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  production: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.428 15.428a2 2 0 0 0-1.022-.547l-2.387-.477a6 6 0 0 0-3.86.517l-.318.158a6 6 0 0 1-3.86.517L6.05 15.21a2 2 0 0 0-1.806.547M8 4h8l-1 1v5.172a2 2 0 0 0 .586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0 0 9 10.172V5L8 4z" />
    </svg>
  ),
  procurement: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    </svg>
  ),
  sales: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
    </svg>
  ),
  'pricing-billing': (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  ),
  labeling: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
    </svg>
  ),
  logistics: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.414a1 1 0 0 0-.293-.707l-4.414-4.414A1 1 0 0 0 14.586 3H8zm0 0v4h8M9 17h.01M13 17h.01" />
    </svg>
  ),
  'audit-compliance': (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
    </svg>
  ),
}

// ─── Recursive nav item ───────────────────────────────────────────────────────

interface NavItemProps {
  item: ResolvedMenuItem
  onNavClick: () => void
  depth?: number
}

function NavItem({ item, onNavClick, depth = 0 }: NavItemProps) {
  const [expanded, setExpanded] = useState(false)
  const icon = depth === 0 ? MODULE_ICONS[item.key] : undefined

  if (item.type === 'leaf') {

    return (
      <NavLink
        to={item.path}
        onClick={onNavClick}
        className={({ isActive }) => {
          const base = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors'
          const active = 'bg-blue-600 text-white'
          const inactive =
            depth === 0
              ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          return `${base} ${isActive ? active : inactive}`
        }}
      >
        {icon}
        {item.label}
      </NavLink>
    )
  }

  // Group item
  const buttonBase =
    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors'
  const buttonColors =
    depth === 0
      ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
      : 'text-slate-400 hover:bg-slate-700 hover:text-white'

  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`${buttonBase} ${buttonColors}`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {item.label}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`accordion-body ${expanded ? 'is-open' : ''}`}>
        <div className="overflow-hidden">
          <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-slate-700 pl-3 pb-0.5">
            {item.children.map((child) => (
              <NavItem
                key={child.key}
                item={child}
                onNavClick={onNavClick}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean
  onNavClick: () => void
}

export function Sidebar({ isOpen, onNavClick }: SidebarProps) {
  const visibleMenu = useMenuStore((s) => s.visibleMenu)

  return (
    <aside
      className={`fixed left-0 top-14 z-50 flex h-[calc(100vh-3.5rem)] w-64 flex-col
        bg-slate-900 transition-transform duration-300 ease-in-out
        md:z-30 md:h-[calc(100vh-3.5rem-2.5rem)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          {visibleMenu.map((item) => (
            <NavItem key={item.key} item={item} onNavClick={onNavClick} depth={0} />
          ))}
        </div>
      </nav>
    </aside>
  )
}
