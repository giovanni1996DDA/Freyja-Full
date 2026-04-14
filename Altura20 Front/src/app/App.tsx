import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

ModuleRegistry.registerModules([AllCommunityModule])
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ConfigureRolePage } from '../pages/ConfigureRolePage'
import { MainLayout } from '../shared/layouts/MainLayout/MainLayout'
import { ProtectedRoute } from '../shared/components/ProtectedRoute'

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/dashboard',
          element: <DashboardPage />,
        },
        {
          path: '/admin/configure-role',
          element: <ConfigureRolePage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
)

export default function App() {
  return (
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
  )
}
