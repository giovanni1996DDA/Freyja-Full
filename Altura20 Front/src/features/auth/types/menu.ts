// ─── Config types (in-memory only) ────────────────────────────────────────────
// These are used to declare the full menu tree with permissions.
// They are NOT persisted — React.ReactNode icons are not JSON-serializable.

export interface LeafMenuConfig {
  type: 'leaf'
  key: string
  label: string
  path: string
  /** User must hold at least one of these permission IDs to see this screen.
   *  An empty array means the screen is visible to all authenticated users. */
  permissions: string[]
}

export interface GroupMenuConfig {
  type: 'group'
  key: string
  label: string
  children: MenuItemConfig[]
}

export type MenuItemConfig = LeafMenuConfig | GroupMenuConfig

// ─── Resolved / persisted types ───────────────────────────────────────────────
// These are the filtered, serializable structures stored in Zustand persist.
// Icons are looked up at render time by key from the Sidebar icon map.

export interface ResolvedLeafItem {
  type: 'leaf'
  key: string
  label: string
  path: string
}

export interface ResolvedGroupItem {
  type: 'group'
  key: string
  label: string
  children: ResolvedMenuItem[]
}

export type ResolvedMenuItem = ResolvedLeafItem | ResolvedGroupItem
