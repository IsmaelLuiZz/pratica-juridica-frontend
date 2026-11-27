import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/session'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
export function Layout() {
  const { usuario } = useAuth()
  if (!usuario) return null
  return <div className="shell"><Sidebar usuario={usuario} /><div className="workspace"><Header /><main className="content"><Outlet /></main></div></div>
}
