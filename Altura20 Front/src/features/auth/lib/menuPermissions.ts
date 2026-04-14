import type { MenuItemConfig, ResolvedMenuItem } from '../types/menu'

// ─── Permission IDs ────────────────────────────────────────────────────────────
// Single source of truth. These IDs must match what the backend sends in
// the user's permissionIds array.

export const PERMISSIONS = {
  // Home
  HOME_VIEW: 'HOME_VIEW',

  // Administration — Security
  ROLES_VIEW: 'ROLES_VIEW',
  ROLES_CREATE: 'ROLES_CREATE',
  ROLES_EDIT: 'ROLES_EDIT',
  ROLES_DELETE: 'ROLES_DELETE',
  USERS_VIEW: 'USERS_VIEW',
  USERS_CREATE: 'USERS_CREATE',
  USERS_EDIT: 'USERS_EDIT',
  USERS_DELETE: 'USERS_DELETE',

  // Administration — Data Migration
  DATA_MIGRATION_VIEW: 'DATA_MIGRATION_VIEW',
  DATA_MIGRATION_EXECUTE: 'DATA_MIGRATION_EXECUTE',

  // Master Data — Articles
  ARTICLE_GROUPS_VIEW: 'ARTICLE_GROUPS_VIEW',
  ARTICLE_GROUPS_MANAGE: 'ARTICLE_GROUPS_MANAGE',
  ITEMS_VIEW: 'ITEMS_VIEW',
  ITEMS_MANAGE: 'ITEMS_MANAGE',
  ITEM_DETAIL_VIEW: 'ITEM_DETAIL_VIEW',
  ITEM_DETAIL_MANAGE: 'ITEM_DETAIL_MANAGE',

  // Inventory — Inbound
  INVENTORY_INTAKE_VIEW: 'INVENTORY_INTAKE_VIEW',
  INVENTORY_INTAKE_PROCESS: 'INVENTORY_INTAKE_PROCESS',

  // Inventory — Stock
  STOCK_VIEW: 'STOCK_VIEW',
  LOT_DETAIL_VIEW: 'LOT_DETAIL_VIEW',
  LOT_DETAIL_MANAGE: 'LOT_DETAIL_MANAGE',

  // Inventory — Counts
  CYCLE_COUNT_VIEW: 'CYCLE_COUNT_VIEW',
  CYCLE_COUNT_EXECUTE: 'CYCLE_COUNT_EXECUTE',

  // Production — Recipes
  BOM_VIEW: 'BOM_VIEW',
  BOM_MANAGE: 'BOM_MANAGE',

  // Production — Runs
  PRODUCTION_RUNS_VIEW: 'PRODUCTION_RUNS_VIEW',
  PRODUCTION_RUNS_MANAGE: 'PRODUCTION_RUNS_MANAGE',
  PRODUCTION_RUN_DETAIL_VIEW: 'PRODUCTION_RUN_DETAIL_VIEW',
  PRODUCTION_RUN_DETAIL_MANAGE: 'PRODUCTION_RUN_DETAIL_MANAGE',

  // Production — Exceptions
  PHANTOM_LOT_VIEW: 'PHANTOM_LOT_VIEW',
  PHANTOM_LOT_MANAGE: 'PHANTOM_LOT_MANAGE',
  TOLERANCE_VIEW: 'TOLERANCE_VIEW',
  TOLERANCE_MANAGE: 'TOLERANCE_MANAGE',

  // Procurement
  JIT_VIEW: 'JIT_VIEW',
  JIT_MANAGE: 'JIT_MANAGE',
  REPLENISHMENT_VIEW: 'REPLENISHMENT_VIEW',
  REPLENISHMENT_MANAGE: 'REPLENISHMENT_MANAGE',

  // Sales
  OCR_CAPTURE_VIEW: 'OCR_CAPTURE_VIEW',
  OCR_CAPTURE_PROCESS: 'OCR_CAPTURE_PROCESS',
  QUARANTINE_ORDERS_VIEW: 'QUARANTINE_ORDERS_VIEW',
  QUARANTINE_ORDERS_MANAGE: 'QUARANTINE_ORDERS_MANAGE',

  // Pricing & Billing
  WEEKLY_BET_VIEW: 'WEEKLY_BET_VIEW',
  WEEKLY_BET_MANAGE: 'WEEKLY_BET_MANAGE',
  INVOICES_VIEW: 'INVOICES_VIEW',
  INVOICES_MANAGE: 'INVOICES_MANAGE',

  // Labeling
  LABEL_PRINT_EXECUTE: 'LABEL_PRINT_EXECUTE',
  LABEL_REPRINT_EXECUTE: 'LABEL_REPRINT_EXECUTE',

  // Logistics — Dispatch
  ROUTE_PLANNING_VIEW: 'ROUTE_PLANNING_VIEW',
  ROUTE_PLANNING_MANAGE: 'ROUTE_PLANNING_MANAGE',
  PICK_PACK_VIEW: 'PICK_PACK_VIEW',
  PICK_PACK_EXECUTE: 'PICK_PACK_EXECUTE',
  PROOF_OF_DELIVERY_VIEW: 'PROOF_OF_DELIVERY_VIEW',
  PROOF_OF_DELIVERY_EXECUTE: 'PROOF_OF_DELIVERY_EXECUTE',

  // Audit & Compliance
  DAILY_CLOSE_VIEW: 'DAILY_CLOSE_VIEW',
  DAILY_CONSOLIDATION_VIEW: 'DAILY_CONSOLIDATION_VIEW',
  LEDGER_HISTORY_VIEW: 'LEDGER_HISTORY_VIEW',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the user holds at least one of the required permissions.
 * An empty `required` array means the item is visible to all authenticated users.
 */
export function hasAnyPermission(
  userPermissions: string[],
  required: string[],
): boolean {
  if (required.length === 0) return true
  return required.some((p) => userPermissions.includes(p))
}

/**
 * Recursively filters the full menu config tree down to the items the user
 * is allowed to see.
 *
 * Rules:
 * - A leaf is included when the user has at least one of its permissions.
 * - A group is included only when it has at least one visible child after filtering.
 * - The returned tree strips config-only fields (permissions, icons) to produce
 *   a serialization-safe ResolvedMenuItem[] suitable for Zustand persist.
 */
export function filterMenuTree(
  items: MenuItemConfig[],
  userPermissions: string[],
): ResolvedMenuItem[] {
  const result: ResolvedMenuItem[] = []

  for (const item of items) {
    if (item.type === 'leaf') {
      if (hasAnyPermission(userPermissions, item.permissions)) {
        result.push({ type: 'leaf', key: item.key, label: item.label, path: item.path })
      }
    } else {
      const visibleChildren = filterMenuTree(item.children, userPermissions)
      if (visibleChildren.length > 0) {
        result.push({ type: 'group', key: item.key, label: item.label, children: visibleChildren })
      }
    }
  }

  return result
}
