import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LockKeyhole, Plus } from 'lucide-react'
import { assistidos } from '../services/assistidos'
import { atendimentos } from '../services/atendimentos'
import { casos } from '../services/casos'
import { Badge, Feedback, Field, Form, Heading, Modal, Table} from '../components/ui'
import { value } from '../components/formValues'
import { codigo, dataCurta, encerrado } from '../components/format'
import { useData } from '../components/useData'

async function carregar(signal: AbortSignal) {
  const [pessoas, registros, processos] = await Promise.all([assistidos.listar(signal), atendimentos.listar(signal), casos.listar(signal)])
  return { pessoas, registros, processos }
}

export function Assistidos() {
  const query = useData(carregar)
  const [novo, setNovo] = useState(false)
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('')
  const [periodo, setPeriodo] = useState('')
  const rows = query.data?.pessoas.map(pessoa => ({
    pessoa,
    casos: query.data!.processos.filter(caso => caso.assistido_id === pessoa.id),
    registros: query.data!.registros.filter(registro => registro.assistido_id === pessoa.id),
  })).filter(row => {
    const status = row.casos.some(caso => !encerrado(caso)) ? 'EM_ANDAMENTO' : row.casos.length ? 'ENCERRADO' : ''
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    const cpf = termo.replace(/\D/g, '')
    return (row.pessoa.nome.toLocaleLowerCase('pt-BR').includes(termo) || (cpf && row.pessoa.cpf.replace(/\D/g, '').includes(cpf))) &&
      (!situacao || status === situacao) && (!periodo || row.registros.some(registro => Date.now() - new Date(registro.data_hora).getTime() <= Number(periodo) * 86400000))
  })
  return <>
    <Heading title="Assistidos" description="Pessoas atendidas pela prática jurídica" action={<button className="primary" onClick={() => setNovo(true)}><Plus size={16} /> Novo assistido</button>} />
    <div className="filters">
      <Field label="Buscar"><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome ou CPF" /></Field>
      <Field label="Situação"><select value={situacao} onChange={e => setSituacao(e.target.value)}><option value="">Todas</option><option value="EM_ANDAMENTO">Em andamento</option><option value="ENCERRADO">Encerrado</option></select></Field>
      <Field label="Período do último atendimento"><select value={periodo} onChange={e => setPeriodo(e.target.value)}><option value="">Todos</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></Field>
    </div>
    {rows ? <Table columns={['Assistido', 'CPF', 'Telefone', 'Histórico', 'Situação']} empty={!rows.length}>{rows.map(({ pessoa, casos, registros }) =>
      <tr key={pessoa.id}><td><Link to={`/assistidos/${pessoa.id}`}>{pessoa.nome}</Link></td><td>{pessoa.cpf}</td><td>{pessoa.telefone || '—'}</td>
      <td>{casos.length} caso(s) · {registros.length} atendimento(s)</td><td>{casos.length ? <Badge status={casos.some(caso => !encerrado(caso)) ? 'EM_ANDAMENTO' : 'ENCERRADO'} /> : 'Sem casos'}</td></tr>)}</Table>
      : <Feedback error={query.error} retry={query.reload} />}
    {novo && <Modal title="Novo assistido" close={() => setNovo(false)}><Form label="Salvar assistido" cancel={() => setNovo(false)} onSave={async form => {
      await assistidos.criar({ nome: value(form, 'nome'), cpf: value(form, 'cpf'), telefone: value(form, 'telefone') || null, email: value(form, 'email') || null, endereco: value(form, 'endereco') || null, observacoes: value(form, 'observacoes') || null })
      setNovo(false)
      query.reload()
    }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo"><input name="nome" maxLength={250} required /></Field>
        <Field label="CPF"><input name="cpf" minLength={11} maxLength={14} required /></Field>
        <Field label="Telefone"><input name="telefone" type="tel" /></Field>
        <Field label="E-mail"><input name="email" type="email" /></Field>
      </div>
      <Field label="Endereço"><input name="endereco" /></Field>
      <Field label="Observações"><textarea name="observacoes" /></Field>
      <p className="privacy"><LockKeyhole size={14} /> Dados pessoais protegidos pela LGPD.</p>
    </Form></Modal>}
  </>
}

export function AssistidoDetalhe() {
  const id = Number(useParams().id)
  const load = useCallback(async (signal: AbortSignal) => {
    if (!Number.isSafeInteger(id) || id < 1) throw new Error('Assistido inválido.')
    const [pessoa, registros, processos] = await Promise.all([assistidos.obter(id, signal), atendimentos.listar(signal), casos.listar(signal)])
    return { pessoa, registros: registros.filter(item => item.assistido_id === id).sort((a, b) => Date.parse(b.data_hora) - Date.parse(a.data_hora)), processos: processos.filter(item => item.assistido_id === id) }
  }, [id])
  const query = useData(load)
  if (!query.data) return <Feedback error={query.error} retry={query.reload} />
  const { pessoa, registros, processos } = query.data
  return <>
    <Heading title={pessoa.nome} description={`CPF ${pessoa.cpf}`} action={<Link className="primary" to={`/atendimentos/novo?assistido=${id}`}>Novo atendimento</Link>} />
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <section className="panel"><h2>Dados pessoais</h2><dl className="grid gap-2">{[['Telefone', pessoa.telefone], ['E-mail', pessoa.email], ['Endereço', pessoa.endereco], ['Observações', pessoa.observacoes]].map(([label, data]) => <div key={label}><dt className="text-muted">{label}</dt><dd>{data || '—'}</dd></div>)}</dl><p className="privacy">A edição de cadastro depende de suporte da API.</p></section>
      <div className="grid gap-4"><section className="panel"><h2>Casos jurídicos</h2>{processos.length ? <ul className="record-list">{processos.map(caso => <li key={caso.id}><Link to={`/casos/${caso.id}`}>{codigo(caso.id)} · {caso.titulo}</Link><Badge status={caso.status} /></li>)}</ul> : <p>Nenhum caso registrado.</p>}</section>
      <section className="panel"><h2>Histórico de atendimentos</h2>{registros.length ? <ul className="record-list">{registros.map(item => <li key={item.id}><div><strong>{dataCurta(item.data_hora)}</strong><p>{item.relato}</p></div><Link to={`/casos/${item.caso_juridico_id}`}>{codigo(item.caso_juridico_id)}</Link></li>)}</ul> : <p>Nenhum atendimento registrado.</p>}</section></div>
    </div>
  </>
}
