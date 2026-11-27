import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CheckSquare, FileArchive, FolderOpen, MessageSquare, Plus } from 'lucide-react'
import { carregarDashboard } from '../services/dashboard'
import { useData } from '../components/useData'
import { Badge, Feedback, Field, Heading } from '../components/ui'
import { alertaPrazo, codigo, dataCurta, dataFiltro, encerrado, prazoAberto } from '../components/format'

export function Dashboard() {
  const query = useData(carregarDashboard)
  const [now] = useState(Date.now)
  const [inicio, setInicio] = useState(() => dataFiltro(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()))
  const [fim, setFim] = useState(() => dataFiltro(new Date().toISOString()))
  if (!query.data) return <Feedback error={query.error} retry={query.reload} />
  const { processos, registros, tarefas, vencimentos } = query.data

  const proximos = vencimentos.filter(prazo => prazoAberto(prazo.status) && Date.parse(prazo.data_vencimento) >= now && Date.parse(prazo.data_vencimento) <= now + 7 * 86400000)
    .sort((a, b) => Date.parse(a.data_vencimento) - Date.parse(b.data_vencimento))
  const atendidos = registros.filter(item => (!inicio || dataFiltro(item.data_hora) >= inicio) && (!fim || dataFiltro(item.data_hora) <= fim))
    .sort((a, b) => Date.parse(b.data_hora) - Date.parse(a.data_hora))
  const cards = [
    ['Casos ativos', processos.filter(caso => !encerrado(caso)).length, FolderOpen, 'bg-blue-100 text-blue-800'],
    ['Casos encerrados', processos.filter(encerrado).length, FileArchive, 'bg-slate-100 text-slate-800'],
    ['Atendimentos no período', atendidos.length, MessageSquare, 'bg-violet-100 text-violet-800'],
    ['Atividades pendentes', tarefas.filter(item => item.status === 'PENDENTE').length, CheckSquare, 'bg-amber-100 text-amber-800'],
    ['Prazos próximos', proximos.length, CalendarDays, 'bg-rose-100 text-rose-800'],
  ] as const
  const situacoes = [...new Set(processos.map(caso => caso.status))].map(status => ({ status, total: processos.filter(caso => caso.status === status).length }))
  return <>
    <Heading title="Dashboard" description="Visão geral da operação da prática jurídica" action={<Link to="/atendimentos/novo" className="primary"><Plus size={16} /> Novo atendimento</Link>} />
    <div className="filters max-w-xl"><Field label="Atendimentos a partir de"><input type="date" value={inicio} max={fim || undefined} onChange={e => setInicio(e.target.value)} /></Field><Field label="Até"><input type="date" value={fim} min={inicio || undefined} onChange={e => setFim(e.target.value)} /></Field></div>
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, total, Icon, tone]) => <div className="panel flex items-center gap-3" key={label}><span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone}`}><Icon size={19} /></span><div><strong className="block text-2xl">{total}</strong><span className="text-xs text-muted">{label}</span></div></div>)}</div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel"><h2>Casos por situação</h2>{situacoes.length ? <ul className="grid gap-2">{situacoes.map(({ status, total }) => <li key={status ?? ''} className="grid grid-cols-[minmax(8rem,auto)_1fr_auto] items-center gap-2"><span><Badge status={status} /></span><progress className="w-full accent-navy" value={total} max={processos.length} aria-label={status ?? 'Sem situação'} /><strong>{total}</strong></li>)}</ul> : <p>Nenhum caso registrado.</p>}</section>
      <section className="panel"><h2>Atendimentos recentes</h2>{atendidos.length ? <ul className="record-list">{atendidos.slice(0, 5).map(item => <li key={item.id}><Link to={`/casos/${item.caso_juridico_id}`}>{codigo(item.caso_juridico_id)}</Link><span>{dataCurta(item.data_hora)}</span></li>)}</ul> : <p>Nenhum atendimento no período.</p>}</section>
      <section className="panel lg:col-span-2"><h2>Prazos próximos · 7 dias</h2>{proximos.length ? <ul className="record-list">{proximos.slice(0, 8).map(item => <li key={item.id}><div><Link to={`/casos/${item.caso_juridico_id}`}>{codigo(item.caso_juridico_id)}</Link><p>{item.descricao}</p></div><span>{dataCurta(item.data_vencimento)} · <Badge status={alertaPrazo(item.data_vencimento, item.status)} /></span></li>)}</ul> : <p>Nenhum prazo próximo.</p>}</section>
    </div>
  </>
}
