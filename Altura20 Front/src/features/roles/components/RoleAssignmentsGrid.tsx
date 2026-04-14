import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import { getRoleChildren } from '../services/rolesService'
import type { AssignmentRow, RoleDto } from '../types'

// ─── Child row builder ────────────────────────────────────────────────────────

function buildChildRows(childRoles: RoleDto[], parentRow: AssignmentRow): AssignmentRow[] {
  return childRoles.map((child) => ({
    id: `${parentRow.id}/${child.id}`,
    name: child.name,
    type: 'role',
    description: child.description ?? '',
    path: [...parentRow.path, child.id],
    isDirect: false,
    hasChildren:
      (child.childRoles?.length ?? 0) > 0 || (child.permissions?.length ?? 0) > 0,
    childrenLoaded: false,
  }))
}

// ─── Context (passed to all cell renderers via AG Grid context prop) ──────────

interface GridContext {
  expandedIds: Set<string>
  loadingIds: Set<string>
  onToggle: (row: AssignmentRow) => void
  canRemove: boolean
  onRemove: (rowId: string) => void
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function NameCell({ data, context }: ICellRendererParams<AssignmentRow>) {
  const row = data!
  const ctx = context as GridContext
  const indent = (row.path.length - 1) * 20
  const isExpanded = ctx.expandedIds.has(row.id)
  const isLoading = ctx.loadingIds.has(row.id)
  const expandable = row.type === 'role' && row.hasChildren

  return (
    <div className="flex items-center" style={{ paddingLeft: indent }}>
      {expandable ? (
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

function TypeBadge({ value }: ICellRendererParams) {
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

function RemoveCell({ data, context }: ICellRendererParams<AssignmentRow>) {
  const row = data!
  const ctx = context as GridContext
  if (!ctx.canRemove || !row.isDirect) return null
  return (
    <button
      onClick={() => ctx.onRemove(row.id)}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-red-600
        hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-400"
      title="Remove assignment"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Remove
    </button>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoleAssignmentsGridProps {
  rows: AssignmentRow[]
  isReadOnly: boolean
  onRemove: (rowId: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoleAssignmentsGrid({ rows, isReadOnly, onRemove }: RoleAssignmentsGridProps) {
  const gridRef = useRef<AgGridReact<AssignmentRow>>(null)

  // gridRows = direct assignments + lazily-loaded children for expanded nodes
  const [gridRows, setGridRows] = useState<AssignmentRow[]>(() =>
    rows.filter((r) => r.isDirect),
  )
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const childrenCacheRef = useRef<Map<string, AssignmentRow[]>>(new Map())

  // When the source direct rows change (after add / remove / save), reset the grid
  useEffect(() => {
    setGridRows(rows.filter((r) => r.isDirect))
    setExpandedIds(new Set())
    setLoadingIds(new Set())
    childrenCacheRef.current.clear()
  }, [rows])

  // ── Toggle expand / collapse ───────────────────────────────────────────────

  const handleToggle = useCallback(
    async (row: AssignmentRow) => {
      const isExpanded = expandedIds.has(row.id)
      const prefix = row.id + '/'

      if (isExpanded) {
        // Collapse: remove this row from expandedIds and strip all descendants
        setExpandedIds((prev) => {
          const next = new Set<string>()
          for (const id of prev) {
            if (id !== row.id && !id.startsWith(prefix)) next.add(id)
          }
          return next
        })
        setGridRows((prev) => prev.filter((r) => !r.id.startsWith(prefix)))
      } else {
        // Expand
        setExpandedIds((prev) => new Set([...prev, row.id]))

        if (!childrenCacheRef.current.has(row.id)) {
          // First expansion: fetch from API
          setLoadingIds((prev) => new Set([...prev, row.id]))
          try {
            const realId = row.path[row.path.length - 1]
            const childRoles = await getRoleChildren(realId)
            const childRows = buildChildRows(childRoles, row)
            childrenCacheRef.current.set(row.id, childRows)
            setLoadingIds((prev) => {
              const s = new Set(prev)
              s.delete(row.id)
              return s
            })
            setGridRows((prev) => {
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
          // Subsequent expansions: reinsert from cache (only direct children, collapsed)
          const childRows = childrenCacheRef.current.get(row.id)!
          setGridRows((prev) => {
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

  const gridContext = useMemo<GridContext>(
    () => ({ expandedIds, loadingIds, onToggle: handleToggle, canRemove: !isReadOnly, onRemove }),
    [expandedIds, loadingIds, handleToggle, isReadOnly, onRemove],
  )

  // Force-refresh cells when context changes so chevron state and handlers are never stale
  useEffect(() => {
    gridRef.current?.api?.refreshCells({ force: true })
  }, [gridContext])

  // ── Column defs ────────────────────────────────────────────────────────────

  const columnDefs = useMemo<ColDef<AssignmentRow>[]>(
    () => [
      {
        headerName: 'Name',
        field: 'name',
        minWidth: 200,
        flex: 2,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellRenderer: NameCell,
      },
      {
        headerName: 'Type',
        field: 'type',
        width: 120,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellRenderer: TypeBadge,
      },
      {
        headerName: 'Code / Key',
        field: 'code',
        width: 180,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        valueFormatter: ({ value }) => value ?? '—',
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 3,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        valueFormatter: ({ value }) => value ?? '—',
      },
      {
        headerName: '',
        field: 'id',
        width: 110,
        sortable: false,
        filter: false,
        floatingFilter: false,
        resizable: false,
        cellRenderer: RemoveCell,
      },
    ],
    [],
  )

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true }), [])

  return (
    <div className="h-80 w-full">
      <AgGridReact<AssignmentRow>
        ref={gridRef}
        theme={themeQuartz}
        rowData={gridRows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => params.data.id}
        context={gridContext}
        suppressCellFocus
        animateRows={false}
        rowHeight={40}
        headerHeight={40}
        floatingFiltersHeight={36}
      />
    </div>
  )
}
