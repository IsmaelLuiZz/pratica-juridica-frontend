import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/session'
import type { Perfil } from '../types'
export function ProtectedRoute({ roles }: { roles?: Perfil[] }) {
  const { usuario } = useAuth()
  const location = useLocation()
  if (!usuario) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  if (roles && !roles.includes(usuario.perfil)) return <Navigate to="/casos" replace />
  return <Outlet />
}
