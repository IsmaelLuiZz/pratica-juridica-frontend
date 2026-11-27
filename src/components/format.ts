import type { Caso, Sessao } from '../types'
export const perfis = { ALUNO: 'Aluno/Estagiário', PROFESSOR: 'Professor/Orientador', ADMIN: 'Gestão/Coordenação' }
const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
export const dataCurta = (value: string) => date.format(new Date(value))
export const dataFiltro = (value: string) => new Date(value).toLocaleDateString('sv-SE')
export const codigo = (id: number) => `Caso #${id}`
export const encerrado = (caso: Caso) => ['ENCERRADO', 'INATIVO'].includes(caso.status ?? '')
export const podeMovimentar = (caso: Caso, usuario: Sessao) => !encerrado(caso) && (usuario.perfil === 'ADMIN' || (usuario.perfil === 'ALUNO' ? caso.aluno_id === usuario.id : caso.professor_id === usuario.id))
export const prazoAberto = (status?: string | null) => !['CONCLUIDO', 'CANCELADO'].includes(status ?? '')
export function alertaPrazo(vencimento: string, status?: string | null) {
  if (!prazoAberto(status)) return status
  const delta = new Date(vencimento).getTime() - Date.now()
  return delta < 0 ? 'ATRASADO' : delta <= 7 * 86400000 ? 'VENCE_EM_BREVE' : status ?? 'PENDENTE'
}
