import { useState } from 'react'
import { RoleAssignmentsGrid } from './RoleAssignmentsGrid'
import { AssignmentPickerModal } from './AssignmentPickerModal'
import type { RoleFormValues, AssignmentRow, RoleScreenMode, PickerRow } from '../types'

// ─── Empty-search placeholder modal ──────────────────────────────────────────

interface EmptySearchModalProps {
  onClose: () => void
}

export function EmptySearchModal({ onClose }: EmptySearchModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="empty-search-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 id="empty-search-title" className="text-base font-semibold text-gray-800">
          Search Required
        </h2>
        {/* Placeholder — body content to be defined in a future iteration */}
        <div className="mt-4 min-h-[4rem]" />
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm delete modal ─────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  roleName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({
  roleName,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 id="delete-title" className="text-base font-semibold text-gray-800">
          Delete Role
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete <strong>{roleName}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white
              hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main RoleForm ────────────────────────────────────────────────────────────

export interface RoleFormProps {
  // ── Modes & permissions ──────────────────────────────────────────────────
  mode: RoleScreenMode
  isReadOnly: boolean
  canCreate: boolean
  canDelete: boolean

  // ── Search bar ───────────────────────────────────────────────────────────
  searchName: string
  isSearching: boolean
  onSearchNameChange: (value: string) => void
  onSearch: () => void

  // ── Form fields ──────────────────────────────────────────────────────────
  formValues: RoleFormValues
  onFormChange: (field: keyof RoleFormValues, value: string) => void

  // ── Grid ─────────────────────────────────────────────────────────────────
  assignments: AssignmentRow[]
  onRemoveAssignment: (rowId: string) => void

  // ── Actions ──────────────────────────────────────────────────────────────
  isDirty: boolean
  isSaving: boolean
  isDeleting: boolean
  onAddAssignments: (selected: PickerRow[]) => void
  onSave: () => void
  onDelete: () => void

  // ── Feedback ─────────────────────────────────────────────────────────────
  error: string | null
  saveError: string | null
}

export function RoleForm({
  mode,
  isReadOnly,
  canDelete,
  searchName,
  isSearching,
  onSearchNameChange,
  onSearch,
  formValues,
  onFormChange,
  assignments,
  onRemoveAssignment,
  isDirty,
  isSaving,
  isDeleting,
  onAddAssignments,
  onSave,
  onDelete,
  error,
  saveError,
}: RoleFormProps) {
  const [showPicker, setShowPicker] = useState(false)
  const isFormActive = mode === 'existing' || mode === 'create'
  const showGrid = isFormActive
  const showDeleteButton = mode === 'existing' && canDelete

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Search row ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Name field + Search button */}
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="role-name-search" className="text-sm font-medium text-gray-700">
              Role Name
            </label>
            <div className="flex gap-2">
              <input
                id="role-name-search"
                type="text"
                value={searchName}
                onChange={(e) => onSearchNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter role name…"
                disabled={isSearching}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              <button
                onClick={onSearch}
                disabled={isSearching}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                  text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                  focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSearching ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Searching…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>

              {/* Delete role button — only when existing + ROLES_DELETE */}
              {showDeleteButton && (
                <button
                  onClick={onDelete}
                  disabled={isDeleting || isSaving}
                  className="flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2
                    text-sm font-medium text-red-600 hover:bg-red-50
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search feedback */}
        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {mode === 'not-found' && (
          <p role="status" className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            No role found with that name. You do not have permission to create new roles.
          </p>
        )}
        {mode === 'create' && (
          <p role="status" className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Role not found. You can create it using the form below.
          </p>
        )}
      </div>

      {/* ── Role detail form ─────────────────────────────────────────────── */}
      {isFormActive && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {mode === 'create' ? 'New Role' : 'Role Details'}
            </h2>
            {isReadOnly && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Read-only
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Name (editable only in edit mode; in create mode it mirrors search) */}
            <div className="flex flex-col gap-1">
              <label htmlFor="role-name" className="text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="role-name"
                type="text"
                value={formValues.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                disabled={isReadOnly || mode === 'create'}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label htmlFor="role-description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="role-description"
                rows={3}
                value={formValues.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder={isReadOnly ? '' : 'Describe the role…'}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Assignments grid ─────────────────────────────────────────────── */}
      {showGrid && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Assigned Roles &amp; Permissions
            </h2>
            {!isReadOnly && (
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5
                  text-sm font-medium text-gray-700 hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )}
          </div>

          {assignments.filter((r) => r.isDirect).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed
              border-gray-200 py-10 text-sm text-gray-400">
              <svg className="mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-3-3v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              No roles or permissions assigned yet.
            </div>
          ) : (
            <RoleAssignmentsGrid
              rows={assignments}
              isReadOnly={isReadOnly}
              onRemove={onRemoveAssignment}
            />
          )}
        </div>
      )}

      {/* ── Save bar ─────────────────────────────────────────────────────── */}
      {isFormActive && (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white
          px-5 py-3 shadow-sm">
          <div>
            {saveError && (
              <p role="alert" className="text-sm text-red-600">{saveError}</p>
            )}
            {!saveError && isDirty && !isReadOnly && (
              <p className="text-sm text-amber-600">You have unsaved changes.</p>
            )}
          </div>
          {!isReadOnly && (
            <button
              onClick={onSave}
              disabled={!isDirty || isSaving}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      )}

      {/* ── Assignment picker modal ──────────────────────────────────────── */}
      {showPicker && (
        <AssignmentPickerModal
          existingAssignments={assignments}
          onConfirm={(selected) => {
            onAddAssignments(selected)
            setShowPicker(false)
          }}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
