import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Field, Form, Heading, Feedback, Table, Badge} from '../components/ui'
import { carregarCasos, dadosCaso } from '../components/casoForm'
import { codigo, dataCurta } from '../components/format'
import { useData } from '../components/useData'
import { useAuth } from '../contexts/session'
import { assistidos } from '../services/assistidos'
import { casos } from '../services/casos'
import type { Sessao } from '../types'


export function Casos() {
  const { usuario } = useAuth()
  const query = useData(carregarCasos)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [vinculo, setVinculo] = useState(false)
  const rows = query.data?.processos.filter(caso =>
    `${codigo(caso.id)} ${caso.titulo} ${query.data!.pessoas.find(p => p.id === caso.assistido_id)?.nome ?? ''}`.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR')) &&
    (!status || caso.status === status) && (!vinculo || caso.aluno_id === usuario?.id))
  return <>
    <Heading title="Casos jurídicos" description="Acompanhe os processos da prática jurídica" action={<Link to="/casos/novo" className="primary"><Plus size={16} /> Novo caso</Link>} />
    <div className="filters"><Field label="Buscar"><input placeholder="Título, número ou assistido" value={busca} onChange={e => setBusca(e.target.value)} /></Field>
      <Field label="Situação"><select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todas</option>{[...new Set(query.data?.processos.flatMap(caso => caso.status ? [caso.status] : []))].map(item => <option key={item} value={item}>{item.replaceAll('_', ' ').toLocaleLowerCase('pt-BR')}</option>)}</select></Field>
      {usuario?.perfil === 'ALUNO' && <label className="flex items-center gap-2 p-2"><input className="w-auto" type="checkbox" checked={vinculo} onChange={e => setVinculo(e.target.checked)} /> Meus casos</label>}
    </div>
    {rows ? <Table columns={['Caso', 'Assistido', 'Abertura', 'Situação']} empty={!rows.length}>{rows.map(caso => <tr key={caso.id}>
      <td><Link to={`/casos/${caso.id}`}>{codigo(caso.id)} · {caso.titulo}</Link></td>
      <td>{query.data!.pessoas.find(p => p.id === caso.assistido_id)?.nome ?? `#${caso.assistido_id}`}</td><td>{dataCurta(caso.criado_em)}</td><td><Badge status={caso.status} /></td>
    </tr>)}</Table> : <Feedback error={query.error} retry={query.reload} />}
  </>
}

async function carregarCadastro(signal: AbortSignal) {
  const [pessoas, alunos] = await Promise.all([assistidos.listar(signal), casos.alunos(signal)])
  return { pessoas, alunos: alunos.filter(aluno => aluno.ativo) }
}
const classificacoes = ['Autor', 'Réu', 'Requerente', 'Requerido']

export function CamposCaso({ usuario, alunos }: { usuario: Sessao; alunos: Awaited<ReturnType<typeof casos.alunos>> }) {
  return <>
    <Field label="Título do caso"><input name="titulo" maxLength={250} required /></Field>
    <Field label="Descrição dos fatos"><textarea name="descricao" required /></Field>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Classificação do assistido"><select name="classificacao" defaultValue="" required><option value="">Selecione</option>{classificacoes.map(item => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Outra parte"><input name="outra_parte" required /></Field>
      <Field label="Classificação da outra parte"><select name="outra_classificacao" defaultValue="" required><option value="">Selecione</option>{classificacoes.map(item => <option key={item}>{item}</option>)}</select></Field>
      <Field label="Aluno responsável"><select name="aluno_id" defaultValue={usuario.perfil === 'ALUNO' ? usuario.id : ''} required>
        {usuario.perfil === 'ALUNO' ? <option value={usuario.id}>{usuario.nome}</option> : <><option value="">Selecione</option>{alunos.map(aluno => <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>)}</>}
      </select></Field>
      <Field label="Professor orientador">{usuario.perfil === 'PROFESSOR' ? <input value={usuario.nome} readOnly /> : <input type="number" name="professor_id" min={1} step={1} required aria-describedby="professor-id" />}</Field>
    </div>
    {usuario.perfil !== 'PROFESSOR' && <p id="professor-id" className="text-xs text-muted">Informe o ID do professor orientador. A API não oferece listagem de professores.</p>}
  </>
}


export function NovoCaso() {
  const query = useData(carregarCadastro)
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  if (!query.data || !usuario) return <Feedback error={query.error} retry={query.reload} />
  return <>
    <Heading title="Novo caso jurídico" description="Identifique as partes e os responsáveis pelo caso" />
    <section className="panel max-w-3xl"><Form label="Abrir caso jurídico" cancel={() => navigate('/casos')} onSave={async form => {
      const caso = await casos.criar(dadosCaso(form, usuario))
      navigate(`/casos/${caso.id}`, { replace: true })
    }}>
      <Field label="Assistido"><select name="assistido_id" defaultValue={params.get('assistido') ?? ''} required><option value="">Selecione</option>{query.data.pessoas.map(pessoa => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}</select></Field>
      <CamposCaso usuario={usuario} alunos={query.data.alunos} />
    </Form></section>
  </>
}
