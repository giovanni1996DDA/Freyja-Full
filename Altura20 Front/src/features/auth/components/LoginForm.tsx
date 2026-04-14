import { useState } from 'react'
import type { LoginFormValues } from '../types'
import { login } from '../services/authService'
import { useAuthStore } from '../store/useAuthStore'
import { useMenuStore } from '../store/useMenuStore'
import { filterMenuTree } from '../lib/menuPermissions'
import { FULL_MENU } from '../config/menuConfig'

export function LoginForm() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setVisibleMenu = useMenuStore((s) => s.setVisibleMenu)

  const [values, setValues] = useState<LoginFormValues>({ username: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!values.username.trim()) {
      setError('Username is required.')
      return
    }
    if (!values.password) {
      setError('Password is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await login(values)
      // Resolve the visible menu once based on the user's permissions,
      // then persist both auth and menu together.
      const visibleMenu = filterMenuTree(FULL_MENU, response.user.permissionIds)
      setAuth(response.user, response.accessToken, response.refreshToken)
      setVisibleMenu(visibleMenu)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
          placeholder="Your username"
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
