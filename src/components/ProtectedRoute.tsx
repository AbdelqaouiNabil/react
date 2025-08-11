import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type UserRole } from '../auth/AuthProvider'

export function ProtectedRoute({ allow }: { allow: UserRole[] }) {
  const { loading, user, role } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!role || !allow.includes(role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
