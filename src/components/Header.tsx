import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/session'
export function Header() {
  const { sair } = useAuth()
  return <header className="topbar"><span>UNINASSAU · João Pessoa</span><button className="secondary" onClick={sair}><LogOut size={15} /> Sair</button></header>
}
