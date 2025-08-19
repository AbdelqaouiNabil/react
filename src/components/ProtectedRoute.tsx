import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type UserRole } from '../auth/AuthProvider'

export function ProtectedRoute({ allow }: { allow: UserRole[] }) {
  const { loading, user, role } = useAuth()

  // Wait while auth is initializing OR profile/role is still loading for a logged-in user
  if (loading || (user && role == null)) return null
  if (!user) return <Navigate to="/login" replace />
  if (!role || !allow.includes(role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
