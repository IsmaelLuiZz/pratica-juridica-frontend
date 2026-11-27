import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Check, Circle, FileText, GraduationCap, History, Plus } from 'lucide-react'
import { useAuth } from '../contexts/session'
import { alertaPrazo, codigo, dataCurta, encerrado, podeMovimentar } from '../components/format'
import { Badge, Feedback, Field, Form, Heading, Modal} from '../components/ui'
import { value } from '../components/formValues'
import { useData } from '../components/useData'
import { atividades } from '../services/atividades'
import { assistidos } from '../services/assistidos'
import { atendimentos } from '../services/atendimentos'
import { casos } from '../services/casos'
import { documentos } from '../services/documentos'
import { prazos } from '../services/prazos'
import { supervisionar } from '../services/supervisao'
import type { Documento } from '../types'

import { statusDocumento } from '../services/documentos'
function urlDocumento(path?: string | null) {
  if (!path) return
  try {
    const url = new URL(path)
    if (['http:', 'https:'].includes(url.protocol)) return url.href
  } catch { return }
}

export function RevisarDocumento({ documento, close, saved }: { documento: Documento; close: () => void; saved: () => void }) {
  return <Modal title={`Revisar · ${documento.titulo}`} close={close}><Form label="Registrar parecer" cancel={close} onSave={async form => {
    const status = value(form, 'status') === 'APROVADO' ? 'APROVADO' : 'REJEITADO_AJUSTES'
    const observacoes_professor = value(form, 'observacoes')
    if (status === 'REJEITADO_AJUSTES' && !observacoes_professor) throw new Error('Descreva os ajustes solicitados.')
    await supervisionar(documento.id, { status, observacoes_professor: observacoes_professor || undefined })
    saved()
  }}>
    <Field label="Parecer"><select name="status"><option value="APROVADO">Aprovar peça</option><option value="REJEITADO_AJUSTES">Solicitar ajustes</option></select></Field>
    <Field label="Observações do professor"><textarea name="observacoes" /></Field>
  </Form></Modal>
}

const secoes = [
  ['atividades', 'Atividades', Check], ['prazos', 'Prazos', CalendarDays], ['documentos', 'Documentos', FileText],
  ['supervisao', 'Supervisão docente', GraduationCap], ['historico', 'Histórico', History],
] as const
type Secao = typeof secoes[number][0]
type ModalAtual = { tipo: 'atividade' | 'prazo' | 'documento' | 'encerrar' } | { tipo: 'revisao'; documento: Documento } | { tipo: 'concluir'; id: number }

export function CasoDetalhe() {
  const id = Number(useParams().id)
  const { usuario } = useAuth()
  const [secao, setSecao] = useState<Secao>('atividades')
  const [modal, setModal] = useState<ModalAtual>()
  const load = useCallback(async (signal: AbortSignal) => {
    if (!Number.isSafeInteger(id) || id < 1) throw new Error('Caso inválido.')
    const caso = await casos.obter(id, signal)
    const [pessoa, tarefas, vencimentos, pecas, registros] = await Promise.all([
      assistidos.obter(caso.assistido_id, signal), atividades.listar(signal), prazos.listar(signal), documentos.listar(signal), atendimentos.listar(signal),
    ])
    return { caso, pessoa, tarefas: tarefas.filter(item => item.caso_juridico_id === id), vencimentos: vencimentos.filter(item => item.caso_juridico_id === id).sort((a, b) => Date.parse(a.data_vencimento) - Date.parse(b.data_vencimento)), pecas: pecas.filter(item => item.caso_juridico_id === id), registros: registros.filter(item => item.caso_juridico_id === id) }
  }, [id])
  const query = useData(load)
  if (!query.data || !usuario) return <Feedback error={query.error} retry={query.reload} />
  const { caso, pessoa, tarefas, vencimentos, pecas, registros } = query.data
  const movimentar = podeMovimentar(caso, usuario)
  const professor = usuario.perfil === 'PROFESSOR' && movimentar
  const close = () => setModal(undefined)
  const saved = () => { close(); query.reload() }
  const eventos = [
    { key: 'caso', data: caso.criado_em, descricao: 'Abertura do caso' },
    ...tarefas.map(item => ({ key: `t${item.id}`, data: item.criado_em, descricao: `Atividade criada · ${item.descricao}` })),
    ...vencimentos.map(item => ({ key: `p${item.id}`, data: item.criado_em, descricao: `Prazo registrado · ${item.descricao}` })),
    ...pecas.map(item => ({ key: `d${item.id}`, data: item.data_criacao, descricao: `Documento registrado · ${item.titulo}` })),
    ...registros.map(item => ({ key: `a${item.id}`, data: item.data_hora, descricao: `Atendimento · ${item.relato}` })),
  ].sort((a, b) => Date.parse(b.data) - Date.parse(a.data))
  const novo = (tipo: 'atividade' | 'prazo' | 'documento', label: string) => movimentar && <button className="primary" onClick={() => setModal({ tipo })}><Plus size={15} /> {label}</button>
  return <>
    <Heading title={`${codigo(id)} · ${caso.titulo}`} description={`Aberto em ${dataCurta(caso.criado_em)}`}
      action={<div className="flex flex-wrap items-center gap-2"><Badge status={caso.status} />{movimentar && <button className="secondary" onClick={() => setModal({ tipo: 'encerrar' })}>Encerrar caso</button>}</div>} />
    {!movimentar && !encerrado(caso) && <p className="notice">Somente os responsáveis vinculados e a coordenação podem movimentar este caso.</p>}
    <nav className="mb-4 flex flex-wrap gap-2" aria-label="Seções do caso">{secoes.map(([key, label, Icon]) =>
      <button key={key} className={secao === key ? 'primary' : 'secondary'} aria-pressed={secao === key} onClick={() => setSecao(key)}><Icon size={15} />{label}</button>)}</nav>
    <div className="grid items-start gap-4 xl:grid-cols-[2fr_1fr]">
      <div className="grid gap-4">
        {secao === 'atividades' && <section className="panel"><div className="flex items-center justify-between gap-2"><h2>Atividades</h2>{novo('atividade', 'Nova atividade')}</div>
          {tarefas.length ? <ul className="record-list">{tarefas.map(item => <li key={item.id}><div className="flex items-center gap-2">{item.status === 'CONCLUIDO' ? <Check size={16} className="text-emerald-700" /> : <Circle size={15} className="text-amber-600" />}<span>{item.descricao}</span></div><div className="flex items-center gap-2"><Badge status={item.status} />{movimentar && item.status !== 'CONCLUIDO' && <button className="secondary" onClick={() => setModal({ tipo: 'concluir', id: item.id })}>Concluir</button>}</div></li>)}</ul> : <p>Nenhuma atividade registrada.</p>}
        </section>}
        {secao === 'prazos' && <section className="panel"><div className="flex items-center justify-between gap-2"><h2>Prazos</h2>{novo('prazo', 'Novo prazo')}</div>
          {vencimentos.length ? <ul className="record-list">{vencimentos.map(item => <li key={item.id}><div><strong>{item.descricao}</strong><p>{dataCurta(item.data_vencimento)}</p></div><Badge status={alertaPrazo(item.data_vencimento, item.status)} /></li>)}</ul> : <p>Nenhum prazo registrado.</p>}
        </section>}
        {(secao === 'documentos' || secao === 'supervisao') && <section className="panel">
          <div className="flex items-center justify-between gap-2"><h2>{secao === 'documentos' ? 'Documentos' : 'Supervisão docente'}</h2>{secao === 'documentos' && novo('documento', 'Registrar documento')}</div>
          {secao === 'supervisao' && <p className="mb-2 text-muted">O parecer é registrado pelo professor orientador nas peças do caso.</p>}
          {pecas.length ? <ul className="record-list">{pecas.map(item => {
            const url = urlDocumento(item.caminho_arquivo)
            return <li key={item.id}><div>{url ? <a href={url} target="_blank" rel="noreferrer">{item.titulo}</a> : <strong>{item.titulo}</strong>}<p>{item.tipo}</p>{item.descricao && <p className="whitespace-pre-wrap">{item.descricao}</p>}</div>
              <div className="flex items-center gap-2"><Badge status={statusDocumento(item)} />{professor && secao === 'supervisao' && <button className="secondary" onClick={() => setModal({ tipo: 'revisao', documento: item })}>Revisar</button>}</div></li>
          })}</ul> : <p>Nenhum documento registrado.</p>}
        </section>}
        {(secao === 'historico' || secao === 'atividades') && <section className="panel"><h2>Histórico do caso</h2><ol className="record-list">{(secao === 'historico' ? eventos : eventos.slice(0, 4)).map(evento =>
          <li key={evento.key}><div><span className="mr-2 text-gold" aria-hidden="true">●</span><strong>{dataCurta(evento.data)}</strong> · {evento.descricao}</div></li>)}</ol></section>}
      </div>
      <aside className="grid gap-4">
        <section className="panel"><h2>Responsáveis</h2><dl className="grid gap-2"><div><dt className="text-xs text-muted uppercase">Estudante responsável</dt><dd>{usuario.id === caso.aluno_id ? usuario.nome : `Aluno #${caso.aluno_id}`}</dd></div>
          <div><dt className="text-xs text-muted uppercase">Professor orientador</dt><dd>{usuario.id === caso.professor_id ? usuario.nome : `Professor #${caso.professor_id}`}</dd></div><div><dt className="text-xs text-muted uppercase">Assistido</dt><dd><Link to={`/assistidos/${pessoa.id}`}>{pessoa.nome}</Link></dd></div></dl></section>
        {secao !== 'prazos' && <section className="panel"><h2>Prazos</h2>{vencimentos.length ? <ul className="record-list">{vencimentos.slice(0, 4).map(item => <li key={item.id}><span>{dataCurta(item.data_vencimento)} · {item.descricao}</span><Badge status={alertaPrazo(item.data_vencimento, item.status)} /></li>)}</ul> : <p>Nenhum prazo registrado.</p>}</section>}
        {secao !== 'documentos' && <section className="panel"><h2>Documentos</h2>{pecas.length ? <ul className="record-list">{pecas.slice(0, 4).map(item => <li key={item.id}><span className="flex items-center gap-2"><FileText size={14} />{item.titulo}</span></li>)}</ul> : <p>Nenhum documento registrado.</p>}</section>}
        <section className="panel"><h2>Descrição do caso</h2><p className="whitespace-pre-wrap">{caso.descricao}</p></section>
      </aside>
    </div>
    {modal?.tipo === 'atividade' && <Modal title="Nova atividade" close={close}><Form cancel={close} onSave={async form => {
      await atividades.criar({ descricao: value(form, 'descricao'), caso_juridico_id: id, responsavel_id: caso.aluno_id }); saved()
    }}><Field label="Descrição"><textarea name="descricao" required /></Field></Form></Modal>}
    {modal?.tipo === 'concluir' && <Modal title="Concluir atividade" close={close}><Form cancel={close} label="Concluir atividade" onSave={async () => {
      await atividades.atualizar(modal.id, { status: 'CONCLUIDO' }); saved()
    }}><p>Confirme a conclusão da atividade.</p></Form></Modal>}
    {modal?.tipo === 'prazo' && <Modal title="Novo prazo" close={close}><Form cancel={close} onSave={async form => {
      await prazos.criar({ descricao: value(form, 'descricao'), caso_juridico_id: id, data_vencimento: new Date(value(form, 'data')).toISOString() }); saved()
    }}><Field label="Descrição"><textarea name="descricao" required /></Field><Field label="Vencimento"><input name="data" type="datetime-local" required /></Field></Form></Modal>}
    {modal?.tipo === 'documento' && <Modal title="Registrar documento" close={close}><Form cancel={close} onSave={async form => {
      const url = urlDocumento(value(form, 'url'))
      if (!url) throw new Error('Informe um link HTTP ou HTTPS válido.')
      await documentos.criar({ titulo: value(form, 'titulo'), tipo: value(form, 'tipo'), caminho_arquivo: url, descricao: value(form, 'descricao') || null, caso_juridico_id: id }); saved()
    }}><Field label="Título"><input name="titulo" required /></Field><Field label="Tipo"><input name="tipo" required /></Field><Field label="Link do arquivo"><input name="url" type="url" maxLength={500} required /></Field><Field label="Descrição"><textarea name="descricao" /></Field></Form></Modal>}
    {modal?.tipo === 'revisao' && professor && <RevisarDocumento documento={modal.documento} close={close} saved={saved} />}
    {modal?.tipo === 'encerrar' && <Modal title="Encerrar caso" close={close}><p>O encerramento depende de uma operação de atualização que ainda não está disponível na API.</p></Modal>}
  </>
}
