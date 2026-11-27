import { CalendarDays, Files, GraduationCap, LayoutDashboard, MessageSquare, Scale, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { Sessao } from '../types'
import { perfis } from './format'

const links = [
  { url: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, management: true },
  { url: '/assistidos', label: 'Assistidos', icon: UsersRound },
  { url: '/atendimentos', label: 'Atendimentos', icon: MessageSquare },
  { url: '/casos', label: 'Casos', icon: Files },
  { url: '/prazos', label: 'Prazos', icon: CalendarDays },
  { url: '/supervisao', label: 'Supervisão', icon: GraduationCap, teacher: true },
]
export function Sidebar({ usuario }: { usuario: Sessao }) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark"><Scale size={21} /></span><div><strong>Prática Jurídica</strong><small>UNINASSAU · JP</small></div></div>
    <nav aria-label="Menu principal">{links.filter(link => !(link.management && usuario.perfil === 'ALUNO') && !(link.teacher && usuario.perfil !== 'PROFESSOR')).map(({ url, label, icon: Icon }) =>
      <NavLink key={url} to={url}><Icon size={16} />{label}</NavLink>)}</nav>
    <div className="sidebar-user"><strong>{usuario.nome}</strong><small>{perfis[usuario.perfil]}</small></div>
  </aside>
}
