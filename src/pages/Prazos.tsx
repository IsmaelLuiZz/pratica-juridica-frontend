import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../components/useData'
import { alertaPrazo, codigo, dataCurta } from '../components/format'
import { Badge, Feedback, Field, Heading, Table } from '../components/ui'
import { prazos } from '../services/prazos'

export function Prazos() {
  const query = useData(prazos.listar)
  const [filtro, setFiltro] = useState('')
  const rows = query.data?.filter(item => !filtro || alertaPrazo(item.data_vencimento, item.status) === filtro)
    .sort((a, b) => Date.parse(a.data_vencimento) - Date.parse(b.data_vencimento))
  return <>
    <Heading title="Prazos" description="Acompanhe os vencimentos dos casos jurídicos" />
    <div className="filters max-w-xs"><Field label="Situação"><select value={filtro} onChange={e => setFiltro(e.target.value)}><option value="">Todas</option><option value="ATRASADO">Atrasados</option><option value="VENCE_EM_BREVE">Próximos 7 dias</option><option value="PENDENTE">Pendentes</option><option value="CONCLUIDO">Concluídos</option></select></Field></div>
    {rows ? <Table columns={['Descrição', 'Caso', 'Vencimento', 'Situação']} empty={!rows.length}>{rows.map(item => <tr key={item.id}><td>{item.descricao}</td><td><Link to={`/casos/${item.caso_juridico_id}`}>{codigo(item.caso_juridico_id)}</Link></td><td>{dataCurta(item.data_vencimento)}</td><td><Badge status={alertaPrazo(item.data_vencimento, item.status)} /></td></tr>)}</Table> : <Feedback error={query.error} retry={query.reload} />}
  </>
}
