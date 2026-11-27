import { atendimentos } from './atendimentos'
import { atividades } from './atividades'
import { casos } from './casos'
import { prazos } from './prazos'

export async function carregarDashboard(signal?: AbortSignal) {
  const [processos, registros, tarefas, vencimentos] = await Promise.all([
    casos.listar(signal), atendimentos.listar(signal), atividades.listar(signal), prazos.listar(signal),
  ])
  return { processos, registros, tarefas, vencimentos }
}
