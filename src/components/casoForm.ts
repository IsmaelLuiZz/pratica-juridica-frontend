import { assistidos } from '../services/assistidos'
import { casos } from '../services/casos'
import { encerrado } from './format'
import { value } from './formValues'
import type { Sessao } from '../types'

export async function carregarCasos(signal: AbortSignal) {
  const [processos, pessoas] = await Promise.all([casos.listar(signal), assistidos.listar(signal)])
  return { processos, pessoas }
}

export function dadosCaso(form: FormData, usuario: Sessao) {
  return {
    titulo: value(form, 'titulo'),
    descricao: `${value(form, 'descricao')}\n\nPartes envolvidas\nAssistido: ${value(form, 'classificacao')}\n${value(form, 'outra_parte')}: ${value(form, 'outra_classificacao')}`,
    assistido_id: Number(form.get('assistido_id')),
    aluno_id: usuario.perfil === 'ALUNO' ? usuario.id : Number(form.get('aluno_id')),
    professor_id: usuario.perfil === 'PROFESSOR' ? usuario.id : Number(form.get('professor_id')),
    status: 'EM_ANDAMENTO',
  }
}

export const casosAbertos = (data: Awaited<ReturnType<typeof casos.listar>>, usuario: Sessao) => data.filter(caso =>
  !encerrado(caso) && (usuario.perfil !== 'ALUNO' || caso.aluno_id === usuario.id))
