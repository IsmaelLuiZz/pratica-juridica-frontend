import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useData } from '../components/useData'
import { codigo, dataCurta, dataFiltro } from '../components/format'
import { Feedback, Field, Form, Heading, Table} from '../components/ui'
import { value } from '../components/formValues'
import { atendimentos } from '../services/atendimentos'
import { casos } from '../services/casos'
import { useAuth } from '../contexts/session'
import { CamposCaso } from './Casos'
import { carregarCasos, casosAbertos, dadosCaso } from '../components/casoForm'
import type { Caso } from '../types'

async function carregar(signal: AbortSignal) {
  const [catalogo, registros] = await Promise.all([carregarCasos(signal), atendimentos.listar(signal)])
  return { ...catalogo, registros: registros.sort((a, b) => Date.parse(b.data_hora) - Date.parse(a.data_hora)) }
}
async function carregarNovo(signal: AbortSignal) {
  const [catalogo, alunos] = await Promise.all([carregarCasos(signal), casos.alunos(signal)])
  return { ...catalogo, alunos: alunos.filter(aluno => aluno.ativo) }
}

export function Atendimentos() {
  const query = useData(carregar)
  const [params] = useSearchParams()
  const [pessoa, setPessoa] = useState(params.get('assistido') ?? '')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const rows = query.data?.registros.filter(item => (!pessoa || String(item.assistido_id) === pessoa) &&
    (!inicio || dataFiltro(item.data_hora) >= inicio) && (!fim || dataFiltro(item.data_hora) <= fim))
  return <>
    <Heading title="Atendimentos" description="Registro dos atendimentos realizados" action={<Link className="primary" to="/atendimentos/novo"><Plus size={16} /> Novo atendimento</Link>} />
    <div className="filters">
      <Field label="Assistido"><select value={pessoa} onChange={e => setPessoa(e.target.value)}><option value="">Todos</option>{query.data?.pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></Field>
      <Field label="De"><input type="date" value={inicio} max={fim || undefined} onChange={e => setInicio(e.target.value)} /></Field>
      <Field label="Até"><input type="date" value={fim} min={inicio || undefined} onChange={e => setFim(e.target.value)} /></Field>
    </div>
    {rows ? <Table columns={['Data', 'Assistido', 'Relato', 'Caso']} empty={!rows.length}>{rows.map(item => <tr key={item.id}><td>{dataCurta(item.data_hora)}</td><td><Link to={`/assistidos/${item.assistido_id}`}>{query.data!.pessoas.find(p => p.id === item.assistido_id)?.nome ?? `#${item.assistido_id}`}</Link></td><td className="whitespace-pre-wrap">{item.relato}</td><td><Link to={`/casos/${item.caso_juridico_id}`}>{codigo(item.caso_juridico_id)}</Link></td></tr>)}</Table>
      : <Feedback error={query.error} retry={query.reload} />}
  </>
}

export function NovoAtendimento() {
  const query = useData(carregarNovo)
  const [params] = useSearchParams()
  const [pessoa, setPessoa] = useState(params.get('assistido') ?? '')
  const [abrir, setAbrir] = useState(true)
  const [criado, setCriado] = useState<Caso>()
  const [etapa, setEtapa] = useState(false)
  const { usuario } = useAuth()
  const navigate = useNavigate()
  if (!query.data || !usuario) return <Feedback error={query.error} retry={query.reload} />
  const opcoes = casosAbertos(query.data.processos, usuario).filter(caso => caso.assistido_id === Number(pessoa))
  return <>
    <Heading title="Novo atendimento" description="Registre o atendimento e vincule o caso jurídico" />
    <ol className="mb-4 flex flex-wrap gap-3 text-muted"><li>1. Assistido</li><li>2. Atendimento</li><li className={etapa ? 'font-bold text-navy' : ''}>3. Caso jurídico</li></ol>
    <Form label={abrir && !etapa ? 'Salvar e continuar' : 'Registrar atendimento'} cancel={() => navigate(criado ? `/casos/${criado.id}` : '/atendimentos')} onSave={async form => {
      if (abrir && !etapa) { setEtapa(true); return }
      let caso = criado ?? opcoes.find(item => item.id === Number(form.get('caso_id')))
      if (!caso && abrir) {
        caso = await casos.criar(dadosCaso(form, usuario))
        setCriado(caso)
      }
      if (!caso) throw new Error('Selecione um caso jurídico.')
      await atendimentos.criar({ relato: value(form, 'relato'), caso_juridico_id: caso.id, assistido_id: caso.assistido_id, aluno_id: caso.aluno_id })
      navigate(`/casos/${caso.id}`, { replace: true })
    }}>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="panel"><h2>Dados do assistido</h2><Field label="Assistido"><select name="assistido_id" value={pessoa} onChange={e => setPessoa(e.target.value)} disabled={Boolean(criado)} required>
          <option value="">Selecione</option>{query.data.pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select></Field></section>
        <section className="panel"><h2>Registro do atendimento</h2><div className="grid gap-4">
          <Field label="Relato da demanda"><textarea name="relato" required /></Field>
          {!etapa && <label className="flex items-center gap-2"><input className="w-auto" type="checkbox" checked={abrir} onChange={e => setAbrir(e.target.checked)} /> Abrir caso a partir deste atendimento</label>}
          {!abrir && <Field label="Caso jurídico existente"><select key={pessoa} name="caso_id" required><option value="">Selecione</option>{opcoes.map(caso => <option key={caso.id} value={caso.id}>{codigo(caso.id)} · {caso.titulo}</option>)}</select></Field>}
        </div></section>
      </div>
      {abrir && etapa && !criado && <section className="panel grid gap-4"><h2>Abertura do caso</h2><CamposCaso usuario={usuario} alunos={query.data.alunos} /></section>}
      {criado && <p className="notice">{codigo(criado.id)} criado. Você pode tentar registrar o atendimento novamente neste caso.</p>}
    </Form>
  </>
}
