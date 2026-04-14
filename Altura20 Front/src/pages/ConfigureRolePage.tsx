import { useState, useEffect } from 'react'
import { useRoleForm } from '../features/roles/hooks/useRoleForm'
import { RoleForm, EmptySearchModal, ConfirmDeleteModal } from '../features/roles/components/RoleForm'

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ConfigureRolePage() {
  const form = useRoleForm()

  // Warn on browser close / tab refresh when there are unsaved changes
  useEffect(() => {
    if (!form.isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [form.isDirty])

  // Local state for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ── Access guard ────────────────────────────────────────────────────────────
  if (!form.canView) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-gray-500">
          You do not have permission to access this screen.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Configure Role</h1>
        <p className="mt-1 text-sm text-gray-500">Search for a role to view or edit, or create a new one.</p>
      </div>

      {/* Main form */}
      <RoleForm
        mode={form.mode}
        isReadOnly={form.isReadOnly}
        canCreate={form.canCreate}
        canDelete={form.canDelete}
        searchName={form.searchName}
        isSearching={form.isSearching}
        onSearchNameChange={form.handleSearchNameChange}
        onSearch={form.handleSearch}
        formValues={form.formValues}
        onFormChange={form.handleFormChange}
        assignments={form.assignments}
        onRemoveAssignment={form.handleRemoveAssignment}
        onAddAssignments={form.handleAddAssignments}
        isDirty={form.isDirty}
        isSaving={form.isSaving}
        isDeleting={form.isDeleting}
        onSave={form.handleSave}
        onDelete={() => setShowDeleteConfirm(true)}
        error={form.error}
        saveError={form.saveError}
      />

      {/* Empty-name search placeholder modal */}
      {form.showEmptySearchModal && (
        <EmptySearchModal onClose={form.handleCloseEmptyModal} />
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && form.loadedRole && (
        <ConfirmDeleteModal
          roleName={form.loadedRole.name}
          isDeleting={form.isDeleting}
          onConfirm={async () => {
            setShowDeleteConfirm(false)
            await form.handleDelete()
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
