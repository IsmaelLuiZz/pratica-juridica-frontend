import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/session'
import { useData } from '../components/useData'
import { codigo, podeMovimentar } from '../components/format'
import { Badge, Feedback, Heading, Table } from '../components/ui'
import { casos } from '../services/casos'
import { documentos, statusDocumento } from '../services/documentos'
import { RevisarDocumento } from './CasoDetalhe'
import type { Documento } from '../types'

async function carregar(signal: AbortSignal) {
  const [processos, pecas] = await Promise.all([casos.listar(signal), documentos.listar(signal)])
  return { processos, pecas }
}

export function Supervisao() {
  const { usuario } = useAuth()
  const query = useData(carregar)
  const [revisao, setRevisao] = useState<Documento>()
  const rows = query.data?.pecas.filter(item => query.data?.processos.some(caso => caso.id === item.caso_juridico_id && usuario && podeMovimentar(caso, usuario)))
  return <>
    <Heading title="Supervisão docente" description="Revise as peças dos casos sob sua orientação" />
    {rows ? <Table columns={['Documento', 'Caso', 'Parecer', 'Ação']} empty={!rows.length}>{rows.map(item => <tr key={item.id}><td>{item.titulo}</td><td><Link to={`/casos/${item.caso_juridico_id}`}>{codigo(item.caso_juridico_id)}</Link></td><td><Badge status={statusDocumento(item)} /></td><td><button className="secondary" onClick={() => setRevisao(item)}>Revisar</button></td></tr>)}</Table> : <Feedback error={query.error} retry={query.reload} />}
    {revisao && <RevisarDocumento documento={revisao} close={() => setRevisao(undefined)} saved={() => { setRevisao(undefined); query.reload() }} />}
  </>
}
