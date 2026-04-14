import { PERMISSIONS } from '../lib/menuPermissions'
import type { MenuItemConfig } from '../types/menu'

/**
 * Full application menu tree.
 *
 * Structure rules:
 * - Every leaf node is a real screen with a route.
 * - Every group node is a container (module or submodule) with children.
 * - A leaf with an empty permissions array is visible to all authenticated users.
 * - Add new screens here and assign the relevant PERMISSIONS entries.
 * - The Sidebar will filter this tree at runtime based on the user's permissionIds.
 */
export const FULL_MENU: MenuItemConfig[] = [
  {
    type: 'leaf',
    key: 'home',
    label: 'Home',
    path: '/dashboard',
    permissions: [], // visible to every authenticated user
  },

  // ─── Administration ──────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'administration',
    label: 'Administration',
    children: [
      {
        type: 'group',
        key: 'admin-security',
        label: 'Security',
        children: [
          {
            type: 'group',
            key: 'roles',
            label: 'Roles',
            children: [
              {
                type: 'leaf',
                key: 'administrate-roles',
                label: 'Administrate roles',
                path: '/admin/administrate-roles',
                permissions: [
                  PERMISSIONS.ROLES_VIEW,
                  PERMISSIONS.ROLES_CREATE,
                  PERMISSIONS.ROLES_EDIT,
                  PERMISSIONS.ROLES_DELETE,
                ],
              },
              {
                type: 'leaf',
                key: 'configure-role',
                label: 'Configure role',
                path: '/admin/configure-role',
                permissions: [
                  PERMISSIONS.ROLES_VIEW,
                  PERMISSIONS.ROLES_CREATE,
                  PERMISSIONS.ROLES_EDIT,
                  PERMISSIONS.ROLES_DELETE,
                ],
              }
            ]
          },
        ],
      },
      {
        type: 'group',
        key: 'admin-users',
        label: 'Users',
        children: [
          {
            type: 'leaf',
            key: 'administrate-users',
            label: 'Administrate users',
            path: '/admin/administrate-users',
            permissions: [
              PERMISSIONS.USERS_VIEW,
              PERMISSIONS.USERS_CREATE,
              PERMISSIONS.USERS_EDIT,
              PERMISSIONS.USERS_DELETE,
            ],
          },
          {
            type: 'leaf',
            key: 'configure-user',
            label: 'Configure user',
            path: '/admin/configure-user',
            permissions: [
              PERMISSIONS.USERS_VIEW,
              PERMISSIONS.USERS_CREATE,
              PERMISSIONS.USERS_EDIT,
              PERMISSIONS.USERS_DELETE,
            ],
          },
        ],
      },
      {
        type: 'group',
        key: 'admin-data-migration',

        label: 'Data Migration',
        children: [
          {
            type: 'leaf',
            key: 'historical-import',
            label: 'Historical Import',
            path: '/admin/data-migration',
            permissions: [
              PERMISSIONS.DATA_MIGRATION_VIEW,
              PERMISSIONS.DATA_MIGRATION_EXECUTE,
            ],
          },
        ],
      },
    ],
  },

  // ─── Master Data ─────────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'master-data',
    label: 'Master Data',
    children: [
      {
        type: 'group',
        key: 'master-articles',
        label: 'Articles',
        children: [
          {
            type: 'leaf',
            key: 'article-groups',
            label: 'Article Groups',
            path: '/master/article-groups',
            permissions: [
              PERMISSIONS.ARTICLE_GROUPS_VIEW,
              PERMISSIONS.ARTICLE_GROUPS_MANAGE,
            ],
          },
          {
            type: 'leaf',
            key: 'items',
            label: 'Items',
            path: '/master/items',
            permissions: [PERMISSIONS.ITEMS_VIEW, PERMISSIONS.ITEMS_MANAGE],
          },
          {
            type: 'leaf',
            key: 'item-detail',
            label: 'Item Detail',
            path: '/master/item-detail',
            permissions: [
              PERMISSIONS.ITEM_DETAIL_VIEW,
              PERMISSIONS.ITEM_DETAIL_MANAGE,
            ],
          },
        ],
      },
    ],
  },

  // ─── Inventory ───────────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'inventory',
    label: 'Inventory',
    children: [
      {
        type: 'group',
        key: 'inventory-inbound',
        label: 'Inbound',
        children: [
          {
            type: 'leaf',
            key: 'inventory-intake',
            label: 'Inventory Intake',
            path: '/inventory/intake',
            permissions: [
              PERMISSIONS.INVENTORY_INTAKE_VIEW,
              PERMISSIONS.INVENTORY_INTAKE_PROCESS,
            ],
          },
        ],
      },
      {
        type: 'group',
        key: 'inventory-stock',
        label: 'Stock',
        children: [
          {
            type: 'leaf',
            key: 'stock-by-lot',
            label: 'Stock by Item / Lot',
            path: '/inventory/stock',
            permissions: [PERMISSIONS.STOCK_VIEW],
          },
          {
            type: 'leaf',
            key: 'lot-detail',
            label: 'Lot Detail',
            path: '/inventory/lot-detail',
            permissions: [
              PERMISSIONS.LOT_DETAIL_VIEW,
              PERMISSIONS.LOT_DETAIL_MANAGE,
            ],
          },
        ],
      },
      {
        type: 'group',
        key: 'inventory-counts',
        label: 'Counts',
        children: [
          {
            type: 'leaf',
            key: 'cycle-counts',
            label: 'Cycle Counts',
            path: '/inventory/cycle-counts',
            permissions: [
              PERMISSIONS.CYCLE_COUNT_VIEW,
              PERMISSIONS.CYCLE_COUNT_EXECUTE,
            ],
          },
        ],
      },
    ],
  },

  // ─── Production ──────────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'production',
    label: 'Production',
    children: [
      {
        type: 'group',
        key: 'production-recipes',
        label: 'Recipes',
        children: [
          {
            type: 'leaf',
            key: 'bom-recipes',
            label: 'BOM Recipes',
            path: '/production/bom',
            permissions: [PERMISSIONS.BOM_VIEW, PERMISSIONS.BOM_MANAGE],
          },
        ],
      },
      {
        type: 'group',
        key: 'production-runs',
        label: 'Runs',
        children: [
          {
            type: 'leaf',
            key: 'production-runs',
            label: 'Production Runs',
            path: '/production/runs',
            permissions: [
              PERMISSIONS.PRODUCTION_RUNS_VIEW,
              PERMISSIONS.PRODUCTION_RUNS_MANAGE,
            ],
          },
          {
            type: 'leaf',
            key: 'production-run-detail',
            label: 'Production Run Detail',
            path: '/production/run-detail',
            permissions: [
              PERMISSIONS.PRODUCTION_RUN_DETAIL_VIEW,
              PERMISSIONS.PRODUCTION_RUN_DETAIL_MANAGE,
            ],
          },
        ],
      },
      {
        type: 'group',
        key: 'production-exceptions',
        label: 'Exceptions',
        children: [
          {
            type: 'leaf',
            key: 'phantom-lot-override',
            label: 'Phantom Lot Override',
            path: '/production/phantom-lot',
            permissions: [
              PERMISSIONS.PHANTOM_LOT_VIEW,
              PERMISSIONS.PHANTOM_LOT_MANAGE,
            ],
          },
          {
            type: 'leaf',
            key: 'tolerance-approval',
            label: 'Tolerance Approval',
            path: '/production/tolerance',
            permissions: [
              PERMISSIONS.TOLERANCE_VIEW,
              PERMISSIONS.TOLERANCE_MANAGE,
            ],
          },
        ],
      },
    ],
  },

  // ─── Procurement ─────────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'procurement',
    label: 'Procurement',
    children: [
      {
        type: 'group',
        key: 'procurement-planning',
        label: 'Planning',
        children: [
          {
            type: 'leaf',
            key: 'jit-suggestions',
            label: 'JIT Suggestions',
            path: '/procurement/jit',
            permissions: [PERMISSIONS.JIT_VIEW, PERMISSIONS.JIT_MANAGE],
          },
          {
            type: 'leaf',
            key: 'replenishment-suggestions',
            label: 'Replenishment Suggestions',
            path: '/procurement/replenishment',
            permissions: [
              PERMISSIONS.REPLENISHMENT_VIEW,
              PERMISSIONS.REPLENISHMENT_MANAGE,
            ],
          },
        ],
      },
    ],
  },

  // ─── Sales ───────────────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'sales',
    label: 'Sales',
    children: [
      {
        type: 'group',
        key: 'sales-order-intake',
        label: 'Order Intake',
        children: [
          {
            type: 'leaf',
            key: 'ocr-order-capture',
            label: 'OCR Order Capture',
            path: '/sales/ocr',
            permissions: [
              PERMISSIONS.OCR_CAPTURE_VIEW,
              PERMISSIONS.OCR_CAPTURE_PROCESS,
            ],
          },
        ],
      },
      {
        type: 'group',
        key: 'sales-review',
        label: 'Review',
        children: [
          {
            type: 'leaf',
            key: 'quarantine-orders',
            label: 'Quarantine Orders',
            path: '/sales/quarantine',
            permissions: [
              PERMISSIONS.QUARANTINE_ORDERS_VIEW,
              PERMISSIONS.QUARANTINE_ORDERS_MANAGE,
            ],
          },
        ],
      },
    ],
  },

  // ─── Pricing & Billing ───────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'pricing-billing',
    label: 'Pricing & Billing',
    children: [
      {
        type: 'group',
        key: 'pricing',
        label: 'Pricing',
        children: [
          {
            type: 'leaf',
            key: 'weekly-bet-matrix',
            label: 'Weekly Bet Matrix',
            path: '/pricing/weekly-bet',
            permissions: [
              PERMISSIONS.WEEKLY_BET_VIEW,
              PERMISSIONS.WEEKLY_BET_MANAGE,
            ],
          },
        ],
      },
      {
        type: 'group',
        key: 'billing',
        label: 'Billing',
        children: [
          {
            type: 'leaf',
            key: 'invoice-issuance',
            label: 'Invoice / Receipt Issuance',
            path: '/billing/invoices',
            permissions: [PERMISSIONS.INVOICES_VIEW, PERMISSIONS.INVOICES_MANAGE],
          },
        ],
      },
    ],
  },

  // ─── Labeling ────────────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'labeling',
    label: 'Labeling',
    children: [
      {
        type: 'group',
        key: 'labeling-labels',
        label: 'Labels',
        children: [
          {
            type: 'leaf',
            key: 'print-label',
            label: 'Print Finished Product Label',
            path: '/labeling/print',
            permissions: [PERMISSIONS.LABEL_PRINT_EXECUTE],
          },
          {
            type: 'leaf',
            key: 'reprint-label',
            label: 'Reprint Label',
            path: '/labeling/reprint',
            permissions: [PERMISSIONS.LABEL_REPRINT_EXECUTE],
          },
        ],
      },
    ],
  },

  // ─── Logistics ───────────────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'logistics',
    label: 'Logistics',
    children: [
      {
        type: 'group',
        key: 'logistics-dispatch',
        label: 'Dispatch',
        children: [
          {
            type: 'leaf',
            key: 'route-planning',
            label: 'Route Planning',
            path: '/logistics/route-planning',
            permissions: [
              PERMISSIONS.ROUTE_PLANNING_VIEW,
              PERMISSIONS.ROUTE_PLANNING_MANAGE,
            ],
          },
          {
            type: 'leaf',
            key: 'pick-pack-validation',
            label: 'Pick & Pack Validation',
            path: '/logistics/pick-pack',
            permissions: [PERMISSIONS.PICK_PACK_VIEW, PERMISSIONS.PICK_PACK_EXECUTE],
          },
          {
            type: 'leaf',
            key: 'proof-of-delivery',
            label: 'Proof of Delivery',
            path: '/logistics/proof-of-delivery',
            permissions: [
              PERMISSIONS.PROOF_OF_DELIVERY_VIEW,
              PERMISSIONS.PROOF_OF_DELIVERY_EXECUTE,
            ],
          },
        ],
      },
    ],
  },

  // ─── Audit & Compliance ──────────────────────────────────────────────────────
  {
    type: 'group',
    key: 'audit-compliance',
    label: 'Audit & Compliance',
    children: [
      {
        type: 'group',
        key: 'audit-monitoring',
        label: 'Monitoring',
        children: [
          {
            type: 'leaf',
            key: 'daily-close-monitor',
            label: 'Daily Close Monitor',
            path: '/audit/daily-close',
            permissions: [PERMISSIONS.DAILY_CLOSE_VIEW],
          },
          {
            type: 'leaf',
            key: 'daily-consolidation-monitor',
            label: 'Daily Consolidation Monitor',
            path: '/audit/daily-consolidation',
            permissions: [PERMISSIONS.DAILY_CONSOLIDATION_VIEW],
          },
          {
            type: 'leaf',
            key: 'daily-ledger-history',
            label: 'Daily Ledger History',
            path: '/audit/ledger-history',
            permissions: [PERMISSIONS.LEDGER_HISTORY_VIEW],
          },
        ],
      },
    ],
  },
]
