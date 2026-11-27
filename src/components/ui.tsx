import { useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { mensagemErro } from '../services/api'

const statusLabels: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento', AGUARDANDO_APROVACAO: 'Em supervisão', ENCERRADO: 'Encerrado', INATIVO: 'Inativo',
  PENDENTE: 'Pendente', CONCLUIDO: 'Concluído', ATRASADO: 'Atrasado', VENCE_EM_BREVE: 'Vence em breve',
  APROVADO: 'Aprovado', REJEITADO_AJUSTES: 'Ajustes solicitados',
}
export function Badge({ status }: { status?: string | null }) {
  const value = status ?? 'SEM_STATUS'
  return <span className="badge" data-status={value}>{statusLabels[value] ?? status ?? 'Sem situação'}</span>
}
export function Heading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>
}
export function Feedback({ error, retry }: { error?: string; retry?: () => void }) {
  return error ? <div className="notice error" role="alert">{error}{retry && <button className="secondary" onClick={retry}>Tentar novamente</button>}</div> : <p className="notice" role="status">Carregando…</p>
}
export function Table({ columns, children, empty }: { columns: string[]; children: ReactNode; empty: boolean }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{empty ? <tr><td colSpan={columns.length}>Nenhum registro encontrado.</td></tr> : children}</tbody></table></div>
}
export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <dialog className="modal" ref={element => { if (element && !element.open) element.showModal() }} onCancel={event => { event.preventDefault(); close() }} aria-label={title}>
    <div className="modal-heading"><h2>{title}</h2><button type="button" className="secondary icon-button" aria-label="Fechar" onClick={close}><X size={18} /></button></div>{children}
  </dialog>
}
export function Form({ children, onSave, label = 'Salvar', cancel }: { children: ReactNode; onSave: (values: FormData) => Promise<void>; label?: string; cancel?: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const values = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try { await onSave(values) } catch (reason) { setError(mensagemErro(reason)) } finally { setBusy(false) }
  }
  return <form onSubmit={submit}><fieldset disabled={busy} className="form-fields">{children}
    {error && <p className="notice error" role="alert">{error}</p>}
    <div className="form-actions">{cancel && <button type="button" className="secondary" onClick={cancel}>Cancelar</button>}<button className="primary">{busy ? 'Salvando…' : label}</button></div>
  </fieldset></form>
}
