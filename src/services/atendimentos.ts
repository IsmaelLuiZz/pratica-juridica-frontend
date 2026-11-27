import { api, listarPaginado } from './api'
import type { Atendimento, AtendimentoCreate } from '../types'
export const atendimentos = {
  listar: (signal?: AbortSignal) => listarPaginado<Atendimento>('/atendimentos/', signal),
  criar: (data: AtendimentoCreate) => api.post<Atendimento>('/atendimentos/', data).then(r => r.data),
}
