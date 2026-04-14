import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import { getRootRoles, getRoleChildren } from '../services/rolesService'
import { getAllPermissions } from '../services/permissionsService'
import { normalizePickerSelection } from '../lib/assignmentNormalizer'
import type { PickerRow, AssignmentRow, RoleDto, PermissionDto } from '../types'

// ─── Row builders ─────────────────────────────────────────────────────────────

function roleToPickerRow(role: RoleDto, parentPath: string[] = []): PickerRow {
  const segment = `r-${role.id}`
  const path = [...parentPath, segment]
  return {
    id: path.join('|'),
    realId: role.id,
    name: role.name,
    type: 'role',
    description: role.description ?? '',
    path,
    hasChildren: (role.childRoles?.length ?? 0) > 0,
    childrenLoaded: false,
  }
}

function permToPickerRow(perm: PermissionDto): PickerRow {
  return {
    id: `p-${perm.id}`,
    realId: perm.id,
    name: perm.name,
    type: 'permission',
    code: perm.code,
    description: perm.description ?? '',
    path: [`p-${perm.id}`],
    hasChildren: false,
    childrenLoaded: true,
  }
}

function populateCache(role: RoleDto, cache: Map<string, Set<string>>) {
  if ((role.permissions?.length ?? 0) > 0) {
    cache.set(role.id, new Set(role.permissions.map((p) => p.id)))
  }
  for (const child of role.childRoles ?? []) {
    populateCache(child, cache)
  }
}

// ─── Context (passed to cell renderers via AG Grid context prop) ──────────────

interface PickerContext {
  expandedIds: Set<string>
  loadingIds: Set<string>
  onToggle: (row: PickerRow) => void
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function NameCell({ data, context }: ICellRendererParams<PickerRow>) {
  const row = data!
  const ctx = context as PickerContext
  const indent = (row.path.length - 1) * 20
  const isExpanded = ctx.expandedIds.has(row.id)
  const isLoading = ctx.loadingIds.has(row.id)

  return (
    <div className="flex items-center" style={{ paddingLeft: indent }}>
      {row.hasChildren ? (
        <button
          className="mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400
            hover:text-gray-700 focus:outline-none"
          onClick={(e) => { e.stopPropagation(); ctx.onToggle(row) }}
        >
          {isLoading ? (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      ) : (
        <span className="mr-1 w-5 shrink-0" />
      )}
      <span className="truncate">{row.name}</span>
    </div>
  )
}

function TypeBadge({ value }: ICellRendererParams<PickerRow>) {
  if (value === 'role') {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        Role
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
      Permission
    </span>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AssignmentPickerModalProps {
  existingAssignments: AssignmentRow[]
  onConfirm: (selected: PickerRow[]) => void
  onCancel: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AssignmentPickerModal({
  existingAssignments,
  onConfirm,
  onCancel,
}: AssignmentPickerModalProps) {
  const gridRef = useRef<AgGridReact<PickerRow>>(null)
  const [rowData, setRowData] = useState<PickerRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Tree state — expandedIds as state so cell renderers re-render on change
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  // Caches direct children per row id; avoids re-fetching on collapse/expand
  const childrenCacheRef = useRef<Map<string, PickerRow[]>>(new Map())
  // roleId → Set<permissionId> for normalizer
  const rolePermCacheRef = useRef<Map<string, Set<string>>>(new Map())

  // ── Initial data load ──────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const [rootRoles, allPermissions] = await Promise.all([
          getRootRoles(1),
          getAllPermissions(),
        ])

        const rows: PickerRow[] = []
        for (const role of rootRoles) {
          rows.push(roleToPickerRow(role))
          populateCache(role, rolePermCacheRef.current)
        }
        for (const perm of allPermissions) {
          rows.push(permToPickerRow(perm))
        }
        setRowData(rows)
      } catch {
        setLoadError('Failed to load roles and permissions. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // ── Toggle expand / collapse ───────────────────────────────────────────────

  const handleToggle = useCallback(
    async (row: PickerRow) => {
      const isExpanded = expandedIds.has(row.id)
      const prefix = row.id + '|'

      if (isExpanded) {
        // Collapse: remove this and all descendants from expandedIds + rowData
        setExpandedIds((prev) => {
          const next = new Set<string>()
          for (const id of prev) {
            if (id !== row.id && !id.startsWith(prefix)) next.add(id)
          }
          return next
        })
        setRowData((prev) => prev.filter((r) => !r.id.startsWith(prefix)))
      } else {
        // Expand
        setExpandedIds((prev) => new Set([...prev, row.id]))

        if (!childrenCacheRef.current.has(row.id)) {
          // First expansion: fetch children from API
          setLoadingIds((prev) => new Set([...prev, row.id]))
          try {
            const children = await getRoleChildren(row.realId)
            const childRows: PickerRow[] = children.map((child) => {
              const childRow = roleToPickerRow(child, row.path)
              populateCache(child, rolePermCacheRef.current)
              return childRow
            })
            childrenCacheRef.current.set(row.id, childRows)
            setLoadingIds((prev) => {
              const s = new Set(prev)
              s.delete(row.id)
              return s
            })
            setRowData((prev) => {
              const idx = prev.findIndex((r) => r.id === row.id)
              if (idx === -1) return [...prev, ...childRows]
              return [...prev.slice(0, idx + 1), ...childRows, ...prev.slice(idx + 1)]
            })
          } catch {
            // Revert expand on error
            setExpandedIds((prev) => {
              const s = new Set(prev)
              s.delete(row.id)
              return s
            })
            setLoadingIds((prev) => {
              const s = new Set(prev)
              s.delete(row.id)
              return s
            })
          }
        } else {
          // Subsequent expansions: reinsert from cache (children are collapsed)
          const childRows = childrenCacheRef.current.get(row.id)!
          setRowData((prev) => {
            const idx = prev.findIndex((r) => r.id === row.id)
            if (idx === -1) return [...prev, ...childRows]
            return [...prev.slice(0, idx + 1), ...childRows, ...prev.slice(idx + 1)]
          })
        }
      }
    },
    [expandedIds],
  )

  // ── Context for cell renderers ─────────────────────────────────────────────

  const pickerContext = useMemo<PickerContext>(
    () => ({ expandedIds, loadingIds, onToggle: handleToggle }),
    [expandedIds, loadingIds, handleToggle],
  )

  // Force-refresh cells when context changes so chevron state and toggle are never stale
  useEffect(() => {
    gridRef.current?.api?.refreshCells({ force: true })
  }, [pickerContext])

  // ── Confirm ────────────────────────────────────────────────────────────────

  function handleConfirm() {
    const gridApi = gridRef.current?.api
    if (!gridApi) return
    const selected = gridApi
      .getSelectedNodes()
      .filter((n) => n.data)
      .map((n) => n.data!)
    const normalized = normalizePickerSelection(selected, existingAssignments, rolePermCacheRef.current)
    onConfirm(normalized)
  }

  // ── Column defs ────────────────────────────────────────────────────────────

  const columnDefs = useMemo<ColDef<PickerRow>[]>(
    () => [
      {
        headerName: 'Name',
        field: 'name',
        minWidth: 250,
        flex: 2,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellRenderer: NameCell,
      },
      {
        headerName: 'Type',
        field: 'type',
        width: 130,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellRenderer: TypeBadge,
      },
      {
        headerName: 'Code',
        field: 'code',
        width: 170,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        valueFormatter: ({ value }) => value ?? '—',
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 2,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        valueFormatter: ({ value }) => value ?? '—',
      },
    ],
    [],
  )

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true }), [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-title"
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-xl border border-gray-200 bg-white shadow-xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="picker-title" className="text-base font-semibold text-gray-800">
            Add Roles &amp; Permissions
          </h2>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading roles and permissions…
            </div>
          ) : loadError ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-red-600">{loadError}</p>
            </div>
          ) : (
            <div className="h-[440px] w-full">
              <AgGridReact<PickerRow>
                ref={gridRef}
                theme={themeQuartz}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowSelection={{
                  mode: 'multiRow',
                  enableClickSelection: false,
                  isRowSelectable: (node) => (node.data?.path.length ?? 0) === 1,
                }}
                getRowId={(params) => params.data.id}
                context={pickerContext}
                animateRows={false}
                rowHeight={40}
                headerHeight={40}
                floatingFiltersHeight={36}
              />
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 px-6 py-4">
          <p className="text-xs text-gray-400">
            Select roles and/or permissions, then click Confirm.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !!loadError}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
